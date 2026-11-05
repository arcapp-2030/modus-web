import 'dotenv/config'; // <-- ESSencial para carregar o .env antes de tudo
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERRO: A variável DATABASE_URL não foi encontrada no ambiente.');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@modus.com' },
    update: {},
    create: {
      name: 'Administrador Modus',
      email: 'admin@modus.com',
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Usuário criado com sucesso:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });