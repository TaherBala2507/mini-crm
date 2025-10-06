const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const correctOrgId = '68e22939151fed5d691d443c'; // The orgId where SuperAdmin role exists
const userEmail = 'olivia@gmail.com';

async function fixUserOrgId() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Find the user
    const user = await usersCollection.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('\n📋 Current User Data:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Current OrgID: ${user.orgId}`);
    console.log(`   RoleIDs: ${JSON.stringify(user.roleIds)}`);
    
    // Update the user's orgId
    const result = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { orgId: new ObjectId(correctOrgId) } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('\n✅ Successfully updated user orgId!');
      console.log(`   New OrgID: ${correctOrgId}`);
      
      // Verify the update
      const updatedUser = await usersCollection.findOne({ _id: user._id });
      console.log('\n✅ Verified - User now has orgId:', updatedUser.orgId.toString());
      
      // Verify roles can now be found
      const rolesCollection = db.collection('roles');
      const roles = await rolesCollection.find({
        _id: { $in: updatedUser.roleIds.map(id => new ObjectId(id)) },
        orgId: updatedUser.orgId
      }).toArray();
      
      console.log(`\n✅ Roles found: ${roles.length}`);
      roles.forEach(role => {
        console.log(`   - ${role.name} (${role.permissions.length} permissions)`);
      });
      
      console.log('\n🎉 Fix complete! Please log out and log back in to get a fresh token.');
    } else {
      console.log('\n⚠️  No changes made (orgId might already be correct)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixUserOrgId();