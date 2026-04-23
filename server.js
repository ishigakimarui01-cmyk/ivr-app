const express = require('express');
const { twiml: { VoiceResponse } } = require('twilio');
const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

const app = express();
app.use(express.urlencoded({ extended: false }));

// ===== 設定（ここだけ変更）=====
const TWILIO_NUMBER = '+81XXXXXXXXXX'; // Twilio番号
const YOUR_PHONE = '+8190XXXXXXXX';   // あなたの携帯

// ===== メインIVR =====
app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    numDigits: 1,
    action: '/handle-main',
    method: 'POST',
    timeout: 5
  });

  gather.say({ language: 'ja-JP', voice: 'Polly.Mizuki' }, `
お電話ありがとうございます。マルヰプロパン商会です。

ガスの臭いがする、または緊急の場合は1を押してください。

ガスが出ない、機器の不具合は2、
開栓・閉栓のご予約は3、
料金については4、
お支払い方法については5、
その他のお問い合わせは6を押してください。
`);

  twiml.redirect('/voice');

  res.type('text/xml');
  res.send(twiml.toString());
});

// ===== メイン分岐 =====
app.post('/handle-main', (req, res) => {
  const digit = req.body.Digits;
  const from = req.body.From;
  const twiml = new VoiceResponse();

  switch (digit) {

    case '1': // 緊急
      twiml.say('ガスの元栓を閉めてください。火気の使用はおやめください。担当者にお繋ぎします。');
      dialWithFallback(twiml);
      break;

    case '2': // ガス出ない
      const gather2 = twiml.gather({
        numDigits: 1,
        action: '/handle-gas',
        method: 'POST'
      });

      gather2.say({ language: 'ja-JP' }, `
ガスが出ない場合、メーター遮断の可能性があります。

復帰方法をSMSで受け取る場合は1、
担当者に繋ぐ場合は2を押してください。
`);
      break;

    case '3': // 開閉栓
      sendSMS(from, `【マルヰプロパン商会】
開栓・閉栓予約はこちら
https://ishigakimarui.com/`);
      twiml.say('SMSでご案内をお送りしました。');
      break;

    case '4': // 料金
      sendSMS(from, `【マルヰプロパン商会】
料金のお問い合わせはこちら
https://ishigakimarui.com/?page_id=34`);
      twiml.say('SMSでお問い合わせフォームをお送りしました。');
      break;

    case '5': // 支払い
      sendSMS(from, `【マルヰプロパン商会】
お支払い方法の変更はこちら
https://ishigakimarui.com/`);
      twiml.say('SMSでご案内をお送りしました。');
      break;

    case '6': // その他
      dialWithFallback(twiml);
      break;

    default:
      twiml.say('入力が確認できませんでした。');
      twiml.redirect('/voice');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// ===== ガス復帰 =====
app.post('/handle-gas', (req, res) => {
  const digit = req.body.Digits;
  const from = req.body.From;
  const twiml = new VoiceResponse();

  if (digit === '1') {
    client.messages.create({
      body: '【マルヰプロパン商会】ガスメーター復帰方法です。うまくいかない場合はお電話ください。',
      from: TWILIO_NUMBER,
      to: from,
      mediaUrl: [
        'https://ishigakimarui.com/wp/wp-content/uploads/2024/01/fukkihouhou.jpg'
      ]
    });

    twiml.say('復帰方法をSMSでお送りしました。ご確認ください。');

  } else if (digit === '2') {
    dialWithFallback(twiml);
  } else {
    twiml.redirect('/voice');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

// ===== 電話転送 =====
function dialWithFallback(twiml) {
  const dial = twiml.dial({
    timeout: 15,
    action: '/dial-fallback'
  });

  dial.number(YOUR_PHONE);
}

// ===== 転送失敗 =====
app.post('/dial-fallback', (req, res) => {
  const twiml = new VoiceResponse();
  twiml.say('担当者に接続できませんでした。再度おかけ直しください。');
  res.type('text/xml');
  res.send(twiml.toString());
});

// ===== SMS送信 =====
function sendSMS(to, message) {
  client.messages.create({
    body: message,
    from: TWILIO_NUMBER,
    to: to
  }).catch(console.error);
}

// ===== サーバー起動 =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('IVR running on port ' + PORT);
});
