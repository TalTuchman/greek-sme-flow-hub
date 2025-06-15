
import * as z from "zod";

export const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number.").optional().nullable(),
  duration: z.coerce.number().min(0, "Duration must be a positive integer.").int().optional().nullable(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
