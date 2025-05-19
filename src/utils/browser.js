/**
 * Utilitário para gerenciamento do navegador Puppeteer
 * Versão otimizada para Render
 */

const puppeteer = require('puppeteer');
const config = require('../config');
const logger = require('./logger');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.isInitializing = false;
    this.initPromise = null;
  }

  /**
   * Inicializa o navegador se ainda não estiver inicializado
   */
  async initialize() {
    if (this.browser) {
      return this.browser;
    }

    if (this.isInitializing) {
      return this.initPromise;
    }

    this.isInitializing = true;
    
    logger.info('Inicializando navegador Puppeteer');
    
    try {
      // Configuração específica para o Render
      const options = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      };
      
      // No Render, não especificamos o executablePath
      this.initPromise = puppeteer.launch(options).then(browser => {
        logger.info('Navegador inicializado com sucesso');
        this.browser = browser;
        this.isInitializing = false;
        return browser;
      }).catch(error => {
        logger.error(`Erro ao inicializar navegador Puppeteer: ${error.message}`);
        this.isInitializing = false;
        throw error;
      });
    } catch (error) {
      logger.error(`Erro ao inicializar navegador: ${error.message}`);
      this.isInitializing = false;
      throw error;
    }

    return this.initPromise;
  }

  /**
   * Obtém uma nova página do navegador
   */
  async getPage() {
    const browser = await this.initialize();
    const page = await browser.newPage();
    
    // Configura um user agent aleatório
    const userAgent = this.getRandomUserAgent();
    await page.setUserAgent(userAgent);
    
    // Configura timeout de navegação
    page.setDefaultNavigationTimeout(config.precoHora.timeout);
    
    // Desabilita carregamento de imagens e fontes para melhorar performance
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (
        request.resourceType() === 'image' || 
        request.resourceType() === 'font' ||
        request.resourceType() === 'media'
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    return page;
  }

  /**
   * Fecha o navegador e libera recursos
   */
  async close() {
    if (this.browser) {
      logger.info('Fechando navegador');
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Retorna um user agent aleatório da lista de configuração
   */
  getRandomUserAgent() {
    const userAgents = config.userAgents;
    const randomIndex = Math.floor(Math.random() * userAgents.length);
    return userAgents[randomIndex];
  }

  /**
   * Adiciona delays aleatórios para simular comportamento humano
   */
  async randomDelay(page, min = 500, max = 2000) {
    const delay = Math.floor(Math.random() * (max - min + 1) + min);
    await page.waitForTimeout(delay);
  }

  /**
   * Simula comportamento humano na página
   */
  async simulateHumanBehavior(page) {
    // Scroll aleatório
    await page.evaluate(() => {
      const scrollAmount = Math.floor(Math.random() * 500);
      window.scrollBy(0, scrollAmount);
    });
    
    // Delay aleatório
    await this.randomDelay(page);
  }
}

// Exporta uma instância singleton
module.exports = new BrowserManager();
