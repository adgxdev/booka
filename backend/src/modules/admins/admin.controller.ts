import jwt from "jsonwebtoken";
import prisma from "../../packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import { validateRegistrationData } from "../../utils/auth-helper";

//Create admin
export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "admin");
        const {name, email, password, phone_number, university} = req.body;

        const existingAdmin = await prisma.admin.findUnique({
            where: {email}
        });

        if(existingAdmin){
            return res.status(400).json({message: "Admin with this email already exists"});
        }

        if(!existingAdmin){
            const newAdmin = await prisma.admin.create({
                data: {
                    name,
                    email,
                    password,
                    phone_number,
                    university
                }
            });

            return res.status(201).json({message: "Admin created successfully", admin: newAdmin});
        }
    } catch (error) {
        next(error);
    }
}