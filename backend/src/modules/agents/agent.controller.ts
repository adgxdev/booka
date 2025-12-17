import jwt from "jsonwebtoken";
import prisma from "../../configs/prisma";
import { NextFunction, Request, Response } from "express";
import { sendCustomEmail, getAgentSignupEmail, getAgentApprovalEmail } from '../../utils/send-email';
import bcrypt from "bcryptjs";
import { setCookie } from "../../utils/cookies/setCookies";
import { clearAuthCookies } from "../../utils/cookies/clearAuthCookies";
import { SignupAgentSchema, LoginAgentSchema, ApproveAgentSchema, AssignZonesSchema, AgentJwtPayload } from "./agent.type";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";

/**
 * Agent signup with idempotency, max agents check, and image uploads
 */
export const signupAgent = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = SignupAgentSchema.parse(req.body);
    const { name, email, phoneNumber, password, universityId, studentIdUrl, ninSlipUrl, idempotencyKey } = validatedData;

    // Check for existing agent with same email
    const existingAgent = await prisma.deliveryAgent.findUnique({
        where: { email }
    });

    if (existingAgent) {
        throw APIError.BadRequest("Agent with this email already exists");
    }

    // Check for duplicate signup with idempotency key
    const existingIdempotency = await prisma.deliveryAgent.findUnique({
        where: { idempotencyKey }
    });

    if (existingIdempotency) {
        return APIResponse.success(
            res,
            "Agent signup already processed",
            {
                agent: {
                    id: existingIdempotency.id,
                    name: existingIdempotency.name,
                    email: existingIdempotency.email,
                    status: existingIdempotency.status
                }
            }
        );
    }

    // Check university exists
    const university = await prisma.university.findUnique({
        where: { id: universityId }
    });

    if (!university) {
        throw APIError.NotFound("University not found");
    }

    // Check if university has reached max agents
    if (university.signedUpAgentsCount >= university.maxAgents) {
        throw APIError.BadRequest(`Maximum number of agents (${university.maxAgents}) reached for this university`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agent and increment university count in transaction
    const agent = await prisma.$transaction(async (tx: any) => {
        const newAgent = await tx.deliveryAgent.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                universityId,
                studentIdUrl,
                ninSlipUrl,
                idempotencyKey,
                status: "pending",
            }
        });

        // Increment the signed-up agents count
        await tx.university.update({
            where: { id: universityId },
            data: {
                signedUpAgentsCount: {
                    increment: 1
                }
            }
        });

        return newAgent;
    });

    // Get agent app URL from config
    const agentAppConfig = await prisma.config.findUnique({
        where: { key: "agent_app_url" }
    });
    const agentAppUrl = agentAppConfig?.value || "https://test.app.com";

    // Send signup email
    try {
        const emailContent = getAgentSignupEmail({ full_name: name, email, password, agentAppUrl });
        await sendCustomEmail({ to: email, ...emailContent });
    } catch (err) {
        console.error('Failed to send agent signup email:', err);
    }

    return APIResponse.success(
        res,
        "Agent signup successful. Your application is pending approval.",
        {
            agent: {
                id: agent.id,
                name: agent.name,
                email: agent.email,
                phoneNumber: agent.phoneNumber,
                status: agent.status,
                universityId: agent.universityId,
                createdAt: agent.createdAt
            }
        },
        201
    );
};

//Agent login - only approved agents can login

export const loginAgent = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = LoginAgentSchema.parse(req.body);
    const { email, password } = validatedData;

    const agent = await prisma.deliveryAgent.findUnique({ where: { email } });

    if (!agent) {
        throw APIError.NotFound("Agent does not exist");
    }

    // Check if agent is approved
    if (agent.status !== "approved") {
        throw APIError.Forbidden("Your account is pending approval. Please wait for admin approval.");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
        throw APIError.BadRequest("Invalid email or password");
    }

    // Clear all auth cookies before setting new ones
    clearAuthCookies(res);

    const accessToken = jwt.sign(
        {
            id: agent.id,
            universityId: agent.universityId
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        {
            id: agent.id,
            universityId: agent.universityId
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "7d" }
    );

    setCookie(res, "agentAccessToken", accessToken);
    setCookie(res, "agentRefreshToken", refreshToken);

    const loggedInAgentDetails = {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phoneNumber: agent.phoneNumber,
        universityId: agent.universityId,
        status: agent.status
    };

    return APIResponse.success(res, "Login successful", { agent: loggedInAgentDetails }, 200);
};

