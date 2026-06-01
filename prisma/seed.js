const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('Seeding database...');
  
  // Clean up existing data just in case
  await prisma.notification.deleteMany({});
  await prisma.disputeChat.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.withdrawal.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.wallet.deleteMany({});
  await prisma.trackingPoint.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.buterDetail.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = hashPassword('password123');

  // 1. Create Customer
  const customer = await prisma.user.create({
    data: {
      full_name: 'Ahmad Rizki',
      email: 'ahmad@customer.com',
      phone: '081311111111',
      password: passwordHash,
      role: 'customer',
      is_verified: true,
    },
  });
  console.log('Customer seeded:', customer.email);

  // 2. Create Buter
  const buter = await prisma.user.create({
    data: {
      full_name: 'Diana Putri',
      email: 'diana@buter.com',
      phone: '081322222222',
      password: passwordHash,
      role: 'buter',
      is_verified: true,
      buter_detail: {
        create: {
          vehicle_type: 'Motor',
          id_card_photo: '/uploads/ktp.jpg',
          skck_photo: '/uploads/skck.jpg',
          selfie_photo: '/uploads/selfie.jpg',
          approval_status: 'approved',
          total_earnings: 25000,
          total_tasks_completed: 1,
        },
      },
      wallet: {
        create: {
          balance: 25000,
          pending_balance: 0,
        },
      },
    },
    include: {
      buter_detail: true,
      wallet: true,
    },
  });
  console.log('Buter seeded:', buter.email);

  // Add the initial task for the buter to match the mock specs
  const task = await prisma.task.create({
    data: {
      customer_id: customer.id,
      buter_id: buter.id,
      description: 'Beli kopi di Starbucks Grand Indonesia',
      pickup_location: 'Starbucks Grand Indonesia',
      dropoff_location: 'Apartemen Sudirman Tower',
      price: 25000,
      status: 'completed',
      payment_method: 'gopay',
      payment_status: 'paid',
      payment_amount: 25000,
      transaction_id: 'TRX001',
      paid_at: new Date(),
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      taken_at: new Date(Date.now() - 3.9 * 60 * 60 * 1000),
      started_at: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
      completed_at: new Date(Date.now() - 3 * 60 * 60 * 1000),
      review: {
        create: {
          rating: 5,
          comment: 'Kopi enak, sampai cepat!',
        },
      },
      tracking_history: {
        create: [
          { lat: -6.1754, lng: 106.8456, status: 'menuju lokasi', time: new Date(Date.now() - 3.8 * 60 * 60 * 1000) }
        ],
      },
    },
  });
  console.log('Seeded completed task:', task.id);

  // Add the transaction to wallet transaction history
  await prisma.transaction.create({
    data: {
      walletId: buter.wallet.id,
      type: 'earning',
      amount: 25000,
      task_id: task.id,
      date: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  });

  // 3. Create Admin
  const admin = await prisma.user.create({
    data: {
      full_name: 'System Admin',
      email: 'admin@mitabut.com',
      phone: '081111111111',
      password: passwordHash,
      role: 'admin',
      is_verified: true,
    },
  });
  console.log('Admin seeded:', admin.email);

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
