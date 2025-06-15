
import * as z from "zod";

export const bookingSchema = z.object({
  customer_id: z.string().uuid("Please select a customer."),
  service_id: z.string().uuid("Please select a service."),
  booking_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A valid booking date and time is required.",
  }),
  status: z.enum(["scheduled", "completed", "cancelled"], { required_error: "Please select a status."}),
  notes: z.string().optional().nullable(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
