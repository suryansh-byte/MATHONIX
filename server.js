// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { create, all } = require('mathjs');
const math = create(all);

const app = express();
const port = 3030;
let calcHistory = [];

app.use(cors());
app.use(bodyParser.json());

app.post('/api/calculate', (req, res) => {
    try {
        const { expression } = req.body;
        const result = math.evaluate(expression);
        const record = { expression, result, time: new Date().toISOString() };
        calcHistory.push(record);
        res.json({ result, record });
    } catch (err) {
        res.status(400).json({ error: "Invalid expression!" });
    }
});

app.get('/api/history', (req, res) => {
    res.json(calcHistory.slice(-100).reverse());
});

app.post('/api/clear-history', (req, res) => {
    calcHistory = [];
    res.json({ ok: true });
});

app.listen(port, () => console.log(`Mathionix backend running at http://localhost:${port}`));
