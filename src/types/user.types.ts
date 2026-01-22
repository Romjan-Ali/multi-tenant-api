import { Role } from "../generated/prisma/enums";

export interface CreateUserInput {
  email: string;
  password: string;
  role: Role;
  organizationId?: string;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: Role;
    organizationId: string;
  };
  token: string;
}