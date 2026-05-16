const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecommerce')
.then(async () => {
    console.log('Connected to DB');
    await User.deleteMany({ email: 'admin@engine.com' });
    const admin = new User({
        name: 'Admin User',
        email: 'admin@engine.com',
        password: 'admin123',
        role: 'admin'
    });
    await admin.save();
    console.log('Admin user created: admin@engine.com / admin123');
    process.exit();
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
