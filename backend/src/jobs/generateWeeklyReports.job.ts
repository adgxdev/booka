import prisma from "../configs/prisma";
import { logger } from "../utils/logger";
import { APIError } from "../utils/APIError";
import { Order } from "../generated/prisma/client";

// Generate weekly reports for all universities (runs every Saturday)
export async function generateWeeklyReportsJob() {
    try {
        // Get last week's date range (Monday to Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

        // Calculate last Sunday (end of last week)
        const lastSunday = new Date(today);
        lastSunday.setDate(today.getDate() - dayOfWeek);
        lastSunday.setHours(23, 59, 59, 999);

        // Calculate last Monday (start of last week)
        const lastMonday = new Date(lastSunday);
        lastMonday.setDate(lastSunday.getDate() - 6);
        lastMonday.setHours(0, 0, 0, 0);

        const weekStartDate = new Date(lastMonday);
        weekStartDate.setHours(0, 0, 0, 0);

        const weekEndDate = new Date(lastSunday);
        weekEndDate.setHours(0, 0, 0, 0);

        // Get all universities
        const universities = await prisma.university.findMany({
            select: { id: true, name: true }
        });

        const reportsGenerated: string[] = [];

        for (const university of universities) {
            // Check if report already exists
            const existingReport = await prisma.weeklyReport.findUnique({
                where: {
                    universityId_weekStartDate: {
                        universityId: university.id,
                        weekStartDate
                    }
                }
            });

            if (existingReport) {
                continue;
            }

            // Get all orders for last week
            const orders: Order[] = await prisma.order.findMany({
                where: {
                    universityId: university.id,
                    fulfillmentDate: {
                        gte: lastMonday,
                        lte: lastSunday
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

            // Calculate metrics (same as daily)
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

            for (const order of orders) {
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
            }

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
            await prisma.weeklyReport.create({
                data: {
                    universityId: university.id,
                    weekStartDate,
                    weekEndDate,
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

        logger.info(`Weekly reports generated for ${reportsGenerated.length} universities`, {
            entity: 'system',
            type: 'system'
        });

        return {
            success: true,
            weekRange: `${weekStartDate.toISOString().split('T')[0]} to ${weekEndDate.toISOString().split('T')[0]}`,
            universitiesProcessed: reportsGenerated.length,
            universities: reportsGenerated
        };

    } catch (error) {
        throw APIError.from(error);
    }
}
