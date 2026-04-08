const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const schema = new mongoose.Schema({ email: String });
const User = mongoose.model('User', schema);

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all Gmail users
    const users = await User.find({ email: /@gmail\.com$/ });
    console.log(`Found ${users.length} Gmail users`);
    
    for (const user of users) {
      const emailLower = user.email.toLowerCase();
      const [local, domain] = emailLower.split('@');
      if (local.includes('.')) {
        const normalized = local.replace(/\./g, '') + '@' + domain;
        console.log(`Normalizing ${user.email} -> ${normalized}`);
        
        try {
          const exists = await User.findOne({ email: normalized, _id: { $ne: user._id } });
          if (exists) {
            console.warn(`Merge Conflict: '${user.email}' and '${normalized}' both exist. Skipping.`);
            continue;
          }
          
          await User.updateOne({ _id: user._id }, { email: normalized });
          console.log(`Successfully updated ${user._id}`);
        } catch (err) {
          console.error(`Error updating ${user.email}: ${err.message}`);
        }
      }
    }
    
    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
