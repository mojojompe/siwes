const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://ayomiposiemmanuel9_db_user:1rPP07xZc1jN5j2Y@mysiwes.agl8itd.mongodb.net/siwesApp?retryWrites=true&w=majority";

async function upgradeToPro() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Update all users to isPro: true since they paid but the webhook failed
    const result = await db.collection('users').updateMany({}, { $set: { isPro: true } });
    
    console.log(`Successfully upgraded ${result.modifiedCount} accounts to Pro!`);
    process.exit(0);
  } catch (error) {
    console.error("Error upgrading users:", error);
    process.exit(1);
  }
}

upgradeToPro();
