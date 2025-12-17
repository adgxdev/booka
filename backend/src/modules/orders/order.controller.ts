import { NextFunction, Request, Response } from "express";
import prisma from "../../configs/prisma";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";
import {
    CreateOrderInput,
    CreateOrderSchema,
    sanitizeOrder,
    AssignAgentInput,
    AssignAgentSchema,
    UpdateOrderStatusInput,
    UpdateOrderStatusSchema,
    ScanQRCodeInput,
    ScanQRCodeSchema,
    VerifyPaymentInput,
    VerifyPaymentSchema,
    RescheduleOrderInput,
    RescheduleOrderSchema,
} from "./order.type";
import {
    initializePayment,
    generatePaymentReference,
    nairaToKobo,
    verifyPayment as verifyPaystackPayment,
    koboToNaira,
} from "../../utils/paystack";
import { randomBytes } from "crypto";
import { sendOrderRemindersJob } from "../../jobs/sendOrderReminders.job";

//Calculate commissions based on fulfillment type and number of books
async function calculateCommissions(totalBooksCount: number, fulfillmentType: "pickup" | "delivery") {
    // Fetch commission rates from config
    const commissionKeys = fulfillmentType === "pickup" 
        ? ["commission_pickup_agent", "commission_pickup_manager"]
        : ["commission_delivery_agent", "commission_delivery_manager"];

    const [agentConfig, managerConfig] = await Promise.all([
        prisma.config.findUnique({ where: { key: commissionKeys[0] } }),
        prisma.config.findUnique({ where: { key: commissionKeys[1] } })
    ]);

    // Default values: pickup (agent 80, manager 30), delivery (agent 120, manager 30)
    const agentCommissionPerBook = agentConfig ? parseFloat(agentConfig.value) : (fulfillmentType === "pickup" ? 80 : 120);
    const managerCommissionPerBook = managerConfig ? parseFloat(managerConfig.value) : 30;

    return {
        agentCommission: totalBooksCount * agentCommissionPerBook,
        managerCommission: totalBooksCount * managerCommissionPerBook,
    };
}

//Generate a unique QR code for order confirmation
function generateQRCode(orderId: string): string {
    const randomPart = randomBytes(8).toString("hex");
    return `BOOKA_ORDER_${orderId}_${randomPart}`;
}


