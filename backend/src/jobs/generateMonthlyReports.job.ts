import prisma from "../configs/prisma";
import { logger } from "../utils/logger";
import { APIError } from "../utils/APIError";

// Generate monthly reports for all universities (runs on the last day of each month)
export async function generateMonthlyReportsJob() {
    try {
        // Get last month's date range (1st to last day of month)
        const today = new Date();
        
        // Get first day of last month
        const reportMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        reportMonth.setHours(0, 0, 0, 0);
        
        // Month start (1st of last month)
        const monthStart = new Date(reportMonth);
        monthStart.setHours(0, 0, 0, 0);
        
        // Month end (last day of last month at 23:59:59)
        const lastDayOfMonth = new Date(reportMonth.getFullYear(), reportMonth.getMonth() + 1, 0);
        const monthEnd = new Date(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth(), lastDayOfMonth.getDate(), 23, 59, 59, 999);

        // Get all universities
        const universities = await prisma.university.findMany({
            select: { id: true, name: true }
        });

        const reportsGenerated: string[] = [];

        for (const university of universities) {
            // Check if report already exists
            const existingReport = await prisma.monthlyReport.findUnique({
                where: {
                    universityId_reportMonth: {
                        universityId: university.id,
                        reportMonth
                    }
                }
            });

            if (existingReport) {
                continue;
            }

            // Get all orders for last month (1st to last day)
            const orders = await prisma.order.findMany({
                where: {
                    universityId: university.id,
                    fulfillmentDate: {
                        gte: monthStart,
                        lte: monthEnd
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

            // Calculate metrics (same as daily/weekly)
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
            await prisma.monthlyReport.create({
                data: {
                    universityId: university.id,
                    reportMonth,
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

        logger.info(`Monthly reports generated for ${reportsGenerated.length} universities`, {
            entity: 'system',
            type: 'system'
        });

        return {
            success: true,
            reportMonth: reportMonth.toISOString().split('T')[0],
            universitiesProcessed: reportsGenerated.length,
            universities: reportsGenerated
        };

    } catch (error) {
        throw APIError.from(error);
    }
}
