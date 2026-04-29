const express = require('express');
const { twiml: { VoiceResponse } } = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

const YOUR_PHONE = '+8190XXXXXXXX';

/* =========================
   IVR入口
========================= */
app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  // 🔥 日本語ガイダンス（安定版）
  twiml.say(
    { language: 'ja-JP' },
    'お電話ありがとうございます。ご用件をお選びください。'
  );

  const gather = twiml.gather({
    numDigits: 1,
    action: '/handle',
    method: 'POST',
    timeout: 5
  });

  // 🔥 gatherは喋らせない（重要：音声ブレ防止）
  gather.say(
    { language: 'ja-JP' },
    '1は緊急対応、2はガスが出ない、3はその他のお問い合わせです。'
  );

  twiml.redirect('/voice');

  res.type('text/xml');
  res.send(twiml.toString());
});


/* =========================
   分岐処理
========================= */
app.post('/handle', (req, res) => {
  const twiml = new VoiceResponse();
  const digit = req.body.Digits;

  if (digit === '1') {

    twiml.say(
      { language: 'ja-JP' },
      '緊急対応におつなぎします。'
    );

    twiml.dial(YOUR_PHONE);

  } else if (digit === '2') {

    twiml.say(
      { language: 'ja-JP' },
      'ガスが出ない場合のご案内です。'
    );

    twiml.redirect('/voice');

  } else if (digit === '3') {

    twiml.say(
      { language: 'ja-JP' },
      '担当者におつなぎします。'
    );

    twiml.dial(YOUR_PHONE);

  } else {

    twiml.say(
      { language: 'ja-JP' },
      '入力が確認できませんでした。もう一度お試しください。'
    );

    twiml.redirect('/voice');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});


/* =========================
   起動
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('IVR running on ' + PORT);
});
