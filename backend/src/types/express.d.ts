import 'express';
import { SafeAdmin } from "../modules/admins/admin.type";
import { SafeDeliveryAgent } from "../modules/agents/agent.type";

declare module 'express-serve-static-core' {
  interface Request {
    admin?: SafeAdmin;
    role?: SafeAdmin['role'];
    university?: { id: string; name: string };
    id?: string;
    user?: { id: string; name: string; email: string; universityId: string };
    agent?: SafeDeliveryAgent;
  }
}
