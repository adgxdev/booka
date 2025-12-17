import prisma from "../configs/prisma";
import { logger } from "../utils/logger";
import { APIError } from "../utils/APIError";

// Cron Job to expire order time slots that have passed
export async function expireOrderSlotsJob() {
    try {
        const now = new Date();

        const getSlotEndTime = (fulfillmentDate: Date, timeSlot: string): Date => {
            
            //Learn to extract end time from slot (From, "9:00 AM - 11:00 AM" -> "11:00 AM")
            const endTimeStr = timeSlot.split('-')[1]?.trim();
            if (!endTimeStr) return fulfillmentDate;

            // Parse time
            const [time, period] = endTimeStr.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            
            let hour24 = hours;
            if (period === 'PM' && hours !== 12) hour24 += 12;
            if (period === 'AM' && hours === 12) hour24 = 0;

            const slotEndDate = new Date(fulfillmentDate);
            slotEndDate.setHours(hour24, minutes, 0, 0);
            
            return slotEndDate;
        };

        // Find all active orders that are not completed/cancelled and not already expired
        const activeOrders = await prisma.order.findMany({
            where: {
                slotExpired: false,
                status: {
                    notIn: ["completed", "cancelled"]
                },
                paymentStatus: "success"
            },
            select: {
                id: true,
                fulfillmentDate: true,
                timeSlot: true
            }
        });

        const expiredOrderIds: string[] = [];

        // Check which orders have expired 
        for (const order of activeOrders) {
            const slotEndTime = getSlotEndTime(order.fulfillmentDate, order.timeSlot);
            
            if (now > slotEndTime) {
                expiredOrderIds.push(order.id);
            }
        }

        // Update expired orders
        if (expiredOrderIds.length > 0) {
            await prisma.order.updateMany({
                where: {
                    id: { in: expiredOrderIds }
                },
                data: {
                    slotExpired: true,
                    slotExpiredAt: now
                }
            });

            logger.info(`Expired ${expiredOrderIds.length} order slots`, {
                entity: 'system',
                type: 'update'
            });
        } else {
            logger.info('No order slots to expire', {
                entity: 'system',
                type: 'update'
            });
        }

    return {
        success: true,
        totalChecked: activeOrders.length,
        expiredCount: expiredOrderIds.length,
        expiredOrderIds
    };
    } catch (error) {
        throw APIError.from(error);
    }
}