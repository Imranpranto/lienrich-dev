export const emailTemplates = {
  confirmSignUp: {
    subject: 'Welcome to LiEnrich - Verify Your Email',
    content: `
      <h2>Welcome to LiEnrich!</h2>
      <p>Thank you for signing up. To complete your registration and access all features, please verify your email address by clicking the button below:</p>
      <a href="{{ .ConfirmationURL }}" style="
        display: inline-block;
        background-color: #4F46E5;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        margin: 24px 0;
      ">Verify Email Address</a>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p>{{ .ConfirmationURL }}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account with LiEnrich, you can safely ignore this email.</p>
      <p>Need help? Contact us at <a href="mailto:support@lienrich.com">support@lienrich.com</a></p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 14px;">
        <a href="https://app.lienrich.com" style="color: #4F46E5; text-decoration: none;">LiEnrich</a> - LinkedIn Data Enrichment Tool<br>
        Your trial includes 250 credits valid for 7 days
      </p>
    `,
  },
  magicLink: {
    subject: 'Your LiEnrich Login Link',
    content: `
      <h2>Login to LiEnrich</h2>
      <p>Click the button below to securely log in to your LiEnrich account:</p>
      <a href="{{ .ConfirmationURL }}" style="
        display: inline-block;
        background-color: #4F46E5;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        margin: 24px 0;
      ">Log In to LiEnrich</a>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p>{{ .ConfirmationURL }}</p>
      <p>This link will expire in 24 hours and can only be used once.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
      <p>Need help? Contact us at <a href="mailto:support@lienrich.com">support@lienrich.com</a></p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 14px;">
        <a href="https://app.lienrich.com" style="color: #4F46E5; text-decoration: none;">LiEnrich</a> - LinkedIn Data Enrichment Tool
      </p>
    `,
  },
  resetPassword: {
    subject: 'Reset Your LiEnrich Password',
    content: `
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your LiEnrich password. Click the button below to choose a new password:</p>
      <a href="{{ .ConfirmationURL }}" style="
        display: inline-block;
        background-color: #4F46E5;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        margin: 24px 0;
      ">Reset Password</a>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p>{{ .ConfirmationURL }}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>Need help? Contact us at <a href="mailto:support@lienrich.com">support@lienrich.com</a></p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 14px;">
        <a href="https://app.lienrich.com" style="color: #4F46E5; text-decoration: none;">LiEnrich</a> - LinkedIn Data Enrichment Tool
      </p>
    `,
  },
  changeEmail: {
    subject: 'Confirm Your New Email Address',
    content: `
      <h2>Confirm Email Change</h2>
      <p>Click the button below to confirm your new email address for your LiEnrich account:</p>
      <a href="{{ .ConfirmationURL }}" style="
        display: inline-block;
        background-color: #4F46E5;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        margin: 24px 0;
      ">Confirm New Email</a>
      <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p>{{ .ConfirmationURL }}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this change, please contact support immediately.</p>
      <p>Need help? Contact us at <a href="mailto:support@lienrich.com">support@lienrich.com</a></p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;">
      <p style="color: #6B7280; font-size: 14px;">
        <a href="https://app.lienrich.com" style="color: #4F46E5; text-decoration: none;">LiEnrich</a> - LinkedIn Data Enrichment Tool
      </p>
    `,
  },
};