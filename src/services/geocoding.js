/**
 * Serviço de geocodificação para converter CEP em coordenadas
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class GeocodingService {
  /**
   * Converte um CEP em coordenadas geográficas
   * @param {string} cep - CEP a ser convertido
   * @returns {Promise<{latitude: number, longitude: number}>} - Coordenadas
   */
  async getCepCoordinates(cep) {
    try {
      // Remove o hífen do CEP, se houver
      const cleanCep = cep.replace('-', '');
      
      logger.info(`Convertendo CEP ${cleanCep} para coordenadas`);
      
      // Faz a requisição à API de geocodificação
      const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        timeout: 5000
      });
      
      // Verifica se a resposta foi bem-sucedida
      if (response.data.erro) {
        logger.warn(`CEP não encontrado: ${cleanCep}`);
        throw new Error(`CEP não encontrado: ${cleanCep}`);
      }
      
      // Obtém a cidade e o estado
      const city = response.data.localidade.toLowerCase();
      const state = response.data.uf;
      
      logger.info(`CEP ${cleanCep} corresponde a ${city}/${state}`);
      
      // Verifica se a cidade está no mapa de coordenadas
      if (config.cities[city]) {
        logger.info(`Coordenadas encontradas para ${city}`);
        return config.cities[city];
      }
      
      // Se não encontrou a cidade no mapa, tenta uma busca aproximada
      for (const [cityName, coords] of Object.entries(config.cities)) {
        if (cityName.includes(city) || city.includes(cityName)) {
          logger.info(`Coordenadas aproximadas encontradas para ${city} via ${cityName}`);
          return coords;
        }
      }
      
      // Se não encontrou nenhuma correspondência, usa as coordenadas de Salvador
      logger.warn(`Cidade não encontrada no mapa de coordenadas: ${city}. Usando coordenadas de Salvador.`);
      return config.cities['salvador'];
    } catch (error) {
      logger.error(`Erro ao obter coordenadas do CEP: ${error.message}`);
      // Em caso de erro, retorna as coordenadas de Salvador
      return config.cities['salvador'];
    }
  }

  /**
   * Obtém coordenadas de uma cidade
   * @param {string} city - Nome da cidade
   * @param {string} state - Sigla do estado
   * @returns {Object} - Coordenadas da cidade
   */
  getCityCoordinates(city, state) {
    logger.info(`Obtendo coordenadas para cidade ${city}/${state}`);
    
    // Normaliza o nome da cidade
    const normalizedCity = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Verifica se a cidade está no mapa de coordenadas
    if (config.cities[normalizedCity]) {
      logger.info(`Coordenadas encontradas para ${normalizedCity}`);
      return config.cities[normalizedCity];
    }
    
    // Se não encontrou a cidade no mapa, tenta uma busca aproximada
    for (const [cityName, coords] of Object.entries(config.cities)) {
      const normalizedCityName = cityName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalizedCityName.includes(normalizedCity) || normalizedCity.includes(normalizedCityName)) {
        logger.info(`Coordenadas aproximadas encontradas para ${normalizedCity} via ${normalizedCityName}`);
        return coords;
      }
    }
    
    // Se não encontrou nenhuma correspondência, usa as coordenadas de Salvador
    logger.warn(`Cidade não encontrada no mapa de coordenadas: ${city}. Usando coordenadas de Salvador.`);
    return config.cities['salvador'];
  }
}

// Exporta uma instância singleton
module.exports = new GeocodingService();
