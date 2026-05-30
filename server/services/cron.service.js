import cron from 'node-cron';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import { sendEligibilityReminder } from './email.service.js';
import { DONATION_COOLDOWN_DAYS } from '../utils/helpers.js';

/**
 * Daily 8:00 AM cron — find donors who became eligible in the last 24 hours
 * (i.e., lastDonated was exactly 56 days ago) and send reminder emails.
 */
const eligibilityReminderJob = cron.schedule(
  '0 8 * * *',
  async () => {
    console.log('⏰ Running eligibility reminder cron...');
    try {
      const now = new Date();
      const eligibleFrom = new Date(now - DONATION_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
      const eligibleFromYesterday = new Date(eligibleFrom - 24 * 60 * 60 * 1000);

      const donors = await User.find({
        role: 'donor',
        isActive: true,
        lastDonated: { $gte: eligibleFromYesterday, $lte: eligibleFrom },
      });

      console.log(`📧 Sending eligibility reminders to ${donors.length} donor(s)...`);

      await Promise.allSettled(
        donors.map(async (donor) => {
          // ── Update eligibility flag FIRST — unconditionally ──
          // This is decoupled from email so an SMTP failure cannot
          // prevent a donor from becoming eligible again.
          try {
            await User.findByIdAndUpdate(donor._id, { isEligible: true });
          } catch (flagErr) {
            console.error(`❌ Failed to update eligibility for ${donor.email}:`, flagErr.message);
            return; // skip email if DB write failed
          }

          // ── Send reminder email separately ──
          try {
            await sendEligibilityReminder(donor);
            console.log(`✅ Reminder sent to: ${donor.email}`);
          } catch (mailErr) {
            // Email failure is logged but does NOT affect eligibility state
            console.error(`⚠️  Email failed for ${donor.email} (eligibility already updated):`, mailErr.message);
          }
        })
      );
    } catch (error) {
      console.error('❌ Eligibility cron error:', error.message);
    }
  },
  { scheduled: false } // Start manually via initCronJobs()
);

/**
 * Every 15 minutes — mark expired blood requests as 'expired'.
 */
const expireRequestsJob = cron.schedule(
  '*/15 * * * *',
  async () => {
    try {
      const result = await BloodRequest.updateMany(
        {
          status: 'pending',
          expiresAt: { $lt: new Date() },
        },
        { $set: { status: 'expired' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`♻️  Expired ${result.modifiedCount} blood request(s).`);
      }
    } catch (error) {
      console.error('❌ Expire requests cron error:', error.message);
    }
  },
  { scheduled: false }
);

/**
 * Initialize and start all cron jobs.
 * Call this once after server starts.
 */
export const initCronJobs = () => {
  eligibilityReminderJob.start();
  expireRequestsJob.start();
  console.log('⏰ Cron jobs initialized (eligibility reminders + request expiry)');
};
