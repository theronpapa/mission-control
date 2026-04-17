import { NextResponse } from 'next/server';

const SENTIMENT_RULES = [
  { keywords: ['interested', 'schedule', 'call', 'meeting', 'demo', 'learn more', 'tell me more', 'sounds good', 'love to', 'would like'], sentiment: 'interested' },
  { keywords: ['unsubscribe', 'remove', 'not interested', 'stop', 'no thanks', 'no thank', 'opt out', 'do not contact'], sentiment: 'not_interested' },
  { keywords: ['out of office', 'ooo', 'vacation', 'away from', 'on leave', 'auto-reply', 'automatic reply', 'currently unavailable'], sentiment: 'out_of_office' },
  { keywords: ['delivery failed', 'undeliverable', 'bounce', 'does not exist', 'user unknown', 'no such user', 'mailbox not found'], sentiment: 'bounced' },
];

function classifySentiment(text) {
  const lower = (text || '').toLowerCase();
  for (const rule of SENTIMENT_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) return rule.sentiment;
  }
  return 'neutral';
}

export async function POST(req) {
  const MATON_API_KEY = process.env.MATON_API_KEY;
  if (!MATON_API_KEY) {
    return NextResponse.json({ error: 'MATON_API_KEY not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const threadIds = body.threadIds || [];

    if (threadIds.length === 0) {
      return NextResponse.json({ replies: [] });
    }

    const replies = [];

    // Check each thread for replies
    for (const threadId of threadIds.slice(0, 50)) {
      try {
        const res = await fetch(`https://gateway.maton.ai/google/gmail/v1/users/me/threads/${threadId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`, {
          headers: { 'Authorization': `Bearer ${MATON_API_KEY}` },
        });

        if (!res.ok) continue;
        const thread = await res.json();
        const messages = thread.messages || [];

        // If thread has more than 1 message, there's a reply
        if (messages.length > 1) {
          // Get the latest reply (last message that's not from us)
          const replyMsg = messages[messages.length - 1];
          const fromHeader = (replyMsg.payload?.headers || []).find(h => h.name === 'From');
          const subjectHeader = (replyMsg.payload?.headers || []).find(h => h.name === 'Subject');

          // Try to get snippet for sentiment analysis
          let snippet = replyMsg.snippet || '';

          replies.push({
            threadId,
            messageId: replyMsg.id,
            from: fromHeader?.value || '',
            subject: subjectHeader?.value || '',
            snippet,
            sentiment: classifySentiment(snippet),
            receivedAt: new Date(parseInt(replyMsg.internalDate || '0')).toISOString(),
          });
        }
      } catch {
        // Skip failed thread checks
      }
    }

    return NextResponse.json({ replies });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
