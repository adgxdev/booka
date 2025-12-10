import { NextFunction, Request, Response } from "express";
import prisma from "../../configs/prisma";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";

// Get daily report for a specific date
export const getDailyReport = async (req: Request, res: Response, next: NextFunction) => {
    const universityId = req.admin?.universityId;
    if (!universityId) {
        throw APIError.Forbidden("Admin not assigned to any university");
    }

    const { date } = req.query;
    if (!date || typeof date !== 'string') {
        throw APIError.BadRequest("Date parameter is required (format: YYYY-MM-DD)");
    }

    // Parse date
    const reportDate = new Date(date);
    reportDate.setHours(0, 0, 0, 0);

    if (isNaN(reportDate.getTime())) {
        throw APIError.BadRequest("Invalid date format. Use YYYY-MM-DD");
    }

    // Fetch report
    const report = await prisma.dailyReport.findUnique({
        where: {
            universityId_reportDate: {
                universityId,
                reportDate
            }
        }
    });

    if (!report) {
        throw APIError.NotFound("No report found for this date");
    }

    return APIResponse.success(res, "Daily report retrieved successfully", {
        date: reportDate.toISOString().split('T')[0],
        metrics: {
            totalOrdersScheduled: report.totalOrdersScheduled,
            completedPickups: report.completedPickups,
            completedDeliveries: report.completedDeliveries,
            missedSlots: report.missedSlots,
            reschedules: report.reschedules
        },
        financials: {
            totalOrderValue: report.totalOrderValue,
            totalServiceFees: report.totalServiceFees,
            totalRescheduleFees: report.totalRescheduleFees
        },
        agentPerformance: report.agentPerformance,
        topBooks: report.topBooks
    });
};

// Get weekly report for a specific week
export const getWeeklyReport = async (req: Request, res: Response, next: NextFunction) => {
    const universityId = req.admin?.universityId;
    if (!universityId) {
        throw APIError.Forbidden("Admin not assigned to any university");
    }

    const { week } = req.query;
    if (!week || typeof week !== 'string') {
        throw APIError.BadRequest("Week parameter is required (format: YYYY-MM-DD for Monday of the week)");
    }

    // Parse week start date
    const weekStartDate = new Date(week);
    weekStartDate.setHours(0, 0, 0, 0);

    if (isNaN(weekStartDate.getTime())) {
        throw APIError.BadRequest("Invalid date format. Use YYYY-MM-DD");
    }

    // Fetch report
    const report = await prisma.weeklyReport.findUnique({
        where: {
            universityId_weekStartDate: {
                universityId,
                weekStartDate
            }
        }
    });

    if (!report) {
        throw APIError.NotFound("No report found for this week");
    }

    return APIResponse.success(res, "Weekly report retrieved successfully", {
        weekStart: report.weekStartDate.toISOString().split('T')[0],
        weekEnd: report.weekEndDate.toISOString().split('T')[0],
        metrics: {
            totalOrdersScheduled: report.totalOrdersScheduled,
            completedPickups: report.completedPickups,
            completedDeliveries: report.completedDeliveries,
            missedSlots: report.missedSlots,
            reschedules: report.reschedules
        },
        financials: {
            totalOrderValue: report.totalOrderValue,
            totalServiceFees: report.totalServiceFees,
            totalRescheduleFees: report.totalRescheduleFees
        },
        agentPerformance: report.agentPerformance,
        topBooks: report.topBooks
    });
};

