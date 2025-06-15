
import * as z from "zod";

export const campaignFormSchema = z.object({
  name: z.string().min(1, "Campaign name is required."),
  communication_method: z.enum(["sms", "viber"], {
    required_error: "Please select a communication method.",
  }),
  message: z.string().min(1, "Message is required."),
  is_active: z.boolean().default(true),
  trigger_type: z.enum(
    ["specific_datetime", "before_booking", "after_booking", "after_last_booking"],
    {
      required_error: "Please select a trigger type.",
    }
  ),
  specific_datetime_value: z.string().optional(),
  relative_days_value: z.coerce.number().int("Days must be an integer.").positive("Days must be a positive number.").optional(),
  send_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)").optional().or(z.literal('')),
})
.superRefine(({ trigger_type, specific_datetime_value, relative_days_value }, ctx) => {
    if (trigger_type === 'specific_datetime' && (!specific_datetime_value || isNaN(Date.parse(specific_datetime_value)))) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "A specific date and time is required.",
            path: ["specific_datetime_value"],
        });
    }
    if (['before_booking', 'after_booking', 'after_last_booking'].includes(trigger_type) && (relative_days_value === undefined || relative_days_value === null)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Number of days is required.",
            path: ["relative_days_value"],
        });
    }
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
