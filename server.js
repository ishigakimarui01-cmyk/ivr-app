const express = require('express');
const { twiml: { VoiceResponse } } = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  // 👇これだけにする（最重要テスト）
  twiml.say('こんにちは。テストです。Hello test.');

  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('running');
});
