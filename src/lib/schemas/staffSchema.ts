
import * as z from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM format

const dayHoursSchema = z.object({
    enabled: z.boolean(),
    start: z.string().regex(timeRegex, "Invalid time format, use HH:MM"),
    end: z.string().regex(timeRegex, "Invalid time format, use HH:MM"),
});

const workingHoursSchema = z.object({
    monday: dayHoursSchema,
    tuesday: dayHoursSchema,
    wednesday: dayHoursSchema,
    thursday: dayHoursSchema,
    friday: dayHoursSchema,
    saturday: dayHoursSchema,
    sunday: dayHoursSchema,
}).partial().optional().nullable();

export const staffSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters long."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  service_ids: z.array(z.string()).default([]),
  working_hours: workingHoursSchema,
});

export type StaffFormValues = z.infer<typeof staffSchema>;
