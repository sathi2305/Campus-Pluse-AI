import { z } from 'zod';
export const createIssueSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(['Water','Electricity','Internet','Hostel','Transport','Food','Security','Cleanliness','Infrastructure','Academic','Laboratory','Library','Administration','Other']).optional(),
  subcategory: z.string().optional(),
  location: z.object({
    building: z.string().optional(),
    block: z.string().optional(),
    floor: z.string().optional(),
    room: z.string().optional(),
    campus: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional()
  }).optional(),
  impact: z.enum(['Only me','Few students','Class','Hostel block','Department','Multiple departments','Entire campus']).optional(),
  urgency: z.enum(['Low','Medium','High','Normal','Urgent','Critical']).optional(),
  anonymous: z.boolean().optional(),
  campusId: z.string().optional(),
  organizationId: z.string().optional()
});
export const updateStatusSchema = z.object({
  status: z.enum(['NEW','TRIAGED','ASSIGNED','IN_PROGRESS','WAITING','RESOLVED','CLOSED','REOPENED','REJECTED']),
  comment: z.string().optional()
});
