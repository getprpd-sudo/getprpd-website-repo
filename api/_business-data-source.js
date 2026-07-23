const { GoogleAuth } = require('google-auth-library');

const RANGES = Object.freeze({
  orders: "'Orders'!A1:AC5000",
  payments: "'Payment Log'!A1:P5000",
  leads: "'Website Leads'!A1:T5000",
  receivables: "'Accounts Receivable'!A1:H500",
});

function getCredentials() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!encoded && !raw) throw new Error('Google Sheets is not configured.');
  const json = encoded ? Buffer.from(encoded, 'base64').toString('utf8') : raw;
  const credentials = JSON.parse(json);
  if (credentials.private_key) credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  return credentials;
}

async function getSheetsClient(scope = 'https://www.googleapis.com/auth/spreadsheets.readonly') {
  const auth = new GoogleAuth({ credentials: getCredentials(), scopes: [scope] });
  return auth.getClient();
}

function spreadsheetUrl(sheetId, path = '') {
  return `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${path}`;
}

async function readBusinessData() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('Google Sheet ID is not configured.');
  const client = await getSheetsClient();
  const entries = await Promise.all(Object.entries(RANGES).map(async ([key, range]) => {
    const url = spreadsheetUrl(sheetId, `/values/${encodeURIComponent(range)}`);
    const result = await client.request({ url, method: 'GET' });
    return [key, result.data.values || []];
  }));
  return Object.fromEntries(entries);
}

module.exports = {
  RANGES,
  getCredentials,
  getSheetsClient,
  readBusinessData,
  spreadsheetUrl,
};
