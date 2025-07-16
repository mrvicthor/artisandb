import { Resend } from 'resend';
import config from '@/config';
import { logger } from '@/lib/winston';
import VerificationEmail from '@/emails/verificationEmail';
import PasswordResetEmail from '@/emails/passwordResetEmail';

const resend = new Resend(config.RESEND_API_KEY);

const sendEmail = async (
  firstName: string,
  email: string,
  code: string,
  verification_type?: string,
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject:
        verification_type === 'password_reset'
          ? 'Password Reset Request'
          : 'Please verify your email address',
      html:
        verification_type === 'password_reset'
          ? PasswordResetEmail({ name: firstName, verificationCode: code })
          : VerificationEmail({ name: firstName, verificationCode: code }),
    });

    if (error) {
      logger.error('Verification email failed:', error);
      throw new Error('Failed to send verification email');
    }
    logger.info('Email sent successfully:', data);
    return {
      success: true,
      verificationCode: code,
    };
  } catch (error) {
    logger.error('Email service error:', error);
    throw error;
  }
};

export default sendEmail;
