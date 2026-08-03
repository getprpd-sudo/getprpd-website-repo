const { spreadsheetUrl } = require('./_business-data-source');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const DELIVERY_SHEET = 'Email Delivery Log';
const DELIVERY_HEADERS = [
  'Run ID',
  'Email ID',
  'Recipient',
  'Subject',
  'Accepted At',
  'Delivery Status',
  'Last Event',
  'Event At',
  'Detail',
  'Webhook ID',
  'Updated At',
  'Reported At',
  'Expected Count',
];
const TERMINAL_STATUSES = new Set(['delivered', 'bounced', 'failed', 'suppressed', 'complained']);
const DELIVERY_STATUS_BY_EVENT = Object.freeze({
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'delayed',
  'email.bounced': 'bounced',
  'email.failed': 'failed',
  'email.suppressed': 'suppressed',
  'email.complained': 'complained',
});

function clean(value, maxLength = 1000) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function firstRecipient(value) {
  const recipient = Array.isArray(value) ? value[0] : value;
  return clean(recipient, 320).toLowerCase();
}

function eventDetail(event) {
  const data = event?.data || {};
  const candidates = [
    data.bounce?.message,
    data.failed?.reason,
    data.suppressed?.message,
    data.delivery_delayed?.message,
    data.complaint?.message,
    data.reason,
    data.message,
  ];
  return clean(candidates.find(Boolean), 1000);
}

function normalizeDeliveryEvent(event, webhookId) {
  const data = event?.data || {};
  const type = clean(event?.type, 80).toLowerCase();
  return {
    emailId: clean(data.email_id || data.id, 160),
    recipient: firstRecipient(data.to),
    subject: clean(data.subject, 500),
    type,
    status: DELIVERY_STATUS_BY_EVENT[type] || '',
    eventAt: clean(event?.created_at || data.created_at, 80) || new Date().toISOString(),
    detail: eventDetail(event),
    webhookId: clean(webhookId, 200),
  };
}

async function ensureDeliverySheet(client) {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  const metadata = await client.request({
    url: spreadsheetUrl(SHEET_ID, '?fields=sheets.properties.title'),
    method: 'GET',
  });
  const exists = (metadata.data.sheets || []).some(sheet => sheet.properties?.title === DELIVERY_SHEET);
  if (!exists) {
    await client.request({
      url: spreadsheetUrl(SHEET_ID, ':batchUpdate'),
      method: 'POST',
      data: {
        requests: [{
          addSheet: {
            properties: {
              title: DELIVERY_SHEET,
              gridProperties: { frozenRowCount: 1 },
            },
          },
        }],
      },
    });
  }
  const range = encodeURIComponent(`'${DELIVERY_SHEET}'!A1:M1`);
  await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}?valueInputOption=RAW`),
    method: 'PUT',
    data: { values: [DELIVERY_HEADERS] },
  });
}

async function readDeliveryRows(client) {
  await ensureDeliverySheet(client);
  const range = encodeURIComponent(`'${DELIVERY_SHEET}'!A2:M5000`);
  const result = await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}`),
    method: 'GET',
  });
  return result.data.values || [];
}

async function appendRow(client, row) {
  const range = encodeURIComponent(`'${DELIVERY_SHEET}'!A:M`);
  await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`),
    method: 'POST',
    data: { values: [row] },
  });
}

async function putRow(client, rowNumber, row) {
  const range = encodeURIComponent(`'${DELIVERY_SHEET}'!A${rowNumber}:M${rowNumber}`);
  await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}?valueInputOption=RAW`),
    method: 'PUT',
    data: { values: [row] },
  });
}

