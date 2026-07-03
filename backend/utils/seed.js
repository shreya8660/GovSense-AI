// Run with: npm run seed  (make sure .env is configured first)
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import Department from '../models/Department.js';
import Category from '../models/Category.js';
import Settings from '../models/Settings.js';

dotenv.config();

const departments = [
  { name: 'Ministry of Health', code: 'MOH', description: 'Public health policy and services' },
  { name: 'Ministry of Transport', code: 'MOT', description: 'Roads, transit, and infrastructure' },
  { name: 'Ministry of Education', code: 'MOE', description: 'Schools, curriculum, and education policy' },
  { name: 'Ministry of Environment', code: 'MOEV', description: 'Environmental protection and sustainability' },
  { name: 'Ministry of Finance', code: 'MOF', description: 'Taxation, budgets, and economic policy' },
];

const categories = [
  { name: 'Infrastructure', icon: 'construction' },
  { name: 'Healthcare', icon: 'heart-pulse' },
  { name: 'Education', icon: 'graduation-cap' },
  { name: 'Environment', icon: 'leaf' },
  { name: 'Public Safety', icon: 'shield' },
  { name: 'Taxation', icon: 'receipt' },
  { name: 'Other', icon: 'more-horizontal' },
];

const seed = async () => {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@govsense.ai';
  const adminExists = await Admin.findOne({ email: adminEmail });
  if (!adminExists) {
    await Admin.create({
      name: 'Super Admin',
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'superadmin',
    });
    console.log(`✅ Default admin created: ${adminEmail}`);
  } else {
    console.log('ℹ️  Admin already exists, skipping');
  }

  for (const dept of departments) {
    await Department.findOneAndUpdate({ code: dept.code }, dept, { upsert: true, new: true });
  }
  console.log(`✅ Seeded ${departments.length} departments`);

  for (const cat of categories) {
    await Category.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  await Settings.getSettings();
  console.log('✅ Default settings initialized');

  console.log('\n🎉 Seed complete. Log in as admin with:');
  console.log(`   email: ${adminEmail}`);
  console.log(`   password: ${process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'}`);
  console.log('   ⚠️  Change this password immediately after first login.\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
