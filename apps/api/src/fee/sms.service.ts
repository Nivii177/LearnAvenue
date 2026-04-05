import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * Send an SMS. Tries Dialog Axiata first; falls back to Twilio if Dialog
   * credentials are not configured or the call fails.
   */
  async send(to: string, message: string): Promise<void> {
    const dialogUser = process.env['SMS_DIALOG_USERNAME'];
    const dialogPass = process.env['SMS_DIALOG_PASSWORD'];

    if (dialogUser && dialogPass) {
      const sent = await this.sendViaDialog(to, message, dialogUser, dialogPass);
      if (sent) return;
    }

    const twilioSid = process.env['SMS_TWILIO_ACCOUNT_SID'];
    const twilioToken = process.env['SMS_TWILIO_AUTH_TOKEN'];
    const twilioFrom = process.env['SMS_TWILIO_FROM'];

    if (twilioSid && twilioToken && twilioFrom) {
      await this.sendViaTwilio(to, message, twilioSid, twilioToken, twilioFrom);
      return;
    }

    // No SMS provider configured — log for development
    this.logger.warn(`[SMS stub] To: ${to} | Message: ${message}`);
  }

  private async sendViaDialog(
    to: string,
    message: string,
    username: string,
    password: string,
  ): Promise<boolean> {
    try {
      const apiUrl =
        process.env['SMS_DIALOG_API_URL'] ??
        'https://e-messaging.dialog.lk/bulksms/bulksmsrequest';

      await axios.post(
        apiUrl,
        new URLSearchParams({
          user: username,
          password,
          mobiles: to,
          message,
          senderid: process.env['SMS_SENDER_ID'] ?? 'PANTHI',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 8000 },
      );
      return true;
    } catch (err) {
      this.logger.error('Dialog SMS failed', err);
      return false;
    }
  }

  private async sendViaTwilio(
    to: string,
    message: string,
    accountSid: string,
    authToken: string,
    from: string,
  ): Promise<void> {
    try {
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({ To: to, From: from, Body: message }),
        {
          auth: { username: accountSid, password: authToken },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 8000,
        },
      );
    } catch (err) {
      this.logger.error('Twilio SMS failed', err);
      throw err;
    }
  }
}
