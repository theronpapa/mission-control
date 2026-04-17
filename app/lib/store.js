'use client';

function get(key, fallback = []) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`mc_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key, data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`mc_${key}`, JSON.stringify(data));
}

// Contacts
export function getContacts() { return get('contacts', []); }
export function saveContacts(contacts) { set('contacts', contacts); }
export function addContacts(newContacts) {
  const existing = getContacts();
  const existingEmails = new Set(existing.map(c => c.email?.toLowerCase()));
  const unique = newContacts.filter(c => c.email && !existingEmails.has(c.email.toLowerCase()));
  const all = [...existing, ...unique.map(c => ({
    ...c,
    id: c.id || crypto.randomUUID(),
    addedAt: c.addedAt || new Date().toISOString(),
    tags: c.tags || [],
    leadScore: c.leadScore || 0,
    verified: c.verified || null,
    enriched: c.enriched || false,
  }))];
  saveContacts(all);
  return { added: unique.length, duplicates: newContacts.length - unique.length, total: all.length };
}

// Sent emails
export function getSentEmails() { return get('sent_emails', []); }
export function saveSentEmails(emails) { set('sent_emails', emails); }
export function addSentEmail(email) {
  const emails = getSentEmails();
  emails.push({ ...email, id: crypto.randomUUID(), sentAt: new Date().toISOString() });
  saveSentEmails(emails);
  return emails;
}

// Sequences
export function getSequences() { return get('sequences', []); }
export function saveSequences(sequences) { set('sequences', sequences); }

// Saved searches
export function getSavedSearches() { return get('saved_searches', []); }
export function saveSavedSearches(searches) { set('saved_searches', searches); }

// AB tests
export function getABTests() { return get('ab_tests', []); }
export function saveABTests(tests) { set('ab_tests', tests); }

// Warmup
export function getWarmup() { return get('warmup', {}); }
export function saveWarmup(data) { set('warmup', data); }

// Reply statuses
export function getReplyStatuses() { return get('reply_statuses', {}); }
export function saveReplyStatuses(data) { set('reply_statuses', data); }

// Workflow triggers
export function getTriggers() { return get('triggers', []); }
export function saveTriggers(triggers) { set('triggers', triggers); }

// Check triggers and auto-enroll contacts
export function checkTriggers(contact) {
  const triggers = getTriggers();
  const sequences = getSequences();
  let enrolled = 0;
  triggers.forEach(trigger => {
    let match = false;
    if (trigger.field === 'tag' && (contact.tags || []).includes(trigger.value)) match = true;
    if (trigger.field === 'leadTier' && contact.leadTier === trigger.value) match = true;
    if (trigger.field === 'source' && contact.source === trigger.value) match = true;
    if (trigger.field === 'verified' && contact.verified === trigger.value) match = true;
    if (match) {
      const updated = sequences.map(s => {
        if (s.id !== trigger.sequenceId) return s;
        const existing = new Set((s.contacts || []).map(c => c.email));
        if (existing.has(contact.email)) return s;
        return { ...s, contacts: [...(s.contacts || []), { ...contact, currentStep: 0, status: 'active', enrolledAt: new Date().toISOString() }] };
      });
      saveSequences(updated);
      enrolled++;
    }
  });
  return enrolled;
}
