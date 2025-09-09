const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// نخزن الرسائل مؤقت في الذاكرة
let messages = [];

// لو في ملف messages.json قديم، نحمّله
if (fs.existsSync('messages.json')) {
  const data = fs.readFileSync('messages.json');
  try {
    messages = JSON.parse(data);
  } catch (e) {
    messages = [];
  }
}

// 📩 استقبال الرسائل من واتساب
app.post('/webhook', (req, res) => {
  const data = req.body;

  if (data.entry) {
    data.entry.forEach(entry => {
      entry.changes.forEach(change => {
        if (change.value.messages) {
          change.value.messages.forEach(msg => {
            messages.push(msg);

            // تحديث ملف messages.json
            fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2));
            console.log('📥 رسالة جديدة:', msg);
          });
        }
      });
    });
  }

  res.sendStatus(200);
});

// ✅ التحقق (Verification) مع واتساب
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = "MY_VERIFY_TOKEN"; // غيّرها بنفس التوكن اللي سجلته في Meta
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 🌐 صفحة HTML تعرض الرسائل بشكل مرتب
app.get('/messages', (req, res) => {
  let html = `
    <html>
      <head>
        <title>WhatsApp Messages</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f9f9f9; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; border: 1px solid #ccc; text-align: left; }
          th { background: #4CAF50; color: white; }
          tr:nth-child(even) { background: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>📩 الرسائل الواردة</h1>
        <table>
          <tr>
            <th>المرسل</th>
            <th>الرسالة</th>
            <th>الوقت</th>
          </tr>`;

  messages.forEach(msg => {
    html += `
          <tr>
            <td>${msg.from}</td>
            <td>${msg.text?.body || ''}</td>
            <td>${msg.timestamp}</td>
          </tr>`;
  });

  html += `
        </table>
      </body>
    </html>`;
  
  res.send(html);
});

// ⬇️ رابط لتحميل ملف الرسائل
app.get('/download', (req, res) => {
  if (fs.existsSync('messages.json')) {
    res.download('messages.json');
  } else {
    res.status(404).send('⚠️ لا يوجد ملف رسائل بعد.');
  }
});

// 🚀 تشغيل السيرفر
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
