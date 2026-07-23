# PRPD Google Sheets Setup

> Archived rollback instructions. The live website uses the Vercel `/api/order` and `/api/lead` functions, not Apps Script. Do not follow this guide for normal updates.

## Goal

Use one Google Sheets workbook for both lead sources:

- Existing flyer QR Google Form responses
- New custom website form submissions

Recommended structure:

- Google Form responses tab: created automatically by Google Forms
- Website Leads tab: created automatically by the PRPD Apps Script

## Step 1: Link the Existing Google Form to a Sheet

1. Open the current PRPD Google Form.
2. Go to the Responses tab.
3. Click the green Google Sheets icon.
4. Create a new spreadsheet or select an existing spreadsheet.
5. Copy the Sheet ID from the spreadsheet URL.

The Sheet ID is the long string between `/d/` and `/edit`.

Example:

```text
https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
```

## Step 2: Add the Website Apps Script

1. Open that same Google Sheet.
2. Go to Extensions > Apps Script.
3. Paste the code from `apps-script.gs`.
4. Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your real Sheet ID.
5. Save the script.

The script will send website form submissions into a tab called `Website Leads`.
If that tab does not exist, it will create it automatically.

## Step 3: Deploy the Script

1. In Apps Script, click Deploy > New deployment.
2. Select Web app.
3. Set "Execute as" to Me.
4. Set "Who has access" to Anyone.
5. Deploy.
6. Copy the Web app URL.

## Step 4: Connect the Website Form

1. Open `script.js`.
2. Replace:

```js
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
```

with your Web app URL.

## Step 5: Test

1. Open the PRPD website locally.
2. Submit a test lead.
3. Check the Google Sheet.
4. You should see the submission inside the `Website Leads` tab.
