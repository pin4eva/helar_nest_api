type WelcomeEmailTemplateProps = {
  name: string;
  dashboardLink: string;
  supportEmail?: string;
};

export const buildWelcomeEmail = ({
  name,
  dashboardLink,
  supportEmail = 'support@helar.law',
}: WelcomeEmailTemplateProps) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to Helar</title>
      <style>
        body {
          font-family: 'Inter', Arial, sans-serif;
          background-color: #0f172a;
          color: #e2e8f0;
          margin: 0;
          padding: 24px;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background: #111c3d;
          padding: 32px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        h1 {
          font-size: 28px;
          margin-bottom: 12px;
        }
        p {
          font-size: 16px;
          line-height: 1.7;
          color: #cbd5f5;
        }
        .cta {
          display: inline-block;
          margin-top: 24px;
          padding: 14px 30px;
          background-color: #22d3ee;
          color: #0f172a;
          text-decoration: none;
          font-weight: 700;
          border-radius: 14px;
        }
        .feature-list {
          margin-top: 24px;
          padding-left: 18px;
          color: #cbd5f5;
        }
        .footer {
          margin-top: 28px;
          font-size: 13px;
          color: #7dd3fc;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello ${name}, welcome aboard! 🎉</h1>
        <p>
          You now have access to streamlined case summaries, guided note packs,
          and curated resources to stay ahead of every class and courtroom
          debate.
        </p>
        <ul class="feature-list">
          <li>Track what you read with personalized dashboards</li>
          <li>Bookmark go-to briefs and revisit them instantly</li>
          <li>Explore faculty and NLS summaries tailored to your courses</li>
        </ul>
        <a class="cta" href="${dashboardLink}" target="_blank" rel="noopener">
          Explore my dashboard
        </a>
        <p class="footer">
          Questions? Reach us anytime at ${supportEmail}. We’re rooting for you.
        </p>
      </div>
    </body>
  </html>
`;
