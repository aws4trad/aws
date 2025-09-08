const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "6c033b1b54bb1faa8ff683a76977cdde";
const WHATSAPP_TOKEN = "6c033b1b54bb1faa8ff683a76977cdde";
const PHONE_NUMBER_ID = "967775954444";

let receivedMessages = [];

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    return res.status(200).send(challenge);
  }
  console.log("Webhook verification failed");
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  const data = req.body;

  if (data.entry) {
    data.entry.forEach((entry) => {
      entry.changes.forEach(async (change) => {
        const messages = change.value.messages;
        if (messages) {
          for (const msg of messages) {
            const sender = msg.from;
            const text = msg.text?.body;
            const timestamp = new Date();

            receivedMessages.push({ sender, text, timestamp });
            console.log(`New message from ${sender}: ${text}`);

            if (text) {
              await sendWhatsAppMessage(sender, `تم استلام رسالتك: "${text}"`);
            }
          }
        }
      });
    });
  }

  res.sendStatus(200);
});

app.get("/messages", (req, res) => {
  res.json(receivedMessages);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

async function sendWhatsAppMessage(to, message) {
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Sent reply to ${to}`);
  } catch (error) {
    console.error("Error sending reply:", error.response?.data || error.message);
  }
}
