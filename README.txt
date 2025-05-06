COMO USAR ESSE PROJETO:

1. Crie um projeto no https://railway.app
2. Faça upload de todos esses arquivos no Railway (ou envie o ZIP)
3. Vá em "Variables" no Railway e adicione a variável de ambiente:
   Nome: GEMINI_API_KEY
   Valor: (sua chave copiada do site https://aistudio.google.com/app/apikey)

4. Clique em "Deploy" e acesse a URL fornecida.
5. Para testar, envie um POST para /perguntar com um JSON assim:
   {
     "pergunta": "Qual é a capital da França?"
   }

O sistema vai consultar a Gemini e retornar a resposta.