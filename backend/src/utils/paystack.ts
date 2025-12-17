import axios from "axios";
import { APIError } from "./APIError";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// Paystack types
export interface InitializePaymentParams {
  email: string;
  amount: number; // Amount in kobo
  reference: string;
  metadata?: Record<string, any>;
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    metadata?: Record<string, any>;
  };
}

//Initialize a payment with Paystack

export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  try {
    const response = await paystackClient.post<InitializePaymentResponse>(
      "/transaction/initialize",
      params
    );
    return response.data;
  } catch (error: any) {
    throw APIError.BadRequest(
      error.response?.data?.message || "Failed to initialize payment"
    );
  }
}

//Verify a payment transaction
export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  try {
    const response = await paystackClient.get<VerifyPaymentResponse>(
      `/transaction/verify/${reference}`
    );
    return response.data;
  } catch (error: any) {
    throw APIError.BadRequest(
      error.response?.data?.message || "Failed to verify payment"
    );
  }
}



export function generatePaymentReference(userId: string, idempotencyKey: string): string {
  const timestamp = Date.now();
  const shortKey = idempotencyKey.slice(0, 8);
  return `BOOKA_${userId.slice(0, 8)}_${timestamp}_${shortKey}`;
}


export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}


export function koboToNaira(kobo: number): number {
  return kobo / 100;
}
