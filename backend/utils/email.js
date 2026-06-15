import nodemailer from 'nodemailer';

let transporter = null;

// Initialize Nodemailer Transporter
const getTransporter = async () => {
  if (transporter) return transporter;

  const isConfigured =
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS;

  if (isConfigured) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: parseInt(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development fallback using Ethereal Email
    console.log('EMAIL config missing. Generating Ethereal test mailer account...');

    try {
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log(
        `Ethereal Test account generated! User: ${testAccount.user}`
      );
    } catch (err) {
      console.error(
        'Failed to configure Ethereal email account. Email dispatch will be simulated in console.',
        err.message
      );

      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n--- SIMULATED EMAIL DISPATCH ---');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body: ${mailOptions.text || mailOptions.html}`);
          console.log('--------------------------------\n');

          return {
            messageId: 'simulated-id',
            previewUrl: null,
          };
        },
      };
    }
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const client = await getTransporter();

    const info = await client.sendMail({
      from:
        process.env.EMAIL_FROM ||
        '"Job Portal" <no-reply@jobportal.com>',
      to,
      subject,
      text,
      html,
    });

    console.log(`Email sent successfully: ${info.messageId}`);

    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log(`Email Preview URL: ${previewUrl}`);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    }

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`Email delivery failed: ${error.message}`);

    return {
      success: false,
      error: error.message,
    };
  }
};