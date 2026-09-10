# Deploying nibedito.com

One DigitalOcean droplet runs everything: Nginx on the host, and the API and
frontend as containers. Images are built by GitHub Actions and pulled here; the
droplet never compiles anything.

```
push to main
   -> GitHub Actions builds both images, pushes to ghcr.io
   -> Actions SSHes in, droplet pulls the new images and restarts
```

MongoDB is Atlas (free M0). Images are Cloudinary. Mail is Mailgun over SMTP.
None of the three run on the droplet.

---

## 1. SSH key

On your machine, if you do not already have one:

```bash
ssh-keygen -t ed25519 -C "nibedito-droplet"
```

Add the **public** key (`~/.ssh/id_ed25519.pub`) to DigitalOcean when creating
the droplet. Keep the private key private; it never leaves your machine.

## 2. Create the droplet

| Setting | Value |
|---|---|
| Image | Ubuntu 24.04 LTS |
| Region | Bangalore (`blr1`) |
| Plan | Basic / Regular, 1-2 GB |
| Authentication | SSH key, not password |
| Monitoring | enabled (free) |

## 3. Harden it

```bash
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
```

In `/etc/ssh/sshd_config` set `PermitRootLogin no` and
`PasswordAuthentication no`, then `systemctl restart ssh`.

## 4. Docker

```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
```

## 5. External accounts

- **MongoDB Atlas** - free M0 cluster, region Mumbai (`ap-south-1`). Create a
  database user. Network Access must be `0.0.0.0/0`: the droplet's outbound
  address is not guaranteed stable, and an IP allowlist will lock you out of
  your own database at the worst moment. The user's password is the real
  boundary, so make it long and random.
- **Cloudinary** - free tier. Note the cloud name; it appears in
  `next.config.ts` and must match.
- **Mailgun** - free tier, 100 mails/day, permanent, no card required. Add
  `nibedito.com` under Sending -> Domains and install the DNS records it gives
  you (step 6); sending from an unverified domain is refused outright. Then
  Domain settings -> SMTP Credentials -> Add new SMTP user, e.g.
  `no-reply@nibedito.com`, and keep the password it shows once. That password is
  not the API key - the API key authenticates the HTTP API, which this app does
  not use. New accounts also get a sandbox domain that can only reach a handful
  of authorised addresses; ignore it, the verified domain has no such limit.
  Registration deletes the new account if its activation mail fails to send, so
  this is not optional infrastructure, and 100/day is a real ceiling: past it,
  signups start failing and taking the accounts with them.

## 6. DNS, at Cloudflare

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `nibedito.com` | droplet IP | **DNS only** |
| A | `www` | droplet IP | **DNS only** |

Grey cloud, not orange. Proxying sends Bangladeshi visitors out to a Cloudflare
edge and back rather than straight to Bangalore, which costs latency here
instead of saving it. Certbot on the droplet issues the certificate, so nothing
is lost by skipping Cloudflare's.

Add Mailgun's records here too - SPF (TXT), DKIM (TXT), the tracking CNAME, and
the DMARC record it generates - then hit Check status in Mailgun until the
sending records read Verified and Active. The MX records Mailgun also offers are
for *receiving* mail and this app never receives any; leaving them unverified is
correct and does not hold sending back. Skipping the sending records means
activation mail lands in spam, and Mailgun will not send from an address on an
unverified domain at all.

## 7. Environment file

```bash
git clone https://github.com/Ho9pe/NIBEDITO.git ~/NIBEDITO
cd ~/NIBEDITO
cp backend/.env.example backend/.env
```

Fill in `backend/.env`. The values that must change from the example:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://nibedito.com` - no trailing slash, no `www` |
| `MONGODB_ATLAS_URL` | the Atlas connection string |
| `JWT_ACCESS_KEY` / `JWT_REFRESH_KEY` / `JWT_ACTIVATION_KEY` | three fresh random strings, not the development ones |
| `SMTP_EMAIL` | the From address, e.g. `no-reply@nibedito.com` - must be on the verified domain |
| `SMTP_USER` | the Mailgun SMTP user. Same as `SMTP_EMAIL` in the usual case, and can be omitted then |
| `SMTP_PASSWORD` | that SMTP user's password - **not** the account API key |
| `SMTP_HOST` / `SMTP_PORT` | `smtp.mailgun.org` / `587` (`smtp.eu.mailgun.org` on the EU region) |
| `STORE_NAME` | display name on outgoing mail as well as on invoices |
| `CLOUDINARY_*` | Cloudinary credentials |
| `SUPER_ADMIN_*` | the admin account you will sign in with |

