"use server";
import { cookies } from "next/headers";

export async function storeUser(userId: string) {
    const cookieStore = await cookies();

    // 12 days in milliseconds → 12 * 24 * 60 * 60 * 1000
    const twelveDays = 12 * 24 * 60 * 60 * 1000;

    cookieStore.set("userId", userId, {
        secure: process.env.NODE_ENV === "production", // ✅ only secure in prod,
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(Date.now() + twelveDays),
    });
}

export async function getUser() {
    const cookieStore = await cookies();
    const user = cookieStore.get("userId")?.value;
    return user || null;
}