//Refresh agent token

export const refreshAgentToken = async (req: Request, res: Response, next: NextFunction) => {
    const presentedToken = req.cookies["agentRefreshToken"] || req.body.refreshToken;
    if (!presentedToken) {
        throw APIError.Unauthorized("Refresh token missing");
    }

    let decoded: AgentJwtPayload;
    try {
        decoded = jwt.verify(presentedToken, process.env.REFRESH_TOKEN_SECRET!) as AgentJwtPayload;
    } catch (err) {
        throw APIError.Unauthorized("Invalid or expired refresh token");
    }

    if (!decoded.id || !decoded.universityId) {
        throw APIError.Unauthorized("Malformed refresh token");
    }

    const agent = await prisma.deliveryAgent.findUnique({ where: { id: decoded.id } });
    if (!agent) {
        throw APIError.NotFound("Agent not found");
    }

    if (agent.status !== "approved") {
        throw APIError.Forbidden("Your account is no longer approved");
    }

    const newAccessToken = jwt.sign(
        { id: agent.id, universityId: agent.universityId },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" }
    );

    setCookie(res, "agentAccessToken", newAccessToken);

    return APIResponse.success(res, "Agent access token refreshed", { universityId: agent.universityId }, 200);
};

//Logout agent
export const logoutAgent = async (req: Request, res: Response, next: NextFunction) => {
    clearAuthCookies(res);
    return APIResponse.success(res, "Logged out successfully");
};

/**
 * Approve or reject agent (Super Admin only)
 */
export const approveAgent = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = ApproveAgentSchema.parse(req.body);
    const { agentId, status } = validatedData;

    const agent = await prisma.deliveryAgent.findUnique({
        where: { id: agentId }
    });

    if (!agent) {
        throw APIError.NotFound("Agent not found");
    }

    if (agent.status === status) {
        throw APIError.BadRequest(`Agent is already ${status}`);
    }

    // Update agent status
    const updatedAgent = await prisma.deliveryAgent.update({
        where: { id: agentId },
        data: { status }
    });

    // Send approval email if approved
    if (status === "approved") {
        const agentAppConfig = await prisma.config.findUnique({
            where: { key: "agent_app_url" }
        });
        const agentAppUrl = agentAppConfig?.value || "https://test.app.com";

        try {
            const emailContent = getAgentApprovalEmail({ full_name: agent.name, agentAppUrl });
            await sendCustomEmail({ to: agent.email, ...emailContent });
        } catch (err) {
            console.error('Failed to send agent approval email:', err);
        }
    }

    return APIResponse.success(
        res,
        `Agent ${status} successfully`,
        {
            agent: {
                id: updatedAgent.id,
                name: updatedAgent.name,
                email: updatedAgent.email,
                status: updatedAgent.status,
                universityId: updatedAgent.universityId
            }
        }
    );
};


