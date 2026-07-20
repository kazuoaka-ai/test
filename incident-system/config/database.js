const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/incident_db');
    console.log('MongoDB に正常に接続されました。');
  } catch (err) {
    console.error('MongoDB 接続エラー:', err.message);
    process.exit(1);
  }
};

// 🔴 必ず波括弧なしで、関数そのものを代入してください
module.exports = connectDB; 