Generate the JWT keys with `openssl rand -base64 48`, once each.

There is no `frontend/.env.local` on the droplet. The frontend's three
`NEXT_PUBLIC_*` values are baked into its image at build time by the workflow -
`NEXT_PUBLIC_API_URL` is hardcoded there, the other two come from repository
variables (step 9).

## 8. Nginx and the certificate

```bash
apt install nginx certbot python3-certbot-nginx
cp ~/NIBEDITO/deploy/nginx/nibedito.com.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/nibedito.com.conf /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d nibedito.com -d www.nibedito.com
```

Certbot rewrites the config to add TLS and installs its own renewal timer.

## 9. GitHub secrets and variables

Repository Settings -> Secrets and variables -> Actions.

**Secrets:**

| Name | Value |
|---|---|
| `DROPLET_HOST` | droplet IP |
| `DROPLET_USER` | `deploy` |
| `DROPLET_SSH_KEY` | private key of a keypair generated *for deployment*, whose public half is in `/home/deploy/.ssh/authorized_keys` |

Generate a separate keypair for this rather than pasting your personal one - a
key held by CI should only ever be able to reach this one server.

**Variables:**

| Name | Value |
|---|---|
| `NEXT_PUBLIC_CLOUDINARY_URL` | `https://res.cloudinary.com/<cloud-name>` |
| `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` | e.g. `8801700000000`, no `+` |

Then, once the first workflow run has pushed the images, make both packages
public under github.com/users/Ho9pe/packages, or the droplet's `docker pull`
fails with `denied`.

## 10. First deploy

Merge to `main` (or run the workflow manually from the Actions tab). Then on the
droplet:

```bash
cd ~/NIBEDITO
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec api node src/scripts/createDefaultAdmin.js
```

## 11. Verify

`https://nibedito.com/health` should report:

```json
{ "status": "ok", "database": "connected", "environment": "production" }
```

`environment` reading anything but `production` means auth cookies are going out
without the `Secure` flag, so the browser is sending session cookies in the
clear. Fix `backend/.env` and restart before going further.

Check mail before trying to register, because a failed activation send deletes
the account it was for and leaves you guessing:

```bash
docker compose -f docker-compose.prod.yml run --rm api node scripts/check-smtp.js you@example.com
```

That resolves the host, authenticates, and sends a real message using the same
nodemailer transport the app does. It reports which stage failed rather than a
bare timeout. Run it from `~/NIBEDITO` on the droplet, where the values in
`backend/.env` are the ones in play. To test the same credentials from your own
machine first, override the compose defaults that point at the local catcher:

```bash
docker compose run --rm -e SMTP_HOST=smtp.mailgun.org -e SMTP_PORT=587 -e SMTP_USER=no-reply@nibedito.com -e SMTP_EMAIL=no-reply@nibedito.com -e SMTP_PASSWORD='the-smtp-password' api node scripts/check-smtp.js you@example.com
```

Then walk one real path end to end: register, receive and click the activation
mail, sign in, add to cart, place a COD order, confirm the invoice mail arrives.
Mailgun's Sending -> Logs shows each message and its delivery status, which is
where to look when mail is accepted but never arrives.

Point UptimeRobot at `https://nibedito.com/health`, every 5 minutes.

---

## Rolling back

Every build is also tagged with its commit SHA, so a bad deploy does not need a
revert commit and a rebuild:

```bash
cd ~/NIBEDITO
docker compose -f docker-compose.prod.yml down
docker run -d --name rollback-web -p 127.0.0.1:3000:3000 ghcr.io/ho9pe/nibedito-web:<good-sha>
```

Or edit the tags in `docker-compose.prod.yml` to the known-good SHA and
`up -d`. Fix forward on `main` when there is time to do it properly.

## Routine operations

```bash
docker compose -f docker-compose.prod.yml logs -f api    # tail API logs
docker compose -f docker-compose.prod.yml restart api    # restart one service
free -h                                                  # memory headroom
df -h                                                    # disk, watch this
```
