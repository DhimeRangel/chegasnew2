/**
 * Serviço de cache para armazenar resultados de consultas
 */

const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.cache = new Map();
    this.enabled = true;
  }

  /**
   * Configura se o cache está habilitado
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`Cache ${enabled ? 'habilitado' : 'desabilitado'}`);
  }

  /**
   * Obtém um item do cache
   * @param {string} key - Chave do item
   * @returns {any|null} - Item do cache ou null se não encontrado/expirado
   */
  get(key) {
    if (!this.enabled) {
      return null;
    }

    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verifica se o item expirou
    if (Date.now() > item.expiry) {
      logger.debug(`Cache expirado para chave: ${key}`);
      this.cache.delete(key);
      return null;
    }

    logger.debug(`Cache hit para chave: ${key}`);
    return item.value;
  }

  /**
   * Armazena um item no cache
   * @param {string} key - Chave do item
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em segundos
   */
  set(key, value, ttl) {
    if (!this.enabled) {
      return;
    }

    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
    logger.debug(`Item armazenado em cache com chave: ${key}, TTL: ${ttl}s`);
  }

  /**
   * Remove um item do cache
   * @param {string} key - Chave do item
   */
  delete(key) {
    this.cache.delete(key);
    logger.debug(`Item removido do cache: ${key}`);
  }

  /**
   * Limpa todo o cache
   */
  clear() {
    this.cache.clear();
    logger.info('Cache limpo');
  }

  /**
   * Gera uma chave de cache baseada nos parâmetros
   * @param {string} prefix - Prefixo da chave
   * @param {Object} params - Parâmetros para gerar a chave
   * @returns {string} - Chave de cache
   */
  generateKey(prefix, params) {
    const sortedParams = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `${prefix}:${sortedParams}`;
  }
}

// Exporta uma instância singleton
module.exports = new CacheService();
