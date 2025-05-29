import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        id: 'prod-1',
        name: 'Camiseta básica',
        description: 'Camiseta de algodón 100% orgánico',
        price: 19.99,
        stock: 50,
        image: 'https://example.com/camiseta.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
