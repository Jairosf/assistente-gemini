require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor do Assistente Pessoal está online!');
});

app.post('/webhook', async (req, res) => {
  const dados = req.body;

  // Permitir respostas apenas para este número específico
  if (dados.phone !== '5511915491174') return res.send({ status: 'ignorado' });

  console.log('📨 Mensagem recebida no webhook:', JSON.stringify(dados, null, 2));

  const pergunta = dados?.text?.message;
  if (!pergunta) return res.send({ status: 'sem texto válido' });

  try {
    // Chamada à API Gemini
    const respostaGemini = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      { contents: [{ parts: [{ text: pergunta }] }] },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
      }
    );

    const respostaTexto = respostaGemini.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Não entendi.';

    // Truncar para 400 caracteres (limite típico)
    const respostaFinal = respostaTexto.slice(0, 400);

    // Enviar resposta via Z-API
    await axios.post(`https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`, {
      phone: dados.phone,
      message: respostaFinal,
    });

    res.send({ status: 'respondido com sucesso' });
  } catch (err) {
    console.error('Erro ao responder via Gemini/Z-API:', err.message);
    res.status(500).send({ erro: 'Falha ao responder' });
  }
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
