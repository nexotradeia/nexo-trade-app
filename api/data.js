// NexoTrade — router de datos (consolida endpoints para no superar el límite
// de 12 funciones serverless del plan Hobby de Vercel). Las implementaciones
// viven en /lib (no cuentan como funciones). GET /api/data?type=crypto|premarket|econ|dividends|ipos|commodities|ark
import crypto from '../lib/crypto.js';
import premarket from '../lib/premarket.js';
import econCalendar from '../lib/econCalendar.js';
import dividends from '../lib/dividends.js';
import ipos from '../lib/ipos.js';
import commodities from '../lib/commodities.js';
import ark from '../lib/ark.js';
import quotes from '../lib/quotes.js';
import fxhist from '../lib/fxhist.js';
import technical from '../lib/technical.js';
import pulse from '../lib/pulse.js';
import social from '../lib/social.js';
import thirteenf from '../lib/thirteenf.js';

const ROUTES = { crypto, premarket, econ: econCalendar, econCalendar, dividends, ipos, commodities, ark, quotes, fxhist, technical, pulse, social, thirteenf };

export default async function handler(req, res) {
  const type = String(req.query.type || "").trim();
  const fn = ROUTES[type];
  if (!fn) { res.setHeader("Cache-Control","no-store"); return res.status(400).json({ error: "unknown type: " + type }); }
  return fn(req, res);
}
