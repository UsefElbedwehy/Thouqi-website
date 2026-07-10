import { z } from "zod";
import { PAYMENT_METHODS } from "./types";

/**
 * Checkout validation schema (shared by the server action and, optionally, the
 * client). Field errors map to `checkout.*` message keys in the UI.
 */
export const checkoutSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(6),
  fullName: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional().default(""),
  city: z.string().min(2),
  area: z.string().optional().default(""),
  countryCode: z.string().min(2).default("KW"),
  shippingMethodId: z.enum(["standard", "express"]),
  paymentMethod: z.enum(PAYMENT_METHODS),
  locale: z.string().optional().default("ar"),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        name: z.record(z.string(), z.string()),
        price: z.number().int().nonnegative(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