//Create a new order with idempotency... just in case

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = CreateOrderSchema.parse(req.body);
    const userId = req.user?.id;
    const universityId = req.user?.universityId;

    if (!userId || !universityId) {
        throw APIError.Unauthorized("User not authenticated");
    }

    // Check for existing order with same idempotency key (prevents duplicate payments)
    const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey: validatedData.idempotencyKey },
        include: { items: true },
    });

    if (existingOrder) {
        // Return existing order if idempotency key matches
        return APIResponse.success(
            res,
            "Order already exists with this idempotency key",
            sanitizeOrder(existingOrder)
        );
    }

    // Fetch books and validate availability
    const bookIds = validatedData.items.map((item: any) => item.bookId);
    const books = await prisma.book.findMany({
        where: {
            id: { in: bookIds },
            universityId,
            status: "published",
        },
    });

    if (books.length !== bookIds.length) {
        throw APIError.BadRequest("Some books are not available");
    }

    // Calculate totals
    let booksTotal = 0;
    const orderItems = validatedData.items.map((item: any) => {
        const book = books.find((b: any) => b.id === item.bookId)!;

        if (book.quantity < item.quantity) {
            throw APIError.BadRequest(`Insufficient quantity for book: ${book.title}`);
        }

        const subtotal = book.price * item.quantity;
        booksTotal += subtotal;

        return {
            bookId: book.id,
            bookTitle: book.title,
            bookPrice: book.price,
            quantity: item.quantity,
            subtotal,
        };
    });

    // Get service fee from config based on fulfillment type
    const configKey = validatedData.fulfillmentType === "pickup" ? "service_fee_pickup" : "service_fee_delivery";
    const defaultFee = validatedData.fulfillmentType === "pickup" ? 200 : 400;

    const serviceFeeConfig = await prisma.config.findUnique({
        where: { key: configKey },
    });
    const serviceFeePerBook = serviceFeeConfig ? parseFloat(serviceFeeConfig.value) : defaultFee;

    // Calculate service fee
    const totalBooksCount = validatedData.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const serviceFee = totalBooksCount * serviceFeePerBook;
    const { agentCommission, managerCommission } = await calculateCommissions(
        totalBooksCount,
        validatedData.fulfillmentType
    );
    const totalPrice = booksTotal + serviceFee;

    // Generate unique payment reference
    const paymentReference = generatePaymentReference(userId, validatedData.idempotencyKey);

    // Validate time slot from config based on fulfillment type
    const timeSlotsConfigKey = validatedData.fulfillmentType === "pickup" ? "pickup_time_slots" : "delivery_time_slots";
    const timeSlotsConfig = await prisma.config.findUnique({
        where: { key: timeSlotsConfigKey }
    });
    
    const availableSlots = timeSlotsConfig ? JSON.parse(timeSlotsConfig.value) : [];
    
    if (!availableSlots.includes(validatedData.timeSlot)) {
        throw APIError.BadRequest(`Invalid time slot selected for ${validatedData.fulfillmentType}`);
    }

    // Validate pickup location if fulfillment type is pickup
    if (validatedData.fulfillmentType === "pickup") {
        if (!validatedData.pickupLocation) {
            throw APIError.BadRequest("Pickup location is required for pickup orders");
        }

        const university = await prisma.university.findUnique({
            where: { id: universityId },
            select: { pickupLocations: true }
        });

        if (!university || !university.pickupLocations.includes(validatedData.pickupLocation)) {
            throw APIError.BadRequest("Invalid pickup location selected");
        }
    }

    const order = await prisma.order.create({
        data: {
            userId,
            universityId,
            booksTotal,
            serviceFee,
            agentCommission,
            managerCommission,
            totalPrice,
            paymentReference,
            idempotencyKey: validatedData.idempotencyKey,
            fulfillmentType: validatedData.fulfillmentType,
            fulfillmentDate: new Date(validatedData.fulfillmentDate),
            timeSlot: validatedData.timeSlot,
            deliveryAddress: validatedData.deliveryAddress,
            pickupLocation: validatedData.pickupLocation,
            items: {
                create: orderItems,
            },
        },
        include: { items: true },
    });

    // Initialize payment with Paystack
    const paymentInit = await initializePayment({
        email: req.user?.email || '',
        amount: nairaToKobo(totalPrice),
        reference: paymentReference,
        metadata: {
            orderId: order.id,
            userId,
            universityId,
            idempotencyKey: validatedData.idempotencyKey,
        },
    });

    // Update order with Paystack reference
    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
            paystackReference: paymentInit.data.reference,
            paymentStatus: "processing",
        },
        include: { items: true },
    });

    return APIResponse.success(
        res,
        "Order created successfully. Complete payment to confirm.",
        {
            order: sanitizeOrder(updatedOrder),
            payment: {
                authorizationUrl: paymentInit.data.authorization_url,
                accessCode: paymentInit.data.access_code,
                reference: paymentInit.data.reference,
            },
        },
        201
    );
};

//Verify paymmnt
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = VerifyPaymentSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
        throw APIError.Unauthorized("User not authenticated");
    }

    // Verify payment with Paystack
    const verification = await verifyPaystackPayment(validatedData.reference);

    if (!verification.status || verification.data.status !== "success") {
        throw APIError.BadRequest("Payment verification failed");
    }

    // Find order by payment reference
    const order = await prisma.order.findFirst({
        where: {
            OR: [
                { paymentReference: validatedData.reference },
                { paystackReference: validatedData.reference },
            ],
            userId,
        },
        include: { items: true },
    });

    if (!order) {
        throw APIError.NotFound("Order not found");
    }

    if (order.paymentStatus === "success") {
        return APIResponse.success(res, "Payment already verified", sanitizeOrder(order));
    }

    // Verify amount matches
    const paidAmount = koboToNaira(verification.data.amount);
    if (Math.abs(paidAmount - order.totalPrice) > 0.01) {
        throw APIError.BadRequest("Payment amount mismatch");
    }

    // Update inventory and order status in transaction
    await prisma.$transaction(async (tx: any) => {
        // Reduce book quantities
        for (const item of order.items) {
            await tx.book.update({
                where: { id: item.bookId },
                data: { quantity: { decrement: item.quantity } },
            });
        }

        // Update order status and generate QR code
        await tx.order.update({
            where: { id: order.id },
            data: {
                paymentStatus: "success",
                status: "purchased",
                paidAt: new Date(verification.data.paid_at),
                qrCode: generateQRCode(order.id),
            },
        });
    });

    const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true },
    });

    return APIResponse.success(res, "Payment verified successfully", sanitizeOrder(updatedOrder!));
};


