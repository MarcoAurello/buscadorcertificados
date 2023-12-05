const express = require('express');
const sql = require('mssql');
const app = express();
const puppeteer = require('puppeteer');
const fs = require('fs');
const util = require('util');
const pdf2pic = require('pdf2pic'); // Adicione esta linha

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const config = {
  user: 'sa',
  password: 'local',
  server: 'SQLSERVER',
  database: 'congressoweb',
  options: {
    encrypt: true, // Isso permite a conexão segura
    trustServerCertificate: true, // Isso permite confiar em certificados autoassinados
  }
};

const configAntigo = {
  user: 'sa',
  password: 'local',
  server: 'SQLSERVER',
  database: 'CongressosAnteriores',
  options: {
    encrypt: true, // Isso permite a conexão segura
    trustServerCertificate: true, // Isso permite confiar em certificados autoassinados
  }
};


app.use(express.json());



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('https://www7.pe.senac.br/certificadocongresso/usuarios/usuarios', async (req, res) => {
  const nome = req.query.nome;
  console.log('Nome recebido no servidor: ' + nome);
  
  
  const users = await searchUsers(nome);
  const usersAntigos = await searchUsersAntigos(nome);
  const usersAntigos15 = await searchUsersAntigos15(nome);
  const usersAntigos16 = await searchUsersAntigos16(nome);
  const usersAntigos17 = await searchUsersAntigos17(nome);
  const usersAntigos18 = await searchUsersAntigos18(nome);


  // generateCertificate(nome)


  // generateCertificate(nome)

  const responseData = {
    users: users,
    usersAntigos: usersAntigos,
    usersAntigos15: usersAntigos15,
    usersAntigos16: usersAntigos16,
    usersAntigos17: usersAntigos17,
    usersAntigos18: usersAntigos18
    // usersAntigos18: usersAntigos18,
  };

  res.json(responseData);


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

async function searchUsersAntigos(nome) {
  try {
    await sql.connect(configAntigo);


    const result = await sql.query`SELECT  p.caminho , p.arquivo
FROM Inscritos2014 p
WHERE p.cpf =  ${nome}`;

    // const result = await sql.query`SELECT * FROM usuario `;
    console.log(result)
    return result.recordset;
  } catch (err) {
    console.error('Erro ao buscar os usuários:', err);
  } finally {

    sql.close();
  }
}

async function searchUsersAntigos15(nome) {
  try {
    await sql.connect(configAntigo);


    const result = await sql.query`SELECT  p.caminho , p.arquivo
FROM Inscritos2015 p
WHERE p.cpf =  ${nome}`;

    // const result = await sql.query`SELECT * FROM usuario `;
    console.log(result)
    return result.recordset;
  } catch (err) {
    console.error('Erro ao buscar os usuários:', err);
  } finally {

    sql.close();
  }
}

async function searchUsersAntigos16(nome) {
  try {
    await sql.connect(configAntigo);


    const result = await sql.query`SELECT  p.caminho , p.arquivo
FROM Inscritos2016 p
WHERE p.cpf =  ${nome}`;

    // const result = await sql.query`SELECT * FROM usuario `;
    console.log(result)
    return result.recordset;
  } catch (err) {
    console.error('Erro ao buscar os usuários:', err);
  } finally {

    sql.close();
  }
}

async function searchUsersAntigos17(nome) {
  try {
    await sql.connect(configAntigo);


    const result = await sql.query`SELECT  p.caminho , p.arquivo
FROM Inscritos2017 p
WHERE p.cpf =  ${nome}`;

    // const result = await sql.query`SELECT * FROM usuario `;
    console.log(result)
    return result.recordset;
  } catch (err) {
    console.error('Erro ao buscar os usuários:', err);
  } finally {

    sql.close();
  }
}

async function searchUsersAntigos18(nome) {
  try {
    await sql.connect(configAntigo);


    const result = await sql.query`SELECT  p.caminho , p.arquivo
FROM Inscritos2018 p
WHERE p.cpf =  ${nome}`;

    // const result = await sql.query`SELECT * FROM usuario `;
    console.log(result)
    return result.recordset;
  } catch (err) {
    console.error('Erro ao buscar os usuários:', err);
  } finally {

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


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Erro interno do servidor!');
});









// app.use('file://10.9.8.7/congresso$/', express.static( 'file://10.9.8.7/congresso$/'));

// // Rota para acessar arquivos PDF
// app.get('file://10.9.8.7/congresso$//:filename', (req, res) => {
//   const filename = req.params.filename;
//   const filePath = path.join('file://10.9.8.7/congresso$/', filename);

//   res.sendFile(filePath);
// });






const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor está ouvindo na porta ${PORT}`);
});
