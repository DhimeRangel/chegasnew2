# Arquitetura da API Preço da Hora com Puppeteer

## Visão Geral

Esta API fornece acesso aos dados de postos de combustível do site Preço da Hora da Bahia (precodahora.ba.gov.br) através de scraping com Puppeteer. A solução é projetada para ser hospedada no Render e fornecer endpoints RESTful para busca de postos por CEP ou cidade.

## Componentes Principais

### 1. Servidor Express

- Gerencia as requisições HTTP
- Implementa os endpoints da API
- Lida com validação de parâmetros e respostas

### 2. Módulo de Scraping com Puppeteer

- Gerencia o navegador headless
- Navega no site Preço da Hora
- Extrai dados dos postos de combustível
- Implementa estratégias anti-bloqueio

### 3. Gerenciador de Cache

- Armazena resultados recentes para reduzir carga no site alvo
- Implementa estratégia de expiração de cache
- Otimiza performance e reduz tempo de resposta

### 4. Módulo de Geocodificação

- Converte CEP em coordenadas geográficas
- Mapeia nomes de cidades para coordenadas
- Suporta busca por proximidade

## Estrutura de Diretórios

```
/
├── src/
│   ├── index.js           # Ponto de entrada da aplicação
│   ├── config.js          # Configurações da aplicação
│   ├── api/
│   │   ├── routes.js      # Definição de rotas da API
│   │   ├── controllers/   # Controladores para cada endpoint
│   │   └── middleware/    # Middlewares Express
│   ├── services/
│   │   ├── scraper.js     # Serviço de scraping com Puppeteer
│   │   ├── cache.js       # Serviço de cache
│   │   └── geocoding.js   # Serviço de geocodificação
│   └── utils/
│       ├── browser.js     # Utilitários para gerenciar o navegador
│       ├── html.js        # Utilitários para parsing de HTML
│       └── logger.js      # Utilitários para logging
├── tests/                 # Testes automatizados
├── .github/               # Configurações de CI/CD
├── Dockerfile             # Configuração para Docker
├── package.json           # Dependências e scripts
└── README.md              # Documentação
```

## Fluxo de Dados

1. **Requisição recebida**: O cliente faz uma requisição para um dos endpoints da API
2. **Validação de parâmetros**: A API valida os parâmetros da requisição
3. **Verificação de cache**: A API verifica se há resultados em cache para os parâmetros fornecidos
4. **Scraping (se necessário)**: Se não houver dados em cache, a API inicia o processo de scraping
   - Inicializa o navegador headless
   - Navega até o site Preço da Hora
   - Preenche o formulário de busca com os parâmetros fornecidos
   - Extrai os dados dos postos de combustível
   - Armazena os resultados em cache
5. **Resposta**: A API retorna os dados formatados para o cliente

## Endpoints da API

### 1. Busca por CEP

```
GET /api/fuel/stations?cep={cep}&type={tipo}&radius={raio}
```

Parâmetros:
- `cep` (obrigatório): CEP para busca (formato: 00000-000 ou 00000000)
- `type` (opcional): Tipo de combustível (padrão: gasolina)
- `radius` (opcional): Raio de busca em km (padrão: 5)

### 2. Busca por Cidade

```
GET /api/fuel/stations/city?city={cidade}&state={estado}&type={tipo}&radius={raio}
```

Parâmetros:
- `city` (obrigatório): Nome da cidade
- `state` (opcional): Sigla do estado (padrão: BA)
- `type` (opcional): Tipo de combustível (padrão: gasolina)
- `radius` (opcional): Raio de busca em km (padrão: 5)

### 3. Verificação de Saúde

```
GET /api/health
```

Retorna o status da API e informações sobre o servidor.

### 4. Documentação

```
GET /api
```

Retorna a documentação da API com descrição dos endpoints e parâmetros.

## Estratégias Anti-Bloqueio

Para evitar bloqueios do site Preço da Hora, a API implementa as seguintes estratégias:

1. **Rotação de User-Agent**: Alterna entre diferentes User-Agents para simular diferentes navegadores
2. **Delays aleatórios**: Adiciona delays aleatórios entre as requisições
3. **Simulação de comportamento humano**: Implementa movimentos de mouse e scrolling aleatórios
4. **Gerenciamento de cookies**: Mantém cookies de sessão para simular um usuário real
5. **Proxy rotativo** (opcional): Suporte para uso de proxies para alternar IPs

## Considerações de Performance

1. **Pooling de navegadores**: Mantém um pool de instâncias do navegador para reutilização
2. **Cache com TTL**: Implementa cache com tempo de vida configurável
3. **Compressão de resposta**: Utiliza compressão gzip para reduzir tamanho das respostas
4. **Timeout configurável**: Define limites de tempo para operações de scraping
5. **Retry automatizado**: Implementa tentativas automáticas em caso de falha

## Configuração para Render

A aplicação é otimizada para deploy no Render com as seguintes configurações:

1. **Tipo de serviço**: Web Service
2. **Ambiente de execução**: Node.js
3. **Comando de build**: `npm install`
4. **Comando de start**: `npm start`
5. **Variáveis de ambiente**:
   - `PORT`: Porta para o servidor (padrão: 3000)
   - `NODE_ENV`: Ambiente de execução (development/production)
   - `CACHE_TTL`: Tempo de vida do cache em segundos
   - `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: true (usa o Chrome instalado no Render)
   - `CHROME_PATH`: Caminho para o Chrome no Render

## Integração com n8n

A API é projetada para ser facilmente integrada com o n8n através do nó HTTP Request:

1. **URL**: URL do serviço no Render + endpoint apropriado
2. **Método**: GET
3. **Parâmetros**: Configurados conforme documentação da API
4. **Autenticação**: Nenhuma (ou básica, se configurada)
5. **Formato de resposta**: JSON
