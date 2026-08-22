// Checks whether the configured SMTP server is reachable and whether it accepts
// the credentials. Touches no application data.
//
//   docker compose run --rm api node scripts/check-smtp.js
//
// Pass an address to also send a test message to it:
//
//   docker compose run --rm api node scripts/check-smtp.js you@example.com
//
// To test the values a deployment is using, run it with the same environment:
//   SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_EMAIL=... SMTP_PASSWORD=... \
//     node scripts/check-smtp.js
//
// Note what this can and cannot tell you: it exercises the path from wherever
// you run it. Passing here but failing in a deployment points at that host's
// outbound network or at the provider blocking its IP, not at the credentials.

const nodemailer = require("nodemailer");
const {
  smtpEmail,
  smtpPassword,
  smtpHost,
  smtpPort,
} = require("../src/secret");

const HINTS = {
  ETIMEDOUT:
    "The connection timed out. The host is wrong, or outbound mail is blocked\n" +
    "  from wherever this is running. Check SMTP_HOST and SMTP_PORT.",
  ECONNREFUSED:
    "The host answered but refused the port. SMTP_PORT is probably wrong\n" +
    "  (587 for STARTTLS, 465 for implicit TLS).",
  ENOTFOUND:
    "The hostname does not resolve. Check SMTP_HOST for a typo, or for a value\n" +
    "  copied from docker-compose.yml, where it is the local mail container.",
  EAUTH:
    "Connected, but the credentials were rejected. For Gmail, SMTP_PASSWORD must\n" +
    "  be a 16-character App Password, not the account password, and the account\n" +
    "  needs 2-Step Verification switched on.",
  ESOCKET:
    "The socket failed. Read the message above: 'ECONNREFUSED' means nothing is\n" +
    "  listening on that port, while a TLS error means secure/port disagree - use\n" +
    "  587 without implicit TLS, or 465 with it.",
};

(async () => {
  console.log("SMTP configuration");
  console.log("  host:     ", smtpHost);
  console.log("  port:     ", smtpPort);
  console.log("  secure:   ", smtpPort === 465);
  console.log("  user:     ", smtpEmail || "(not set)");
  console.log(
    "  password: ",
    smtpPassword ? `set, ${smtpPassword.length} characters` : "(NOT SET)"
  );
  console.log("");

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpEmail, pass: smtpPassword },
    connectionTimeout: 7000,
    greetingTimeout: 7000,
    socketTimeout: 15000,
  });

  const recipient = process.argv[2];
  const started = Date.now();
  try {
    await transporter.verify();
    console.log(`OK - reachable and credentials accepted (${Date.now() - started}ms)`);

    if (recipient) {
      const sendStarted = Date.now();
      const info = await transporter.sendMail({
        from: smtpEmail,
        to: recipient,
        subject: "Nibedito SMTP test",
        html:
          "<p>This is a test message from the Nibedito SMTP check script.</p>" +
          `<p>Sent at ${new Date().toISOString()} via ${smtpHost}:${smtpPort}.</p>` +
          "<p>If you are reading this, outbound mail works from wherever the " +
          "script was run.</p>",
      });
      console.log(`SENT to ${recipient} (${Date.now() - sendStarted}ms)`);
      console.log("  server said:", info.response);
      console.log("  accepted:   ", JSON.stringify(info.accepted));
      console.log("  rejected:   ", JSON.stringify(info.rejected));
    }
    process.exit(0);
  } catch (error) {
    console.log(`FAILED after ${Date.now() - started}ms`);
    console.log("  code:    ", error.code || "(none)");
    console.log("  message: ", error.message);
    const hint = HINTS[error.code];
    if (hint) console.log("\n  " + hint);
    process.exit(1);
  }
})();
