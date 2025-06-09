import { z } from "zod";

// Type for the ActiveOfficer model
export type ActiveOfficer = {
  id: string;
  officerNumber: string;
  officerName: string;
  department: string;
  status: string;
  callsign: string | null;
  radioChannel: string | null;
  incident: string | null;
  notes: string | null;
  isTemporary: boolean;
};

// Schema for officer data
export const officerSchema = z.object({
  officerNumber: z.string().min(1, "Officer number is required"),
  officerName: z.string().min(1, "Officer name is required"),
  department: z.string().min(1, "Department is required"),
  status: z.string().min(1, "Status is required"),
  callsign: z.string().optional().nullable(),
  radioChannel: z.string().optional().nullable(),
  incident: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isTemporary: z.boolean().default(false),
});

// Export the schema type for components to use
export type OfficerFormData = z.infer<typeof officerSchema>; 