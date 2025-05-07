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

  if (dados.phone !== '5511915491174') return res.send({ status: 'ignorado' });

  console.log('📨 Mensagem recebida no webhook:', JSON.stringify(dados, null, 2));

  const pergunta = dados?.text?.message;
  if (!pergunta) return res.send({ status: 'sem texto' });

  try {
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
    const respostaFinal = respostaTexto.slice(0, 400);

    const urlZAPI = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

    const respostaZAPI = await axios.post(urlZAPI, {
      phone: dados.phone,
      message: respostaFinal,
    });

    console.log('✅ Mensagem enviada via Z-API:', respostaZAPI.data);
    res.send({ status: 'respondido com sucesso' });
  } catch (erro) {
    console.error('❌ Erro ao enviar resposta:', erro.response?.data || erro.message);
    res.status(500).send({ erro: 'Erro ao responder' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
