export function orderEmailHtml(opts: {
  orderNumber: string
  planName: string
  key: string
  amountEur: number
  dateStr: string
  provider: 'STRIPE' | 'PAYPAL'
}): string

export function supportEmailHtml(opts: {
  refId?: string
  message?: string
  answerHtml?: string
}): string

export function announcementEmailHtml(opts: {
  title: string
  bodyHtml: string
  preheader?: string
  cta?: { href: string; label: string }
}): string

export function newsletterCampaignHtml(opts: {
  heading?: string
  message: string
  promoCode?: string
  unsubUrl: string
}): string

export function newsletterConfirmHtml(opts: { confirmUrl: string }): string
