require('dotenv').config();

const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());

app.use(express.static(path.join(__dirname, 'public')));

const header = fs.readFileSync(path.join(__dirname, 'views', 'header.html'));
const footer = fs.readFileSync(path.join(__dirname, 'views', 'footer.html'));

app.get('/', (req, res) => {
    const content = fs.readFileSync(path.join(__dirname, 'views', 'index.html'));
    res.send(header + content + footer);
});

app.get('/browse', (req, res) => {
    const content = fs.readFileSync(path.join(__dirname, 'views', 'browse.html'));
    res.send(header + content + footer);
});

app.get('/add', (req, res) => {
    const content = fs.readFileSync(path.join(__dirname, 'views', 'add.html'));
    res.send(header + content + footer);
});

app.post('/add/book', (req, res) => {
    const book_data = req.body;
    res.json(book_data);
});

app.use((req, res, next) => {
    const content = fs.readFileSync(path.join(__dirname, 'views', 'error.html'));
    res.send(header + content + footer);
});

const private_key_path = path.join(__dirname, 'certificates', 'kgslibrary.pem');
const certificate_path = path.join(__dirname, 'certificates', 'kgslibrary.pub');

const private_key = fs.readFileSync(private_key_path, 'utf8');
const certificate = fs.readFileSync(certificate_path, 'utf8');

const credentials = { key: private_key, cert: certificate };

const https_server = https.createServer(credentials, app);

https_server.listen(port, () => {
    console.log('Server is running on https://192.168.0.89:3000');
});
