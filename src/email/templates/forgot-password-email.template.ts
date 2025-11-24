type ForgotPasswordTemplateProps = {
  name: string;
  resetLink: string;
  supportEmail?: string;
};

export const buildForgotPasswordEmail = ({
  name,
  resetLink,
  supportEmail = 'support@helar.law',
}: ForgotPasswordTemplateProps) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset your Helar password</title>
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          background-color: #f8fafc;
          color: #0f172a;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          padding: 32px;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
        }
        h1 {
          font-size: 22px;
          margin-bottom: 10px;
        }
        p {
          font-size: 15px;
          line-height: 1.6;
          color: #475569;
        }
        .cta {
          display: inline-block;
          margin-top: 24px;
          padding: 12px 26px;
          background-color: #0ea5e9;
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          border-radius: 999px;
        }
        .footer {
          margin-top: 24px;
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Reset request received</h1>
        <p>Hi ${name}, we received a request to reset your Helar password.</p>
        <p>
          Click the button below to choose a new password. This link is valid for
          the next 60 minutes and can only be used once.
        </p>
        <a class="cta" href="${resetLink}" target="_blank" rel="noopener">
          Create a new password
        </a>
        <p>
          Didn’t request this? Simply ignore this email or let us know at
          ${supportEmail}.
        </p>
        <p class="footer">
          Stay secure,<br />
          The Helar Team
        </p>
      </div>
    </body>
  </html>
`;
