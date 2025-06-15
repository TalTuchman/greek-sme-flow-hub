
import * as z from "zod";

export const staffSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters long."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  service_ids: z.array(z.string()).default([]),
  working_hours: z.string().optional().nullable().refine(
    (val) => {
      if (!val || val === "") return true;
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Working hours must be a valid JSON object." }
  ),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
