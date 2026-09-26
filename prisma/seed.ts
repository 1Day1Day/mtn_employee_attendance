import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const passwordHash = await bcrypt.hash("changeme123", 12);

  await prisma.user.upsert({
    where: { staffId: "00001" },
    update: {},
    create: {
      fullName: "Branch Admin",
      staffId: "00001",
      personType: "STAFF",
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
    },
  });

  console.log("Seeded. First admin: staff ID 00001 / password changeme123 — change this immediately.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
