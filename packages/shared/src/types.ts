import { z } from 'zod';

/** The four supported POS platforms plus a manual-import escape hatch. */
export const PosSource = z.enum(['Toast', 'Heartland', 'Square', 'Clover', 'Manual']);
export type PosSource = z.infer<typeof PosSource>;

/** Standardized payment types used for QuickBooks clearing-account mapping. */
export const PaymentMethod = z.enum([
  'Credit_Visa',
  'Credit_MC',
  'Credit_Amex',
  'Credit_Discover',
  'Cash',
  'Gift_Card',
  'Other',
]);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

export const Modifier = z.object({
  name: z.string().min(1),
  price: z.number().finite(),
});
export type Modifier = z.infer<typeof Modifier>;

/**
 * The system-agnostic data contract of the Expo Proxy suite.
 * Every POS adapter flattens its native payload into this shape;
 * every downstream app (Dashboard, EchoLink, StaffWise, budget engine,
 * QuickBooks export) consumes ONLY this shape.
 */
export const NormalizedTransaction = z.object({
  transaction_id: z.string().min(1),
  source_pos: PosSource,
  business_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timestamp: z.string().datetime(),
  gross_sales: z.number().nonnegative(),
  net_sales: z.number().nonnegative(),
  discounts_applied: z.number().nonnegative(),
  adjustments: z.number(),
  taxes_collected: z.number().nonnegative(),
  tips: z.number().nonnegative(),
  payment_method: PaymentMethod,
  auth_code: z.string().default('N/A'),
  customer_id: z.string().default(''),
  modifiers_json: z.array(Modifier).default([]),
  /** Optional zip/postal metadata for the closed-loop marketing engine. */
  postal_code: z.string().optional(),
  /** Promotional tracking code, if the sale redeemed a campaign coupon. */
  promo_code: z.string().optional(),
  /**
   * RESERVED for multi-tenancy (ADR-001). Optional and unused in the
   * deployment-per-restaurant model; reserving it now keeps the future
   * shared-infrastructure migration from being a breaking contract change.
   * Not part of the canonical CSV until the migration is executed.
   */
  tenant_id: z.string().optional(),
});
export type NormalizedTransaction = z.infer<typeof NormalizedTransaction>;

/** A check split instruction: a fraction of a parent ticket. */
export const SplitSpec = z.object({
  /** e.g. 1 for the "-1" sub-ticket suffix */
  index: z.number().int().positive(),
  /** Fraction of the parent ticket allocated to this sub-check (0, 1]. */
  fraction: z.number().gt(0).lte(1),
  /** Seat number when the split mode is by-seat. */
  seat: z.number().int().positive().optional(),
});
export type SplitSpec = z.infer<typeof SplitSpec>;

/** Identity attached to every authenticated request in every app. */
export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  hostedDomain?: string;
}
