import { logger } from "../utils/logger";
import { APIError } from "../utils/APIError";

//Ping server to keep it alive becaause of Render shutting down idle instances

export async function pingServerJob() {
    try {
        const pingTime = new Date().toISOString();
        
        logger.info(`Server ping - keeping instance alive at ${pingTime}`, {
            entity: 'system',
            type: 'system'
        });

    return {
        success: true,
        timestamp: pingTime
    };
    } catch (error) {
        throw APIError.from(error);
    }
}