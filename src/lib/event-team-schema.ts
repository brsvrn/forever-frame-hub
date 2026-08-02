import { z } from "zod";
import { eventRoles } from "./event-permissions";

export const teamRoleSchema = z.enum(eventRoles).exclude(["owner"]);

export const createTeamInvitationSchema = z.object({
  invitationId: z.string().uuid(),
  invitedName: z.string().trim().max(120).optional(),
  invitedEmail: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  role: teamRoleSchema,
  message: z.string().trim().max(1000).optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

export const invitationTokenSchema = z.object({
  token: z
    .string()
    .min(32)
    .max(256)
    .regex(/^[A-Za-z0-9_-]+$/),
});

export const updateTeamMemberSchema = z.object({
  invitationId: z.string().uuid(),
  memberId: z.string().uuid(),
  role: teamRoleSchema,
});

export const removeTeamMemberSchema = z.object({
  invitationId: z.string().uuid(),
  memberId: z.string().uuid(),
});

export const revokeTeamInvitationSchema = z.object({
  invitationId: z.string().uuid(),
  invitationRecordId: z.string().uuid(),
});
