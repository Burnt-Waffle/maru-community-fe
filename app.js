import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.redirect('/public/pages/login/login.html');
});

app.get('/health', (req, res) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hh}:${mm}:${ss}`;

    res.status(200).send(`OK - ${timeString} \n`);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});