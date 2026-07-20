const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// 1. ログイン画面の表示
router.get('/login', (req, res) => {
  res.render('login');
});
// routes/viewRoutes.js の適切な場所に追記

// 👇 【追加】新規ユーザー登録画面の表示
router.get('/register', (req, res) => {
  res.render('register');
});


// 2. トップ画面（メインメニュー）
router.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// 3. レベル0 入力画面（ログイン者の氏名を渡す）
router.get('/incident/report/level0', (req, res) => {
  res.render('level0-form', { defaultName: req.session.user.name });
});

// 4. レベル1以上 入力画面（ログイン者の氏名を渡す）
router.get('/incident/report/level1', (req, res) => {
  res.render('level1-form', { defaultName: req.session.user.name });
});

// 5. 提出データ一覧画面
router.get('/incident/list', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.render('list', { incidents });
  } catch (err) {
    res.status(500).send('データ取得エラー: ' + err.message);
  }
});
// routes/viewRoutes.js の該当箇所を修正

// 6. データ修正画面の表示
router.get('/incident/edit/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).send('該当レポートなし');
    
    // 👈 【追加】ログインしているユーザーIDと、レポートの提出者IDを照合
    if (incident.reporter.loginId !== req.session.user.id) {
      return res.send('<script>alert("ご自身が提出したレポート以外は修正できません。"); window.location.href="/incident/list";</script>');
    }

    res.render('edit-form', { incident });
  } catch (err) {
    res.status(500).send('データ取得エラー: ' + err.message);
  }
});

module.exports = router;

