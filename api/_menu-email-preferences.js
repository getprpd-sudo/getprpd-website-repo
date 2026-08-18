const { spreadsheetUrl } = require('./_business-data-source');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const PREFERENCE_SHEET = 'Email Preferences';
const PREFERENCE_HEADERS = ['Email', 'Status', 'Updated At', 'Source'];

async function ensurePreferenceSheet(client) {
  if (!SHEET_ID) throw new Error('Google Sheet ID is not configured.');
  const metadata = await client.request({
    url: spreadsheetUrl(SHEET_ID, '?fields=sheets.properties.title'),
    method: 'GET',
  });
  const exists = (metadata.data.sheets || []).some(sheet => sheet.properties?.title === PREFERENCE_SHEET);
  if (!exists) {
    await client.request({
      url: spreadsheetUrl(SHEET_ID, ':batchUpdate'),
      method: 'POST',
      data: {
        requests: [{
          addSheet: {
            properties: {
              title: PREFERENCE_SHEET,
              gridProperties: { frozenRowCount: 1 },
            },
          },
        }],
      },
    });
  }
  const range = encodeURIComponent(`'${PREFERENCE_SHEET}'!A1:D1`);
  await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}?valueInputOption=RAW`),
    method: 'PUT',
    data: { values: [PREFERENCE_HEADERS] },
  });
}

async function readPreferences(client) {
  await ensurePreferenceSheet(client);
  const range = encodeURIComponent(`'${PREFERENCE_SHEET}'!A2:D5000`);
  const result = await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}`),
    method: 'GET',
  });
  const preferences = new Map();
  for (const row of result.data.values || []) {
    const email = String(row[0] || '').trim().toLowerCase();
    const status = String(row[1] || '').trim().toLowerCase();
    if (email && status) preferences.set(email, status);
  }
  return preferences;
}

async function appendPreference(client, email, status, source) {
  await ensurePreferenceSheet(client);
  const range = encodeURIComponent(`'${PREFERENCE_SHEET}'!A:D`);
  await client.request({
    url: spreadsheetUrl(SHEET_ID, `/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`),
    method: 'POST',
    data: {
      values: [[
        String(email || '').trim().toLowerCase(),
        String(status || '').trim().toLowerCase(),
        new Date().toISOString(),
        String(source || '').trim(),
      ]],
    },
  });
}

module.exports = {
  PREFERENCE_HEADERS,
  PREFERENCE_SHEET,
  appendPreference,
  ensurePreferenceSheet,
  readPreferences,
};
