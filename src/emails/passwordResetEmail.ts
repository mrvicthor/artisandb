interface PasswordResetEmailProps {
  name: string;
  verificationCode: string;
}

const PasswordResetEmail = ({
  name,
  verificationCode,
}: PasswordResetEmailProps) => `
  <div style="font-family: Arial, sans-serif; color: #222;">
    <h2>Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>You requested to reset your password. Please use the verification code below to proceed:</p>
    <div style="margin: 24px 0;">
      <span style="
        display: inline-block;
        background: #f5f5f5;
        color: #2d3748;
        font-size: 2rem;
        font-weight: bold;
        padding: 12px 32px;
        border-radius: 8px;
        letter-spacing: 4px;
        border: 2px solid #3182ce;
      ">
        ${verificationCode}
      </span>
    </div>
    <p>This code will expire in 15 minutes. If you did not request a password reset, please ignore this email.</p>
    <p>Thanks,<br/>The Artisan App Team</p>
  </div>
`;

export default PasswordResetEmail;
