// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
const express = require("express");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "my_verify_token"; // عدّلها لتكون نفس التوكن في Meta

let receivedMessages = []; // لتخزين الرسائل

// التحقق من Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// استقبال الرسائل الجديدة
app.post("/webhook", (req, res) => {
  const data = req.body;

  if (data.entry) {
    data.entry.forEach((entry) => {
      entry.changes.forEach((change) => {
        const messages = change.value.messages;
        if (messages) {
          messages.forEach((msg) => {
            const sender = msg.from;
            const text = msg.text?.body;
            receivedMessages.push({ sender, text, time: new Date() });
            console.log(✅ رسالة جديدة من ${sender}: ${text});
          });
        }
      });
    });
  }

  res.sendStatus(200);
});

// صفحة لعرض الرسائل
app.get("/messages", (req, res) => {
  res.json(receivedMessages);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(🚀 Server is running on port ${PORT}));
