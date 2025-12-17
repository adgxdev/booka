import { Router } from "express";
import {
  getAllConfigs,
  getConfigByKey,
  updateConfig,
  initializeDefaultConfigs,
} from "./config.controller";
import { isAnyAdminAuthenticated, isSuperAuthenticated } from "../../middlewares/isAuthenticated";

const router = Router();

router.get("/get-all-configs", isAnyAdminAuthenticated, getAllConfigs);
router.get("/get-config/:key", isAnyAdminAuthenticated, getConfigByKey);
router.put("/update-config", isSuperAuthenticated, updateConfig);
router.post("/initialize-config", isSuperAuthenticated, initializeDefaultConfigs);

export default router;