// Get monthly report for a specific month
export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
    const universityId = req.admin?.universityId;
    if (!universityId) {
        throw APIError.Forbidden("Admin not assigned to any university");
    }

    const { month } = req.query;
    if (!month || typeof month !== 'string') {
        throw APIError.BadRequest("Month parameter is required (format: YYYY-MM for first day of month)");
    }

    // Parse month (first day)
    const reportMonth = new Date(month + '-01');
    reportMonth.setHours(0, 0, 0, 0);

    if (isNaN(reportMonth.getTime())) {
        throw APIError.BadRequest("Invalid date format. Use YYYY-MM");
    }

    // Fetch report
    const report = await prisma.monthlyReport.findUnique({
        where: {
            universityId_reportMonth: {
                universityId,
                reportMonth
            }
        }
    });

    if (!report) {
        throw APIError.NotFound("No report found for this month");
    }

    return APIResponse.success(res, "Monthly report retrieved successfully", {
        month: report.reportMonth.toISOString().split('T')[0].substring(0, 7), // YYYY-MM
        metrics: {
            totalOrdersScheduled: report.totalOrdersScheduled,
            completedPickups: report.completedPickups,
            completedDeliveries: report.completedDeliveries,
            missedSlots: report.missedSlots,
            reschedules: report.reschedules
        },
        financials: {
            totalOrderValue: report.totalOrderValue,
            totalServiceFees: report.totalServiceFees,
            totalRescheduleFees: report.totalRescheduleFees
        },
        agentPerformance: report.agentPerformance,
        topBooks: report.topBooks
    });
};

// List all available daily reports for the university
export const listDailyReports = async (req: Request, res: Response, next: NextFunction) => {
    const universityId = req.admin?.universityId;
    if (!universityId) {
        throw APIError.Forbidden("Admin not assigned to any university");
    }

    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    const [reports, totalReports] = await Promise.all([
        prisma.dailyReport.findMany({
            where: { universityId },
            orderBy: { reportDate: 'desc' },
            skip: skipItems,
            take: itemsPerPage,
            select: {
                reportDate: true,
                totalOrdersScheduled: true,
                completedPickups: true,
                completedDeliveries: true,
                missedSlots: true,
                reschedules: true,
                totalOrderValue: true,
                totalServiceFees: true,
                totalRescheduleFees: true,
                createdAt: true
            }
        }),
        prisma.dailyReport.count({ where: { universityId } })
    ]);

    const totalPages = Math.ceil(totalReports / itemsPerPage);

    return APIResponse.success(res, "Daily reports list retrieved successfully", {
        items: reports.map(r => ({
            date: r.reportDate.toISOString().split('T')[0],
            totalOrders: r.totalOrdersScheduled,
            completedPickups: r.completedPickups,
            completedDeliveries: r.completedDeliveries,
            missedSlots: r.missedSlots,
            reschedules: r.reschedules,
            totalRevenue: r.totalOrderValue + r.totalServiceFees + r.totalRescheduleFees,
            generatedAt: r.createdAt
        })),
        page: currentPage,
        limit: itemsPerPage,
        total: totalReports,
        totalPages
    });
};

// List all available weekly reports for the university
export const listWeeklyReports = async (req: Request, res: Response, next: NextFunction) => {
    const universityId = req.admin?.universityId;
    if (!universityId) {
        throw APIError.Forbidden("Admin not assigned to any university");
    }

    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    const [reports, totalReports] = await Promise.all([
        prisma.weeklyReport.findMany({
            where: { universityId },
            orderBy: { weekStartDate: 'desc' },
            skip: skipItems,
            take: itemsPerPage,
            select: {
                weekStartDate: true,
                weekEndDate: true,
                totalOrdersScheduled: true,
                completedPickups: true,
                completedDeliveries: true,
                missedSlots: true,
                reschedules: true,
                totalOrderValue: true,
                totalServiceFees: true,
                totalRescheduleFees: true,
                createdAt: true
            }
        }),
        prisma.weeklyReport.count({ where: { universityId } })
    ]);

    const totalPages = Math.ceil(totalReports / itemsPerPage);

    return APIResponse.success(res, "Weekly reports list retrieved successfully", {
        items: reports.map(r => ({
            weekStart: r.weekStartDate.toISOString().split('T')[0],
            weekEnd: r.weekEndDate.toISOString().split('T')[0],
            totalOrders: r.totalOrdersScheduled,
            completedPickups: r.completedPickups,
            completedDeliveries: r.completedDeliveries,
            missedSlots: r.missedSlots,
            reschedules: r.reschedules,
            totalRevenue: r.totalOrderValue + r.totalServiceFees + r.totalRescheduleFees,
            generatedAt: r.createdAt
        })),
        page: currentPage,
        limit: itemsPerPage,
        total: totalReports,
        totalPages
    });
};

