import { NextFunction, Request, Response } from "express";
import prisma from "../../configs/prisma";
import { APIError } from "../../utils/APIError";
import { APIResponse } from "../../utils/APIResponse";
import { UploadBookDTO } from "./book.type";
import { imagekit } from "../../utils/imagekit";

//Upload image
export const uploadBookImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileName } = req.body
        // Extract mime type from base64 string
        const matches = fileName.match(/^data:(image\/[a-zA-Z0-9+]+);base64,/);
        const mimeType = matches ? matches[1] : "image/jpeg";
        const extension = mimeType.split("/")[1];
        console.log('uploadBookImage:', { mimeType, extension, fileName: fileName.slice(0, 30) });
        const response = await imagekit.upload({
            file: fileName,
            fileName: `book-${Date.now()}.${extension}`,
            folder: "/books",
        })
        res.status(201).json({
            file_url: response.url,
            file_name: response.fileId,
        })
    } catch (error) {
        console.error('uploadBookImage error:', error);
        next(error)
    }
}

//Delete Image
export const deleteBookImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.body
        const response = await imagekit.deleteFile(fileId)

        res.status(201).json({
            success: true,
            response
        })
    } catch (error) {
        console.error('deleteBookImage error:', error);
        next(error)
    }
}

export const createBook = async (req: Request, res: Response) => {
    const body = UploadBookDTO.parse(req.body);
    const { title, author, edition, price, quantity, lowAlert, imageUrl, imageFileId } = body;

    const adminId = req.admin?.id;
    if (!adminId) throw APIError.Unauthorized("Unauthorized");

    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { universityId: true } });
    if (!admin?.universityId) throw APIError.BadRequest("No university assigned to this admin");

    // Check for duplicate book (same title + edition within the same university)
    const existing = await prisma.book.findFirst({
        where: {
            universityId: admin.universityId,
            title: { equals: title, mode: 'insensitive' },
            ...(edition !== undefined
                ? { edition: { equals: edition, mode: 'insensitive' } }
                : { edition: null }),
        },
        select: { id: true },
    });
    if (existing) {
        throw APIError.BadRequest("Book already exists. Please update it instead.");
    }

    const newBook = await prisma.book.create({
        data: {
            title,
            author,
            edition,
            price,
            quantity,
            lowAlert,
            imageUrl,
            imageFileId,
            universityId: admin.universityId,
            adminId,
        },
    });

    APIResponse.success(res, "Book created successfully", { book: newBook }, 201);
};

export const updateBook = async (req: Request, res: Response) => {
    const body = UploadBookDTO.parse(req.body);
    const { title, author, edition, price, quantity, lowAlert, imageUrl } = body;

    const adminId = req.admin?.id;
    if (!adminId) throw APIError.Unauthorized("Unauthorized");

    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { universityId: true } });
    if (!admin?.universityId) throw APIError.BadRequest("No university assigned to this admin");

    const updatedBook = await prisma.book.update({
        where: { id: req.params.id },
        data: {
            title,
            author,
            edition,
            price,
            quantity,
            lowAlert,
            imageUrl,
            status: "draft",
            universityId: admin.universityId,
            adminId,
        }
    })

    APIResponse.success(res, "Book updated successfully", { book: updatedBook }, 200);
}

export const deleteBook = async (req: Request, res: Response) => {
    const adminId = req.admin?.id;
    if (!adminId) throw APIError.Unauthorized("Unauthorized");

    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { universityId: true } });
    if (!admin?.universityId) throw APIError.BadRequest("No university assigned to this admin");

    const bookId = req.params.id;

    const book = await prisma.book.findFirst({
        where: { id: bookId, universityId: admin.universityId },
        select: { id: true, imageFileId: true },
    });
    if (!book) throw APIError.NotFound("Book not found");

    // Attempt to delete remote image first if we have a fileId
    if (book.imageFileId) {
        await imagekit.deleteFile(book.imageFileId);
    }

    await prisma.book.delete({ where: { id: book.id } });

    APIResponse.success(res, "Book deleted successfully", { deleted: true }, 200);
}

