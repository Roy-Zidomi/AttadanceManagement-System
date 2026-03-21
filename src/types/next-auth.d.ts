import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: Role | string;
    employeeId?: string | null;
    department?: string | null;
  }

  interface Session {
    user: User & {
      id: string;
      role: Role | string;
      employeeId?: string | null;
      department?: string | null;
    };
  }
}