// List all available monthly reports for the university
export const listMonthlyReports = async (req: Request, res: Response, next: NextFunction) => {
    const universityId = req.admin?.universityId;
    if (!universityId) {
        throw APIError.Forbidden("Admin not assigned to any university");
    }

    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    const [reports, totalReports] = await Promise.all([
        prisma.monthlyReport.findMany({
            where: { universityId },
            orderBy: { reportMonth: 'desc' },
            skip: skipItems,
            take: itemsPerPage,
            select: {
                reportMonth: true,
                totalOrdersScheduled: true,
                completedPickups: true,
                completedDeliveries: true,
                missedSlots: true,
                reschedules: true,
                totalOrderValue: true,
                totalServiceFees: true,
                totalRescheduleFees: true,
                createdAt: true
            }
        }),
        prisma.monthlyReport.count({ where: { universityId } })
    ]);

    const totalPages = Math.ceil(totalReports / itemsPerPage);

    return APIResponse.success(res, "Monthly reports list retrieved successfully", {
        items: reports.map(r => ({
            month: r.reportMonth.toISOString().split('T')[0].substring(0, 7),
            totalOrders: r.totalOrdersScheduled,
            completedPickups: r.completedPickups,
            completedDeliveries: r.completedDeliveries,
            missedSlots: r.missedSlots,
            reschedules: r.reschedules,
            totalRevenue: r.totalOrderValue + r.totalServiceFees + r.totalRescheduleFees,
            generatedAt: r.createdAt
        })),
        page: currentPage,
        limit: itemsPerPage,
        total: totalReports,
        totalPages
    });
};

// Get daily report for any university by ID (superAdmin only)
export const getSuperAdminDailyReport = async (req: Request, res: Response, next: NextFunction) => {
    const { universityId, date } = req.body;
    
    if (!universityId) {
        throw APIError.BadRequest("University ID is required");
    }

    if (!date || typeof date !== 'string') {
        throw APIError.BadRequest("Date parameter is required (format: YYYY-MM-DD)");
    }

    // Verify university exists
    const university = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true, name: true }
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    // Parse date
    const reportDate = new Date(date);
    reportDate.setHours(0, 0, 0, 0);

    if (isNaN(reportDate.getTime())) {
        throw APIError.BadRequest("Invalid date format. Use YYYY-MM-DD");
    }

    // Fetch report
    const report = await prisma.dailyReport.findUnique({
        where: {
            universityId_reportDate: {
                universityId,
                reportDate
            }
        }
    });

    if (!report) {
        throw APIError.NotFound("No report found for this university and date");
    }

    return APIResponse.success(res, "Daily report retrieved successfully", {
        university: {
            id: university.id,
            name: university.name
        },
        date: reportDate.toISOString().split('T')[0],
        metrics: {
            totalOrdersScheduled: report.totalOrdersScheduled,
            completedPickups: report.completedPickups,
            completedDeliveries: report.completedDeliveries,
            missedSlots: report.missedSlots,
            reschedules: report.reschedules
        },
        financials: {
            totalOrderValue: report.totalOrderValue,
            totalServiceFees: report.totalServiceFees,
            totalRescheduleFees: report.totalRescheduleFees
        },
        agentPerformance: report.agentPerformance,
        topBooks: report.topBooks
    });
};

