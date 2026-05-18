const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect('mongodb://localhost:27017/ecommerce');
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASS || 'admin123';
  const name = process.env.ADMIN_NAME || 'Administrator';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    return process.exit(0);
  }
  const user = new User({ name, email, password, role: 'admin' });
  await user.save();
  console.log('Admin created:', email);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
