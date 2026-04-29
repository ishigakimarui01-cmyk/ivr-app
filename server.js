const express = require('express');
const { twiml: { VoiceResponse } } = require('twilio');

const twilio = require('twilio');
const app = express();

app.use(express.urlencoded({ extended: false }));

/* =========================
   IVR開始（日本語）
========================= */
app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  twiml.say(
    {
      language: 'ja-JP'
      // 👆 voiceはあえて指定しない（重要）
    },
    'ガスのご用件をお選びください。1番は緊急、2番はガスが出ない場合です。'
  );

  const gather = twiml.gather({
    numDigits: 1,
    action: '/handle',
    method: 'POST',
    timeout: 5
  });

  gather.say(
    {
      language: 'ja-JP'
    },
    '1番は緊急対応、2番はガスが出ない場合です。'
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

    twiml.dial('+819068675803');

  } else if (digit === '2') {
    twiml.say(
      { language: 'ja-JP' },
      'ガス復旧方法をご案内します。'
    );

  } else {
    twiml.say(
      { language: 'ja-JP' },
      'もう一度お試しください。'
    );

    twiml.redirect('/voice');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});


/* =========================
   health check
========================= */
app.get('/voice', (req, res) => {
  res.send('OK');
});


/* =========================
   発信トリガー
========================= */
app.get('/callme', async (req, res) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.calls.create({
      to: '+819068675803',
      from: '+19898153242',
      url: 'https://ivr-app-86ys.onrender.com/voice'
    });

    res.send('発信OK');
  } catch (err) {
    res.status(500).send(err.message);
  }
});


/* =========================
   起動
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on ' + PORT);
});
