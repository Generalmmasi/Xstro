const { handler } = require('../lib');
const Scheduler = require('../lib/sql/scheduler');

const convertTo24Hour = (timeStr) => {
 const timeRegex = /^(0?[1-9]|1[0-2]):([0-5][0-9])(am|pm)$/i;
 const match = timeStr.toLowerCase().match(timeRegex);
 if (!match) return null;
 let [_, hours, minutes, period] = match;
 hours = parseInt(hours);
 if (period === 'pm' && hours !== 12) hours += 12;
 else if (period === 'am' && hours === 12) hours = 0;
 return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const convertTo12Hour = (timeStr) => {
 const [hours, minutes] = timeStr.split(':');
 let period = 'AM';
 let hour = parseInt(hours);
 if (hour >= 12) {
  period = 'PM';
  if (hour > 12) hour -= 12;
 }
 if (hour === 0) hour = 12;
 return `${hour}:${minutes}${period}`;
};

handler(
 {
  pattern: 'automute',
  alias: 'amute',
  desc: 'Set a time to automatically mute a group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply('_This command is only for groups_');
  if (!m.isAdmin || !m.isBotAdmin) return message.reply('*I need to be admin to perform this action*');
  if (!match) return message.reply(`*Please provide time in 12hr format*\n\n_Example: .automute 3:15pm_`);
  const time24 = convertTo24Hour(match.trim());
  if (!time24) return message.reply(`*Invalid time format*\n\n_Please use format like: 3:15pm_`);
  const [schedule, created] = await Scheduler.findOrCreate({
   where: { groupId: message.jid },
   defaults: {
    muteTime: time24,
    isScheduled: true,
   },
  });
  if (!created) {
   schedule.muteTime = time24;
   schedule.isScheduled = true;
   await schedule.save();
   return message.reply(`_Group will now be muted at ${match.trim()}_`);
  } else {
   return message.reply(`_Group will be muted at ${match.trim()}_`);
  }
 }
);

handler(
 {
  pattern: 'autounmute',
  alias: 'aunmute',
  desc: 'Set a time to automatically unmute a group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin || !m.isBotAdmin) return message.reply(admin);
  if (!match) return message.reply(`*Inavaild time in 12hr format*\n\n_Example: .autounmute 2:00am_`);
  const time24 = convertTo24Hour(match.trim());
  if (!time24) return message.reply(`*Invalid time format*\n\n_Please use format like: 2:00am_`);
  const [schedule, created] = await Scheduler.findOrCreate({
   where: { groupId: message.jid },
   defaults: {
    unmuteTime: time24,
    isScheduled: true,
   },
  });
  if (!created) {
   schedule.unmuteTime = time24;
   schedule.isScheduled = true;
   await schedule.save();
   return message.reply(`_Group will now be unmuted at ${match.trim()}_`);
  } else {
   return message.reply(`_Group will be unmuted at ${match.trim()}_`);
  }
 }
);

handler(
 {
  pattern: 'getmute',
  desc: 'Get muting time for a group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply('_This command is only for groups_');
  const schedule = await Scheduler.findOne({ where: { groupId: message.jid } });
  if (!schedule || !schedule.isScheduled) return message.reply('No active mute schedule for this group');
  let response = '*📅 Mute Schedules*\n\n';
  if (schedule.muteTime) response += `*🔇 Mute:* _${convertTo12Hour(schedule.muteTime)}_\n`;
  if (schedule.unmuteTime) response += `*🔊 Unmute:* _${convertTo12Hour(schedule.unmuteTime)}_\n`;
  response += `*Status:* _${schedule.isMuted ? '🔇 Muted' : '🔊 Unmuted'}_`;
  return message.reply(response);
 }
);

handler(
 {
  pattern: 'delmute',
  desc: 'Cancel mute schedule for the group',
  type: 'group',
 },
 async (message, match, m, client) => {
  if (!message.isGroup) return message.reply(group);
  if (!m.isAdmin || !m.isBotAdmin) return message.reply(admin);
  const schedule = await Scheduler.findOne({ where: { groupId: message.jid } });
  if (!schedule || !schedule.isScheduled) return message.reply('_No Jobs Where Online_');
  schedule.isScheduled = false;
  schedule.isMuted = false;
  await schedule.save();
  return message.reply('_Mute Settings Removed_');
 }
);
