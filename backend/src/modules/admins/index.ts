import express, { Router } from "express";
import { createAdmin, loginAdmin } from "./admin.controller";

const router:Router = express.Router();

router.post("/create-admin", createAdmin);
router.post("/login-admin", loginAdmin)

export default router;