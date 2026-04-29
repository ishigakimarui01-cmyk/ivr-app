const express = require('express');
const { twiml: { VoiceResponse } } = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  // 🔥 最小テスト（重要）
  twiml.say('こんにちは。テストです。日本語が聞こえていますか？');

  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('running');
});
