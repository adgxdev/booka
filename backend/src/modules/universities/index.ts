import express, { Router } from "express";
import { assignAdminToUniversity, changeUniversityAdmin, createUniversity, deleteUniversity, deleteUniversityLogo, editUniversity, getUniversities, getUniversityAdmin, getUniversityById, removeUniversityAdmin, uploadUniversityLogo } from "./universities.controller";
import { isSuperAuthenticated } from "../../middlewares/isAuthenticated";

const router: Router = express.Router();

router.post("/upload-university-logo", isSuperAuthenticated, uploadUniversityLogo);
router.delete("/delete-university-logo", isSuperAuthenticated, deleteUniversityLogo);
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