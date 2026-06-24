// Invio email: usa Resend se RESEND_API_KEY è configurata, altrimenti logga (stub),
// così il flusso funziona anche in dev/test senza provider.

interface MailInput {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendMail(input: MailInput): Promise<{ ok: boolean; stub?: boolean }> {
  const from = process.env.MAIL_FROM ?? 'FreshPhone <noreply@freshphone.it>'

  // 1) SMTP (es. casella info@freshphone.it su register.it)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = (await import('nodemailer')).default
      const port = Number(process.env.SMTP_PORT ?? 465)
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transport.sendMail({ from, to: input.to, subject: input.subject, html: input.html, text: input.text })
      return { ok: true }
    } catch (e) {
      console.error('[mail:smtp] error', e)
      return { ok: false }
    }
  }

  // 2) Resend (HTTP API)
  const key = process.env.RESEND_API_KEY
  if (key) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html, text: input.text }),
    })
    return { ok: res.ok }
  }

  // 3) Stub (nessun provider configurato): logga soltanto
  console.log('[mail:stub] to=%s subject=%s', input.to, input.subject)
  return { ok: true, stub: true }
}

// I template HTML vivono in un modulo unico (.mjs) così possono essere riusati
// senza divergenze anche da script esterni (es. invio email di prova).
export {
  orderEmailHtml,
  supportEmailHtml,
  announcementEmailHtml,
  newsletterCampaignHtml,
  newsletterConfirmHtml,
} from './email-templates.mjs'
