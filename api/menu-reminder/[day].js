const handler = require('../menu-reminders');

const ALLOWED_PHASES = new Set(['monday', 'tuesday', 'wednesday']);

module.exports = function scheduledMenuReminder(request, response) {
  const phase = String(request.query?.day || '').trim().toLowerCase();
  if (!ALLOWED_PHASES.has(phase)) {
    response.setHeader('Cache-Control', 'no-store');
    return response.status(404).json({ error: 'Unknown reminder schedule.' });
  }
  request.reminderPhase = phase;
  return handler(request, response);
};
