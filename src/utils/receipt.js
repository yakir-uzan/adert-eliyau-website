import emailjs from '@emailjs/browser';

function generateReceiptId() {
  return 'RC-' + Date.now().toString(36).toUpperCase();
}

function buildReceiptHtml({ name, description, amount, receiptId, date, tenantConfig }) {
  const theme   = tenantConfig?.theme || {};
  const gold    = theme.primaryColor || '#C9A84C';
  const navy    = theme.bgDefault    || '#0D1B2A';
  const card    = theme.bgPaper      || '#1A2940';
  const textMain = '#F5F0E8';
  const textSub  = '#A89F94';
  const border   = 'rgba(201,168,76,0.25)';

  const synagogueName = tenantConfig?.name     || 'בית כנסת';
  const subtitle      = tenantConfig?.subtitle || '';

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${navy};font-family:Arial,Helvetica,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${navy};padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding:0 24px 32px;border-bottom:2px solid ${gold};text-align:center;">
          <h1 style="margin:0 0 6px;color:${gold};font-size:28px;letter-spacing:1px;">${synagogueName}</h1>
          ${subtitle ? `<p style="margin:0;color:${textSub};font-size:14px;">${subtitle}</p>` : ''}
          <p style="margin:12px 0 0;color:${textSub};font-size:13px;">קבלה על תשלום</p>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:28px 24px 0;">
          <p style="margin:0;color:${textMain};font-size:16px;">שלום ${name},</p>
          <p style="margin:8px 0 0;color:${textSub};font-size:14px;line-height:1.7;">
            תודה על תשלומך! להלן פרטי הקבלה עבור העסקה שבוצעה בהצלחה.
          </p>
        </td></tr>

        <!-- Receipt box -->
        <tr><td style="padding:24px;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:${card};border-radius:12px;border:1px solid ${border};padding:0;overflow:hidden;">
            <tr><td style="padding:20px 24px;border-bottom:1px solid ${border};">
              <p style="margin:0;color:${gold};font-size:13px;font-weight:bold;letter-spacing:1px;">פרטי תשלום</p>
            </td></tr>
            <tr><td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:${textSub};padding:8px 0;font-size:14px;width:40%;">תיאור:</td>
                  <td style="color:${textMain};padding:8px 0;font-size:14px;font-weight:bold;">${description}</td>
                </tr>
                <tr>
                  <td style="color:${textSub};padding:8px 0;font-size:14px;">סכום:</td>
                  <td style="color:${gold};padding:8px 0;font-size:22px;font-weight:bold;">${amount}</td>
                </tr>
                <tr>
                  <td style="color:${textSub};padding:8px 0;font-size:14px;">תאריך:</td>
                  <td style="color:${textMain};padding:8px 0;font-size:14px;">${date}</td>
                </tr>
                <tr>
                  <td style="color:${textSub};padding:8px 0;font-size:14px;">מספר קבלה:</td>
                  <td style="color:${textMain};padding:8px 0;font-size:13px;direction:ltr;text-align:right;">${receiptId}</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- Note -->
        <tr><td style="padding:0 24px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:rgba(201,168,76,0.07);border-radius:8px;border:1px solid ${border};">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0;color:${textSub};font-size:13px;line-height:1.7;">
                יש לשמור קבלה זו כאסמכתה לתשלום.
                לשאלות ופרטים נוספים ניתן לפנות לגבאות.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px;border-top:1px solid ${border};text-align:center;">
          <p style="margin:0 0 4px;color:${textSub};font-size:12px;">${synagogueName}</p>
          <p style="margin:0;color:${textSub};font-size:12px;">נשמח לראותך שוב!</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendReceiptEmail({ name, email, description, amount, receiptId, tenantConfig }) {
  const emailConfig = tenantConfig?.email || {};
  const serviceId   = emailConfig.serviceId  || import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'YOUR_SERVICE_ID';
  const templateId  = emailConfig.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
  const publicKey   = emailConfig.publicKey  || import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'YOUR_PUBLIC_KEY';

  const synagogueName = tenantConfig?.name || 'בית כנסת';
  const date = new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
  const rid  = receiptId || generateReceiptId();
  const html = buildReceiptHtml({ name, description, amount, receiptId: rid, date, tenantConfig });

  await emailjs.send(
    serviceId,
    templateId,
    {
      to_name:     name,
      to_email:    email,
      subject:     `קבלה על תשלום — ${synagogueName} (${rid})`,
      html_body:   html,
      amount,
      description,
      receipt_id:  rid,
      date,
    },
    publicKey
  );

  return rid;
}
