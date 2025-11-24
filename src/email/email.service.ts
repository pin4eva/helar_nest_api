import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as Brevo from '@getbrevo/brevo';
import { environments } from '../utils/environments';
import { buildActivationEmail } from './templates/activation-email.template';
import { buildForgotPasswordEmail } from './templates/forgot-password-email.template';
import { buildWelcomeEmail } from './templates/welcome-email.template';

export class EmailPayload {
  to: string;
  subject: string;
  htmlContent?: string;
}

@Injectable()
export class EmailService {
  private readonly brevo: Brevo.TransactionalEmailsApi;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.brevo = new Brevo.TransactionalEmailsApi();
    this.brevo.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      environments.BREVO_API_KEY,
    );
  }

  // send email
  async sendEmail(payload: EmailPayload) {
    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = payload.subject;
      sendSmtpEmail.htmlContent = payload.htmlContent || '';
      sendSmtpEmail.sender = {
        email: environments.MAIL_SENDER.email,
        name: environments.MAIL_SENDER.name,
      };
      sendSmtpEmail.to = [{ email: payload.to }];
      await this.brevo.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${payload.to}: ${error.message}`,
      );
      throw new BadRequestException('Failed to send email');
    }
  }

  // activation email
  async sendActivationEmail({
    to,
    name,
    activationLink,
  }: {
    to: string;
    name: string;
    activationLink: string;
  }) {
    return this.sendEmail({
      to,
      subject: 'Activate your Helar account',
      htmlContent: buildActivationEmail({ name, activationLink }),
    });
  }

  // forgot password email
  async sendForgotPasswordEmail({
    to,
    name,
    resetLink,
  }: {
    to: string;
    name: string;
    resetLink: string;
  }) {
    return this.sendEmail({
      to,
      subject: 'Reset your Helar password',
      htmlContent: buildForgotPasswordEmail({ name, resetLink }),
    });
  }

  async sendWelcomeEmail({
    to,
    name,
    dashboardLink,
  }: {
    to: string;
    name: string;
    dashboardLink: string;
  }) {
    return this.sendEmail({
      to,
      subject: 'Welcome to Helar',
      htmlContent: buildWelcomeEmail({ name, dashboardLink }),
    });
  }
}
