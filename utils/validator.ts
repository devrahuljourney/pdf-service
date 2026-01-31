import { z } from 'zod';

const EmailRecipientSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

const BookingDataSchema = z.object({
  voucherNumber: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email().nullable(),
  customerPhone: z.string(),
  tourTitle: z.string(),
  destination: z.string().nullable(),
  departureDate: z.string(),
  endDate: z.string(),
  paxAdults: z.number(),
  paxChildren: z.number(),
  paxInfants: z.number(),
  totalAmount: z.number(),
  agencyName: z.string(),
  agencyPhone: z.string(),
  agencyEmail: z.string().email().nullable().optional(),
  agentName: z.string().nullable().optional(),
  specialRequests: z.string().nullable().optional(),
  inclusions: z.array(z.string()).nullable().optional(),
  itinerary: z.array(z.any()).nullable().optional(),
  nightAllocations: z.array(z.any()).nullable().optional(),
  travelers: z.array(z.any()).optional(),
  paymentInfo: z.any().optional(),
  bannerImageUrl: z.string().nullable().optional(),
  brandTag: z.string().nullable().optional(),
  includeTcs: z.boolean().optional(),
  flightIncluded: z.boolean().nullable().optional(),
  departureAirport: z.string().nullable().optional(),
  flightDetails: z.any().nullable().optional(),
});

const PDFRequestSchema = z.object({
  type: z.enum(['booking-voucher', 'quote', 'invoice']),
  data: BookingDataSchema,
  recipients: z.object({
    customer: EmailRecipientSchema.optional(),
    agent: EmailRecipientSchema.optional(),
  }),
});

export function validatePDFRequest(data: unknown) {
  return PDFRequestSchema.parse(data);
}
