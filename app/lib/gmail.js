const GATEWAY = "https://gateway.maton.ai/google-mail/gmail/v1";

function getKey() {
  const key = process.env.MATON_API_KEY;
  if (!key) throw new Error("MATON_API_KEY not set");
  return key;
}

async function sendEmail({ to, subject, body, from }) {
  const senderName = from || "AgriMalaysia 2026 Team";
  const senderEmail = "miffitoucompany@gmail.com";

  const footer =
    "\n\n---\n" +
    "If you do not wish to receive further communications, please reply with 'Unsubscribe'.\n" +
    "Miffitou Tech | Kuala Lumpur, Malaysia";

  const raw = makeRawEmail({
    to,
    from: `${senderName} <${senderEmail}>`,
    subject,
    body: body + footer,
  });

  const url = `${GATEWAY}/users/me/messages/send`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail send failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function checkReplies(emailAddress) {
  const query = encodeURIComponent(`from:${emailAddress}`);
  const url = `${GATEWAY}/users/me/messages?q=${query}&maxResults=5`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getKey()}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.messages || [];
}

function makeRawEmail({ to, from, subject, body }) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `List-Unsubscribe: <mailto:miffitoucompany@gmail.com?subject=Unsubscribe>`,
    "",
    body,
  ];
  const message = lines.join("\r\n");
  return Buffer.from(message).toString("base64url");
}

export { sendEmail, checkReplies };
