import express, { Router } from "express";
import { createAdmin, loginAdmin, updateAdminPassword } from "./admin.controller";

const router:Router = express.Router();

router.post("/create-admin", createAdmin);
router.post("/login-admin", loginAdmin)
router.post("/update-password", updateAdminPassword)

export default router;