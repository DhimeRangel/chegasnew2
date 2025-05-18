/**
 * Ponto de entrada da aplicação
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./api/routes');
const config = require('./config');
const logger = require('./utils/logger');
const browserManager = require('./utils/browser');

// Cria a aplicação Express
const app = express();

// Middleware para segurança
app.use(helmet());

// Middleware para CORS
app.use(cors());

// Middleware para compressão de resposta
app.use(compression());

// Middleware para logging de requisições
app.use(morgan('combined'));

// Middleware para parsing de JSON
app.use(express.json());

// Middleware para parsing de URL-encoded
app.use(express.urlencoded({ extended: true }));

// Adiciona as rotas
app.use(routes);

// Middleware para tratar rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    status: 404
  });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  logger.error(`Erro não tratado: ${err.message}`);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    status: 500
  });
});

// Inicializa o navegador Puppeteer
async function initBrowser() {
  try {
    await browserManager.initialize();
    logger.info('Navegador Puppeteer inicializado com sucesso');
  } catch (error) {
    logger.error(`Erro ao inicializar navegador Puppeteer: ${error.message}`);
    process.exit(1);
  }
}

// Inicia o servidor
async function startServer() {
  // Inicializa o navegador
  await initBrowser();
  
  // Inicia o servidor HTTP
  const port = config.server.port;
  const host = config.server.host;
  
  app.listen(port, host, () => {
    logger.info(`Servidor iniciado em http://${host}:${port}`);
    logger.info(`Ambiente: ${config.server.env}`);
  });
}

// Tratamento de sinais para encerramento gracioso
process.on('SIGTERM', async () => {
  logger.info('Recebido sinal SIGTERM, encerrando servidor...');
  await browserManager.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Recebido sinal SIGINT, encerrando servidor...');
  await browserManager.close();
  process.exit(0);
});

// Inicia o servidor
startServer().catch(error => {
  logger.error(`Erro ao iniciar servidor: ${error.message}`);
  process.exit(1);
});
