export interface ActionEmailTemplateParams {
  recipientName?: string;
  preheader: string;
  title: string;
  intro: string;
  body: string;
  ctaLabel: string;
  actionUrl: string;
  footerNote: string;
  signature?: string;
}

export function buildActionEmailText(
  params: ActionEmailTemplateParams,
): string {
  const greeting = params.recipientName
    ? `Bonjour ${params.recipientName},`
    : 'Bonjour,';

  return [
    greeting,
    '',
    params.intro,
    params.body,
    '',
    `${params.ctaLabel} : ${params.actionUrl}`,
    '',
    params.footerNote,
    '',
    params.signature ?? 'Ytellerie',
  ].join('\n');
}

export function buildActionEmailHtml(
  params: ActionEmailTemplateParams,
): string {
  const greeting = params.recipientName
    ? `Bonjour ${params.recipientName},`
    : 'Bonjour,';

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${params.title}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f7f0dd;font-family:Arial,sans-serif;color:#7b3400;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f7f0dd;margin:0;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background-color:#fffaf0;border:1px solid #e8cf9d;border-radius:24px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px;border-bottom:1px solid #edd9b2;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size:16px;font-weight:700;letter-spacing:0.2px;color:#8d3f03;">
                          Ytellerie
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:44px 32px 24px 32px;text-align:center;">
                    <div style="display:inline-block;padding:10px 18px;border:1px solid #f1c24b;border-radius:12px;background-color:#fff4cc;color:#a14c08;font-size:14px;line-height:20px;">
                      ${params.preheader}
                    </div>
                    <h1 style="margin:28px 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-size:54px;line-height:1.05;font-weight:500;color:#6d2a00;">
                      ${params.title}
                    </h1>
                    <p style="margin:0 0 12px 0;font-size:18px;line-height:30px;color:#9a4708;">
                      ${greeting}
                    </p>
                    <p style="margin:0 0 12px 0;font-size:18px;line-height:30px;color:#9a4708;">
                      ${params.intro}
                    </p>
                    <p style="margin:0 0 36px 0;font-size:18px;line-height:30px;color:#9a4708;">
                      ${params.body}
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 18px auto;">
                      <tr>
                        <td align="center" bgcolor="#ae4f00" style="border-radius:16px;">
                          <a href="${params.actionUrl}" style="display:inline-block;padding:18px 32px;font-size:18px;font-weight:700;line-height:22px;color:#fffaf0;text-decoration:none;border:1px solid #ae4f00;border-radius:16px;">
                            ${params.ctaLabel}
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0;font-size:14px;line-height:24px;color:#a4693a;">
                      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
                    </p>
                    <p style="margin:10px 0 0 0;font-size:14px;line-height:24px;word-break:break-all;">
                      <a href="${params.actionUrl}" style="color:#8d3f03;text-decoration:underline;">${params.actionUrl}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px 32px 32px;background-color:#fcf5e7;border-top:1px solid #edd9b2;text-align:center;">
                    <p style="margin:0 0 8px 0;font-size:13px;line-height:22px;color:#a4693a;">
                      ${params.footerNote}
                    </p>
                    <p style="margin:0;font-size:13px;line-height:22px;color:#a4693a;">
                      ${params.signature ?? 'Ytellerie'}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim();
}
