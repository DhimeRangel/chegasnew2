# API Preço da Hora com Puppeteer

API para obter dados de postos de combustível do site Preço da Hora da Bahia (precodahora.ba.gov.br) através de scraping com Puppeteer.

## Funcionalidades

- Busca de postos de combustível por CEP
- Busca de postos de combustível por cidade
- Suporte para diferentes tipos de combustível (gasolina, gasolina aditivada, etanol, diesel, GNV)
- Cache de resultados para melhor performance
- Estratégias anti-bloqueio para garantir funcionamento contínuo

## Requisitos

- Node.js 16 ou superior
- NPM ou Yarn

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/precodahora-puppeteer-api.git
cd precodahora-puppeteer-api

# Instalar dependências
npm install
```

## Configuração

A API pode ser configurada através de variáveis de ambiente:

- `PORT`: Porta para o servidor (padrão: 3000)
- `HOST`: Host para o servidor (padrão: 0.0.0.0)
- `NODE_ENV`: Ambiente de execução (development/production)
- `CACHE_TTL`: Tempo de vida do cache em segundos (padrão: 3600)
- `CHROME_PATH`: Caminho para o Chrome (usado no Render)

## Uso Local

```bash
# Iniciar o servidor em modo de desenvolvimento
npm run dev

# Iniciar o servidor em modo de produção
npm start
```

## Endpoints da API

### Busca por CEP

```
GET /api/fuel/stations?cep={cep}&type={tipo}&radius={raio}
```

Parâmetros:
- `cep` (obrigatório): CEP para busca (formato: 00000-000 ou 00000000)
- `type` (opcional): Tipo de combustível (padrão: gasolina)
- `radius` (opcional): Raio de busca em km (padrão: 5)

Tipos de combustível suportados:
- `gasolina`: Gasolina Comum
- `gasolina_aditivada`: Gasolina Aditivada
- `etanol`: Etanol
- `diesel`: Diesel
- `gnv`: GNV

### Busca por Cidade

```
GET /api/fuel/stations/city?city={cidade}&state={estado}&type={tipo}&radius={raio}
```

Parâmetros:
- `city` (obrigatório): Nome da cidade
- `state` (opcional): Sigla do estado (padrão: BA)
- `type` (opcional): Tipo de combustível (padrão: gasolina)
- `radius` (opcional): Raio de busca em km (padrão: 5)

### Verificação de Saúde

```
GET /api/health
```

### Documentação

```
GET /api
```

## Exemplo de Resposta

```json
{
  "success": true,
  "data": [
    {
      "name": "POSTO EXEMPLO",
      "address": "Av. Principal, 123, Centro, Salvador",
      "city": "Salvador",
      "state": "BA",
      "price": 5.49,
      "fuelType": "gasolina",
      "lastUpdate": "2025-05-18T22:10:35.075Z",
      "latitude": -12.9714,
      "longitude": -38.5014
    }
  ],
  "meta": {
    "total": 1,
    "radius": 5,
    "city": "Salvador",
    "state": "BA",
    "coordinates": {
      "latitude": -12.9714,
      "longitude": -38.5014
    }
  }
}
```

## Deploy no Render

Esta API é otimizada para deploy no Render. Siga os passos abaixo para fazer o deploy:

1. Crie uma conta no [Render](https://render.com/) se ainda não tiver
2. Clique em "New" e selecione "Web Service"
3. Conecte seu repositório GitHub
4. Configure o serviço:
   - **Name**: precodahora-api (ou outro nome de sua escolha)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Em "Advanced", adicione as seguintes variáveis de ambiente:
   - `NODE_ENV`: production
   - `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: true
6. Clique em "Create Web Service"

O Render fornecerá uma URL para sua API (algo como `https://precodahora-api.onrender.com`).

## Integração com n8n

Para integrar esta API com o n8n, siga os passos abaixo:

1. Adicione um nó "HTTP Request" no seu fluxo
2. Configure o nó:
   - **Method**: GET
   - **URL**: `https://sua-api.onrender.com/api/fuel/stations/city` (para busca por cidade)
   - **Query Parameters**:
     - `city`: Salvador (ou outra cidade)
     - `type`: gasolina (ou outro tipo de combustível)
     - `radius`: 15 (ou outro valor em km)
3. Execute o fluxo

Para busca por CEP, use a URL `https://sua-api.onrender.com/api/fuel/stations` com o parâmetro `cep` em vez de `city`.

## Limitações

- O site Preço da Hora pode bloquear requisições de scraping se forem muito frequentes
- O Render pode ter limitações de recursos no plano gratuito
- O tempo de resposta pode variar dependendo da carga do site alvo

## Licença

MIT
