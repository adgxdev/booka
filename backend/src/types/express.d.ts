import 'express';
import { SafeAdmin } from "../modules/admins/admin.type";

declare module 'express-serve-static-core' {
  interface Request {
    admin?: SafeAdmin;
    role?: SafeAdmin['role'];
  }
}