export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
        throw APIError.Unauthorized("User not authenticated");
    }

    const { status, page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };
    if (status) {
        where.status = status;
    }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: { items: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNum,
        }),
        prisma.order.count({ where }),
    ]);

    return APIResponse.success(
        res,
        "Orders retrieved successfully",
        {
            items: orders.map(sanitizeOrder),
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        }
    );
};


export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        throw APIError.Unauthorized("User not authenticated");
    }

    const order = await prisma.order.findFirst({
        where: { id, userId },
        include: { items: true },
    });

    if (!order) {
        throw APIError.NotFound("Order not found");
    }

    return APIResponse.success(res, "Order retrieved successfully", sanitizeOrder(order));
};


export const assignAgent = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = AssignAgentSchema.parse(req.body);
    const universityId = req.admin?.universityId;

    if (!universityId) {
        throw APIError.Forbidden("Admin not assigned to any university");
    }

    // Verify order belongs to admin's university
    const order = await prisma.order.findFirst({
        where: { id: validatedData.orderId, universityId },
    });

    if (!order) {
        throw APIError.NotFound("Order not found");
    }

    // Verify agent belongs to same university
    const agent = await prisma.deliveryAgent.findFirst({
        where: { id: validatedData.agentId, universityId },
    });

    if (!agent) {
        throw APIError.NotFound("Agent not found or not in your university");
    }

    // Assign agent, update status to confirmed, and increment agent's pending orders count
    const [updatedOrder] = await prisma.$transaction([
        prisma.order.update({
            where: { id: validatedData.orderId },
            data: {
                agentId: validatedData.agentId,
                status: "confirmed",
            },
            include: { items: true },
        }),
        prisma.deliveryAgent.update({
            where: { id: validatedData.agentId },
            data: {
                pendingOrdersCount: { increment: 1 }
            }
        })
    ]);

    return APIResponse.success(res, "Agent assigned successfully", sanitizeOrder(updatedOrder));
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = UpdateOrderStatusSchema.parse(req.body);

    let universityId: string | undefined | null;

    // Check if admin or agent is making the request
    if (req.admin) {
        universityId = req.admin.universityId;
    } 

    if (!universityId) {
        throw APIError.Forbidden("Unauthorized");
    }

    const order = await prisma.order.findFirst({
        where: { id: validatedData.orderId, universityId },
        include: { items: true },
    });

    if (!order) {
        throw APIError.NotFound("Order not found");
    }

    const updatedOrder = await prisma.order.update({
        where: { id: validatedData.orderId },
        data: { status: validatedData.status },
        include: { items: true },
    });

    return APIResponse.success(res, "Order status updated successfully", sanitizeOrder(updatedOrder));
};

// Scan QR code to confirm order delivery/pickup (distributes commissions)
export const scanQRCode = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = ScanQRCodeSchema.parse(req.body);

    const agentId = req.agent?.id;
    const universityId = req.agent?.universityId;

    if (!agentId || !universityId) {
        throw APIError.Unauthorized("Agent not authenticated");
    }

    const order = await prisma.order.findFirst({
        where: {
            qrCode: validatedData.qrCode,
            universityId,
        },
        include: { items: true, agent: true },
    });

    if (!order) {
        throw APIError.NotFound("Invalid QR code");
    }

    if (order.qrCodeScannedAt) {
        throw APIError.BadRequest("Order already confirmed");
    }

    // Check if time slot has expired
    if (order.slotExpired) {
        throw APIError.BadRequest("Order time slot has expired. Please reschedule the order by paying the rescheduling fee.");
    }

    // Update order and distribute commissions
    const updatedOrder = await prisma.$transaction(async (tx: any) => {
        // Mark order as completed
        const updated = await tx.order.update({
            where: { id: order.id },
            data: {
                qrCodeScannedAt: new Date(),
                status: "completed",
            },
            include: { items: true },
        });

        // Update agent commissions and decrement pending orders count
        if (order.agentId) {
            await tx.deliveryAgent.update({
                where: { id: order.agentId },
                data: {
                    totalCommissions: {
                        increment: order.agentCommission,
                    },
                    pendingOrdersCount: {
                        decrement: 1
                    }
                },
            });
        }

        // Update manager commissions - find admin by universityId
        const manager = await tx.admin.findFirst({
            where: { universityId: order.universityId },
            select: { id: true },
        });

        if (manager) {
            await tx.admin.update({
                where: { id: manager.id },
                data: {
                    commissions: {
                        increment: Math.round(order.managerCommission),
                    },
                },
            });
        }

        // Update book orderCount for each item in the order
        for (const item of order.items) {
            await tx.book.update({
                where: { id: item.bookId },
                data: {
                    orderCount: {
                        increment: item.quantity
                    }
                }
            });
        }

        return updated;
    });

    return APIResponse.success(res, "Order confirmed successfully", sanitizeOrder(updatedOrder));
};


