const express = require('express');
const { twiml: { VoiceResponse } } = require('twilio');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

const TWILIO_NUMBER = '+19898153242';
const YOUR_PHONE = '+819068675803';


/* =========================
   メインIVR
========================= */
app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    numDigits: 1,
    action: '/handle-main',
    method: 'POST',
    timeout: 6
  });

  // 🔥 修正①：短くする（重要）
  gather.say(
    { language: 'ja-JP' },
    'マルヰプロパンです。1緊急、2ガス不具合、3開栓、4料金、5支払い、6その他。'
  );

  res.type('text/xml');
  res.send(twiml.toString());
});


/* =========================
   メイン分岐
========================= */
app.post('/handle-main', (req, res) => {
  const digit = req.body.Digits;
  const from = req.body.From;
  const twiml = new VoiceResponse();

  switch (digit) {

    case '1':
      twiml.say({ language: 'ja-JP' }, '緊急対応におつなぎします。');
      twiml.dial(YOUR_PHONE);
      break;

    case '2':
      const gather2 = twiml.gather({
        numDigits: 1,
        action: '/handle-gas',
        method: 'POST',
        timeout: 6
      });

      gather2.say(
        { language: 'ja-JP' },
        '1復帰方法SMS、2担当者につなぐ'
      );
      break;

    case '3':
      sendSMS(from, '開栓・閉栓はこちら https://ishigakimarui.com/');
      twiml.say({ language: 'ja-JP' }, 'SMSを送信しました。');
      break;

    case '4':
      sendSMS(from, '料金はこちら https://ishigakimarui.com/?page_id=34');
      twiml.say({ language: 'ja-JP' }, 'SMSを送信しました。');
      break;

    case '5':
      sendSMS(from, '支払い方法はこちら https://ishigakimarui.com/');
      twiml.say({ language: 'ja-JP' }, 'SMSを送信しました。');
      break;

    case '6':
      twiml.dial(YOUR_PHONE);
      break;

    default:
      twiml.say({ language: 'ja-JP' }, '入力が確認できませんでした。');
      twiml.redirect('/voice');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});


/* =========================
   ガス復旧
========================= */
app.post('/handle-gas', async (req, res) => {
  const digit = req.body.Digits;
  const from = req.body.From;
  const twiml = new VoiceResponse();

  if (digit === '1') {

    await client.messages.create({
      body: 'ガスメーター復帰方法です。',
      from: TWILIO_NUMBER,
      to: from,
      mediaUrl: [
        'https://ishigakimarui.com/wp/wp-content/uploads/2024/01/fukkihouhou.jpg'
      ]
    });

    twiml.say({ language: 'ja-JP' }, 'SMSを送信しました。');

  } else if (digit === '2') {

    twiml.dial(YOUR_PHONE);

  } else {

    twiml.redirect('/voice');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});


/* =========================
   SMS関数
========================= */
function sendSMS(to, message) {
  return client.messages.create({
    body: message,
    from: TWILIO_NUMBER,
    to
  }).catch(console.error);
}


/* =========================
   起動
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('IVR running on ' + PORT);
});
