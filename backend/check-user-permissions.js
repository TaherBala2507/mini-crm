const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Simple schema definitions
const userSchema = new mongoose.Schema({}, { strict: false });
const roleSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);

async function checkUserPermissions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // List all users first
    const allUsers = await User.find({}, 'name email status roleIds');
    console.log('📋 All Users in Database:');
    allUsers.forEach(u => {
      console.log(`   - ${u.name} (${u.email}) - Status: ${u.status}`);
    });
    console.log('');

    // Find user by email - try Olivia first
    let user = await User.findOne({ email: 'olivia@gmail.com' });
    
    if (!user) {
      user = await User.findOne({ email: 'olivia@example.com' });
    }
    
    if (!user && allUsers.length > 0) {
      console.log('⚠️  Olivia not found, using first user instead\n');
      user = allUsers[0];
    }
    
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👤 User Found:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Status:', user.status);
    console.log('   Role IDs:', user.roleIds);
    console.log('');

    // Find roles
    const roles = await Role.find({ _id: { $in: user.roleIds } });
    
    console.log('🎭 User Roles:');
    roles.forEach(role => {
      console.log(`\n   Role: ${role.name}`);
      console.log(`   Description: ${role.description}`);
      console.log(`   Permissions (${role.permissions.length}):`);
      role.permissions.forEach(perm => {
        console.log(`      - ${perm}`);
      });
    });

    // Get all unique permissions
    const allPermissions = [...new Set(roles.flatMap(r => r.permissions))];
    console.log(`\n📋 Total Unique Permissions: ${allPermissions.length}`);
    
    // Check for specific permissions
    const requiredPermissions = [
      'lead.view.all',
      'lead.view.own',
      'lead.create',
      'user.view',
      'project.view',
      'task.view',
      'role.manage'
    ];
    
    console.log('\n🔍 Checking Required Permissions:');
    requiredPermissions.forEach(perm => {
      const hasIt = allPermissions.includes(perm);
      console.log(`   ${hasIt ? '✅' : '❌'} ${perm}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkUserPermissions();