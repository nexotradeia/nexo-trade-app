// NEXO TRADE — build: 2026-05-21 21:00:00
import { useState, useEffect, useRef, useContext, createContext, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// ── SUPABASE CLIENT ───────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://glvrzrtatekuuhwtzzhd.supabase.co";
const SUPABASE_KEY  = "sb_publishable_1CCvWAO3iqcFZmcqvUdlZg_rOdSZZcl";
const supabase      = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'nexotrade-session',
  }
});

// ── STRIPE ────────────────────────────────────────────────────────────────────
// email_stripe_setup.py reemplaza este link automáticamente con el link real
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/6oU00c6U24PDe4U3S5aR202";


// ── CASHTAG + @MENTION RENDERER ───────────────────────────────────────────────
function renderWithCashtags(text, onTickerClick, onMentionClick){
  if(!text) return text;
  // Detecta $TICKER (cashtag verde) y @TICKER (mención oscura)
  const parts = text.split(/(\$[A-Z]{1,5}|@[A-Z0-9]{1,15})/g);
  return parts.map((part, i) => {
    if(/^\$[A-Z]{1,5}$/.test(part)){
      // Cashtag — verde brillante
      return <span key={i} onClick={()=>onTickerClick&&onTickerClick(part.slice(1))}
        style={{color:"#007A48",fontWeight:700,cursor:"pointer",background:"rgba(0,160,96,0.1)",borderRadius:4,padding:"1px 5px",border:"1px solid rgba(0,160,96,0.25)",fontSize:"0.9em",letterSpacing:0.3,fontFamily:"monospace"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,229,143,0.18)";e.currentTarget.style.boxShadow="0 0 8px rgba(0,229,143,0.3)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,229,143,0.1)";e.currentTarget.style.boxShadow="none";}}
      >{part}</span>;
    }
    if(/^@[A-Z0-9]{1,15}$/.test(part)){
      // @Mención — chip oscuro azulado, abre vista del ticker
      const sym = part.slice(1);
      return <span key={i} onClick={()=>onMentionClick&&onMentionClick(sym)}
        style={{color:"#2563EB",fontWeight:700,cursor:"pointer",background:"rgba(37,99,235,0.07)",borderRadius:5,padding:"1px 7px",border:"1px solid rgba(37,99,235,0.25)",fontSize:"0.88em",letterSpacing:0.2,fontFamily:"monospace",display:"inline-block"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(30,41,59,0.98)";e.currentTarget.style.borderColor="rgba(59,130,246,0.55)";e.currentTarget.style.color="#93C5FD";e.currentTarget.style.boxShadow="0 0 10px rgba(59,130,246,0.25)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(15,23,42,0.95)";e.currentTarget.style.borderColor="rgba(71,85,105,0.55)";e.currentTarget.style.color="#0F172A";e.currentTarget.style.boxShadow="none";}}
      >{part}</span>;
    }
    return part;
  });
}

// ── THEME — Dark Luxury Fintech ───────────────────────────────────────────────
const C = {
  bg:"#F0F4F8", surface:"#FFFFFF", card:"#FFFFFF", card2:"#F8FAFC",
  border:"rgba(15,23,42,0.09)", borderHover:"rgba(0,168,255,0.4)",
  accent:"#00A8FF", accentDim:"rgba(0,168,255,0.09)", accentText:"#0090D4",
  bull:"#16A34A", bullBg:"rgba(22,163,74,0.09)", bear:"#DC2626", bearBg:"rgba(220,38,38,0.09)",
  gold:"#D97706", goldBg:"rgba(217,119,6,0.1)", purple:"#7C3AED", purpleBg:"rgba(124,58,237,0.08)",
  blue:"#00A8FF", blueBg:"rgba(0,168,255,0.08)", orange:"#EA580C", orangeBg:"rgba(234,88,12,0.08)",
  text:"#0F172A", muted:"#64748B", muted2:"#94A3B8",
  shadow:"0 2px 12px rgba(0,0,0,0.07)", shadowMd:"0 8px 32px rgba(0,0,0,0.1)",
  shadowGlow:"0 0 24px rgba(0,168,255,0.12)", shadowGlowBlue:"0 0 24px rgba(0,168,255,0.1)",
  glass:"rgba(255,255,255,0.88)", glassBorder:"rgba(15,23,42,0.09)",
  vip:"#7C3AED", vipGlow:"rgba(124,58,237,0.2)",
};

// ── LANGS ─────────────────────────────────────────────────────────────────────
const LANG_META = [
  { code:"es", flag:"🇪🇸", label:"Español"    },
  { code:"en", flag:"🇺🇸", label:"English"    },
  { code:"pt", flag:"🇧🇷", label:"Português"  },
  { code:"fr", flag:"🇫🇷", label:"Français"   },
  { code:"de", flag:"🇩🇪", label:"Deutsch"    },
  { code:"it", flag:"🇮🇹", label:"Italiano"   },
  { code:"ja", flag:"🇯🇵", label:"日本語"      },
];

const LANGS = {
  es: {
    feed:"🔥 Feed", tops:"📊 Tops", crypto:"₿ Crypto", acciones:"📈 Acciones",
    macro:"🌍 Macro", noticias:"📰 Noticias", earnings:"📅 Earnings", trending:"🔥 Trending",
    search:"Buscar ticker... AAPL, BTC, NVDA", login:"Entrar", register:"Registrarse →",
    publish:"Publicar →", bullish:"▲ ALCISTA", bearish:"▼ BAJISTA",
    followers:"Seguidores", following:"Siguiendo", points:"Puntos", posts:"Posts",
    follow:"+ Seguir", following_btn:"✓ Siguiendo", welcome:"Bienvenido de vuelta",
    join:"Únete a NexoTrade", tagline:"La comunidad inversora en español",
    top5:"🏆 Top 5 Foristas", reputation:"Por puntos de reputación",
    markets:"📡 Mercados ahora", whofollow:"👥 A quién seguir",
    aiAssistant:"🤖 Asistente IA", askAI:"Pregunta al asistente IA...",
    alerts:"🔔 Mis Alertas", profile:"Mi Perfil", settings:"Ajustes", logout:"Cerrar sesión",
    level:"Nivel", badge:"Insignia", rank:"Rango",
    filterAll:"Todos", filterBull:"▲ Alcistas", filterBear:"▼ Bajistas",
    ideas:"ideas", newPost:"¿Qué opinas del mercado? Comparte tu análisis...",
    ticker:"Ticker (BTC...)", disclaimer:"⚠️ Solo educativo. No es consejo financiero.",
    modWarning:"⚠️ Tu mensaje fue moderado: contiene lenguaje no permitido o publicidad.",
    username:"Nombre de usuario", email:"Email", password:"Contraseña",
    chooseAvatar:"Elige tu avatar", yourPoints:"Tus puntos", ptsWelcome:"+100 pts de bienvenida",
    aiSys:"Eres la IA de NexoTrade, asistente financiero amigable. Respuestas concisas y educativas sobre acciones, crypto y mercados. Máximo 3 párrafos. Siempre añade disclaimer de que no es consejo financiero.",
    aiHello:"¡Hola! Soy la IA de NexoTrade 🤖 Pregúntame sobre acciones, crypto o análisis de mercado.",
    aiQuick:["Analiza NVDA","¿Qué es el P/E ratio?","Mejores dividendos","Outlook Bitcoin"],
    aiErr:"Lo siento, no pude conectarme. Inténtalo de nuevo.",
  },
  en: {
    feed:"🔥 Feed", tops:"📊 Tops", crypto:"₿ Crypto", acciones:"📈 Stocks",
    macro:"🌍 Macro", noticias:"📰 News", earnings:"📅 Earnings", trending:"🔥 Trending",
    search:"Search ticker... AAPL, BTC, NVDA", login:"Sign in", register:"Sign up →",
    publish:"Post →", bullish:"▲ BULLISH", bearish:"▼ BEARISH",
    followers:"Followers", following:"Following", points:"Points", posts:"Posts",
    follow:"+ Follow", following_btn:"✓ Following", welcome:"Welcome back",
    join:"Join NexoTrade", tagline:"The global investor community",
    top5:"🏆 Top 5 Members", reputation:"By reputation points",
    markets:"📡 Markets now", whofollow:"👥 Who to follow",
    aiAssistant:"🤖 AI Assistant", askAI:"Ask the AI assistant...",
    alerts:"🔔 My Alerts", profile:"My Profile", settings:"Settings", logout:"Sign out",
    level:"Level", badge:"Badge", rank:"Rank",
    filterAll:"All", filterBull:"▲ Bullish", filterBear:"▼ Bearish",
    ideas:"ideas", newPost:"What do you think about the market? Share your analysis...",
    ticker:"Ticker (BTC...)", disclaimer:"⚠️ Educational only. Not financial advice.",
    modWarning:"⚠️ Your post was moderated: prohibited language or advertising detected.",
    username:"Username", email:"Email", password:"Password",
    chooseAvatar:"Choose your avatar", yourPoints:"Your points", ptsWelcome:"+100 welcome points",
    aiSys:"You are NexoTrade AI, a friendly financial assistant. Give concise educational answers about stocks, crypto and markets. Max 3 paragraphs. Always add a disclaimer that this is not financial advice.",
    aiHello:"Hi! I'm NexoTrade AI 🤖 Ask me anything about stocks, crypto or market analysis.",
    aiQuick:["Analyze NVDA","What is P/E ratio?","Best dividend stocks","Bitcoin outlook"],
    aiErr:"Sorry, I couldn't connect. Please try again.",
  },
  pt: {
    feed:"🔥 Feed", tops:"📊 Tops", crypto:"₿ Crypto", acciones:"📈 Ações",
    macro:"🌍 Macro", noticias:"📰 Notícias", earnings:"📅 Resultados", trending:"🔥 Trending",
    search:"Buscar ticker... AAPL, BTC, NVDA", login:"Entrar", register:"Registrar →",
    publish:"Publicar →", bullish:"▲ ALTA", bearish:"▼ BAIXA",
    followers:"Seguidores", following:"Seguindo", points:"Pontos", posts:"Posts",
    follow:"+ Seguir", following_btn:"✓ Seguindo", welcome:"Bem-vindo de volta",
    join:"Junte-se à NexoTrade", tagline:"A comunidade de investidores em português",
    top5:"🏆 Top 5 Membros", reputation:"Por pontos de reputação",
    markets:"📡 Mercados agora", whofollow:"👥 Quem seguir",
    aiAssistant:"🤖 Assistente IA", askAI:"Pergunte ao assistente IA...",
    alerts:"🔔 Meus Alertas", profile:"Meu Perfil", settings:"Configurações", logout:"Sair",
    level:"Nível", badge:"Distintivo", rank:"Posição",
    filterAll:"Todos", filterBull:"▲ Alta", filterBear:"▼ Baixa",
    ideas:"ideias", newPost:"O que acha do mercado? Compartilhe sua análise...",
    ticker:"Ticker (BTC...)", disclaimer:"⚠️ Apenas educativo. Não é conselho financeiro.",
    modWarning:"⚠️ Sua mensagem foi moderada: contém linguagem proibida ou publicidade.",
    username:"Nome de usuário", email:"Email", password:"Senha",
    chooseAvatar:"Escolha seu avatar", yourPoints:"Seus pontos", ptsWelcome:"+100 pontos de boas-vindas",
    aiSys:"Você é a IA da NexoTrade, assistente financeiro amigável. Respostas concisas e educativas sobre ações, cripto e mercados. Máximo 3 parágrafos. Sempre adicione disclaimer que não é conselho financeiro.",
    aiHello:"Olá! Sou a IA da NexoTrade 🤖 Pergunte sobre ações, cripto ou análise de mercado.",
    aiQuick:["Analisar NVDA","O que é P/L?","Melhores dividendos","Perspectiva Bitcoin"],
    aiErr:"Desculpe, não consegui conectar. Tente novamente.",
  },
  fr: {
    feed:"🔥 Fil", tops:"📊 Tops", crypto:"₿ Crypto", acciones:"📈 Actions",
    macro:"🌍 Macro", noticias:"📰 Actualités", earnings:"📅 Résultats", trending:"🔥 Tendances",
    search:"Rechercher ticker... AAPL, BTC, NVDA", login:"Connexion", register:"S'inscrire →",
    publish:"Publier →", bullish:"▲ HAUSSIER", bearish:"▼ BAISSIER",
    followers:"Abonnés", following:"Abonnements", points:"Points", posts:"Posts",
    follow:"+ Suivre", following_btn:"✓ Abonné", welcome:"Bienvenue de retour",
    join:"Rejoindre NexoTrade", tagline:"La communauté des investisseurs francophones",
    top5:"🏆 Top 5 Membres", reputation:"Par points de réputation",
    markets:"📡 Marchés maintenant", whofollow:"👥 Qui suivre",
    aiAssistant:"🤖 Assistant IA", askAI:"Posez une question à l'IA...",
    alerts:"🔔 Mes Alertes", profile:"Mon Profil", settings:"Paramètres", logout:"Déconnexion",
    level:"Niveau", badge:"Badge", rank:"Classement",
    filterAll:"Tous", filterBull:"▲ Haussier", filterBear:"▼ Baissier",
    ideas:"idées", newPost:"Que pensez-vous du marché? Partagez votre analyse...",
    ticker:"Ticker (BTC...)", disclaimer:"⚠️ Éducatif uniquement. Pas de conseil financier.",
    modWarning:"⚠️ Votre message a été modéré: langage interdit ou publicité détectée.",
    username:"Nom d'utilisateur", email:"Email", password:"Mot de passe",
    chooseAvatar:"Choisissez votre avatar", yourPoints:"Vos points", ptsWelcome:"+100 points de bienvenue",
    aiSys:"Vous êtes l'IA de NexoTrade, assistant financier sympathique. Réponses concises et éducatives sur les actions, crypto et marchés. Maximum 3 paragraphes. Ajoutez toujours un avertissement que ce n'est pas un conseil financier.",
    aiHello:"Bonjour! Je suis l'IA NexoTrade 🤖 Posez-moi des questions sur les actions, crypto ou l'analyse de marché.",
    aiQuick:["Analyser NVDA","Qu'est-ce que le P/E?","Meilleurs dividendes","Perspective Bitcoin"],
    aiErr:"Désolé, je n'ai pas pu me connecter. Réessayez.",
  },
  de: {
    feed:"🔥 Feed", tops:"📊 Tops", crypto:"₿ Krypto", acciones:"📈 Aktien",
    macro:"🌍 Makro", noticias:"📰 Nachrichten", earnings:"📅 Ergebnisse", trending:"🔥 Trending",
    search:"Ticker suchen... AAPL, BTC, NVDA", login:"Anmelden", register:"Registrieren →",
    publish:"Veröffentlichen →", bullish:"▲ BULLISH", bearish:"▼ BEARISH",
    followers:"Follower", following:"Folge ich", points:"Punkte", posts:"Beiträge",
    follow:"+ Folgen", following_btn:"✓ Gefolgt", welcome:"Willkommen zurück",
    join:"NexoTrade beitreten", tagline:"Die Investoren-Community auf Deutsch",
    top5:"🏆 Top 5 Mitglieder", reputation:"Nach Reputationspunkten",
    markets:"📡 Märkte jetzt", whofollow:"👥 Wem folgen",
    aiAssistant:"🤖 KI-Assistent", askAI:"KI-Assistent fragen...",
    alerts:"🔔 Meine Alarme", profile:"Mein Profil", settings:"Einstellungen", logout:"Abmelden",
    level:"Level", badge:"Abzeichen", rank:"Rang",
    filterAll:"Alle", filterBull:"▲ Bullish", filterBear:"▼ Bearish",
    ideas:"Ideen", newPost:"Was denken Sie über den Markt? Teilen Sie Ihre Analyse...",
    ticker:"Ticker (BTC...)", disclaimer:"⚠️ Nur zur Bildung. Keine Finanzberatung.",
    modWarning:"⚠️ Ihr Beitrag wurde moderiert: verbotene Sprache oder Werbung erkannt.",
    username:"Benutzername", email:"E-Mail", password:"Passwort",
    chooseAvatar:"Wählen Sie Ihren Avatar", yourPoints:"Ihre Punkte", ptsWelcome:"+100 Willkommenspunkte",
    aiSys:"Sie sind die NexoTrade-KI, ein freundlicher Finanzassistent. Geben Sie prägnante und lehrreiche Antworten zu Aktien, Krypto und Märkten. Maximal 3 Absätze. Fügen Sie immer einen Haftungsausschluss hinzu, dass dies keine Finanzberatung ist.",
    aiHello:"Hallo! Ich bin die NexoTrade KI 🤖 Fragen Sie mich zu Aktien, Krypto oder Marktanalyse.",
    aiQuick:["NVDA analysieren","Was ist das KGV?","Beste Dividenden","Bitcoin Ausblick"],
    aiErr:"Entschuldigung, keine Verbindung. Bitte erneut versuchen.",
  },
  it: {
    feed:"🔥 Feed", tops:"📊 Top", crypto:"₿ Crypto", acciones:"📈 Azioni",
    macro:"🌍 Macro", noticias:"📰 Notizie", earnings:"📅 Risultati", trending:"🔥 Tendenze",
    search:"Cerca ticker... AAPL, BTC, NVDA", login:"Accedi", register:"Registrati →",
    publish:"Pubblica →", bullish:"▲ RIALZISTA", bearish:"▼ RIBASSISTA",
    followers:"Follower", following:"Seguiti", points:"Punti", posts:"Post",
    follow:"+ Segui", following_btn:"✓ Seguito", welcome:"Bentornato",
    join:"Unisciti a NexoTrade", tagline:"La comunità degli investitori italiani",
    top5:"🏆 Top 5 Membri", reputation:"Per punti reputazione",
    markets:"📡 Mercati ora", whofollow:"👥 Chi seguire",
    aiAssistant:"🤖 Assistente IA", askAI:"Chiedi all'assistente IA...",
    alerts:"🔔 I miei Avvisi", profile:"Il mio Profilo", settings:"Impostazioni", logout:"Esci",
    level:"Livello", badge:"Distintivo", rank:"Classifica",
    filterAll:"Tutti", filterBull:"▲ Rialzista", filterBear:"▼ Ribassista",
    ideas:"idee", newPost:"Cosa pensi del mercato? Condividi la tua analisi...",
    ticker:"Ticker (BTC...)", disclaimer:"⚠️ Solo educativo. Non è consulenza finanziaria.",
    modWarning:"⚠️ Il tuo post è stato moderato: linguaggio vietato o pubblicità rilevata.",
    username:"Nome utente", email:"Email", password:"Password",
    chooseAvatar:"Scegli il tuo avatar", yourPoints:"I tuoi punti", ptsWelcome:"+100 punti di benvenuto",
    aiSys:"Sei l'IA di NexoTrade, assistente finanziario amichevole. Risposte concise ed educative su azioni, crypto e mercati. Massimo 3 paragrafi. Aggiungi sempre un disclaimer che non è consulenza finanziaria.",
    aiHello:"Ciao! Sono l'IA di NexoTrade 🤖 Chiedimi di azioni, crypto o analisi di mercato.",
    aiQuick:["Analizza NVDA","Cos'è il P/E?","Migliori dividendi","Prospettive Bitcoin"],
    aiErr:"Spiacente, connessione fallita. Riprova.",
  },
  ja: {
    feed:"🔥 フィード", tops:"📊 トップ", crypto:"₿ 仮想通貨", acciones:"📈 株式",
    macro:"🌍 マクロ", noticias:"📰 ニュース", earnings:"📅 決算", trending:"🔥 トレンド",
    search:"ティッカー検索... AAPL, BTC, NVDA", login:"ログイン", register:"登録 →",
    publish:"投稿 →", bullish:"▲ 強気", bearish:"▼ 弱気",
    followers:"フォロワー", following:"フォロー中", points:"ポイント", posts:"投稿",
    follow:"+ フォロー", following_btn:"✓ フォロー中", welcome:"おかえりなさい",
    join:"NexoTradeに参加", tagline:"グローバル投資家コミュニティ",
    top5:"🏆 トップ5メンバー", reputation:"評価ポイント順",
    markets:"📡 マーケット", whofollow:"👥 フォローすべき人",
    aiAssistant:"🤖 AIアシスタント", askAI:"AIに質問する...",
    alerts:"🔔 マイアラート", profile:"マイプロフィール", settings:"設定", logout:"ログアウト",
    level:"レベル", badge:"バッジ", rank:"ランク",
    filterAll:"すべて", filterBull:"▲ 強気", filterBear:"▼ 弱気",
    ideas:"投稿", newPost:"市場についてどう思いますか？分析を共有してください...",
    ticker:"ティッカー (BTC...)", disclaimer:"⚠️ 教育目的のみ。投資アドバイスではありません。",
    modWarning:"⚠️ 投稿がモデレートされました：禁止された言語または広告が検出されました。",
    username:"ユーザー名", email:"メール", password:"パスワード",
    chooseAvatar:"アバターを選択", yourPoints:"あなたのポイント", ptsWelcome:"ようこそ+100ポイント",
    aiSys:"あなたはNexoTradeのAIです。株式、暗号通貨、市場分析についての簡潔で教育的な回答を提供してください。最大3段落。これは投資アドバイスではないという免責事項を必ず追加してください。",
    aiHello:"こんにちは！NexoTrade AIです 🤖 株式、仮想通貨、市場分析について質問してください。",
    aiQuick:["NVDAを分析","P/Eとは？","高配当株","ビットコイン見通し"],
    aiErr:"接続できませんでした。もう一度お試しください。",
  },
};

// ── GAMIFICATION ──────────────────────────────────────────────────────────────
const LEVELS = [
  { min:0,     max:499,   name:"Novato",      nameEn:"Rookie",    emoji:"🌱", color:"#94a3b8" },
  { min:500,   max:1499,  name:"Analista",    nameEn:"Analyst",   emoji:"📊", color:"#3b82f6" },
  { min:1500,  max:3999,  name:"Trader",      nameEn:"Trader",    emoji:"📈", color:"#8b5cf6" },
  { min:4000,  max:9999,  name:"Experto",     nameEn:"Expert",    emoji:"⚡", color:"#f59e0b" },
  { min:10000, max:99999, name:"Leyenda",     nameEn:"Legend",    emoji:"🏆", color:"#ef4444" },
];
const BADGES = [
  { id:"first_post",  emoji:"✍️",  name:"Primera Idea",   nameEn:"First Post",    desc:"Publicaste tu primer análisis", pts:50  },
  { id:"bull_10",     emoji:"🐂",  name:"Bull Streak",    nameEn:"Bull Streak",   desc:"10 análisis alcistas acertados", pts:200 },
  { id:"top5",        emoji:"🏆",  name:"Top 5",          nameEn:"Top 5",         desc:"Entraste al Top 5 foristas", pts:500 },
  { id:"verified",    emoji:"✅",  name:"Verificado",     nameEn:"Verified",      desc:"Perfil verificado", pts:0   },
  { id:"100likes",    emoji:"❤️",  name:"100 Likes",      nameEn:"100 Likes",     desc:"Tus posts recibieron 100 likes", pts:300 },
  { id:"early",       emoji:"🚀",  name:"Early Adopter",  nameEn:"Early Adopter", desc:"Te uniste en la Beta", pts:100 },
];
const POINT_ACTIONS = {
  post: 10, like_received: 5, comment: 3, repost: 2, login_daily: 20, follower: 8,
};

const getLevel = (pts) => LEVELS.find(l => pts >= l.min && pts <= l.max) || LEVELS[0];
const fmtNum   = (n) => n >= 1000 ? (n/1000).toFixed(1)+"k" : n;
const fmtPx    = (p) => p >= 1000 ? `$${p.toLocaleString()}` : `$${p.toFixed(2)}`;
const fmtChg   = (c) => `${c>=0?"+":""}${c}%`;
const chgCol   = (c) => c >= 0 ? C.bull : C.bear;
const fmtTimeAgo=(iso)=>{
  if(!iso)return"ahora";
  const secs=Math.floor((Date.now()-new Date(iso))/1000);
  if(secs<60)return"ahora";
  if(secs<3600)return`hace ${Math.floor(secs/60)}m`;
  if(secs<86400)return`hace ${Math.floor(secs/3600)}h`;
  return`hace ${Math.floor(secs/86400)}d`;
};

// ── MODERATION ────────────────────────────────────────────────────────────────
const BAD_WORDS = ["puta","mierda","coño","joder","hostia","gilipollas","idiota","imbecil","estupido","cabrón","polla","culo","fuck","shit","ass","bitch","damn"];
const AD_WORDS  = ["compra ahora","click aquí","gana dinero fácil","oferta limitada","descuento","promo","gratis si","código","referido","ref=","bit.ly","tinyurl","t.me/","@gmail","whatsapp","telegram.me"];

const moderateText = (text) => {
  const lower = text.toLowerCase();
  for (const w of BAD_WORDS) { if (lower.includes(w)) return { ok:false, reason:"obscene" }; }
  for (const w of AD_WORDS)  { if (lower.includes(w)) return { ok:false, reason:"ad" }; }
  return { ok:true };
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const TAPE_ITEMS = [
  {ticker:"NVDA",price:"$875.40",change:+2.8,earning:false},{ticker:"BTC",price:"$68,420",change:+4.2,earning:false},
  {ticker:"TSLA",price:"$172.80",change:-3.1,earning:true},{ticker:"AAPL",price:"$189.50",change:+0.4,earning:false},
  {ticker:"SPY",price:"$521.30",change:-0.8,earning:false},{ticker:"MSFT",price:"$415.20",change:+1.2,earning:true},
  {ticker:"ETH",price:"$3,820",change:+5.7,earning:false},{ticker:"AMZN",price:"$186.40",change:+0.9,earning:false},
  {ticker:"SMCI",price:"$950.20",change:+18.4,earning:true},{ticker:"META",price:"$512.80",change:+2.1,earning:true},
  {ticker:"COIN",price:"$248.90",change:+7.3,earning:false},{ticker:"PLTR",price:"$24.80",change:+6.1,earning:false},
  {ticker:"AMD",price:"$168.30",change:+3.2,earning:false},{ticker:"GOOGL",price:"$172.50",change:+0.6,earning:true},
];
const MOCK_USERS = [
  {id:1,name:"NvidiaChad",    emoji:"🟢",color:"#22c55e",bio:"Tech & AI stocks. NVDA maxi.",followers:3420,following:210,posts:892,points:9840,badges:["early","verified","100likes","top5"]},
  {id:2,name:"CryptoWolf",   emoji:"🐺",color:"#8b5cf6",bio:"Bitcoin & DeFi. HODL forever.",followers:2180,following:156,posts:1240,points:7620,badges:["early","bull_10","100likes"]},
  {id:3,name:"ETHmaxi",      emoji:"💎",color:"#3b82f6",bio:"Ethereum bull. Diamond hands.",followers:1890,following:88, posts:654, points:6180,badges:["early","verified"]},
  {id:4,name:"TeslaInvestor",emoji:"⚡",color:"#f59e0b",bio:"EV sector. Swing trader.",       followers:1340,following:320,posts:445, points:4950,badges:["first_post","bull_10"]},
  {id:5,name:"SPY_Trader",   emoji:"📊",color:"#ef4444",bio:"Macro & opciones. 10y exp.",     followers:980, following:412,posts:1100,points:3720,badges:["early","first_post"]},
];
const MOCK_POSTS = [
  {id:1,userId:1,user:"NvidiaChad",    avatar:"🟢",avatarColor:"#22c55e",time:"hace 3m", ticker:"NVDA",sentiment:"bull",text:"NVDA con soporte perfecto en la media de 50 días. Demanda de chips IA no para. Acumulando más aquí. Target: $1,100 💚",likes:289,comments:71,reposts:54,tags:["NVDA","AI"]},
  {id:2,userId:2,user:"CryptoWolf",   avatar:"🐺",avatarColor:"#8b5cf6",time:"hace 11m",ticker:"BTC", sentiment:"bull",text:"Bitcoin rompiendo resistencia en $68k. Target $72k. Ballenas acumulando en on-chain 🚀",likes:142,comments:38,reposts:21,tags:["BTC","Crypto"]},
  {id:3,userId:4,user:"TeslaInvestor",avatar:"⚡",avatarColor:"#f59e0b",time:"hace 24m",ticker:"TSLA",sentiment:"bear",text:"TSLA reporta esta semana. Entregas Q1 decepcionaron. Me pongo corto antes del earnings. Target bajista $180 📉",likes:67, comments:45,reposts:8, tags:["TSLA","Earnings"]},
  {id:4,userId:3,user:"ETHmaxi",      avatar:"💎",avatarColor:"#3b82f6",time:"hace 45m",ticker:"ETH", sentiment:"bull",text:"ETH acumulando mientras todos miran BTC. Ratio ETH/BTC en mínimos históricos. Paciencia 💎🙌",likes:198,comments:29,reposts:43,tags:["ETH","Crypto"]},
  {id:5,userId:5,user:"SPY_Trader",   avatar:"📊",avatarColor:"#ef4444",time:"hace 1h", ticker:"SPY", sentiment:"bear",text:"SPY doble techo en resistencia. Fed hawkish. Me posiciono defensivo. Cash is king por ahora.",likes:112,comments:56,reposts:17,tags:["SPY","Macro"]},
];
const MOCK_NOTICIAS = [
  {id:1,titulo:"La Fed mantiene tasas: mercados al alza",tituloEn:"Fed holds rates: markets rally",fuente:"Reuters",tiempo:"hace 12m",ticker:"SPY",urgente:true,emoji:"🏦"},
  {id:2,titulo:"NVIDIA supera estimaciones: chips IA baten récord",tituloEn:"NVIDIA beats estimates: AI chips record demand",fuente:"Bloomberg",tiempo:"hace 34m",ticker:"NVDA",urgente:false,emoji:"🟢"},
  {id:3,titulo:"Bitcoin rompe $68k por primera vez en 3 semanas",tituloEn:"Bitcoin breaks $68k for first time in 3 weeks",fuente:"CoinDesk",tiempo:"hace 1h",ticker:"BTC",urgente:false,emoji:"₿"},
  {id:4,titulo:"Tesla: ventas Q1 decepcionan, Musk promete nuevo modelo",tituloEn:"Tesla: Q1 sales disappoint, Musk promises new model",fuente:"WSJ",tiempo:"hace 2h",ticker:"TSLA",urgente:false,emoji:"⚡"},
  {id:5,titulo:"Meta earnings: publicidad digital sube 27% interanual",tituloEn:"Meta earnings: digital advertising up 27% YoY",fuente:"CNBC",tiempo:"hace 4h",ticker:"META",urgente:false,emoji:"📘"},
];
const MOCK_EARNINGS = [
  {ticker:"TSLA",nombre:"Tesla",   fecha:"Hoy",     fechaEn:"Today",    hora:"Tras cierre",    eps_est:"$0.51",rev_est:"$22.3B",sorpresa:null,  bull_pct:34, community_votes:4821, live:true,  live_viewers:3240, live_title:"Q1 2026 Earnings Call",     live_speaker:"Elon Musk — CEO"},
  {ticker:"MSFT",nombre:"Microsoft",fecha:"Mañana", fechaEn:"Tomorrow", hora:"Tras cierre",    eps_est:"$2.82",rev_est:"$60.8B",sorpresa:null,  bull_pct:78, community_votes:3107, live:false, live_viewers:0,    live_title:"Q3 FY2026 Earnings Call",   live_speaker:"Satya Nadella — CEO"},
  {ticker:"GOOGL",nombre:"Alphabet",fecha:"Mañana", fechaEn:"Tomorrow", hora:"Tras cierre",    eps_est:"$1.53",rev_est:"$78.6B",sorpresa:null,  bull_pct:71, community_votes:2654, live:false, live_viewers:0,    live_title:"Q1 2026 Earnings Call",     live_speaker:"Sundar Pichai — CEO"},
  {ticker:"META", nombre:"Meta",    fecha:"Miér 21", fechaEn:"Wed 21",  hora:"Tras cierre",    eps_est:"$4.71",rev_est:"$36.2B",sorpresa:null,  bull_pct:82, community_votes:1980, live:false, live_viewers:0,    live_title:"Q1 2026 Earnings Call",     live_speaker:"Mark Zuckerberg — CEO"},
  {ticker:"NFLX", nombre:"Netflix", fecha:"Vie 23",  fechaEn:"Fri 23",  hora:"Antes apertura", eps_est:"$4.53",rev_est:"$9.7B", sorpresa:"+8%", bull_pct:66, community_votes:1432, live:false, live_viewers:0,    live_title:"Q1 2026 Earnings Call",     live_speaker:"Greg Peters — CEO"},
];
const MOCK_TRENDING = [
  {ticker:"SMCI",nombre:"SuperMicro",mentions:2840,change:+18.4,sentiment:92},
  {ticker:"NVDA",nombre:"NVIDIA",    mentions:2100,change:+2.8, sentiment:88},
  {ticker:"BTC", nombre:"Bitcoin",   mentions:1980,change:+4.2, sentiment:85},
  {ticker:"TSLA",nombre:"Tesla",     mentions:1650,change:-3.1, sentiment:34},
  {ticker:"ARM", nombre:"ARM Hold.", mentions:1320,change:+11.2,sentiment:79},
];
// ── AVATAR SYSTEM BY LEVEL ────────────────────────────────────────────────────
// Each level unlocks new exclusive AI-generated style avatars
const AVATAR_LEVELS = [
  {
    level: 0, levelName:"Novato", levelNameEn:"Rookie", color:"#94a3b8",
    desc:"Avatares de inicio — disponibles para todos",
    descEn:"Starter avatars — available for everyone",
    locked: false,
    avatars:[
      {id:"n1", svg:"novato_1", emoji:"🌱", color:"#94a3b8", name:"Planta",     style:"minimal"},
      {id:"n2", svg:"novato_2", emoji:"🐣", color:"#86efac", name:"Pollito",    style:"cute"},
      {id:"n3", svg:"novato_3", emoji:"🌟", color:"#fde68a", name:"Estrella",   style:"bright"},
      {id:"n4", svg:"novato_4", emoji:"🎯", color:"#f9a8d4", name:"Diana",      style:"sharp"},
      {id:"n5", svg:"novato_5", emoji:"🔭", color:"#a5b4fc", name:"Explorador", style:"curious"},
      {id:"n6", svg:"novato_6", emoji:"📚", color:"#6ee7b7", name:"Estudioso",  style:"smart"},
    ]
  },
  {
    level: 1, levelName:"Analista", levelNameEn:"Analyst", color:"#3b82f6",
    desc:"Desbloqueado con 500 pts — Avatares tech y datos",
    descEn:"Unlocked at 500 pts — Tech & data avatars",
    locked: true, minPts: 500,
    avatars:[
      {id:"a1", svg:"analista_1", emoji:"📊", color:"#3b82f6", name:"Data",       style:"tech"},
      {id:"a2", svg:"analista_2", emoji:"🤖", color:"#6366f1", name:"Cyborg",     style:"ai"},
      {id:"a3", svg:"analista_3", emoji:"🧠", color:"#8b5cf6", name:"Mente",      style:"neural"},
      {id:"a4", svg:"analista_4", emoji:"💻", color:"#0ea5e9", name:"Coder",      style:"digital"},
      {id:"a5", svg:"analista_5", emoji:"🔬", color:"#06b6d4", name:"Científico", style:"precise"},
      {id:"a6", svg:"analista_6", emoji:"📡", color:"#3b82f6", name:"Radar",      style:"signal"},
    ]
  },
  {
    level: 2, levelName:"Trader", levelNameEn:"Trader", color:"#8b5cf6",
    desc:"Desbloqueado con 1.500 pts — Avatares de mercado y poder",
    descEn:"Unlocked at 1,500 pts — Market & power avatars",
    locked: true, minPts: 1500,
    avatars:[
      {id:"t1", svg:"trader_1", emoji:"🐂", color:"#00b87a", name:"Toro",       style:"bull"},
      {id:"t2", svg:"trader_2", emoji:"⚡", color:"#f59e0b", name:"Relámpago",  style:"fast"},
      {id:"t3", svg:"trader_3", emoji:"🦅", color:"#8b5cf6", name:"Águila",     style:"sharp"},
      {id:"t4", svg:"trader_4", emoji:"🔥", color:"#ef4444", name:"Fuego",      style:"hot"},
      {id:"t5", svg:"trader_5", emoji:"💹", color:"#10b981", name:"Green",      style:"profit"},
      {id:"t6", svg:"trader_6", emoji:"🎲", color:"#7c3aed", name:"Risk",       style:"bold"},
    ]
  },
  {
    level: 3, levelName:"Experto", levelNameEn:"Expert", color:"#f59e0b",
    desc:"Desbloqueado con 4.000 pts — Avatares élite dorados",
    descEn:"Unlocked at 4,000 pts — Elite golden avatars",
    locked: true, minPts: 4000,
    avatars:[
      {id:"e1", svg:"experto_1", emoji:"👑", color:"#f59e0b", name:"Corona",    style:"royal"},
      {id:"e2", svg:"experto_2", emoji:"🦁", color:"#d97706", name:"León",      style:"king"},
      {id:"e3", svg:"experto_3", emoji:"💎", color:"#0ea5e9", name:"Diamante",  style:"rare"},
      {id:"e4", svg:"experto_4", emoji:"🌠", color:"#f59e0b", name:"Meteoro",   style:"golden"},
      {id:"e5", svg:"experto_5", emoji:"🔱", color:"#ca8a04", name:"Tridente",  style:"power"},
      {id:"e6", svg:"experto_6", emoji:"🏆", color:"#fbbf24", name:"Campeón",   style:"champion"},
    ]
  },
  {
    level: 4, levelName:"Leyenda", levelNameEn:"Legend", color:"#ef4444",
    desc:"Desbloqueado con 10.000 pts — Avatares únicos de Leyenda",
    descEn:"Unlocked at 10,000 pts — Unique Legend avatars",
    locked: true, minPts: 10000,
    avatars:[
      {id:"l1", svg:"leyenda_1", emoji:"🐉", color:"#dc2626", name:"Dragón",    style:"mythic"},
      {id:"l2", svg:"leyenda_2", emoji:"🌌", color:"#6d28d9", name:"Cosmos",    style:"infinite"},
      {id:"l3", svg:"leyenda_3", emoji:"⚔️", color:"#7f1d1d", name:"Guerrero",  style:"warrior"},
      {id:"l4", svg:"leyenda_4", emoji:"🔮", color:"#4c1d95", name:"Oráculo",   style:"mystic"},
      {id:"l5", svg:"leyenda_5", emoji:"🌋", color:"#991b1b", name:"Volcán",    style:"explosive"},
      {id:"l6", svg:"leyenda_6", emoji:"💀", color:"#1c1917", name:"Titan",     style:"dark"},
    ]
  },
];

// Flat list for backwards compat
const AVATAR_OPTIONS = AVATAR_LEVELS.flatMap(l => l.avatars.map(a => ({...a, levelColor:l.color})));

// SVG avatar generator — creates unique AI-style avatars per style
const generateAvatarSVG = (id, emoji, color, style, size=80) => {
  const c = color;
  const patterns = {
    minimal:  `<circle cx="40" cy="40" r="38" fill="${c}22" stroke="${c}" stroke-width="2"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    cute:     `<circle cx="40" cy="40" r="38" fill="${c}33" stroke="${c}88" stroke-width="2"/><circle cx="40" cy="40" r="28" fill="${c}22"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    bright:   `<defs><radialGradient id="bg${id}"><stop offset="0%" stop-color="${c}55"/><stop offset="100%" stop-color="${c}11"/></radialGradient></defs><circle cx="40" cy="40" r="38" fill="url(#bg${id})" stroke="${c}" stroke-width="1.5"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    sharp:    `<polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="${c}22" stroke="${c}" stroke-width="2"/><text x="40" y="52" text-anchor="middle" font-size="26">${emoji}</text>`,
    curious:  `<rect x="4" y="4" width="72" height="72" rx="18" fill="${c}22" stroke="${c}" stroke-width="2"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    smart:    `<circle cx="40" cy="40" r="38" fill="${c}15" stroke="${c}66" stroke-width="1.5" stroke-dasharray="4 2"/><circle cx="40" cy="40" r="30" fill="${c}22" stroke="${c}" stroke-width="1.5"/><text x="40" y="52" text-anchor="middle" font-size="26">${emoji}</text>`,
    tech:     `<rect x="4" y="4" width="72" height="72" rx="8" fill="#0f172a" stroke="${c}" stroke-width="2"/><line x1="4" y1="20" x2="76" y2="20" stroke="${c}44" stroke-width="1"/><line x1="4" y1="60" x2="76" y2="60" stroke="${c}44" stroke-width="1"/><text x="40" y="52" text-anchor="middle" font-size="26">${emoji}</text>`,
    ai:       `<circle cx="40" cy="40" r="38" fill="#0f172a" stroke="${c}" stroke-width="2"/><circle cx="40" cy="40" r="25" fill="none" stroke="${c}44" stroke-width="1" stroke-dasharray="3 2"/><circle cx="40" cy="40" r="15" fill="${c}22" stroke="${c}" stroke-width="1.5"/><text x="40" y="52" text-anchor="middle" font-size="22">${emoji}</text>`,
    neural:   `<circle cx="40" cy="40" r="38" fill="#0f172a" stroke="${c}" stroke-width="1.5"/><line x1="20" y1="40" x2="60" y2="40" stroke="${c}44" stroke-width="1"/><line x1="40" y1="20" x2="40" y2="60" stroke="${c}44" stroke-width="1"/><circle cx="40" cy="40" r="18" fill="${c}22" stroke="${c}" stroke-width="1.5"/><text x="40" y="52" text-anchor="middle" font-size="22">${emoji}</text>`,
    digital:  `<rect x="4" y="4" width="72" height="72" rx="12" fill="#0f172a" stroke="${c}" stroke-width="2"/><rect x="12" y="12" width="56" height="56" rx="8" fill="${c}15" stroke="${c}44" stroke-width="1"/><text x="40" y="52" text-anchor="middle" font-size="26">${emoji}</text>`,
    precise:  `<circle cx="40" cy="40" r="38" fill="${c}15" stroke="${c}" stroke-width="2"/><circle cx="40" cy="40" r="28" fill="none" stroke="${c}55" stroke-width="1"/><circle cx="40" cy="40" r="18" fill="none" stroke="${c}88" stroke-width="1"/><text x="40" y="52" text-anchor="middle" font-size="22">${emoji}</text>`,
    signal:   `<circle cx="40" cy="40" r="38" fill="#0f172a" stroke="${c}" stroke-width="2"/><path d="M20,40 Q30,25 40,40 Q50,55 60,40" fill="none" stroke="${c}" stroke-width="2.5"/><text x="40" y="68" text-anchor="middle" font-size="16">${emoji}</text>`,
    bull:     `<defs><linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}44"/><stop offset="100%" stop-color="${c}11"/></linearGradient></defs><circle cx="40" cy="40" r="38" fill="url(#bg${id})" stroke="${c}" stroke-width="2.5"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    fast:     `<defs><linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${c}11"/><stop offset="100%" stop-color="${c}44"/></linearGradient></defs><polygon points="40,4 76,40 40,76 4,40" fill="url(#bg${id})" stroke="${c}" stroke-width="2"/><text x="40" y="52" text-anchor="middle" font-size="26">${emoji}</text>`,
    sharp:    `<polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="${c}22" stroke="${c}" stroke-width="2.5"/><text x="40" y="52" text-anchor="middle" font-size="26">${emoji}</text>`,
    hot:      `<circle cx="40" cy="40" r="38" fill="#1c0a0a" stroke="${c}" stroke-width="2.5"/><circle cx="40" cy="40" r="28" fill="${c}22"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    profit:   `<rect x="4" y="4" width="72" height="72" rx="16" fill="${c}15" stroke="${c}" stroke-width="2"/><polyline points="15,55 30,35 45,45 60,20" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round"/><text x="40" y="72" text-anchor="middle" font-size="12">${emoji}</text>`,
    bold:     `<polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="#1a0a2e" stroke="${c}" stroke-width="2"/><circle cx="40" cy="40" r="20" fill="${c}33" stroke="${c}" stroke-width="1.5"/><text x="40" y="52" text-anchor="middle" font-size="22">${emoji}</text>`,
    royal:    `<defs><radialGradient id="bg${id}"><stop offset="0%" stop-color="${c}66"/><stop offset="100%" stop-color="${c}22"/></radialGradient></defs><circle cx="40" cy="40" r="38" fill="url(#bg${id})" stroke="${c}" stroke-width="3"/><circle cx="40" cy="40" r="28" fill="none" stroke="${c}88" stroke-width="1"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    king:     `<defs><linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}55"/><stop offset="100%" stop-color="#7c2d0033"/></linearGradient></defs><circle cx="40" cy="40" r="38" fill="url(#bg${id})" stroke="${c}" stroke-width="3"/><text x="40" y="52" text-anchor="middle" font-size="30">${emoji}</text>`,
    rare:     `<rect x="4" y="4" width="72" height="72" rx="20" fill="#0c1a2e" stroke="${c}" stroke-width="2.5"/><rect x="12" y="12" width="56" height="56" rx="14" fill="${c}22" stroke="${c}55" stroke-width="1.5"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    golden:   `<defs><radialGradient id="bg${id}"><stop offset="0%" stop-color="${c}77"/><stop offset="100%" stop-color="${c}11"/></radialGradient></defs><polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="url(#bg${id})" stroke="${c}" stroke-width="3"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    power:    `<circle cx="40" cy="40" r="38" fill="#1a0a00" stroke="${c}" stroke-width="3"/><circle cx="40" cy="40" r="28" fill="${c}33" stroke="${c}88" stroke-width="1.5"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    champion: `<defs><linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${c}66"/><stop offset="100%" stop-color="${c}22"/></linearGradient></defs><circle cx="40" cy="40" r="38" fill="url(#bg${id})" stroke="${c}" stroke-width="3"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    mythic:   `<defs><radialGradient id="bg${id}"><stop offset="0%" stop-color="${c}55"/><stop offset="100%" stop-color="#000"/></radialGradient></defs><circle cx="40" cy="40" r="38" fill="url(#bg${id})" stroke="${c}" stroke-width="3"/><circle cx="40" cy="40" r="26" fill="none" stroke="${c}55" stroke-width="1.5" stroke-dasharray="4 2"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    infinite: `<rect x="4" y="4" width="72" height="72" rx="4" fill="#030014" stroke="${c}" stroke-width="2"/><circle cx="40" cy="40" r="30" fill="none" stroke="${c}33" stroke-width="1"/><circle cx="40" cy="40" r="20" fill="none" stroke="${c}55" stroke-width="1"/><circle cx="40" cy="40" r="10" fill="${c}33" stroke="${c}" stroke-width="1.5"/><text x="40" y="52" text-anchor="middle" font-size="16">${emoji}</text>`,
    warrior:  `<polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="#1a0000" stroke="${c}" stroke-width="3"/><polygon points="40,14 68,28 68,52 40,66 12,52 12,28" fill="none" stroke="${c}44" stroke-width="1"/><text x="40" y="52" text-anchor="middle" font-size="26">${emoji}</text>`,
    mystic:   `<circle cx="40" cy="40" r="38" fill="#0d0020" stroke="${c}" stroke-width="2.5"/><circle cx="40" cy="40" r="28" fill="${c}22" stroke="${c}66" stroke-width="1" stroke-dasharray="6 3"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    explosive:`<defs><radialGradient id="bg${id}"><stop offset="0%" stop-color="${c}77"/><stop offset="70%" stop-color="${c}33"/><stop offset="100%" stop-color="#000"/></radialGradient></defs><circle cx="40" cy="40" r="38" fill="url(#bg${id})" stroke="${c}" stroke-width="3"/><text x="40" y="52" text-anchor="middle" font-size="28">${emoji}</text>`,
    dark:     `<rect x="4" y="4" width="72" height="72" rx="8" fill="#000" stroke="${c}" stroke-width="2.5"/><line x1="4" y1="4" x2="76" y2="76" stroke="${c}22" stroke-width="1"/><line x1="76" y1="4" x2="4" y2="76" stroke="${c}22" stroke-width="1"/><circle cx="40" cy="40" r="20" fill="${c}22" stroke="${c}" stroke-width="2"/><text x="40" y="52" text-anchor="middle" font-size="22">${emoji}</text>`,
  };
  const pat = patterns[style] || patterns.minimal;
  return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${pat}</svg>`;
};
const SEARCH_TICKERS = ["AAPL","MSFT","GOOGL","AMZN","NVDA","TSLA","META","BTC","ETH","SPY","QQQ","AMD","NFLX","COIN","PLTR","SMCI","ARM","MSTR","BABA","RIVN","SNAP","PYPL","MO","VZ","ABBV","JPM","BAC"];

// ── LANG SELECTOR ─────────────────────────────────────────────────────────────
function LangSelector({lang, setLang}){
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const current = LANG_META.find(l => l.code === lang);
  useEffect(()=>{
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  },[]);
  return(
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} style={{background:"#F8FAFC",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 11px",cursor:"pointer",fontSize:12,fontWeight:700,color:C.muted,display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:14}}>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <span style={{fontSize:9,color:C.muted2}}>▾</span>
      </button>
      {open && (
        <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:14,padding:6,zIndex:200,boxShadow:C.shadowMd,minWidth:155}}>
          {LANG_META.map(l => (
            <button key={l.code} onClick={()=>{ setLang(l.code); setOpen(false); }} style={{display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",border:"none",cursor:"pointer",padding:"8px 12px",borderRadius:9,fontFamily:"inherit",fontSize:13,fontWeight:lang===l.code?700:500,color:lang===l.code?C.accentText:C.text,background:lang===l.code?C.accentDim:"transparent",transition:"background 0.1s"}}>
              <span style={{fontSize:18}}>{l.flag}</span>
              <span>{l.label}</span>
              {lang===l.code && <span style={{marginLeft:"auto",color:C.accent}}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TICKER TAPE ───────────────────────────────────────────────────────────────
// ── FINNHUB REALTIME PRICES ───────────────────────────────────────────────────
const FINNHUB_KEY = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";

// Mapa ticker → símbolo Finnhub (crypto usa prefijo de exchange)
const FH_SYM = {
  NVDA:"NVDA", TSLA:"TSLA", AAPL:"AAPL", SPY:"SPY", MSFT:"MSFT",
  AMZN:"AMZN", SMCI:"SMCI", META:"META", PLTR:"PLTR", AMD:"AMD",
  GOOGL:"GOOGL", COIN:"COINBASE:COIN-USD",
  BTC:"BINANCE:BTCUSDT", ETH:"BINANCE:ETHUSDT",
};

const TAPE_TICKERS = ["NVDA","BTC","TSLA","AAPL","SPY","MSFT","ETH","AMZN","SMCI","META","COIN","PLTR","AMD","GOOGL"];
const SIDEBAR_TICKERS = ["BTC","NVDA","TSLA","ETH","AAPL","SPY"];
const ALL_TRACK = [...new Set([...TAPE_TICKERS,...SIDEBAR_TICKERS])];

const PriceCtx = createContext({});

function PriceProvider({children}){
  const [prices, setPrices] = useState({});
  const wsRef    = useRef(null);
  const prevCRef = useRef({});  // prev-close para calcular %

  const updatePrice = (ticker, price) => {
    const pc = prevCRef.current[ticker];
    const dp = pc && pc > 0 ? parseFloat(((price - pc) / pc * 100).toFixed(2)) : null;
    setPrices(p => ({
      ...p,
      [ticker]: { price, change: dp ?? p[ticker]?.change ?? 0 }
    }));
  };

  // REST — carga inicial de cotizaciones
  useEffect(() => {
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    const fetchQuote = async (ticker, i) => {
      await delay(i * 250); // escalonar para no superar límite de rate
      try {
        const r = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${FH_SYM[ticker]||ticker}&token=${FINNHUB_KEY}`
        );
        const d = await r.json();
        if (d && d.c > 0) {
          prevCRef.current[ticker] = d.pc;
          setPrices(p => ({
            ...p,
            [ticker]: {
              price: d.c,
              change: d.dp != null ? parseFloat(d.dp.toFixed(2)) : 0
            }
          }));
        }
      } catch (_) {}
    };
    ALL_TRACK.forEach((t, i) => fetchQuote(t, i));
  }, []);

  // WebSocket — actualizaciones tick a tick en tiempo real
  useEffect(() => {
    let socket;
    let reconnectTimer;

    const connect = () => {
      socket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`);
      wsRef.current = socket;

      socket.onopen = () => {
        ALL_TRACK.forEach(ticker => {
          socket.send(JSON.stringify({ type: "subscribe", symbol: FH_SYM[ticker] || ticker }));
        });
      };

      socket.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === "trade" && msg.data) {
            msg.data.forEach(trade => {
              // Encontrar nuestro ticker para este símbolo de Finnhub
              const entry = Object.entries(FH_SYM).find(([, v]) => v === trade.s);
              if (entry) updatePrice(entry[0], trade.p);
            });
          }
        } catch (_) {}
      };

      socket.onclose = () => {
        // Reconectar automáticamente en 4 s
        reconnectTimer = setTimeout(connect, 4000);
      };
      socket.onerror = () => socket.close();
    };

    connect();
    return () => {
      clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  return <PriceCtx.Provider value={prices}>{children}</PriceCtx.Provider>;
}

// Helper: formatear precio con el número de decimales correcto
const fmtLivePrice = (ticker, price) => {
  if (price == null) return null;
  if (["BTC","ETH"].includes(ticker)) return `$${Math.round(price).toLocaleString("en-US")}`;
  if (price >= 1000) return `$${price.toLocaleString("en-US", {minimumFractionDigits:2,maximumFractionDigits:2})}`;
  return `$${price.toFixed(2)}`;
};

function TickerTape() {
  const lp = useContext(PriceCtx);
  const items = TAPE_TICKERS.map(ticker => {
    const live   = lp[ticker];
    const static_ = TAPE_ITEMS.find(t => t.ticker === ticker) || {};
    return {
      ...static_,
      ticker,
      price:  live ? fmtLivePrice(ticker, live.price) : static_.price,
      change: live ? live.change : (static_.change ?? 0),
    };
  });
  const doubled = [...items, ...items]; // duplicar para el loop infinito
  return (
    <div style={{background:"#0f172a",height:36,overflow:"hidden"}}>
      <style>{`@keyframes tape{from{transform:translateX(0)}to{transform:translateX(-50%)}} .tape{display:flex;animation:tape 36s linear infinite;width:max-content;} .tape:hover{animation-play-state:paused}`}</style>
      <div className="tape" style={{alignItems:"center",height:36}}>
        {doubled.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"0 16px",borderRight:"1px solid #1e293b",height:"100%",whiteSpace:"nowrap"}}>
            <span style={{color:"#e2e8f0",fontWeight:700,fontSize:12,fontFamily:"monospace"}}>${item.ticker}</span>
            <span style={{color:"#94a3b8",fontSize:11,fontFamily:"monospace"}}>{item.price}</span>
            <span style={{color:item.change>=0?"#00d4aa":"#f87171",fontSize:11,fontWeight:700,fontFamily:"monospace"}}>{fmtChg(item.change)}</span>
            {item.earning&&<span style={{background:"#f59e0b22",color:"#f59e0b",border:"1px solid #f59e0b55",borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:800}}>📅 EARN</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SEARCH BAR ────────────────────────────────────────────────────────────────
function SearchBar({lang, onTickerNav}) {
  const t = LANGS[lang];
  const [q,setQ]=useState(""),[res,setRes]=useState([]),[foc,setFoc]=useState(false);
  const [selected,setSelected]=useState(null);
  const ref=useRef();
  useEffect(()=>{if(!q){setRes([]);return;}setRes(SEARCH_TICKERS.filter(x=>x.toLowerCase().includes(q.toLowerCase())).slice(0,8));},[q]);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target)){setFoc(false);setSelected(null);}};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);

  const handleSelect=(ticker)=>{
    setQ("");
    setRes([]);
    setFoc(false);
    setSelected(null);
    if(onTickerNav) onTickerNav(ticker);
    else setSelected(ticker);
  };

  const tape=selected?TAPE_ITEMS.find(x=>x.ticker===selected):null;

  // Nombres de compañías para el mini card
  const NAMES={"AAPL":"Apple Inc.","MSFT":"Microsoft","GOOGL":"Alphabet","AMZN":"Amazon","NVDA":"NVIDIA","TSLA":"Tesla","META":"Meta Platforms","BTC":"Bitcoin","ETH":"Ethereum","SPY":"S&P 500 ETF","AMD":"AMD","NFLX":"Netflix","COIN":"Coinbase","PLTR":"Palantir","JPM":"JPMorgan","V":"Visa","BABA":"Alibaba","RIVN":"Rivian","ARM":"ARM Holdings","SMCI":"Super Micro","QQQ":"Nasdaq ETF","INTC":"Intel","ORCL":"Oracle","SHOP":"Shopify","UBER":"Uber","SNAP":"Snap","TWLO":"Twilio","SQ":"Block Inc","PYPL":"PayPal","DIS":"Disney","GS":"Goldman Sachs","WMT":"Walmart","BAC":"Bank of America","XOM":"ExxonMobil","JNJ":"Johnson & Johnson","KO":"Coca-Cola","PFE":"Pfizer","LMT":"Lockheed Martin","CVX":"Chevron","F":"Ford","GME":"GameStop","AMC":"AMC Entertainment"};

  return(
    <div ref={ref} style={{position:"relative",width:"100%",maxWidth:420}}>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"#F8FAFC",border:`1px solid ${foc?"rgba(37,99,235,0.45)":"rgba(15,23,42,0.12)"}`,borderRadius:10,padding:"8px 14px",transition:"all 0.18s",boxShadow:foc?"0 0 0 3px rgba(37,99,235,0.1)":"none"}}>
        <span style={{fontSize:13,color:"#475569"}}>⌕</span>
        <input value={q} onChange={e=>{setQ(e.target.value);setSelected(null);}} onFocus={()=>setFoc(true)} placeholder={t.search}
          style={{flex:1,background:"none",border:"none",outline:"none",color:"#0F172A",fontSize:13,fontFamily:"'Inter',sans-serif",fontWeight:400,letterSpacing:0.1}}/>
        {q&&<button onClick={()=>{setQ("");setRes([]);setSelected(null);}} style={{background:"none",border:"none",cursor:"pointer",color:"#334155",fontSize:16,lineHeight:1}}>×</button>}
      </div>

      {/* Dropdown de resultados */}
      {res.length>0&&foc&&!selected&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.1)",borderRadius:12,boxShadow:"0 8px 30px rgba(0,0,0,0.12)",zIndex:200,overflow:"hidden"}}>
          {res.map(ticker=>{
            const tp=TAPE_ITEMS.find(x=>x.ticker===ticker);
            const isUp=tp&&tp.change>=0;
            return(
              <div key={ticker} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid rgba(15,23,42,0.07)",transition:"background 0.12s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.04)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={()=>handleSelect(ticker)}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:8,background:isUp?"rgba(0,229,143,0.1)":"rgba(255,77,106,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:13,fontWeight:800,fontFamily:"monospace",color:isUp?C.bull:C.bear}}>{ticker.slice(0,2)}</span>
                  </div>
                  <div>
                    <div style={{fontSize:12.5,fontWeight:700,color:"#0F172A",fontFamily:"monospace"}}>${ticker}</div>
                    <div style={{fontSize:10.5,color:"#64748B"}}>{NAMES[ticker]||ticker}</div>
                  </div>
                  {tp?.earning&&<span style={{background:"rgba(245,158,11,0.1)",color:C.gold,border:"1px solid rgba(245,158,11,0.2)",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>📅 EARN</span>}
                </div>
                <div style={{textAlign:"right"}}>
                  {tp&&<div style={{fontSize:12.5,fontWeight:800,color:"#0F172A",fontFamily:"monospace"}}>{tp.price}</div>}
                  {tp&&<div style={{fontSize:11,fontWeight:700,color:isUp?C.bull:C.bear,fontFamily:"monospace"}}>{fmtChg(tp.change)}</div>}
                </div>
              </div>
            );
          })}
          <div style={{padding:"6px 14px",fontSize:10,color:"#94A3B8",background:"#FAFAFA"}}>Haz clic en un ticker para ver detalles</div>
        </div>
      )}

      {/* Mini tarjeta de detalle — visible para TODOS, sin login */}
      {selected&&tape&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.1)",borderRadius:14,boxShadow:"0 12px 40px rgba(0,0,0,0.15)",zIndex:200,padding:0,overflow:"hidden"}}>
          {/* Header */}
          <div style={{background:tape.change>=0?"linear-gradient(135deg,rgba(0,229,143,0.08),rgba(0,168,255,0.05))":"linear-gradient(135deg,rgba(255,77,106,0.08),rgba(255,140,0,0.05))",padding:"14px 16px",borderBottom:"1px solid rgba(15,23,42,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{background:tape.change>=0?"rgba(0,229,143,0.15)":"rgba(255,77,106,0.15)",color:tape.change>=0?C.bull:C.bear,borderRadius:7,padding:"3px 10px",fontSize:13,fontWeight:900,fontFamily:"monospace"}}>${selected}</span>
                  {tape.earning&&<span style={{background:"rgba(245,158,11,0.12)",color:"#D97706",border:"1px solid rgba(245,158,11,0.25)",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700}}>📅 EARNINGS PROX.</span>}
                </div>
                <div style={{fontSize:12,color:"#475569",marginTop:4,fontWeight:500}}>{NAMES[selected]||selected}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"rgba(15,23,42,0.06)",border:"none",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontSize:14,color:"#64748B",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          </div>
          {/* Precio principal */}
          <div style={{padding:"14px 16px",borderBottom:"1px solid rgba(15,23,42,0.07)"}}>
            <div style={{display:"flex",alignItems:"baseline",gap:12}}>
              <span style={{fontSize:28,fontWeight:900,color:"#0F172A",fontFamily:"monospace",letterSpacing:-1}}>{tape.price}</span>
              <span style={{fontSize:15,fontWeight:800,color:tape.change>=0?C.bull:C.bear,fontFamily:"monospace"}}>{fmtChg(tape.change)}</span>
              <span style={{fontSize:12,color:"#94A3B8",fontWeight:500}}>hoy</span>
            </div>
            {/* Mini sparkline visual */}
            <div style={{marginTop:10,height:36,display:"flex",alignItems:"flex-end",gap:1.5}}>
              {Array.from({length:20},(_,i)=>{
                const h=30+Math.sin(i*0.8+(tape.change>0?0.3:-0.3))*12+(tape.change>0?i*0.4:-i*0.4);
                return <div key={i} style={{flex:1,height:`${Math.max(6,Math.min(36,h))}px`,background:tape.change>=0?"rgba(0,229,143,0.35)":"rgba(255,77,106,0.35)",borderRadius:"2px 2px 0 0",transition:"height 0.3s"}}/>;
              })}
            </div>
          </div>
          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0,padding:"0"}}>
            {[
              {label:"Tendencia",value:tape.change>=0?"📈 Alcista":"📉 Bajista",col:tape.change>=0?C.bull:C.bear},
              {label:"Volumen",value:"Alto",col:"#3B82F6"},
              {label:"Señal",value:tape.change>=1.5?"🔥 Fuerte":tape.change>=0?"✅ Normal":"⚠️ Débil",col:"#F59E0B"},
            ].map(({label,value,col},i)=>(
              <div key={i} style={{padding:"10px 14px",borderRight:i<2?"1px solid rgba(15,23,42,0.07)":"none",borderTop:"1px solid rgba(15,23,42,0.07)"}}>
                <div style={{fontSize:10,color:"#94A3B8",fontWeight:600,marginBottom:3,letterSpacing:0.5}}>{label.toUpperCase()}</div>
                <div style={{fontSize:12.5,fontWeight:700,color:col}}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"10px 16px",background:"rgba(0,168,255,0.03)",borderTop:"1px solid rgba(15,23,42,0.07)",fontSize:10.5,color:"#64748B",textAlign:"center"}}>
            Regístrate gratis para ver análisis completo · <span style={{color:C.accent,fontWeight:700,cursor:"pointer"}}>Unirme →</span>
          </div>
        </div>
      )}

      {/* Mini card cuando no hay datos en TAPE */}
      {selected&&!tape&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.1)",borderRadius:14,boxShadow:"0 12px 40px rgba(0,0,0,0.15)",zIndex:200,padding:"16px",textAlign:"center"}}>
          <div style={{fontSize:22,marginBottom:6}}>📊</div>
          <div style={{fontWeight:700,fontSize:13,color:"#0F172A",fontFamily:"monospace"}}>${selected}</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>{NAMES[selected]||"Ticker"}</div>
          <div style={{fontSize:11,color:"#94A3B8",marginTop:8}}>Datos en tiempo real disponibles al registrarte</div>
          <button onClick={()=>setSelected(null)} style={{marginTop:10,background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.accent,fontWeight:600}}>Cerrar</button>
        </div>
      )}
    </div>
  );
}

// ── ATOMS ─────────────────────────────────────────────────────────────────────
function Btn({children,variant="primary",onClick,style={},small=false}){
  const pad=small?"5px 12px":"9px 20px",fs=small?12:13;
  const v={primary:{background:`linear-gradient(135deg,${C.accent},#00a87f)`,color:"#fff",border:"none",boxShadow:"0 2px 8px #00c49a33"},ghost:{background:"transparent",color:C.muted,border:`1px solid ${C.border}`},follow:{background:C.accentDim,color:C.accentText,border:`1px solid ${C.accent}55`},unfollow:{background:C.card2,color:C.muted2,border:`1px solid ${C.border}`}};
  return <button onClick={onClick} style={{...v[variant],borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:fs,padding:pad,fontFamily:"inherit",transition:"opacity 0.15s",...style}} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{children}</button>;
}

function AvatarBubble({emoji,color,avatarId,avatarStyle,size=40,online=false,level=null}){
  const lvl=level?getLevel(level):null;
  // Find avatar data if avatarId provided
  const avData = avatarId ? AVATAR_OPTIONS.find(a=>a.id===avatarId) : null;
  const finalEmoji = avData?.emoji || emoji;
  const finalColor = avData?.color || color;
  const finalStyle = avData?.style || avatarStyle || "minimal";
  const svgContent = generateAvatarSVG(avatarId||"def", finalEmoji, finalColor, finalStyle, size);
  return(
    <div style={{position:"relative",flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",border:`2.5px solid ${finalColor}66`,display:"flex",alignItems:"center",justifyContent:"center",background:finalColor+"11"}}
        dangerouslySetInnerHTML={{__html:svgContent}}/>
      {online&&<span style={{position:"absolute",bottom:1,right:1,width:Math.max(7,size*0.2),height:Math.max(7,size*0.2),borderRadius:"50%",background:C.bull,border:"2px solid white",zIndex:2}}/>}
      {lvl&&<span style={{position:"absolute",top:-5,right:-5,background:lvl.color,color:"#fff",borderRadius:20,padding:"1px 5px",fontSize:8,fontWeight:800,border:"1.5px solid white",whiteSpace:"nowrap",zIndex:3}}>{lvl.emoji}</span>}
    </div>
  );
}

function LevelBadge({points,lang}){
  const lvl=getLevel(points);
  return(
    <span style={{background:lvl.color+"22",color:lvl.color,border:`1px solid ${lvl.color}44`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4}}>
      {lvl.emoji} {lang==="en"?lvl.nameEn:lvl.name} · {points.toLocaleString()} pts
    </span>
  );
}

function Badge2({badge,lang}){
  return(
    <span title={badge.desc} style={{background:C.gold+"15",border:`1px solid ${C.gold}44`,borderRadius:8,padding:"3px 8px",fontSize:12,cursor:"help"}}>{badge.emoji}</span>
  );
}

function SentPill({sentiment,lang}){
  const t=LANGS[lang],bull=sentiment==="bull";
  return <span style={{background:bull?"rgba(0,210,106,0.12)":"rgba(255,77,106,0.12)",color:bull?C.bull:C.bear,border:`1px solid ${bull?"rgba(0,210,106,0.3)":"rgba(255,77,106,0.3)"}`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,backdropFilter:"blur(8px)",letterSpacing:0.3}}>{bull?"▲":"▼"} {bull?(lang==="en"?"Bullish":"Alcista"):(lang==="en"?"Bearish":"Bajista")}</span>;
}

function TickerBadge({ticker,sentiment}){
  const col=sentiment==="bull"?C.bull:C.bear,bg=sentiment==="bull"?C.bullBg:C.bearBg;
  return <span style={{background:bg,color:col,border:`1px solid ${col}33`,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:800,letterSpacing:0.5,fontFamily:"monospace"}}>${ticker}</span>;
}

const inputSt={display:"block",width:"100%",boxSizing:"border-box",background:"#F8FAFC",border:`1.5px solid ${C.glassBorder}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",margin:"6px 0 14px"};

// ── POINT TOAST ───────────────────────────────────────────────────────────────
function PointToast({show,points,reason}){
  if(!show)return null;
  return(
    <div style={{position:"fixed",bottom:24,right:24,background:"#0f172a",color:"#fff",borderRadius:16,padding:"14px 20px",boxShadow:"0 8px 32px rgba(0,0,0,0.2)",zIndex:999,display:"flex",alignItems:"center",gap:10,animation:"slideIn 0.3s ease"}}>
      <style>{`@keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <span style={{fontSize:24}}>⭐</span>
      <div>
        <div style={{fontWeight:800,fontSize:15,color:C.accent}}>+{points} puntos</div>
        <div style={{fontSize:12,color:"#94a3b8"}}>{reason}</div>
      </div>
    </div>
  );
}

// ── AI ASSISTANT ──────────────────────────────────────────────────────────────
function AIAssistant({lang,onClose}){
  const t=LANGS[lang];
  const [msgs,setMsgs]=useState([{role:"ai",text:t.aiHello}]);
  const [input,setInput]=useState(""),[loading,setLoading]=useState(false);
  const endRef=useRef();
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);

  const send = async(text) => {
    if(!text.trim()||loading)return;
    const userMsg=text;
    setInput("");
    setMsgs(prev=>[...prev,{role:"user",text:userMsg}]);
    setLoading(true);
    try{
      // Llama a la Vercel serverless function /api/chat (la key queda segura en Vercel)
      const res=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:userMsg,systemPrompt:t.aiSys})
      });
      const data=await res.json();
      const reply=data.reply||t.aiErr;
      setMsgs(prev=>[...prev,{role:"ai",text:reply}]);
    }catch{
      setMsgs(prev=>[...prev,{role:"ai",text:t.aiErr}]);
    }
    setLoading(false);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#00000066",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,borderRadius:22,width:480,maxWidth:"94vw",height:560,display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",border:`1px solid ${C.border}`}}>
        {/* Header */}
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,background:`linear-gradient(135deg,${C.accentDim},${C.blueBg})`,borderRadius:"22px 22px 0 0"}}>
          <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.accent},#0099ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🤖</div>
          <div>
            <div style={{fontWeight:800,color:C.text,fontSize:15}}>NexoTrade AI</div>
            <div style={{fontSize:11,color:C.bull,display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:C.bull,display:"inline-block"}}/>Online</div>
          </div>
          <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:C.muted2,fontSize:20}}>×</button>
        </div>
        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"80%",background:m.role==="user"?`linear-gradient(135deg,${C.accent},#00a87f)`:C.card2,color:m.role==="user"?"#fff":C.text,borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",fontSize:13,lineHeight:1.6,border:m.role==="ai"?`1px solid ${C.border}`:"none"}}>
                {m.text}
              </div>
            </div>
          ))}
          {loading&&<div style={{display:"flex",gap:4,padding:"10px 14px",background:C.card2,borderRadius:16,width:"fit-content",border:`1px solid ${C.border}`}}>
            <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
            {[0,0.16,0.32].map((d,i)=><span key={i} style={{width:7,height:7,borderRadius:"50%",background:C.accent,display:"inline-block",animation:`bounce 1.4s ease-in-out ${d}s infinite`}}/>)}
          </div>}
          <div ref={endRef}/>
        </div>
        {/* Quick questions */}
        <div style={{padding:"8px 16px",display:"flex",gap:6,flexWrap:"wrap",borderTop:`1px solid ${C.border}`}}>
          {t.aiQuick.map(q=><button key={q} onClick={()=>send(q)} style={{background:C.accentDim,border:`1px solid ${C.accent}44`,borderRadius:20,padding:"4px 10px",fontSize:11,color:C.accentText,fontWeight:600,cursor:"pointer"}}>{q}</button>)}
        </div>
        {/* Input */}
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder={t.askAI}
            style={{flex:1,background:C.card2,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"9px 14px",fontSize:13,outline:"none",color:C.text,fontFamily:"inherit"}}/>
          <Btn onClick={()=>send(input)} style={{padding:"9px 16px"}}>→</Btn>
        </div>
      </div>
    </div>
  );
}

// ── AUTH MODAL ────────────────────────────────────────────────────────────────
function AuthModal({mode,onClose,onAuth,lang}){
  const t=LANGS[lang];
  const [tab,setTab]=useState(mode),[name,setName]=useState(""),[email,setEmail]=useState(""),[pass,setPass]=useState("");
  const [avatar,setAvatar]=useState(AVATAR_OPTIONS[0]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const submit=async()=>{
    if(!email||!pass){setError("Por favor completa email y contraseña.");return;}
    setLoading(true);setError("");
    try{
      if(tab==="register"){
        const {data,error:err}=await supabase.auth.signUp({
          email,password:pass,
          options:{data:{username:name||email.split("@")[0],avatar_emoji:avatar.emoji,avatar_color:avatar.color}}
        });
        if(err){setError(err.message);setLoading(false);return;}
        onAuth({
          id:data.user?.id||"local",
          name:name||email.split("@")[0],
          emoji:avatar.emoji,avatarColor:avatar.color,
          followers:0,following:0,posts:0,points:100,badges:["early"],
          bio:"Nuevo en NexoTrade 🚀"
        });
      }else{
        const {data,error:err}=await supabase.auth.signInWithPassword({email,password:pass});
        if(err){setError(err.message==="Invalid login credentials"?"Email o contraseña incorrectos":err.message);setLoading(false);return;}
        // Cargar perfil de la BD
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
        onAuth({
          id:data.user.id,
          email:data.user.email,
          name:profile?.username||email.split("@")[0],
          emoji:profile?.avatar_emoji||avatar.emoji,
          avatarColor:profile?.avatar_color||C.accent,
          followers:profile?.followers_count||0,
          following:profile?.following_count||0,
          posts:profile?.posts_count||0,
          points:profile?.points||100,
          badges:profile?.badges||["early"],
          bio:profile?.bio||"",
          is_premium:profile?.is_premium||false,
        });
      }
      onClose();
    }catch(e){
      setError("Error de conexión. Inténtalo de nuevo.");
    }
    setLoading(false);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"#00000066",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,borderRadius:22,padding:32,width:420,maxWidth:"94vw",maxHeight:"90vh",overflowY:"auto",boxShadow:C.shadowMd,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",gap:4,marginBottom:24,background:C.card2,borderRadius:12,padding:4}}>
          {["login","register"].map(tb=><button key={tb} onClick={()=>setTab(tb)} style={{flex:1,padding:"8px",borderRadius:9,border:"none",cursor:"pointer",background:tab===tb?C.accent:"transparent",color:tab===tb?"#fff":C.muted,fontWeight:700,fontSize:13,fontFamily:"inherit"}}>{tb==="login"?t.login:t.register.replace("→","")}</button>)}
        </div>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:52,height:52,borderRadius:16,background:`linear-gradient(135deg,${C.accent},#00a87f)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:"#fff",margin:"0 auto 10px"}}>N</div>
          <h2 style={{margin:"0 0 4px",color:C.text,fontSize:18}}>{tab==="login"?t.welcome:t.join}</h2>
          <p style={{margin:0,color:C.muted2,fontSize:12}}>{t.tagline}</p>
        </div>
        {tab==="register"&&<>
          <label style={{color:C.muted,fontSize:12,fontWeight:700}}>{t.chooseAvatar.toUpperCase()}</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"8px 0 18px",padding:"12px",background:C.card2,borderRadius:12,border:`1px solid ${C.border}`}}>
            {AVATAR_OPTIONS.map(av=>(
              <button key={av.emoji} onClick={()=>setAvatar(av)} style={{width:44,height:44,borderRadius:"50%",background:avatar.emoji===av.emoji?`${av.color}33`:"transparent",border:`2.5px solid ${avatar.emoji===av.emoji?av.color:C.border}`,cursor:"pointer",fontSize:20,transition:"all 0.15s"}}>{av.emoji}</button>
            ))}
          </div>
          {avatar&&<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,padding:"10px 14px",background:C.card2,borderRadius:10,border:`1px solid ${C.border}`}}>
            <AvatarBubble emoji={avatar.emoji} color={avatar.color} size={36}/>
            <span style={{color:C.muted,fontSize:13}}>Tu avatar seleccionado</span>
          </div>}
          <label style={{color:C.muted,fontSize:12,fontWeight:700}}>{t.username.toUpperCase()}</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="ej: InversorPro" style={inputSt}/>
        </>}
        <label style={{color:C.muted,fontSize:12,fontWeight:700}}>{t.email.toUpperCase()}</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" type="email" style={inputSt}/>
        <label style={{color:C.muted,fontSize:12,fontWeight:700}}>{t.password.toUpperCase()}</label>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password"
          onKeyDown={e=>e.key==="Enter"&&submit()}
          style={{...inputSt,marginBottom:error?12:24}}/>
        {error&&<div style={{background:"rgba(255,77,106,0.08)",border:"1px solid rgba(255,77,106,0.25)",borderRadius:9,padding:"9px 14px",marginBottom:16,fontSize:12.5,color:C.bear,lineHeight:1.5}}>{error}</div>}
        <Btn onClick={submit} style={{width:"100%",padding:"12px",opacity:loading?0.7:1}}>
          {loading?"⏳ Un momento...":(tab==="login"?`${t.login} →`:`${t.join.replace("Únete a ","").replace("Join ","")} →`)}
        </Btn>
        {tab==="register"&&<p style={{margin:"14px 0 0",color:C.muted2,fontSize:11,textAlign:"center",lineHeight:1.6}}>
          🎁 Al registrarte recibes <strong style={{color:C.accentText}}>100 puntos de bienvenida</strong> y la insignia <strong>🚀 Early Adopter</strong>
        </p>}
      </div>
    </div>
  );
}

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
function ProfilePage({user,currentUser,isFollowing,onFollow,onClose,lang}){
  const t=LANGS[lang];
  const userPosts=MOCK_POSTS.filter(p=>p.user===user.name);
  const lvl=getLevel(user.points);
  const userBadges=BADGES.filter(b=>user.badges?.includes(b.id));
  const progressToNext=LEVELS.find(l=>l.min>user.points);
  const progress=progressToNext?((user.points-lvl.min)/(progressToNext.min-lvl.min)*100):100;
  return(
    <div style={{position:"fixed",inset:0,background:"#00000066",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,borderRadius:24,width:520,maxWidth:"94vw",maxHeight:"88vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",border:`1px solid ${C.border}`}}>
        {/* Cover */}
        <div style={{height:90,background:`linear-gradient(135deg,${user.avatarColor||C.accent}44,${C.blueBg})`,borderRadius:"24px 24px 0 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.8)",border:"none",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:13,color:C.muted}}>✕</button>
        </div>
        <div style={{padding:"0 24px 24px"}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:14,marginTop:-28,marginBottom:16}}>
            <AvatarBubble emoji={user.emoji} color={user.avatarColor||C.accent} size={72} online level={user.points}/>
            <div style={{flex:1,paddingBottom:4}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:20,fontWeight:900,color:C.text}}>{user.name}</span>
                {user.badges?.includes("verified")&&<span title="Verificado" style={{fontSize:16}}>✅</span>}
              </div>
              <LevelBadge points={user.points} lang={lang}/>
            </div>
            {currentUser&&currentUser.id!==user.id&&(
              <Btn variant={isFollowing?"unfollow":"follow"} small onClick={()=>onFollow(user.id)}>{isFollowing?t.following_btn:t.follow}</Btn>
            )}
          </div>
          <p style={{color:C.muted,fontSize:14,lineHeight:1.6,margin:"0 0 16px"}}>{user.bio}</p>
          {/* Progress bar */}
          {progressToNext&&<div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,color:C.muted2}}>{lvl.emoji} {lang==="en"?lvl.nameEn:lvl.name}</span>
              <span style={{fontSize:11,color:C.muted2}}>{lang==="en"?getLevel(progressToNext.min).nameEn:getLevel(progressToNext.min).name} {getLevel(progressToNext.min).emoji}</span>
            </div>
            <div style={{background:C.border,borderRadius:20,height:8,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:20,width:`${progress}%`,background:`linear-gradient(90deg,${C.accent},#00a87f)`,transition:"width 0.5s"}}/>
            </div>
            <div style={{fontSize:11,color:C.muted2,marginTop:4}}>{user.points.toLocaleString()} / {progressToNext.min.toLocaleString()} pts</div>
          </div>}
          {/* Stats */}
          <div style={{display:"flex",gap:0,marginBottom:20,background:C.card2,borderRadius:14,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {[[t.followers,fmtNum(user.followers)],[t.following,fmtNum(user.following)],[t.posts,user.posts],[t.points,user.points.toLocaleString()]].map(([l,v])=>(
              <div key={l} style={{flex:1,textAlign:"center",padding:"14px 8px",borderRight:`1px solid ${C.border}`}}>
                <div style={{fontWeight:800,color:C.text,fontSize:16}}>{v}</div>
                <div style={{color:C.muted2,fontSize:11}}>{l}</div>
              </div>
            ))}
          </div>
          {/* Badges */}
          {userBadges.length>0&&<div style={{marginBottom:20}}>
            <h4 style={{margin:"0 0 10px",color:C.muted,fontSize:12,letterSpacing:1,fontWeight:700}}>INSIGNIAS</h4>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {userBadges.map(b=>(
                <div key={b.id} title={b.desc} style={{background:C.goldBg,border:`1px solid ${C.gold}44`,borderRadius:10,padding:"6px 12px",display:"flex",alignItems:"center",gap:6,cursor:"help"}}>
                  <span style={{fontSize:16}}>{b.emoji}</span>
                  <span style={{fontSize:12,fontWeight:600,color:C.text}}>{lang==="en"?b.nameEn:b.name}</span>
                </div>
              ))}
            </div>
          </div>}
          {/* Posts */}
          <h4 style={{margin:"0 0 12px",color:C.muted,fontSize:12,letterSpacing:1,fontWeight:700}}>PUBLICACIONES RECIENTES</h4>
          {userPosts.length===0?<p style={{color:C.muted2,fontSize:13}}>Sin publicaciones aún.</p>:userPosts.map(p=>(
            <div key={p.id} style={{background:C.card2,borderRadius:12,padding:"12px 14px",marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",gap:8,marginBottom:8}}><TickerBadge ticker={p.ticker} sentiment={p.sentiment}/><SentPill sentiment={p.sentiment} lang={lang}/></div>
              <p style={{margin:"0 0 8px",color:C.text,fontSize:13,lineHeight:1.5}}>{p.text}</p>
              <div style={{color:C.muted2,fontSize:11}}>♥ {p.likes} · 💬 {p.comments} · {p.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ALERTS PANEL ──────────────────────────────────────────────────────────────
function AlertsPanel({lang,onClose}){
  const [alerts,setAlerts]=useState([
    {id:1,ticker:"BTC", type:"price_above",value:"$70,000",active:true},
    {id:2,ticker:"NVDA",type:"earnings",  value:"Esta semana",active:true},
    {id:3,ticker:"TSLA",type:"price_below",value:"$160",   active:false},
  ]);
  const [newT,setNewT]=useState(""),[newV,setNewV]=useState(""),[newType,setNewType]=useState("price_above");
  const typeLabels={"price_above":"↑ Precio sube de","price_below":"↓ Precio baja de","earnings":"📅 Earnings","mentions":"💬 Menciones pico"};
  return(
    <div style={{position:"fixed",inset:0,background:"#00000066",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,borderRadius:22,width:460,maxWidth:"94vw",boxShadow:C.shadowMd,border:`1px solid ${C.border}`}}>
        <div style={{padding:"18px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.card2,borderRadius:"22px 22px 0 0"}}>
          <h3 style={{margin:0,color:C.text,fontSize:16,fontWeight:800}}>🔔 Mis Alertas</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.muted2,fontSize:20}}>×</button>
        </div>
        <div style={{padding:20,maxHeight:400,overflowY:"auto"}}>
          {alerts.map(a=>(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:a.active?C.card2:"#f8fafc",border:`1px solid ${a.active?C.border:"#e2e8f0"}`,borderRadius:12,marginBottom:10,opacity:a.active?1:0.6}}>
              <span style={{fontSize:20}}>{a.type==="earnings"?"📅":a.type==="price_above"?"📈":"📉"}</span>
              <div style={{flex:1}}>
                <span style={{background:C.accentDim,color:C.accentText,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:800,fontFamily:"monospace",marginRight:8}}>${a.ticker}</span>
                <span style={{color:C.muted,fontSize:12}}>{typeLabels[a.type]} <strong style={{color:C.text}}>{a.value}</strong></span>
              </div>
              <button onClick={()=>setAlerts(prev=>prev.map(x=>x.id===a.id?{...x,active:!x.active}:x))} style={{background:a.active?C.bull+"22":C.card2,border:`1px solid ${a.active?C.bull+"44":C.border}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",color:a.active?C.bull:C.muted2,fontSize:11,fontWeight:700}}>{a.active?"ON":"OFF"}</button>
              <button onClick={()=>setAlerts(prev=>prev.filter(x=>x.id!==a.id))} style={{background:"none",border:"none",cursor:"pointer",color:C.muted2,fontSize:16}}>×</button>
            </div>
          ))}
        </div>
        <div style={{padding:"16px 20px",borderTop:`1px solid ${C.border}`,background:C.card2,borderRadius:"0 0 22px 22px"}}>
          <h4 style={{margin:"0 0 12px",color:C.muted,fontSize:12,fontWeight:700}}>NUEVA ALERTA</h4>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <input value={newT} onChange={e=>setNewT(e.target.value.toUpperCase())} placeholder="TICKER" style={{width:80,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",fontFamily:"monospace"}}/>
            <select value={newType} onChange={e=>setNewType(e.target.value)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px",fontSize:12,color:C.text,outline:"none"}}>
              {Object.entries(typeLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
            <input value={newV} onChange={e=>setNewV(e.target.value)} placeholder="Valor..." style={{flex:1,minWidth:80,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none"}}/>
            <Btn small onClick={()=>{if(!newT)return;setAlerts(prev=>[...prev,{id:Date.now(),ticker:newT,type:newType,value:newV||"—",active:true}]);setNewT("");setNewV("");}}>+ Añadir</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── POST CARD ─────────────────────────────────────────────────────────────────
const CONF_LEVELS=[{min:80,label:"Alta",col:"#00E58F"},{min:60,label:"Media",col:"#F59E0B"},{min:0,label:"Baja",col:"#64748B"}];
// Mini sparkline data per post
const SPARKLINES=[[40,42,38,45,50,48,55,60,58,65],[70,68,72,65,60,62,58,55,52,48],[30,35,33,40,42,45,50,48,55,60],[55,52,58,60,65,63,70,68,75,80]];

function PostCard({post,onProfile,onPoints,onTickerClick,lang,isNew}){
  const [liked,setLiked]=useState(false),[likes,setLikes]=useState(post.likes),[repost,setRepost]=useState(false);
  // Convertir id a número de forma segura (soporta "local-123..." y números reales)
  const idNum = typeof post.id==="number" ? post.id : (parseInt(String(post.id).replace(/\D/g,""))||1);
  const conf=55+Math.floor(idNum%40);
  const confLevel=CONF_LEVELS.find(c=>conf>=c.min);
  const aiPct=45+Math.floor((idNum*7)%40);
  const target=post.sentiment==="bull"?`+${8+(idNum%15)}%`:`-${5+(idNum%10)}%`;
  const spark=SPARKLINES[idNum%4]||SPARKLINES[0];
  const sparkMax=Math.max(...spark), sparkMin=Math.min(...spark);
  const sparkPts=spark.map((v,i)=>`${(i/(spark.length-1))*80},${20-((v-sparkMin)/(sparkMax-sparkMin||1))*18}`).join(" ");
  const isBull=post.sentiment==="bull";
  return(
    <div
      className={isNew ? "post-card-new" : ""}
      style={{background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.09)",borderRadius:14,padding:"10px 14px",marginBottom:4,transition:"border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,160,96,0.25)";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.08)";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(15,23,42,0.09)";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.05)";e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
        <div style={{cursor:"pointer",flexShrink:0}} onClick={()=>{const u=MOCK_USERS.find(u=>u.name===post.user);if(u)onProfile(u);}}>
          <AvatarBubble emoji={post.avatar} color={post.avatarColor||C.accent} online={post.id%2===0}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          {/* Header row */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}>
            <span style={{fontWeight:700,color:"#0F172A",fontSize:13.5,cursor:"pointer",letterSpacing:-0.2}}
              onClick={()=>{const u=MOCK_USERS.find(u=>u.name===post.user);if(u)onProfile(u);}}>{post.user}</span>
            <TickerBadge ticker={post.ticker} sentiment={post.sentiment}/>
            <SentPill sentiment={post.sentiment} lang={lang}/>
            <span style={{color:"#94A3B8",fontSize:10.5,marginLeft:"auto",fontVariantNumeric:"tabular-nums"}}>{post.time}</span>
          </div>
          {/* Post text */}
          <p style={{margin:"0 0 8px",color:"#475569",fontSize:13.5,lineHeight:1.6,fontWeight:400}}>{renderWithCashtags(post.text, onTickerClick, onTickerClick)}</p>
          {/* Imagen / GIF */}
          {post.image&&<img src={post.image} alt="" style={{maxWidth:"100%",maxHeight:280,borderRadius:10,marginBottom:8,border:`1px solid ${C.border}`,display:"block"}} onError={e=>e.target.style.display="none"}/>}
          {/* Metrics row — target + confidence + sparkline + AI agreement */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            {/* Target */}
            <div style={{display:"flex",alignItems:"center",gap:4,background:isBull?"rgba(0,229,143,0.07)":"rgba(255,77,106,0.07)",border:`1px solid ${isBull?"rgba(0,229,143,0.15)":"rgba(255,77,106,0.15)"}`,borderRadius:7,padding:"3px 8px"}}>
              <span style={{fontSize:10,color:C.muted,fontWeight:500}}>🎯</span>
              <span style={{fontSize:11,fontWeight:800,color:isBull?C.bull:C.bear,fontFamily:"monospace"}}>{target}</span>
            </div>
            {/* Confidence */}
            <div style={{display:"flex",alignItems:"center",gap:5,flex:1,minWidth:120}}>
              <div style={{flex:1,height:2.5,background:"rgba(15,23,42,0.09)",borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${conf}%`,height:"100%",background:confLevel.col,borderRadius:3,transition:"width 0.6s ease"}}/>
              </div>
              <span style={{fontSize:10,color:confLevel.col,fontWeight:700,fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap"}}>{conf}%</span>
            </div>
            {/* Mini sparkline */}
            <svg viewBox={`0 0 80 20`} style={{width:48,height:14,flexShrink:0}}>
              <polyline points={sparkPts} fill="none" stroke={isBull?"#00E58F":"#FF4D6A"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* AI agreement */}
            <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.15)",borderRadius:7,padding:"3px 8px"}}>
              <span style={{fontSize:10}}>🧠</span>
              <span style={{fontSize:10,fontWeight:700,color:C.blue,fontVariantNumeric:"tabular-nums"}}>{aiPct}%</span>
            </div>
          </div>
          {/* Tags */}
          {post.tags?.length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
            {post.tags.map(tg=><span key={tg} style={{background:"rgba(37,99,235,0.07)",color:"#2563EB",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:600}}>#{tg}</span>)}
          </div>}
          {/* Action row */}
          <div style={{display:"flex",gap:0,alignItems:"center",marginTop:2}}>
            {[{icon:"♥",val:likes,active:liked,col:C.bear,fn:()=>{setLiked(!liked);setLikes(liked?likes-1:likes+1);if(!liked)onPoints(POINT_ACTIONS.like_received,"¡Like recibido!");}},
              {icon:"💬",val:post.comments,active:false,col:C.blue,fn:()=>{}},
              {icon:"↗",val:post.reposts,active:repost,col:C.bull,fn:()=>setRepost(!repost)}
            ].map(({icon,val,active,col,fn},i)=>(
              <button key={i} onClick={fn}
                style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:active?col:"#94A3B8",fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:7,transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(15,23,42,0.05)";e.currentTarget.style.color=col;}}
                onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=active?col:"#334155";}}>
                <span style={{fontSize:13}}>{icon}</span><span style={{fontVariantNumeric:"tabular-nums"}}>{val}</span>
              </button>
            ))}
            <div style={{marginLeft:"auto",fontSize:10,color:"#94A3B8",fontWeight:500}}>
              {`${91-((post.id||0)%30)} traders coinciden`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NEW POST ──────────────────────────────────────────────────────────────────
const MENTION_TICKERS = ["AAPL","MSFT","GOOGL","AMZN","NVDA","TSLA","META","BTC","ETH","SPY","AMD","NFLX","COIN","PLTR","SMCI","ARM","JPM","V","BABA","RIVN"];

function NewPost({user,onPost,onNeedAuth,lang,defaultTicker=""}){
  const t=LANGS[lang];
  const [text,setText]=useState(""),[ticker,setTicker]=useState(defaultTicker),[sent,setSent]=useState("bull"),[modMsg,setModMsg]=useState("");
  const [posting,setPosting]=useState(false);
  const [image,setImage]=useState(null);
  const [showGif,setShowGif]=useState(false);
  const fileRef=useRef(null);
  const [mentionBox,setMentionBox]=useState({open:false,query:"",results:[],caretPos:0});
  const taRef=useRef();

  // Detectar @ en el textarea y mostrar autocomplete
  const handleTextChange=(e)=>{
    const val=e.target.value;
    setText(val);
    const pos=e.target.selectionStart;
    // Buscar @ antes del cursor
    const before=val.slice(0,pos);
    const match=before.match(/@([A-Z0-9]*)$/i);
    if(match){
      const q=match[1].toUpperCase();
      const results=MENTION_TICKERS.filter(t=>t.startsWith(q)).slice(0,6);
      setMentionBox({open:results.length>0||q.length===0,query:q,results:q.length===0?MENTION_TICKERS.slice(0,6):results,caretPos:pos});
    }else{
      setMentionBox(m=>({...m,open:false}));
    }
  };

  const insertMention=(sym)=>{
    const pos=mentionBox.caretPos;
    const before=text.slice(0,pos);
    const after=text.slice(pos);
    const match=before.match(/@([A-Z0-9]*)$/i);
    const start=match?pos-match[0].length:pos;
    const newText=text.slice(0,start)+"@"+sym+" "+after;
    setText(newText);
    setMentionBox(m=>({...m,open:false}));
    setTimeout(()=>taRef.current?.focus(),50);
  };

  const submit=async()=>{
    if(!user){onNeedAuth();return;}
    if(!text.trim())return;
    const mod=moderateText(text);
    if(!mod.ok){setModMsg(t.modWarning);setTimeout(()=>setModMsg(""),4000);return;}
    setPosting(true);
    await onPost({text,ticker:ticker.toUpperCase()||"GENERAL",sentiment:sent,image:image||null});
    setText("");setTicker("");setModMsg("");setImage(null);setShowGif(false);
    setPosting(false);
  };

  return(
    <div style={{background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.09)",borderRadius:14,padding:"14px 16px",marginBottom:12,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
      {modMsg&&<div style={{background:"rgba(255,77,106,0.08)",border:"1px solid rgba(255,77,106,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:C.bear}}>{modMsg}</div>}
      <div style={{display:"flex",gap:10}}>
        {user?<AvatarBubble emoji={user.emoji} color={user.avatarColor||C.accent} online level={user.points}/>:<div style={{width:38,height:38,borderRadius:"50%",background:"rgba(15,23,42,0.06)",border:"1px solid rgba(15,23,42,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>👤</div>}
        <div style={{flex:1,position:"relative"}}>
          {!user&&<div style={{background:"rgba(0,160,96,0.05)",border:"1px solid rgba(0,160,96,0.18)",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:13,color:C.muted}}>
            <span style={{color:C.accent,fontWeight:700,cursor:"pointer"}} onClick={onNeedAuth}>{t.login}</span> {lang==="en"?"to share your analysis":"para compartir tu análisis"}
          </div>}
          {user&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <LevelBadge points={user.points} lang={lang}/>
            <span style={{color:"#94A3B8",fontSize:11}}>+{POINT_ACTIONS.post} pts</span>
          </div>}
          <textarea ref={taRef} value={text} onChange={handleTextChange}
            placeholder="¿Qué piensas del mercado? Usa $NVDA para cashtags y @META para mencionar activos · Enter para publicar"
            style={{width:"100%",background:"#F8FAFC",border:"1px solid rgba(15,23,42,0.1)",borderRadius:9,color:"#0F172A",fontSize:13.5,padding:"10px 12px",resize:"none",outline:"none",height:72,fontFamily:"inherit",lineHeight:1.6,boxSizing:"border-box",transition:"border-color 0.15s"}}
            onFocus={e=>e.target.style.borderColor="rgba(0,160,96,0.4)"}
            onBlur={e=>{e.target.style.borderColor="rgba(15,23,42,0.1)";setTimeout(()=>setMentionBox(m=>({...m,open:false})),200);}}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}}/>
          {/* @Mention autocomplete dropdown */}
          {mentionBox.open&&(
            <div style={{position:"absolute",top:user?108:80,left:0,right:0,background:"#FFFFFF",border:"1px solid rgba(37,99,235,0.25)",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:200,overflow:"hidden"}}>
              <div style={{padding:"6px 10px 4px",fontSize:10,color:"#3B82F6",fontWeight:700,letterSpacing:0.8,borderBottom:"1px solid rgba(15,23,42,0.07)"}}>MENCIONAR ACTIVO</div>
              {mentionBox.results.map(sym=>(
                <div key={sym} onMouseDown={()=>insertMention(sym)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:"pointer",transition:"background 0.1s",borderBottom:"1px solid rgba(15,23,42,0.06)"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(37,99,235,0.06)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{background:"rgba(37,99,235,0.07)",color:"#2563EB",borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700,fontFamily:"monospace",border:"1px solid rgba(37,99,235,0.2)"}} >@{sym}</span>
                  <span style={{color:"#475569",fontSize:11}}>Mencionar {sym}</span>
                </div>
              ))}
            </div>
          )}
          {/* Bullish / Bearish — outline minimalista */}
          <div style={{display:"flex",gap:8,marginTop:10,marginBottom:10}}>
            {[
              {v:"bull",label:"▲ Alcista",col:"#16A34A"},
              {v:"bear",label:"▼ Bajista",col:"#DC2626"},
            ].map(({v,label,col})=>{
              const active=sent===v;
              return(
                <button key={v} onClick={()=>setSent(v)}
                  style={{flex:1,background:active?`${col}10`:"#FFFFFF",border:`1.5px solid ${active?col:"rgba(15,23,42,0.12)"}`,borderRadius:9,padding:"8px 0",cursor:"pointer",textAlign:"center",transition:"all 0.15s",boxShadow:"none"}}>
                  <span style={{color:active?col:"#94A3B8",fontWeight:active?800:600,fontSize:12.5,letterSpacing:0.3}}>{label}</span>
                </button>
              );
            })}
          </div>
          {/* Preview imagen/GIF */}
          {image&&(
            <div style={{position:"relative",marginBottom:8,display:"inline-block"}}>
              <img src={image} alt="preview" style={{maxHeight:160,maxWidth:"100%",borderRadius:10,border:`1px solid ${C.border}`,display:"block"}}/>
              <button onClick={()=>setImage(null)} style={{position:"absolute",top:5,right:5,background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",color:"#fff",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          )}
          {/* GIF Picker */}
          {showGif&&<GifPicker onSelect={url=>{setImage(url);setShowGif(false);}} onClose={()=>setShowGif(false)}/>}
          <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
            {/* Foto upload */}
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
              onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setImage(ev.target.result);r.readAsDataURL(f);e.target.value="";}}/>
            <button onClick={()=>fileRef.current?.click()} title="Subir foto"
              style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:15,color:C.muted,transition:"all 0.15s",lineHeight:1}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
              📷
            </button>
            {/* GIF button */}
            <button onClick={()=>setShowGif(v=>!v)} title="Buscar GIF animado"
              style={{background:showGif?"linear-gradient(135deg,#8B5CF6,#6D28D9)":"transparent",border:`1.5px solid ${showGif?"#7C3AED":C.border}`,borderRadius:8,padding:"5px 11px",cursor:"pointer",fontSize:11,fontWeight:900,color:showGif?"#fff":"#7C3AED",letterSpacing:0.8,transition:"all 0.15s",display:"flex",alignItems:"center",gap:4}}
              onMouseEnter={e=>{if(!showGif){e.currentTarget.style.background="rgba(124,58,237,0.08)";e.currentTarget.style.borderColor="#7C3AED";}}}
              onMouseLeave={e=>{if(!showGif){e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor=C.border;}}}>
              <span style={{fontSize:13}}>🎞️</span> GIF
            </button>
            <input value={ticker} onChange={e=>setTicker(e.target.value)} placeholder="$TICKER"
              style={{background:"rgba(0,160,96,0.06)",border:"1px solid rgba(0,160,96,0.2)",borderRadius:7,color:"#007A48",padding:"7px 10px",fontSize:12,outline:"none",width:90,fontFamily:"monospace",textTransform:"uppercase",fontWeight:700,letterSpacing:1}}
              onFocus={e=>e.target.style.borderColor="rgba(0,160,96,0.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(0,160,96,0.2)"}/>
            <Btn onClick={submit} style={{marginLeft:"auto",padding:"8px 22px",fontSize:13,opacity:posting?0.6:1}}>{posting?"Publicando...":user?t.publish:t.login}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GIF PICKER (Tenor — funciona sin registro) ────────────────────────────────
const TENOR_KEY="AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCDg"; // Tenor v2 demo key
function GifPicker({onSelect,onClose}){
  const [q,setQ]=useState("");
  const [gifs,setGifs]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(false);

  const search=(query)=>{
    setLoading(true); setError(false);
    const endpoint = query.trim()
      ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&limit=16&media_filter=gif`
      : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=16&media_filter=gif`;
    fetch(endpoint)
      .then(r=>r.json())
      .then(d=>{
        setGifs(d.results||[]);
        setLoading(false);
      })
      .catch(()=>{setError(true);setLoading(false);});
  };

  useEffect(()=>{search("");},[]);

  return(
    <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid rgba(15,23,42,0.12)",borderRadius:12,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",zIndex:300,padding:12,marginTop:4}}>
      <div style={{display:"flex",gap:6,marginBottom:10}}>
        <input value={q} onChange={e=>setQ(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();search(q);}}}
          placeholder="Buscar GIF: trading, moon, bull..." autoFocus
          style={{flex:1,border:"1px solid rgba(15,23,42,0.1)",borderRadius:8,padding:"6px 10px",fontSize:12,outline:"none"}}/>
        <button onClick={()=>search(q)} style={{background:C.accent,border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>🔍</button>
        <button onClick={onClose} style={{background:"transparent",border:"1px solid rgba(15,23,42,0.1)",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:12,color:C.muted}}>✕</button>
      </div>
      {/* Sugerencias rápidas */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
        {["📈 bull","📉 bear","🚀 moon","💎 diamond hands","stonks","crypto"].map(tag=>(
          <button key={tag} onClick={()=>{const w=tag.replace(/^.*?\s/,"");setQ(w);search(w);}}
            style={{background:"rgba(0,168,255,0.07)",border:"1px solid rgba(0,168,255,0.18)",borderRadius:20,padding:"2px 9px",fontSize:11,cursor:"pointer",color:C.accentText,fontWeight:600}}>{tag}</button>
        ))}
      </div>
      {loading?(
        <div style={{textAlign:"center",padding:20,color:C.muted,fontSize:13}}>⏳ Buscando GIFs...</div>
      ):error?(
        <div style={{textAlign:"center",padding:20,color:C.muted,fontSize:13}}>😕 No se pudo cargar. Revisa tu conexión.</div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,maxHeight:200,overflowY:"auto"}}>
          {gifs.length===0
            ? <div style={{gridColumn:"1/-1",textAlign:"center",padding:20,color:C.muted,fontSize:13}}>No se encontraron GIFs</div>
            : gifs.map(g=>{
              const preview=g.media_formats?.tinygif?.url||g.media_formats?.gif?.url;
              const full=g.media_formats?.gif?.url||preview;
              return(
                <img key={g.id} src={preview} alt={g.title||"gif"}
                  style={{width:"100%",borderRadius:6,cursor:"pointer",transition:"opacity 0.15s",aspectRatio:"1",objectFit:"cover"}}
                  onClick={()=>onSelect(full)}
                  onMouseEnter={e=>e.target.style.opacity="0.75"}
                  onMouseLeave={e=>e.target.style.opacity="1"}/>
              );
            })
          }
        </div>
      )}
      <div style={{fontSize:9,color:C.muted2,textAlign:"right",marginTop:6}}>Powered by Tenor</div>
    </div>
  );
}

// ── TICKER PAGE (página completa de una acción) ───────────────────────────────
function SentimentHistoryPremium({ticker, isPremium, onNeedPremium}){
  const [open, setOpen] = useState(false); // colapsado por defecto
  const seed=ticker.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const rnd=(offset,min,max)=>Math.min(max,Math.max(min,Math.round(50+Math.sin((seed+offset)*0.9)*20+Math.cos((seed+offset)*0.5)*12)));

  // Periodos: 1 día siempre visible, el resto premium
  const periods=[
    {label:"Hace 24h",    key:"1d",  bull:rnd(1,35,75), free:true},
    {label:"Hace 1 sem",  key:"1w",  bull:rnd(2,30,78), free:false},
    {label:"Hace 1 mes",  key:"1m",  bull:rnd(3,28,80), free:false},
    {label:"Hace 3 meses",key:"3m",  bull:rnd(5,25,82), free:false},
    {label:"Hace 6 meses",key:"6m",  bull:rnd(8,22,85), free:false},
    {label:"Hace 1 año",  key:"1y",  bull:rnd(13,20,85),free:false},
  ];

  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",marginBottom:20}}>
      {/* Header — clic para expandir/colapsar */}
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"13px 18px",background:"linear-gradient(135deg,rgba(124,58,237,0.07),rgba(59,130,246,0.04))",borderBottom:open?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",userSelect:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:17}}>🧭</span>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:C.text}}>Sentimiento del mercado</div>
            <div style={{fontSize:11,color:C.muted}}>Toca para {open?"ocultar":"ver"} el historial de ${ticker}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {isPremium
            ? <span style={{background:"linear-gradient(135deg,#7C3AED,#6D28D9)",color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800}}>✦ VIP</span>
            : <button onClick={e=>{e.stopPropagation();onNeedPremium();}} style={{background:"linear-gradient(135deg,#7C3AED,#9333EA)",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer"}}>✦ VIP</button>
          }
          {/* Flecha animada */}
          <span style={{fontSize:16,color:C.muted,display:"inline-block",transition:"transform 0.25s",transform:open?"rotate(180deg)":"rotate(0deg)",lineHeight:1}}>▾</span>
        </div>
      </div>

      {/* Contenido — solo visible cuando open=true */}
      {open && (
        <>
          {/* Filas de periodos */}
          <div>
            {periods.map(({label,key,bull,free},i)=>{
              const visible=free||isPremium;
              const isBull=bull>=50;
              return(
                <div key={key} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",borderBottom:i<periods.length-1?`1px solid ${C.border}`:"none",background:free&&i===0?"rgba(0,229,143,0.02)":"transparent"}}>
                  {/* Etiqueta */}
                  <div style={{width:110,fontSize:12,color:C.muted,fontWeight:600,flexShrink:0}}>{label}</div>

                  {visible?(
                    <>
                      {/* Pill alcista/bajista */}
                      <div style={{background:isBull?"rgba(0,229,143,0.1)":"rgba(255,77,106,0.1)",border:`1px solid ${isBull?"rgba(0,229,143,0.3)":"rgba(255,77,106,0.3)"}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:800,color:isBull?C.bull:C.bear,minWidth:80,textAlign:"center",flexShrink:0}}>
                        {isBull?"🐂 Alcista":"🐻 Bajista"}
                      </div>
                      {/* Barra de progreso */}
                      <div style={{flex:1,height:8,background:C.card2,borderRadius:20,overflow:"hidden"}}>
                        <div style={{width:`${bull}%`,height:"100%",background:isBull?"linear-gradient(90deg,#00E58F,#00c49a)":"linear-gradient(90deg,#FF4D6A,#cc3355)",borderRadius:20,transition:"width 0.6s ease"}}/>
                      </div>
                      {/* Porcentaje */}
                      <div style={{fontSize:12,fontWeight:800,color:isBull?C.bull:C.bear,fontFamily:"monospace",minWidth:38,textAlign:"right"}}>{bull}%</div>
                    </>
                  ):(
                    <>
                      {/* Bloqueado */}
                      <div style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:800,color:"#7C3AED",flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
                        🔒 Premium
                      </div>
                      <div style={{flex:1,height:8,background:`repeating-linear-gradient(90deg,rgba(124,58,237,0.1) 0px,rgba(124,58,237,0.1) 8px,transparent 8px,transparent 14px)`,borderRadius:20}}/>
                      <button onClick={e=>{e.stopPropagation();onNeedPremium();}} style={{fontSize:10,fontWeight:700,color:"#7C3AED",background:"transparent",border:"none",cursor:"pointer",whiteSpace:"nowrap",textDecoration:"underline"}}>Ver →</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {!isPremium&&(
            <div style={{padding:"12px 18px",background:"linear-gradient(135deg,rgba(124,58,237,0.06),rgba(147,51,234,0.04))",borderTop:`1px solid ${C.border}`,textAlign:"center"}}>
              <span style={{fontSize:12,color:C.muted}}>Desbloquea el sentimiento histórico completo con </span>
              <span onClick={onNeedPremium} style={{fontSize:12,color:"#7C3AED",fontWeight:800,cursor:"pointer"}}>NexoTrade VIP ✦</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TickerPage({ticker,posts=[],onClose,lang="es",user,onPost,onNeedAuth,isPremium=false,onNeedPremium}){
  const [quote,setQuote]=useState(null);
  const [loadingQ,setLoadingQ]=useState(true);
  const [showChart,setShowChart]=useState(true);

  const tkPosts=posts.filter(p=>
    p.ticker===ticker||
    (p.text?.toUpperCase().includes(`$${ticker}`))||
    (p.text?.toUpperCase().includes(`@${ticker}`))
  );
  const bullN=tkPosts.filter(p=>p.sentiment==="bull").length;
  const bearN=tkPosts.filter(p=>p.sentiment==="bear").length;
  const total=bullN+bearN;
  const bullPct=total>0?Math.round(bullN/total*100):50;

  useEffect(()=>{
    setLoadingQ(true);
    fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`)
      .then(r=>r.json()).then(q=>{setQuote(q);setLoadingQ(false);}).catch(()=>setLoadingQ(false));
  },[ticker]);

  const price=quote?.c||0;
  const chg=quote?.dp||0;
  const chgAbs=quote?.d||0;

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <button onClick={onClose}
          style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 14px",cursor:"pointer",color:C.muted,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
          ← Volver
        </button>
        <div style={{background:chg>=0?C.bullBg:C.bearBg,borderRadius:10,padding:"8px 18px"}}>
          <span style={{fontWeight:900,fontSize:20,fontFamily:"monospace",color:chg>=0?C.bull:C.bear}}>${ticker}</span>
        </div>
        {!loadingQ&&price>0&&(
          <div>
            <div style={{fontWeight:800,fontSize:22,fontFamily:"monospace",color:C.text}}>
              ${price>=1000?price.toLocaleString("en",{minimumFractionDigits:0,maximumFractionDigits:0}):price.toFixed(2)}
            </div>
            <div style={{fontWeight:700,fontSize:13,color:chg>=0?C.bull:C.bear}}>
              {chg>=0?"+":""}{chg.toFixed(2)}% ({chg>=0?"+":""}{chgAbs.toFixed(2)})
            </div>
          </div>
        )}
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Sentimiento NexoTrade</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:C.bull,fontWeight:700,fontSize:12}}>{bullPct}% 🐂</span>
            <div style={{width:60,height:5,background:C.bearBg,borderRadius:20,overflow:"hidden"}}>
              <div style={{width:`${bullPct}%`,height:"100%",background:C.bull,borderRadius:20}}/>
            </div>
            <span style={{color:C.bear,fontWeight:700,fontSize:12}}>{100-bullPct}% 🐻</span>
          </div>
          <div style={{fontSize:10,color:C.muted2,marginTop:2}}>{total} votos de la comunidad</div>
        </div>
      </div>

      {/* Cajón para escribir posts sobre este ticker */}
      <div style={{marginBottom:16}}>
        <NewPost user={user} onPost={onPost} onNeedAuth={onNeedAuth} lang={lang} defaultTicker={ticker}/>
      </div>

      {/* TradingView Chart con toggle */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:showChart?`1px solid ${C.border}`:"none"}}>
          <span style={{fontWeight:700,fontSize:13,color:C.text}}>📊 Gráfico ${ticker}</span>
          <button onClick={()=>setShowChart(v=>!v)}
            style={{background:"rgba(0,168,255,0.08)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:8,padding:"5px 14px",cursor:"pointer",color:"#00A8FF",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.15)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(0,168,255,0.08)"}>
            {showChart ? "▲ Ocultar" : "▼ Mostrar"}
          </button>
        </div>
        {showChart&&(
          <div style={{height:320}}>
            <iframe
              src={`https://s.tradingview.com/widgetembed/?symbol=${ticker}&interval=D&theme=light&style=1&locale=${lang==="en"?"en":"es"}&hide_top_toolbar=0&hide_legend=0&save_image=0`}
              style={{width:"100%",height:"100%",border:"none"}}
              title={`${ticker} chart`}/>
          </div>
        )}
      </div>

      {/* Sentimiento Histórico — Premium */}
      <SentimentHistoryPremium
        ticker={ticker}
        isPremium={isPremium}
        onNeedPremium={onNeedPremium||onNeedAuth}
      />

      {/* Posts de la comunidad */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <h3 style={{margin:0,color:C.text,fontWeight:800,fontSize:16}}>
          💬 {lang==="en"?"Community posts about":"Posts de la comunidad sobre"} ${ticker}
        </h3>
        <span style={{background:C.accentDim,color:C.accentText,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{tkPosts.length}</span>
      </div>
      {tkPosts.length===0?(
        <div style={{textAlign:"center",padding:"28px 0",color:C.muted,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14}}>
          <div style={{fontSize:28,marginBottom:8}}>📭</div>
          <div style={{fontSize:14}}>{lang==="en"?`Be the first to post about $${ticker}!`:`¡Sé el primero en comentar $${ticker}!`}</div>
        </div>
      ):(
        tkPosts.map(p=><PostCard key={p.id} post={p} onProfile={()=>{}} onPoints={()=>{}} onTickerClick={()=>{}} lang={lang}/>)
      )}

    </div>
  );
}

// ── TOPS / NOTICIAS / EARNINGS / TRENDING ─────────────────────────────────────
const thS={padding:"9px 14px",color:C.muted,fontWeight:700,fontSize:11,letterSpacing:0.8,textAlign:"left",background:C.card2};
const tdS={padding:"11px 14px",fontSize:13};
const TOP_D={activas:[{ticker:"NVDA",name:"NVIDIA",price:875.40,change:+2.8,vol:"$42.1B",mentions:1240},{ticker:"BTC",name:"Bitcoin",price:68420,change:+4.2,vol:"$38.6B",mentions:1100},{ticker:"TSLA",name:"Tesla",price:172.80,change:-3.1,vol:"$31.6B",mentions:980},{ticker:"AAPL",name:"Apple",price:189.50,change:+0.4,vol:"$28.3B",mentions:760},{ticker:"SPY",name:"S&P 500",price:521.30,change:-0.8,vol:"$22.4B",mentions:640}],ganadoras:[{ticker:"SMCI",name:"SuperMicro",price:950.20,change:+18.4,vol:"$8.2B"},{ticker:"ARM",name:"ARM Hold.",price:142.60,change:+11.2,vol:"$5.1B"},{ticker:"MSTR",name:"MicroStrat.",price:1820,change:+9.8,vol:"$4.7B"},{ticker:"COIN",name:"Coinbase",price:248.90,change:+7.3,vol:"$3.9B"},{ticker:"PLTR",name:"Palantir",price:24.80,change:+6.1,vol:"$2.8B"}],perdedoras:[{ticker:"BABA",name:"Alibaba",price:74.20,change:-8.9,vol:"$6.3B"},{ticker:"BYND",name:"Beyond Meat",price:7.40,change:-7.4,vol:"$0.8B"},{ticker:"RIVN",name:"Rivian",price:11.20,change:-6.2,vol:"$3.2B"},{ticker:"SNAP",name:"Snap",price:11.80,change:-5.8,vol:"$2.1B"},{ticker:"PYPL",name:"PayPal",price:61.40,change:-4.9,vol:"$4.5B"}]};

function TopTable({title,icon,data,cols}){
  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",marginBottom:18,boxShadow:C.shadow}}>
      <div style={{padding:"14px 18px",background:C.card2,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:18}}>{icon}</span><h3 style={{margin:0,color:C.text,fontSize:14,fontWeight:800}}>{title}</h3>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={thS}>#</th>{cols.map(c=><th key={c.k} style={thS}>{c.label}</th>)}</tr></thead>
          <tbody>{data.map((row,i)=>(
            <tr key={row.ticker} style={{borderBottom:`1px solid ${C.border}`,transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.card2}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{...tdS,color:i<3?C.gold:"#94a3b8",fontWeight:800,fontSize:15}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</td>
              {cols.map(c=>{const val=c.render?c.render(row):row[c.k],col=c.col?c.col(row):C.text;return <td key={c.k} style={{...tdS,color:col,fontFamily:c.mono?"monospace":"inherit",fontWeight:c.bold?700:500}}>{val}</td>;})}
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

const TOPS_TICKERS=[
  {ticker:"NVDA",name:"NVIDIA"},{ticker:"AAPL",name:"Apple"},{ticker:"TSLA",name:"Tesla"},
  {ticker:"AMZN",name:"Amazon"},{ticker:"META",name:"Meta"},{ticker:"MSFT",name:"Microsoft"},
  {ticker:"GOOGL",name:"Alphabet"},{ticker:"NFLX",name:"Netflix"},{ticker:"AMD",name:"AMD"},
  {ticker:"COIN",name:"Coinbase"},{ticker:"PLTR",name:"Palantir"},{ticker:"SMCI",name:"SuperMicro"},
  {ticker:"MSTR",name:"MicroStrategy"},{ticker:"ARM",name:"ARM Holdings"},{ticker:"BABA",name:"Alibaba"},
  {ticker:"RIVN",name:"Rivian"},{ticker:"SNAP",name:"Snap"},{ticker:"PYPL",name:"PayPal"},
  {ticker:"SPY",name:"S&P 500 ETF"},{ticker:"QQQ",name:"Nasdaq ETF"},
];

function TopsPage({posts=[]}){
  const [tab,setTab]=useState("activas");
  const [quotes,setQuotes]=useState([]);
  const [loading,setLoading]=useState(true);
  const tabs=[["activas","🔥 Más Activas"],["ganadoras","📈 Ganadoras"],["perdedoras","📉 Perdedoras"],["leaderboard","🏆 Leaderboard"]];

  useEffect(()=>{
    setLoading(true);
    // Traer cotizaciones reales de Finnhub para todos los tickers
    Promise.all(
      TOPS_TICKERS.map(({ticker,name})=>
        fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`)
          .then(r=>r.json())
          .then(q=>({ticker,name,price:q.c,change:q.dp,changeAbs:q.d,high:q.h,low:q.l,open:q.o,prevClose:q.pc}))
          .catch(()=>null)
      )
    ).then(results=>{
      setQuotes(results.filter(r=>r&&r.price>0));
      setLoading(false);
    });
  },[]);

  const sorted=[...quotes].sort((a,b)=>Math.abs(b.change)-Math.abs(a.change));
  const ganadoras=[...quotes].filter(q=>q.change>0).sort((a,b)=>b.change-a.change).slice(0,5);
  const perdedoras=[...quotes].filter(q=>q.change<0).sort((a,b)=>a.change-b.change).slice(0,5);
  const activas=sorted.slice(0,5);

  const Row=({q,rank})=>(
    <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 16px",marginBottom:8,transition:"all 0.15s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderHover;e.currentTarget.style.boxShadow=C.shadow;}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="none";}}>
      <span style={{fontSize:12,fontWeight:800,color:C.muted2,width:18,textAlign:"center"}}>{rank}</span>
      <div style={{background:q.change>=0?C.bullBg:C.bearBg,borderRadius:8,padding:"6px 10px",minWidth:64,textAlign:"center"}}>
        <div style={{fontWeight:800,fontSize:13,fontFamily:"monospace",color:q.change>=0?C.bull:C.bear}}>{q.ticker}</div>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:600,fontSize:13,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.name}</div>
        <div style={{fontSize:11,color:C.muted,fontFamily:"monospace"}}>${q.price?.toFixed(2)}</div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontWeight:800,fontSize:14,fontFamily:"monospace",color:q.change>=0?C.bull:C.bear}}>
          {q.change>=0?"+":""}{q.change?.toFixed(2)}%
        </div>
        <div style={{fontSize:11,color:C.muted,fontFamily:"monospace"}}>{q.change>=0?"+":""}{q.changeAbs?.toFixed(2)}</div>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>📊 Tops del Mercado</h2>
        {loading
          ?<span style={{fontSize:11,color:C.muted}}>⏳ Cargando precios...</span>
          :<span style={{fontSize:11,color:C.bull,fontWeight:700}}>🟢 Precios en vivo · Finnhub</span>}
        <button onClick={()=>{setLoading(true);setQuotes([]);setTimeout(()=>setLoading(false),100);}}
          style={{marginLeft:"auto",background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,color:C.muted,fontWeight:600}}
          title="Actualizar">🔄 Refresh</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{background:tab===k?C.accent:"transparent",border:`1.5px solid ${tab===k?C.accent:C.border}`,borderRadius:10,padding:"7px 14px",cursor:"pointer",color:tab===k?"#fff":C.muted,fontSize:12,fontWeight:700,whiteSpace:"nowrap",transition:"all 0.15s"}}>{l}</button>)}
      </div>
      {loading?(
        <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
          <div style={{fontSize:28,marginBottom:8}}>⏳</div>
          <div>Cargando datos en vivo...</div>
        </div>
      ):(
        <>
          {tab==="activas"&&(activas.length>0?activas.map((q,i)=><Row key={q.ticker} q={q} rank={i+1}/>):<div style={{color:C.muted,textAlign:"center",padding:32}}>Sin datos</div>)}
          {tab==="ganadoras"&&(ganadoras.length>0?ganadoras.map((q,i)=><Row key={q.ticker} q={q} rank={i+1}/>):<div style={{color:C.muted,textAlign:"center",padding:32}}>Sin ganadoras por ahora</div>)}
          {tab==="perdedoras"&&(perdedoras.length>0?perdedoras.map((q,i)=><Row key={q.ticker} q={q} rank={i+1}/>):<div style={{color:C.muted,textAlign:"center",padding:32}}>Sin perdedoras por ahora</div>)}
          {tab==="leaderboard"&&(()=>{
            // Calcular top traders esta semana por posts
            const weekAgo=Date.now()-7*24*60*60*1000;
            const map={};
            posts.forEach(p=>{
              if(!p.user)return;
              if(!map[p.user]) map[p.user]={user:p.user,avatar:p.avatar||"🦅",color:p.avatarColor||C.accent,posts:0,bull:0,bear:0,pts:0};
              map[p.user].posts++;
              map[p.user].pts+=10;
              if(p.sentiment==="bull") map[p.user].bull++; else map[p.user].bear++;
              if(p.likes) map[p.user].pts+=p.likes*5;
            });
            const lb=Object.values(map).sort((a,b)=>b.pts-a.pts).slice(0,10);
            const medals=["🥇","🥈","🥉"];
            if(lb.length===0) return <div style={{textAlign:"center",padding:40,color:C.muted}}>
              <div style={{fontSize:32,marginBottom:8}}>🏆</div>
              <div>¡Publica tu primer análisis para aparecer aquí!</div>
            </div>;
            return lb.map((u,i)=>{
              const lvl=getLevel(u.pts);
              const bullPct=u.bull+u.bear>0?Math.round(u.bull/(u.bull+u.bear)*100):50;
              return(
                <div key={u.user} style={{background:i===0?`linear-gradient(135deg,rgba(217,119,6,0.06),rgba(245,158,11,0.03))`:C.surface,border:`1px solid ${i===0?"rgba(217,119,6,0.25)":C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderHover;e.currentTarget.style.boxShadow=C.shadow;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=i===0?"rgba(217,119,6,0.25)":C.border;e.currentTarget.style.boxShadow="none";}}>
                  <span style={{fontWeight:900,fontSize:i<3?22:15,width:28,textAlign:"center",flexShrink:0}}>{medals[i]||<span style={{color:C.muted2}}>{i+1}</span>}</span>
                  <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${u.color},${u.color}88)`,border:`2px solid ${u.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{u.avatar}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <span style={{fontWeight:800,fontSize:14,color:C.text}}>{u.user}</span>
                      <span style={{background:lvl.color+"20",color:lvl.color,borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:800,border:`1px solid ${lvl.color}44`}}>{lvl.icon} {lvl.label}</span>
                    </div>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <span style={{fontSize:11,color:C.muted}}>📝 {u.posts} posts</span>
                      <span style={{fontSize:11,color:C.bull}}>▲{u.bull}</span>
                      <span style={{fontSize:11,color:C.bear}}>▼{u.bear}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontWeight:800,fontSize:15,color:i===0?C.gold:C.accent}}>{u.pts.toLocaleString()}</div>
                    <div style={{fontSize:10,color:C.muted}}>puntos</div>
                  </div>
                </div>
              );
            });
          })()}
        </>
      )}
    </div>
  );
}

function NoticiasPage({lang}){
  const [cat,setCat]=useState("general");
  const [news,setNews]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    setLoading(true);
    // Finnhub news API — gratis ilimitado (30 req/min)
    fetch(`https://finnhub.io/api/v1/news?category=${cat}&token=${FINNHUB_KEY}`)
      .then(r=>r.json())
      .then(data=>{
        if(Array.isArray(data)){
          // Mostrar las 30 más recientes con imagen y headline
          setNews(data.filter(n=>n.headline&&n.source).slice(0,30));
        }
      })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[cat]);

  const cats=[
    {k:"general",  l:lang==="en"?"📰 Macro News":"📰 Macro",     color:C.accent},
    {k:"crypto",   l:lang==="en"?"₿ Crypto":"₿ Crypto",           color:"#F59E0B"},
    {k:"forex",    l:lang==="en"?"💱 Forex":"💱 Forex",           color:"#16A34A"},
    {k:"merger",   l:lang==="en"?"🏦 M&A":"🏦 M&A",              color:C.purple},
  ];

  const timeAgo=(ts)=>{
    const diff=Math.floor((Date.now()/1000)-ts);
    if(diff<60) return lang==="en"?`${diff}s ago`:`hace ${diff}s`;
    if(diff<3600) return lang==="en"?`${Math.floor(diff/60)}m ago`:`hace ${Math.floor(diff/60)}m`;
    if(diff<86400) return lang==="en"?`${Math.floor(diff/3600)}h ago`:`hace ${Math.floor(diff/3600)}h`;
    return lang==="en"?`${Math.floor(diff/86400)}d ago`:`hace ${Math.floor(diff/86400)}d`;
  };

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>📰 {lang==="en"?"Market News":"Noticias del Mercado"}</h2>
        <span style={{background:"#fef2f2",color:C.bear,border:`1px solid ${C.bear}33`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>🔴 LIVE</span>
        <span style={{color:C.muted2,fontSize:11,marginLeft:"auto"}}>Finnhub · {lang==="en"?"Updated now":"Actualizado ahora"}</span>
      </div>

      {/* Category tabs */}
      <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
        {cats.map(c=>(
          <button key={c.k} onClick={()=>setCat(c.k)}
            style={{background:cat===c.k?c.color:"transparent",border:`1.5px solid ${cat===c.k?c.color:C.border}`,borderRadius:20,padding:"6px 16px",cursor:"pointer",color:cat===c.k?"#fff":C.muted,fontSize:13,fontWeight:700,transition:"all 0.15s"}}>
            {c.l}
          </button>
        ))}
      </div>

      {/* News list */}
      {loading?(
        <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
          <div style={{fontSize:28,marginBottom:8}}>⏳</div>
          <div style={{fontSize:14}}>{lang==="en"?"Loading news...":"Cargando noticias..."}</div>
        </div>
      ):news.length===0?(
        <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
          <div style={{fontSize:28,marginBottom:8}}>📭</div>
          <div style={{fontSize:14}}>{lang==="en"?"No news at the moment":"No hay noticias en este momento"}</div>
        </div>
      ):(
        news.map((n,i)=>(
          <a key={i} href={n.url} target="_blank" rel="noopener noreferrer"
            style={{display:"block",textDecoration:"none",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,boxShadow:C.shadow,borderLeft:`4px solid ${cat==="crypto"?"#F59E0B":cat==="forex"?"#16A34A":cat==="merger"?C.purple:C.accent}`,transition:"box-shadow 0.2s,transform 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow=C.shadowMd;e.currentTarget.style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow=C.shadow;e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              {/* Imagen */}
              {n.image&&<img src={n.image} alt="" style={{width:72,height:52,objectFit:"cover",borderRadius:8,flexShrink:0,background:"#F1F5F9"}} onError={e=>{e.target.style.display="none";}}/>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}>
                  <span style={{background:cat==="crypto"?"rgba(245,158,11,0.1)":cat==="forex"?"rgba(22,163,74,0.1)":cat==="merger"?"rgba(124,58,237,0.08)":C.accentDim,color:cat==="crypto"?"#D97706":cat==="forex"?"#16A34A":cat==="merger"?C.purple:C.accentText,borderRadius:5,padding:"2px 8px",fontSize:10.5,fontWeight:700}}>{n.source}</span>
                  {n.related&&n.related.trim()&&<span style={{background:"rgba(15,23,42,0.05)",color:C.muted,borderRadius:4,padding:"2px 6px",fontSize:10.5,fontFamily:"monospace",fontWeight:600}}>{n.related.split(",")[0]}</span>}
                  <span style={{color:C.muted2,fontSize:10.5,marginLeft:"auto"}}>{timeAgo(n.datetime)}</span>
                </div>
                <p style={{margin:0,color:C.text,fontSize:13.5,fontWeight:600,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{n.headline}</p>
                {n.summary&&<p style={{margin:"4px 0 0",color:C.muted,fontSize:12,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"}}>{n.summary}</p>}
              </div>
            </div>
          </a>
        ))
      )}
    </div>
  );
}

function EarningsPage({lang}){
  const [liveEvent,   setLiveEvent]  = useState(null);
  const [selected,    setSelected]   = useState(null);   // ticker seleccionado para el panel detalle
  const [voted,       setVoted]      = useState({});
  const [votes,       setVotes]      = useState(Object.fromEntries(MOCK_EARNINGS.map(e=>[e.ticker, e.bull_pct])));
  const [earnings,    setEarnings]   = useState(MOCK_EARNINGS);
  const [loadingEar,  setLoadingEar] = useState(true);

  useEffect(()=>{
    const today=new Date();
    const from=today.toISOString().slice(0,10);
    const to=new Date(today.getTime()+14*24*60*60*1000).toISOString().slice(0,10);
    fetch(`https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${FINNHUB_KEY}`)
      .then(r=>r.json())
      .then(data=>{
        if(!data?.earningsCalendar?.length){setLoadingEar(false);return;}
        const todayOnly=new Date().toISOString().slice(0,10);
        const interesting=data.earningsCalendar.filter(e=>(e.epsEstimate!=null||e.revenueEstimate!=null)&&e.date>=todayOnly).slice(0,10).map(e=>{
          const mock=MOCK_EARNINGS.find(m=>m.ticker===e.symbol)||{};
          const dateObj=new Date(e.date+"T12:00:00");
          const todayStr=new Date().toISOString().slice(0,10);
          const isToday=e.date===todayStr;
          const dayLabel=isToday?"Hoy":dateObj.toLocaleDateString(lang==="en"?"en-US":"es-ES",{weekday:"short",day:"numeric",month:"short"});
          const hora=e.hour==="bmo"?(lang==="en"?"Before open":"Antes apertura"):(lang==="en"?"After close":"Tras cierre");
          const revEst=e.revenueEstimate?(e.revenueEstimate>=1e9?`$${(e.revenueEstimate/1e9).toFixed(1)}B`:`$${(e.revenueEstimate/1e6).toFixed(0)}M`):mock.rev_est||"—";
          const epsEst=e.epsEstimate!=null?`$${e.epsEstimate.toFixed(2)}`:mock.eps_est||"—";
          return{ticker:e.symbol,nombre:mock.nombre||e.symbol,fecha:isToday?"Hoy":dayLabel,fechaEn:isToday?"Today":dayLabel,hora,eps_est:epsEst,rev_est:revEst,
            sorpresa:e.epsActual!=null&&e.epsEstimate!=null?(e.epsActual>=e.epsEstimate?`+${((e.epsActual-e.epsEstimate)/Math.abs(e.epsEstimate)*100).toFixed(0)}%`:`${((e.epsActual-e.epsEstimate)/Math.abs(e.epsEstimate)*100).toFixed(0)}%`):mock.sorpresa||null,
            bull_pct:mock.bull_pct||50,community_votes:mock.community_votes||0,live:mock.live||false,live_viewers:mock.live_viewers||0,live_title:mock.live_title||"Earnings Call",live_speaker:mock.live_speaker||""};
        });
        if(interesting.length>0){setEarnings(interesting);setVotes(Object.fromEntries(interesting.map(e=>[e.ticker,e.bull_pct])));}
      })
      .catch(()=>{})
      .finally(()=>setLoadingEar(false));
  },[lang]);

  const vote=(ticker,dir)=>{
    if(voted[ticker])return;
    setVoted(v=>({...v,[ticker]:dir}));
    setVotes(v=>({...v,[ticker]:dir==="bull"?Math.min(99,v[ticker]+1):Math.max(1,v[ticker]-1)}));
  };

  // Group by date
  const dates=[...new Set(earnings.map(e=>lang==="en"?e.fechaEn:e.fecha))];
  const sel=selected?earnings.find(e=>e.ticker===selected):null;

  return(
    <div style={{display:"grid",gridTemplateColumns:sel?"1fr 340px":"1fr",gap:18,transition:"all 0.2s"}}>

      {/* LEFT — Stock list */}
      <div>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <h2 style={{margin:0,color:"#F1F5F9",fontSize:17,fontWeight:800,letterSpacing:-0.3}}>📅 Earnings Calendar</h2>
          <span style={{background:"rgba(245,158,11,0.12)",color:C.gold,border:"1px solid rgba(245,158,11,0.2)",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700}}>ESTA SEMANA</span>
          {loadingEar
            ?<span style={{marginLeft:"auto",color:"#334155",fontSize:11,display:"flex",alignItems:"center",gap:5}}>⏳ Cargando...</span>
            :<span style={{marginLeft:"auto",color:C.bull,fontSize:11,fontWeight:700}}>🟢 En vivo</span>}
        </div>

        {/* By-date groups */}
        {dates.map(fecha=>{
          const group=earnings.filter(e=>(lang==="en"?e.fechaEn:e.fecha)===fecha);
          return(
            <div key={fecha} style={{marginBottom:16}}>
              {/* Date label */}
              <div style={{fontSize:11,fontWeight:700,color:"#475569",letterSpacing:1,marginBottom:8,paddingLeft:2,textTransform:"uppercase"}}>{fecha}</div>
              {/* Stock rows */}
              {group.map(e=>{
                const bull=votes[e.ticker];
                const isToday=e.fecha==="Hoy"||e.fechaEn==="Today";
                const isSel=selected===e.ticker;
                return(
                  <div key={e.ticker}
                    onClick={()=>setSelected(isSel?null:e.ticker)}
                    style={{
                      display:"flex",alignItems:"center",gap:10,
                      background:isSel?"rgba(0,229,143,0.06)":isToday?"rgba(245,158,11,0.05)":"rgba(14,22,40,0.7)",
                      border:`1px solid ${isSel?"rgba(0,229,143,0.25)":isToday?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.055)"}`,
                      borderRadius:11,padding:"11px 14px",marginBottom:6,cursor:"pointer",transition:"all 0.15s",
                      boxShadow:isSel?"0 0 20px rgba(0,229,143,0.1)":"none"
                    }}
                    onMouseEnter={e2=>{if(!isSel){e2.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e2.currentTarget.style.background="rgba(14,22,40,0.9)";}}}
                    onMouseLeave={e2=>{if(!isSel){e2.currentTarget.style.borderColor=isToday?"rgba(245,158,11,0.2)":"rgba(255,255,255,0.055)";e2.currentTarget.style.background=isToday?"rgba(245,158,11,0.05)":"rgba(14,22,40,0.7)";}}}
                  >
                    {/* Ticker */}
                    <span style={{fontFamily:"monospace",fontSize:13,fontWeight:800,color:isToday?C.gold:C.accent,minWidth:50,letterSpacing:0.5}}>{e.ticker}</span>
                    {/* Company */}
                    <span style={{fontSize:13,fontWeight:600,color:"#CBD5E1",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.nombre}</span>
                    {/* Time */}
                    <span style={{fontSize:11,color:"#475569",whiteSpace:"nowrap"}}>{e.hora}</span>
                    {/* Live badge */}
                    {e.live&&<span onClick={ev=>{ev.stopPropagation();setLiveEvent(e);}} style={{background:"#ef4444",borderRadius:12,padding:"2px 8px",fontSize:10,fontWeight:800,color:"#fff",whiteSpace:"nowrap",cursor:"pointer"}}>🔴 LIVE</span>}
                    {/* Bull % pill */}
                    <div style={{display:"flex",gap:0,background:"rgba(255,255,255,0.04)",borderRadius:8,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
                      <span style={{fontSize:10,fontWeight:800,color:C.bull,padding:"3px 7px",background:"rgba(0,229,143,0.08)"}}>{bull}%</span>
                      <span style={{fontSize:10,fontWeight:800,color:C.bear,padding:"3px 7px",background:"rgba(255,77,106,0.08)"}}>{100-bull}%</span>
                    </div>
                    {/* Chevron */}
                    <span style={{color:"#334155",fontSize:14,transition:"transform 0.2s",transform:isSel?"rotate(90deg)":"none"}}>›</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* RIGHT — Detail panel (appears on click) */}
      {sel&&(()=>{
        const bull=votes[sel.ticker];
        const bear=100-bull;
        const myVote=voted[sel.ticker];
        const isToday=sel.fecha==="Hoy"||sel.fechaEn==="Today";
        return(
          <div style={{position:"sticky",top:88}}>
            <div style={{background:"rgba(14,22,40,0.95)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"20px",backdropFilter:"blur(20px)",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
              {/* Close */}
              <button onClick={()=>setSelected(null)} style={{float:"right",background:"none",border:"none",color:"#475569",fontSize:18,cursor:"pointer",lineHeight:1}}>×</button>
              {/* Ticker & name */}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontFamily:"monospace",fontSize:20,fontWeight:900,color:isToday?C.gold:C.accent}}>${sel.ticker}</span>
                  {isToday&&<span style={{background:"rgba(245,158,11,0.15)",color:C.gold,border:"1px solid rgba(245,158,11,0.3)",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:800}}>🔥 HOY</span>}
                </div>
                <div style={{fontSize:14,color:"#94A3B8",fontWeight:600}}>{sel.nombre}</div>
                <div style={{fontSize:12,color:"#475569",marginTop:2}}>{lang==="en"?sel.fechaEn:sel.fecha} · {sel.hora}</div>
              </div>

              {/* EPS + Rev + Sorpresa */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                {[["EPS Est.",sel.eps_est,C.accent],["Rev. Est.",sel.rev_est,C.blue],
                  ...(sel.sorpresa?[["Sorpresa",sel.sorpresa,C.bull]]:[])]
                  .map(([label,val,col])=>(
                  <div key={label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:9,padding:"10px 12px"}}>
                    <div style={{fontSize:10,color:"#475569",fontWeight:600,marginBottom:4,letterSpacing:0.3}}>{label}</div>
                    <div style={{fontFamily:"monospace",fontSize:16,fontWeight:800,color:col}}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Community sentiment — gauge style */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:"#475569",fontWeight:700,letterSpacing:0.5,marginBottom:8,textTransform:"uppercase"}}>Sentimiento de la Comunidad</div>
                {/* Semicircle gauge */}
                <div style={{textAlign:"center",position:"relative",marginBottom:8}}>
                  <svg viewBox="0 0 120 65" style={{width:"100%",maxWidth:160,margin:"0 auto",display:"block"}}>
                    {/* Background arc */}
                    <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round"/>
                    {/* Bull arc */}
                    <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${bull*1.57} 157`}/>
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444"/>
                        <stop offset="50%" stopColor="#F59E0B"/>
                        <stop offset="100%" stopColor="#00E58F"/>
                      </linearGradient>
                    </defs>
                    <text x="60" y="52" textAnchor="middle" fontSize="18" fontWeight="900" fill="#F1F5F9">{bull}%</text>
                  </svg>
                  <div style={{fontSize:12,color:"#64748B",marginTop:-4}}>
                    <span style={{color:C.bull,fontWeight:700}}>👍 Bullish</span> / <span style={{color:C.bear,fontWeight:700}}>{bear}% Bearish 👎</span>
                  </div>
                  <div style={{fontSize:11,color:"#334155",marginTop:4}}>💬 {sel.community_votes.toLocaleString()} votos</div>
                </div>
                {/* Bar */}
                <div style={{height:6,background:"rgba(255,255,255,0.05)",borderRadius:6,overflow:"hidden",display:"flex",marginBottom:12}}>
                  <div style={{width:`${bull}%`,background:`linear-gradient(90deg,${C.bull},#00c4d4)`,transition:"width 0.5s"}}/>
                  <div style={{flex:1,background:`linear-gradient(90deg,rgba(255,100,100,0.5),${C.bear})`}}/>
                </div>
                {/* Vote buttons */}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>vote(sel.ticker,"bull")} disabled={!!myVote}
                    style={{flex:1,background:myVote==="bull"?"rgba(0,229,143,0.15)":"transparent",border:`1.5px solid ${myVote==="bull"?C.bull:"rgba(0,229,143,0.2)"}`,borderRadius:9,padding:"10px 0",cursor:myVote?"not-allowed":"pointer",color:myVote==="bull"?C.bull:"#64748B",fontSize:12,fontWeight:700,transition:"all 0.15s",boxShadow:myVote==="bull"?"0 0 16px rgba(0,229,143,0.2)":"none"}}>
                    {myVote==="bull"?"✓ Alcista":"▲ Soy Alcista"}
                  </button>
                  <button onClick={()=>vote(sel.ticker,"bear")} disabled={!!myVote}
                    style={{flex:1,background:myVote==="bear"?"rgba(255,77,106,0.15)":"transparent",border:`1.5px solid ${myVote==="bear"?C.bear:"rgba(255,77,106,0.2)"}`,borderRadius:9,padding:"10px 0",cursor:myVote?"not-allowed":"pointer",color:myVote==="bear"?C.bear:"#64748B",fontSize:12,fontWeight:700,transition:"all 0.15s",boxShadow:myVote==="bear"?"0 0 16px rgba(255,77,106,0.2)":"none"}}>
                    {myVote==="bear"?"✓ Bajista":"▼ Soy Bajista"}
                  </button>
                </div>
              </div>

              {/* Live button if applicable */}
              {sel.live&&<button onClick={()=>setLiveEvent(sel)} style={{width:"100%",background:"#ef4444",border:"none",borderRadius:9,padding:"10px",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 0 20px rgba(239,68,68,0.4)"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>
                {sel.live_title} — EN VIVO
              </button>}
            </div>
          </div>
        );
      })()}

      {liveEvent&&<LiveConferenceModal event={liveEvent} lang={lang} onClose={()=>setLiveEvent(null)}/>}
    </div>
  );
}

// ── LIVE CONFERENCE MODAL ─────────────────────────────────────────────────────
function LiveConferenceModal({event, lang, onClose}){
  const [viewers]    = useState(event.live_viewers);
  const [reactions,setReactions] = useState([]);
  const [chatMsg, setChatMsg]    = useState("");
  const [elapsed, setElapsed]    = useState(0);
  const [chatLog, setChatLog]    = useState([
    {user:"SPY_Trader 🐂",  avatar:"🐂", msg: lang==="en"?"Watching EPS beat vs miss closely":"Pendiente del EPS vs estimado", time:"2m"},
    {user:"CryptoWolf",     avatar:"🐺", msg: lang==="en"?"Revenue growth YoY? 💹":"¿Crecimiento de ingresos YoY? 💹",  time:"1m"},
    {user:"NvidiaChad ⭐",  avatar:"🦅", msg: lang==="en"?"Management tone sounds cautious, watch guidance":"Tono de management cauteloso, ojo con el guidance",  time:"45s"},
  ]);

  useEffect(()=>{
    const t = setInterval(()=>setElapsed(s=>s+1),1000);
    return ()=>clearInterval(t);
  },[]);

  const fmtTime = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const sendReaction = (emoji) => {
    const id = Date.now();
    setReactions(r=>[...r,{id,emoji}]);
    setTimeout(()=>setReactions(r=>r.filter(x=>x.id!==id)),2000);
  };

  const sendChat = () => {
    if(!chatMsg.trim()) return;
    setChatLog(l=>[...l,{user:lang==="en"?"You":"Tú", avatar:"😊", msg:chatMsg, time:"ahora"}]);
    setChatMsg("");
  };

  const REACTIONS = ["🚀","🐂","🐻","💹","🔥","⚡","💡","😱"];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0f172a",borderRadius:20,width:"100%",maxWidth:820,maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 25px 60px rgba(0,0,0,0.6)"}}>

        {/* Header */}
        <div style={{padding:"14px 20px",borderBottom:"1px solid #1e293b",display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 12px",background:"#ef4444",borderRadius:20}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>
            <span style={{color:"#fff",fontWeight:800,fontSize:12,letterSpacing:1}}>EN VIVO</span>
          </div>
          <div style={{flex:1}}>
            <div style={{color:"#fff",fontWeight:800,fontSize:15}}>${event.ticker} — {event.live_title}</div>
            <div style={{color:"#64748b",fontSize:12}}>{event.live_speaker}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#00c49a",fontFamily:"monospace",fontWeight:700,fontSize:13}}>{fmtTime(elapsed)}</div>
              <div style={{color:"#64748b",fontSize:11}}>⏱ {lang==="en"?"Duration":"Duración"}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#e2e8f0",fontWeight:700,fontSize:13}}>{(viewers+Math.floor(elapsed/10)).toLocaleString()}</div>
              <div style={{color:"#64748b",fontSize:11}}>👀 {lang==="en"?"Watching":"Viendo"}</div>
            </div>
            <button onClick={onClose} style={{background:"#1e293b",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#94a3b8",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        </div>

        {/* Body: Player + Chat */}
        <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>

          {/* Player area */}
          <div style={{flex:1,display:"flex",flexDirection:"column",borderRight:"1px solid #1e293b"}}>
            {/* Video placeholder */}
            <div style={{flex:1,background:"#020617",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",minHeight:260}}>
              {/* Animated waveform */}
              <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:24}}>
                {[40,70,55,90,65,80,45,100,60,85,50,75].map((h,i)=>(
                  <div key={i} style={{width:5,borderRadius:3,background:`linear-gradient(180deg,#00c49a,#00a87f)`,height:`${h}%`,maxHeight:60,animation:`waveBar 0.8s ease-in-out ${i*0.07}s infinite alternate`,opacity:0.8}}/>
                ))}
              </div>
              {/* Company logo */}
              <div style={{width:64,height:64,borderRadius:16,background:"#1e293b",border:"2px solid #334155",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,marginBottom:14}}>
                {event.ticker==="TSLA"?"🚗":event.ticker==="MSFT"?"💻":event.ticker==="GOOGL"?"🔍":event.ticker==="META"?"👁":event.ticker==="NFLX"?"🎬":"📊"}
              </div>
              <div style={{color:"#e2e8f0",fontWeight:800,fontSize:18,marginBottom:4}}>{event.nombre}</div>
              <div style={{color:"#64748b",fontSize:13,marginBottom:16}}>{event.live_title}</div>
              <div style={{color:"#94a3b8",fontSize:12,background:"#0f172a",borderRadius:8,padding:"6px 14px",border:"1px solid #1e293b"}}>🎙️ {event.live_speaker}</div>
              {/* Live indicator */}
              <div style={{position:"absolute",top:12,left:12,display:"flex",alignItems:"center",gap:6,background:"rgba(239,68,68,0.15)",border:"1px solid #ef4444",borderRadius:20,padding:"4px 10px"}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:"#ef4444",display:"inline-block"}}/>
                <span style={{color:"#ef4444",fontSize:11,fontWeight:700}}>LIVE · ${event.ticker}</span>
              </div>
            </div>

            {/* Reaction bar */}
            <div style={{padding:"10px 16px",borderTop:"1px solid #1e293b",display:"flex",alignItems:"center",gap:8,background:"#0f172a"}}>
              <span style={{color:"#64748b",fontSize:12,marginRight:4}}>{lang==="en"?"React:":"Reaccionar:"}</span>
              {REACTIONS.map(r=>(
                <button key={r} onClick={()=>sendReaction(r)} style={{background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:16,transition:"transform 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{r}</button>
              ))}
              {/* Floating reactions */}
              {reactions.map(r=>(
                <span key={r.id} style={{position:"fixed",bottom:140,right:340,fontSize:24,pointerEvents:"none",animation:"floatUp 2s ease-out forwards"}}>{r.emoji}</span>
              ))}
            </div>
          </div>

          {/* Chat panel */}
          <div style={{width:270,display:"flex",flexDirection:"column",background:"#080f1a"}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid #1e293b",color:"#94a3b8",fontSize:12,fontWeight:700,letterSpacing:0.5}}>
              💬 {lang==="en"?"LIVE CHAT":"CHAT EN VIVO"}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:10}}>
              {chatLog.map((c,i)=>(
                <div key={i} style={{display:"flex",gap:8}}>
                  <span style={{fontSize:18,flexShrink:0}}>{c.avatar}</span>
                  <div>
                    <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                      <span style={{color:"#00c49a",fontSize:11,fontWeight:700}}>{c.user}</span>
                      <span style={{color:"#334155",fontSize:10}}>{c.time}</span>
                    </div>
                    <div style={{color:"#cbd5e1",fontSize:12,lineHeight:1.4,marginTop:2}}>{c.msg}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:"10px 12px",borderTop:"1px solid #1e293b",display:"flex",gap:6}}>
              <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}
                placeholder={lang==="en"?"Write a comment...":"Escribe un comentario..."}
                style={{flex:1,background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"7px 10px",color:"#e2e8f0",fontSize:12,outline:"none"}}/>
              <button onClick={sendChat} style={{background:C.accent,border:"none",borderRadius:8,padding:"7px 11px",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700}}>↑</button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes waveBar { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }
        @keyframes floatUp { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-80px)} }
      `}</style>
    </div>
  );
}

function TrendingPage({posts=[]}){
  const [quotes,setQuotes]=useState({});
  const [loading,setLoading]=useState(true);
  const [lastUpdate,setLastUpdate]=useState(null);

  // Calcular tickers trending desde los posts reales del foro
  const trendingData = useMemo(()=>{
    const map={};
    posts.forEach(p=>{
      if(!p.ticker||p.ticker==="GENERAL") return;
      if(!map[p.ticker]) map[p.ticker]={ticker:p.ticker,mentions:0,bull:0,bear:0};
      map[p.ticker].mentions++;
      if(p.sentiment==="bull") map[p.ticker].bull++;
      else map[p.ticker].bear++;
    });
    // Completar con fallback si hay pocos posts reales
    const FALLBACK=["NVDA","BTC","TSLA","AAPL","META","ETH","AMZN","SPY"];
    FALLBACK.forEach(tk=>{if(!map[tk]) map[tk]={ticker:tk,mentions:0,bull:0,bear:0};});
    return Object.values(map)
      .sort((a,b)=>b.mentions-a.mentions)
      .slice(0,10)
      .map(t=>({...t,sentiment:t.bull+t.bear>0?Math.round(t.bull/(t.bull+t.bear)*100):50}));
  },[posts]);

  const fetchQuotes=useCallback(()=>{
    if(!trendingData.length) return;
    setLoading(true);
    Promise.all(
      trendingData.map(({ticker})=>
        fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`)
          .then(r=>r.json())
          .then(q=>({ticker,price:q.c,change:q.dp,changeAbs:q.d}))
          .catch(()=>({ticker,price:0,change:0,changeAbs:0}))
      )
    ).then(results=>{
      const q={};
      results.forEach(r=>{q[r.ticker]=r;});
      setQuotes(q);
      setLastUpdate(new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}));
      setLoading(false);
    });
  },[trendingData]);

  useEffect(()=>{ fetchQuotes(); },[fetchQuotes]);

  // Auto-refresh cada 60 segundos
  useEffect(()=>{
    const interval=setInterval(fetchQuotes,60000);
    return()=>clearInterval(interval);
  },[fetchQuotes]);

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>🔥 Trending en NexoTrade</h2>
        <span style={{background:"rgba(239,68,68,0.08)",color:C.bear,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>Últimas 24h</span>
        {loading
          ?<span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>⏳ Actualizando...</span>
          :<span style={{fontSize:11,color:C.bull,fontWeight:700,marginLeft:"auto"}}>🟢 En vivo · {lastUpdate}</span>}
        <button onClick={fetchQuotes} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,color:C.muted,fontWeight:600}}>🔄</button>
      </div>

      {trendingData.map((t,i)=>{
        const q=quotes[t.ticker]||{};
        const change=q.change||0;
        const price=q.price||0;
        return(
          <div key={t.ticker} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 18px",marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,0.05)",display:"flex",alignItems:"center",gap:14,transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderHover;e.currentTarget.style.boxShadow=C.shadow;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.05)";}}>
            {/* Rank */}
            <span style={{fontWeight:900,fontSize:i<3?22:15,width:28,textAlign:"center",flexShrink:0}}>
              {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{color:C.muted2}}>{i+1}</span>}
            </span>
            {/* Ticker badge */}
            <div style={{background:change>=0?C.bullBg:C.bearBg,borderRadius:9,padding:"7px 12px",minWidth:60,textAlign:"center",flexShrink:0}}>
              <div style={{fontWeight:800,fontSize:13,fontFamily:"monospace",color:change>=0?C.bull:C.bear}}>{t.ticker}</div>
              {price>0&&<div style={{fontSize:10,color:C.muted,fontFamily:"monospace"}}>${price>=1000?price.toFixed(0):price.toFixed(2)}</div>}
            </div>
            {/* Info */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                {t.mentions>0&&<span style={{color:C.muted2,fontSize:12}}>💬 {t.mentions} menciones</span>}
                {change!==0&&<span style={{color:change>=0?C.bull:C.bear,fontWeight:700,fontSize:13,fontFamily:"monospace",marginLeft:"auto"}}>
                  {change>=0?"+":""}{change.toFixed(2)}%
                </span>}
              </div>
              {/* Sentiment bar */}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,color:C.bull,fontWeight:600,width:28}}>{t.sentiment}%</span>
                <div style={{flex:1,background:C.border,borderRadius:20,height:5,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:20,width:`${t.sentiment}%`,background:t.sentiment>60?`linear-gradient(90deg,${C.bull},#00e5b0)`:t.sentiment>40?"#f59e0b":`linear-gradient(90deg,${C.bear},#ff8080)`,transition:"width 0.4s"}}/>
                </div>
                <span style={{fontSize:11,color:C.bear,fontWeight:600,width:28,textAlign:"right"}}>{100-t.sentiment}%</span>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{textAlign:"center",color:C.muted2,fontSize:11,marginTop:8}}>
        🔄 Se actualiza automáticamente cada 60 segundos
      </div>
    </div>
  );
}


// ── PREMIUM PAGE ──────────────────────────────────────────────────────────────
function PremiumPage({user, isPremium, onSubscribe, onNeedAuth, lang}){
  const [billing, setBilling] = useState("monthly");
  const [email, setEmail] = useState(user?.email||"");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("planes");

  const price = billing==="monthly" ? 9.99 : 7.99;
  const savings = billing==="yearly" ? Math.round((9.99-7.99)*12) : 0;

  const FREE_FEATURES = [
    {ok:true,  text:"Foro general — publicar y comentar"},
    {ok:true,  text:"Watchlist (hasta 5 acciones)"},
    {ok:true,  text:"Battle Stocks — votar"},
    {ok:true,  text:"Leaderboard público"},
    {ok:true,  text:"Simulador paper trading"},
    {ok:true,  text:"Sistema de puntos y badges"},
    {ok:true,  text:"Gráficas japonesas avanzadas"},
  ];

  const PREMIUM_FEATURES = [
    {star:true, text:"★ Todo lo del plan Free"},
    {star:true, text:"★ Calculadora Sharpe Ratio"},
    {star:true, text:"★ Racha de ganancias + estadísticas"},
    {star:true, text:"★ Evolución del portafolio"},
    {star:true, text:"★ Calculadora riesgo/recompensa"},
    {star:true, text:"★ Alertas de precio personalizadas"},
    {star:true, text:"★ Alertas de noticias del día"},
    {star:true, text:"★ Bot IA de trading con ChatGPT"},
    {star:true, text:"★ Exportar datos (Excel/CSV)"},
    {star:true, text:"★ Watchlist semanal ilimitada"},
    {star:true, text:"★ GIFs en posts"},
    {star:true, text:"★ Gráficas japonesas avanzadas"},
    {star:true, text:"★ Sala VIP exclusiva"},
    {star:true, text:"★ Perfil privado top traders"},
    {star:true, text:"★ Badge VIP en perfil y posts"},
  ];

  const SIGNALS = [
    {ticker:"NVDA", tipo:"COMPRA", entrada:"$860", target:"$950", stop:"$830", conf:92, tiempo:"hace 2h", blur:!isPremium},
    {ticker:"BTC",  tipo:"COMPRA", entrada:"$67,200", target:"$72,000", stop:"$65,000", conf:85, tiempo:"hace 4h", blur:!isPremium},
    {ticker:"TSLA", tipo:"VENTA",  entrada:"$178", target:"$160", stop:"$185", conf:78, tiempo:"hace 6h", blur:!isPremium},
    {ticker:"ETH",  tipo:"COMPRA", entrada:"$3,750", target:"$4,200", stop:"$3,500", conf:81, tiempo:"hace 8h", blur:!isPremium},
  ];

  const WEBINARS = [
    {titulo:"Análisis técnico para principiantes", fecha:"Lun 20 May", hora:"19:00 CET", instructor:"SPY_Trader", spots:47, emoji:"📈"},
    {titulo:"Bitcoin: ciclos y análisis on-chain",  fecha:"Mié 22 May", hora:"20:00 CET", instructor:"CryptoWolf",  spots:32, emoji:"₿"},
    {titulo:"Cómo leer un earnings report",         fecha:"Vie 24 May", hora:"18:30 CET", instructor:"NvidiaChad",  spots:61, emoji:"📊"},
    {titulo:"Opciones: estrategias defensivas",     fecha:"Lun 27 May", hora:"19:00 CET", instructor:"SPY_Trader",  spots:28, emoji:"🛡️"},
  ];

  const ALERT_TYPES = [
    {icon:"📈", titulo:"Precio sube de...", desc:"Te avisamos cuando una acción supere tu precio objetivo"},
    {icon:"📉", titulo:"Precio baja de...", desc:"Alerta cuando una acción caiga por debajo de tu nivel"},
    {icon:"📅", titulo:"Earnings próximos", desc:"Email 24h antes del earnings de tus acciones favoritas"},
    {icon:"🔥", titulo:"Trending alert",   desc:"Cuando una acción explota en menciones en la comunidad"},
    {icon:"📊", titulo:"Volumen inusual",   desc:"Detectamos movimientos de volumen anómalos"},
    {icon:"📰", titulo:"Noticia urgente",   desc:"Breaking news de tus tickers favoritos al instante"},
  ];

  const handleSubscribe = () => {
    if(!user){ onNeedAuth(); return; }
    // Abrir Stripe Checkout — pago real con 7 días gratis
    // Pasamos el email del usuario para pre-rellenar el formulario de Stripe
    const stripeUrl = STRIPE_PAYMENT_LINK
      ? STRIPE_PAYMENT_LINK + (user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : "")
      : "https://dashboard.stripe.com"; // fallback si no se configuró el link
    window.open(stripeUrl, "_blank");
  };

  const TABS = [
    {k:"planes",   l:"💎 Planes"},
    {k:"senales",  l:"📡 Señales"},
    {k:"webinars", l:"🎓 Webinars"},
    {k:"alertas",  l:"📧 Alertas Email"},
  ];

  return(
    <div>
      {/* HERO */}
      <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)",borderRadius:20,padding:"40px 32px",marginBottom:24,textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:`radial-gradient(circle at 30% 50%,${C.accent}15,transparent 60%), radial-gradient(circle at 70% 50%,${C.blue}15,transparent 60%)`,pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          {isPremium
            ? <>
                <div style={{fontSize:48,marginBottom:12}}>⭐</div>
                <h1 style={{margin:"0 0 8px",color:"#fff",fontSize:26,fontWeight:900}}>¡Eres miembro Premium!</h1>
                <p style={{margin:"0 0 20px",color:"#94a3b8",fontSize:15}}>Tienes acceso completo a todas las funciones exclusivas.</p>
                <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                  {["🤖 IA Ilimitada","📡 Señales ON","📧 Alertas Email","🎓 Webinars"].map(b=>(
                    <span key={b} style={{background:C.bull+"22",color:C.bull,border:`1px solid ${C.bull}44`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700}}>{b}</span>
                  ))}
                </div>
              </>
            : <>
                <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.gold+"22",border:`1px solid ${C.gold}44`,borderRadius:20,padding:"6px 16px",marginBottom:16}}>
                  <span style={{fontSize:14}}>⭐</span>
                  <span style={{color:C.gold,fontSize:12,fontWeight:700,letterSpacing:1}}>NEXOTRADE PREMIUM</span>
                </div>
                <h1 style={{margin:"0 0 10px",color:"#fff",fontSize:28,fontWeight:900,lineHeight:1.2}}>Lleva tu trading al siguiente nivel</h1>
                <p style={{margin:"0 0 24px",color:"#94a3b8",fontSize:15,maxWidth:480,margin:"0 auto 24px"}}>Señales en tiempo real, IA sin límites, alertas por email y formación exclusiva.</p>
                <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                  {["📡 Señales de trading","🤖 IA ilimitada","📧 Alertas email","🎓 Webinars","⚡ Tiempo real"].map(b=>(
                    <span key={b} style={{background:"#ffffff15",border:"1px solid #ffffff22",borderRadius:20,padding:"6px 12px",fontSize:12,color:"#e2e8f0",fontWeight:600}}>{b}</span>
                  ))}
                </div>
              </>
          }
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"}}>
        {TABS.map(tb=>(
          <button key={tb.k} onClick={()=>setActiveTab(tb.k)} style={{background:activeTab===tb.k?C.accent:"transparent",border:`1.5px solid ${activeTab===tb.k?C.accent:C.border}`,borderRadius:10,padding:"8px 16px",cursor:"pointer",color:activeTab===tb.k?"#fff":C.muted,fontSize:13,fontWeight:700,transition:"all 0.15s"}}>{tb.l}</button>
        ))}
      </div>

      {/* ── PLANES TAB ── */}
      {activeTab==="planes" && <>
        {/* Billing toggle */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
          <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,padding:4,display:"inline-flex",gap:4}}>
            {[["monthly","Mensual"],["yearly","Anual"]].map(([k,l])=>(
              <button key={k} onClick={()=>setBilling(k)} style={{background:billing===k?C.accent:"transparent",border:"none",borderRadius:9,padding:"7px 20px",cursor:"pointer",color:billing===k?"#fff":C.muted,fontWeight:700,fontSize:13,fontFamily:"inherit",transition:"all 0.15s",display:"flex",alignItems:"center",gap:6}}>
                {l}
                {k==="yearly"&&<span style={{background:billing==="yearly"?"#ffffff33":C.bull+"22",color:billing==="yearly"?"#fff":C.bull,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:800}}>-20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid — exactly like the photo */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,marginBottom:28,borderRadius:18,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>

          {/* FREE PLAN — left, mismo estilo oscuro brillante */}
          <div style={{background:"rgba(10,16,30,0.98)",padding:"28px 26px",borderRight:"1px solid rgba(255,255,255,0.08)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,width:200,height:200,background:"radial-gradient(circle,rgba(0,168,255,0.07),transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{fontSize:22,fontWeight:900,color:"#00A8FF",marginBottom:4,letterSpacing:-0.3}}>Free</div>
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:2}}>
                <span style={{fontSize:28,fontWeight:900,color:"#F1F5F9"}}>$0</span>
                <span style={{fontSize:13,color:"#64748B"}}> / gratis para siempre</span>
              </div>
              <div style={{marginTop:18,marginBottom:22}}>
                {FREE_FEATURES.map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<FREE_FEATURES.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                    <span style={{fontSize:12,color:"#00A8FF",flexShrink:0}}>✓</span>
                    <span style={{fontSize:13,color:"#CBD5E1",lineHeight:1.4}}>{f.text}</span>
                  </div>
                ))}
              </div>
              <div style={{padding:"13px",borderRadius:11,background:"rgba(0,168,255,0.06)",textAlign:"center",color:"#475569",fontSize:13,fontWeight:700,border:"1px solid rgba(0,168,255,0.15)"}}>
                Plan actual
              </div>
            </div>
          </div>

          {/* VIP MEMBER — right, gold */}
          <div style={{background:"rgba(10,16,30,0.98)",padding:"28px 26px",position:"relative",overflow:"hidden",borderLeft:"2px solid #F59E0B"}}>
            <div style={{position:"absolute",top:0,right:0,width:200,height:200,background:"radial-gradient(circle,rgba(245,158,11,0.08),transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{fontSize:22,fontWeight:900,color:"#F59E0B",marginBottom:4,letterSpacing:-0.3}}>VIP Member</div>
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:2}}>
                <span style={{fontSize:28,fontWeight:900,color:"#F1F5F9"}}>$9.99</span>
                <span style={{fontSize:13,color:"#64748B"}}> / mes · cancela cuando quieras</span>
              </div>
              <div style={{marginTop:18,marginBottom:22}}>
                {PREMIUM_FEATURES.map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<PREMIUM_FEATURES.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                    <span style={{fontSize:12,color:"#F59E0B",flexShrink:0}}>★</span>
                    <span style={{fontSize:13,color:"#CBD5E1",lineHeight:1.4}}>{f.text.replace("★ ","")}</span>
                  </div>
                ))}
              </div>
              {!isPremium&&<>
                <button onClick={handleSubscribe}
                  style={{width:"100%",background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",borderRadius:11,padding:"13px",fontSize:14,fontWeight:800,color:"#000",cursor:"pointer",boxShadow:"0 4px 20px rgba(245,158,11,0.35)",letterSpacing:0.2,marginBottom:8}}>
                  ✦ Hazte VIP — $9.99/mes →
                </button>
                <div style={{textAlign:"center",fontSize:11,color:"#334155"}}>7 días gratis · Sin compromiso · Cancela cuando quieras</div>
              </>}
              {isPremium&&<div style={{background:"rgba(0,229,143,0.1)",border:"1px solid rgba(0,229,143,0.3)",borderRadius:10,padding:"11px",textAlign:"center",color:C.bull,fontWeight:800,fontSize:14}}>✅ Plan activo</div>}
            </div>
          </div>
        </div>

        {/* Success message */}
        {successMsg&&<div style={{background:C.bullBg,border:`1px solid ${C.bull}44`,borderRadius:14,padding:"16px 20px",marginBottom:20,display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:24}}>📧</span>
          <div>
            <div style={{fontWeight:700,color:C.bull,marginBottom:2}}>¡Suscripción activada!</div>
            <div style={{color:C.muted,fontSize:13}}>{successMsg}</div>
          </div>
        </div>}

        {/* Trust badges */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {[
            {icon:"🔒",title:"Pago seguro",desc:"SSL + Stripe"},
            {icon:"↩️",title:"Cancela ya",desc:"Sin permanencia"},
            {icon:"📧",title:"Alertas email",desc:"Instantáneas"},
            {icon:"🛟",title:"Soporte 24/7",desc:"Respuesta en 2h"},
          ].map(b=>(
            <div key={b.title} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 12px",textAlign:"center",boxShadow:C.shadow}}>
              <div style={{fontSize:22,marginBottom:6}}>{b.icon}</div>
              <div style={{fontWeight:700,color:C.text,fontSize:12}}>{b.title}</div>
              <div style={{color:C.muted2,fontSize:11}}>{b.desc}</div>
            </div>
          ))}
        </div>
      </>}

      {/* ── SEÑALES TAB ── */}
      {activeTab==="senales" && <>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div>
            <h2 style={{margin:"0 0 4px",color:C.text,fontSize:18,fontWeight:800}}>📡 Señales de Trading</h2>
            <p style={{margin:0,color:C.muted,fontSize:13}}>Generadas por nuestros traders Top 5 con IA</p>
          </div>
          {!isPremium&&<div style={{background:C.gold+"15",border:`1px solid ${C.gold}44`,borderRadius:12,padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🔒</span>
            <span style={{color:"#b45309",fontSize:13,fontWeight:600}}>Requiere Premium para ver detalles</span>
          </div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {SIGNALS.map((s,i)=>(
            <div key={i} style={{background:C.surface,border:`1px solid ${s.tipo==="COMPRA"?C.bull:C.bear}33`,borderRadius:16,padding:"18px 20px",boxShadow:C.shadow,borderLeft:`4px solid ${s.tipo==="COMPRA"?C.bull:C.bear}`,position:"relative",overflow:"hidden"}}>
              {s.blur&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(6px)",background:"rgba(255,255,255,0.6)",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:16}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:28,marginBottom:8}}>🔒</div>
                  <div style={{fontWeight:800,color:C.text,fontSize:14,marginBottom:4}}>Solo para miembros Premium</div>
                  <button onClick={()=>setActiveTab("planes")} style={{background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:10,padding:"8px 20px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Ver planes →</button>
                </div>
              </div>}
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <span style={{background:C.accentDim,color:C.accentText,borderRadius:8,padding:"3px 10px",fontSize:14,fontWeight:800,fontFamily:"monospace"}}>${s.ticker}</span>
                <span style={{background:s.tipo==="COMPRA"?C.bullBg:C.bearBg,color:s.tipo==="COMPRA"?C.bull:C.bear,border:`1px solid ${s.tipo==="COMPRA"?C.bull:C.bear}44`,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:800}}>
                  {s.tipo==="COMPRA"?"▲ COMPRA":"▼ VENTA"}
                </span>
                <div style={{display:"flex",gap:16,marginLeft:"auto",flexWrap:"wrap"}}>
                  {[["Entrada",s.entrada,C.text],["Target",s.target,C.bull],["Stop",s.stop,C.bear]].map(([l,v,c])=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div style={{fontFamily:"monospace",fontSize:14,fontWeight:800,color:c}}>{v}</div>
                      <div style={{fontSize:10,color:C.muted2}}>{l}</div>
                    </div>
                  ))}
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:14,fontWeight:800,color:s.conf>=85?C.bull:s.conf>=70?C.gold:C.bear}}>{s.conf}%</div>
                    <div style={{fontSize:10,color:C.muted2}}>Confianza</div>
                  </div>
                </div>
                <span style={{color:C.muted2,fontSize:11,width:"100%"}}>{s.tiempo}</span>
              </div>
              <div style={{marginTop:12}}>
                <div style={{background:C.border,borderRadius:20,height:6,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:20,width:`${s.conf}%`,background:s.conf>=85?`linear-gradient(90deg,${C.bull},#00e5b0)`:s.conf>=70?"#f59e0b":"#ef4444"}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!isPremium&&<div style={{marginTop:20,background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:16,padding:24,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:10}}>📡</div>
          <h3 style={{margin:"0 0 8px",color:"#fff",fontSize:16,fontWeight:800}}>Desbloquea todas las señales</h3>
          <p style={{margin:"0 0 16px",color:"#94a3b8",fontSize:13}}>Con Premium recibes señales en tiempo real con entrada exacta, target y stop loss.</p>
          <button onClick={()=>setActiveTab("planes")} style={{background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:12,padding:"11px 28px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>⭐ Ver Premium →</button>
        </div>}
      </>}

      {/* ── WEBINARS TAB ── */}
      {activeTab==="webinars" && <>
        <div style={{marginBottom:20}}>
          <h2 style={{margin:"0 0 4px",color:C.text,fontSize:18,fontWeight:800}}>🎓 Webinars Exclusivos</h2>
          <p style={{margin:0,color:C.muted,fontSize:13}}>Formación en vivo con los mejores traders de NexoTrade</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {WEBINARS.map((w,i)=>(
            <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px 22px",boxShadow:C.shadow,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${C.accentDim},${C.blueBg})`,border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{w.emoji}</div>
              <div style={{flex:1,minWidth:200}}>
                <h3 style={{margin:"0 0 6px",color:C.text,fontSize:15,fontWeight:800}}>{w.titulo}</h3>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  <span style={{color:C.muted,fontSize:12,display:"flex",alignItems:"center",gap:4}}>📅 {w.fecha}</span>
                  <span style={{color:C.muted,fontSize:12,display:"flex",alignItems:"center",gap:4}}>🕐 {w.hora}</span>
                  <span style={{color:C.muted,fontSize:12,display:"flex",alignItems:"center",gap:4}}>👤 {w.instructor}</span>
                  <span style={{color:C.bull,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>👥 {w.spots} plazas</span>
                </div>
              </div>
              {isPremium
                ? <button style={{background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:10,padding:"9px 20px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>Apuntarme →</button>
                : <div style={{textAlign:"center",flexShrink:0}}>
                    <div style={{color:C.muted2,fontSize:11,marginBottom:6}}>🔒 Solo Premium</div>
                    <button onClick={()=>setActiveTab("planes")} style={{background:C.goldBg,border:`1px solid ${C.gold}44`,borderRadius:10,padding:"7px 14px",color:"#b45309",fontSize:12,fontWeight:700,cursor:"pointer"}}>Desbloquear</button>
                  </div>
              }
            </div>
          ))}
        </div>
        {!isPremium&&<div style={{marginTop:20,background:C.goldBg,border:`1px solid ${C.gold}44`,borderRadius:16,padding:20,display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:32}}>🎓</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,color:"#92400e",fontSize:15,marginBottom:4}}>Accede a todos los webinars</div>
            <div style={{color:"#b45309",fontSize:13}}>Formación mensual con traders expertos. Grabaciones disponibles después del evento.</div>
          </div>
          <button onClick={()=>setActiveTab("planes")} style={{background:"#b45309",border:"none",borderRadius:10,padding:"9px 20px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>⭐ Ver Premium</button>
        </div>}
      </>}

      {/* ── ALERTAS EMAIL TAB ── */}
      {activeTab==="alertas" && <>
        <div style={{marginBottom:20}}>
          <h2 style={{margin:"0 0 4px",color:C.text,fontSize:18,fontWeight:800}}>📧 Alertas por Email</h2>
          <p style={{margin:0,color:C.muted,fontSize:13}}>Nunca te pierdas un movimiento importante del mercado</p>
        </div>

        {/* How it works */}
        <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:18,padding:24,marginBottom:20}}>
          <h3 style={{margin:"0 0 16px",color:"#fff",fontSize:15,fontWeight:800}}>¿Cómo funcionan las alertas?</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[
              {step:"1",icon:"⚙️",titulo:"Configuras",desc:"Elige el ticker, tipo de alerta y el valor que quieres monitorizar"},
              {step:"2",icon:"👀",titulo:"Monitorizamos",desc:"Nuestro sistema vigila el mercado 24/7 en tiempo real"},
              {step:"3",icon:"📧",titulo:"Te avisamos",desc:"Recibes un email instantáneo cuando se cumple tu condición"},
            ].map(s=>(
              <div key={s.step} style={{textAlign:"center"}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#00a87f)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,margin:"0 auto 8px"}}>{s.icon}</div>
                <div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>{s.titulo}</div>
                <div style={{color:"#64748b",fontSize:11,lineHeight:1.5}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert types */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {ALERT_TYPES.map((a,i)=>(
            <div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",boxShadow:C.shadow,display:"flex",gap:12,alignItems:"flex-start",opacity:isPremium||i<1?1:i<2?1:0.7}}>
              <span style={{fontSize:22,flexShrink:0}}>{a.icon}</span>
              <div>
                <div style={{fontWeight:700,color:C.text,fontSize:13,marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
                  {a.titulo}
                  {!isPremium&&i>2&&<span style={{background:C.goldBg,color:"#b45309",border:`1px solid ${C.gold}44`,borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:800}}>PREMIUM</span>}
                </div>
                <div style={{color:C.muted,fontSize:12,lineHeight:1.5}}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan comparison for alerts */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",background:C.card2,borderBottom:`1px solid ${C.border}`}}>
            <div style={{padding:"12px 18px",color:C.muted,fontSize:12,fontWeight:700}}></div>
            <div style={{padding:"12px 8px",textAlign:"center",color:C.muted,fontSize:12,fontWeight:700}}>GRATIS</div>
            <div style={{padding:"12px 8px",textAlign:"center",color:C.accent,fontSize:12,fontWeight:800}}>⭐ PREMIUM</div>
          </div>
          {[
            ["Alertas de precio","3 alertas","Ilimitadas"],
            ["Alertas de earnings","❌","✅"],
            ["Alertas de trending","❌","✅"],
            ["Alertas de volumen","❌","✅"],
            ["Breaking news","❌","✅"],
            ["Frecuencia","15 min delay","Tiempo real"],
            ["Email instantáneo","✅","✅"],
          ].map(([feat,free,prem],i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",borderBottom:i<6?`1px solid ${C.border}`:"none",transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.card2}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{padding:"11px 18px",color:C.text,fontSize:13,fontWeight:500}}>{feat}</div>
              <div style={{padding:"11px 8px",textAlign:"center",color:C.muted,fontSize:13}}>{free}</div>
              <div style={{padding:"11px 8px",textAlign:"center",color:C.bull,fontSize:13,fontWeight:600}}>{prem}</div>
            </div>
          ))}
        </div>

        {!isPremium&&<div style={{marginTop:20,textAlign:"center"}}>
          <button onClick={()=>setActiveTab("planes")} style={{background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:14,padding:"13px 36px",color:"#fff",fontSize:15,fontWeight:800,cursor:"pointer",boxShadow:`0 4px 20px ${C.accent}44`}}>
            📧 Activar alertas ilimitadas por €{price}/mes →
          </button>
          <p style={{margin:"10px 0 0",color:C.muted2,fontSize:12}}>Cancela cuando quieras · Sin permanencia</p>
        </div>}
      </>}
    </div>
  );
}

// ── TOP 5 FORISTAS ────────────────────────────────────────────────────────────
function Top5Foristas({user,following,onFollow,onProfile,lang}){
  const t=LANGS[lang];
  const ranked=[...MOCK_USERS].sort((a,b)=>b.points-a.points).slice(0,5);
  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",marginBottom:16,boxShadow:C.shadow}}>
      <div style={{padding:"14px 18px",background:`linear-gradient(135deg,${C.accentDim},${C.blueBg})`,borderBottom:`1px solid ${C.border}`}}>
        <h3 style={{margin:0,color:C.text,fontSize:14,fontWeight:800}}>{t.top5}</h3>
        <p style={{margin:"2px 0 0",color:C.muted2,fontSize:11}}>{t.reputation}</p>
      </div>
      {ranked.map((u,i)=>{
        const lvl=getLevel(u.points);
        return(
          <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"background 0.1s"}}
            onMouseEnter={e=>e.currentTarget.style.background=C.card2}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            onClick={()=>onProfile(u)}>
            <span style={{width:22,textAlign:"center",fontSize:i<3?17:13,color:i<3?C.gold:C.muted2,fontWeight:800}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</span>
            <AvatarBubble emoji={u.emoji} color={u.color} size={34} level={u.points}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:C.text,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
              <div style={{color:lvl.color,fontSize:10,fontWeight:700}}>{lvl.emoji} {lang==="en"?lvl.nameEn:lvl.name}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:C.accentText,fontWeight:800,fontSize:12}}>{fmtNum(u.points)}</div>
              <div style={{color:C.muted2,fontSize:10}}>pts</div>
            </div>
            {user&&user.id!==u.id&&(
              <button onClick={e=>{e.stopPropagation();onFollow(u.id);}} style={{background:following.includes(u.id)?C.card2:C.accentDim,border:`1px solid ${following.includes(u.id)?C.border:C.accent+"55"}`,borderRadius:8,padding:"3px 8px",cursor:"pointer",color:following.includes(u.id)?C.muted2:C.accentText,fontSize:10,fontWeight:700,flexShrink:0}}>
                {following.includes(u.id)?t.following_btn.replace("✓ ","✓"):t.follow}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
// ── LEFT SIDEBAR — Perfil + Stats estilo Socimo ───────────────────────────────
function LeftSidebar({user, onProfile, onNeedAuth, lang, onNavigate, onLogout}){
  const t=LANGS[lang];
  const sCard={background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.09)",borderRadius:14,overflow:"hidden",marginBottom:12,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"};
  const lvl = user ? getLevel(user.points) : null;
  return(
    <div style={{position:"sticky",top:96}}>
      {/* Profile Card */}
      <div style={sCard}>
        {/* Cover */}
        <div style={{height:70,background:"linear-gradient(135deg,#00A8FF,#0090D4,#7C3AED)",position:"relative"}}>
          <div style={{position:"absolute",bottom:-22,left:16}}>
            {user
              ? <AvatarBubble emoji={user.emoji} color={user.avatarColor||"#00A8FF"} size={48} online level={user.points}/>
              : <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.3)",border:"3px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>👤</div>
            }
          </div>
        </div>
        <div style={{padding:"28px 16px 16px"}}>
          {user ? <>
            <div style={{fontWeight:800,color:"#0F172A",fontSize:15,lineHeight:1.2}}>{user.name}</div>
            {lvl && <div style={{fontSize:11,color:"#00A8FF",fontWeight:700,marginTop:2}}>{lvl.label}</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginTop:12,textAlign:"center"}}>
              {[{v:user.followers||0,l:t.followers},{v:user.following||0,l:t.following},{v:user.points||0,l:t.points}].map(({v,l})=>(
                <div key={l} style={{background:"#F8FAFC",borderRadius:8,padding:"6px 4px"}}>
                  <div style={{fontWeight:800,fontSize:14,color:"#0F172A"}}>{v}</div>
                  <div style={{fontSize:9,color:"#94A3B8",fontWeight:600,letterSpacing:0.3}}>{l}</div>
                </div>
              ))}
            </div>
          </> : <>
            <div style={{fontWeight:800,color:"#0F172A",fontSize:14,marginBottom:4}}>¡Únete a NexoTrade!</div>
            <div style={{fontSize:12,color:"#64748B",marginBottom:12,lineHeight:1.5}}>La comunidad inversora en español</div>
            <button onClick={onNeedAuth} style={{width:"100%",background:"#00A8FF",color:"#fff",border:"none",borderRadius:8,padding:"9px",fontWeight:700,fontSize:13,cursor:"pointer"}}>Crear cuenta gratis →</button>
          </>}
        </div>
      </div>

      {/* Quick Nav Links */}
      <div style={sCard}>
        <div style={{padding:"12px 16px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94A3B8",letterSpacing:0.8,marginBottom:8}}>NAVEGACIÓN</div>
          {[
            {icon:"🔥",label:"Feed",               idx:0},
            {icon:"📊",label:"Tops Traders",        idx:1},
            {icon:"📈",label:"Acciones VIP",        idx:3},
            {icon:"📅",label:"Earnings",            idx:6},
            {icon:"📰",label:"Noticias",            idx:5},
            {icon:"🔥",label:"Trending",            idx:7},
            {icon:"🛠️",label:"Herramientas VIP",   idx:9},
            {icon:"✦", label:"Premium VIP",         idx:8, color:"#7C3AED"},
          ].map(({icon,label,color,idx})=>(
            <div key={label} onClick={()=>onNavigate&&onNavigate(idx)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"7px 8px",borderRadius:8,cursor:"pointer",marginBottom:2,transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontSize:15}}>{icon}</span>
              <span style={{fontSize:13,fontWeight:600,color:color||"#0F172A"}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout button — siempre visible */}
      {user && onLogout && (
        <div style={sCard}>
          <button onClick={onLogout} style={{width:"100%",background:"rgba(255,77,106,0.08)",border:"1px solid rgba(255,77,106,0.2)",borderRadius:10,padding:"10px",color:"#FF4D6A",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            🚪 Cerrar sesión
          </button>
        </div>
      )}
      {/* NexoTrade info */}
      <div style={{padding:"0 4px"}}>
        <div style={{fontSize:11,color:"#94A3B8",lineHeight:1.8}}>
          © 2026 NexoTrade · <span style={{color:"#00A8FF",cursor:"pointer"}}>Términos</span> · <span style={{color:"#00A8FF",cursor:"pointer"}}>Privacidad</span>
        </div>
      </div>
    </div>
  );
}

function Sidebar({user,following,onFollow,onProfile,onNeedAuth,onAI,lang,posts=[]}){
  const t=LANGS[lang];
  const lp=useContext(PriceCtx);
  const SIDEBAR_STATIC=[
    {ticker:"BTC",price:"$68,420",change:+4.2},{ticker:"NVDA",price:"$875.40",change:+2.8},
    {ticker:"TSLA",price:"$172.80",change:-3.1},{ticker:"ETH",price:"$3,820",change:+5.7},
    {ticker:"AAPL",price:"$189.50",change:+0.4},{ticker:"SPY",price:"$521.30",change:-0.8},
  ];
  const mini=SIDEBAR_STATIC.map(s=>{
    const live=lp[s.ticker];
    return {
      ticker:s.ticker,
      price: live ? fmtLivePrice(s.ticker, live.price) : s.price,
      change: live ? live.change : s.change,
    };
  });
  const sideCard={background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.09)",borderRadius:14,padding:"16px",marginBottom:12,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"};
  return(
    <div>

      {/* 🧠 AI MARKET PULSE */}
      <div style={{...sideCard,background:"linear-gradient(145deg,rgba(37,99,235,0.06),rgba(124,58,237,0.06))",border:"1px solid rgba(37,99,235,0.2)",boxShadow:"0 2px 16px rgba(37,99,235,0.08)",cursor:"pointer"}}
        onClick={onAI}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 50px rgba(59,130,246,0.12)";e.currentTarget.style.borderColor="rgba(59,130,246,0.25)";}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 0 40px rgba(59,130,246,0.06)";e.currentTarget.style.borderColor="rgba(59,130,246,0.15)";}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:38,height:38,borderRadius:11,background:"linear-gradient(135deg,#3B82F6,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 0 20px rgba(59,130,246,0.4)"}}>🧠</div>
          <div>
            <div style={{fontWeight:800,color:"#0F172A",fontSize:13,letterSpacing:-0.2}}>AI Market Pulse</div>
            <div style={{fontSize:10,color:C.bull,display:"flex",alignItems:"center",gap:4,marginTop:1}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:C.bull,display:"inline-block",boxShadow:`0 0 6px ${C.bull}`}}/>EN VIVO
            </div>
          </div>
        </div>
        {/* Sentimiento */}
        <div style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:11,color:"#64748B",fontWeight:600}}>Sentimiento IA</span>
            <span style={{fontSize:11,color:C.bull,fontWeight:800}}>BULLISH 71%</span>
          </div>
          <div style={{height:5,background:"rgba(15,23,42,0.08)",borderRadius:5,overflow:"hidden"}}>
            <div style={{width:"71%",height:"100%",background:`linear-gradient(90deg,${C.bull},#3B82F6)`,borderRadius:5}}/>
          </div>
        </div>
        {/* Stocks calientes */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:"#475569",fontWeight:600,marginBottom:6,letterSpacing:0.5}}>STOCKS CALIENTES</div>
          {[{t:"NVDA",d:"↑",c:C.bull},{t:"BTC",d:"↑",c:C.bull},{t:"TSLA",d:"↓",c:C.bear}].map(({t,d,c})=>(
            <div key={t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0"}}>
              <span style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:"#94A3B8"}}>${t}</span>
              <span style={{fontSize:12,color:c,fontWeight:800}}>{d}</span>
            </div>
          ))}
        </div>
        {/* Riesgo */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.15)",borderRadius:8,padding:"7px 10px"}}>
          <span style={{fontSize:11,color:"#64748B",fontWeight:600}}>Riesgo del mercado</span>
          <span style={{fontSize:11,color:C.gold,fontWeight:800}}>MEDIO ⚡</span>
        </div>
        <div style={{marginTop:10,background:"linear-gradient(135deg,#3B82F6,#7C3AED)",borderRadius:9,padding:"8px",textAlign:"center",color:"#fff",fontSize:12,fontWeight:800,boxShadow:"0 4px 16px rgba(59,130,246,0.3)"}}>💬 Preguntar a la IA</div>
      </div>

      {/* 📊 COMMUNITY vs IA */}
      <div style={sideCard}>
        <div style={{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:10,letterSpacing:-0.2}}>📊 Comunidad vs IA</div>
        {[{label:"Comunidad",pct:78,col:C.bull},{label:"IA",pct:61,col:C.blue}].map(({label,pct,col})=>(
          <div key={label} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,color:"#64748B",fontWeight:600}}>{label}</span>
              <span style={{fontSize:11,color:col,fontWeight:800}}>BULLISH {pct}%</span>
            </div>
            <div style={{height:4,background:"rgba(15,23,42,0.08)",borderRadius:4,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:4,opacity:0.85}}/>
            </div>
          </div>
        ))}
        <div style={{fontSize:10,color:"#94A3B8",marginTop:4}}>Basado en 2,847 posts de hoy</div>
      </div>

      {/* 😨 FEAR & GREED */}
      <div style={sideCard}>
        <div style={{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:10}}>😨 Fear & Greed Index</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{position:"relative",width:56,height:56,flexShrink:0}}>
            <svg viewBox="0 0 56 56" style={{width:56,height:56,transform:"rotate(-90deg)"}}>
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(15,23,42,0.09)" strokeWidth="6"/>
              <circle cx="28" cy="28" r="22" fill="none" stroke="#00E58F" strokeWidth="6" strokeDasharray={`${0.72*138} 138`} strokeLinecap="round"/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff"}}>72</div>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:900,color:C.bull}}>Greed 🟢</div>
            <div style={{fontSize:11,color:"#475569",marginTop:2,lineHeight:1.4}}>Mercado en modo alcista. Los inversores están confiados.</div>
          </div>
        </div>
      </div>

      {/* CTA VIP si no logueado */}
      {!user&&<div style={{...sideCard,background:"linear-gradient(145deg,rgba(124,58,237,0.1),rgba(8,13,26,0.9))",border:"1px solid rgba(124,58,237,0.2)",textAlign:"center"}}>
        <div style={{fontSize:22,marginBottom:8}}>✦</div>
        <h3 style={{margin:"0 0 4px",color:"#fff",fontSize:14,fontWeight:800}}>VIP Member</h3>
        <p style={{margin:"0 0 4px",color:"#64748B",fontSize:12,lineHeight:1.5}}>Señales exclusivas, IA ilimitada y acceso a todos los datos</p>
        <div style={{fontSize:20,fontWeight:900,color:"#fff",margin:"8px 0 4px"}}><span style={{color:C.vip}}>$9.99</span><span style={{fontSize:12,color:"#475569",fontWeight:500}}>/mes</span></div>
        <Btn onClick={()=>window.open(STRIPE_PAYMENT_LINK,"_blank")} style={{width:"100%",padding:"9px",background:"linear-gradient(135deg,#7C3AED,#9333EA)",boxShadow:"0 0 20px rgba(124,58,237,0.3)"}}>✦ Empezar VIP →</Btn>
        <div style={{fontSize:11,color:"#334155",marginTop:6}}>7 días gratis · Sin compromiso</div>
      </div>}

      {/* 📡 MARKETS */}
      <div style={sideCard}>
        <h3 style={{margin:"0 0 10px",color:"#0F172A",fontSize:12,fontWeight:800,letterSpacing:0.3}}>{t.markets}</h3>
        {mini.map((m,i)=>(
          <div key={m.ticker} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<mini.length-1?"1px solid rgba(15,23,42,0.07)":"none"}}>
            <span style={{fontWeight:700,color:"#0F172A",fontFamily:"monospace",fontSize:12,letterSpacing:0.5}}>{m.ticker}</span>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"monospace",fontSize:10,color:"#475569"}}>{m.price}</div>
              <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:chgCol(m.change)}}>{fmtChg(m.change)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 🏆 TOP TRADERS — dinámico con posts reales */}
      {(()=>{
        // Contar posts por usuario y construir ranking
        const countMap={};
        posts.forEach(p=>{
          if(!p.user) return;
          if(!countMap[p.user]) countMap[p.user]={count:0,avatar:p.avatar||"🦅",color:p.avatarColor||C.accent};
          countMap[p.user].count++;
        });
        const medals=["🥇","🥈","🥉"];
        const topList=Object.entries(countMap).sort((a,b)=>b[1].count-a[1].count).slice(0,3);
        if(topList.length===0)return null;
        return(
          <div style={sideCard}>
            <h3 style={{margin:"0 0 10px",color:"#0F172A",fontSize:12,fontWeight:800}}>🏆 Top Traders Activos</h3>
            {topList.map(([name,info],i)=>(
              <div key={name} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<topList.length-1?"1px solid rgba(15,23,42,0.07)":"none"}}>
                <span style={{fontSize:16,minWidth:20}}>{medals[i]}</span>
                <AvatarBubble emoji={info.avatar||"🦅"} color={info.color||C.accent} size={28}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"#0F172A",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
                  <div style={{fontSize:10,color:"#64748B"}}>{info.count} post{info.count!==1?"s":""} hoy</div>
                </div>
                <span style={{color:C.accent,fontSize:11,fontWeight:800}}>#{i+1}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* WHO TO FOLLOW */}
      {(()=>{
        const sug=MOCK_USERS.filter(u=>u.id!==user?.id&&!following.includes(u.id)).slice(0,3);
        if(!sug.length)return null;
        return(
          <div style={sideCard}>
            <h3 style={{margin:"0 0 10px",color:"#0F172A",fontSize:12,fontWeight:800}}>{t.whofollow}</h3>
            {sug.map((u,i)=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<sug.length-1?"1px solid rgba(15,23,42,0.07)":"none"}}>
                <div style={{cursor:"pointer"}} onClick={()=>onProfile(u)}><AvatarBubble emoji={u.emoji} color={u.color} size={30}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"#0F172A",fontSize:12,cursor:"pointer"}} onClick={()=>onProfile(u)}>{u.name}</div>
                  <div style={{color:"#64748B",fontSize:10}}>{fmtNum(u.followers)} {t.followers}</div>
                </div>
                <Btn variant="follow" small onClick={()=>user?onFollow(u.id):onNeedAuth()}>{t.follow}</Btn>
              </div>
            ))}
          </div>
        );
      })()}
      <div style={{background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.12)",borderRadius:10,padding:"10px 14px",color:"#78716C",fontSize:10,lineHeight:1.7}}><strong style={{color:C.gold}}>⚠️</strong> {t.disclaimer}</div>
    </div>
  );
}

// ── USER MENU ─────────────────────────────────────────────────────────────────
function UserMenu({user,onLogout,onProfile,onAlerts,lang}){
  const t=LANGS[lang];
  const [open,setOpen]=useState(false);
  const lvl=getLevel(user.points);
  return(
    <div style={{position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"5px 10px",borderRadius:12,border:`1px solid ${C.border}`,background:C.card2}} onClick={()=>setOpen(!open)}>
        <AvatarBubble emoji={user.emoji} color={user.avatarColor||C.accent} size={28} online/>
        <div>
          <div style={{color:C.text,fontSize:13,fontWeight:700,lineHeight:1}}>{user.name}</div>
          <div style={{color:lvl.color,fontSize:9,fontWeight:700}}>{lvl.emoji} {lang==="en"?lvl.nameEn:lvl.name}</div>
        </div>
        <span style={{color:C.muted2,fontSize:9}}>▾</span>
      </div>
      {open&&(
        <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:8,minWidth:195,zIndex:150,boxShadow:C.shadowMd}}>
          <div style={{padding:"10px 12px",marginBottom:6,background:C.card2,borderRadius:10}}>
            <div style={{color:C.muted2,fontSize:11,marginBottom:4}}>{lang==="en"?"Your points":"Tus puntos"}</div>
            <LevelBadge points={user.points} lang={lang}/>
          </div>
          {[{label:`👤 ${t.profile}`,fn:()=>{onProfile(user);setOpen(false);}},{label:`🔔 ${t.alerts}`,fn:()=>{onAlerts();setOpen(false);}},{label:`⚙️ ${t.settings}`,fn:()=>setOpen(false)},{label:`🚪 ${t.logout}`,fn:()=>{onLogout();setOpen(false);},red:true}].map(item=>(
            <button key={item.label} onClick={item.fn} style={{display:"block",width:"100%",textAlign:"left",background:"none",border:"none",cursor:"pointer",color:item.red?C.bear:C.text,fontSize:13,fontWeight:600,padding:"9px 12px",borderRadius:9,fontFamily:"inherit",transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.card2}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer(){
  const social=[
    {name:"Instagram",icon:"📸",url:"https://www.instagram.com/nexotradeia",color:"#e1306c"},
    {name:"Threads",  icon:"🧵",url:"https://www.threads.com/@nexotradeia", color:"#000000"},
    {name:"X / Twitter",icon:"𝕏",url:"https://x.com/Nexotradeia",          color:"#1da1f2"},
    {name:"TikTok",  icon:"🎵",url:"https://www.tiktok.com/@nexotradeia",  color:"#ff0050"},
  ];
  const links=[
    {titulo:"Plataforma",items:["Feed","Tops de Mercado","Noticias","Earnings","Trending","IA Asistente"]},
    {titulo:"Comunidad",items:["Top Foristas","A quién seguir","Leaderboard","Insignias","Alertas"]},
    {titulo:"Empresa",items:["Sobre nosotros","Blog","Careers","Prensa","Contacto"]},
    {titulo:"Legal",items:["Términos de uso","Privacidad","Aviso legal","Cookies","No somos asesores"]},
  ];
  return(
    <footer style={{background:"#0f172a",color:"#e2e8f0",marginTop:40}}>
      <div style={{maxWidth:1140,margin:"0 auto",padding:"40px 20px",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:32,flexWrap:"wrap"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${C.accent},#00a87f)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff"}}>N</div>
            <div>
              <div style={{fontSize:18,fontWeight:900,color:"#fff",letterSpacing:-0.5}}>NexoTrade</div>
              <div style={{fontSize:9,color:"#64748b",letterSpacing:2}}>COMUNIDAD INVERSORA</div>
            </div>
          </div>
          <p style={{color:"#64748b",fontSize:13,lineHeight:1.7,marginBottom:20}}>La comunidad de inversores hispanohablantes más activa. Comparte ideas, gana reputación y aprende con la IA.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {social.map(s=>(
              <a key={s.name} href={s.url} style={{display:"flex",alignItems:"center",gap:6,background:"#1e293b",border:"1px solid #334155",borderRadius:8,padding:"7px 12px",color:"#e2e8f0",fontSize:12,fontWeight:600,textDecoration:"none",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background=s.color+"22";e.currentTarget.style.borderColor=s.color+"66";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#1e293b";e.currentTarget.style.borderColor="#334155";}}>
                <span style={{fontSize:14}}>{s.icon}</span><span>{s.name}</span>
              </a>
            ))}
          </div>
        </div>
        {links.map(col=>(
          <div key={col.titulo}>
            <h4 style={{color:"#fff",fontSize:13,fontWeight:700,margin:"0 0 14px",letterSpacing:0.5}}>{col.titulo}</h4>
            {col.items.map(item=>(
              <a key={item} href="#" style={{display:"block",color:"#64748b",fontSize:13,textDecoration:"none",marginBottom:8,transition:"color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.color=C.accent}
                onMouseLeave={e=>e.currentTarget.style.color="#64748b"}>{item}</a>
            ))}
          </div>
        ))}
      </div>
      <div style={{borderTop:"1px solid #1e293b",padding:"16px 20px"}}>
        <div style={{maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <span style={{color:"#475569",fontSize:12}}>© 2026 NEXO TRADE · Todos los derechos reservados</span>
          <span style={{color:"#475569",fontSize:12}}>⚠️ No somos asesores financieros. Invierte con responsabilidad.</span>
        </div>
      </div>
    </footer>
  );
}

// ── PREDICCIÓN DEL DÍA ────────────────────────────────────────────────────────
function PredictionBanner(){
  const [votes,setVotes]=useState({up:2847,down:912});
  const [voted,setVoted]=useState(null);
  const total=votes.up+votes.down;
  const pct=Math.round(votes.up/total*100);
  const vote=(dir)=>{
    if(voted)return;
    setVotes(v=>({...v,[dir]:v[dir]+1}));
    setVoted(dir);
  };
  return(
    <div style={{background:`linear-gradient(135deg,rgba(0,210,106,0.05),rgba(60,142,250,0.05))`,borderBottom:`1px solid ${C.glassBorder}`,padding:"12px 20px"}}>
      <div style={{maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <span style={{background:C.gold+"22",color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:800,letterSpacing:0.5,flexShrink:0}}>🔥 PREDICCIÓN DEL DÍA</span>
        <span style={{color:"#fff",fontWeight:700,fontSize:14,flex:1}}>¿NVDA sube o baja mañana?</span>
        <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
          <button onClick={()=>vote("up")} style={{background:voted==="up"?`${C.bull}22`:"rgba(255,255,255,0.05)",border:`1px solid ${voted==="up"?C.bull:C.glassBorder}`,borderRadius:10,padding:"6px 16px",color:voted==="up"?C.bull:C.muted,cursor:voted?"default":"pointer",fontSize:12,fontWeight:700}}>▲ Sube {voted&&`(${Math.round(votes.up/total*100)}%)`}</button>
          <button onClick={()=>vote("down")} style={{background:voted==="down"?`${C.bear}22`:"rgba(255,255,255,0.05)",border:`1px solid ${voted==="down"?C.bear:C.glassBorder}`,borderRadius:10,padding:"6px 16px",color:voted==="down"?C.bear:C.muted,cursor:voted?"default":"pointer",fontSize:12,fontWeight:700}}>▼ Baja {voted&&`(${100-Math.round(votes.up/total*100)}%)`}</button>
          <span style={{color:C.muted2,fontSize:11,flexShrink:0}}>{(total).toLocaleString()} votos</span>
        </div>
        {voted&&<div style={{width:"100%",height:3,background:C.card2,borderRadius:3,marginTop:4}}>
          <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${C.bull},${C.blue})`,borderRadius:3,transition:"width 0.5s"}}/>
        </div>}
      </div>
    </div>
  );
}

// ── VIP TOOLS PAGE ────────────────────────────────────────────────────────────
function VipToolsPage({ isPremium, onNeedPremium, posts=[], user }){
  const [tool, setTool] = useState("riesgo");

  // ── GATE VIP ──
  if(!isPremium) return(
    <div style={{textAlign:"center",padding:"60px 20px",background:"rgba(10,16,30,0.98)",borderRadius:20,border:"1px solid rgba(245,158,11,0.2)"}}>
      <div style={{fontSize:52,marginBottom:16}}>🔒</div>
      <h2 style={{color:"#F59E0B",fontWeight:900,marginBottom:8}}>Herramientas VIP Exclusivas</h2>
      <p style={{color:"#94A3B8",fontSize:15,marginBottom:24,maxWidth:400,margin:"0 auto 24px"}}>Calculadora Sharpe Ratio, racha de ganancias, alertas de precio y más — solo para miembros VIP.</p>
      <button onClick={onNeedPremium} style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",borderRadius:12,padding:"14px 32px",fontSize:15,fontWeight:800,color:"#000",cursor:"pointer"}}>✦ Hazte VIP — $9.99/mes</button>
    </div>
  );

  const TOOLS = [
    {k:"paper",    label:"🎮 Paper Trading"},
    {k:"riesgo",   label:"⚖️ Riesgo/Recompensa"},
    {k:"sharpe",   label:"📐 Sharpe Ratio"},
    {k:"racha",    label:"🔥 Racha & Stats"},
    {k:"portafolio",label:"📈 Evolución Portafolio"},
    {k:"alertas",  label:"🔔 Alertas de Precio"},
    {k:"exportar", label:"📤 Exportar Datos"},
  ];

  return(
    <div>
      <div style={{marginBottom:20}}>
        <h2 style={{color:"#F59E0B",fontWeight:900,fontSize:22,marginBottom:4}}>🛠️ Herramientas VIP</h2>
        <p style={{color:"#64748B",fontSize:13}}>Calculadoras y utilidades exclusivas para traders profesionales</p>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:24}}>
        {TOOLS.map(tb=>(
          <button key={tb.k} onClick={()=>setTool(tb.k)}
            style={{background:tool===tb.k?"linear-gradient(135deg,#F59E0B,#D97706)":"rgba(255,255,255,0.03)",border:`1.5px solid ${tool===tb.k?"#F59E0B":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"8px 14px",cursor:"pointer",color:tool===tb.k?"#000":"#94A3B8",fontSize:12,fontWeight:700,transition:"all 0.15s"}}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── 0. PAPER TRADING ── */}
      {tool==="paper" && <PaperTrading user={user}/>}

      {/* ── 1. CALCULADORA RIESGO/RECOMPENSA ── */}
      {tool==="riesgo" && <RiskRewardCalc/>}

      {/* ── 2. SHARPE RATIO ── */}
      {tool==="sharpe" && <SharpeCalc/>}

      {/* ── 3. RACHA & ESTADÍSTICAS ── */}
      {tool==="racha" && <WinStreakTracker/>}

      {/* ── 4. EVOLUCIÓN PORTAFOLIO ── */}
      {tool==="portafolio" && <PortfolioEvolution/>}

      {/* ── 5. ALERTAS DE PRECIO ── */}
      {tool==="alertas" && <PriceAlerts/>}

      {/* ── 6. EXPORTAR DATOS ── */}
      {tool==="exportar" && <ExportData posts={posts} user={user}/>}
    </div>
  );
}

// ── PAPER TRADING ────────────────────────────────────────────────────────────
const PAPER_INITIAL = 100000;
function PaperTrading({ user }){
  const KEY = `nexotrade_paper_${user?.id||"guest"}`;
  const load = ()=>{
    try{ const s=localStorage.getItem(KEY); return s?JSON.parse(s):{cash:PAPER_INITIAL,positions:{},trades:[]}; }
    catch{ return {cash:PAPER_INITIAL,positions:{},trades:[]}; }
  };
  const [pf, setPf] = useState(load);
  const [tab, setTab]     = useState("cartera");   // cartera | operar | historial
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [liveQ, setLiveQ]   = useState(null);      // {price, change, name}
  const [fetching, setFetching] = useState(false);
  const [prices, setPrices]   = useState({});       // {TICKER: {price, pct}}
  const [sellTicker, setSellTicker] = useState(null);
  const [sellShares, setSellShares] = useState("");
  const [msg, setMsg] = useState(null);

  // Persistir
  useEffect(()=>{ try{localStorage.setItem(KEY,JSON.stringify(pf));}catch{} },[pf]);

  // Refrescar precios de posiciones abiertas
  const refreshPrices = useCallback(async()=>{
    const tks=Object.keys(pf.positions);
    if(!tks.length) return;
    const next={};
    for(const tk of tks){
      try{
        const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${tk}&token=${FINNHUB_KEY}`);
        const d=await r.json();
        if(d.c>0) next[tk]={price:d.c, pct:d.dp||0};
      }catch{}
    }
    setPrices(next);
  },[pf.positions]);

  useEffect(()=>{ refreshPrices(); },[]);

  // Buscar cotización al escribir ticker
  const fetchQuote = async(tk)=>{
    if(!tk||tk.length<1){setLiveQ(null);return;}
    setFetching(true);
    try{
      const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${tk.toUpperCase()}&token=${FINNHUB_KEY}`);
      const d=await r.json();
      if(d.c>0) setLiveQ({price:d.c, change:d.dp||0});
      else setLiveQ(null);
    }catch{ setLiveQ(null); }
    setFetching(false);
  };

  const showMsg=(text,ok=true)=>{setMsg({text,ok});setTimeout(()=>setMsg(null),3000);};

  const buy=()=>{
    const sh=parseFloat(shares), tk=ticker.trim().toUpperCase();
    if(!sh||sh<=0||!liveQ||!tk) return;
    const cost=liveQ.price*sh;
    if(cost>pf.cash){showMsg("❌ Efectivo insuficiente",false);return;}
    setPf(prev=>{
      const ex=prev.positions[tk];
      const newSh=(ex?.shares||0)+sh;
      const newAvg=ex?((ex.avgCost*ex.shares)+(liveQ.price*sh))/newSh:liveQ.price;
      return{
        cash:prev.cash-cost,
        positions:{...prev.positions,[tk]:{shares:newSh,avgCost:newAvg}},
        trades:[{date:new Date().toISOString(),ticker:tk,action:"buy",shares:sh,price:liveQ.price},...prev.trades].slice(0,100)
      };
    });
    setPrices(p=>({...p,[tk]:{price:liveQ.price,pct:liveQ.change}}));
    showMsg(`✅ Compraste ${sh} acciones de $${tk}`);
    setShares(""); setTicker(""); setLiveQ(null); setTab("cartera");
  };

  const sell=(tk,sh)=>{
    sh=parseFloat(sh);
    const pos=pf.positions[tk];
    if(!pos||!sh||sh<=0||sh>pos.shares){showMsg("❌ Cantidad inválida",false);return;}
    const sellPrice=prices[tk]?.price||pos.avgCost;
    const rev=sellPrice*sh;
    setPf(prev=>{
      const newSh=prev.positions[tk].shares-sh;
      const newPos={...prev.positions};
      if(newSh<=0) delete newPos[tk];
      else newPos[tk]={...prev.positions[tk],shares:newSh};
      return{
        cash:prev.cash+rev,
        positions:newPos,
        trades:[{date:new Date().toISOString(),ticker:tk,action:"sell",shares:sh,price:sellPrice},...prev.trades].slice(0,100)
      };
    });
    showMsg(`✅ Vendiste ${sh} acciones de $${tk} a $${sellPrice.toFixed(2)}`);
    setSellTicker(null); setSellShares("");
  };

  const resetPortfolio=()=>{
    if(!window.confirm("¿Reiniciar cartera? Perderás todas las posiciones.")) return;
    setPf({cash:PAPER_INITIAL,positions:{},trades:[]});
    setPrices({}); showMsg("🔄 Cartera reiniciada con $100,000");
  };

  // Calcular métricas
  const positions=Object.entries(pf.positions).map(([tk,pos])=>{
    const cp=prices[tk]?.price||pos.avgCost;
    const value=cp*pos.shares, cost=pos.avgCost*pos.shares;
    const pnl=value-cost, pnlPct=(pnl/cost)*100;
    return{tk,shares:pos.shares,avgCost:pos.avgCost,cp,value,pnl,pnlPct,pct:prices[tk]?.pct||0};
  });
  const totalInvested=positions.reduce((s,p)=>s+p.value,0);
  const totalValue=pf.cash+totalInvested;
  const totalPnl=totalValue-PAPER_INITIAL;
  const totalPnlPct=(totalPnl/PAPER_INITIAL)*100;
  const isGain=totalPnl>=0;

  const fmtUSD=(n)=>"$"+n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  const fmtDate=(s)=>{const d=new Date(s);return`${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;};

  return(
    <div style={{fontFamily:"inherit"}}>
      {/* Toast */}
      {msg&&<div style={{position:"fixed",top:70,right:20,zIndex:999,background:msg.ok?"#16A34A":"#DC2626",color:"#fff",padding:"10px 18px",borderRadius:10,fontWeight:700,fontSize:13,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",animation:"fadeIn 0.2s"}}>{msg.text}</div>}

      {/* ── Header cartera ── */}
      <div style={{background:"linear-gradient(135deg,#0B1A2E,#0D2244)",borderRadius:18,padding:"22px 24px",marginBottom:16,border:"1px solid rgba(0,168,255,0.15)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:11,color:"#64748B",fontWeight:700,letterSpacing:1,marginBottom:4}}>CARTERA TOTAL</div>
            <div style={{fontSize:32,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{fmtUSD(totalValue)}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              <span style={{fontSize:14,fontWeight:800,color:isGain?"#00E58F":"#FF4D6A"}}>
                {isGain?"▲":"▼"} {fmtUSD(Math.abs(totalPnl))} ({totalPnlPct>=0?"+":""}{totalPnlPct.toFixed(2)}%)
              </span>
              <span style={{fontSize:11,color:"#64748B"}}>desde inicio</span>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
            <div style={{background:"rgba(0,168,255,0.1)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:10,padding:"8px 14px",textAlign:"right"}}>
              <div style={{fontSize:10,color:"#64748B",fontWeight:600}}>EFECTIVO</div>
              <div style={{fontSize:18,fontWeight:800,color:"#00A8FF",fontFamily:"monospace"}}>{fmtUSD(pf.cash)}</div>
            </div>
            <button onClick={resetPortfolio} style={{fontSize:10,color:"#64748B",background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontWeight:600}}>↺ Reiniciar</button>
          </div>
        </div>
        {/* Mini stat row */}
        <div style={{display:"flex",gap:12,marginTop:16,flexWrap:"wrap"}}>
          {[
            {label:"Capital inicial", val:fmtUSD(PAPER_INITIAL), col:"#64748B"},
            {label:"Invertido",       val:fmtUSD(totalInvested),  col:"#00A8FF"},
            {label:"Posiciones",      val:positions.length,        col:"#F59E0B"},
            {label:"Operaciones",     val:pf.trades.length,        col:"#A78BFA"},
          ].map(({label,val,col})=>(
            <div key={label} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 12px",minWidth:90}}>
              <div style={{fontSize:9,color:"#64748B",fontWeight:600}}>{label}</div>
              <div style={{fontSize:15,fontWeight:800,color:col,fontFamily:"monospace"}}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{display:"flex",gap:4,marginBottom:16,background:"rgba(0,0,0,0.04)",borderRadius:10,padding:4}}>
        {[["cartera","📊 Cartera"],["operar","💹 Operar"],["historial","📋 Historial"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
              background:tab===k?"#ffffff":  "transparent",
              color:tab===k?"#0F172A":"#64748B",
              boxShadow:tab===k?"0 1px 4px rgba(0,0,0,0.1)":"none",
              transition:"all 0.15s"
            }}>{l}</button>
        ))}
      </div>

      {/* ── TAB: CARTERA ── */}
      {tab==="cartera"&&(
        <div>
          {positions.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px",background:"rgba(0,168,255,0.03)",border:"1px dashed rgba(0,168,255,0.2)",borderRadius:14}}>
              <div style={{fontSize:36,marginBottom:12}}>📭</div>
              <div style={{fontWeight:700,color:"#0F172A",marginBottom:6}}>Cartera vacía</div>
              <div style={{color:"#64748B",fontSize:13,marginBottom:16}}>Tienes {fmtUSD(pf.cash)} de efectivo virtual.<br/>Ve a "Operar" y compra tu primera acción.</div>
              <button onClick={()=>setTab("operar")} style={{background:"linear-gradient(135deg,#00E58F,#00A8FF)",border:"none",borderRadius:10,padding:"10px 24px",fontWeight:800,color:"#fff",cursor:"pointer",fontSize:14}}>💹 Ir a Operar</button>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {positions.map(p=>(
                <div key={p.tk} style={{background:"#fff",border:`1px solid ${p.pnl>=0?"rgba(0,229,143,0.2)":"rgba(255,77,106,0.2)"}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  {/* Ticker */}
                  <div style={{minWidth:60}}>
                    <div style={{fontWeight:900,fontSize:15,color:"#0F172A",fontFamily:"monospace"}}>${p.tk}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>{p.shares} acc.</div>
                  </div>
                  {/* Precio actual */}
                  <div style={{minWidth:80}}>
                    <div style={{fontWeight:800,fontSize:14,fontFamily:"monospace",color:"#0F172A"}}>{fmtUSD(p.cp)}</div>
                    <div style={{fontSize:11,color:p.pct>=0?"#16A34A":"#DC2626",fontWeight:700}}>{p.pct>=0?"+":""}{p.pct?.toFixed(2)}% hoy</div>
                  </div>
                  {/* Costo promedio */}
                  <div style={{minWidth:80}}>
                    <div style={{fontSize:10,color:"#64748B",fontWeight:600}}>COMPRA PROM.</div>
                    <div style={{fontWeight:700,fontSize:13,fontFamily:"monospace",color:"#64748B"}}>{fmtUSD(p.avgCost)}</div>
                  </div>
                  {/* Valor total */}
                  <div style={{minWidth:80}}>
                    <div style={{fontSize:10,color:"#64748B",fontWeight:600}}>VALOR</div>
                    <div style={{fontWeight:800,fontSize:14,fontFamily:"monospace",color:"#0F172A"}}>{fmtUSD(p.value)}</div>
                  </div>
                  {/* P&L */}
                  <div style={{minWidth:80}}>
                    <div style={{fontSize:10,color:"#64748B",fontWeight:600}}>P&L</div>
                    <div style={{fontWeight:800,fontSize:14,fontFamily:"monospace",color:p.pnl>=0?"#16A34A":"#DC2626"}}>
                      {p.pnl>=0?"+":""}{fmtUSD(p.pnl)}
                    </div>
                    <div style={{fontSize:11,fontWeight:700,color:p.pnl>=0?"#16A34A":"#DC2626"}}>{p.pnlPct>=0?"+":""}{p.pnlPct.toFixed(2)}%</div>
                  </div>
                  {/* Botón vender */}
                  <div style={{marginLeft:"auto"}}>
                    {sellTicker===p.tk?(
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        <input value={sellShares} onChange={e=>setSellShares(e.target.value)}
                          placeholder={`máx ${p.shares}`} type="number" min="0.01" step="0.01"
                          style={{width:70,border:"1px solid rgba(220,38,38,0.3)",borderRadius:7,padding:"5px 8px",fontSize:12,outline:"none"}}/>
                        <button onClick={()=>sell(p.tk,sellShares)}
                          style={{background:"#DC2626",border:"none",borderRadius:7,padding:"5px 10px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Vender</button>
                        <button onClick={()=>setSellTicker(null)}
                          style={{background:"transparent",border:"1px solid #ccc",borderRadius:7,padding:"5px 8px",cursor:"pointer",fontSize:12,color:"#64748B"}}>✕</button>
                      </div>
                    ):(
                      <button onClick={()=>{setSellTicker(p.tk);setSellShares("");}}
                        style={{background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.25)",borderRadius:8,padding:"6px 14px",color:"#DC2626",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                        Vender ▾
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={refreshPrices} style={{background:"transparent",border:"1px solid rgba(0,168,255,0.2)",borderRadius:8,padding:"8px",color:"#00A8FF",fontSize:12,fontWeight:600,cursor:"pointer",marginTop:4}}>↻ Actualizar precios</button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: OPERAR ── */}
      {tab==="operar"&&(
        <div style={{background:"#fff",border:"1px solid rgba(15,23,42,0.09)",borderRadius:16,padding:"20px"}}>
          <h3 style={{fontWeight:800,fontSize:15,color:"#0F172A",marginBottom:16}}>💹 Comprar acciones</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Ticker input */}
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#64748B",display:"block",marginBottom:5}}>TICKER DE LA ACCIÓN</label>
              <div style={{display:"flex",gap:8}}>
                <input value={ticker}
                  onChange={e=>{setTicker(e.target.value.toUpperCase());setLiveQ(null);}}
                  onBlur={e=>fetchQuote(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&fetchQuote(ticker)}
                  placeholder="Ej: AAPL, NVDA, TSLA, BTC-USD"
                  style={{flex:1,border:"1.5px solid rgba(15,23,42,0.12)",borderRadius:10,padding:"10px 14px",fontSize:14,fontFamily:"monospace",fontWeight:700,outline:"none",letterSpacing:1}}/>
                <button onClick={()=>fetchQuote(ticker)}
                  style={{background:"linear-gradient(135deg,#00A8FF,#0090D4)",border:"none",borderRadius:10,padding:"10px 16px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>
                  {fetching?"⏳":"🔍"}
                </button>
              </div>
            </div>

            {/* Cotización en vivo */}
            {liveQ&&(
              <div style={{background:"linear-gradient(135deg,rgba(0,229,143,0.06),rgba(0,168,255,0.04))",border:"1.5px solid rgba(0,229,143,0.25)",borderRadius:12,padding:"14px 16px",display:"flex",gap:16,alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,color:"#64748B",fontWeight:600}}>PRECIO ACTUAL</div>
                  <div style={{fontSize:24,fontWeight:900,fontFamily:"monospace",color:"#0F172A"}}>{fmtUSD(liveQ.price)}</div>
                </div>
                <div>
                  <div style={{fontSize:11,color:"#64748B",fontWeight:600}}>HOY</div>
                  <div style={{fontSize:16,fontWeight:800,color:liveQ.change>=0?"#16A34A":"#DC2626"}}>{liveQ.change>=0?"+":""}{liveQ.change?.toFixed(2)}%</div>
                </div>
                <div style={{marginLeft:"auto",fontSize:11,color:"#16A34A",background:"rgba(22,163,74,0.08)",border:"1px solid rgba(22,163,74,0.2)",borderRadius:8,padding:"4px 10px",fontWeight:700}}>✓ En vivo</div>
              </div>
            )}
            {!liveQ&&ticker&&!fetching&&(
              <div style={{fontSize:12,color:"#DC2626",background:"rgba(220,38,38,0.06)",border:"1px solid rgba(220,38,38,0.15)",borderRadius:8,padding:"8px 12px"}}>
                ⚠️ Ticker no encontrado. Verifica que sea un símbolo válido (ej: AAPL, MSFT, NVDA).
              </div>
            )}

            {/* Cantidad */}
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#64748B",display:"block",marginBottom:5}}>CANTIDAD DE ACCIONES</label>
              <input value={shares} onChange={e=>setShares(e.target.value)}
                type="number" min="0.01" step="0.01" placeholder="Ej: 10"
                style={{width:"100%",border:"1.5px solid rgba(15,23,42,0.12)",borderRadius:10,padding:"10px 14px",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
            </div>

            {/* Resumen de compra */}
            {liveQ&&shares&&parseFloat(shares)>0&&(
              <div style={{background:"rgba(0,168,255,0.04)",border:"1px solid rgba(0,168,255,0.15)",borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:"#64748B"}}>Costo total</span>
                  <span style={{fontWeight:800,fontFamily:"monospace",fontSize:14,color:"#0F172A"}}>{fmtUSD(liveQ.price*parseFloat(shares))}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,color:"#64748B"}}>Efectivo restante</span>
                  <span style={{fontWeight:800,fontFamily:"monospace",fontSize:14,
                    color:pf.cash-(liveQ.price*parseFloat(shares))>=0?"#16A34A":"#DC2626"
                  }}>{fmtUSD(pf.cash-(liveQ.price*parseFloat(shares)))}</span>
                </div>
              </div>
            )}

            {/* Botón comprar */}
            <button onClick={buy}
              disabled={!liveQ||!shares||parseFloat(shares)<=0}
              style={{background:liveQ&&shares?"linear-gradient(135deg,#00E58F,#00A8FF)":"rgba(0,0,0,0.06)",border:"none",borderRadius:12,padding:"14px",fontWeight:900,fontSize:15,color:liveQ&&shares?"#fff":"#94A3B8",cursor:liveQ&&shares?"pointer":"not-allowed",transition:"all 0.15s",letterSpacing:0.3}}>
              {liveQ&&shares?`▲ Comprar ${shares} × $${ticker} — ${fmtUSD(liveQ.price*parseFloat(shares||0))}`:"Busca un ticker y elige cantidad"}
            </button>

            <div style={{fontSize:11,color:"#94A3B8",textAlign:"center"}}>⚠️ Solo trading simulado — dinero virtual. No es dinero real.</div>
          </div>
        </div>
      )}

      {/* ── TAB: HISTORIAL ── */}
      {tab==="historial"&&(
        <div style={{background:"#fff",border:"1px solid rgba(15,23,42,0.09)",borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(15,23,42,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:800,fontSize:14,color:"#0F172A"}}>📋 Historial de operaciones</span>
            <span style={{fontSize:12,color:"#64748B"}}>{pf.trades.length} ops.</span>
          </div>
          {pf.trades.length===0?(
            <div style={{textAlign:"center",padding:"32px",color:"#94A3B8",fontSize:13}}>Sin operaciones todavía</div>
          ):(
            <div>
              {pf.trades.map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:"1px solid rgba(15,23,42,0.05)",background:i%2===0?"#fff":"#FAFBFC"}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:t.action==="buy"?"rgba(22,163,74,0.1)":"rgba(220,38,38,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                    {t.action==="buy"?"▲":"▼"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:13,color:"#0F172A"}}>{t.action==="buy"?"COMPRA":"VENTA"} <span style={{fontFamily:"monospace",color:C.accentText}}>${t.ticker}</span></div>
                    <div style={{fontSize:11,color:"#64748B"}}>{fmtDate(t.date)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,fontSize:13,fontFamily:"monospace",color:"#0F172A"}}>{fmtUSD(t.price*t.shares)}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>{t.shares} acc. × {fmtUSD(t.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── HERRAMIENTA 1: RIESGO/RECOMPENSA ─────────────────────────────────────────
function RiskRewardCalc(){
  const [entry,setEntry]=useState("");
  const [stop,setStop]=useState("");
  const [target,setTarget]=useState("");
  const [capital,setCapital]=useState("10000");
  const [riskPct,setRiskPct]=useState("2");
  const result = useMemo(()=>{
    const e=parseFloat(entry),s=parseFloat(stop),t=parseFloat(target),cap=parseFloat(capital),rp=parseFloat(riskPct);
    if(!e||!s||!t||e<=0) return null;
    const riskPerShare=Math.abs(e-s);
    const gainPerShare=Math.abs(t-e);
    const rr=gainPerShare/riskPerShare;
    const maxLoss=cap*(rp/100);
    const shares=Math.floor(maxLoss/riskPerShare);
    const potGain=shares*gainPerShare;
    const potLoss=shares*riskPerShare;
    return{rr,shares,potGain,potLoss,riskPerShare,gainPerShare,
      rrColor:rr>=3?"#00E58F":rr>=2?"#F59E0B":"#FF4D6A",
      rrLabel:rr>=3?"Excelente":rr>=2?"Buena":rr>=1?"Aceptable":"Mala"};
  },[entry,stop,target,capital,riskPct]);

  const inp=(label,val,set,placeholder)=>(
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#64748B",fontSize:13}}>$</span>
        <input value={val} onChange={e=>set(e.target.value)} placeholder={placeholder} type="number" step="0.01"
          style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px 10px 24px",color:"#F1F5F9",fontSize:14,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}/>
      </div>
    </div>
  );

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>⚖️ Calculadora Riesgo/Recompensa</h3>
        {inp("Precio de entrada",entry,setEntry,"0.00")}
        {inp("Stop Loss",stop,setStop,"0.00")}
        {inp("Precio objetivo (Target)",target,setTarget,"0.00")}
        <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"16px 0"}}/>
        <div style={{marginBottom:12}}>
          <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>Capital disponible ($)</label>
          <input value={capital} onChange={e=>setCapital(e.target.value)} type="number"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",color:"#F1F5F9",fontSize:14,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>% de riesgo por operación: {riskPct}%</label>
          <input type="range" min="0.5" max="10" step="0.5" value={riskPct} onChange={e=>setRiskPct(e.target.value)}
            style={{width:"100%",accentColor:"#F59E0B"}}/>
        </div>
      </div>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>📊 Resultado</h3>
        {result ? (<>
          <div style={{textAlign:"center",marginBottom:20,padding:"20px",background:`rgba(${result.rr>=3?"0,229,143":result.rr>=2?"245,158,11":"255,77,106"},0.08)`,borderRadius:14,border:`1px solid rgba(${result.rr>=3?"0,229,143":result.rr>=2?"245,158,11":"255,77,106"},0.2)`}}>
            <div style={{fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,letterSpacing:1}}>RATIO RIESGO/RECOMPENSA</div>
            <div style={{fontSize:48,fontWeight:900,color:result.rrColor,fontFamily:"monospace"}}>{result.rr.toFixed(2)}<span style={{fontSize:20}}>:1</span></div>
            <div style={{fontSize:14,color:result.rrColor,fontWeight:700}}>{result.rrLabel} operación</div>
          </div>
          {[
            {label:"Acciones a comprar",val:`${result.shares} acciones`,color:"#F1F5F9"},
            {label:"Riesgo máximo",val:`-$${result.potLoss.toFixed(2)}`,color:"#FF4D6A"},
            {label:"Ganancia potencial",val:`+$${result.potGain.toFixed(2)}`,color:"#00E58F"},
            {label:"Riesgo por acción",val:`$${result.riskPerShare.toFixed(2)}`,color:"#94A3B8"},
            {label:"Ganancia por acción",val:`$${result.gainPerShare.toFixed(2)}`,color:"#94A3B8"},
          ].map(r=>(
            <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <span style={{fontSize:13,color:"#64748B"}}>{r.label}</span>
              <span style={{fontSize:14,fontWeight:700,color:r.color,fontFamily:"monospace"}}>{r.val}</span>
            </div>
          ))}
          <div style={{marginTop:16,padding:"12px",background:"rgba(0,168,255,0.07)",borderRadius:10,border:"1px solid rgba(0,168,255,0.15)",fontSize:12,color:"#94A3B8",lineHeight:1.6}}>
            💡 <strong style={{color:"#00A8FF"}}>Regla de oro:</strong> Solo operar con R:R ≥ 2:1. Así puedes perder el 50% de tus operaciones y seguir siendo rentable.
          </div>
        </>) : (
          <div style={{textAlign:"center",padding:"40px 20px",color:"#475569"}}>
            <div style={{fontSize:36,marginBottom:12}}>⚖️</div>
            <div style={{fontSize:13}}>Ingresa entrada, stop loss y objetivo para calcular</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── HERRAMIENTA 2: SHARPE RATIO ───────────────────────────────────────────────
function SharpeCalc(){
  const [returns,setReturns]=useState("");
  const [rfRate,setRfRate]=useState("5");
  const result = useMemo(()=>{
    const vals=returns.split(/[\s,;]+/).map(v=>parseFloat(v.replace("%",""))).filter(v=>!isNaN(v));
    if(vals.length<2) return null;
    const rf=parseFloat(rfRate)||0;
    const mean=vals.reduce((a,b)=>a+b,0)/vals.length;
    const variance=vals.reduce((a,b)=>a+Math.pow(b-mean,2),0)/(vals.length-1);
    const std=Math.sqrt(variance);
    const annualMean=mean*12; const annualStd=std*Math.sqrt(12);
    const sharpe=(annualMean-rf)/annualStd;
    const label=sharpe>=2?"Excelente 🏆":sharpe>=1?"Bueno ✅":sharpe>=0.5?"Aceptable ⚠️":sharpe>=0?"Bajo 📉":"Negativo ❌";
    const color=sharpe>=2?"#00E58F":sharpe>=1?"#00A8FF":sharpe>=0.5?"#F59E0B":sharpe>=0?"#FF9F43":"#FF4D6A";
    return{sharpe,mean,std,annualMean,annualStd,count:vals.length,label,color};
  },[returns,rfRate]);

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:8}}>📐 Calculadora Sharpe Ratio</h3>
        <p style={{color:"#64748B",fontSize:12,marginBottom:20,lineHeight:1.6}}>Mide el rendimiento ajustado al riesgo. Mayor = mejor. Ingresa tus retornos mensuales separados por comas.</p>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Retornos mensuales (%) — ej: 3.2, -1.5, 4.1, 2.8</label>
          <textarea value={returns} onChange={e=>setReturns(e.target.value)} placeholder="3.2, -1.5, 4.1, 2.8, -0.5, 5.1, 1.2, -2.1, 3.5, 4.0, 1.8, 2.2"
            style={{width:"100%",height:100,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",color:"#F1F5F9",fontSize:13,fontFamily:"monospace",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Tasa libre de riesgo anual (%)</label>
          <input value={rfRate} onChange={e=>setRfRate(e.target.value)} type="number" step="0.1"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",color:"#F1F5F9",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        {result&&<div style={{fontSize:12,color:"#475569",lineHeight:1.8}}>
          📊 {result.count} meses de datos<br/>
          Retorno medio mensual: <strong style={{color:"#F1F5F9"}}>{result.mean.toFixed(2)}%</strong><br/>
          Desviación estándar: <strong style={{color:"#F1F5F9"}}>{result.std.toFixed(2)}%</strong><br/>
          Retorno anualizado: <strong style={{color:"#00E58F"}}>{result.annualMean.toFixed(2)}%</strong>
        </div>}
      </div>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>📊 Resultado</h3>
        {result ? (<>
          <div style={{textAlign:"center",marginBottom:20,padding:"24px",background:`rgba(${result.color==="#00E58F"?"0,229,143":result.color==="#00A8FF"?"0,168,255":"245,158,11"},0.07)`,borderRadius:14}}>
            <div style={{fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,letterSpacing:1}}>SHARPE RATIO</div>
            <div style={{fontSize:52,fontWeight:900,color:result.color,fontFamily:"monospace"}}>{result.sharpe.toFixed(3)}</div>
            <div style={{fontSize:15,color:result.color,fontWeight:700,marginTop:4}}>{result.label}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px",marginBottom:16}}>
            <div style={{fontSize:12,color:"#64748B",fontWeight:700,marginBottom:10}}>ESCALA DE REFERENCIA</div>
            {[{min:"< 0",label:"Negativo — peor que el libre de riesgo",color:"#FF4D6A"},
              {min:"0 – 0.5",label:"Bajo — rentable pero con mucho riesgo",color:"#FF9F43"},
              {min:"0.5 – 1",label:"Aceptable — rendimiento decente",color:"#F59E0B"},
              {min:"1 – 2",label:"Bueno — portafolio eficiente",color:"#00A8FF"},
              {min:"> 2",label:"Excelente — clase de Warren Buffett",color:"#00E58F"},
            ].map(r=>(
              <div key={r.min} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{width:50,fontSize:11,color:r.color,fontFamily:"monospace",fontWeight:700,flexShrink:0}}>{r.min}</span>
                <span style={{fontSize:12,color:result.sharpe>=(r.min==="< 0"?-Infinity:parseFloat(r.min))?"#CBD5E1":"#475569"}}>{r.label}</span>
              </div>
            ))}
          </div>
        </>) : (
          <div style={{textAlign:"center",padding:"40px 20px",color:"#475569"}}>
            <div style={{fontSize:36,marginBottom:12}}>📐</div>
            <div style={{fontSize:13}}>Ingresa tus retornos mensuales para calcular</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── HERRAMIENTA 3: RACHA DE GANANCIAS ────────────────────────────────────────
function WinStreakTracker(){
  const [trades,setTrades]=useState([]);
  const [newTrade,setNewTrade]=useState({ticker:"",result:"win",pnl:""});
  const stats = useMemo(()=>{
    if(!trades.length) return null;
    const wins=trades.filter(t=>t.result==="win");
    const losses=trades.filter(t=>t.result==="loss");
    let curStreak=0,bestStreak=0,cur=0;
    trades.forEach(t=>{ if(t.result==="win"){cur++;bestStreak=Math.max(bestStreak,cur);}else cur=0; });
    curStreak=cur;
    const winRate=wins.length/trades.length*100;
    const avgWin=wins.length?wins.reduce((a,t)=>a+(parseFloat(t.pnl)||0),0)/wins.length:0;
    const avgLoss=losses.length?Math.abs(losses.reduce((a,t)=>a+(parseFloat(t.pnl)||0),0)/losses.length):0;
    const totalPnl=trades.reduce((a,t)=>a+(parseFloat(t.pnl)||0),0);
    const profitFactor=avgLoss>0?(avgWin*wins.length)/(avgLoss*losses.length):Infinity;
    return{wins:wins.length,losses:losses.length,total:trades.length,winRate,avgWin,avgLoss,curStreak,bestStreak,totalPnl,profitFactor};
  },[trades]);

  const addTrade=()=>{
    if(!newTrade.ticker||!newTrade.pnl) return;
    setTrades(prev=>[...prev,{...newTrade,id:Date.now(),date:new Date().toLocaleDateString("es")}]);
    setNewTrade(t=>({...t,ticker:"",pnl:""}));
  };

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>🔥 Registrar Operación</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div>
            <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4}}>TICKER</label>
            <input value={newTrade.ticker} onChange={e=>setNewTrade(t=>({...t,ticker:e.target.value.toUpperCase()}))} placeholder="AAPL"
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:14,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4}}>RESULTADO</label>
            <select value={newTrade.result} onChange={e=>setNewTrade(t=>({...t,result:e.target.value}))}
              style={{width:"100%",background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:newTrade.result==="win"?"#00E58F":"#FF4D6A",fontSize:14,fontWeight:700,outline:"none",boxSizing:"border-box"}}>
              <option value="win">✅ Win</option>
              <option value="loss">❌ Loss</option>
            </select>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4}}>P&L ($) — positivo o negativo</label>
          <input value={newTrade.pnl} onChange={e=>setNewTrade(t=>({...t,pnl:e.target.value}))} placeholder="+250.00" type="number"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:14,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <button onClick={addTrade} style={{width:"100%",background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",borderRadius:10,padding:"11px",fontSize:14,fontWeight:800,color:"#000",cursor:"pointer",marginBottom:16}}>+ Agregar Operación</button>
        {/* Historial */}
        <div style={{maxHeight:240,overflowY:"auto"}}>
          {[...trades].reverse().map(tr=>(
            <div key={tr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,marginBottom:4,background:tr.result==="win"?"rgba(0,229,143,0.06)":"rgba(255,77,106,0.06)",border:`1px solid ${tr.result==="win"?"rgba(0,229,143,0.12)":"rgba(255,77,106,0.12)"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11}}>{tr.result==="win"?"✅":"❌"}</span>
                <span style={{fontWeight:700,color:"#F1F5F9",fontSize:13,fontFamily:"monospace"}}>{tr.ticker}</span>
                <span style={{fontSize:10,color:"#64748B"}}>{tr.date}</span>
              </div>
              <span style={{fontWeight:800,fontFamily:"monospace",fontSize:13,color:tr.result==="win"?"#00E58F":"#FF4D6A"}}>{parseFloat(tr.pnl)>=0?"+":""}{parseFloat(tr.pnl).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>📊 Estadísticas</h3>
        {stats ? (<>
          {/* Racha actual */}
          <div style={{textAlign:"center",marginBottom:20,padding:"16px",background:stats.curStreak>0?"rgba(0,229,143,0.07)":"rgba(255,77,106,0.07)",borderRadius:14}}>
            <div style={{fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,letterSpacing:1}}>RACHA ACTUAL</div>
            <div style={{fontSize:44,fontWeight:900,color:stats.curStreak>0?"#00E58F":"#FF4D6A"}}>{stats.curStreak>0?"🔥":"💔"} {stats.curStreak}</div>
            <div style={{fontSize:12,color:"#64748B"}}>Mejor racha: {stats.bestStreak} operaciones consecutivas</div>
          </div>
          {/* Stats grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {label:"Win Rate",val:`${stats.winRate.toFixed(1)}%`,color:stats.winRate>=50?"#00E58F":"#FF4D6A"},
              {label:"Total P&L",val:`${stats.totalPnl>=0?"+":""}$${stats.totalPnl.toFixed(0)}`,color:stats.totalPnl>=0?"#00E58F":"#FF4D6A"},
              {label:"Operaciones",val:`${stats.wins}W / ${stats.losses}L`,color:"#F1F5F9"},
              {label:"Profit Factor",val:stats.profitFactor===Infinity?"∞":stats.profitFactor.toFixed(2),color:stats.profitFactor>=1.5?"#00E58F":stats.profitFactor>=1?"#F59E0B":"#FF4D6A"},
              {label:"Avg Win",val:`+$${stats.avgWin.toFixed(0)}`,color:"#00E58F"},
              {label:"Avg Loss",val:`-$${stats.avgLoss.toFixed(0)}`,color:"#FF4D6A"},
            ].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px",textAlign:"center",border:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:10,color:"#64748B",fontWeight:700,marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:18,fontWeight:900,color:s.color,fontFamily:"monospace"}}>{s.val}</div>
              </div>
            ))}
          </div>
          {/* Win rate visual */}
          <div style={{marginTop:4}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#64748B",marginBottom:4}}><span>Win Rate</span><span>{stats.winRate.toFixed(1)}%</span></div>
            <div style={{height:8,background:"rgba(255,77,106,0.2)",borderRadius:20,overflow:"hidden"}}>
              <div style={{width:`${stats.winRate}%`,height:"100%",background:"linear-gradient(90deg,#00A8FF,#00E58F)",borderRadius:20,transition:"width 0.5s ease"}}/>
            </div>
          </div>
        </>) : (
          <div style={{textAlign:"center",padding:"40px 20px",color:"#475569"}}>
            <div style={{fontSize:36,marginBottom:12}}>🔥</div>
            <div style={{fontSize:13}}>Agrega operaciones para ver tus estadísticas</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── HERRAMIENTA 4: EVOLUCIÓN DEL PORTAFOLIO ───────────────────────────────────
function PortfolioEvolution(){
  const [entries,setEntries]=useState([{date:"2024-01",value:"10000"},{date:"2024-06",value:"11500"},{date:"2024-12",value:"13200"},{date:"2025-06",value:"14800"}]);
  const [newDate,setNewDate]=useState(""); const [newVal,setNewVal]=useState("");

  const addEntry=()=>{
    if(!newDate||!newVal) return;
    setEntries(prev=>[...prev,{date:newDate,value:newVal}].sort((a,b)=>a.date.localeCompare(b.date)));
    setNewDate("");setNewVal("");
  };

  const chartData = entries.filter(e=>parseFloat(e.value)>0);
  const maxVal=Math.max(...chartData.map(e=>parseFloat(e.value)));
  const minVal=Math.min(...chartData.map(e=>parseFloat(e.value)));
  const range=maxVal-minVal||1;
  const W=500,H=180,PAD=30;
  const pts=chartData.map((e,i)=>{
    const x=PAD+(i/(chartData.length-1||1))*(W-2*PAD);
    const y=H-PAD-((parseFloat(e.value)-minVal)/range)*(H-2*PAD);
    return{x,y,val:parseFloat(e.value),date:e.date};
  });
  const pathD=pts.length>1?pts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "):"";
  const areaD=pts.length>1?`${pathD} L${pts[pts.length-1].x.toFixed(1)},${(H-PAD).toFixed(1)} L${pts[0].x.toFixed(1)},${(H-PAD).toFixed(1)} Z`:"";
  const firstVal=parseFloat(chartData[0]?.value)||0;
  const lastVal=parseFloat(chartData[chartData.length-1]?.value)||0;
  const totalReturn=firstVal>0?((lastVal-firstVal)/firstVal*100):0;
  const totalGain=lastVal-firstVal;

  return(
    <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
      <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:4}}>📈 Evolución de tu Portafolio</h3>
      <p style={{color:"#64748B",fontSize:12,marginBottom:20}}>Registra el valor de tu portafolio cada mes para ver tu crecimiento real.</p>
      {/* Chart */}
      {chartData.length>1 && (
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",gap:20,marginBottom:12}}>
            <div><div style={{fontSize:10,color:"#64748B",fontWeight:700}}>VALOR ACTUAL</div><div style={{fontSize:20,fontWeight:900,color:"#F1F5F9",fontFamily:"monospace"}}>${lastVal.toLocaleString()}</div></div>
            <div><div style={{fontSize:10,color:"#64748B",fontWeight:700}}>RETORNO TOTAL</div><div style={{fontSize:20,fontWeight:900,color:totalReturn>=0?"#00E58F":"#FF4D6A",fontFamily:"monospace"}}>{totalReturn>=0?"+":""}{totalReturn.toFixed(2)}%</div></div>
            <div><div style={{fontSize:10,color:"#64748B",fontWeight:700}}>GANANCIA $</div><div style={{fontSize:20,fontWeight:900,color:totalGain>=0?"#00E58F":"#FF4D6A",fontFamily:"monospace"}}>{totalGain>=0?"+":"-"}${Math.abs(totalGain).toLocaleString()}</div></div>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block"}}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E58F" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#00E58F" stopOpacity="0.02"/>
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#portfolioGrad)"/>
            <path d={pathD} fill="none" stroke="#00E58F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {pts.map((p,i)=>(
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#00E58F" stroke="#0B1020" strokeWidth="2"/>
                <text x={p.x} y={H-4} textAnchor="middle" fill="#475569" fontSize="9">{p.date.slice(0,7)}</text>
              </g>
            ))}
          </svg>
        </div>
      )}
      {/* Add entry */}
      <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
        <div style={{flex:1,minWidth:130}}>
          <label style={{display:"block",fontSize:10,color:"#64748B",fontWeight:700,marginBottom:4}}>MES (YYYY-MM)</label>
          <input value={newDate} onChange={e=>setNewDate(e.target.value)} placeholder="2025-06" type="month"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{flex:1,minWidth:130}}>
          <label style={{display:"block",fontSize:10,color:"#64748B",fontWeight:700,marginBottom:4}}>VALOR ($)</label>
          <input value={newVal} onChange={e=>setNewVal(e.target.value)} placeholder="12500" type="number"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <button onClick={addEntry} style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",whiteSpace:"nowrap"}}>+ Agregar</button>
      </div>
    </div>
  );
}

// ── HERRAMIENTA 5: ALERTAS DE PRECIO ─────────────────────────────────────────
function PriceAlerts(){
  const [alerts,setAlerts]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexotrade-alerts")||"[]");}catch{return[];}});
  const [ticker,setTicker]=useState(""); const [price,setPrice]=useState(""); const [cond,setCond]=useState("above");
  const prices=useContext(PriceCtx)||{};

  const saveAlerts=(a)=>{ setAlerts(a); localStorage.setItem("nexotrade-alerts",JSON.stringify(a)); };
  const addAlert=()=>{
    if(!ticker||!price) return;
    saveAlerts([...alerts,{id:Date.now(),ticker:ticker.toUpperCase(),price:parseFloat(price),cond,triggered:false,createdAt:new Date().toLocaleDateString("es")}]);
    setTicker("");setPrice("");
  };
  const deleteAlert=(id)=>saveAlerts(alerts.filter(a=>a.id!==id));

  const getStatus=(alert)=>{
    const cur=prices[alert.ticker]?.price;
    if(!cur) return{text:"Sin precio",color:"#475569"};
    const triggered=alert.cond==="above"?cur>=alert.price:cur<=alert.price;
    return triggered?{text:"🔔 ACTIVADA",color:"#F59E0B"}:{text:"En espera",color:"#64748B"};
  };

  return(
    <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
      <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:8}}>🔔 Alertas de Precio Personalizadas</h3>
      <p style={{color:"#64748B",fontSize:12,marginBottom:20}}>Recibe una alerta visual cuando una acción llegue a tu precio objetivo.</p>
      {/* Form */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24,padding:"16px",background:"rgba(255,255,255,0.02)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{flex:"1 1 100px"}}>
          <label style={{display:"block",fontSize:10,color:"#64748B",fontWeight:700,marginBottom:4}}>TICKER</label>
          <input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} placeholder="AAPL"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:14,fontFamily:"monospace",fontWeight:700,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{flex:"1 1 80px"}}>
          <label style={{display:"block",fontSize:10,color:"#64748B",fontWeight:700,marginBottom:4}}>CONDICIÓN</label>
          <select value={cond} onChange={e=>setCond(e.target.value)}
            style={{width:"100%",background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:13,fontWeight:700,outline:"none",boxSizing:"border-box"}}>
            <option value="above">📈 Sube de</option>
            <option value="below">📉 Baja de</option>
          </select>
        </div>
        <div style={{flex:"1 1 100px"}}>
          <label style={{display:"block",fontSize:10,color:"#64748B",fontWeight:700,marginBottom:4}}>PRECIO ($)</label>
          <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="200.00" type="number" step="0.01"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:14,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",alignItems:"flex-end"}}>
          <button onClick={addAlert} style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:800,color:"#000",cursor:"pointer",whiteSpace:"nowrap"}}>+ Crear Alerta</button>
        </div>
      </div>
      {/* List */}
      {alerts.length===0?(
        <div style={{textAlign:"center",padding:"32px",color:"#475569"}}>
          <div style={{fontSize:32,marginBottom:8}}>🔔</div>
          <div style={{fontSize:13}}>No tienes alertas configuradas</div>
        </div>
      ):(
        alerts.map(a=>{
          const status=getStatus(a);
          const cur=prices[a.ticker]?.price;
          return(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:12,marginBottom:8,background:status.text.includes("ACTIVADA")?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${status.text.includes("ACTIVADA")?"rgba(245,158,11,0.25)":"rgba(255,255,255,0.06)"}`}}>
              <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{a.cond==="above"?"📈":"📉"}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                  <span style={{fontWeight:900,color:"#F1F5F9",fontSize:15,fontFamily:"monospace"}}>{a.ticker}</span>
                  <span style={{fontSize:12,color:"#64748B"}}>{a.cond==="above"?"sube de":"baja de"}</span>
                  <span style={{fontWeight:800,color:"#F59E0B",fontFamily:"monospace"}}>${a.price.toFixed(2)}</span>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontSize:11,color:status.color,fontWeight:700}}>{status.text}</span>
                  {cur&&<span style={{fontSize:11,color:"#475569"}}>Precio actual: ${cur.toFixed(2)}</span>}
                </div>
              </div>
              <button onClick={()=>deleteAlert(a.id)} style={{background:"none",border:"1px solid rgba(255,77,106,0.2)",borderRadius:7,padding:"5px 10px",color:"#FF4D6A",cursor:"pointer",fontSize:12,fontWeight:700}}>Borrar</button>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── HERRAMIENTA 6: EXPORTAR DATOS ────────────────────────────────────────────
function ExportData({posts=[],user}){
  const downloadCSV=(data,filename)=>{
    if(!data.length) return;
    const headers=Object.keys(data[0]);
    const rows=[headers.join(","),...data.map(r=>headers.map(h=>`"${String(r[h]||"").replace(/"/g,'""')}"`).join(","))];
    const blob=new Blob([rows.join("\n")],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPosts=()=>{
    const data=posts.map(p=>({Fecha:p.time,Usuario:p.user,Ticker:p.ticker||"",Sentimiento:p.sentiment,Texto:p.text,Likes:p.likes||0,Comentarios:p.comments||0}));
    downloadCSV(data,"nexotrade-posts.csv");
  };

  const exportMisPosts=()=>{
    const mis=posts.filter(p=>p.user===user?.name||p.userId===user?.id);
    const data=mis.map(p=>({Fecha:p.time,Ticker:p.ticker||"",Sentimiento:p.sentiment,Texto:p.text,Likes:p.likes||0}));
    downloadCSV(data,"nexotrade-mis-posts.csv");
  };

  const options=[
    {title:"📋 Todos los Posts del Feed",desc:`${posts.length} posts del feed principal`,fn:exportPosts,color:"#00A8FF"},
    {title:"✍️ Mis Posts",desc:`Solo tus publicaciones en NexoTrade`,fn:exportMisPosts,color:"#00E58F"},
    {title:"📊 Plantilla de Trading Journal",desc:"Hoja Excel preformateada para registrar tus operaciones",fn:()=>{
      const template=[{Fecha:"",Ticker:"",Entrada:"",SL:"",TP:"",Resultado:"",PnL:"",RR:"",Notas:""}];
      downloadCSV(template,"nexotrade-trading-journal-template.csv");
    },color:"#F59E0B"},
  ];

  return(
    <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
      <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:8}}>📤 Exportar Datos</h3>
      <p style={{color:"#64748B",fontSize:12,marginBottom:24}}>Descarga tus datos en formato CSV compatible con Excel, Google Sheets y cualquier herramienta de análisis.</p>
      <div style={{display:"grid",gap:12}}>
        {options.map(o=>(
          <div key={o.title} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px",background:"rgba(255,255,255,0.02)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
            <div>
              <div style={{fontWeight:700,color:"#F1F5F9",fontSize:14,marginBottom:3}}>{o.title}</div>
              <div style={{fontSize:12,color:"#64748B"}}>{o.desc}</div>
            </div>
            <button onClick={o.fn} style={{background:"transparent",border:`1.5px solid ${o.color}`,borderRadius:9,padding:"8px 16px",color:o.color,fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=o.color+"22";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              ⬇ Descargar CSV
            </button>
          </div>
        ))}
      </div>
      <div style={{marginTop:20,padding:"14px 16px",background:"rgba(0,168,255,0.05)",borderRadius:10,border:"1px solid rgba(0,168,255,0.1)",fontSize:12,color:"#64748B",lineHeight:1.7}}>
        💡 <strong style={{color:"#00A8FF"}}>Cómo usar en Excel:</strong> Abre Excel → Archivo → Importar → selecciona el CSV → codificación UTF-8 → delimitado por comas. Listo.
      </div>
    </div>
  );
}


// ── ACCIONES VIP PAGE ─────────────────────────────────────────────────────────
function AdminPicksModal({onClose}){
  const categorias=["corto","largo","dividendos","crypto"];
  const [cat,setCat]=useState("corto");
  const [form,setForm]=useState({ticker:"",nombre:"",tipo:"COMPRA",entrada:"",target:"",stop_loss:"",confianza:80,razon:"",yield_div:"",sector:"",rating:"★★★★☆"});
  const [saving,setSaving]=useState(false);
  const [ok,setOk]=useState(false);

  const save=async()=>{
    if(!form.ticker||!form.nombre) return;
    setSaving(true);
    const payload={...form,ticker:form.ticker.toUpperCase(),categoria:cat,semana:new Date().toISOString().split("T")[0],activo:true};
    if(cat==="dividendos"){delete payload.tipo;delete payload.target;delete payload.stop_loss;delete payload.confianza;delete payload.razon;}
    else{delete payload.yield_div;delete payload.sector;delete payload.rating;}
    await supabase.from("weekly_picks").insert(payload);
    setSaving(false);setOk(true);
    setTimeout(()=>setOk(false),2000);
    setForm({ticker:"",nombre:"",tipo:"COMPRA",entrada:"",target:"",stop_loss:"",confianza:80,razon:"",yield_div:"",sector:"",rating:"★★★★☆"});
  };

  const clearWeek=async()=>{
    if(!window.confirm("¿Borrar todos los picks de esta semana?")) return;
    await supabase.from("weekly_picks").delete().eq("semana",new Date().toISOString().split("T")[0]);
    alert("Picks borrados. Agrega los nuevos.");
  };

  const inp={width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"8px 12px",color:"#F1F5F9",fontSize:13,outline:"none",boxSizing:"border-box"};
  const lbl={display:"block",fontSize:10,color:"#64748B",fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5};

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0B1020",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{fontWeight:900,color:"#F1F5F9",fontSize:18}}>🛠️ Admin — Picks Semanales</div>
            <div style={{fontSize:11,color:"#64748B",marginTop:2}}>Solo visible para administradores</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 12px",color:"#94A3B8",cursor:"pointer",fontSize:13}}>✕ Cerrar</button>
        </div>

        {/* Categoría */}
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {categorias.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{background:cat===c?"rgba(0,168,255,0.2)":"transparent",border:`1px solid ${cat===c?"#00A8FF":"rgba(255,255,255,0.1)"}`,borderRadius:8,padding:"6px 14px",color:cat===c?"#00A8FF":"#64748B",cursor:"pointer",fontSize:12,fontWeight:700,textTransform:"capitalize"}}>
              {c==="corto"?"⚡ Corto":c==="largo"?"🏦 Largo":c==="dividendos"?"💰 Dividendos":"₿ Crypto"}
            </button>
          ))}
        </div>

        {/* Campos comunes */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={lbl}>Ticker</label><input style={inp} value={form.ticker} onChange={e=>setForm(f=>({...f,ticker:e.target.value.toUpperCase()}))} placeholder="AAPL"/></div>
          <div><label style={lbl}>Nombre</label><input style={inp} value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Apple Inc."/></div>
        </div>

        {cat!=="dividendos" ? <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={lbl}>Tipo</label>
              <select style={{...inp}} value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>
                <option value="COMPRA">📈 COMPRA</option><option value="VENTA">📉 VENTA</option>
              </select>
            </div>
            <div><label style={lbl}>Entrada</label><input style={inp} value={form.entrada} onChange={e=>setForm(f=>({...f,entrada:e.target.value}))} placeholder="$190"/></div>
            <div><label style={lbl}>Confianza %</label><input style={inp} type="number" min="1" max="100" value={form.confianza} onChange={e=>setForm(f=>({...f,confianza:parseInt(e.target.value)||80}))}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={lbl}>Target</label><input style={inp} value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder="$220"/></div>
            <div><label style={lbl}>Stop Loss</label><input style={inp} value={form.stop_loss} onChange={e=>setForm(f=>({...f,stop_loss:e.target.value}))} placeholder="$175"/></div>
          </div>
          <div style={{marginBottom:16}}><label style={lbl}>Razonamiento</label><textarea style={{...inp,resize:"vertical",minHeight:60}} value={form.razon} onChange={e=>setForm(f=>({...f,razon:e.target.value}))} placeholder="¿Por qué este pick esta semana?"/></div>
        </> : <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
            <div><label style={lbl}>Precio</label><input style={inp} value={form.entrada} onChange={e=>setForm(f=>({...f,entrada:e.target.value}))} placeholder="$152"/></div>
            <div><label style={lbl}>Yield anual</label><input style={inp} value={form.yield_div} onChange={e=>setForm(f=>({...f,yield_div:e.target.value}))} placeholder="3.2%"/></div>
            <div><label style={lbl}>Sector</label><input style={inp} value={form.sector} onChange={e=>setForm(f=>({...f,sector:e.target.value}))} placeholder="Salud"/></div>
          </div>
          <div style={{marginBottom:16}}><label style={lbl}>Rating</label>
            <select style={{...inp}} value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))}>
              {["★★★★★","★★★★☆","★★★☆☆","★★☆☆☆","★☆☆☆☆"].map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </>}

        <div style={{display:"flex",gap:10}}>
          <button onClick={save} disabled={saving} style={{flex:1,background:ok?"#00D26A":"linear-gradient(135deg,#00A8FF,#0090D4)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>
            {saving?"Guardando...":ok?"✅ Guardado!":"+ Agregar Pick"}
          </button>
          <button onClick={clearWeek} style={{background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.3)",borderRadius:10,padding:"12px 16px",color:"#FF4D6A",fontSize:13,fontWeight:700,cursor:"pointer"}}>🗑️ Limpiar semana</button>
        </div>
      </div>
    </div>
  );
}

function AccionesVIPPage({isPremium, onNeedPremium, isAdmin}){
  const [picks,setPicks]=useState(null);
  const [showAdmin,setShowAdmin]=useState(false);
  const semana = new Date().toLocaleDateString("es",{day:"numeric",month:"long",year:"numeric"});

  // Picks hardcodeados como fallback mientras carga o si no hay en DB
  const FALLBACK = {
    corto:[
      {ticker:"NVDA",nombre:"NVIDIA",  tipo:"COMPRA",entrada:"$875", target:"$960", stop_loss:"$840", confianza:92,razon:"IA ciclo alcista, earnings sólidos"},
      {ticker:"META",nombre:"Meta",    tipo:"COMPRA",entrada:"$490", target:"$540", stop_loss:"$470", confianza:88,razon:"Monetización de IA en WhatsApp/Instagram"},
      {ticker:"TSLA",nombre:"Tesla",   tipo:"VENTA", entrada:"$178", target:"$155", stop_loss:"$188", confianza:74,razon:"Presión de márgenes y competencia China"},
    ],
    largo:[
      {ticker:"AAPL",nombre:"Apple",   tipo:"COMPRA",entrada:"$189", target:"$230", stop_loss:"$175", confianza:85,razon:"Superciclo iPhone con IA integrada"},
      {ticker:"AMZN",nombre:"Amazon",  tipo:"COMPRA",entrada:"$185", target:"$220", stop_loss:"$170", confianza:83,razon:"AWS crecimiento acelerado con IA"},
      {ticker:"MSFT",nombre:"Microsoft",tipo:"COMPRA",entrada:"$415",target:"$480", stop_loss:"$395", confianza:87,razon:"Copilot integrado en toda la suite Office"},
    ],
    dividendos:[
      {ticker:"JNJ",nombre:"J&J",       yield_div:"3.2%",entrada:"$152",sector:"Salud",   rating:"★★★★★"},
      {ticker:"KO", nombre:"Coca-Cola",  yield_div:"3.0%",entrada:"$63", sector:"Consumo", rating:"★★★★☆"},
    ],
    crypto:[
      {ticker:"BTC",nombre:"Bitcoin",  tipo:"COMPRA",entrada:"$67,000",target:"$80,000",stop_loss:"$62,000",confianza:79,razon:"Halving + ETF flujos positivos"},
      {ticker:"ETH",nombre:"Ethereum", tipo:"COMPRA",entrada:"$3,500", target:"$4,500", stop_loss:"$3,200", confianza:75,razon:"Actualización Pectra + staking"},
    ],
  };

  useEffect(()=>{
    const loadPicks=async()=>{
      const hoy=new Date().toISOString().split("T")[0];
      const {data,error}=await supabase.from("weekly_picks").select("*").eq("activo",true).eq("semana",hoy).order("id");
      if(!error && data && data.length>0){
        const grouped={corto:[],largo:[],dividendos:[],crypto:[]};
        data.forEach(p=>{ if(grouped[p.categoria]) grouped[p.categoria].push(p); });
        setPicks(grouped);
      } else {
        setPicks(FALLBACK);
      }
    };
    loadPicks();
  },[showAdmin]);

  const data = picks || FALLBACK;
  const C2={bull:"#00D26A",bear:"#FF4D6A",card:"rgba(10,16,30,0.98)",border:"rgba(255,255,255,0.08)"};

  if(!isPremium) return(
    <div style={{textAlign:"center",padding:"60px 20px",maxWidth:480,margin:"0 auto"}}>
      <div style={{fontSize:56,marginBottom:16}}>🔒</div>
      <h2 style={{color:"#F1F5F9",fontWeight:900,fontSize:24,marginBottom:8}}>Acciones VIP Semanales</h2>
      <p style={{color:"#64748B",fontSize:15,lineHeight:1.7,marginBottom:28}}>
        Cada semana nuestro equipo selecciona <strong style={{color:"#F1F5F9"}}>10 acciones</strong> con mayor potencial — corto plazo, largo plazo, dividendos y crypto.
      </p>
      <div style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:16,padding:"20px 24px",marginBottom:28,textAlign:"left"}}>
        {["⚡ Top 3 corto plazo con entrada y stop loss","🏦 Top 3 largo plazo con análisis fundamental","💰 Top 2 dividendos con yield y rating","₿ Top 2 crypto con análisis técnico"].map(f=>(
          <div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <span style={{fontSize:14}}>{f.split(" ")[0]}</span>
            <span style={{fontSize:13,color:"#CBD5E1"}}>{f.slice(f.indexOf(" ")+1)}</span>
          </div>
        ))}
      </div>
      <button onClick={onNeedPremium} style={{background:"linear-gradient(135deg,#7C3AED,#9333EA)",border:"none",borderRadius:12,padding:"14px 36px",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 0 24px rgba(124,58,237,0.4)"}}>
        ✦ Hazte VIP — $9.99/mes
      </button>
    </div>
  );

  const SectionTitle=({icon,title,sub})=>(
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
      <span style={{fontSize:22}}>{icon}</span>
      <div>
        <div style={{fontWeight:800,color:"#F1F5F9",fontSize:16}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:"#64748B",marginTop:1}}>{sub}</div>}
      </div>
    </div>
  );

  const PickCard=({p})=>{
    const bull=p.tipo==="COMPRA";
    return(
      <div style={{background:C2.card,border:`1px solid ${C2.border}`,borderRadius:14,padding:"16px",marginBottom:10,borderLeft:`3px solid ${bull?C2.bull:C2.bear}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <span style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:"#F1F5F9"}}>${p.ticker}</span>
            <span style={{fontSize:12,color:"#64748B",marginLeft:8}}>{p.nombre}</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <span style={{background:bull?"rgba(0,210,106,0.12)":"rgba(255,77,106,0.12)",color:bull?C2.bull:C2.bear,border:`1px solid ${bull?C2.bull+"44":C2.bear+"44"}`,borderRadius:6,padding:"3px 10px",fontSize:12,fontWeight:800}}>{bull?"▲":"▼"} {p.tipo}</span>
            <span style={{background:"rgba(245,158,11,0.1)",color:"#F59E0B",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700}}>{p.confianza}%</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          {[["Entrada",p.entrada,"#CBD5E1"],["Target",p.target,C2.bull],["Stop",p.stop_loss,C2.bear]].map(([l,v,c])=>(
            <div key={l} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
              <div style={{fontSize:9,color:"#475569",fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:0.5}}>{l}</div>
              <div style={{fontFamily:"monospace",fontWeight:800,color:c,fontSize:14}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,color:"#94A3B8",fontStyle:"italic"}}>💡 {p.razon}</div>
      </div>
    );
  };

  const DivCard=({p})=>(
    <div style={{background:C2.card,border:`1px solid ${C2.border}`,borderRadius:14,padding:"16px",marginBottom:10,borderLeft:"3px solid #F59E0B"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:"#F1F5F9"}}>${p.ticker}</span>
          <span style={{fontSize:12,color:"#64748B",marginLeft:8}}>{p.nombre}</span>
          <div style={{fontSize:11,color:"#94A3B8",marginTop:4}}>{p.sector}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontWeight:900,color:"#F59E0B",fontSize:22}}>{p.yield_div}</div>
          <div style={{fontSize:11,color:"#64748B"}}>dividendo anual</div>
          <div style={{color:"#F59E0B",fontSize:13,marginTop:2}}>{p.rating}</div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{maxWidth:680,margin:"0 auto"}}>
      {showAdmin && <AdminPicksModal onClose={()=>setShowAdmin(false)}/>}

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(0,168,255,0.08))",border:"1px solid rgba(124,58,237,0.2)",borderRadius:16,padding:"20px 24px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{background:"rgba(124,58,237,0.2)",color:"#A78BFA",border:"1px solid rgba(124,58,237,0.3)",borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:800,letterSpacing:0.5}}>✦ EXCLUSIVO VIP</span>
          <h2 style={{color:"#F1F5F9",fontWeight:900,fontSize:20,margin:"6px 0 2px"}}>Picks de la Semana</h2>
          <div style={{fontSize:12,color:"#64748B"}}>Actualizado: {semana}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
          <div style={{textAlign:"center",background:"rgba(0,0,0,0.3)",borderRadius:12,padding:"10px 16px"}}>
            <div style={{fontWeight:900,color:"#F1F5F9",fontSize:28}}>10</div>
            <div style={{fontSize:10,color:"#64748B",fontWeight:600}}>PICKS</div>
          </div>
          {isAdmin && <button onClick={()=>setShowAdmin(true)} style={{background:"rgba(0,168,255,0.15)",border:"1px solid rgba(0,168,255,0.3)",borderRadius:8,padding:"6px 12px",color:"#00A8FF",fontSize:11,fontWeight:700,cursor:"pointer"}}>✏️ Editar picks</button>}
        </div>
      </div>

      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"20px",marginBottom:16}}>
        <SectionTitle icon="⚡" title="Corto Plazo" sub="Horizonte 1-4 semanas · Momentum y técnico"/>
        {data.corto.map(p=><PickCard key={p.ticker} p={p}/>)}
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"20px",marginBottom:16}}>
        <SectionTitle icon="🏦" title="Largo Plazo" sub="Horizonte 6-18 meses · Valor y fundamentales"/>
        {data.largo.map(p=><PickCard key={p.ticker} p={p}/>)}
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"20px",marginBottom:16}}>
        <SectionTitle icon="💰" title="Dividendos" sub="Ingresos pasivos · Alta rentabilidad por dividendo"/>
        {data.dividendos.map(p=><DivCard key={p.ticker} p={p}/>)}
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"20px",marginBottom:16}}>
        <SectionTitle icon="₿" title="Crypto" sub="Alta volatilidad · Solo con capital que puedas perder"/>
        {data.crypto.map(p=><PickCard key={p.ticker} p={p}/>)}
      </div>

      <div style={{background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.15)",borderRadius:12,padding:"14px 18px",fontSize:11,color:"#94A3B8",lineHeight:1.7}}>
        ⚠️ <strong style={{color:"#F59E0B"}}>Disclaimer:</strong> Estos picks son análisis educativo y no constituyen consejo financiero. Siempre haz tu propia investigación (DYOR). Las inversiones conllevan riesgo de pérdida de capital.
      </div>
    </div>
  );
}

// ── NAV TABS ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = (t) => [
  {label:t.feed,idx:0},{label:t.tops,idx:1},
  {label:t.acciones,idx:3},
  {label:t.noticias,idx:5},{label:t.earnings,idx:6},{label:t.trending,idx:7},
  {label:"🛠️ Herramientas",idx:9,vip:true},
  {label:"✦ Premium",idx:8,premium:true},
];

// ── APP ROOT ──────────────────────────────────────────────────────────────────
// Leer sesión guardada de localStorage ANTES de renderizar (síncrono, sin flash)
const ADMIN_EMAILS_CONST = ['mariangat26@gmail.com','mariagalarraga2013@gmail.com'];
const _getAdminStatus = () => {
  try {
    // Intentar todos los métodos posibles para leer el email
    const keys = Object.keys(localStorage);
    for(const key of keys){
      try {
        const raw = localStorage.getItem(key);
        if(!raw || raw[0]!=='{') continue;
        const obj = JSON.parse(raw);
        const email = obj?.user?.email 
          || obj?.currentSession?.user?.email 
          || obj?.email || "";
        if(email && ADMIN_EMAILS_CONST.includes(email)) return true;
        // Decodificar JWT si existe access_token
        if(obj?.access_token){
          const payload = JSON.parse(atob(obj.access_token.split('.')[1]));
          if(ADMIN_EMAILS_CONST.includes(payload?.email||"")) return true;
        }
      } catch {}
    }
  } catch {}
  return false;
};
const _getSavedUser = () => {
  try { return JSON.parse(localStorage.getItem("nexotrade-user") || "null"); }
  catch { return null; }
};

export default function App(){
  const [posts,setPosts]       = useState(MOCK_POSTS);
  const [newPostId,setNewPostId]= useState(null);
  const [page,setPage]         = useState(0);
  const [sent,setSent]         = useState("all");
  const [auth,setAuth]         = useState(null);
  const [user,setUser]         = useState(_getSavedUser); // ← restaura al instante
  const [following,setFollow]  = useState([]);
  const ADMIN_EMAILS = ADMIN_EMAILS_CONST;
  const [isPremium,setIsPremium]= useState(
    _getAdminStatus() || (_getSavedUser()?.is_premium || false)
  );
  const [profUser,setProfUser] = useState(null);
  const [showAI,setShowAI]     = useState(false);
  const [showAlerts,setAlerts] = useState(false);
  const [lang,setLang]         = useState("es");
  const [toast,setToast]       = useState({show:false,points:0,reason:""});
  const [dbReady,setDbReady]   = useState(false);

  const t = LANGS[lang];

  // Helper: guardar/borrar usuario en localStorage + state
  const saveUser = useCallback((u) => {
    setUser(u);
    if(u) localStorage.setItem("nexotrade-user", JSON.stringify(u));
    else  localStorage.removeItem("nexotrade-user");
  }, []);

  // ── SUPABASE: Auth listener & session restore ──────────────────────────────
  const buildUserFromProfile = (supabaseUser, profile) => ({
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: profile?.username || supabaseUser.email?.split("@")[0] || "Usuario",
    emoji: profile?.avatar_emoji || "🦅",
    avatarColor: profile?.avatar_color || C.accent,
    followers: profile?.followers_count || 0,
    following: profile?.following_count || 0,
    posts: profile?.posts_count || 0,
    points: profile?.points || 100,
    badges: profile?.badges || ["early"],
    bio: profile?.bio || "",
    is_premium: profile?.is_premium || false,
  });

  useEffect(()=>{
    const {data:{subscription}}=supabase.auth.onAuthStateChange(async(event, session)=>{
      if(event==="SIGNED_OUT"){
        saveUser(null);
        setShowLanding(true);
        return;
      }
      if(session?.user && (event==="SIGNED_IN"||event==="TOKEN_REFRESHED"||event==="INITIAL_SESSION")){
        let {data:profile}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
        // Si no tiene perfil, lo creamos automáticamente
        if(!profile){
          const username = session.user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g,"").slice(0,20);
          const avatars = ["🦅","🐺","🦁","🐯","🦊","🐻","🦈","🦅","🐉","⚡"];
          const colors  = ["#00A8FF","#7C3AED","#00D26A","#F59E0B","#EF4444","#EC4899"];
          const {data:newProfile} = await supabase.from("profiles").insert({
            id: session.user.id,
            username,
            avatar_emoji: avatars[Math.floor(Math.random()*avatars.length)],
            avatar_color: colors[Math.floor(Math.random()*colors.length)],
            points: 100,
            badges: ["early"],
            is_premium: ADMIN_EMAILS.includes(session.user.email),
          }).select().single();
          profile = newProfile;
        }
        const isAdmin = ADMIN_EMAILS.includes(session.user.email);
        setIsPremium((profile?.is_premium || false) || isAdmin);
        if(profile){
          const u = buildUserFromProfile(session.user, profile);
          saveUser(u);
          setShowLanding(false);
        } else {
          setShowLanding(false);
        }
      }
    });
    return()=>subscription.unsubscribe();
  },[]);

  // ── SUPABASE: Cargar posts reales y suscripción realtime ──────────────────
  useEffect(()=>{
    let sub;
    const loadPosts=async()=>{
      try{
        const {data,error}=await supabase
          .from("posts")
          .select(`*, profiles(username,avatar_emoji,avatar_color,points)`)
          .order("created_at", {ascending:false})
          .limit(50);
        if(!error && data){
          if(data.length>0){
            const mapped=data.map(p=>({
              id:p.id,
              userId:p.user_id,
              user:p.profiles?.username||"Anónimo",
              avatar:p.profiles?.avatar_emoji||"🦅",
              avatarColor:p.profiles?.avatar_color||C.accent,
              time:fmtTimeAgo(p.created_at),
              ticker:p.ticker||"GENERAL",
              sentiment:p.sentiment||"bull",
              text:p.text,
              likes:p.likes_count||0,
              comments:p.comments_count||0,
              reposts:p.reposts_count||0,
              tags:p.tags||[p.ticker||"GENERAL"],
            }));
            setPosts(mapped);
          }
          setDbReady(true);
        }
      }catch(e){ /* fallback a MOCK_POSTS */ }
    };
    loadPosts();
    // Auto-refresh cada 60 segundos para mostrar posts nuevos de otros usuarios
    const refreshTimer=setInterval(loadPosts, 60000);

    // Suscripción realtime — nuevos posts aparecen al instante
    sub=supabase
      .channel("posts-realtime")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"posts"},async(payload)=>{
        const p=payload.new;
        const {data:profile}=await supabase.from("profiles").select("username,avatar_emoji,avatar_color,points").eq("id",p.user_id).single();
        const newPost={
          id:p.id,userId:p.user_id,
          user:profile?.username||"Anónimo",
          avatar:profile?.avatar_emoji||"🦅",
          avatarColor:profile?.avatar_color||C.accent,
          time:"ahora",ticker:p.ticker,sentiment:p.sentiment,
          text:p.text,likes:0,comments:0,reposts:0,tags:p.tags||[p.ticker],
        };
        setPosts(prev=>{
          // Si ya existe con ese UUID (confirmado desde addPost) → no duplicar
          if(prev.some(x=>x.id===newPost.id && x._confirmed)) return prev;
          // Si hay un post local pendiente del mismo usuario+texto → reemplazarlo
          const localIdx=prev.findIndex(x=>x.id?.startsWith("local-")&&x.text===newPost.text&&x.userId===newPost.userId);
          if(localIdx>=0){
            const updated=[...prev];
            updated[localIdx]={...updated[localIdx],...newPost,_confirmed:true};
            return updated;
          }
          // Post de otro usuario → agregar arriba
          if(prev.some(x=>x.id===newPost.id)) return prev;
          return [newPost,...prev];
        });
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"posts"},(payload)=>{
        const p=payload.new;
        setPosts(prev=>prev.map(x=>x.id===p.id?{...x,likes:p.likes_count,comments:p.comments_count}:x));
      })
      .subscribe();

    return()=>{ if(sub) supabase.removeChannel(sub); clearInterval(refreshTimer); };
  },[]);

  const showPoints = (pts, reason) => {
    setToast({show:true,points:pts,reason});
    setTimeout(()=>setToast({show:false,points:0,reason:""}),3000);
  };

  const toggleFollow = async(id) => {
    if(!user){setAuth("register");return;}
    const isFollowing=following.includes(id);
    setFollow(prev=>isFollowing?prev.filter(x=>x!==id):[...prev,id]);
    if(!isFollowing){
      showPoints(POINT_ACTIONS.follower,"¡Siguiendo!");
      // Guardar en BD si hay sesión
      if(user?.id && user.id!=="local"){
        await supabase.from("follows").insert({follower_id:user.id,following_id:id}).select();
      }
    }else{
      if(user?.id && user.id!=="local"){
        await supabase.from("follows").delete().eq("follower_id",user.id).eq("following_id",id);
      }
    }
  };

  const addPost = async({text,ticker,sentiment,image}) => {
    const localId = `local-${Date.now()}`;
    // 1. Mostrar el post INMEDIATAMENTE en la pantalla (optimista)
    const localPost={
      id:localId, userId:user?.id, user:user?.name||"Tú",
      avatar:user?.emoji||"🦅", avatarColor:user?.avatarColor||C.accent,
      time:"ahora", ticker, sentiment, text, image:image||null,
      likes:0, comments:0, reposts:0, tags:[ticker]
    };
    setPosts(prev=>[localPost,...prev]);
    setNewPostId(localId);
    setTimeout(()=>setNewPostId(null), 1500);
    showPoints(POINT_ACTIONS.post, lang==="en"?"Post published! 🎉":"¡Post publicado! 🎉");

    // 2. Guardar en Supabase
    if(user?.id && user.id!=="local"){
      try{
        const {data,error}=await supabase.from("posts").insert({
          user_id:user.id, text, ticker, sentiment, tags:[ticker],
          likes_count:0, comments_count:0, reposts_count:0
        }).select().single();

        if(!error && data){
          // 3. Reemplazar el post temporal con el real (con UUID de la BD)
          //    Marcamos el localId para que el canal realtime lo ignore
          setPosts(prev=>prev.map(p=>
            p.id===localId ? {...localPost, id:data.id, _confirmed:true} : p
          ));
          setNewPostId(data.id);
          setTimeout(()=>setNewPostId(null), 800);
        }
      }catch(e){
        // Si falla, el post local sigue visible pero marca como no guardado
        setPosts(prev=>prev.map(p=>p.id===localId?{...p,_failed:true}:p));
      }
    }
  };

  const filtered = sent==="all"?posts:posts.filter(p=>p.sentiment===sent);

  // VIP definitivo: admin emails siempre tienen acceso sin importar el state
  const effectivePremium = isPremium || ADMIN_EMAILS.includes(user?.email || '');

  const renderPage = () => {
    if(tickerPage) return <TickerPage ticker={tickerPage} posts={posts} onClose={()=>setTickerPage(null)} lang={lang} user={user} onPost={addPost} onNeedAuth={()=>setAuth("register")} isPremium={effectivePremium} onNeedPremium={()=>setPage(8)}/>;
    if(page===1) return <TopsPage posts={posts}/>;
    if(page===2||page===4) return(
      <div style={{textAlign:"center",padding:"60px 20px"}}>
        <div style={{fontSize:48,marginBottom:16}}>🚧</div>
        <h2 style={{color:C.text,fontWeight:800,marginBottom:8}}>{page===2?"Crypto":"Macro"}</h2>
        <p style={{color:C.muted,fontSize:15}}>Esta sección estará disponible muy pronto.<br/>Mientras tanto, explora el feed principal.</p>
        <button onClick={()=>setPage(0)} style={{marginTop:24,background:C.accent,color:"#fff",border:"none",borderRadius:10,padding:"10px 28px",fontWeight:700,fontSize:14,cursor:"pointer"}}>← Volver al Feed</button>
      </div>
    );
    if(page===3) return <AccionesVIPPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)} isAdmin={ADMIN_EMAILS.includes(user?.email||'')}/>;
    if(page===5) return <NoticiasPage lang={lang}/>;
    if(page===6) return <EarningsPage lang={lang}/>;
    if(page===7) return <TrendingPage posts={posts}/>;
    if(page===8) return <PremiumPage user={user} isPremium={effectivePremium} onSubscribe={()=>{}} onNeedAuth={()=>setAuth("login")} lang={lang}/>;
    if(page===9) return <VipToolsPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)} posts={posts} user={user}/>;
    return(
      <>
        {/* Tabs estilo Socimo */}
        <div style={{background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.09)",borderRadius:14,padding:"0 16px",marginBottom:12,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",display:"flex",gap:4,alignItems:"center"}}>
          {[["all",lang==="en"?"Home":"Inicio"],["bull",lang==="en"?"Bullish":"Alcistas"],["bear",lang==="en"?"Bearish":"Bajistas"]].map(([v,l])=>(
            <button key={v} onClick={()=>setSent(v)}
              style={{background:"transparent",border:"none",borderBottom:`2.5px solid ${sent===v?"#00A8FF":"transparent"}`,padding:"14px 18px",cursor:"pointer",color:sent===v?"#00A8FF":"#64748B",fontSize:14,fontWeight:sent===v?700:500,transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {l}
            </button>
          ))}
          {tickerFilter&&(
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,background:"rgba(0,168,255,0.08)",border:"1px solid rgba(0,168,255,0.25)",borderRadius:20,padding:"4px 12px"}}>
              <span style={{color:"#00A8FF",fontWeight:800,fontSize:12}}>${tickerFilter}</span>
              <button onClick={()=>setTickerFilter(null)} style={{background:"none",border:"none",color:"#94A3B8",cursor:"pointer",fontSize:13,lineHeight:1}}>✕</button>
            </div>
          )}
          <span style={{marginLeft:tickerFilter?"4px":"auto",color:"#94A3B8",fontSize:12,whiteSpace:"nowrap"}}>{filtered2.length} posts</span>
        </div>
        <NewPost user={user} onPost={addPost} onNeedAuth={()=>setAuth("register")} lang={lang}/>
        {/* Banner — solo aparece cuando el feed muestra posts de ejemplo (DB vacía) */}
        {showingMockData && dbReady && (
          <div style={{margin:"4px 0 12px",padding:"10px 14px",background:"rgba(0,168,255,0.06)",border:"1px dashed rgba(0,168,255,0.28)",borderRadius:10,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>💡</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:C.accentText}}>Posts de ejemplo</div>
              <div style={{fontSize:11,color:C.muted}}>¡Sé el primero en publicar algo real! Estos son ejemplos del feed.</div>
            </div>
          </div>
        )}
        {filtered2.map(p=><PostCard key={p.id} post={p} onProfile={setProfUser} onPoints={showPoints} onTickerClick={(tk)=>setTickerPage(tk)} lang={lang} isNew={p.id===newPostId}/>)}
      </>
    );
  };

  const [showLanding, setShowLanding] = useState(!_getSavedUser());
  const [darkMode, setDarkMode] = useState(false);
  const [tickerFilter, setTickerFilter] = useState(null);
  const [tickerPage,  setTickerPage]   = useState(null); // página completa de ticker (@META)

  // Light mode overrides
  const theme = darkMode ? {} : {
    "--bg":"#f0f4f8","--surface":"#ffffff","--card":"#ffffff",
    "--text":"#0f172a","--muted":"#64748b","--border":"#e2e8f0",
  };

  // Posts: el del usuario actual siempre primero, luego el resto por fecha desc
  const sortedPosts = [...posts].sort((a,b)=>{
    const aIsMe = user && (a.userId===user.id || a.user===user.name);
    const bIsMe = user && (b.userId===user.id || b.user===user.name);
    if(aIsMe && !bIsMe) return -1;
    if(!aIsMe && bIsMe) return 1;
    return 0;
  });
  const filteredByTicker = tickerFilter
    ? sortedPosts.filter(p => p.text?.toUpperCase().includes(`$${tickerFilter}`) || p.ticker===tickerFilter)
    : sortedPosts;
  const filtered2 = sent==="all" ? filteredByTicker : filteredByTicker.filter(p=>p.sentiment===sent);
  const showingMockData = posts === MOCK_POSTS; // true = Supabase no tiene posts reales aún

  return(
    <PriceProvider>
    <style>{`
      @media (min-width: 1024px) {
        .nexo-body-grid { grid-template-columns: 240px minmax(0,1fr) 280px !important; }
      }
      @media (min-width: 768px) and (max-width: 1023px) {
        .nexo-body-grid { grid-template-columns: minmax(0,1fr) 260px !important; }
        .nexo-left-sidebar { display: none !important; }
      }
      @media (max-width: 767px) {
        .nexo-sidebar { display: none !important; }
        .nexo-left-sidebar { display: none !important; }
        .nexo-nav-search { display: none !important; }
        .nexo-mobile-search { display: flex !important; }
        .nexo-body-grid { 
          padding: 8px !important; 
          gap: 10px !important;
          grid-template-columns: 1fr !important;
        }
        .nexo-nav-icons button { width: 34px !important; height: 34px !important; font-size: 15px !important; }
        .nexo-tabs { justify-content: flex-start !important; }
        .nexo-tabs button { padding: 10px 12px !important; font-size: 12px !important; }
        .nexo-hide-mobile { display: none !important; }
        .nexo-logout-mobile { display: flex !important; }
      }
      @media (min-width: 768px) {
        .nexo-logout-mobile { display: none !important; }
      }
      html {
        overflow-x: clip !important;
      }
      body {
        overflow-x: hidden !important;
        max-width: 100vw !important;
        overflow-y: auto !important;
      }
      @media (min-width: 768px) {
        .nexo-mobile-search { display: none !important; }
      }
      * { -webkit-font-smoothing: antialiased; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(0,168,255,0.2); border-radius: 4px; }
      @keyframes postSlideIn {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes postPulse {
        0%   { box-shadow: 0 0 0 0 rgba(0,168,255,0.18); }
        70%  { box-shadow: 0 0 0 8px rgba(0,168,255,0); }
        100% { box-shadow: 0 0 0 0 rgba(0,168,255,0); }
      }
      .post-card-new {
        animation: postSlideIn 0.38s cubic-bezier(0.22,1,0.36,1) both, postPulse 0.9s ease 0.35s;
      }
    `}</style>
    <div style={{minHeight:"100vh",background:C.bg,color:darkMode?C.text:"#0f172a",fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",transition:"background 0.3s,color 0.3s"}}>
      <TickerTape/>

      {/* NAVBAR — Estilo Socimo */}
      <nav style={{background:"#FFFFFF",borderBottom:"1px solid rgba(15,23,42,0.09)",padding:"0 12px",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px rgba(0,0,0,0.06)",width:"100%",boxSizing:"border-box"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,height:58,maxWidth:1200,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

          {/* Logo — integrado al navbar */}
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0,cursor:"pointer"}} onClick={()=>{setPage(0);setShowLanding(!user);}}>
            <img src="/logo_nexo.png" alt="NEXO TRADE"
              style={{height:54,width:"auto",objectFit:"contain",borderRadius:8,display:"block"}}
              onError={e=>{e.target.style.display="none";}}/>
            <div style={{display:"flex",flexDirection:"column",lineHeight:1.15}}>
              <span style={{fontWeight:900,fontSize:22,color:"#0F172A",letterSpacing:-0.5}}>NEXO<span style={{color:"#00A8FF"}}>TRADE</span></span>
              <span style={{fontSize:10,fontWeight:600,color:"#94A3B8",letterSpacing:1.5,textTransform:"uppercase"}}>AI Trading Community</span>
            </div>
          </div>

          {/* Search — centrado */}
          <div className="nexo-nav-search" style={{flex:1,display:"flex",justifyContent:"center",maxWidth:460,minWidth:0}}><SearchBar lang={lang} onTickerNav={(tk)=>{setTickerPage(tk);setShowLanding(false);}}/></div>

          {/* Right — iconos estilo Socimo */}
          <div className="nexo-nav-icons" style={{display:"flex",gap:4,alignItems:"center",flexShrink:0,marginLeft:"auto"}}>

            {/* Home */}
            <button onClick={()=>{setPage(0);setShowLanding(false);}}
              title="Inicio"
              style={{width:38,height:38,borderRadius:"50%",border:"1.5px solid rgba(0,168,255,0.3)",background:page===0?"rgba(0,168,255,0.1)":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#00A8FF",transition:"all 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.12)"}
              onMouseLeave={e=>e.currentTarget.style.background=page===0?"rgba(0,168,255,0.1)":"transparent"}>
              🏠
            </button>

            {/* IA */}
            <button onClick={()=>setShowAI(true)}
              title="IA de NexoTrade"
              style={{width:38,height:38,borderRadius:"50%",border:"1.5px solid rgba(0,168,255,0.3)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#00A8FF",transition:"all 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.12)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              🤖
            </button>

            {/* Alertas */}
            <button onClick={()=>setAlerts(true)}
              title="Alertas"
              style={{width:38,height:38,borderRadius:"50%",border:"1.5px solid rgba(0,168,255,0.3)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,position:"relative",transition:"all 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.12)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              🔔
              <span style={{position:"absolute",top:4,right:4,width:8,height:8,background:"#EF4444",borderRadius:"50%",border:"1.5px solid #fff"}}/>
            </button>

            {/* Settings / Dark mode */}
            <button className="nexo-hide-mobile" onClick={()=>setDarkMode(!darkMode)}
              title={darkMode?"Modo claro":"Modo oscuro"}
              style={{width:38,height:38,borderRadius:"50%",border:"1.5px solid rgba(0,168,255,0.3)",background:darkMode?"rgba(0,168,255,0.1)":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,transition:"all 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.12)"}
              onMouseLeave={e=>e.currentTarget.style.background=darkMode?"rgba(0,168,255,0.1)":"transparent"}>
              ⚙️
            </button>

            {/* Idioma */}
            <span className="nexo-hide-mobile"><LangSelector lang={lang} setLang={setLang}/></span>

            {/* Auth / User */}
            {user
              ? <UserMenu user={user} onLogout={async()=>{
  try{ await supabase.auth.signOut({scope:"global"}); }catch{}
  localStorage.clear();
  window.location.reload();
}} onProfile={setProfUser} onAlerts={()=>setAlerts(true)} lang={lang}/>
              : <><Btn variant="ghost" small onClick={()=>setAuth("login")}>{t.login}</Btn><Btn small onClick={()=>setAuth("register")}>{t.register}</Btn></>
            }
          </div>
        </div>
        {/* Tabs — bigger, professional */}
        <div className="nexo-tabs" style={{display:"flex",gap:0,borderTop:`1px solid ${C.border}`,overflowX:"auto",maxWidth:1180,margin:"0 auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          {NAV_ITEMS(t).map(n=>{
            if(n.premium){
              const active=page===n.idx;
              return(
                <button key={n.idx} onClick={()=>{setPage(n.idx);setShowLanding(false);setTickerFilter(null);}}
                  style={{background:active?"linear-gradient(135deg,#7C3AED,#9333EA)":"transparent",border:active?"none":"1px solid rgba(124,58,237,0.35)",borderBottom:"none",borderRadius:20,margin:"6px 6px 6px auto",padding:"6px 16px",cursor:"pointer",color:active?"#fff":"#A78BFA",fontSize:13,fontWeight:800,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5,letterSpacing:0.3,boxShadow:active?"0 0 18px rgba(124,58,237,0.4)":"none",transition:"all 0.2s"}}>
                  ✦ Premium
                </button>
              );
            }
            return(
              <button key={n.idx} onClick={()=>{setPage(n.idx);setShowLanding(false);setTickerFilter(null);}}
                style={{background:"transparent",border:"none",borderBottom:`2.5px solid ${page===n.idx?"#00A8FF":"transparent"}`,margin:"0",padding:"15px 24px",cursor:"pointer",color:page===n.idx?"#00A8FF":"#64748B",fontSize:15,fontWeight:page===n.idx?700:500,whiteSpace:"nowrap",transition:"all 0.18s",letterSpacing:0.1,display:"flex",alignItems:"center",gap:5}}
                onMouseEnter={e=>{if(page!==n.idx){e.currentTarget.style.color="#00A8FF";e.currentTarget.style.background="rgba(0,168,255,0.04)";}}}
                onMouseLeave={e=>{if(page!==n.idx){e.currentTarget.style.color="#64748B";e.currentTarget.style.background="transparent";}}}>
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* HERO LANDING */}
      {showLanding && page===0 && (
        <div style={{background:`linear-gradient(135deg,#0B1A2E 0%,#0D2244 50%,#0B1A2E 100%)`,borderBottom:`1px solid rgba(0,168,255,0.2)`,padding:"64px 20px 56px",overflow:"hidden"}}>
          <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:48,flexWrap:"wrap"}}>

            {/* LEFT — Text */}
            <div style={{flex:"1 1 400px",minWidth:300}}>
              {/* Badge */}
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,210,106,0.1)",border:`1px solid ${C.accent}33`,borderRadius:30,padding:"6px 16px",marginBottom:28}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:C.accent,display:"inline-block",boxShadow:`0 0 10px ${C.accent}`,animation:"pulse 2s infinite"}}/>
                <span style={{color:C.accent,fontSize:11,fontWeight:700,letterSpacing:1.2}}>TRADING SOCIAL CON IA</span>
              </div>
              {/* Headline */}
              <h1 style={{fontSize:"clamp(36px,5vw,64px)",fontWeight:900,letterSpacing:-2,lineHeight:1.05,margin:"0 0 18px",color:"#fff"}}>
                El futuro del<br/>
                <span style={{background:`linear-gradient(90deg,${C.accent} 0%,#3B8EFA 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>trading social</span>
              </h1>
              <p style={{fontSize:17,color:C.muted,lineHeight:1.75,margin:"0 0 36px",maxWidth:480,fontWeight:400}}>
                Analiza mercados, comparte ideas y aprende de los mejores traders — todo potenciado por IA en tiempo real.
              </p>
              {/* CTAs */}
              <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:40}}>
                <button onClick={()=>setAuth("register")}
                  style={{background:`linear-gradient(135deg,${C.accent},#00a060)`,border:"none",borderRadius:12,padding:"14px 30px",fontSize:15,fontWeight:800,color:"#000",cursor:"pointer",boxShadow:`0 0 32px ${C.accent}55`,letterSpacing:0.2}}>
                  Empezar Gratis →
                </button>
                <button onClick={()=>setShowLanding(false)}
                  style={{background:"rgba(255,255,255,0.05)",border:`1px solid rgba(255,255,255,0.15)`,borderRadius:12,padding:"14px 30px",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer",backdropFilter:"blur(8px)"}}>
                  Explorar Mercado
                </button>
              </div>
              {/* Social proof */}
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{display:"flex"}}>
                  {["#00D26A","#3B8EFA","#FFB800","#FF4D6A"].map((c,i)=>(
                    <div key={i} style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${c},${c}88)`,border:"2px solid #0B1020",marginLeft:i>0?-8:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff"}}>{["MC","SB","AT","FP"][i]}</div>
                  ))}
                </div>
                <span style={{fontSize:13,color:C.muted,fontWeight:500}}><strong style={{color:"#fff"}}>12,400+</strong> traders ya están dentro</span>
              </div>
            </div>

            {/* RIGHT — Chart Mockup */}
            <div style={{flex:"0 0 auto",position:"relative",width:380}}>
              {/* Main card */}
              <div style={{background:"rgba(19,26,46,0.9)",border:`1px solid rgba(0,210,106,0.2)`,borderRadius:20,padding:"20px 24px",backdropFilter:"blur(20px)",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
                {/* Header */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:C.accent,display:"inline-block",boxShadow:`0 0 8px ${C.accent}`}}/>
                    <span style={{fontSize:12,color:C.muted,fontWeight:600}}>En vivo</span>
                    <span style={{fontSize:11,color:C.muted2}}>/</span>
                    <span style={{fontSize:11,color:C.muted2,fontWeight:500}}>USD · 1D</span>
                  </div>
                  <span style={{fontSize:11,color:C.muted2,background:"rgba(255,255,255,0.05)",padding:"3px 8px",borderRadius:6}}>S&P 500</span>
                </div>
                {/* Price */}
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:38,fontWeight:900,color:"#fff",letterSpacing:-1,lineHeight:1}}>$68,420</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                    <span style={{fontSize:14,color:C.accent,fontWeight:700}}>▲ +4.2%</span>
                    <span style={{fontSize:13,color:C.muted,fontWeight:500}}>· +$2,761</span>
                  </div>
                </div>
                {/* Chart SVG */}
                <svg viewBox="0 0 330 70" style={{width:"100%",height:70,display:"block",marginBottom:8}}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D26A" stopOpacity="0.35"/>
                      <stop offset="100%" stopColor="#00D26A" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0 60 C20 55, 40 50, 60 45 S90 35, 110 30 S150 25, 170 22 S210 18, 240 15 S280 10, 330 5" fill="none" stroke="#00D26A" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M0 60 C20 55, 40 50, 60 45 S90 35, 110 30 S150 25, 170 22 S210 18, 240 15 S280 10, 330 5 L330 70 L0 70Z" fill="url(#chartGrad)"/>
                </svg>
                {/* Mini bars */}
                <div style={{display:"flex",gap:3,alignItems:"flex-end",height:16}}>
                  {[30,50,40,70,55,80,65,90,75,95,85,100].map((h,i)=>(
                    <div key={i} style={{flex:1,height:`${h*0.16}px`,borderRadius:2,background:i>7?C.accent:"rgba(0,210,106,0.3)"}}/>
                  ))}
                </div>
              </div>

              {/* Floating badge — NVDA */}
              <div style={{position:"absolute",top:-14,right:-14,background:"rgba(19,26,46,0.95)",border:`1px solid rgba(0,210,106,0.4)`,borderRadius:12,padding:"8px 14px",backdropFilter:"blur(12px)",boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
                <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:2}}>NVDA</div>
                <div style={{fontSize:16,fontWeight:900,color:C.accent}}>+2.8%</div>
              </div>

              {/* Floating badge — TSLA */}
              <div style={{position:"absolute",bottom:-14,left:-14,background:"rgba(19,26,46,0.95)",border:`1px solid rgba(255,77,106,0.4)`,borderRadius:12,padding:"8px 14px",backdropFilter:"blur(12px)",boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
                <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:2}}>TSLA</div>
                <div style={{fontSize:16,fontWeight:900,color:C.bear}}>-3.1%</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PREDICCIÓN DEL DÍA */}
      {page===0 && !showLanding && <PredictionBanner/>}

      {/* BODY — 3 columnas estilo Socimo */}
      <div className="nexo-body-grid" style={{maxWidth:1200,margin:"0 auto",padding:"12px 16px",display:"grid",gridTemplateColumns:"minmax(0,1fr)",gap:16,alignItems:"start",width:"100%",boxSizing:"border-box",overflowX:"hidden"}}>
        <div className="nexo-left-sidebar"><LeftSidebar user={user} onProfile={setProfUser} onNeedAuth={()=>setAuth("register")} lang={lang} onNavigate={(idx)=>{setPage(idx);setShowLanding(false);setTickerFilter(null);}} onLogout={async()=>{try{await supabase.auth.signOut({scope:"global"});}catch{}localStorage.clear();window.location.reload();}}/></div>
        <div>{renderPage()}</div>
        <div className="nexo-sidebar"><Sidebar user={user} following={following} onFollow={toggleFollow} onProfile={setProfUser} onNeedAuth={()=>setAuth("register")} onAI={()=>setShowAI(true)} lang={lang} posts={posts}/></div>
      </div>

      <Footer/>

      {/* LOGOUT MÓVIL — botón fijo en la esquina, solo en móvil */}
      {user && (
        <div className="nexo-logout-mobile" style={{
          position:"fixed",bottom:24,right:16,zIndex:999,display:"none",
          flexDirection:"column",alignItems:"flex-end",gap:8
        }}>
          <button
            onClick={async()=>{
              try{ await supabase.auth.signOut({scope:"global"}); }catch{}
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              background:"#FF4D6A",
              border:"none",
              borderRadius:50,
              padding:"12px 20px",
              color:"#fff",
              fontWeight:800,
              fontSize:14,
              cursor:"pointer",
              boxShadow:"0 4px 20px rgba(255,77,106,0.5)",
              display:"flex",
              alignItems:"center",
              gap:8,
            }}>
            🚪 Cerrar sesión
          </button>
        </div>
      )}

      {/* MODALS */}
      {auth&&<AuthModal mode={auth} onClose={()=>setAuth(null)} onAuth={(u)=>{saveUser(u);setShowLanding(false);setIsPremium(u.is_premium||false||ADMIN_EMAILS.includes(u.email||''));}} lang={lang}/>}
      {profUser&&<ProfilePage user={profUser} currentUser={user} isFollowing={following.includes(profUser.id)} onFollow={toggleFollow} onClose={()=>setProfUser(null)} lang={lang}/>}
      {showAI&&<AIAssistant lang={lang} onClose={()=>setShowAI(false)}/>}
      {showAlerts&&<AlertsPanel lang={lang} onClose={()=>setAlerts(false)}/>}
      <PointToast show={toast.show} points={toast.points} reason={toast.reason}/>
    </div>
    </PriceProvider>
  );
}
