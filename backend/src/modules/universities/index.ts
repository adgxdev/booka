import express, { Router } from "express";
import { assignAdminToUniversity, changeUniversityAdmin, createUniversity, deleteUniversity, editUniversity, getUniversities, getUniversityAdmin, getUniversityById, removeUniversityAdmin } from "./universities.controller";
import { isSuperAuthenticated } from "../../middlewares/isAuthenticated";

const router: Router = express.Router();

router.post("/create-university", isSuperAuthenticated, createUniversity);
router.get("/get-universities", getUniversities);
router.get("/get-university/:id", getUniversityById);
router.put("/edit-university/:id", isSuperAuthenticated, editUniversity);
router.delete("/delete-university/:id", isSuperAuthenticated, deleteUniversity);
router.put("/change-university-admin", isSuperAuthenticated, changeUniversityAdmin);
router.put("/remove-university-admin", isSuperAuthenticated, removeUniversityAdmin);
router.get("/get-university-admin/:universityId", isSuperAuthenticated, getUniversityAdmin);
router.put("/assign-admin", isSuperAuthenticated, assignAdminToUniversity);

export default router;