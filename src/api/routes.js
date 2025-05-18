/**
 * Definição de rotas da API
 */

const express = require('express');
const fuelController = require('./controllers/fuel');
const config = require('../config');

const router = express.Router();

// Rota para verificação de saúde da API
router.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'API Preço da Hora em funcionamento',
    version: '1.0.0'
  });
});

// Rotas para postos de combustível
router.get('/api/fuel/stations', fuelController.getFuelStationsByCep);
router.get('/api/fuel/stations/city', fuelController.getFuelStationsByCity);

// Rota para documentação
router.get('/api', (req, res) => {
  res.json({
    name: 'API Preço da Hora',
    version: '1.0.0',
    description: 'API para obter dados de postos de combustível do site Preço da Hora da Bahia',
    endpoints: [
      {
        path: '/api/fuel/stations',
        method: 'GET',
        description: 'Busca postos de combustível por CEP',
        parameters: [
          { name: 'cep', type: 'string', required: true, description: 'CEP para busca (formato: 00000000 ou 00000-000)' },
          { name: 'type', type: 'string', required: false, description: `Tipo de combustível (padrão: gasolina). Valores suportados: ${Object.keys(config.fuelTypes).join(', ')}` },
          { name: 'radius', type: 'number', required: false, description: 'Raio de busca em km (padrão: 5)' }
        ]
      },
      {
        path: '/api/fuel/stations/city',
        method: 'GET',
        description: 'Busca postos de combustível por cidade',
        parameters: [
          { name: 'city', type: 'string', required: true, description: 'Nome da cidade' },
          { name: 'state', type: 'string', required: false, description: 'Sigla do estado (padrão: BA)' },
          { name: 'type', type: 'string', required: false, description: `Tipo de combustível (padrão: gasolina). Valores suportados: ${Object.keys(config.fuelTypes).join(', ')}` },
          { name: 'radius', type: 'number', required: false, description: 'Raio de busca em km (padrão: 5)' }
        ]
      },
      {
        path: '/api/health',
        method: 'GET',
        description: 'Verificação de saúde da API',
        parameters: []
      }
    ]
  });
});

// Rota raiz
router.get('/', (req, res) => {
  res.redirect('/api');
});

module.exports = router;
