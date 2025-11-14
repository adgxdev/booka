import express, { Router } from "express";
import { createWaitlist, getSingleWaitlist } from "./waitlist.controller";

const router: Router = express.Router();

router.post("/join", createWaitlist);
router.get("/:id", getSingleWaitlist);

export default router;