// Get all orders for admin's university with pagination and filtering
export const getOrdersForAdmin = async (req: Request, res: Response, next: NextFunction) => {
    // Verify admin has a university assigned
    const universityId = req.admin?.universityId;
    if (!universityId) {
        throw APIError.Forbidden("Admin not assigned to any university");
    }

    // Parse query parameters
    const statusFilter = req.query.status as string | undefined;
    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    // Build filter criteria
    const filterCriteria: any = { universityId };
    if (statusFilter) {
        filterCriteria.status = statusFilter;
    }

    // Fetch orders and total count togeher
    const [orders, totalOrders] = await Promise.all([
        prisma.order.findMany({
            where: filterCriteria,
            include: {
                items: true,
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" },
            skip: skipItems,
            take: itemsPerPage,
        }),
        prisma.order.count({ where: filterCriteria }),
    ]);

    //get total pages
    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    return APIResponse.success(res, "Orders retrieved successfully", {
        items: orders.map(sanitizeOrder),
        page: currentPage,
        limit: itemsPerPage,
        total: totalOrders,
        totalPages,
    });
};

// Get orders assigned to a specific agent (manager only)
export const getOrdersByAgent = async (req: Request, res: Response, next: NextFunction) => {
    // Verify admin has a university assigned
    const universityId = req.admin?.universityId;
    if (!universityId) {
        throw APIError.Forbidden("Admin not assigned to any university");
    }

    const { agentId } = req.params;
    if (!agentId) {
        throw APIError.BadRequest("Agent ID is required");
    }

    // Verify agent belongs to same university
    const agent = await prisma.deliveryAgent.findUnique({
        where: { id: agentId },
        select: { id: true, name: true, universityId: true }
    });

    if (!agent) {
        throw APIError.NotFound("Agent not found");
    }

    if (agent.universityId !== universityId) {
        throw APIError.Forbidden("Agent does not belong to your university");
    }

    // Parse query parameters
    const statusFilter = req.query.status as string | undefined;
    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    // Build filter criteria
    const filterCriteria: any = { agentId, universityId };
    if (statusFilter) {
        filterCriteria.status = statusFilter;
    }

    // Fetch orders and total count together
    const [orders, totalOrders] = await Promise.all([
        prisma.order.findMany({
            where: filterCriteria,
            include: {
                items: true,
                user: {
                    select: { name: true, email: true, phoneNumber: true }
                }
            },
            orderBy: { createdAt: "desc" },
            skip: skipItems,
            take: itemsPerPage,
        }),
        prisma.order.count({ where: filterCriteria }),
    ]);

    //get total pages
    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    return APIResponse.success(res, "Agent orders retrieved successfully", {
        agent: {
            id: agent.id,
            name: agent.name
        },
        items: orders.map(sanitizeOrder),
        page: currentPage,
        limit: itemsPerPage,
        total: totalOrders,
        totalPages,
    });
};


//Get orders assigned to our delivery agent (confirm this from dev group)

export const getOrdersForAgent = async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.agent?.id;

    if (!agentId) {
        throw APIError.Unauthorized("Agent not authenticated");
    }

    const statusFilter = req.query.status as string | undefined;
    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    // Build filter criteria
    const filterCriteria: any = { agentId };
    if (statusFilter) {
        filterCriteria.status = statusFilter;
    }

    // Fetch orders and total count together
    const [orders, totalOrders] = await Promise.all([
        prisma.order.findMany({
            where: filterCriteria,
            include: {
                items: true,
                user: {
                    select: { name: true, email: true, phoneNumber: true }
                }
            },
            orderBy: { createdAt: "desc" },
            skip: skipItems,
            take: itemsPerPage,
        }),
        prisma.order.count({ where: filterCriteria }),
    ]);

    //get total pages
    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    return APIResponse.success(res, "Orders retrieved successfully", {
        items: orders.map(sanitizeOrder),
        page: currentPage,
        limit: itemsPerPage,
        total: totalOrders,
        totalPages,
    });
};

