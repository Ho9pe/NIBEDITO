const nodemailer = require("nodemailer");

const {
    smtpEmail,
    smtpUser,
    smtpPassword,
    smtpHost,
    smtpPort,
    storeName,
} = require("../secret");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // implicit TLS only on port 465
    auth: {
        // The relay login, which is not always the sender. On Mailgun both are
        // addresses on the verified domain and are usually the same one, but
        // they need not be: any address on the domain may appear in From
        // regardless of which credential authenticated. Providers that issue a
        // generated username - MailerSend, Resend - make the two differ always.
        // smtpUser falls back to smtpEmail, so one-value providers need no
        // SMTP_USER at all.
        user: smtpUser,
        pass: smtpPassword,
    },
    // Without these nodemailer waits indefinitely. Registration awaits the send
    // before responding, so an SMTP host that accepts a TCP connection but never
    // answers - or one that is simply unreachable - left the request open
    // forever and the signup form spinning on "Registering..." with nothing to
    // report. Bounded waits turn that into a prompt, visible failure.
    connectionTimeout: 7000,  // TCP connect
    greetingTimeout: 7000,    // waiting for the server banner
    socketTimeout: 15000,     // inactivity once connected
});

const emailWithNodeMailer = async (emailData) => {
    try {
        const mailOptions = {
            // Object form rather than a "Name <addr>" string: nodemailer does the
            // RFC encoding, so a STORE_NAME containing a comma or an accent
            // cannot produce a malformed header. Without a display name the
            // From reads as a bare no-reply address, which mail clients show
            // less prominently and filters trust less.
            from: { name: storeName, address: smtpEmail },
            to: emailData.email,
            subject: emailData.subject,
            html: emailData.html,
        };
        // Optional, and only set when present: nodemailer treats an explicit
        // `attachments: undefined` differently from the key being absent.
        if (emailData.attachments?.length) {
            mailOptions.attachments = emailData.attachments;
        }
        const info = await transporter.sendMail(mailOptions);
        logger.debug(`Message sent: ${info.response}`);
    } catch (error) {
        // Log the destination so a misconfigured host is obvious from the logs.
        // Credentials are never included.
        console.error(
            `Error sending email via ${smtpHost}:${smtpPort} -`,
            error.message
        );
        throw error;
    }
};

module.exports = { emailWithNodeMailer };