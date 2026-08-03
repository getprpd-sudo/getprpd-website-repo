const handler = require('./menu-reminders');

module.exports = function mondayReminder(request, response) {
  request.reminderPhase = 'monday';
  return handler(request, response);
};
