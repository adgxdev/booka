import prisma from "../configs/prisma";
import { logger } from "../utils/logger";
import { APIError } from "../utils/APIError";
import { Order } from "../generated/prisma/client";

// Generate daily reports for all universities
export async function generateDailyReportsJob() {
    try {
        // Get yesterday's date (reports are generated for the previous day)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all universities
        const universities = await prisma.university.findMany({
            select: { id: true, name: true }
        });

        const reportsGenerated: string[] = [];

        for (const university of universities) {
            // Check if report already exists for this date
            const existingReport = await prisma.dailyReport.findUnique({
                where: {
                    universityId_reportDate: {
                        universityId: university.id,
                        reportDate: yesterday
                    }
                }
            });

            if (existingReport) {
                logger.info(`Daily report already exists for ${university.name} on ${yesterday.toISOString().split('T')[0]}`, {
                    entity: 'system',
                    type: 'system'
                });
                continue;
            }

            // Get all orders scheduled for yesterday
            const orders = await prisma.order.findMany({
                where: {
                    universityId: university.id,
                    fulfillmentDate: {
                        gte: yesterday,
                        lt: today
                    }
                },
                include: {
                    items: {
                        include: {
                            book: true
                        }
                    },
                    agent: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });

            // Calculate metrics
            const totalOrdersScheduled = orders.length;
            const completedPickups = orders.filter(o => o.fulfillmentType === 'pickup' && o.status === 'completed').length;
            const completedDeliveries = orders.filter(o => o.fulfillmentType === 'delivery' && o.status === 'completed').length;
            const missedSlots = orders.filter(o => o.slotExpired && o.status !== 'completed').length;
            const reschedules = orders.filter(o => o.rescheduledCount > 0).length;

            const totalOrderValue = orders.reduce((sum, o) => sum + o.booksTotal, 0);
            const totalServiceFees = orders.reduce((sum, o) => sum + o.serviceFee, 0);
            const totalRescheduleFees = orders.reduce((sum, o) => sum + o.reschedulingFee, 0);

            // Agent performance
            const agentStats = new Map<string, { agentId: string, agentName: string, commissions: number, successfulDeliveries: number, successfulPickups: number }>();

            orders.forEach(order => {
                if (order.agentId && order.agent) {
                    const existing = agentStats.get(order.agentId) || {
                        agentId: order.agentId,
                        agentName: order.agent.name,
                        commissions: 0,
                        successfulDeliveries: 0,
                        successfulPickups: 0
                    };

                    if (order.status === 'completed') {
                        existing.commissions += order.agentCommission;
                        if (order.fulfillmentType === 'delivery') {
                            existing.successfulDeliveries++;
                        } else {
                            existing.successfulPickups++;
                        }
                    }

                    agentStats.set(order.agentId, existing);
                }
            });

            const agentPerformance = Array.from(agentStats.values());

            // Top 10 books
            const bookStats = new Map<string, { bookId: string, bookTitle: string, orderCount: number }>();

            for (const order of orders) {
                for (const item of order.items) {
                    const existing = bookStats.get(item.bookId) || {
                        bookId: item.bookId,
                        bookTitle: item.bookTitle,
                        orderCount: 0
                    };
                    existing.orderCount += item.quantity;
                    bookStats.set(item.bookId, existing);
                }
            }

            const topBooks = Array.from(bookStats.values())
                .sort((a, b) => b.orderCount - a.orderCount)
                .slice(0, 10);

            // Create report
            await prisma.dailyReport.create({
                data: {
                    universityId: university.id,
                    reportDate: yesterday,
                    totalOrdersScheduled,
                    completedPickups,
                    completedDeliveries,
                    missedSlots,
                    reschedules,
                    totalOrderValue,
                    totalServiceFees,
                    totalRescheduleFees,
                    agentPerformance,
                    topBooks
                }
            });

            reportsGenerated.push(university.name);
        }

        logger.info(`Daily reports generated for ${reportsGenerated.length} universities`, {
            entity: 'system',
            type: 'system'
        });

        return {
            success: true,
            date: yesterday.toISOString().split('T')[0],
            universitiesProcessed: reportsGenerated.length,
            universities: reportsGenerated
        };

    } catch (error) {
        throw APIError.from(error);
    }
}
