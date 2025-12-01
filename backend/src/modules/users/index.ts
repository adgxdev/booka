import express, { Router } from "express";
import { changeUserPassword, getPersonalUserInfo, loginUser, logoutUser, refreshUserToken, signupUser, updatePersonalUserInfo } from "./users.controller";
import { isUserAuthenticated } from "../../middlewares/isAuthenticated";

const router: Router = express.Router();

router.post("/signup-user", signupUser);
router.post("/login-user", loginUser);
router.post("/change-user-password", isUserAuthenticated, changeUserPassword);
router.post("/refresh-user-token", refreshUserToken);
router.get("/logout-user", logoutUser);
router.put("/update-personal-user-info", isUserAuthenticated, updatePersonalUserInfo);
router.get("/get-personal-user-info", isUserAuthenticated, getPersonalUserInfo);

export default router;