const nodemailer = require("nodemailer");

const { smtpEmail, smtpPassword, smtpHost, smtpPort } = require("../secret");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // implicit TLS only on port 465
    auth: {
        user: smtpEmail,
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
            from: smtpEmail,
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