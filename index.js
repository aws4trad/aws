import express from "express";

const app = express();
app.use(express.json());

// نخزن الرسائل مؤقتًا هنا (تختفي لو السيرفر عمل restart)
let messages = [];

// ✅ التحقق من الويب هوك (Meta يطلبه أول مرة)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "MY_VERIFY_TOKEN"; // غيّره لأي كلمة سر تختارها
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ استقبال الرسائل من واتساب
app.post("/webhook", (req, res) => {
  try {
    const data = req.body;

    if (data.entry && data.entry[0].changes[0].value.messages) {
      const msg = data.entry[0].changes[0].value.messages[0];
      const from = msg.from;
      const text = msg.text ? msg.text.body : "";
      const timestamp = msg.timestamp;

      // نحفظ الرسالة
      messages.push({
        from,
        text,
        timestamp: new Date(timestamp * 1000).toLocaleString(),
      });
    }
  } catch (e) {
    console.error("❌ Error parsing message:", e);
  }

  res.sendStatus(200);
});

// ✅ صفحة HTML لعرض الرسائل
app.get("/messages", (req, res) => {
  let html = `
    <html>
      <head>
        <title>WhatsApp Messages</title>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; }
          h1 { color: #25D366; }
          .msg { background: #fff; padding: 12px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .from { font-weight: bold; color: #333; }
          .time { font-size: 12px; color: gray; margin-top: 4px; }
        </style>
      </head>
      <body>
        <h1>📩 WhatsApp Messages</h1>
        ${
          messages.length === 0
            ? "<p>لا توجد رسائل بعد...</p>"
            : messages
                .map(
                  (m) => `
              <div class="msg">
                <div class="from">📱 من: ${m.from}</div>
                <div class="text">💬 الرسالة: ${m.text}</div>
                <div class="time">⏰ ${m.timestamp}</div>
              </div>
            `
                )
                .join("")
        }
      </body>
    </html>
  `;
  res.send(html);
});

// ✅ تشغيل السيرفر
app.listen(3000, () => console.log("🚀 Server running on port 3000"));
