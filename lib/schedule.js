const cron = require('node-cron');
const Scheduler = require('./sql/scheduler');

const schedules = async (client) => {
 cron.schedule('* * * * *', async () => {
  try {
   const now = new Date();
   const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

   const schedules = await Scheduler.findAll({
    where: {
     isScheduled: true,
    },
   });

   for (const schedule of schedules) {
    if (schedule.muteTime === currentTime && !schedule.isMuted) {
     try {
      await client.groupSettingUpdate(schedule.groupId, 'announcement');
      schedule.isMuted = true;
      await schedule.save();
      console.log(`Group ${schedule.groupId} has been muted`);
     } catch (error) {
      console.error(`Error muting group ${schedule.groupId}:`, error);
     }
    }

    if (schedule.unmuteTime === currentTime && schedule.isMuted) {
     try {
      await client.groupSettingUpdate(schedule.groupId, 'not_announcement');
      schedule.isMuted = false;
      await schedule.save();
      console.log(`Group ${schedule.groupId} has been unmuted`);
     } catch (error) {
      console.error(`Error unmuting group ${schedule.groupId}:`, error);
     }
    }
   }
  } catch (error) {
   console.error('Error in cron job:', error);
  }
 });
};

module.exports = { schedules };
