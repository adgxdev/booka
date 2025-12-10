import { Router } from "express";
import {
    signupAgent,
    loginAgent,
    logoutAgent,
    refreshAgentToken,
    approveAgent,
    getAllAgents,
    getAgentProfile,
    assignZonesToAgent,
    getUniversityAgents,
    getAgentById
} from "./agent.controller";
import { isAgentAuthenticated, isSuperAuthenticated, isAnyAdminAuthenticated, isManagerAuthenticated } from "../../middlewares/isAuthenticated";
import { scanQRCode } from "../orders/order.controller";

const router = Router();

// Public routes
router.post("/signup-agent", signupAgent);
router.post("/login-agent", loginAgent);
router.post("/refresh-agent-token", refreshAgentToken);

router.post("/logout-agent", isAgentAuthenticated, logoutAgent);
router.get("/get-agent-profile", isAgentAuthenticated, getAgentProfile);
router.post("/scan-qr-code", isAgentAuthenticated, scanQRCode);

// Admin routes (any admin - for their own university)
router.get("/university-agents", isManagerAuthenticated, getUniversityAgents);
router.get("/agent/:agentId", isAnyAdminAuthenticated, getAgentById);

// Super admin only routes
router.post("/approve-agent", isSuperAuthenticated, approveAgent);
router.post("/assign-zones", isSuperAuthenticated, assignZonesToAgent);
router.get("/get-all-agents", isSuperAuthenticated, getAllAgents);

export default router;
