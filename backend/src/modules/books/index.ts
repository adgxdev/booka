import express, { Router } from "express";
import { createBook, deleteBook, deleteBookImage, getAdminBookById, getBookById, getBooksForAdmin, getBooksForUser, getDraftBooks, publishBook, updateBook, uploadBookImage } from "./book.controller";
import { isManagerAuthenticated, isOperatorAuthenticated, isUserAuthenticated } from "../../middlewares/isAuthenticated";

const router: Router = express.Router();

router.post("/upload-book-image", isManagerAuthenticated, uploadBookImage);
router.post("/delete-book-image", isManagerAuthenticated, deleteBookImage);
router.post("/create-book", isManagerAuthenticated, createBook);
router.put("/update-book/:id", isManagerAuthenticated, updateBook);
router.delete("/delete-book/:id", isManagerAuthenticated, deleteBook);
router.get("/get-books-admin", isManagerAuthenticated, getBooksForAdmin);
router.get("/get-books-user", isUserAuthenticated, getBooksForUser);
router.get("/get-book-admin/:id", isManagerAuthenticated, getAdminBookById);
router.get("/get-book-user/:id", isUserAuthenticated, getBookById);
router.get("/get-draft-books", isOperatorAuthenticated, getDraftBooks);
router.put("/publish-book/:id", isOperatorAuthenticated, publishBook);

export default router;
