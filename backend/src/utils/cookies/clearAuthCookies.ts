import { Response } from "express";

/**
 * Clear all authentication cookies (admin, user, agent)
 */
export const clearAuthCookies = (res: Response) => {
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" as const : "lax" as const
    };

    // Clear admin cookies
    res.clearCookie("adminAccessToken", cookieOptions);
    res.clearCookie("adminRefreshToken", cookieOptions);

    // Clear user cookies
    res.clearCookie("userAccessToken", cookieOptions);
    res.clearCookie("userRefreshToken", cookieOptions);

    // Clear agent cookies
    res.clearCookie("agentAccessToken", cookieOptions);
    res.clearCookie("agentRefreshToken", cookieOptions);
};
