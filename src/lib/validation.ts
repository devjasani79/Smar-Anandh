import { z } from 'zod';

export const FamilyMemberSchema = z.object({
  name: z.string().min(1, 'Name required').max(100).trim(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number'),
  relationship: z.enum(['son', 'daughter', 'grandson', 'granddaughter', 'spouse', 'brother', 'sister', 'friend', 'guardian', 'doctor']),
  is_emergency_contact: z.boolean().default(false),
});

export const MedicationLogSchema = z.object({
  senior_id: z.string().uuid(),
  medication_id: z.string().uuid(),
  scheduled_time: z.coerce.date(),
  status: z.enum(['pending', 'taken', 'missed', 'rescheduled']),
});

export const PinSchema = z.string().regex(/^\d{4}$/, 'PIN must be 4 digits');

export const PhoneSchema = z.string().min(10, 'Phone number too short').max(15, 'Phone number too long');
