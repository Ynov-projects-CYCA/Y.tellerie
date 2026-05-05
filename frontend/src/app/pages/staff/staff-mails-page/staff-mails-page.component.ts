import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MailjetApiService } from '../../../core/api';

@Component({
  selector: 'app-staff-mails-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-mails-page.component.html',
  styleUrls: ['./staff-mails-page.component.scss'],
})
export class StaffMailsPageComponent {
  private readonly mailjetApi = inject(MailjetApiService);

  isSendingMail = false;
  mailFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  customMail = {
    to: '',
    toName: '',
    subject: '',
    message: '',
  };

  sendCustomMail(): void {
    this.mailFeedback.set(null);

    const payload = {
      to: this.customMail.to.trim(),
      toName: this.customMail.toName.trim() || undefined,
      subject: this.customMail.subject.trim(),
      message: this.customMail.message.trim(),
    };

    if (!payload.to || !payload.subject || !payload.message) {
      this.mailFeedback.set({
        type: 'error',
        message: 'Veuillez renseigner un destinataire, un objet et un message.',
      });
      return;
    }

    this.isSendingMail = true;
    this.mailjetApi.send({
      to: payload.to,
      toName: payload.toName,
      subject: payload.subject,
      text: this.buildCustomMailText(payload.message),
      html: this.buildCustomMailHtml(payload.message),
    }).subscribe({
      next: () => {
        this.mailFeedback.set({
          type: 'success',
          message: 'Email envoyé avec succès.',
        });
        this.isSendingMail = false;
      },
      error: (err: any) => {
        console.error('Erreur lors de l\'envoi de l\'email:', err);
        this.mailFeedback.set({
          type: 'error',
          message: err?.message ?? 'Impossible d\'envoyer cet email pour le moment.',
        });
        this.isSendingMail = false;
      },
    });
  }

  resetCustomMail(): void {
    this.customMail = {
      to: '',
      toName: '',
      subject: '',
      message: '',
    };
    this.mailFeedback.set(null);
  }

  private buildCustomMailText(message: string): string {
    const greeting = this.customMail.toName.trim()
      ? `Bonjour ${this.customMail.toName.trim()},`
      : 'Bonjour,';

    return [
      greeting,
      '',
      message,
      '',
      'Cordialement,',
      'L\'équipe Ytellerie',
    ].join('\n');
  }

  private buildCustomMailHtml(message: string): string {
    const recipient = this.escapeHtml(this.customMail.toName.trim());
    const greeting = recipient ? `Bonjour ${recipient},` : 'Bonjour,';
    const body = this.escapeHtml(message).replace(/\n/g, '<br />');

    return `
      <div style="margin:0;padding:32px 16px;background:#f9fafb;font-family:Arial,sans-serif;color:#1c1917;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;overflow:hidden;">
          <div style="padding:24px 28px;border-bottom:1px solid #e7e5e4;background:#fffaf0;">
            <div style="font-size:20px;font-weight:700;color:#78350f;">Ytellerie</div>
            <div style="margin-top:4px;font-size:13px;color:#92400e;">Message de l'équipe</div>
          </div>
          <div style="padding:30px 28px;">
            <p style="margin:0 0 18px;font-size:16px;line-height:26px;">${greeting}</p>
            <p style="margin:0;font-size:16px;line-height:28px;color:#44403c;">${body}</p>
          </div>
          <div style="padding:20px 28px;background:#fafaf9;border-top:1px solid #e7e5e4;color:#78716c;font-size:13px;">
            L'équipe Ytellerie
          </div>
        </div>
      </div>
    `.trim();
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
