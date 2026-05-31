/**
 * Validation schemas — Zod-based form validation for production checkout
 */
import { z } from "zod";

// ─── Helpers ───────────────────────────────────────────────

/** Bangladesh mobile number: 01[3-9]XXXXXXXX (11 digits) */
const bdPhoneRegex = /^01[3-9]\d{8}$/;

/** Strip HTML tags from user input */
export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/** Normalize phone: strip dashes, spaces, +880 prefix */
export function normalizePhone(raw: string): string {
  let phone = raw.replace(/[-\s()]/g, "");
  if (phone.startsWith("+880")) phone = "0" + phone.slice(4);
  if (phone.startsWith("880")) phone = "0" + phone.slice(3);
  return phone;
}

// ─── Checkout Step Schemas ─────────────────────────────────

export const step1Schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .transform(sanitize),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((v) => bdPhoneRegex.test(v), {
      message: "Enter a valid Bangladeshi phone number (e.g. 01712345678)",
    }),
  email: z
    .string()
    .email("Enter a valid email")
    .or(z.literal(""))
    .optional()
    .transform((v) => v || undefined),
});

export const step2Schema = z.object({
  district: z.string().min(1, "Select a district"),
  upazila: z.string().min(1, "Select an upazila / area"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(300, "Address is too long")
    .transform(sanitize),
  deliveryNote: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v ? sanitize(v) : undefined)),
});

export const step3Schema = z
  .object({
    payment: z.enum(["COD", "bKash", "Nagad", "Rocket"], {
      errorMap: () => ({ message: "Select a payment method" }),
    }),
    trxId: z
      .string()
      .min(4, "Transaction ID must be at least 4 characters")
      .max(50)
      .optional()
      .transform((v) => (v ? sanitize(v) : undefined)),
  })
  .refine(
    (data) => {
      // trxId required for mobile banking
      if (["bKash", "Nagad", "Rocket"].includes(data.payment)) {
        return !!data.trxId && data.trxId.length >= 4;
      }
      return true;
    },
    { message: "Transaction ID is required for mobile banking payments", path: ["trxId"] },
  );

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

// ─── Track Order Schema ────────────────────────────────────

export const trackOrderSchema = z.object({
  orderId: z
    .string()
    .min(1, "Enter your Order ID")
    .transform((v) => v.trim().toUpperCase()),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((v) => bdPhoneRegex.test(v), {
      message: "Enter a valid phone number",
    }),
});
