interface VerificationEmailProps {
  name: string;
  verificationCode: string;
  expiresIn?: string;
}

export default function VerificationEmail({
  name,
  verificationCode,
  expiresIn = '15 minutes',
}: VerificationEmailProps) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px; margin: 0;">
        <div style="background-color: white; padding: 40px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">
            Verify Your Email Address
          </h1>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Hi ${name},
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Thank you for signing up! To complete your registration, please verify your email address using this verification code ${verificationCode}.
          </p>
          

          
          <p style="font-size: 14px; color: #666; line-height: 1.5;">
            This verification link will expire in ${expiresIn}. If you didn't create an account, you can safely ignore this email.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
         
        </div>
      </body>
    </html>
  `;
}
