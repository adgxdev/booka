import express, { Router } from "express";
import { createAdmin, loginAdmin, resetAdminPassword, refreshAdminToken, logoutAdmin, updatePersonalAdminInfo, getPersonalAdminInfo } from "./admin.controller";
import { isAnyAdminAuthenticated, isSuperAuthenticated } from "../../middlewares/isAuthenticated";

const router: Router = express.Router();

router.post("/create", isSuperAuthenticated, createAdmin);
router.post("/login", loginAdmin);
router.post("/reset-password", isAnyAdminAuthenticated, resetAdminPassword);
router.post("/refresh-token", refreshAdminToken);
router.get("/logout", logoutAdmin);
router.put("/update-personal-info", isAnyAdminAuthenticated, updatePersonalAdminInfo);
router.get("/get-personal-info", isAnyAdminAuthenticated, getPersonalAdminInfo);

export default router;