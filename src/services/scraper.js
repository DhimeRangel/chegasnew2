/**
 * Serviço de scraping para o site Preço da Hora
 */

const browserManager = require('../utils/browser');
const config = require('../config');
const logger = require('../utils/logger');
const cacheService = require('./cache');

class ScraperService {
  /**
   * Busca postos de combustível por coordenadas geográficas
   * @param {Object} coordinates - Coordenadas (latitude, longitude)
   * @param {string} fuelType - Tipo de combustível
   * @param {number} radius - Raio de busca em km
   * @returns {Promise<Array>} - Lista de postos de combustível
   */
  async getFuelStationsByCoordinates(coordinates, fuelType, radius) {
    // Gera chave de cache
    const cacheKey = cacheService.generateKey('coordinates', {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
      type: fuelType,
      radius
    });

    // Verifica se há dados em cache
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      logger.info(`Retornando dados de cache para coordenadas ${coordinates.latitude},${coordinates.longitude}`);
      return cachedData;
    }

    logger.info(`Buscando postos para coordenadas ${coordinates.latitude},${coordinates.longitude}, tipo ${fuelType}, raio ${radius}km`);

    // Obtém o termo de busca para o tipo de combustível
    const searchTerm = config.fuelTypes[fuelType]?.searchTerm || 'gasolina comum';

