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
| Region | Singapore (`sgp1`) |
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

- **MongoDB Atlas** - free M0 cluster, project `Nibedito`, cluster `NibeditoDB`,
  region Singapore (`ap-southeast-1`).

  Network Access lists the droplet's public IP, not `0.0.0.0/0`. A DigitalOcean
  droplet keeps its public IPv4 for its whole life, so the allowlist is stable in
  practice and is the tighter of the two options - worth having while the
  application user still holds a broad role. Two consequences to know. Rebuilding
  or replacing the droplet issues a new address and the old entry silently stops
  matching; the symptom is `/health` reporting `"database": "disconnected"` while
  the process itself is fine, so check the access list before debugging anything
  else. And your own workstation needs its own entry to run `mongodump`, Compass
  or any of `backend/scripts/` against the cluster - Atlas adds your current
  address during setup, but a residential IP rotates and will need re-adding.

  Edit: I added 0.0.0.0/0 to the access list, Might remove it later.

- **Cloudinary** - free tier. Note the cloud name; it appears in
  `next.config.ts` and must match.

- **Mailgun** - free tier, 100 mails/day, permanent, no card required. Add
  `nibedito.com` under Sending -> Domains and install the DNS records it gives
  you (step 6); sending from an unverified domain is refused outright. Then
  Domain settings -> SMTP Credentials -> Add new SMTP user, e.g.
  `no-reply@nibedito.com`,

## 6. DNS, at Cloudflare

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `nibedito.com` | droplet IP | **DNS only** |
| A | `www` | droplet IP | **DNS only** |

Add Mailgun's records here - SPF (TXT), DKIM (TXT), the tracking CNAME, and
the DMARC record it generates - then hit Check status in Mailgun until the
sending records read Verified and Active. The MX records Mailgun also offers are
for *receiving* mail and this app never receives any; leaving them unverified is
correct and does not hold sending back. Skipping the sending records means
activation mail lands in spam, and Mailgun will not send from an address on an
unverified domain at all.

## 7. GitHub secrets and variables

Before the merge, not after: the first push to `main` starts a workflow run, and
a run that finds no secrets cannot deploy.

Repository Settings -> Secrets and variables -> Actions.

**Secrets:**

| Name | Value |
|---|---|
| `DROPLET_HOST` | droplet IP |
| `DROPLET_USER` | `deploy` |
| `DROPLET_SSH_KEY` | private key of a keypair generated *for deployment*, whose public half is in `/home/deploy/.ssh/authorized_keys` |

Generate a separate keypair for this rather than pasting your personal one - a
key held by CI should only ever be able to reach this one server.

Miss any of the three and the `preflight` job fails within seconds and names the
ones that are missing. It runs alongside the build rather than behind it, so you
find out immediately rather than three minutes in. An unset secret is an empty
string rather than an error, so without that check the run got as far as the SSH
step and failed with `error: missing server host` - which names neither the
secret nor the fact that a secret is what is missing.

**Variables:**

| Name | Value |
|---|---|
| `NEXT_PUBLIC_CLOUDINARY_URL` | `https://res.cloudinary.com/<cloud-name>` |
| `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` | e.g. `8801700000000`, no `+` |

These are baked into the frontend image at build time, so setting them after the
build has run means rebuilding, not restarting.

## 8. Merge to main, and publish the images

```bash
git checkout main && git merge develop && git push
```

This is what puts the current code on the branch everything else reads from. The
droplet clones `main` in the next step and the workflow builds images from it,
so doing it later means cloning a stale `.env.example` and deploying stale code.

**The deploy job will fail on this first run, and that is expected.** It SSHes in
and runs `cd ~/NIBEDITO`, which does not exist yet - that is step 9. The `build`
job is the one that matters here: it pushes `nibedito-api` and `nibedito-web` to
ghcr, and those images are what the droplet pulls.

Once the build has pushed them, make both packages **public** under
github.com/users/Ho9pe/packages. Otherwise the droplet's `docker pull` fails with
`denied`, and the error says nothing about visibility.

## 9. Clone and configure

```bash
git clone https://github.com/Ho9pe/NIBEDITO.git ~/NIBEDITO
cd ~/NIBEDITO
cp backend/.env.example backend/.env
```

The clone follows the default branch, `main` - which is why step 8 comes first.

Fill in `backend/.env`. The values that must change from the example:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://nibedito.com` - no trailing slash, no `www` |
| `MONGODB_ATLAS_URL` | the Atlas connection string, **including the database name** before the `?` - without it Mongoose connects to `test` and the app works while storing nothing you can find |
| `JWT_ACCESS_KEY` / `JWT_REFRESH_KEY` / `JWT_ACTIVATION_KEY` | three fresh random strings, not the development ones |
| `SMTP_EMAIL` | the From address, e.g. `no-reply@nibedito.com` - must be on the verified domain |
| `SMTP_USER` | the Mailgun SMTP user. Same as `SMTP_EMAIL` in the usual case, and can be omitted then |
| `SMTP_PASSWORD` | that SMTP user's password - **not** the account API key |
| `SMTP_HOST` / `SMTP_PORT` | `smtp.mailgun.org` / `587` (`smtp.eu.mailgun.org` on the EU region) |
| `STORE_NAME` | display name on outgoing mail as well as on invoices |
| `CLOUDINARY_*` | Cloudinary credentials |
| `SUPER_ADMIN_*` | the admin account you will sign in with |

Generate the JWT keys with `openssl rand -base64 48`, once each.

Write it as plain `KEY=value`, unquoted and with no spaces around the `=`.
`docker-compose.prod.yml` hands this file to the container with `env_file`, and
compose's parser is not dotenv: a line written `KEY = 'value'` yields a variable
whose name has a trailing space, which the app then reads as unset.

There is no `frontend/.env.local` on the droplet. The frontend's three
`NEXT_PUBLIC_*` values are baked into its image at build time by the workflow -
`NEXT_PUBLIC_API_URL` is hardcoded there, the other two come from repository
variables (step 7).

## 10. Nginx and the certificate

```bash
apt install nginx certbot python3-certbot-nginx
cp ~/NIBEDITO/deploy/nginx/nibedito.com.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/nibedito.com.conf /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d nibedito.com -d www.nibedito.com
```

Certbot rewrites the config to add TLS and installs its own renewal timer. Its
HTTP-01 challenge has to reach this droplet directly, so both A records must
already resolve here and must be **DNS only** in Cloudflare - proxied, Cloudflare
answers the challenge instead and issuance fails.

## 11. First start

The droplet has never run the stack, so this first one is by hand. Every deploy
after it is just a merge to `main`.

```bash
cd ~/NIBEDITO
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec api node src/scripts/createDefaultAdmin.js
```

`NibeditoDB` starts empty, so after this you have an admin login and no
catalogue. Products go in through the admin UI: `scripts/seed-dev.js` refuses to
run against a hosted cluster by design.

## 12. Verify

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
docker compose run --rm -e SMTP_HOST=smtp.mailgun.org -e SMTP_PORT=587 -e SMTP_USER=no-reply@nibedito.com -e SMTP_EMAIL=no-reply@nibedito.com -e STORE_NAME=Nibedito -e SMTP_PASSWORD='YOUR_SMTP_PASSWORD' api node scripts/check-smtp.js you@example.com
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
