# Live Markets en tiempo real — guía rápida

## Qué encontré (8 jun 2026)
"Live Markets" no se movía solo. Causa: **los planes gratis no dan acciones en tiempo real.**
- Twelve Data gratis: 8 créditos/min, datos con 4h de retraso.
- Finnhub gratis: 60 llamadas/min, **sin WebSocket de acciones**, datos con 20 min de retraso. Tus 50 tickers cada 45s saturaban la key compartida → volvían vacíos.
- CoinGecko (cripto): sí funciona en vivo.

## Qué dejé hecho (sin costo, ya en el código)
1. **La cinta y Live Markets ya nunca quedan vacías:** precio real cuando Finnhub responde, respaldo curado cuando no, y **cambio% real** (se acabó el "▲0%").
2. **Cripto en vivo** vía CoinGecko.
3. **Código listo para FMP:** si defines la variable `FMP_KEY`, pasa a tiempo real con **una sola llamada batch** para los 50 tickers (acciones + índices). Sin la key, sigue el modo gratis.

Archivos cambiados: `lib/quotes.js` y `src/App.jsx` (14 strings traducidos al inglés).

## Para activar tiempo real (cuando puedas)
**Opción barata recomendada: Financial Modeling Prep (FMP) ~$19/mes** — el más económico con tiempo real ilimitado (REST + WebSocket) y endpoint batch.

Pasos:
1. Crea cuenta en financialmodelingprep.com y copia tu API key.
   - (Tienen plan **gratis** de 250 llamadas/día: sirve para probar el batch, refrescando cada ~6 min.)
2. En Vercel → tu proyecto → Settings → Environment Variables → agrega:
   - Nombre: `FMP_API_KEY`  ← (usa exactamente este nombre)
   - Valor: tu key
   - Environment: Production (y Preview si quieres)
3. Redeploy. Listo.

**Una sola key activa TODO:** con `FMP_API_KEY` definida funcionan a la vez los precios en vivo (acciones/índices/commodities), el **calendario de dividendos**, las **IPOs**, el **calendario económico** y los montos completos de **insiders**. (Antes los precios en vivo leían `FMP_KEY` y el resto `FMP_API_KEY`; ya unifiqué el código para que ambos nombres sirvan, pero usa `FMP_API_KEY` para no tener dos variables.)

> Nota dividendos/econ: el plan **gratis** de FMP ya **no** incluye `stock_dividend_calendar` ni `economic_calendar` (devuelven 403). Para datos reales de dividendos necesitas un plan de pago de FMP; sin él, la app sigue mostrando el calendario curado de respaldo.

## Pendiente (no toqué — requieren pasar el prop de idioma, riesgo de romper build)
Strings en español que aún se ven en modo inglés en: Paper Trading, panel Admin, footer del newsletter, "Sin trades recientes" (Congreso). Los puedo hacer como tarea aparte y verificada.
