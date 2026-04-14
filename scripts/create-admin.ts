import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

async function main() {
  const email = requireEnv("ADMIN_EMAIL").trim().toLowerCase();
  const password = requireEnv("ADMIN_PASSWORD");
  const employeeId = (process.env.ADMIN_EMPLOYEE_ID || "ADM-001").trim();
  const name = (process.env.ADMIN_NAME || "Admin").trim();
  const department = (process.env.ADMIN_DEPARTMENT || "Management").trim();

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    select: { id: true, email: true },
  });

  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await prisma.user.create({
    data: {
      employeeId,
      name,
      email,
      password: passwordHash,
      role: Role.ADMIN,
      department,
      isActive: true,
    },
    select: { id: true, email: true, employeeId: true },
  });

  console.log("Admin created:", created);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

