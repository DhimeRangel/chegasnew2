/**
 * Utilitário para logging
 */

const config = require('../config');

class Logger {
  constructor() {
    this.env = config.server.env;
  }

  /**
   * Log de informação
   */
  info(message) {
    this.log('INFO', message);
  }

  /**
   * Log de aviso
   */
  warn(message) {
    this.log('WARN', message);
  }

  /**
   * Log de erro
   */
  error(message) {
    this.log('ERROR', message);
  }

  /**
   * Log de depuração (apenas em ambiente de desenvolvimento)
   */
  debug(message) {
    if (this.env === 'development') {
      this.log('DEBUG', message);
    }
  }

  /**
   * Método interno para formatar e exibir logs
   */
  log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }
}

// Exporta uma instância singleton
module.exports = new Logger();