async function appendAcceptedEmail(client, record) {
  await ensureDeliverySheet(client);
  const now = clean(record.acceptedAt, 80) || new Date().toISOString();
  const expectedCount = Math.max(0, Number(record.expectedCount) || 0);
  const rows = await readDeliveryRows(client);
  const index = rows.findIndex(row => clean(row[1], 160) === clean(record.emailId, 160));
  if (index >= 0) {
    const row = Array.from({ length: DELIVERY_HEADERS.length }, (_, column) => clean(rows[index][column]));
    row[0] = clean(record.runId, 240);
    row[2] ||= firstRecipient(record.recipient);
    row[3] ||= clean(record.subject, 500);
    row[4] ||= now;
    row[5] = row[5] && row[5] !== 'event received' ? row[5] : 'accepted';
    row[6] = row[6] && row[6] !== 'event received' ? row[6] : 'email.accepted';
    row[7] ||= now;
    row[10] = now;
    row[12] = expectedCount || '';
    await putRow(client, index + 2, row);
    return;
  }
  await appendRow(client, [
    clean(record.runId, 240),
    clean(record.emailId, 160),
    firstRecipient(record.recipient),
    clean(record.subject, 500),
    now,
    'accepted',
    'email.accepted',
    now,
    '',
    '',
    now,
    '',
    expectedCount || '',
  ]);
}

async function recordDeliveryEvent(client, event, webhookId) {
  const normalized = normalizeDeliveryEvent(event, webhookId);
  if (!normalized.type || !normalized.emailId || !normalized.webhookId) {
    throw new Error('Resend event is missing its type, email ID, or webhook ID.');
  }
  const rows = await readDeliveryRows(client);
  if (rows.some(row => clean(row[9], 200) === normalized.webhookId)) {
    return { duplicate: true, runId: '', normalized };
  }

  const index = rows.findIndex(row => clean(row[1], 160) === normalized.emailId);
  const now = new Date().toISOString();
  if (index >= 0) {
    const row = Array.from({ length: DELIVERY_HEADERS.length }, (_, column) => clean(rows[index][column]));
    row[2] ||= normalized.recipient;
    row[3] ||= normalized.subject;
    if (normalized.status) row[5] = normalized.status;
    row[6] = normalized.type;
    row[7] = normalized.eventAt;
    row[8] = normalized.detail;
    row[9] = normalized.webhookId;
    row[10] = now;
    await putRow(client, index + 2, row);
    return { duplicate: false, runId: row[0], normalized };
  }

  await appendRow(client, [
    '',
    normalized.emailId,
    normalized.recipient,
    normalized.subject,
    '',
    normalized.status || 'event received',
    normalized.type,
    normalized.eventAt,
    normalized.detail,
    normalized.webhookId,
    now,
    '',
    '',
  ]);
  return { duplicate: false, runId: '', normalized };
}

async function deliverySummary(client, runId) {
  const rows = (await readDeliveryRows(client)).filter(row => clean(row[0], 240) === clean(runId, 240));
  return summarizeDeliveryRows(rows, runId);
}

function summarizeDeliveryRows(rows, runId) {
  const counts = {};
  for (const row of rows) {
    const status = clean(row[5], 80) || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  }
  const expectedCount = rows.reduce((largest, row) => Math.max(largest, Number(row[12]) || 0), 0);
  const allTerminal = rows.length > 0 && rows.every(row => TERMINAL_STATUSES.has(clean(row[5], 80)));
  return {
    runId: clean(runId, 240),
    total: rows.length,
    expectedCount,
    complete: allTerminal && (!expectedCount || rows.length >= expectedCount),
    reported: rows.some(row => Boolean(clean(row[11], 80))),
    counts,
    recipients: rows.map(row => ({
      email: firstRecipient(row[2]),
      status: clean(row[5], 80),
      detail: clean(row[8], 1000),
    })),
  };
}

async function markDeliveryReported(client, runId) {
  const rows = await readDeliveryRows(client);
  const reportedAt = new Date().toISOString();
  await Promise.all(rows.map(async (source, index) => {
    if (clean(source[0], 240) !== clean(runId, 240)) return;
    const row = Array.from({ length: DELIVERY_HEADERS.length }, (_, column) => clean(source[column]));
    row[11] = reportedAt;
    await putRow(client, index + 2, row);
  }));
  return reportedAt;
}

module.exports = {
  DELIVERY_HEADERS,
  DELIVERY_SHEET,
  TERMINAL_STATUSES,
  appendAcceptedEmail,
  deliverySummary,
  ensureDeliverySheet,
  markDeliveryReported,
  normalizeDeliveryEvent,
  recordDeliveryEvent,
  summarizeDeliveryRows,
};
