const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 新規ユーザー登録処理（既存のまま変更なし）
router.post('/register', async (req, res) => {
  try {
    const { loginId, userName, password } = req.body;

    const existingUser = await User.findOne({ loginId });
    if (existingUser) {
      return res.send('<script>alert("このログイン名はすでに使用されています。"); window.history.back();</script>');
    }

    const newUser = new User({ loginId, userName, password });
    await newUser.save();

    res.send('<script>alert("ユーザー登録が完了しました！ログインしてください。"); window.location.href="/login";</script>');
  } catch (err) {
    res.status(500).send('ユーザー登録エラー: ' + err.message);
  }
});

// ⭕ 修正後：ログインIDとパスワードのみで認証し、登録時の氏名を裏側で取得
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body; // 👈 userNameの受け取りを廃止

    // MongoDBからログインIDとパスワードのみでユーザーを特定
    const user = await User.findOne({ loginId, password });

    if (user) {
      // 照合が成功したら、登録時に保存されていた「user.userName（本名）」を取り出してセッションへセット
      req.session.user = {
        id: user.loginId,
        name: user.userName // 👈 画面入力ではなく、DBから安全に引き継ぎます
      };
      res.redirect('/');
    } else {
      res.send('<script>alert("ログイン名またはパスワードが間違っています。"); window.history.back();</script>');
    }
  } catch (err) {
    res.status(500).send('ログイン処理エラー: ' + err.message);
  }
});

module.exports = router;

