const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const User = require('../models/User');

// ==========================================
// 🔓 1. ユーザー登録 ＆ ログイン認証API
// ==========================================

// 新規ユーザー登録処理
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

// ログイン認証処理（DB照合）
router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const user = await User.findOne({ loginId, password });

    if (user) {
      req.session.user = {
        id: user.loginId,
        name: user.userName
      };
      res.redirect('/');
    } else {
      res.send('<script>alert("ログイン名またはパスワードが間違っています。"); window.history.back();</script>');
    }
  } catch (err) {
    res.status(500).send('ログイン処理エラー: ' + err.message);
  }
});

// ==========================================
// 📝 2. レベル0（ヒヤリハット）用の保存ルート
// ==========================================
router.post('/incident/level0', async (req, res) => {
  try {
    const combinedOccurrenceDate = new Date(`${req.body.occurrenceDateOnly}T${req.body.occurrenceTimeOnly}`);

    const newIncident = new Incident({
      level: "0",
      reportDate: req.body.reportDate,
      occurrenceDate: combinedOccurrenceDate,
      location: req.body.location,
      description: req.body.description,
      reporter: {
        name: req.body.reporterName,
        jobTitle: req.body.reporterJobTitle,
        department: req.body.reporterDepartment,
        experienceYears: req.body.reporterExperienceYears,
        isInvolved: req.body.reporterIsInvolved === "true"
      },
      eventCategory: req.body.eventCategory || "未分類（レベル0）",
      eventSummary: req.body.eventSummary || "未分類（レベル0）",
      causes: {
        environmentalPrimary: req.body.environmentalPrimary || "未選択",
        environmentalSecondary: req.body.environmentalSecondary || ""
      },
      postDiscoveryAction: req.body.postDiscoveryAction || "特記なし",
      detailedCauseDescription: req.body.detailedCauseDescription || "特記なし",
      resultStatus: req.body.resultStatus || "影響なし",
      countermeasure: req.body.countermeasure,
      editPassword: req.body.editPassword
    });

    await newIncident.save();
    res.send('<script>alert("レベル0 レポートを提出しました"); window.location.href="/";</script>');
  } catch (err) {
    res.status(500).send('データ保存エラー: ' + err.message);
  }
});

// ==========================================
// 🚨 3. レベル1以上用の保存ルート
// ==========================================
router.post('/incident/level1', async (req, res) => {
  try {
    const combinedOccurrenceDate = new Date(`${req.body.occurrenceDateOnly}T${req.body.occurrenceTimeOnly}`);

    const newIncident = new Incident({
      level: req.body.level,
      reportDate: req.body.reportDate,
      occurrenceDate: combinedOccurrenceDate,
      location: req.body.location,
      description: req.body.description,
      reporter: {
        name: req.body.reporterName,
        jobTitle: req.body.reporterJobTitle,
        department: req.body.reporterDepartment,
        experienceYears: req.body.reporterExperienceYears,
        isInvolved: req.body.reporterIsInvolved === "true"
      },
      patient: {
        name: req.body.patientName || "",
        id: req.body.patientId || "",
        age: req.body.patientAge ? Number(req.body.patientAge) : null,
        gender: req.body.patientGender || ""
      },
      eventCategory: req.body.eventCategory,
      eventSummary: req.body.eventSummary,
      tubeDetails: {
        type: req.body.tubeType || "",
        cause: req.body.tubeCause || ""
      },
      fallDetails: {
        triggerAction: req.body.fallTriggerAction || "",
        envFactor: req.body.fallEnvFactor || "",
        adl: req.body.fallAdl || "",
        careLevel: req.body.fallCareLevel || ""
      },
      causes: {
        environmentalPrimary: req.body.environmentalPrimary,
        environmentalSecondary: req.body.environmentalSecondary || ""
      },
      humanFactors: {
        primary: req.body.humanPrimary || "",
        secondary: req.body.humanSecondary || ""
      },
      postDiscoveryAction: req.body.postDiscoveryAction,
      detailedCauseDescription: req.body.detailedCauseDescription,
      resultStatus: req.body.resultStatus,
      countermeasure: req.body.countermeasure,
      editPassword: req.body.editPassword
    });
    
    await newIncident.save();
    res.send('<script>alert("レベル1以上 インシデントレポートを提出しました"); window.location.href="/";</script>');
  } catch (err) {
    res.status(500).send('データ保存エラー: ' + err.message);
  }
});

