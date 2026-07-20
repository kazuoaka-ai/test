const express = require('express');
const path = require('path');
const session = require('express-session'); // 👇 追加
const connectDB = require('./config/database');
const viewRoutes = require('./routes/viewRoutes');
const app = express();

connectDB();

app.use(express.urlencoded({ extended: true }));

// 👇 【追加】セッションの初期設定
app.use(session({
  secret: 'incident-secret-key', // 暗号化キー
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 } // 1時間有効
}));

// 👇 【追加】ログインチェック用のセキュリティフィルター
const checkLogin = (req, res, next) => {
  // ログイン画面、またはログインAPIへのアクセス時はスルーする
  if (req.path === '/login' || req.path === '/api/login' || req.path === '/register' || req.path === '/api/register'){
    return next();
  }
  // セッションにユーザー情報がなければログイン画面へ強制遷移
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};
app.use(checkLogin); // すべてのルートに適用

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', viewRoutes);
// 【古い記述】app.use('/api', apiRoutes);  👈これを削除し、以下3行に差し替えます

// 👇 分割したAPIファイルをそれぞれ適用（すべて /api の配下になります）
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/reportRoutes'));
app.use('/api', require('./routes/exportRoutes'));

app.use('/', viewRoutes); // 画面遷移用
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

