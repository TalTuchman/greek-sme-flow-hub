
import * as z from "zod";

export const bookingSchema = z.object({
  customer_id: z.string({ required_error: "Please select a customer."}).uuid({ message: "Please select a valid customer."}),
  service_id: z.string({ required_error: "Please select a service."}).uuid({ message: "Please select a valid service."}),
  staff_id: z.string().uuid("Invalid staff member.").optional().nullable(),
  booking_time: z.string().min(1, "A valid booking date and time is required.").refine((val) => !isNaN(Date.parse(val)), {
    message: "A valid booking date and time is required.",
  }),
  status: z.enum(["scheduled", "completed", "cancelled"], { required_error: "Please select a status."}),
  notes: z.string().optional().nullable(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
