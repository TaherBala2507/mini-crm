const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Get token from command line
const token = process.argv[2];

if (!token) {
  console.log('Usage: node debug-token.js <access_token>');
  console.log('\nTo get your token:');
  console.log('1. Open browser DevTools (F12)');
  console.log('2. Go to Application tab → Local Storage');
  console.log('3. Copy the value of "accessToken"');
  process.exit(1);
}

async function debugToken() {
  try {
    // Decode token
    console.log('🔍 Decoding JWT Token...\n');
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('✅ Token is valid!');
    console.log('📋 Token Payload:');
    console.log(JSON.stringify(decoded, null, 2));
    console.log('');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define schemas
    const userSchema = new mongoose.Schema({}, { strict: false });
    const roleSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);
    const Role = mongoose.model('Role', roleSchema);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('❌ User not found in database!');
      return;
    }

    console.log('👤 User from Database:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   OrgID: ${user.orgId}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   RoleIDs: ${JSON.stringify(user.roleIds)}`);
    console.log('');

    // Check if orgId matches
    if (decoded.orgId !== user.orgId.toString()) {
      console.log('⚠️  WARNING: Token orgId does not match user orgId!');
      console.log(`   Token orgId: ${decoded.orgId}`);
      console.log(`   User orgId: ${user.orgId}`);
      console.log('');
    }

    // Find roles
    const roles = await Role.find({ 
      _id: { $in: user.roleIds },
      orgId: user.orgId 
    });

    console.log(`🎭 User Roles (${roles.length} found):`);
    roles.forEach(role => {
      console.log(`\n   Role: ${role.name}`);
      console.log(`   RoleID: ${role._id}`);
      console.log(`   OrgID: ${role.orgId}`);
      console.log(`   Permissions: ${role.permissions.length}`);
      console.log(`   Has user.view: ${role.permissions.includes('user.view') ? '✅' : '❌'}`);
      console.log(`   Has lead.view.all: ${role.permissions.includes('lead.view.all') ? '✅' : '❌'}`);
    });

    // Try the same query the middleware uses
    console.log('\n🔍 Testing RBAC Middleware Query:');
    const testRoles = await Role.find({
      _id: { $in: user.roleIds },
      orgId: user.orgId,
    });
    console.log(`   Found ${testRoles.length} roles`);
    
    if (testRoles.length === 0) {
      console.log('   ❌ No roles found! This is the problem!');
      console.log('   Checking why...');
      
      // Check if roles exist without orgId filter
      const rolesWithoutOrgFilter = await Role.find({
        _id: { $in: user.roleIds }
      });
      console.log(`   Roles without orgId filter: ${rolesWithoutOrgFilter.length}`);
      
      if (rolesWithoutOrgFilter.length > 0) {
        console.log('   ⚠️  Roles exist but orgId mismatch!');
        rolesWithoutOrgFilter.forEach(r => {
          console.log(`      Role ${r.name}: orgId = ${r.orgId}, user.orgId = ${user.orgId}`);
          console.log(`      Match: ${r.orgId.toString() === user.orgId.toString()}`);
        });
      }
    }

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Invalid token:', error.message);
    } else if (error.name === 'TokenExpiredError') {
      console.log('❌ Token expired:', error.message);
    } else {
      console.log('❌ Error:', error.message);
    }
  } finally {
    await mongoose.disconnect();
  }
}

debugToken();