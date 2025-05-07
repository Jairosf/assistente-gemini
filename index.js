require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor do Assistente Pessoal está online!');
});

app.post('/webhook', (req, res) => {
    const dados = req.body;
    console.log('📨 Mensagem recebida no webhook:', JSON.stringify(dados, null, 2));
    res.send({ status: 'ok' });
});

app.post('/perguntar', async (req, res) => {
    const pergunta = req.body.pergunta;
    if (!pergunta) return res.status(400).send({ erro: 'Pergunta ausente.' });

    try {
        const resposta = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            { contents: [{ parts: [{ text: pergunta }] }] },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.GEMINI_API_KEY,
                },
            }
        );
        const texto = resposta.data.candidates[0].content.parts[0].text;
        res.send({ resposta: texto });
    } catch (err) {
        console.error('Erro na API Gemini:', err.message);
        res.status(500).send({ erro: 'Erro ao consultar Gemini.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
