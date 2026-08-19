import { Prisma } from '../../../generated/prisma/index.js';

export const SafeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof SafeUserSelect }>;