// Get orders for agent filtered by today's fulfillment date
export const getTodayOrdersForAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.admin?.id;

    if (!adminId) {
        throw APIError.Unauthorized("Admin not authenticated");
    }

    // Get today's date range (start of day to end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const statusFilter = req.query.status as string | undefined;
    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    // Build filter criteria
    const filterCriteria: any = {
        adminId,
        fulfillmentDate: {
            gte: today,
            lt: tomorrow
        }
    };
    
    if (statusFilter) {
        filterCriteria.status = statusFilter;
    }

    // Fetch orders and total count together
    const [orders, totalOrders] = await Promise.all([
        prisma.order.findMany({
            where: filterCriteria,
            include: {
                items: true,
                user: {
                    select: { name: true, email: true, phoneNumber: true }
                }
            },
            orderBy: [
                { fulfillmentDate: "asc" },
                { timeSlot: "asc" }
            ],
            skip: skipItems,
            take: itemsPerPage,
        }),
        prisma.order.count({ where: filterCriteria }),
    ]);

    //get total pages
    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    return APIResponse.success(res, "Today's orders retrieved successfully", {
        items: orders.map(sanitizeOrder),
        date: today.toISOString().split('T')[0],
        page: currentPage,
        limit: itemsPerPage,
        total: totalOrders,
        totalPages,
    });
};

// Initialize payment for rescheduling fee
export const initializeReschedulePayment = async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
        throw APIError.Unauthorized("User not authenticated");
    }

    if (!orderId) {
        throw APIError.BadRequest("Order ID is required");
    }

    // Find the order
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId }
    });

    if (!order) {
        throw APIError.NotFound("Order not found");
    }

    // Check if order can be rescheduled
    if (order.status === "completed" || order.status === "cancelled") {
        throw APIError.BadRequest("Cannot reschedule completed or cancelled orders");
    }

    if (!order.slotExpired) {
        throw APIError.BadRequest("Order time slot has not expired yet");
    }

    // Get rescheduling fee from config
    const reschedulingFeeConfig = await prisma.config.findUnique({
        where: { key: "rescheduling_fee" }
    });
    const reschedulingFee = reschedulingFeeConfig ? parseFloat(reschedulingFeeConfig.value) : 100;

    // Generate unique payment reference for rescheduling
    const paymentReference = `RESCHEDULE_${orderId}_${Date.now()}`;

    // Initialize payment with Paystack
    const paymentInit = await initializePayment({
        email: userEmail,
        amount: nairaToKobo(reschedulingFee),
        reference: paymentReference,
        metadata: {
            orderId,
            userId,
            type: "rescheduling",
        },
    });

    return APIResponse.success(
        res,
        "Rescheduling payment initialized successfully",
        {
            authorizationUrl: paymentInit.data.authorization_url,
            reference: paymentInit.data.reference,
            amount: reschedulingFee,
            orderId,
        }
    );
};

// Reschedule order after time slot expiry with rescheduling fee payment
export const rescheduleOrder = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = RescheduleOrderSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
        throw APIError.Unauthorized("User not authenticated");
    }

    // Find the order
    const order = await prisma.order.findFirst({
        where: { id: validatedData.orderId, userId },
        include: { items: true }
    });

    if (!order) {
        throw APIError.NotFound("Order not found");
    }

    // Check if order can be rescheduled
    if (order.status === "completed" || order.status === "cancelled") {
        throw APIError.BadRequest("Cannot reschedule completed or cancelled orders");
    }

    if (!order.slotExpired) {
        throw APIError.BadRequest("Order time slot has not expired yet");
    }

    // Get rescheduling fee from config
    const reschedulingFeeConfig = await prisma.config.findUnique({
        where: { key: "rescheduling_fee" }
    });
    const reschedulingFee = reschedulingFeeConfig ? parseFloat(reschedulingFeeConfig.value) : 100;

    // Verify payment with Paystack
    const paymentVerification = await verifyPaystackPayment(validatedData.paymentReference);

    if (!paymentVerification.status || paymentVerification.data.status !== "success") {
        throw APIError.BadRequest("Payment verification failed");
    }

    const paidAmount = koboToNaira(paymentVerification.data.amount);
    if (paidAmount < reschedulingFee) {
        throw APIError.BadRequest(`Insufficient payment. Rescheduling fee is ₦${reschedulingFee}`);
    }

    // Validate new time slot based on fulfillment type
    const timeSlotsConfigKey = order.fulfillmentType === "pickup" ? "pickup_time_slots" : "delivery_time_slots";
    const timeSlotsConfig = await prisma.config.findUnique({
        where: { key: timeSlotsConfigKey }
    });
    const availableSlots = timeSlotsConfig ? JSON.parse(timeSlotsConfig.value) : [];
    
    if (!availableSlots.includes(validatedData.newTimeSlot)) {
        throw APIError.BadRequest(`Invalid time slot selected for ${order.fulfillmentType}`);
    }

    // Update order with new time slot and reset expiry
    const updatedOrder = await prisma.order.update({
        where: { id: validatedData.orderId },
        data: {
            timeSlot: validatedData.newTimeSlot,
            slotExpired: false,
            slotExpiredAt: null,
            rescheduledCount: { increment: 1 },
            lastRescheduledAt: new Date(),
            reschedulingFee: { increment: reschedulingFee },
        },
        include: { items: true }
    });

    return APIResponse.success(
        res,
        "Order rescheduled successfully",
        sanitizeOrder(updatedOrder)
    );
};