// Get weekly report for any university by ID (superAdmin only)
export const getSuperAdminWeeklyReport = async (req: Request, res: Response, next: NextFunction) => {
    const { universityId, week } = req.body;
    
    if (!universityId) {
        throw APIError.BadRequest("University ID is required");
    }

    if (!week || typeof week !== 'string') {
        throw APIError.BadRequest("Week parameter is required (format: YYYY-MM-DD for Monday of the week)");
    }

    // Verify university exists
    const university = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true, name: true }
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    // Parse week start date
    const weekStartDate = new Date(week);
    weekStartDate.setHours(0, 0, 0, 0);

    if (isNaN(weekStartDate.getTime())) {
        throw APIError.BadRequest("Invalid date format. Use YYYY-MM-DD");
    }

    // Fetch report
    const report = await prisma.weeklyReport.findUnique({
        where: {
            universityId_weekStartDate: {
                universityId,
                weekStartDate
            }
        }
    });

    if (!report) {
        throw APIError.NotFound("No report found for this university and week");
    }

    return APIResponse.success(res, "Weekly report retrieved successfully", {
        university: {
            id: university.id,
            name: university.name
        },
        weekStart: report.weekStartDate.toISOString().split('T')[0],
        weekEnd: report.weekEndDate.toISOString().split('T')[0],
        metrics: {
            totalOrdersScheduled: report.totalOrdersScheduled,
            completedPickups: report.completedPickups,
            completedDeliveries: report.completedDeliveries,
            missedSlots: report.missedSlots,
            reschedules: report.reschedules
        },
        financials: {
            totalOrderValue: report.totalOrderValue,
            totalServiceFees: report.totalServiceFees,
            totalRescheduleFees: report.totalRescheduleFees
        },
        agentPerformance: report.agentPerformance,
        topBooks: report.topBooks
    });
};

// Get monthly report for any university by ID (superAdmin only)
export const getSuperAdminMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
    const { universityId, month } = req.body;
    
    if (!universityId) {
        throw APIError.BadRequest("University ID is required");
    }

    if (!month || typeof month !== 'string') {
        throw APIError.BadRequest("Month parameter is required (format: YYYY-MM)");
    }

    // Verify university exists
    const university = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true, name: true }
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    // Parse month (first day)
    const reportMonth = new Date(month + '-01');
    reportMonth.setHours(0, 0, 0, 0);

    if (isNaN(reportMonth.getTime())) {
        throw APIError.BadRequest("Invalid date format. Use YYYY-MM");
    }

    // Fetch report
    const report = await prisma.monthlyReport.findUnique({
        where: {
            universityId_reportMonth: {
                universityId,
                reportMonth
            }
        }
    });

    if (!report) {
        throw APIError.NotFound("No report found for this university and month");
    }

    return APIResponse.success(res, "Monthly report retrieved successfully", {
        university: {
            id: university.id,
            name: university.name
        },
        month: report.reportMonth.toISOString().split('T')[0].substring(0, 7),
        metrics: {
            totalOrdersScheduled: report.totalOrdersScheduled,
            completedPickups: report.completedPickups,
            completedDeliveries: report.completedDeliveries,
            missedSlots: report.missedSlots,
            reschedules: report.reschedules
        },
        financials: {
            totalOrderValue: report.totalOrderValue,
            totalServiceFees: report.totalServiceFees,
            totalRescheduleFees: report.totalRescheduleFees
        },
        agentPerformance: report.agentPerformance,
        topBooks: report.topBooks
    });
};

// List all daily reports for any university by ID (superAdmin only)
export const listSuperAdminDailyReports = async (req: Request, res: Response, next: NextFunction) => {
    const { universityId } = req.body;
    
    if (!universityId) {
        throw APIError.BadRequest("University ID is required");
    }

    // Verify university exists
    const university = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true, name: true }
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    const [reports, totalReports] = await Promise.all([
        prisma.dailyReport.findMany({
            where: { universityId },
            orderBy: { reportDate: 'desc' },
            skip: skipItems,
            take: itemsPerPage,
            select: {
                reportDate: true,
                totalOrdersScheduled: true,
                completedPickups: true,
                completedDeliveries: true,
                missedSlots: true,
                reschedules: true,
                totalOrderValue: true,
                totalServiceFees: true,
                totalRescheduleFees: true,
                createdAt: true
            }
        }),
        prisma.dailyReport.count({ where: { universityId } })
    ]);

    const totalPages = Math.ceil(totalReports / itemsPerPage);

    return APIResponse.success(res, "Daily reports list retrieved successfully", {
        university: {
            id: university.id,
            name: university.name
        },
        items: reports.map(r => ({
            date: r.reportDate.toISOString().split('T')[0],
            totalOrders: r.totalOrdersScheduled,
            completedPickups: r.completedPickups,
            completedDeliveries: r.completedDeliveries,
            missedSlots: r.missedSlots,
            reschedules: r.reschedules,
            totalRevenue: r.totalOrderValue + r.totalServiceFees + r.totalRescheduleFees,
            generatedAt: r.createdAt
        })),
        page: currentPage,
        limit: itemsPerPage,
        total: totalReports,
        totalPages
    });
};

