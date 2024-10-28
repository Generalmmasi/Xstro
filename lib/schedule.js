const cron = require('node-cron');
const Scheduler = require('./sql/scheduler');
const moment = require('moment-timezone');
const config = require('../config');

const getCurrentTime = () => {
 const timezone = config.TIME_ZONE;
 return moment().tz(timezone).format('HH:mm');
};

const schedules = async (client) => {
 cron.schedule('* * * * *', async () => {
  const currentTime = getCurrentTime();

  const schedules = await Scheduler.findAll({
   where: { isScheduled: true },
  });

  for (const schedule of schedules) {
   if (schedule.muteTime === currentTime && !schedule.isMuted) {
    await client.groupSettingUpdate(schedule.groupId, 'announcement');
    schedule.isMuted = true;
    await schedule.save();
    await client.sendMessage(schedule.groupId, { text: '*🔇 Group has been auto-muted*' });
   }
   if (schedule.unmuteTime === currentTime && schedule.isMuted) {
    await client.groupSettingUpdate(schedule.groupId, 'not_announcement');
    schedule.isMuted = false;
    await schedule.save();
    await client.sendMessage(schedule.groupId, { text: '*🔊 Group has been auto-unmuted*' });
   }
  }
 });
};

module.exports = { schedules };
