/**
 * Controladores para endpoints de combustível
 */

const scraperService = require('../../services/scraper');
const geocodingService = require('../../services/geocoding');
const config = require('../../config');
const logger = require('../../utils/logger');

/**
 * Endpoint para busca de postos por CEP
 */
async function getFuelStationsByCep(req, res) {
  try {
    const { cep } = req.query;
    
    // Validação do CEP
    if (!cep || !/^\d{5}-?\d{3}$/.test(cep)) {
      logger.warn(`CEP inválido: ${cep}`);
      return res.status(400).json({ 
        success: false, 
        error: "CEP inválido. Formato esperado: 00000-000 ou 00000000" 
      });
    }
    
    // Parâmetros opcionais
    const typeParam = req.query.type || 'gasolina';
    const radiusParam = req.query.radius || '5';
    
    // Validação e conversão de parâmetros
    const fuelType = typeParam.toLowerCase();
    const radius = parseInt(radiusParam, 10) || 5;
    
    // Verifica se o tipo de combustível é suportado
    if (!config.fuelTypes[fuelType]) {
      logger.warn(`Tipo de combustível inválido: ${fuelType}`);
      return res.status(400).json({
        success: false,
        error: `Tipo de combustível inválido. Valores suportados: ${Object.keys(config.fuelTypes).join(', ')}`
      });
    }
    
    logger.info(`Requisição de busca por CEP ${cep}, tipo ${fuelType}, raio ${radius}km`);
    
    // Chamada ao serviço de scraping
    const result = await scraperService.getFuelStationsByCep(
      cep.replace("-", ""),
      fuelType,
      radius,
      geocodingService
    );
    
    // Resposta
    return res.json(result);
  } catch (error) {
    logger.error(`Erro ao processar requisição: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: `Erro interno do servidor: ${error.message || "Erro desconhecido"}` 
    });
  }
}

/**
 * Endpoint para busca de postos por cidade
 */
async function getFuelStationsByCity(req, res) {
  try {
    const { city } = req.query;
    
    // Validação da cidade
    if (!city || city.length < 3) {
      logger.warn(`Nome de cidade inválido: ${city}`);
      return res.status(400).json({ 
        success: false, 
        error: "Nome de cidade inválido. Deve conter pelo menos 3 caracteres." 
      });
    }
    
    // Parâmetros opcionais
    const state = req.query.state || 'BA';
    const typeParam = req.query.type || 'gasolina';
    const radiusParam = req.query.radius || '5';
    
    // Validação e conversão de parâmetros
    const fuelType = typeParam.toLowerCase();
    const radius = parseInt(radiusParam, 10) || 5;
    
    // Verifica se o tipo de combustível é suportado
    if (!config.fuelTypes[fuelType]) {
      logger.warn(`Tipo de combustível inválido: ${fuelType}`);
      return res.status(400).json({
        success: false,
        error: `Tipo de combustível inválido. Valores suportados: ${Object.keys(config.fuelTypes).join(', ')}`
      });
    }
    
    logger.info(`Requisição de busca por cidade ${city}/${state}, tipo ${fuelType}, raio ${radius}km`);
    
    // Chamada ao serviço de scraping
    const result = await scraperService.getFuelStationsByCity(
      city,
      state,
      fuelType,
      radius,
      geocodingService
    );
    
    // Resposta
    return res.json(result);
  } catch (error) {
    logger.error(`Erro ao processar requisição: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      error: `Erro interno do servidor: ${error.message || "Erro desconhecido"}` 
    });
  }
}

module.exports = {
  getFuelStationsByCep,
  getFuelStationsByCity
};
