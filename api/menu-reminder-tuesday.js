const handler = require('./menu-reminders');

module.exports = function tuesdayReminder(request, response) {
  request.reminderPhase = 'tuesday';
  return handler(request, response);
};