// List all weekly reports for any university
export const listSuperAdminWeeklyReports = async (req: Request, res: Response, next: NextFunction) => {
    const { universityId } = req.body;
    
    if (!universityId) {
        throw APIError.BadRequest("University ID is required");
    }

    // Verify university exists
    const university = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true, name: true }
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    const [reports, totalReports] = await Promise.all([
        prisma.weeklyReport.findMany({
            where: { universityId },
            orderBy: { weekStartDate: 'desc' },
            skip: skipItems,
            take: itemsPerPage,
            select: {
                weekStartDate: true,
                weekEndDate: true,
                totalOrdersScheduled: true,
                completedPickups: true,
                completedDeliveries: true,
                missedSlots: true,
                reschedules: true,
                totalOrderValue: true,
                totalServiceFees: true,
                totalRescheduleFees: true,
                createdAt: true
            }
        }),
        prisma.weeklyReport.count({ where: { universityId } })
    ]);

    const totalPages = Math.ceil(totalReports / itemsPerPage);

    return APIResponse.success(res, "Weekly reports list retrieved successfully", {
        university: {
            id: university.id,
            name: university.name
        },
        items: reports.map(r => ({
            weekStart: r.weekStartDate.toISOString().split('T')[0],
            weekEnd: r.weekEndDate.toISOString().split('T')[0],
            totalOrders: r.totalOrdersScheduled,
            completedPickups: r.completedPickups,
            completedDeliveries: r.completedDeliveries,
            missedSlots: r.missedSlots,
            reschedules: r.reschedules,
            totalRevenue: r.totalOrderValue + r.totalServiceFees + r.totalRescheduleFees,
            generatedAt: r.createdAt
        })),
        page: currentPage,
        limit: itemsPerPage,
        total: totalReports,
        totalPages
    });
};

// List all monthly reports for any university 
export const listSuperAdminMonthlyReports = async (req: Request, res: Response, next: NextFunction) => {
    const { universityId } = req.body;
    
    if (!universityId) {
        throw APIError.BadRequest("University ID is required");
    }

    // Verify university exists
    const university = await prisma.university.findUnique({
        where: { id: universityId },
        select: { id: true, name: true }
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    const [reports, totalReports] = await Promise.all([
        prisma.monthlyReport.findMany({
            where: { universityId },
            orderBy: { reportMonth: 'desc' },
            skip: skipItems,
            take: itemsPerPage,
            select: {
                reportMonth: true,
                totalOrdersScheduled: true,
                completedPickups: true,
                completedDeliveries: true,
                missedSlots: true,
                reschedules: true,
                totalOrderValue: true,
                totalServiceFees: true,
                totalRescheduleFees: true,
                createdAt: true
            }
        }),
        prisma.monthlyReport.count({ where: { universityId } })
    ]);

    const totalPages = Math.ceil(totalReports / itemsPerPage);

    return APIResponse.success(res, "Monthly reports list retrieved successfully", {
        university: {
            id: university.id,
            name: university.name
        },
        items: reports.map(r => ({
            month: r.reportMonth.toISOString().split('T')[0].substring(0, 7),
            totalOrders: r.totalOrdersScheduled,
            completedPickups: r.completedPickups,
            completedDeliveries: r.completedDeliveries,
            missedSlots: r.missedSlots,
            reschedules: r.reschedules,
            totalRevenue: r.totalOrderValue + r.totalServiceFees + r.totalRescheduleFees,
            generatedAt: r.createdAt
        })),
        page: currentPage,
        limit: itemsPerPage,
        total: totalReports,
        totalPages
    });
};
