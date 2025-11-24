type ActivationEmailTemplateProps = {
  name: string;
  activationLink: string;
  supportEmail?: string;
};

export const buildActivationEmail = ({
  name,
  activationLink,
  supportEmail = 'support@helar.law',
}: ActivationEmailTemplateProps) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Activate your Helar account</title>
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          background-color: #f5f6f8;
          color: #1b1f3b;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(18, 38, 63, 0.07);
        }
        h1 {
          font-size: 24px;
          margin-bottom: 12px;
        }
        p {
          font-size: 16px;
          line-height: 1.6;
          color: #4c5573;
        }
        .cta {
          display: inline-block;
          margin-top: 24px;
          padding: 14px 28px;
          background-color: #1c4ed8;
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          border-radius: 10px;
        }
        .footer {
          margin-top: 32px;
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Helar, ${name}!</h1>
        <p>
          You're just one step away from unlocking curated briefs, note summaries,
          and law-school tools built for you. Please confirm your email address to
          activate your account.
        </p>
        <a class="cta" href="${activationLink}" target="_blank" rel="noopener">
          Activate my account
        </a>
        <p>
          If the button does not work, copy and paste this link into your browser:<br />
          <a href="${activationLink}" target="_blank" rel="noopener">${activationLink}</a>
        </p>
        <p class="footer">
          Need help? Reply to this email or contact us at ${supportEmail}.
        </p>
      </div>
    </body>
  </html>
`;
