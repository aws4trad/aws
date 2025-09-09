// صفحة تعرض الرسائل الواردة بشكل HTML مرتب
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
            <td>${msg.text.body}</td>
            <td>${msg.timestamp}</td>
          </tr>`;
  });

  html += `
        </table>
      </body>
    </html>`;
  
  res.send(html);
});