// ==========================================
// ✏️ 4. 提出済みインシデントレポートの修正
// ==========================================
router.post('/incident/update/:id', async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).send('該当するレポートが見つかりません');
    }

    if (req.body.confirmPassword !== incident.editPassword) {
      return res.send('<script>alert("パスワードが間違っているため、修正を保存できません。"); window.history.back();</script>');
    }

    const combinedOccurrenceDate = new Date(`${req.body.occurrenceDateOnly}T${req.body.occurrenceTimeOnly}`);

    const updateData = {
      level: req.body.level || "0",
      reportDate: req.body.reportDate,
      occurrenceDate: combinedOccurrenceDate,
      location: req.body.location,
      description: req.body.description,
      reporter: {
        name: req.body.reporterName,
        jobTitle: req.body.reporterJobTitle,
        department: req.body.reporterDepartment,
        experienceYears: req.body.reporterExperienceYears,
        isInvolved: req.body.reporterIsInvolved === "true"
      },
      patient: {
        name: req.body.patientName || "",
        id: req.body.patientId || "",
        age: req.body.patientAge ? Number(req.body.patientAge) : null,
        gender: req.body.patientGender || ""
      },
      eventCategory: req.body.eventCategory,
      eventSummary: req.body.eventSummary,
      tubeDetails: { type: req.body.tubeType || "", cause: req.body.tubeCause || "" },
      fallDetails: { triggerAction: req.body.fallTriggerAction || "", envFactor: req.body.fallEnvFactor || "", adl: req.body.fallAdl || "", careLevel: req.body.fallCareLevel || "" },
      causes: { environmentalPrimary: req.body.environmentalPrimary, environmentalSecondary: req.body.environmentalSecondary || "" },
      humanFactors: { primary: req.body.humanPrimary || "", secondary: req.body.humanSecondary || "" },
      postDiscoveryAction: req.body.postDiscoveryAction,
      detailedCauseDescription: req.body.detailedCauseDescription,
      resultStatus: req.body.resultStatus,
      countermeasure: req.body.countermeasure
    };

    await Incident.findByIdAndUpdate(req.params.id, updateData);
    res.send('<script>alert("レポートの修正を保存しました"); window.location.href="/incident/list";</script>');

  } catch (err) {
    res.status(500).send('データ更新エラー: ' + err.message);
  }
});

// ==========================================
// 📥 5. 全データをCSVファイルとしてダウンロード出力
// ==========================================
router.get('/incident/export/csv', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: 1 });

    const headers = [
      'レベル', '提出年月日', '発生年月日', '発生時刻', '発生場所',
      '提出者氏名', '職種', '所属部署', '経験年数', '当事者フラグ',
      '当該者氏名', '当該者ID', '当該者年齢', '当該者性別',
      '出来事の領域', '出来事の概要', '発見後の対応', '原因（詳細）',
      '環境的主要因', '環境的副要因', '人為的主要因', '人為的副要因',
      '結果（影響度）', '今後の対策', '作成日時'
    ];

    const rows = incidents.map(item => {
      const rDate = item.reportDate ? item.reportDate.toISOString().split('T') : '';
      const oDate = item.occurrenceDate ? item.occurrenceDate.toISOString().split('T') : '';
      const oTime = item.occurrenceDate ? item.occurrenceDate.toTimeString().slice(0, 5) : '';
      const cDate = item.createdAt ? item.createdAt.toLocaleString('ja-JP') : '';

      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      return [
        escape(item.level),
        escape(rDate),
        escape(oDate),
        escape(oTime),
        escape(item.location),
        escape(item.reporter ? item.reporter.name : ''),
        escape(item.reporter ? item.reporter.jobTitle : ''),
        escape(item.reporter ? item.reporter.department : ''),
        escape(item.reporter ? item.reporter.experienceYears : ''),
        escape(item.reporter && item.reporter.isInvolved ? '当事者' : '第三者'),
        escape(item.patient ? item.patient.name : ''),
        escape(item.patient ? item.patient.id : ''),
        escape(item.patient ? item.patient.age : ''),
        escape(item.patient ? item.patient.gender : ''),
        escape(item.eventCategory),
        escape(item.eventSummary),
        escape(item.postDiscoveryAction),
        escape(item.detailedCauseDescription),
        escape(item.causes ? item.causes.environmentalPrimary : ''),
        escape(item.causes ? item.causes.environmentalSecondary : ''),
        escape(item.humanFactors ? item.humanFactors.primary : ''),
        escape(item.humanFactors ? item.humanFactors.secondary : ''),
        escape(item.resultStatus),
        escape(item.countermeasure),
        escape(cDate)
      ].join(',');
    });

const csvContent = [headers.join(','), ...rows].join('\r\n');
const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
const csvBuffer = Buffer.concat([bom, Buffer.from(csvContent, 'utf8')]);
const filename = incident_report_${new Date().toISOString().slice(0,10)}.csv;res.setHeader('Content-Type', 'text/csv; charset=utf-8');res.setHeader('Content-Disposition', attachment; filename="${filename}");res.status(200).send(csvBuffer);} 
catch (err) {res.status(500).send('CSVエクスポート中にエラーが発生しました: ' + err.message);}});
// 🔴 最後の行までしっかり保存されていることを確認してください
module.exports = router;
