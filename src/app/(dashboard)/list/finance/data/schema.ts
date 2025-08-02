import { z } from "zod";

// We're keeping a simple non-relational schema here.
// A real app might be more complex and require a relational schema.

export const feeSchema = z.object({
  id: z.string(),
  amount: z.number(),
  dueDate: z.string(),
  status: z.enum(["PAID", "UNPAID", "OVERDUE"]),
  student: z.object({
    name: z.string(),
  }),
});

// Alias for compatibility with data-table-row-actions
export const taskSchema = feeSchema;

export type Fee = z.infer<typeof feeSchema>;