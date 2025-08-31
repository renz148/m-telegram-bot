// server.js (Node.js + express)
// npm i express multer node-fetch form-data
const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });
const app = express();
const BOT = process.env.TELEGRAM_BOT_TOKEN; // e.g. '123456:ABC-DEF...'
const CHAT = process.env.TELEGRAM_CHAT_ID; // e.g. your telegram id or channel id

app.post('/upload', upload.single('file'), async (req, res) => {
  try{
    const filePath = req.file.path;
    const amount = req.body.amount || '0';
    const items = req.body.items || '[]';

    // build caption
    const caption = `Pesanan baru\nJumlah: Rp ${amount}\nItems: ${items}`;

    // send document to telegram
    const form = new FormData();
    form.append('chat_id', CHAT);
    form.append('caption', caption);
    form.append('document', fs.createReadStream(filePath));

    const resp = await fetch(`https://api.telegram.org/bot${BOT}/sendDocument`, { method:'POST', body: form });
    const data = await resp.json();

    // remove temp file
    fs.unlinkSync(filePath);

    if(!data.ok) return res.status(500).json({ ok:false, message: 'Telegram error', data });
    res.json({ ok:true, result: data.result });
  }catch(err){
    console.error(err);
    res.status(500).json({ ok:false, error: err.message });
  }
});

app.listen(process.env.PORT||3000, ()=> console.log('Server running'));