    try {
      // Obtém uma página do navegador
      const page = await browserManager.getPage();

      try {
        // Navega até a página inicial
        logger.info(`Navegando para ${config.precoHora.baseUrl}`);
        await page.goto(config.precoHora.baseUrl, { waitUntil: 'networkidle2' });

        // Simula comportamento humano
        await browserManager.simulateHumanBehavior(page);

        // Clica no botão de busca de combustíveis (pode variar dependendo da estrutura do site)
        logger.info('Procurando botão de busca de combustíveis');
        
        // Tenta diferentes seletores para o botão de combustíveis
        const buttonSelectors = [
          '.btn-combustivel',
          'a[href*="combustivel"]',
          'button:contains("Combustível")',
          'a:contains("Combustível")',
          '.card-combustivel'
        ];
        
        let buttonFound = false;
        for (const selector of buttonSelectors) {
          try {
            if (await page.$(selector)) {
              logger.info(`Botão encontrado com seletor: ${selector}`);
              await page.click(selector);
              buttonFound = true;
              break;
            }
          } catch (e) {
            // Continua tentando outros seletores
          }
        }
        
        if (!buttonFound) {
          logger.warn('Botão de combustíveis não encontrado, tentando método alternativo');
          // Tenta navegar diretamente para a página de produtos
          await page.goto(config.precoHora.searchUrl, { waitUntil: 'networkidle2' });
        }

        // Aguarda o modal ou formulário de busca
        await page.waitForTimeout(1000);
        
        // Seleciona o tipo de combustível
        logger.info(`Selecionando tipo de combustível: ${searchTerm}`);
        
        // Tenta diferentes abordagens para selecionar o combustível
        const fuelSelectors = [
          `input[value="${fuelType}"]`,
          `input[name="combustivel"][value="${fuelType}"]`,
          `label:contains("${searchTerm}")`,
          `div[data-combustivel="${fuelType}"]`
        ];
        
        let fuelSelected = false;
        for (const selector of fuelSelectors) {
          try {
            if (await page.$(selector)) {
              await page.click(selector);
              fuelSelected = true;
              break;
            }
          } catch (e) {
            // Continua tentando outros seletores
          }
        }
        
        if (!fuelSelected) {
          logger.warn(`Seletor para ${fuelType} não encontrado, tentando método alternativo`);
          // Tenta preencher um campo de busca
          await page.type('input[type="search"], input[name="termo"]', searchTerm);
        }

        // Preenche as coordenadas
        logger.info('Preenchendo coordenadas');
        await page.evaluate((lat, lng) => {
          // Tenta definir os valores nos campos de latitude e longitude
          const latField = document.querySelector('input[name="latitude"]');
          const lngField = document.querySelector('input[name="longitude"]');
          
          if (latField && lngField) {
            latField.value = lat;
            lngField.value = lng;
          } else {
            // Se não encontrar os campos, tenta definir variáveis globais
            window.latitude = lat;
            window.longitude = lng;
          }
        }, coordinates.latitude, coordinates.longitude);

        // Preenche o raio de busca
        logger.info(`Definindo raio de busca: ${radius}km`);
        await page.evaluate((r) => {
          const radiusField = document.querySelector('input[name="raio"]');
          if (radiusField) {
            radiusField.value = r;
          } else {
            window.raio = r;
          }
        }, radius);

        // Clica no botão de busca
        logger.info('Iniciando busca');
        const searchButtonSelectors = [
          'button[type="submit"]',
          'input[type="submit"]',
          'button.search-button',
          'button:contains("Buscar")',
          'a:contains("Buscar")'
        ];
        
        let searchButtonFound = false;
        for (const selector of searchButtonSelectors) {
          try {
            if (await page.$(selector)) {
              await page.click(selector);
              searchButtonFound = true;
              break;
            }
          } catch (e) {
            // Continua tentando outros seletores
          }
        }
        
        if (!searchButtonFound) {
          logger.warn('Botão de busca não encontrado, tentando método alternativo');
          // Tenta navegar diretamente para a URL de busca com parâmetros
          const searchParams = new URLSearchParams({
            termo: searchTerm,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            raio: radius,
            ordem: 'preco',
            tipo_ordem: 'ASC'
          });
          
          await page.goto(`${config.precoHora.searchUrl}?${searchParams.toString()}`, { 
            waitUntil: 'networkidle2' 
          });
        }

        // Aguarda os resultados carregarem
        logger.info('Aguardando resultados');
        await page.waitForTimeout(3000);
        
        // Extrai os dados dos postos
        logger.info('Extraindo dados dos postos');
        const stations = await this.extractStationsFromPage(page, fuelType);
        
        logger.info(`Encontrados ${stations.length} postos`);
        
        // Se não encontrou postos, tenta uma abordagem alternativa
        if (stations.length === 0) {
          logger.warn('Nenhum posto encontrado, tentando abordagem alternativa');
          return await this.getFuelStationsAlternative(page, coordinates, fuelType, radius);
        }
        
        // Armazena os resultados em cache
        cacheService.set(cacheKey, stations, config.cache.ttl);
        
        return stations;
      } finally {
        // Fecha a página
        await page.close();
      }
    } catch (error) {
      logger.error(`Erro ao buscar postos: ${error.message}`);
      throw new Error(`Falha ao buscar postos: ${error.message}`);
    }
  }

  /**
   * Método alternativo para buscar postos quando a abordagem principal falha
   */
  async getFuelStationsAlternative(page, coordinates, fuelType, radius) {
    try {
      logger.info('Tentando abordagem alternativa para busca de postos');
      
      // Navega diretamente para a URL de busca com o termo "posto"
      const searchParams = new URLSearchParams({
        termo: 'posto',
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        raio: radius,
        ordem: 'preco',
        tipo_ordem: 'ASC'
      });
      
      await page.goto(`${config.precoHora.searchUrl}?${searchParams.toString()}`, { 
        waitUntil: 'networkidle2' 
      });
      
      // Aguarda os resultados carregarem
      await page.waitForTimeout(3000);
      
      // Extrai os dados dos postos
      const stations = await this.extractStationsFromPage(page, fuelType);
      
      logger.info(`Abordagem alternativa encontrou ${stations.length} postos`);
      
      return stations;
    } catch (error) {
      logger.error(`Erro na abordagem alternativa: ${error.message}`);
      return [];
    }
  }

  /**
   * Extrai dados dos postos de combustível da página
   */
  async extractStationsFromPage(page, fuelType) {
    try {
      // Extrai os dados usando JavaScript no contexto da página
      const stations = await page.evaluate((fuelTypeParam) => {
        const results = [];
        
        // Tenta encontrar os cards de estabelecimentos
        const cards = document.querySelectorAll('.card-estabelecimento, .estabelecimento-card, .posto-card, .resultado-item');
        
        if (cards.length === 0) {
          console.log('Nenhum card de estabelecimento encontrado');
          return results;
        }
        
        // Itera sobre os cards
        cards.forEach(card => {
          try {
            // Extrai o nome do posto
            const nameElement = card.querySelector('h3, .nome-estabelecimento, .titulo');
            const name = nameElement ? nameElement.textContent.trim() : 'Posto sem nome';
            
            // Verifica se é um posto de combustível
            const isGasStation = name.toLowerCase().includes('posto') || 
                              name.toLowerCase().includes('ipiranga') ||
                              name.toLowerCase().includes('shell') ||
                              name.toLowerCase().includes('petrobras') ||
                              name.toLowerCase().includes('br') ||
                              name.toLowerCase().includes('combustivel') ||
                              name.toLowerCase().includes('combustível');
            
            // Se não for um posto de combustível, pula para o próximo
            if (!isGasStation) {
              return;
            }
            
            // Extrai o endereço
            const addressElement = card.querySelector('.endereco, .local, address');
            const address = addressElement ? addressElement.textContent.trim() : 'Endereço não disponível';
            
            // Extrai a cidade e estado
            let city = 'Cidade não disponível';
            let state = 'BA';
            
            const cityStateMatch = address.match(/([^,]+),\s*([A-Z]{2})/);
            if (cityStateMatch) {
              city = cityStateMatch[1].trim();
              state = cityStateMatch[2].trim();
            }
            
            // Extrai o preço
            const priceElement = card.querySelector('.preco, .valor, .price');
            let price = 0;
            
            if (priceElement) {
              const priceText = priceElement.textContent.trim();
              const priceMatch = priceText.match(/R\$\s*([\d,]+)/);
              if (priceMatch) {
                price = parseFloat(priceMatch[1].replace(',', '.'));
              }
            }
            
            // Extrai as coordenadas (se disponíveis)
            let latitude = undefined;
            let longitude = undefined;
            
            if (card.dataset.lat && card.dataset.lng) {
              latitude = parseFloat(card.dataset.lat);
              longitude = parseFloat(card.dataset.lng);
            }
            
            // Adiciona o posto à lista
            results.push({
              name,
              address,
              city,
              state,
              price,
              fuelType: fuelTypeParam,
              lastUpdate: new Date().toISOString(),
              latitude,
              longitude
            });
          } catch (error) {
            console.error(`Erro ao extrair dados do card: ${error.message}`);
          }
        });
        
        // Ordena os postos por preço (do mais barato para o mais caro)
        return results.sort((a, b) => a.price - b.price);
      }, fuelType);
      
      // Se não encontrou postos, tenta uma extração mais simples
      if (stations.length === 0) {
        logger.warn('Nenhum posto encontrado, tentando extração simples');
        
        // Captura o HTML da página para análise
        const html = await page.content();
        
        // Verifica se o HTML contém informações de preços
        if (html.includes('R$') && (html.includes('posto') || html.includes('Posto'))) {
          logger.info('Encontradas informações de preços no HTML, tentando extração manual');
          
          // Extrai manualmente usando expressões regulares
          const priceRegex = /R\$\s*([\d,]+)/g;
          const nameRegex = /<h3[^>]*>(.*?)<\/h3>/g;
          
          let priceMatch;
          let nameMatch;
          const manualStations = [];
          
          while ((priceMatch = priceRegex.exec(html)) !== null) {
            // Encontra o nome mais próximo
            nameMatch = nameRegex.exec(html);
            
            if (nameMatch) {
              const name = nameMatch[1].trim();
              const price = parseFloat(priceMatch[1].replace(',', '.'));
              
              manualStations.push({
                name,
                address: 'Endereço não disponível',
                city: 'Salvador',
                state: 'BA',
                price,
                fuelType,
                lastUpdate: new Date().toISOString()
              });
            }
          }
          
          logger.info(`Extração manual encontrou ${manualStations.length} postos`);
          return manualStations;
        }
      }
      
      return stations;
    } catch (error) {
      logger.error(`Erro ao extrair dados da página: ${error.message}`);
      return [];
    }
  }

  /**
   * Busca postos de combustível por CEP
   */
  async getFuelStationsByCep(cep, fuelType, radius, geocodingService) {
    try {
      logger.info(`Buscando postos por CEP ${cep}, tipo ${fuelType}, raio ${radius}km`);
      
      // Obtém as coordenadas do CEP
      const coordinates = await geocodingService.getCepCoordinates(cep);
      
      // Busca os postos por coordenadas
      const stations = await this.getFuelStationsByCoordinates(coordinates, fuelType, radius);
      
      return {
        success: true,
        data: stations,
        meta: {
          total: stations.length,
          radius,
          cep,
          coordinates
        }
      };
    } catch (error) {
      logger.error(`Erro ao buscar postos por CEP ${cep}: ${error.message}`);
      return {
        success: false,
        data: [],
        meta: {
          total: 0,
          radius,
          cep,
          coordinates: { latitude: 0, longitude: 0 }
        },
        error: error.message
      };
    }
  }

  /**
   * Busca postos de combustível por cidade
   */
  async getFuelStationsByCity(city, state, fuelType, radius, geocodingService) {
    try {
      logger.info(`Buscando postos por cidade ${city}/${state}, tipo ${fuelType}, raio ${radius}km`);
      
      // Obtém as coordenadas da cidade
      const coordinates = geocodingService.getCityCoordinates(city, state);
      
      // Busca os postos por coordenadas
      const stations = await this.getFuelStationsByCoordinates(coordinates, fuelType, radius);
      
      return {
        success: true,
        data: stations,
        meta: {
          total: stations.length,
          radius,
          city,
          state,
          coordinates
        }
      };
    } catch (error) {
      logger.error(`Erro ao buscar postos por cidade ${city}/${state}: ${error.message}`);
      return {
        success: false,
        data: [],
        meta: {
          total: 0,
          radius,
          city,
          state,
          coordinates: { latitude: 0, longitude: 0 }
        },
        error: error.message
      };
    }
  }
}

// Exporta uma instância singleton
module.exports = new ScraperService();
