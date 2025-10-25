import nodemailer from 'nodemailer';

// Build a flexible transporter that supports either Brevo (SMTP_*) or Gmail (EMAIL_*)
const buildTransportOptions = () => {
    // Trimmed envs to avoid whitespace issues
    const SMTP_HOST = (process.env.SMTP_HOST || '').trim();
    const SMTP_PORT = (process.env.SMTP_PORT || '').trim();
    const SMTP_SECURE = (process.env.SMTP_SECURE || '').trim();
    const SMTP_USER = (process.env.SMTP_USER || '').trim();
    const SMTP_PASS = (process.env.SMTP_PASS || '').trim();

    const EMAIL_USER = (process.env.EMAIL_USER || '').trim();
    const EMAIL_PASS = (process.env.EMAIL_PASS || '').trim();

    const hasSmtpCreds = !!(SMTP_USER && SMTP_PASS);
    const hasGmailCreds = !!(EMAIL_USER && EMAIL_PASS);

    if (hasSmtpCreds) {
        return {
            host: SMTP_HOST || 'smtp-relay.brevo.com',
            port: Number(SMTP_PORT || 587),
            secure: String(SMTP_SECURE || 'false') === 'true',
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        };
    }

    if (hasGmailCreds) {
        return {
            host: SMTP_HOST || 'smtp.gmail.com',
            port: Number(SMTP_PORT || 465),
            secure: String(SMTP_SECURE || 'true') === 'true',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS, // Must be an App Password
            },
        };
    }

    throw new Error(
        'Email credentials missing. Provide either SMTP_USER/SMTP_PASS (for Brevo or custom SMTP) or EMAIL_USER/EMAIL_PASS (for Gmail).'
    );
};

let transporter;
try {
    const options = buildTransportOptions();
    transporter = nodemailer.createTransport(options);

    // Verify transporter configuration on startup
    transporter.verify((error, success) => {
        if (error) {
            console.error('Nodemailer configuration error:', error?.message || error);
        } else {
            console.log(
                `Nodemailer is ready to send emails via ${options.host}:${options.port} (secure=${options.secure})`
            );
        }
    });
} catch (err) {
    console.error('Failed to initialize email transporter:', err?.message || err);
    // Create a noop-like transporter to avoid app crash; will throw on send
    transporter = {
        sendMail: async () => {
            throw new Error('Email transporter not configured. Check your environment variables.');
        },
    };
}

export default transporter;