// Get available time slots from config based on fulfillment type
export const getAvailableTimeSlots = async (req: Request, res: Response, next: NextFunction) => {
    const fulfillmentType = req.query.fulfillmentType as string;

    if (!fulfillmentType || !["pickup", "delivery"].includes(fulfillmentType)) {
        throw APIError.BadRequest("Valid fulfillment type (pickup or delivery) is required");
    }

    const configKey = fulfillmentType === "pickup" ? "pickup_time_slots" : "delivery_time_slots";
    const timeSlotsConfig = await prisma.config.findUnique({
        where: { key: configKey }
    });

    const defaultSlots = fulfillmentType === "pickup" 
        ? ["9:00 AM - 11:00 AM", "1:00 PM - 5:00 PM"]
        : [
            "8:00 AM - 9:00 AM", "9:00 AM - 10:00 AM", "10:00 AM - 11:00 AM",
            "11:00 AM - 12:00 PM", "12:00 PM - 1:00 PM", "1:00 PM - 2:00 PM",
            "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM", "5:00 PM - 6:00 PM"
        ];

    const availableSlots = timeSlotsConfig ? JSON.parse(timeSlotsConfig.value) : defaultSlots;

    return APIResponse.success(
        res,
        "Available time slots retrieved successfully",
        { 
            fulfillmentType,
            timeSlots: availableSlots 
        }
    );
};

// Manual trigger for expiring order slots in case i need to test
export const expireOrderSlots = async (req: Request, res: Response, next: NextFunction) => {
    const { expireOrderSlotsJob } = await import("../../jobs/expireOrderSlots.job");
    
    const result = await expireOrderSlotsJob();

    return APIResponse.success(
        res,
        "Order slots expiration check completed",
        result
    );
};

// Manual trigger for sending order reminders
export const sendOrderReminders = async (req: Request, res: Response, next: NextFunction) => {    
    const result = await sendOrderRemindersJob();

    return APIResponse.success(
        res,
        "Order reminders check completed",
        result
    );
};

// Manual trigger for generating daily reports (for testing)
export const generateDailyReports = async (req: Request, res: Response, next: NextFunction) => {
    const { generateDailyReportsJob } = await import("../../jobs/generateDailyReports.job");
    const result = await generateDailyReportsJob();

    return APIResponse.success(
        res,
        "Daily reports generation completed",
        result
    );
};

// Manual trigger for generating weekly reports (for testing)
export const generateWeeklyReports = async (req: Request, res: Response, next: NextFunction) => {
    const { generateWeeklyReportsJob } = await import("../../jobs/generateWeeklyReports.job");
    const result = await generateWeeklyReportsJob();

    return APIResponse.success(
        res,
        "Weekly reports generation completed",
        result
    );
};

// Manual trigger for generating monthly reports (for testing)
export const generateMonthlyReports = async (req: Request, res: Response, next: NextFunction) => {
    const { generateMonthlyReportsJob } = await import("../../jobs/generateMonthlyReports.job");
    const result = await generateMonthlyReportsJob();

    return APIResponse.success(
        res,
        "Monthly reports generation completed",
        result
    );
};
