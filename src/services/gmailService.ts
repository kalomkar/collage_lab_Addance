import { getAccessToken } from './googleAuth';

/**
 * Builds a MIME multipart message with Word (.docx) attachment and encodes it to base64url format for Gmail API
 */
export function createMimeMessage({
  to,
  from,
  subject,
  bodyText,
  attachmentFilename,
  attachmentBase64
}: {
  to: string;
  from?: string;
  subject: string;
  bodyText: string;
  attachmentFilename?: string;
  attachmentBase64?: string;
}): string {
  const boundary = `====boundary_${Date.now()}====`;
  const lines: string[] = [];

  lines.push(`To: ${to}`);
  if (from) lines.push(`From: ${from}`);
  lines.push(`Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`);
  lines.push('MIME-Version: 1.0');

  if (attachmentFilename && attachmentBase64) {
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    lines.push('');
    lines.push(`--${boundary}`);
    lines.push('Content-Type: text/plain; charset="UTF-8"');
    lines.push('Content-Transfer-Encoding: 7bit');
    lines.push('');
    lines.push(bodyText);
    lines.push('');
    lines.push(`--${boundary}`);
    lines.push(`Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document; name="${attachmentFilename}"`);
    lines.push('Content-Transfer-Encoding: base64');
    lines.push(`Content-Disposition: attachment; filename="${attachmentFilename}"`);
    lines.push('');
    // Insert lines of base64
    const chunks = attachmentBase64.match(/.{1,76}/g) || [attachmentBase64];
    lines.push(...chunks);
    lines.push('');
    lines.push(`--${boundary}--`);
  } else {
    lines.push('Content-Type: text/plain; charset="UTF-8"');
    lines.push('Content-Transfer-Encoding: 7bit');
    lines.push('');
    lines.push(bodyText);
  }

  const raw = lines.join('\r\n');
  // Base64url encode
  const encoded = btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return encoded;
}

/**
 * Send an email directly via Google Gmail API (users.messages.send) using the user's OAuth access token.
 */
export async function sendEmailViaGmailApi({
  to,
  from,
  subject,
  bodyText,
  attachmentFilename,
  attachmentBase64
}: {
  to: string;
  from?: string;
  subject: string;
  bodyText: string;
  attachmentFilename?: string;
  attachmentBase64?: string;
}) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Please sign in with Google to send via Gmail.');
  }

  const raw = createMimeMessage({
    to,
    from,
    subject,
    bodyText,
    attachmentFilename,
    attachmentBase64
  });

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message || `Gmail API error: ${response.statusText}`);
  }

  return await response.json();
}
