import express, { Router } from "express";
import { createWaitlist } from "./waitlist.controller";

const router: Router = express.Router();

router.post("/join", createWaitlist);

export default router;