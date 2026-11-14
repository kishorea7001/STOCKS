import { PrismaClient, ActionType } from '@prisma/client';

const prisma = new PrismaClient();

const initialProducts = [
  {
    name: 'Basmati Rice',
    category: 'Grains & Staples',
    currentStock: 50.0,
    unit: 'kg',
    pricePerUnit: 95.0,
    initialTranscript: 'Initial inventory intake: 50 kg of Basmati Rice received.',
  },
  {
    name: 'Refined Sugar',
    category: 'Grains & Staples',
    currentStock: 40.0,
    unit: 'kg',
    pricePerUnit: 44.0,
    initialTranscript: 'Initial inventory intake: 40 kg of Refined Sugar received.',
  },
  {
    name: 'Sunflower Cooking Oil',
    category: 'Oils & Ghee',
    currentStock: 30.0,
    unit: 'liters',
    pricePerUnit: 140.0,
    initialTranscript: 'Initial inventory intake: 30 liters of Sunflower Cooking Oil received.',
  },
  {
    name: 'Toned Milk Packets',
    category: 'Dairy',
    currentStock: 25.0,
    unit: 'packets',
    pricePerUnit: 28.0,
    initialTranscript: 'Morning delivery: 25 packets of Toned Milk received.',
  },
  {
    name: 'Premium Tea Powder',
    category: 'Beverages',
    currentStock: 15.5,
    unit: 'kg',
    pricePerUnit: 450.0,
    initialTranscript: 'Stock replenishment: 15.5 kg of Premium Tea Powder.',
  },
  {
    name: 'Bathing Soap',
    category: 'Personal Care',
    currentStock: 60.0,
    unit: 'pieces',
    pricePerUnit: 35.0,
    initialTranscript: 'Received fresh carton of 60 Bathing Soap bars.',
  },
  {
    name: 'Marie Biscuits',
    category: 'Snacks & Bakery',
    currentStock: 45.0,
    unit: 'packets',
    pricePerUnit: 20.0,
    initialTranscript: 'Initial stock intake: 45 packets of Marie Biscuits.',
  },
  {
    name: 'Toor Dal',
    category: 'Pulses',
    currentStock: 35.5,
    unit: 'kg',
    pricePerUnit: 165.0,
    initialTranscript: 'Intake: 35.5 kg of premium Toor Dal.',
  },
  {
    name: 'Whole Wheat Flour (Atta)',
    category: 'Grains & Staples',
    currentStock: 80.0,
    unit: 'kg',
    pricePerUnit: 42.0,
    initialTranscript: 'Warehouse shipment: 80 kg of Whole Wheat Flour (Atta).',
  },
  {
    name: 'Washing Detergent Powder',
    category: 'Household',
    currentStock: 20.0,
    unit: 'packets',
    pricePerUnit: 110.0,
    initialTranscript: 'Stock delivery: 20 packets of Washing Detergent Powder.',
  },
];

async function main() {
  console.log('Seeding shopkeeper inventory database...');

  // Clear existing records to ensure fresh idempotent seeding
  await prisma.transactionLog.deleteMany({});
  await prisma.product.deleteMany({});

  for (const item of initialProducts) {
    const { initialTranscript, ...productData } = item;

    const product = await prisma.product.create({
      data: {
        ...productData,
        transactions: {
          create: {
            actionType: ActionType.RESTOCK,
            quantityChanged: productData.currentStock,
            rawTranscript: initialTranscript,
          },
        },
      },
    });

    console.log(`✓ Seeded product: ${product.name} (${product.currentStock} ${product.unit})`);
  }

  console.log(`\nSuccessfully seeded ${initialProducts.length} grocery items with transaction logs.`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
