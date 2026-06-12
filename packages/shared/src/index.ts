import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterData = z.infer<typeof RegisterSchema>;

export const MeetingSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['processing', 'completed', 'error']),
  sourceType: z.enum(['audio', 'video', 'text']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Meeting = z.infer<typeof MeetingSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  meetingId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  owner: z.string().optional(), // User ID
  dueDate: z.string().datetime().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.string().datetime(),
});

export type Task = z.infer<typeof TaskSchema>;
