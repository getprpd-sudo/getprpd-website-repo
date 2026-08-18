#!/usr/bin/env node

const mode = String(process.argv[2] || 'preview').toLowerCase();
const phase = String(process.argv[3] || 'wednesday').toLowerCase();
const confirmed = process.argv.includes('--confirm');
const phases = new Set(['monday', 'tuesday', 'wednesday']);

if (!['preview', 'send'].includes(mode) || !phases.has(phase)) {
  throw new Error('Usage: reminder-control.js <preview|send> <monday|tuesday|wednesday> [--confirm]');
}
if (mode === 'send' && !confirmed) {
  throw new Error('Customer sending requires --confirm. Run preview first.');
}

const plannerKey = String(process.env.PRPD_PLANNER_KEY || '');
const manualToken = String(process.env.MANUAL_REMINDER_TOKEN || '');
if (!plannerKey && !manualToken) throw new Error('No production reminder credential is available.');

const date = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
const campaign = `operator-${date}`;
const url = new URL('https://getprpd.com/api/menu-reminders');
url.searchParams.set('phase', phase);
if (mode === 'send') url.searchParams.set('campaign', campaign);

const headers = {};
if (mode === 'send' && manualToken) headers['x-prpd-manual-reminder-key'] = manualToken;
else headers['x-prpd-planner-key'] = plannerKey;

(async () => {
  const response = await fetch(url, { headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Reminder endpoint returned ${response.status}: ${payload.error || 'unknown error'}`);
  const safe = {
    mode: payload.mode || mode,
    status: payload.status || '',
    batch: payload.batch,
    phase: payload.phase || phase,
    sendGuard: payload.sendGuard,
    eligibleRecipientCount: payload.eligibleRecipientCount,
    suppressedRecipientCount: payload.suppressedRecipientCount,
    suppressionSummary: payload.suppressionSummary,
    runId: payload.runId,
  };
  process.stdout.write(`${JSON.stringify(safe, null, 2)}\n`);
})().catch(error => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
