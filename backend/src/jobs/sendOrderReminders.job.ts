import prisma from "../configs/prisma";
import { logger } from "../utils/logger";
import { APIError } from "../utils/APIError";
import { sendCustomEmail } from "../utils/send-email";

// Cron Job to send order reminders at different times
export async function sendOrderRemindersJob() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Helper function to parse time slot and get start/end times
    const parseTimeSlot = (timeSlot: string): { start: Date, end: Date } | null => {
        const parts = timeSlot.split('-');
        if (parts.length !== 2) return null;

        const parseTime = (timeStr: string, date: Date): Date => {
            const trimmed = timeStr.trim();
            const [time, period] = trimmed.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            
            let hour24 = hours;
            if (period === 'PM' && hours !== 12) hour24 += 12;
            if (period === 'AM' && hours === 12) hour24 = 0;

            const result = new Date(date);
            result.setHours(hour24, minutes || 0, 0, 0);
            return result;
        };

        const startTime = parseTime(parts[0], now);
        const endTime = parseTime(parts[1], now);
        
        return { start: startTime, end: endTime };
    };

    // Get today's date at midnight for comparison
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all active orders with today's fulfillment date
    const activeOrders = await prisma.order.findMany({
        where: {
            fulfillmentDate: {
                gte: today,
                lt: tomorrow
            },
            status: {
                notIn: ["completed", "cancelled"]
            },
            paymentStatus: "success",
            slotExpired: false
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    const remindersSent = {
        morningReminder: 0,
        oneHourBefore: 0,
        slotStarted: 0,
        thirtyMinutesBeforeEnd: 0
    };

    for (const order of activeOrders) {
        const timeSlotParsed = parseTimeSlot(order.timeSlot);
        if (!timeSlotParsed) continue;

        const { start: slotStart, end: slotEnd } = timeSlotParsed;
        
        // Set dates for slot times using fulfillment date
        slotStart.setFullYear(order.fulfillmentDate.getFullYear());
        slotStart.setMonth(order.fulfillmentDate.getMonth());
        slotStart.setDate(order.fulfillmentDate.getDate());
        
        slotEnd.setFullYear(order.fulfillmentDate.getFullYear());
        slotEnd.setMonth(order.fulfillmentDate.getMonth());
        slotEnd.setDate(order.fulfillmentDate.getDate());

        const oneHourBeforeSlot = new Date(slotStart.getTime() - 60 * 60 * 1000);
        const thirtyMinutesBeforeEnd = new Date(slotEnd.getTime() - 30 * 60 * 1000);

        try {
            // 1. Morning reminder at 7 AM on delivery date
            if (currentHour === 7 && currentMinutes >= 0 && currentMinutes < 10) {
                await sendCustomEmail({
                    to: order.user.email,
                    subject: "📦 Order Reminder - Today is Your Delivery Day!",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hi ${order.user.name},</h2>
                            <p>This is a reminder that your order is scheduled for ${order.fulfillmentType} today!</p>
                            <p><strong>Order ID:</strong> ${order.id}</p>
                            <p><strong>Time Slot:</strong> ${order.timeSlot}</p>
                            <p><strong>Type:</strong> ${order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                            ${order.fulfillmentType === 'pickup' ? `<p><strong>Pickup Location:</strong> ${order.pickupLocation}</p>` : ''}
                            ${order.fulfillmentType === 'delivery' ? `<p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>` : ''}
                            <p>Please be ready during your time slot!</p>
                            <p style="margin-top: 20px; color: #666;">Best regards,<br>Booka Team</p>
                        </div>
                    `
                });
                remindersSent.morningReminder++;

                //Send push notification for mobile app users later
            }

            // 2. One hour before time slot starts
            const isOneHourBefore = now >= oneHourBeforeSlot && now < slotStart;
            if (isOneHourBefore && currentMinutes >= 0 && currentMinutes < 10) {
                await sendCustomEmail({
                    to: order.user.email,
                    subject: "⏰ Order Reminder - 1 Hour Until Your Time Slot!",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hi ${order.user.name},</h2>
                            <p>Your order time slot starts in <strong>1 hour</strong>!</p>
                            <p><strong>Order ID:</strong> ${order.id}</p>
                            <p><strong>Time Slot:</strong> ${order.timeSlot}</p>
                            <p><strong>Type:</strong> ${order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                            ${order.fulfillmentType === 'pickup' ? `<p><strong>Pickup Location:</strong> ${order.pickupLocation}</p>` : ''}
                            ${order.fulfillmentType === 'delivery' ? `<p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>` : ''}
                            <p>Please ensure you're available!</p>
                            <p style="margin-top: 20px; color: #666;">Best regards,<br>Booka Team</p>
                        </div>
                    `
                });
                remindersSent.oneHourBefore++;

                //Send push notification
            }

            //When time slot starts
            const isSlotJustStarted = now >= slotStart && now < new Date(slotStart.getTime() + 10 * 60 * 1000);
            if (isSlotJustStarted && currentMinutes >= 0 && currentMinutes < 10) {
                await sendCustomEmail({
                    to: order.user.email,
                    subject: "🚀 Your Order Time Slot Has Started!",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hi ${order.user.name},</h2>
                            <p>Your order time slot has now started!</p>
                            <p><strong>Order ID:</strong> ${order.id}</p>
                            <p><strong>Time Slot:</strong> ${order.timeSlot}</p>
                            <p><strong>Type:</strong> ${order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                            ${order.fulfillmentType === 'pickup' ? `<p><strong>Pickup Location:</strong> ${order.pickupLocation}</p>` : ''}
                            ${order.fulfillmentType === 'delivery' ? `<p>Our delivery agent will arrive shortly at: ${order.deliveryAddress}</p>` : ''}
                            ${order.fulfillmentType === 'pickup' ? `<p>Please head to ${order.pickupLocation} when ready.</p>` : ''}
                            <p style="margin-top: 20px; color: #666;">Best regards,<br>Booka Team</p>
                        </div>
                    `
                });
                remindersSent.slotStarted++;

                //Send push notification
            }

            //30 minutes before time slot ends
            const is30MinutesBeforeEnd = now >= thirtyMinutesBeforeEnd && now < slotEnd;
            if (is30MinutesBeforeEnd && currentMinutes >= 0 && currentMinutes < 10) {
                await sendCustomEmail({
                    to: order.user.email,
                    subject: "⚠️ Last Call - 30 Minutes Until Time Slot Expires!",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Hi ${order.user.name},</h2>
                            <p><strong style="color: #d9534f;">Your order time slot will expire in 30 minutes!</strong></p>
                            <p><strong>Order ID:</strong> ${order.id}</p>
                            <p><strong>Time Slot:</strong> ${order.timeSlot}</p>
                            <p><strong>Type:</strong> ${order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                            ${order.fulfillmentType === 'pickup' ? `<p><strong>Pickup Location:</strong> ${order.pickupLocation}</p>` : ''}
                            ${order.fulfillmentType === 'delivery' ? `<p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>` : ''}
                            <p style="color: #d9534f;">If you miss this time slot, you will need to reschedule your order and pay a rescheduling fee.</p>
                            <p>Please complete your order as soon as possible!</p>
                            <p style="margin-top: 20px; color: #666;">Best regards,<br>Booka Team</p>
                        </div>
                    `
                });
                remindersSent.thirtyMinutesBeforeEnd++;

                //Send push notification
            }

        } catch (error) {
            logger.error(`Failed to send reminder for order ${order.id}`, {
                entity: 'system',
                type: 'system',
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    }

    logger.info(`Order reminders sent`, {
        entity: 'system',
        type: 'system'
    });

    return {
        success: true,
        totalOrdersChecked: activeOrders.length,
        remindersSent
    };
}
