const express = require('express');
const { twiml: { VoiceResponse } } = require('twilio');

const app = express();

app.use(express.urlencoded({ extended: false }));

app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  twiml.say({ language: 'ja-JP' }, 'ガスのご用件をお選びください。1番は緊急、2番はガスが出ない。');

  twiml.gather({
    numDigits: 1,
    action: '/handle',
    method: 'POST'
  });

  res.type('text/xml');
  res.send(twiml.toString());
});

app.post('/handle', (req, res) => {
  const twiml = new VoiceResponse();
  const digit = req.body.Digits;

  if (digit === '1') {
    twiml.say({ language: 'ja-JP' }, '緊急対応におつなぎします。');
    twiml.dial('あなたの電話番号'); // ←0980825532
  } else if (digit === '2') {
    twiml.say({ language: 'ja-JP' }, 'ガス復帰方法をSMSでお送りします。');
  } else {
    twiml.say({ language: 'ja-JP' }, 'もう一度お試しください。');
    twiml.redirect('/voice');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running');
});
app.get('/voice', (req, res) => {
  res.send('OK');
});
👉 server.jsにこれ追加👇

app.get('/voice', (req, res) => {
  res.send('OK');
});