export const getAllAgents = async (req: Request, res: Response, next: NextFunction) => {
    // Parse query parameters
    const statusFilter = req.query.status as string | undefined;
    const universityIdFilter = req.query.universityId as string | undefined;
    const currentPage = parseInt(req.query.page as string) || 1;
    const itemsPerPage = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skipItems = (currentPage - 1) * itemsPerPage;

    // Build filter criteria
    const filterCriteria: any = {};
    if (statusFilter) {
        filterCriteria.status = statusFilter;
    }
    if (universityIdFilter) {
        filterCriteria.universityId = universityIdFilter;
    }

    // Fetch agents and total count together
    const [agents, totalAgents] = await Promise.all([
        prisma.deliveryAgent.findMany({
            where: filterCriteria,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                universityId: true,
                university: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                status: true,
                studentIdUrl: true,
                ninSlipUrl: true,
                assignedZones: true,
                totalCommissions: true,
                pendingOrdersCount: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: "desc" },
            skip: skipItems,
            take: itemsPerPage,
        }),
        prisma.deliveryAgent.count({ where: filterCriteria }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalAgents / itemsPerPage);

    return APIResponse.success(res, "Agents retrieved successfully", {
        agents,
        page: currentPage,
        limit: itemsPerPage,
        total: totalAgents,
        totalPages,
    });
};

//Get agent profile (authenticated agent only)

export const getAgentProfile = async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.agent?.id;

    if (!agentId) {
        throw APIError.Unauthorized("Agent not authenticated");
    }

    const agent = await prisma.deliveryAgent.findUnique({
        where: { id: agentId },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            universityId: true,
            university: {
                select: {
                    id: true,
                    name: true,
                    slug: true
                }
            },
            status: true,
            assignedZones: true,
            totalCommissions: true,
            pendingOrdersCount: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!agent) {
        throw APIError.NotFound("Agent not found");
    }

    return APIResponse.success(res, "Agent profile retrieved successfully", { agent }, 200);
};


export const assignZonesToAgent = async (req: Request, res: Response, next: NextFunction) => {
    const validatedData = AssignZonesSchema.parse(req.body);
    const { agentId, zones } = validatedData;

    const agent = await prisma.deliveryAgent.findUnique({
        where: { id: agentId }
    });

    if (!agent) {
        throw APIError.NotFound("Agent not found");
    }

    // Update agent's assigned zones
    const updatedAgent = await prisma.deliveryAgent.update({
        where: { id: agentId },
        data: { assignedZones: zones },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            universityId: true,
            university: {
                select: {
                    id: true,
                    name: true,
                    slug: true
                }
            },
            status: true,
            assignedZones: true,
            totalCommissions: true,
            pendingOrdersCount: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return APIResponse.success(
        res,
        "Zones assigned to agent successfully",
        { agent: updatedAgent }
    );
};


export const getUniversityAgents = async (req: Request, res: Response, next: NextFunction) => {
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

    // Fetch agents and total count together
    const [agents, totalAgents] = await Promise.all([
        prisma.deliveryAgent.findMany({
            where: filterCriteria,
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                universityId: true,
                university: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                status: true,
                assignedZones: true,
                totalCommissions: true,
                pendingOrdersCount: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: "desc" },
            skip: skipItems,
            take: itemsPerPage,
        }),
        prisma.deliveryAgent.count({ where: filterCriteria }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalAgents / itemsPerPage);

    return APIResponse.success(res, "University agents retrieved successfully", {
        agents,
        page: currentPage,
        limit: itemsPerPage,
        total: totalAgents,
        totalPages,
    });
};

/**
 * Get a specific agent by ID (Admin or Super Admin)
 * Regular admins can only view agents from their university
 * Super admins can view any agent
 */
export const getAgentById = async (req: Request, res: Response, next: NextFunction) => {
    const { agentId } = req.params;
    const adminUniversityId = req.admin?.universityId;
    const adminRole = req.admin?.role;

    const agent = await prisma.deliveryAgent.findUnique({
        where: { id: agentId },
        select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            universityId: true,
            university: {
                select: {
                    id: true,
                    name: true,
                    slug: true
                }
            },
            status: true,
            studentIdUrl: true,
            assignedZones: true,
            totalCommissions: true,
            pendingOrdersCount: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!agent) {
        throw APIError.NotFound("Agent not found");
    }

    // If not super admin, verify agent belongs to admin's university
    if (adminRole !== "super" && agent.universityId !== adminUniversityId) {
        throw APIError.Forbidden("You can only view agents from your university");
    }

    return APIResponse.success(res, "Agent retrieved successfully", { agent });
};