export const getBooksForAdmin = async (req: Request, res: Response) => {
    const adminId = req.admin?.id;
    if (!adminId) throw APIError.Unauthorized("Unauthorized");

    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { universityId: true } });
    if (!admin?.universityId) throw APIError.BadRequest("No university assigned to this admin");

    const q = (req.query.q as string) || "";
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const sortParam = (req.query.sort as string) || "createdAt:desc";
    const [sortField, sortOrderRaw] = sortParam.split(":");
    const allowedSortFields = new Set(["createdAt", "title", "author", "price", "quantity"]);
    const field = allowedSortFields.has(sortField) ? sortField : "createdAt";
    const order = sortOrderRaw === "asc" ? "asc" : "desc";

    const where = {
        universityId: admin.universityId,
        ...(q
            ? {
                OR: [
                    { title: { contains: q, mode: "insensitive" as const } },
                    { author: { contains: q, mode: "insensitive" as const } },
                    { edition: { contains: q, mode: "insensitive" as const } },
                ],
            }
            : {}),
    };

    const [items, total] = await Promise.all([
        prisma.book.findMany({ where, orderBy: { [field]: order }, skip, take: limit }),
        prisma.book.count({ where }),
    ]);

    APIResponse.success(res, "Books retrieved successfully", {
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        sort: { field, order },
        query: q,
    }, 200);
}

export const getBooksForUser = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw APIError.Unauthorized("Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { universityId: true } });
    if (!user) throw APIError.NotFound("User not found");

    const q = (req.query.q as string) || "";
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const sortParam = (req.query.sort as string) || "createdAt:desc";
    const [sortField, sortOrderRaw] = sortParam.split(":");
    const allowedSortFields = new Set(["createdAt", "title", "author", "price", "quantity"]);
    const field = allowedSortFields.has(sortField) ? sortField : "createdAt";
    const order = sortOrderRaw === "asc" ? "asc" : "desc";

    const where = {
        universityId: user.universityId,
        status: "published" as const,
        ...(q
            ? {
                OR: [
                    { title: { contains: q, mode: "insensitive" as const } },
                    { author: { contains: q, mode: "insensitive" as const } },
                    { edition: { contains: q, mode: "insensitive" as const } },
                ],
            }
            : {}),
    };

    const [items, total] = await Promise.all([
        prisma.book.findMany({ where, orderBy: { [field]: order }, skip, take: limit }),
        prisma.book.count({ where }),
    ]);

    APIResponse.success(res, "Books retrieved successfully", {
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        sort: { field, order },
        query: q,
    }, 200);
}

export const getBookById = async (req: Request, res: Response) => {
    const bookId = req.params.id;
    const book = await prisma.book.findUnique({ where: { id: bookId, status: "published" } });
    if (!book) throw APIError.NotFound("Book not found");
    APIResponse.success(res, "Book retrieved successfully", { book }, 200);
}

export const getAdminBookById = async (req: Request, res: Response) => {
    const bookId = req.params.id;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw APIError.NotFound("Book not found");
    APIResponse.success(res, "Book retrieved successfully", { book }, 200);
}

export const getDraftBooks = async (req: Request, res: Response) => {
    const adminId = req.admin?.id;
    if (!adminId) throw APIError.Unauthorized("Unauthorized");

    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { universityId: true } });
    if (!admin?.universityId) throw APIError.BadRequest("No university assigned to this admin");

    const drafts = await prisma.book.findMany({
        where: { universityId: admin.universityId, status: "draft" },
        orderBy: { createdAt: "desc" },
    });
    APIResponse.success(res, "Drafts retrieved successfully", { drafts }, 200);
}

export const publishBook = async (req: Request, res: Response) => {
    const adminId = req.admin?.id;
    if (!adminId) throw APIError.Unauthorized("Unauthorized");

    const admin = await prisma.admin.findUnique({ where: { id: adminId }, select: { universityId: true } });
    if (!admin?.universityId) throw APIError.BadRequest("No university assigned to this admin");

    const book = await prisma.book.findFirst({
        where: { id: req.params.id, universityId: admin.universityId },
        select: { id: true },
    });
    if (!book) throw APIError.NotFound("Book not found");

    const publishedBook = await prisma.book.update({
        where: { id: book.id },
        data: { status: "published" },
    });
    APIResponse.success(res, "Book published successfully", { book: publishedBook }, 200);
}