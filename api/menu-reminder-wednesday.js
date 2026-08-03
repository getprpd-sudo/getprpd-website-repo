const handler = require('./menu-reminders');

module.exports = function wednesdayReminder(request, response) {
  request.reminderPhase = 'wednesday';
  return handler(request, response);
};
