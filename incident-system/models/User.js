const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  loginId: { type: String, required: true, unique: true }, // ログイン名（重複不可）
  userName: { type: String, required: true },               // 入力者氏名
  password: { type: String, required: true },               // パスワード
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);

