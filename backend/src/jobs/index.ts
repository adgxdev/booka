import cron from "node-cron";
import { logger } from "../utils/logger";
import { expireOrderSlotsJob } from "./expireOrderSlots.job";
import { pingServerJob } from "./pingServer.job";
import { sendOrderRemindersJob } from "./sendOrderReminders.job";
import { generateDailyReportsJob } from "./generateDailyReports.job";
import { generateWeeklyReportsJob } from "./generateWeeklyReports.job";
import { generateMonthlyReportsJob } from "./generateMonthlyReports.job";
import { APIError } from "../utils/APIError";
import prisma from "../configs/prisma";

export function initializeCronJobs() {
    // Keep server alive - ping every 10 minutes because of Render 
    cron.schedule('*/10 * * * *', async () => {
        try {
            await pingServerJob();
        } catch (error) {
            const apiError = APIError.from(error);
            logger.error('pingServer cron job failed', {
                entity: 'system',
                type: 'system',
                stack: apiError.stack
            });
        }
    });

    // Send order reminders - runs every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        try {
            await sendOrderRemindersJob();
        } catch (error) {
            const apiError = APIError.from(error);
            logger.error('sendOrderReminders cron job failed', {
                entity: 'system',
                type: 'system',
                stack: apiError.stack
            });
        }
    });

    // Expire order slots every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        logger.info('Running expireOrderSlots cron job', {
            entity: 'system',
            type: 'system'
        });
        try {
            await expireOrderSlotsJob();
        } catch (error) {
            const apiError = APIError.from(error);
            logger.error('expireOrderSlots cron job failed', {
                entity: 'system',
                type: 'system',
                stack: apiError.stack
            });
        }
    });

    // Generate daily reports - runs every 10 minutes and checks if time matches config
    cron.schedule('*/10 * * * *', async () => {
        try {
            // Get daily report time from config (default: 23:00)
            const config = await prisma.config.findUnique({
                where: { key: 'daily_report_time' }
            });

            const reportTime = config?.value || '23:00';
            const [hour, minute] = reportTime.split(':').map(Number);

            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Run if current time matches config time (within 10 minute window)
            if (currentHour === hour && currentMinute >= minute && currentMinute < minute + 10) {
                await generateDailyReportsJob();
            }
        } catch (error) {
            const apiError = APIError.from(error);
            logger.error('generateDailyReports cron job failed', {
                entity: 'system',
                type: 'system',
                stack: apiError.stack
            });
        }
    });

    // Generate weekly reports - runs every 10 minutes on Saturdays and checks time
    cron.schedule('*/10 * * * *', async () => {
        try {
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

            // Only run on Saturday
            if (dayOfWeek !== 6) return;

            // Get weekly report time from config (default: 23:00)
            const config = await prisma.config.findUnique({
                where: { key: 'weekly_report_time' }
            });

            const reportTime = config?.value || '23:00';
            const [hour, minute] = reportTime.split(':').map(Number);

            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Run if current time matches config time (within 10 minute window)
            if (currentHour === hour && currentMinute >= minute && currentMinute < minute + 10) {
                await generateWeeklyReportsJob();
            }
        } catch (error) {
            const apiError = APIError.from(error);
            logger.error('generateWeeklyReports cron job failed', {
                entity: 'system',
                type: 'system',
                stack: apiError.stack
            });
        }
    });

    // Generate monthly reports - runs every 10 minutes on last day of each month and checks time
    cron.schedule('*/10 * * * *', async () => {
        try {
            const now = new Date();
            const dayOfMonth = now.getDate();
            
            // Check if today is the last day of the month
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const isLastDayOfMonth = tomorrow.getDate() === 1;

            // Only run on last day of month
            if (!isLastDayOfMonth) return;

            // Get monthly report time from config (default: 23:00)
            const config = await prisma.config.findUnique({
                where: { key: 'monthly_report_time' }
            });

            const reportTime = config?.value || '23:00';
            const [hour, minute] = reportTime.split(':').map(Number);

            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            // Run if current time matches config time (within 10 minute window)
            if (currentHour === hour && currentMinute >= minute && currentMinute < minute + 10) {
                await generateMonthlyReportsJob();
            }
        } catch (error) {
            const apiError = APIError.from(error);
            logger.error('generateMonthlyReports cron job failed', {
                entity: 'system',
                type: 'system',
                stack: apiError.stack
            });
        }
    });

    logger.info('Cron jobs initialized successfully', {
        entity: 'system',
        type: 'system'
    });
}
