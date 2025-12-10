import { z } from "zod";
import { Order, OrderItem } from "../../generated/prisma/client";

// Zod schemas for validation
export const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      bookId: z.string().uuid(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  fulfillmentType: z.enum(["delivery", "pickup"]),
  fulfillmentDate: z.string().datetime(),
  timeSlot: z.string().min(1, "Time slot is required"),
  deliveryAddress: z.string().optional(),
  pickupLocation: z.string().optional(),
  idempotencyKey: z.string().uuid(),
});

export const VerifyPaymentSchema = z.object({
  reference: z.string(),
});

export const RescheduleOrderSchema = z.object({
  orderId: z.string().uuid(),
  newTimeSlot: z.string().min(1, "Time slot is required"),
  paymentReference: z.string().min(1, "Payment reference is required"),
});

export const AssignAgentSchema = z.object({
  orderId: z.string().uuid(),
  agentId: z.string().uuid(),
});

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "purchased", "ready", "completed", "cancelled"]),
});

export const ScanQRCodeSchema = z.object({
  qrCode: z.string(),
});

// Type exports
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentSchema>;
export type RescheduleOrderInput = z.infer<typeof RescheduleOrderSchema>;
export type AssignAgentInput = z.infer<typeof AssignAgentSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
export type ScanQRCodeInput = z.infer<typeof ScanQRCodeSchema>;

// Safe types for responses
export type SafeOrder = Omit<Order, never> & {
  items?: SafeOrderItem[];
};

export type SafeOrderItem = Omit<OrderItem, never>;

// Sanitize function
export function sanitizeOrder(order: Order & { items?: OrderItem[] }): SafeOrder {
  return {
    ...order,
    items: order.items?.map((item: OrderItem) => ({ ...item })),
  };
}
