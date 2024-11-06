import { ZodType, z } from 'zod';

export class TripValidation {
  static readonly FILTERED: ZodType = z.object({
    startDateTime: z.string().optional(),
    endDateTime: z.string().optional(),
    minFare: z.number().optional(),
    maxFare: z.number().optional(),
    minDistance: z.number().optional(),
    maxDistance: z.number().optional(),
    paymentType: z.string().optional(),
  })
}
