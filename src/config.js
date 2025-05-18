/**
 * Configurações da API
 */

module.exports = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development'
  },

  // Configurações do site Preço da Hora
  precoHora: {
    baseUrl: 'https://precodahora.ba.gov.br/',
    searchUrl: 'https://precodahora.ba.gov.br/produtos/',
    timeout: 30000, // 30 segundos
  },

  // Configurações do Puppeteer
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    // Caminho para o Chrome no Render (se disponível)
    executablePath: process.env.CHROME_PATH || undefined
  },

  // Configurações de cache
  cache: {
    enabled: true,
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hora em segundos
  },

  // Tipos de combustível suportados
  fuelTypes: {
    gasolina: {
      name: 'Gasolina Comum',
      searchTerm: 'gasolina comum'
    },
    gasolina_aditivada: {
      name: 'Gasolina Aditivada',
      searchTerm: 'gasolina aditivada'
    },
    etanol: {
      name: 'Etanol',
      searchTerm: 'etanol'
    },
    diesel: {
      name: 'Diesel',
      searchTerm: 'diesel'
    },
    gnv: {
      name: 'GNV',
      searchTerm: 'gnv'
    }
  },

  // Coordenadas de cidades principais da Bahia
  cities: {
    "salvador": { latitude: -12.9714, longitude: -38.5014 },
    "feira de santana": { latitude: -12.2667, longitude: -38.9667 },
    "vitoria da conquista": { latitude: -14.8611, longitude: -40.8442 },
    "camaçari": { latitude: -12.6996, longitude: -38.3263 },
    "itabuna": { latitude: -14.7856, longitude: -39.2803 },
    "juazeiro": { latitude: -9.4117, longitude: -40.5089 },
    "lauro de freitas": { latitude: -12.8978, longitude: -38.3269 },
    "ilhéus": { latitude: -14.7933, longitude: -39.0465 },
    "jequié": { latitude: -13.8511, longitude: -40.0828 },
    "teixeira de freitas": { latitude: -17.5399, longitude: -39.7428 },
    "barreiras": { latitude: -12.1522, longitude: -44.9976 },
    "alagoinhas": { latitude: -12.1353, longitude: -38.4208 },
    "porto seguro": { latitude: -16.4497, longitude: -39.0647 },
    "simões filho": { latitude: -12.7866, longitude: -38.4029 },
    "paulo afonso": { latitude: -9.3983, longitude: -38.2142 },
    "eunápolis": { latitude: -16.3717, longitude: -39.5839 },
    "santo antônio de jesus": { latitude: -12.9683, longitude: -39.2586 },
    "valença": { latitude: -13.3669, longitude: -39.073 },
    "candeias": { latitude: -12.6717, longitude: -38.5472 },
    "guanambi": { latitude: -14.2231, longitude: -42.7799 }
  },

  // User agents para rotação
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.59'
  ]
};
