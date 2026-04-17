import { NextResponse } from 'next/server';
import { addSentEmail, getContacts, saveContacts } from '@/app/lib/data';

export async function POST(req) {
  const body = await req.json();
  const { to, subject, htmlBody, textBody, from, variant } = body;

  const MATON_API_KEY = process.env.MATON_API_KEY;
  if (!MATON_API_KEY) {
    return NextResponse.json({ error: 'MATON_API_KEY not configured' }, { status: 500 });
  }

  try {
    // Send via Gmail through Maton gateway
    const raw = createRawEmail(from || 'me', to, subject, htmlBody || textBody);

    const response = await fetch('https://gateway.maton.ai/google/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MATON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Gmail send failed: ${errText}` }, { status: response.status });
    }

    const result = await response.json();

    // Track sent email
    addSentEmail({
      to,
      subject,
      body: textBody || htmlBody,
      variant: variant || null,
      messageId: result.id,
      threadId: result.threadId,
      opened: false,
      replied: false,
    });

    return NextResponse.json({ success: true, messageId: result.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function createRawEmail(from, to, subject, body) {
  const isHtml = body.includes('<');
  const mime = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset=UTF-8`,
    '',
    body,
  ].join('\r\n');

  return Buffer.from(mime).toString('base64url');
}
