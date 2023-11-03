const express = require('express');
const sql = require('mssql');
const app = express();
const puppeteer = require('puppeteer');
const fs = require('fs');
const util = require('util');
const pdf2pic = require('pdf2pic'); // Adicione esta linha

const config = {
    user: 'sa',
    password: 'local',
    server: '10.9.8.74',
    database: 'congressoweb',
    options: {
        encrypt: true, // Isso permite a conexão segura
        trustServerCertificate: true, // Isso permite confiar em certificados autoassinados
    }
};


app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/usuarios', async (req, res) => {
  const nome = req.query.nome;
  console.log('Nome recebido no servidor: ' + nome);

  try {
      const users = await searchUsers(nome);
      res.json(users);

      // Inicie a geração de certificado em segundo plano, para não bloquear o servidor
      generateCertificate(nome)
          .then(() => {
              console.log('Certificado gerado com sucesso.');
          })
          .catch((error) => {
              console.error('Erro ao gerar o certificado:', error);
          });
  } catch (error) {
      console.error('Erro ao buscar os usuários:', error);
      res.status(500).json({ error: 'Erro ao buscar os usuários' });
  }
});



  

async function generateCertificate(cpf) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
  
    try {
      // Abre a página da intranet do Senac
      await page.goto('https://intranet.pe.senac.br/dr/certificadocongresso/');
  
      // Insere o CPF no campo de entrada
      await page.type('.login-input', cpf);
  
      // Clica no botão "Gerar"
      await page.click('.login-button');
  
      // Aguarda um pouco para a página carregar
      await page.waitForTimeout(5000);
  
      // Salva a página como um arquivo PDF
      const pdfPath = 'certificado.pdf';
      await page.pdf({ path: pdfPath, format: 'A4', landscape: true });
  
  
      const result = await converter.convert(pdfPath);
  
      console.log(`Certificado gerado e salvo como ${result[0].name}`);
    } catch (error) {
      console.error('Ocorreu um erro:', error);
    } finally {
      await browser.close();
    }
  }

async function searchUsers(nome) {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT c.arquivo, p.nome, c.createdAt
FROM certificado c
INNER JOIN pessoa p ON c.nome = p.nome
WHERE p.cpf =  ${nome}`;

        // const result = await sql.query`SELECT * FROM usuario `;
        console.log(result)
        return result.recordset;
    } catch (err) {
        console.error('Erro ao buscar os usuários:', err);
    } finally {
        
        // await verificarExistenciaDaPagina( `https://www6.pe.senac.br/evento/certificado/congresso2021/${nome}.pdf`);
        sql.close();
    }
}

app.get(``, (req, res) => {
    res.sendFile('certificado.pdf', { root: __dirname });
  });

  app.get('/certificado.pdf', (req, res) => {
    res.sendFile('certificado.pdf', { root: __dirname });
  });

  app.get('/eventos/certificado/congresso2021/:formattedCPF.pdf', (req, res) => {
    // Simula uma resposta com status 200 OK
    res.status(200).send('Resposta com status 200 OK');
  });
  
  

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor está ouvindo na porta ${PORT}`);
});