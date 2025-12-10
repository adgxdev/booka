import { z } from "zod";

export interface SafeDeliveryAgent {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  universityId: string;
  assignedZones: string[];
  totalCommissions: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentJwtPayload {
  id: string;
  universityId: string;
}

export const SignupAgentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  universityId: z.string().uuid("Invalid university ID"),
  studentIdUrl: z.string().url("Invalid student ID image URL"),
  ninSlipUrl: z.string().url("Invalid NIN slip image URL"),
  idempotencyKey: z.string().min(10, "Idempotency key required"),
});

export type SignupAgentInput = z.infer<typeof SignupAgentSchema>;

export const LoginAgentSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginAgentInput = z.infer<typeof LoginAgentSchema>;

export const ApproveAgentSchema = z.object({
  agentId: z.string().uuid("Invalid agent ID"),
  status: z.enum(["approved", "rejected"]),
});

export type ApproveAgentInput = z.infer<typeof ApproveAgentSchema>;

export const AssignZonesSchema = z.object({
  agentId: z.string().uuid("Invalid agent ID"),
  zones: z.array(z.string().min(1, "Zone name cannot be empty")).min(1, "At least one zone is required"),
});

export type AssignZonesInput = z.infer<typeof AssignZonesSchema>;
