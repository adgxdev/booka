import express, { Router } from "express";
import { createAdmin } from "./admin.controller";

const router:Router = express.Router();

router.post("/create-admin", createAdmin);

export default router;