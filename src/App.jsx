// NEXO TRADE — build: 2026-05-19 18:50:11
import { useState, useEffect, useRef, useContext, createContext } from 'react';

// ── CASHTAG RENDERER ──────────────────────────────────────────────────────────
function renderWithCashtags(text, onTickerClick){
  if(!text) return text;
  const parts = text.split(/(\$[A-Z]{1,5})/g);
  return parts.map((part, i) => {
    if(/^\$[A-Z]{1,5}$/.test(part)){
      return <span key={i} onClick={()=>onTickerClick&&onTickerClick(part.slice(1))}
        style={{color:"#00D26A",fontWeight:700,cursor:"pointer",background:"rgba(0,210,106,0.1)",borderRadius:4,padding:"0 3px",border:"1px solid rgba(0,210,106,0.25)",fontSize:"0.95em"}}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(0,210,106,0.2)"}
        onMouseLeave={e=>e.currentTarget.style.background="rgba(0,210,106,0.1)"}
      >{part}</span>;
    }
    return part;
  });
}

// ── THEME — Dark Luxury Fintech ───────────────────────────────────────────────
const C = {
  bg:"#0B1020", surface:"#131A2E", card:"#131A2E", card2:"#0F1525",
  border:"#1E2D45", borderHover:"#00D26A55",
  accent:"#00D26A", accentDim:"#00D26A12", accentText:"#00D26A",
  bull:"#00D26A", bullBg:"#00D26A15", bear:"#FF4D6A", bearBg:"#FF4D6A15",
  gold:"#FFB800", goldBg:"#FFB80015", purple:"#7C6EFA", purpleBg:"#7C6EFA15",
  blue:"#3B8EFA", blueBg:"#3B8EFA15", orange:"#FF8C42", orangeBg:"#FF8C4215",
  text:"#F0F4FF", muted:"#8899BB", muted2:"#5A6B8A",
  shadow:"0 2px 16px rgba(0,0,0,0.45)", shadowMd:"0 8px 40px rgba(0,0,0,0.6)",
  glass:"rgba(19,26,46,0.7)", glassBorder:"rgba(255,255,255,0.07)",
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
      <button onClick={()=>setOpen(!open)} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 11px",cursor:"pointer",fontSize:12,fontWeight:700,color:C.muted,display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:14}}>{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
        <span style={{fontSize:9,color:C.muted2}}>▾</span>
      </button>
      {open && (
        <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:6,zIndex:200,boxShadow:C.shadowMd,minWidth:155}}>
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
function SearchBar({lang}) {
  const t = LANGS[lang];
  const [q,setQ]=useState(""),[res,setRes]=useState(""),[foc,setFoc]=useState(false);
  const ref=useRef();
  useEffect(()=>{if(!q){setRes([]);return;}setRes(SEARCH_TICKERS.filter(x=>x.toLowerCase().includes(q.toLowerCase())).slice(0,6));},[q]);
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setFoc(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  return(
    <div ref={ref} style={{position:"relative",width:"100%",maxWidth:440}}>
      <div style={{display:"flex",alignItems:"center",gap:8,background:C.card2,border:`1.5px solid ${foc?C.accent:C.border}`,borderRadius:12,padding:"9px 14px",transition:"all 0.2s",boxShadow:foc?`0 0 0 3px ${C.accentDim}`:"none"}}>
        <span style={{fontSize:15}}>🔍</span>
        <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setFoc(true)} placeholder={t.search}
          style={{flex:1,background:"none",border:"none",outline:"none",color:C.text,fontSize:13,fontFamily:"inherit"}}/>
        {q&&<button onClick={()=>{setQ("");setRes([]);}} style={{background:"none",border:"none",cursor:"pointer",color:C.muted2,fontSize:18}}>×</button>}
      </div>
      {res.length>0&&foc&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:C.shadowMd,zIndex:200,overflow:"hidden"}}>
          {res.map(ticker=>{
            const tape=TAPE_ITEMS.find(x=>x.ticker===ticker);
            return(
              <div key={ticker} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.card2}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                onClick={()=>{setQ(ticker);setRes([]);setFoc(false);}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{background:C.accentDim,color:C.accentText,borderRadius:6,padding:"3px 8px",fontSize:12,fontWeight:800,fontFamily:"monospace"}}>${ticker}</span>
                  {tape?.earning&&<span style={{background:"#fffbeb",color:"#b45309",border:"1px solid #fcd34d",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>📅 EARN</span>}
                </div>
                {tape&&<span style={{color:chgCol(tape.change),fontWeight:700,fontSize:12,fontFamily:"monospace"}}>{fmtChg(tape.change)}</span>}
              </div>
            );
          })}
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

const inputSt={display:"block",width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:`1.5px solid ${C.glassBorder}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",margin:"6px 0 14px",backdropFilter:"blur(8px)"};

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
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",max_tokens:400,
          system:t.aiSys,
          messages:[{role:"user",content:userMsg}]
        })
      });
      const data=await res.json();
      const reply=data.content?.[0]?.text||t.aiErr;
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
  const submit=()=>{
    if(!email||!pass)return;
    onAuth({id:99,name:name||email.split("@")[0],emoji:avatar.emoji,avatarColor:avatar.color,followers:0,following:0,posts:0,points:100,badges:["early"],bio:"Nuevo en NexoTrade 🚀"});
    onClose();
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
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password" style={{...inputSt,marginBottom:24}}/>
        <Btn onClick={submit} style={{width:"100%",padding:"12px"}}>{tab==="login"?`${t.login} →`:`${t.join.replace("Únete a ","").replace("Join ","")} →`}</Btn>
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
const CONF_LEVELS=[{min:80,label:"Alta",col:C.bull},{min:60,label:"Media",col:C.gold},{min:0,label:"Baja",col:C.muted}];
function PostCard({post,onProfile,onPoints,onTickerClick,lang}){
  const [liked,setLiked]=useState(false),[likes,setLikes]=useState(post.likes),[repost,setRepost]=useState(false);
  const conf=55+Math.floor((post.id||1)%40);
  const confLevel=CONF_LEVELS.find(c=>conf>=c.min);
  const aiAgrees=conf>70;
  return(
    <div style={{background:"rgba(19,26,46,0.85)",border:`1px solid ${C.glassBorder}`,borderRadius:16,padding:"18px 20px",marginBottom:10,backdropFilter:"blur(12px)",transition:"all 0.2s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=`${C.accent}33`;e.currentTarget.style.boxShadow=`0 8px 40px rgba(0,0,0,0.4)`;e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.glassBorder;e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
        <div style={{cursor:"pointer"}} onClick={()=>{const u=MOCK_USERS.find(u=>u.name===post.user);if(u)onProfile(u);}}>
          <AvatarBubble emoji={post.avatar} color={post.avatarColor||C.accent} online={post.id%2===0}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
            <span style={{fontWeight:800,color:"#fff",fontSize:14,cursor:"pointer"}} onClick={()=>{const u=MOCK_USERS.find(u=>u.name===post.user);if(u)onProfile(u);}}>{post.user}</span>
            <TickerBadge ticker={post.ticker} sentiment={post.sentiment}/>
            <SentPill sentiment={post.sentiment} lang={lang}/>
            {aiAgrees&&<span style={{background:"rgba(124,110,250,0.15)",color:C.purple,border:`1px solid ${C.purple}44`,borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700}}>🧠 AI concuerda</span>}
            <span style={{color:C.muted2,fontSize:11,marginLeft:"auto"}}>{post.time}</span>
          </div>
          <p style={{margin:"0 0 10px",color:"#D0D8F0",fontSize:14,lineHeight:1.7}}>{renderWithCashtags(post.text, onTickerClick)}</p>
          {/* Confidence bar */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:10,color:C.muted2,fontWeight:600}}>Confianza:</span>
            <div style={{flex:1,height:3,background:C.card2,borderRadius:3,overflow:"hidden"}}>
              <div style={{width:`${conf}%`,height:"100%",background:`linear-gradient(90deg,${confLevel.col},${confLevel.col}88)`,borderRadius:3}}/>
            </div>
            <span style={{fontSize:10,color:confLevel.col,fontWeight:700}}>{conf}% {confLevel.label}</span>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {post.tags.map(t=><span key={t} style={{background:`${C.blue}15`,color:C.blue,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:600,border:`1px solid ${C.blue}22`}}>#{t}</span>)}
          </div>
          <div style={{display:"flex",gap:2}}>
            {[{icon:"♥",val:likes,active:liked,col:C.bear,fn:()=>{setLiked(!liked);setLikes(liked?likes-1:likes+1);if(!liked)onPoints(POINT_ACTIONS.like_received,"¡Like recibido!");}},
              {icon:"💬",val:post.comments,active:false,col:C.blue,fn:()=>{}},
              {icon:"↗",val:post.reposts,active:repost,col:C.bull,fn:()=>setRepost(!repost)}
            ].map(({icon,val,active,col,fn},i)=>(
              <button key={i} onClick={fn} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:active?col:C.muted2,fontSize:13,fontWeight:600,padding:"5px 10px",borderRadius:8}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color=col;}}
                onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=active?col:C.muted2;}}>
                <span style={{fontSize:15}}>{icon}</span><span>{val}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NEW POST ──────────────────────────────────────────────────────────────────
function NewPost({user,onPost,onNeedAuth,lang}){
  const t=LANGS[lang];
  const [text,setText]=useState(""),[ticker,setTicker]=useState(""),[sent,setSent]=useState("bull"),[modMsg,setModMsg]=useState("");
  const submit=()=>{
    if(!user){onNeedAuth();return;}
    if(!text.trim())return;
    const mod=moderateText(text);
    if(!mod.ok){setModMsg(t.modWarning);setTimeout(()=>setModMsg(""),4000);return;}
    onPost({text,ticker:ticker.toUpperCase()||"GENERAL",sentiment:sent});
    setText("");setTicker("");setModMsg("");
  };
  return(
    <div style={{background:"rgba(19,26,46,0.9)",border:`1px solid ${C.glassBorder}`,borderRadius:16,padding:"20px",marginBottom:20,backdropFilter:"blur(12px)"}}>
      {modMsg&&<div style={{background:`${C.bear}15`,border:`1px solid ${C.bear}44`,borderRadius:10,padding:"9px 14px",marginBottom:12,fontSize:13,color:C.bear}}>{modMsg}</div>}
      <div style={{display:"flex",gap:12}}>
        {user?<AvatarBubble emoji={user.emoji} color={user.avatarColor||C.accent} online level={user.points}/>:<div style={{width:40,height:40,borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:`2px solid ${C.glassBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👤</div>}
        <div style={{flex:1}}>
          {!user&&<div style={{background:C.accentDim,border:`1px solid ${C.accent}33`,borderRadius:10,padding:"9px 14px",marginBottom:12,fontSize:13,color:C.muted}}>
            <span style={{color:C.accent,fontWeight:700,cursor:"pointer"}}>{t.login}</span> {lang==="en"?"to share your analysis":"para compartir tu análisis"}
          </div>}
          {user&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <LevelBadge points={user.points} lang={lang}/>
            <span style={{color:C.muted2,fontSize:11}}>+{POINT_ACTIONS.post} pts por publicar</span>
          </div>}
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="¿Qué piensas del mercado? Usa $NVDA, $BTC... para mencionar activos"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1.5px solid ${C.glassBorder}`,borderRadius:10,color:"#fff",fontSize:14,padding:"12px",resize:"none",outline:"none",height:80,fontFamily:"inherit",lineHeight:1.6,boxSizing:"border-box"}}/>
          {/* Bullish / Bearish — prominente */}
          <div style={{display:"flex",gap:10,marginTop:12,marginBottom:12}}>
            {[
              {v:"bull",label:"▲ BULLISH",sub:"Mercado va a subir",col:C.bull},
              {v:"bear",label:"▼ BEARISH",sub:"Mercado va a bajar",col:C.bear},
            ].map(({v,label,sub,col})=>(
              <button key={v} onClick={()=>setSent(v)} style={{flex:1,background:sent===v?`${col}18`:"rgba(255,255,255,0.03)",border:`2px solid ${sent===v?col:C.glassBorder}`,borderRadius:12,padding:"10px",cursor:"pointer",textAlign:"center",transition:"all 0.15s",boxShadow:sent===v?`0 0 20px ${col}33`:"none"}}>
                <div style={{color:sent===v?col:C.muted,fontWeight:800,fontSize:13,letterSpacing:0.5}}>{label}</div>
                <div style={{color:C.muted2,fontSize:10,marginTop:2}}>{sub}</div>
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <input value={ticker} onChange={e=>setTicker(e.target.value)} placeholder="$TICKER"
              style={{background:"rgba(255,255,255,0.05)",border:`1.5px solid ${C.glassBorder}`,borderRadius:8,color:C.accent,padding:"8px 12px",fontSize:13,outline:"none",width:100,fontFamily:"monospace",textTransform:"uppercase",fontWeight:700}}/>
            <span style={{color:C.muted2,fontSize:12}}>Tip: escribe $NVDA en tu post para cashtag interactivo</span>
            <Btn onClick={submit} style={{marginLeft:"auto",padding:"9px 24px"}}>{user?t.publish:t.login}</Btn>
          </div>
        </div>
      </div>
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

function TopsPage(){
  const [tab,setTab]=useState("activas");
  const tabs=[["activas","🔥 Más Activas"],["ganadoras","📈 Ganadoras"],["perdedoras","📉 Perdedoras"]];
  return(
    <div>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{background:tab===k?C.accent:"transparent",border:`1.5px solid ${tab===k?C.accent:C.border}`,borderRadius:10,padding:"7px 14px",cursor:"pointer",color:tab===k?"#fff":C.muted,fontSize:12,fontWeight:700,whiteSpace:"nowrap",transition:"all 0.15s"}}>{l}</button>)}
      </div>
      {tab==="activas"&&<TopTable title="Top 5 Más Activas" icon="🔥" data={TOP_D.activas} cols={[{k:"ticker",label:"TICKER",mono:true,bold:true},{k:"name",label:"NOMBRE"},{k:"price",label:"PRECIO",render:r=>fmtPx(r.price),mono:true},{k:"change",label:"% DÍA",render:r=>fmtChg(r.change),col:r=>chgCol(r.change),mono:true,bold:true},{k:"mentions",label:"MENCIONES",render:r=>`💬 ${r.mentions.toLocaleString()}`,col:()=>C.purple}]}/>}
      {tab==="ganadoras"&&<TopTable title="Top 5 Ganadoras" icon="📈" data={TOP_D.ganadoras} cols={[{k:"ticker",label:"TICKER",mono:true,bold:true},{k:"name",label:"NOMBRE"},{k:"price",label:"PRECIO",render:r=>fmtPx(r.price),mono:true},{k:"change",label:"% HOY",render:r=>fmtChg(r.change),col:r=>chgCol(r.change),mono:true,bold:true},{k:"vol",label:"VOLUMEN",col:()=>C.muted}]}/>}
      {tab==="perdedoras"&&<TopTable title="Top 5 Perdedoras" icon="📉" data={TOP_D.perdedoras} cols={[{k:"ticker",label:"TICKER",mono:true,bold:true},{k:"name",label:"NOMBRE"},{k:"price",label:"PRECIO",render:r=>fmtPx(r.price),mono:true},{k:"change",label:"% HOY",render:r=>fmtChg(r.change),col:r=>chgCol(r.change),mono:true,bold:true},{k:"vol",label:"VOLUMEN",col:()=>C.muted}]}/>}
    </div>
  );
}

function NoticiasPage({lang}){
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>📰 {lang==="en"?"Market News":"Noticias del Mercado"}</h2>
        <span style={{background:"#fef2f2",color:C.bear,border:`1px solid ${C.bear}33`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>🔴 LIVE</span>
      </div>
      {MOCK_NOTICIAS.map(n=>(
        <div key={n.id} style={{background:C.surface,border:`1px solid ${n.urgente?C.bear+"44":C.border}`,borderRadius:14,padding:"16px 18px",marginBottom:12,boxShadow:C.shadow,borderLeft:`4px solid ${n.urgente?C.bear:C.accent}`,cursor:"pointer",transition:"box-shadow 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shadowMd}
          onMouseLeave={e=>e.currentTarget.style.boxShadow=C.shadow}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <span style={{fontSize:24}}>{n.emoji}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                {n.urgente&&<span style={{background:"#fef2f2",color:C.bear,borderRadius:4,padding:"1px 7px",fontSize:10,fontWeight:800}}>🔴 URGENTE</span>}
                <span style={{background:C.accentDim,color:C.accentText,borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:700,fontFamily:"monospace"}}>${n.ticker}</span>
                <span style={{color:C.muted2,fontSize:11}}>{n.fuente}</span>
                <span style={{color:C.muted2,fontSize:11,marginLeft:"auto"}}>{n.tiempo}</span>
              </div>
              <p style={{margin:0,color:C.text,fontSize:14,fontWeight:600,lineHeight:1.5}}>{lang==="en"?n.tituloEn:n.titulo}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EarningsPage({lang}){
  const [liveEvent,  setLiveEvent]  = useState(null);
  const [voted,      setVoted]      = useState({});
  const [votes,      setVotes]      = useState(
    Object.fromEntries(MOCK_EARNINGS.map(e=>[e.ticker, e.bull_pct]))
  );
  const [earnings,   setEarnings]   = useState(MOCK_EARNINGS); // empieza con mock, se reemplaza con datos reales
  const [loadingEar, setLoadingEar] = useState(true);

  // Fetch calendario real de Finnhub
  useEffect(()=>{
    const today = new Date();
    const from  = today.toISOString().slice(0,10);
    const to    = new Date(today.getTime() + 14*24*60*60*1000).toISOString().slice(0,10);
    fetch(`https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&token=${FINNHUB_KEY}`)
      .then(r=>r.json())
      .then(data=>{
        if(!data?.earningsCalendar?.length){ setLoadingEar(false); return; }
        // Filtrar solo compañías conocidas y con estimados
        const interesting = data.earningsCalendar
          .filter(e => e.epsEstimate != null || e.revenueEstimate != null)
          .slice(0,10)
          .map(e=>{
            const mock = MOCK_EARNINGS.find(m=>m.ticker===e.symbol)||{};
            const dateObj  = new Date(e.date+"T12:00:00");
            const todayStr = new Date().toISOString().slice(0,10);
            const isToday  = e.date === todayStr;
            const dayLabel = isToday ? "Hoy" : dateObj.toLocaleDateString(lang==="en"?"en-US":"es-ES",{weekday:"short",day:"numeric",month:"short"});
            const hora = e.hour==="bmo"?(lang==="en"?"Before open":"Antes apertura"):(lang==="en"?"After close":"Tras cierre");
            const revEst = e.revenueEstimate ? (e.revenueEstimate>=1e9?`$${(e.revenueEstimate/1e9).toFixed(1)}B`:`$${(e.revenueEstimate/1e6).toFixed(0)}M`) : mock.rev_est||"—";
            const epsEst = e.epsEstimate!=null ? `$${e.epsEstimate.toFixed(2)}` : mock.eps_est||"—";
            return {
              ticker:   e.symbol,
              nombre:   mock.nombre || e.symbol,
              fecha:    isToday?"Hoy":dayLabel,
              fechaEn:  isToday?"Today":dayLabel,
              hora,
              eps_est:  epsEst,
              rev_est:  revEst,
              sorpresa: e.epsActual!=null&&e.epsEstimate!=null ? (e.epsActual>=e.epsEstimate?`+${((e.epsActual-e.epsEstimate)/Math.abs(e.epsEstimate)*100).toFixed(0)}%`:`${((e.epsActual-e.epsEstimate)/Math.abs(e.epsEstimate)*100).toFixed(0)}%`) : mock.sorpresa||null,
              bull_pct:       mock.bull_pct||50,
              community_votes:mock.community_votes||0,
              live:           mock.live||false,
              live_viewers:   mock.live_viewers||0,
              live_title:     mock.live_title||`Q Earnings Call`,
              live_speaker:   mock.live_speaker||"",
            };
          });
        if(interesting.length > 0){
          setEarnings(interesting);
          setVotes(Object.fromEntries(interesting.map(e=>[e.ticker,e.bull_pct])));
        }
      })
      .catch(()=>{})
      .finally(()=>setLoadingEar(false));
  },[lang]);

  const vote = (ticker, dir) => {
    if(voted[ticker]) return;
    setVoted(v=>({...v,[ticker]:dir}));
    setVotes(v=>({...v,[ticker]: dir==="bull" ? Math.min(99,v[ticker]+1) : Math.max(1,v[ticker]-1)}));
  };

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>📅 Earnings Calendar</h2>
        <span style={{background:C.goldBg,color:"#b45309",border:"1px solid #fcd34d",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{lang==="en"?"This week":"Esta semana"}</span>
        {loadingEar
          ? <span style={{marginLeft:"auto",color:C.muted2,fontSize:11,display:"flex",alignItems:"center",gap:5}}>⏳ {lang==="en"?"Loading live data...":"Cargando datos reales..."}</span>
          : <span style={{marginLeft:"auto",color:C.bull,fontSize:11,fontWeight:700}}>🟢 {lang==="en"?"Live data":"Datos en vivo"}</span>
        }
      </div>

      {earnings.map(e=>{
        const bull = votes[e.ticker];
        const bear = 100 - bull;
        const isToday = e.fecha==="Hoy";
        const myVote = voted[e.ticker];
        return(
          <div key={e.ticker} style={{background:isToday?"#fffbeb":C.surface,border:`1px solid ${isToday?C.gold+"66":C.border}`,borderRadius:14,padding:"16px 20px",marginBottom:12,boxShadow:isToday?`0 0 0 2px ${C.gold}22,${C.shadow}`:C.shadow,transition:"box-shadow 0.2s"}}>
            {/* Row 1: ticker info */}
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:12}}>
              <span style={{background:C.accentDim,color:C.accentText,borderRadius:8,padding:"4px 11px",fontSize:14,fontWeight:800,fontFamily:"monospace"}}>${e.ticker}</span>
              <span style={{fontWeight:700,color:C.text,fontSize:14}}>{e.nombre}</span>
              {isToday
                ? <span style={{background:"#fef3c7",color:"#b45309",fontWeight:800,fontSize:12,padding:"3px 9px",borderRadius:20}}>🔥 {lang==="en"?"TODAY":"HOY"}</span>
                : <span style={{color:C.muted,fontSize:13}}>{lang==="en"?e.fechaEn:e.fecha}</span>
              }
              <span style={{color:C.muted2,fontSize:12,background:"#f1f5f9",padding:"2px 8px",borderRadius:6}}>{e.hora}</span>
              {e.live && (
                <button onClick={()=>setLiveEvent(e)} style={{marginLeft:4,display:"flex",alignItems:"center",gap:5,background:"#ef4444",border:"none",borderRadius:20,padding:"4px 12px",cursor:"pointer",color:"#fff",fontSize:11,fontWeight:800,animation:"pulse 1.5s infinite"}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:"#fff",display:"inline-block",boxShadow:"0 0 0 2px rgba(255,255,255,0.4)"}}/>
                  EN VIVO
                </button>
              )}
              <div style={{marginLeft:"auto",display:"flex",gap:14}}>
                <div style={{textAlign:"center"}}><div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:C.text}}>{e.eps_est}</div><div style={{fontSize:10,color:C.muted2}}>EPS est.</div></div>
                <div style={{textAlign:"center"}}><div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:C.text}}>{e.rev_est}</div><div style={{fontSize:10,color:C.muted2}}>Rev. est.</div></div>
                {e.sorpresa&&<div style={{textAlign:"center"}}><div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:C.bull}}>{e.sorpresa}</div><div style={{fontSize:10,color:C.muted2}}>{lang==="en"?"Surprise":"Sorpresa"}</div></div>}
              </div>
            </div>

            {/* Row 2: Sentiment gauge */}
            <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,marginBottom:6}}>
                <span style={{color:C.bull}}>▲ {lang==="en"?"Bullish":"Alcista"} {bull}%</span>
                <span style={{color:C.muted2,fontSize:11}}>💬 {e.community_votes.toLocaleString()} {lang==="en"?"votes":"votos"}</span>
                <span style={{color:C.bear}}>▼ {lang==="en"?"Bearish":"Bajista"} {bear}%</span>
              </div>
              <div style={{background:C.border,borderRadius:20,height:10,overflow:"hidden",display:"flex"}}>
                <div style={{width:`${bull}%`,background:`linear-gradient(90deg,${C.bull},#00e5b0)`,transition:"width 0.5s"}}/>
                <div style={{flex:1,background:`linear-gradient(90deg,#ff8080,${C.bear})`}}/>
              </div>
              {/* Vote buttons */}
              <div style={{display:"flex",gap:8,marginTop:8,justifyContent:"center"}}>
                <button onClick={()=>vote(e.ticker,"bull")} disabled={!!myVote} style={{flex:1,border:`1.5px solid ${myVote==="bull"?C.bull:C.border}`,background:myVote==="bull"?C.bullBg:"#fff",borderRadius:8,padding:"5px 0",cursor:myVote?"not-allowed":"pointer",color:myVote==="bull"?C.bull:C.muted,fontSize:12,fontWeight:700,transition:"all 0.15s"}}>
                  {myVote==="bull"?"✓ ":""}▲ {lang==="en"?"I'm bullish":"Soy alcista"}
                </button>
                <button onClick={()=>vote(e.ticker,"bear")} disabled={!!myVote} style={{flex:1,border:`1.5px solid ${myVote==="bear"?C.bear:C.border}`,background:myVote==="bear"?C.bearBg:"#fff",borderRadius:8,padding:"5px 0",cursor:myVote?"not-allowed":"pointer",color:myVote==="bear"?C.bear:C.muted,fontSize:12,fontWeight:700,transition:"all 0.15s"}}>
                  {myVote==="bear"?"✓ ":""}▼ {lang==="en"?"I'm bearish":"Soy bajista"}
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {liveEvent && <LiveConferenceModal event={liveEvent} lang={lang} onClose={()=>setLiveEvent(null)}/>}
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

function TrendingPage(){
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>🔥 Trending en NexoTrade</h2>
        <span style={{background:C.bearBg,color:C.bear,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>Últimas 24h</span>
      </div>
      {MOCK_TRENDING.map((t,i)=>(
        <div key={t.ticker} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 20px",marginBottom:12,boxShadow:C.shadow,display:"flex",alignItems:"center",gap:16,cursor:"pointer",transition:"box-shadow 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shadowMd}
          onMouseLeave={e=>e.currentTarget.style.boxShadow=C.shadow}>
          <span style={{color:i<3?C.gold:C.muted2,fontWeight:900,fontSize:i<3?22:16,width:30,textAlign:"center"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{background:C.accentDim,color:C.accentText,borderRadius:8,padding:"3px 10px",fontSize:14,fontWeight:800,fontFamily:"monospace"}}>${t.ticker}</span>
              <span style={{color:C.text,fontSize:14,fontWeight:600}}>{t.nombre}</span>
              <span style={{color:chgCol(t.change),fontWeight:700,fontSize:13,fontFamily:"monospace",marginLeft:"auto"}}>{fmtChg(t.change)}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{color:C.muted2,fontSize:12}}>💬 {t.mentions.toLocaleString()} menciones</span>
              <div style={{flex:1,background:C.border,borderRadius:20,height:6,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:20,width:`${t.sentiment}%`,background:t.sentiment>60?`linear-gradient(90deg,${C.bull},#00e5b0)`:t.sentiment>40?"#f59e0b":`linear-gradient(90deg,${C.bear},#ff8080)`}}/>
              </div>
              <span style={{color:t.sentiment>60?C.bull:t.sentiment>40?C.gold:C.bear,fontSize:12,fontWeight:700,width:40,textAlign:"right"}}>{t.sentiment}% 🐂</span>
            </div>
          </div>
        </div>
      ))}
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
  ];

  const PREMIUM_FEATURES = [
    {star:true, text:"★ Todo lo del plan Free"},
    {star:true, text:"★ Calculadora Sharpe Ratio"},
    {star:true, text:"★ Racha de ganancias + estadísticas"},
    {star:true, text:"★ Evolución del portafolio"},
    {star:true, text:"★ Calculadora riesgo/recompensa"},
    {star:true, text:"★ Alertas de precio personalizadas"},
    {star:true, text:"★ Alertas de noticias del día"},
    {star:true, text:"★ Bot IA de trading"},
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
    if(!email){ return; }
    onSubscribe();
    setSuccessMsg("¡Suscripción activada! Revisa tu email " + email + " para confirmar.");
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

        {/* Plans grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:28}}>
          {/* FREE PLAN */}
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:28,boxShadow:C.shadow}}>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:8}}>COMUNIDAD</div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:6}}>
                <span style={{fontSize:36,fontWeight:900,color:C.text}}>Gratis</span>
              </div>
              <p style={{color:C.accent,fontSize:12,fontWeight:700,margin:"0 0 4px"}}>Gratis para siempre</p>
              <p style={{color:C.muted,fontSize:13,margin:0,lineHeight:1.5}}>Empieza a invertir en comunidad sin costo.</p>
            </div>
            <div style={{marginBottom:24}}>
              {FREE_FEATURES.map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:i<FREE_FEATURES.length-1?`1px solid ${C.border}`:"none"}}>
                  <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{f.ok?"✅":"❌"}</span>
                  <span style={{fontSize:13,color:f.ok?C.text:C.muted2,lineHeight:1.4}}>{f.text}</span>
                </div>
              ))}
            </div>
            <button style={{width:"100%",background:C.card2,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"11px",fontSize:14,fontWeight:700,color:C.muted,cursor:"pointer"}}>{user?"Plan actual":"Empezar gratis"}</button>
          </div>

          {/* PREMIUM PLAN */}
          <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",border:`2px solid ${C.accent}55`,borderRadius:20,padding:28,boxShadow:`0 8px 32px ${C.accent}22`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:`radial-gradient(circle at 80% 20%,${C.accent}10,transparent 50%)`,pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <span style={{fontSize:12,fontWeight:700,color:C.accent,letterSpacing:1}}>⭐ VIP MEMBER</span>
                <span style={{background:C.gold+"33",color:C.gold,border:`1px solid ${C.gold}55`,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800}}>MÁS POPULAR</span>
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
                <span style={{fontSize:36,fontWeight:900,color:"#fff"}}>€{price}</span>
                <span style={{color:"#94a3b8",fontSize:14}}>/mes</span>
              </div>
              {billing==="yearly"&&<div style={{color:C.bull,fontSize:12,fontWeight:700,marginBottom:6}}>💰 Ahorras €{savings} al año</div>}
              <p style={{color:"#94a3b8",fontSize:13,margin:"0 0 20px",lineHeight:1.5}}>$9.99 / mes · cancela cuando quieras</p>
              <div style={{marginBottom:24}}>
                {PREMIUM_FEATURES.map((f,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:i<PREMIUM_FEATURES.length-1?"1px solid #1e293b":"none"}}>
                    <span style={{fontSize:14,flexShrink:0,marginTop:1}}>✅</span>
                    <span style={{fontSize:13,color:f.star?"#e2e8f0":"#94a3b8",fontWeight:f.star?600:400,lineHeight:1.4}}>{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Email input */}
              {!isPremium&&<>
                <div style={{marginBottom:10}}>
                  <label style={{color:"#94a3b8",fontSize:11,fontWeight:700,display:"block",marginBottom:6}}>📧 TU EMAIL PARA ALERTAS</label>
                  <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" type="email"
                    style={{width:"100%",boxSizing:"border-box",background:"#1e293b",border:`1px solid ${C.accent}44`,borderRadius:10,padding:"10px 14px",fontSize:13,outline:"none",color:"#e2e8f0",fontFamily:"inherit",marginBottom:10}}/>
                  <p style={{margin:"0 0 12px",color:"#64748b",fontSize:11,lineHeight:1.6}}>📬 Recibirás alertas de precio, earnings y señales directamente en tu email.</p>
                </div>
                <button onClick={handleSubscribe} style={{width:"100%",background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:12,padding:"13px",fontSize:14,fontWeight:800,color:"#fff",cursor:"pointer",boxShadow:`0 4px 16px ${C.accent}44`,transition:"opacity 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity="0.9"}
                  onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                  ⭐ Hazte VIP por $9.99/mes →
                </button>
                <p style={{margin:"10px 0 0",color:"#475569",fontSize:11,textAlign:"center"}}>💳 Pago seguro · Cancela cuando quieras · Sin permanencia</p>
              </>}
              {isPremium&&<div style={{background:C.bull+"22",border:`1px solid ${C.bull}44`,borderRadius:12,padding:"12px 16px",textAlign:"center",color:C.bull,fontWeight:700,fontSize:14}}>✅ Plan activo</div>}
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
function Sidebar({user,following,onFollow,onProfile,onNeedAuth,onAI,lang}){
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
  return(
    <div>
      {/* AI Widget */}
      <div style={{background:`linear-gradient(135deg,rgba(0,210,106,0.08),rgba(60,142,250,0.08))`,border:`1px solid ${C.accent}22`,borderRadius:16,padding:20,marginBottom:14,cursor:"pointer",boxShadow:`0 0 30px ${C.accent}11`,backdropFilter:"blur(12px)"}} onClick={onAI}
        onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 40px ${C.accent}22`}
        onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 0 30px ${C.accent}11`}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
          <div style={{width:40,height:40,borderRadius:12,background:`linear-gradient(135deg,${C.accent},#0099ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 0 16px ${C.accent}44`}}>🤖</div>
          <div><div style={{fontWeight:800,color:"#fff",fontSize:14}}>NexoTrade AI</div><div style={{color:C.bull,fontSize:11,display:"flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:C.bull,display:"inline-block",boxShadow:`0 0 6px ${C.bull}`}}/>Online</div></div>
        </div>
        <p style={{color:C.muted,fontSize:12,lineHeight:1.6,margin:"0 0 12px"}}>{lang==="en"?"Ask me about any stock, crypto or market analysis.":"Pregúntame sobre cualquier acción, crypto o análisis de mercado."}</p>
        <div style={{background:`linear-gradient(135deg,${C.accent},#00a060)`,borderRadius:10,padding:"9px 14px",textAlign:"center",color:"#000",fontSize:13,fontWeight:800,boxShadow:`0 4px 16px ${C.accent}44`}}>💬 {t.aiAssistant}</div>
      </div>
      {/* CTA */}
      {!user&&<div style={{background:"rgba(19,26,46,0.8)",border:`1px solid ${C.glassBorder}`,borderRadius:16,padding:20,marginBottom:14,textAlign:"center",backdropFilter:"blur(12px)"}}>
        <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${C.accent},#00a060)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#000",fontWeight:900,margin:"0 auto 12px",boxShadow:`0 0 20px ${C.accent}44`}}>N</div>
        <h3 style={{margin:"0 0 6px",color:"#fff",fontSize:15,fontWeight:800}}>{t.join}</h3>
        <p style={{margin:"0 0 6px",color:C.muted,fontSize:12,lineHeight:1.5}}>{t.tagline}</p>
        <p style={{margin:"0 0 14px",color:C.accent,fontSize:11,fontWeight:700}}>🎁 +100 pts de bienvenida · 🚀 Early Adopter</p>
        <Btn onClick={onNeedAuth} style={{width:"100%",padding:"10px"}}>{t.register}</Btn>
        <button onClick={onNeedAuth} style={{background:"none",border:"none",color:C.muted2,fontSize:12,cursor:"pointer",marginTop:8,fontFamily:"inherit"}}>{t.login}</button>
      </div>}
      {/* Markets */}
      <div style={{background:"rgba(19,26,46,0.8)",border:`1px solid ${C.glassBorder}`,borderRadius:16,padding:"16px 18px",marginBottom:14,backdropFilter:"blur(12px)"}}>
        <h3 style={{margin:"0 0 12px",color:"#fff",fontSize:13,fontWeight:800}}>{t.markets}</h3>
        {mini.map(m=>(
          <div key={m.ticker} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.glassBorder}`}}>
            <span style={{fontWeight:700,color:"#fff",fontFamily:"monospace",fontSize:13}}>${m.ticker}</span>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:C.muted2}}>{m.price}</div>
              <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:chgCol(m.change)}}>{fmtChg(m.change)}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Top Traders Rankings */}
      <div style={{background:"rgba(19,26,46,0.8)",border:`1px solid ${C.glassBorder}`,borderRadius:16,padding:"16px 18px",marginBottom:14,backdropFilter:"blur(12px)"}}>
        <h3 style={{margin:"0 0 14px",color:"#fff",fontSize:13,fontWeight:800}}>🏆 Top Traders del Día</h3>
        {[
          {name:"NvidiaChad",badge:"🐋",badgeName:"Whale",color:"#3B8EFA",pts:"+12.4%",emoji:"🟢"},
          {name:"CryptoWolf",badge:"🚀",badgeName:"Momentum King",color:C.accent,pts:"+8.7%",emoji:"🟢"},
          {name:"SPY_Trader",badge:"🧠",badgeName:"AI Hunter",color:C.purple,pts:"+6.2%",emoji:"🟢"},
        ].map((tr,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<2?`1px solid ${C.glassBorder}`:"none"}}>
            <span style={{color:C.muted2,fontSize:12,fontWeight:700,minWidth:16}}>#{i+1}</span>
            <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${tr.color}44,${tr.color}22)`,border:`1.5px solid ${tr.color}66`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{tr.badge}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:"#fff",fontSize:12}}>{tr.name}</div>
              <span style={{fontSize:9,color:tr.color,background:`${tr.color}15`,border:`1px solid ${tr.color}33`,borderRadius:10,padding:"1px 6px",fontWeight:700}}>{tr.badge} {tr.badgeName}</span>
            </div>
            <span style={{color:C.bull,fontSize:12,fontWeight:800,fontFamily:"monospace"}}>{tr.pts}</span>
          </div>
        ))}
      </div>
      {/* Top 5 */}
      <Top5Foristas user={user} following={following} onFollow={onFollow} onProfile={onProfile} lang={lang}/>
      {/* Seguir */}
      {(()=>{
        const sug=MOCK_USERS.filter(u=>u.id!==user?.id&&!following.includes(u.id)).slice(0,3);
        if(!sug.length)return null;
        return(
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 18px",marginBottom:16,boxShadow:C.shadow}}>
            <h3 style={{margin:"0 0 14px",color:C.text,fontSize:13,fontWeight:800}}>{t.whofollow}</h3>
            {sug.map(u=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{cursor:"pointer"}} onClick={()=>onProfile(u)}><AvatarBubble emoji={u.emoji} color={u.color} size={34}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:C.text,fontSize:13,cursor:"pointer"}} onClick={()=>onProfile(u)}>{u.name}</div>
                  <div style={{color:C.muted2,fontSize:11}}>{fmtNum(u.followers)} {t.followers}</div>
                </div>
                <Btn variant="follow" small onClick={()=>user?onFollow(u.id):onNeedAuth()}>{t.follow}</Btn>
              </div>
            ))}
          </div>
        );
      })()}
      <div style={{background:"rgba(255,184,0,0.06)",border:`1px solid ${C.gold}33`,borderRadius:12,padding:"12px 16px",color:C.gold,fontSize:11,lineHeight:1.7,backdropFilter:"blur(8px)"}}><strong>⚠️ {t.disclaimer}</strong></div>
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

// ── NAV TABS ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = (t) => [
  {label:t.feed,idx:0},{label:t.tops,idx:1},{label:t.crypto,idx:2},
  {label:t.acciones,idx:3},{label:t.macro,idx:4},
  {label:t.noticias,idx:5},{label:t.earnings,idx:6},{label:t.trending,idx:7},{label:"⭐ Premium",idx:8,special:true},
];

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App(){
  const [posts,setPosts]       = useState(MOCK_POSTS);
  const [page,setPage]         = useState(0);
  const [sent,setSent]         = useState("all");
  const [auth,setAuth]         = useState(null);
  const [user,setUser]         = useState(null);
  const [following,setFollow]  = useState([]);
  const [isPremium,setIsPremium]= useState(false);
  const [profUser,setProfUser] = useState(null);
  const [showAI,setShowAI]     = useState(false);
  const [showAlerts,setAlerts] = useState(false);
  const [lang,setLang]         = useState("es");
  const [toast,setToast]       = useState({show:false,points:0,reason:""});

  const t = LANGS[lang];

  const showPoints = (pts, reason) => {
    setToast({show:true,points:pts,reason});
    setTimeout(()=>setToast({show:false,points:0,reason:""}),3000);
  };

  const toggleFollow = (id) => {
    if(!user){setAuth("register");return;}
    setFollow(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
    if(!following.includes(id)) showPoints(POINT_ACTIONS.follower,"¡Nuevo seguidor!");
  };

  const addPost = ({text,ticker,sentiment}) => {
    setPosts(prev=>[{id:Date.now(),userId:user.id,user:user.name,avatar:user.emoji,avatarColor:user.avatarColor||C.accent,time:lang==="en"?"just now":"ahora",ticker,sentiment,text,likes:0,comments:0,reposts:0,tags:[ticker]},...prev]);
    showPoints(POINT_ACTIONS.post, lang==="en"?"Post published! 🎉":"¡Post publicado! 🎉");
  };

  const filtered = sent==="all"?posts:posts.filter(p=>p.sentiment===sent);

  const renderPage = () => {
    if(page===1) return <TopsPage/>;
    if(page===5) return <NoticiasPage lang={lang}/>;
    if(page===6) return <EarningsPage lang={lang}/>;
    if(page===7) return <TrendingPage/>;
    return(
      <>
        {/* Ticker filter banner */}
        {tickerFilter&&(
          <div style={{background:`${C.accent}12`,border:`1px solid ${C.accent}33`,borderRadius:12,padding:"10px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:C.accent,fontWeight:800,fontSize:14}}>${tickerFilter}</span>
            <span style={{color:C.muted,fontSize:13}}>— mostrando posts sobre este activo</span>
            <button onClick={()=>setTickerFilter(null)} style={{marginLeft:"auto",background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,padding:"4px 12px",color:C.muted,cursor:"pointer",fontSize:12}}>✕ Limpiar filtro</button>
          </div>
        )}
        <div style={{display:"flex",gap:7,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{color:C.muted2,fontSize:12,fontWeight:600}}>{lang==="en"?"Filter:":"Filtrar:"}</span>
          {[[`all`,t.filterAll],[`bull`,t.filterBull],[`bear`,t.filterBear]].map(([v,l])=>(
            <button key={v} onClick={()=>setSent(v)} style={{background:sent===v?(v==="bull"?"rgba(0,210,106,0.15)":v==="bear"?"rgba(255,77,106,0.15)":"rgba(0,210,106,0.1)"):"transparent",border:`1.5px solid ${sent===v?(v==="bull"?C.bull:v==="bear"?C.bear:C.accent)+"55":C.glassBorder}`,borderRadius:20,padding:"5px 14px",cursor:"pointer",color:sent===v?(v==="bull"?C.bull:v==="bear"?C.bear:C.accent):C.muted,fontSize:12,fontWeight:600,transition:"all 0.15s"}}>{l}</button>
          ))}
          <span style={{marginLeft:"auto",color:C.muted2,fontSize:12}}>{filtered2.length} {t.ideas}</span>
        </div>
        <NewPost user={user} onPost={addPost} onNeedAuth={()=>setAuth("register")} lang={lang}/>
        {filtered2.map(p=><PostCard key={p.id} post={p} onProfile={setProfUser} onPoints={showPoints} onTickerClick={(tk)=>setTickerFilter(tk)} lang={lang}/>)}
      </>
    );
  };

  const [showLanding, setShowLanding] = useState(!user);
  const [darkMode, setDarkMode] = useState(true);
  const [tickerFilter, setTickerFilter] = useState(null);

  // Light mode overrides
  const theme = darkMode ? {} : {
    "--bg":"#f0f4f8","--surface":"#ffffff","--card":"#ffffff",
    "--text":"#0f172a","--muted":"#64748b","--border":"#e2e8f0",
  };

  const filteredByTicker = tickerFilter
    ? posts.filter(p => p.text?.toUpperCase().includes(`$${tickerFilter}`) || p.ticker===tickerFilter)
    : posts;
  const filtered2 = sent==="all" ? filteredByTicker : filteredByTicker.filter(p=>p.sentiment===sent);

  return(
    <PriceProvider>
    <div style={{minHeight:"100vh",background:darkMode?C.bg:"#f0f4f8",color:darkMode?C.text:"#0f172a",fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",transition:"background 0.3s,color 0.3s"}}>
      <TickerTape/>

      {/* NAVBAR — Floating Glass */}
      <nav style={{background:"rgba(11,16,32,0.85)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`1px solid ${C.glassBorder}`,padding:"0 20px",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 30px rgba(0,0,0,0.5)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,height:62,maxWidth:1180,margin:"0 auto"}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginRight:8,flexShrink:0,cursor:"pointer"}} onClick={()=>{setPage(0);setShowLanding(!user);}}>
            <img src="/logo.png" alt="NEXO TRADE" style={{height:40,width:"auto",objectFit:"contain",filter:"drop-shadow(0 0 8px rgba(0,210,106,0.4))"}}
              onError={e=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
            <div style={{display:"none",width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${C.accent},#00a060)`,alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff"}}>N</div>
            <span style={{fontSize:9,fontWeight:800,color:C.accent,background:C.accentDim,padding:"2px 6px",borderRadius:4,letterSpacing:1,border:`1px solid ${C.accent}33`}}>BETA</span>
          </div>
          {/* Search */}
          <div style={{flex:1,display:"flex",justifyContent:"center"}}><SearchBar lang={lang}/></div>
          {/* Right controls */}
          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            {/* Light/Dark toggle */}
            <button onClick={()=>setDarkMode(!darkMode)} title={darkMode?"Modo claro":"Modo oscuro"}
              style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${C.glassBorder}`,borderRadius:10,padding:"7px 12px",cursor:"pointer",color:C.muted,fontSize:16,display:"flex",alignItems:"center",backdropFilter:"blur(8px)"}}>
              {darkMode?"☀️":"🌙"}
            </button>
            <button onClick={()=>setShowAI(true)} style={{background:`rgba(0,210,106,0.1)`,border:`1px solid ${C.accent}33`,borderRadius:10,padding:"7px 14px",cursor:"pointer",color:C.accent,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:6,backdropFilter:"blur(8px)"}}>
              🤖 IA
            </button>
            <LangSelector lang={lang} setLang={setLang}/>
            {user
              ? <UserMenu user={user} onLogout={()=>{setUser(null);setFollow([]);setShowLanding(true);}} onProfile={setProfUser} onAlerts={()=>setAlerts(true)} lang={lang}/>
              : <><Btn variant="ghost" small onClick={()=>setAuth("login")}>{t.login}</Btn><Btn small onClick={()=>setAuth("register")}>{t.register}</Btn></>
            }
          </div>
        </div>
        {/* Tabs — bigger, professional */}
        <div style={{display:"flex",gap:0,borderTop:`1px solid ${C.glassBorder}`,overflowX:"auto",maxWidth:1180,margin:"0 auto",scrollbarWidth:"none"}}>
          {NAV_ITEMS(t).map(n=>(
            <button key={n.idx} onClick={()=>{setPage(n.idx);setShowLanding(false);setTickerFilter(null);}}
              style={{background:n.special?(page===n.idx?`${C.gold}15`:"transparent"):"transparent",border:"none",borderBottom:n.special?"none":`2.5px solid ${page===n.idx?C.accent:"transparent"}`,borderRadius:n.special?20:0,margin:n.special?"6px 6px":"0",padding:n.special?"6px 18px":"12px 20px",cursor:"pointer",color:n.special?(page===n.idx?C.gold:`${C.gold}77`):page===n.idx?"#fff":C.muted,fontSize:14,fontWeight:page===n.idx?700:n.special?700:500,whiteSpace:"nowrap",transition:"all 0.2s",letterSpacing:0.2,display:"flex",alignItems:"center",gap:5}}
              onMouseEnter={e=>{if(page!==n.idx){e.currentTarget.style.color="#fff";e.currentTarget.style.background="rgba(255,255,255,0.04)";}}}
              onMouseLeave={e=>{if(page!==n.idx){e.currentTarget.style.color=n.special?`${C.gold}77`:C.muted;e.currentTarget.style.background="transparent";}}}>
              {n.label}
            </button>
          ))}
        </div>
      </nav>

      {/* HERO LANDING */}
      {showLanding && page===0 && (
        <div style={{background:`radial-gradient(ellipse at 20% 50%, rgba(0,210,106,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(60,142,250,0.08) 0%, transparent 60%), ${C.bg}`,borderBottom:`1px solid ${C.glassBorder}`,padding:"60px 20px 50px"}}>
          <div style={{maxWidth:900,margin:"0 auto",textAlign:"center"}}>
            {/* Badge */}
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,210,106,0.1)",border:`1px solid ${C.accent}33`,borderRadius:30,padding:"6px 16px",marginBottom:28}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:C.accent,display:"inline-block",boxShadow:`0 0 8px ${C.accent}`}}/>
              <span style={{color:C.accent,fontSize:12,fontWeight:700,letterSpacing:1}}>TRADING SOCIAL CON IA · EN VIVO</span>
            </div>
            {/* Headline */}
            <h1 style={{fontSize:"clamp(32px,5vw,60px)",fontWeight:900,letterSpacing:-1.5,lineHeight:1.1,margin:"0 0 20px",color:"#fff"}}>
              La comunidad inversora<br/>
              <span style={{background:`linear-gradient(90deg,${C.accent},#3B8EFA)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>hispana impulsada por IA</span>
            </h1>
            <p style={{fontSize:18,color:C.muted,lineHeight:1.7,margin:"0 auto 36px",maxWidth:560,fontWeight:400}}>Analiza mercados, comparte ideas y aprende de los mejores traders — todo potenciado por IA en tiempo real.</p>
            {/* CTAs */}
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:48}}>
              <button onClick={()=>setAuth("register")} style={{background:`linear-gradient(135deg,${C.accent},#00a060)`,border:"none",borderRadius:12,padding:"14px 32px",fontSize:15,fontWeight:800,color:"#000",cursor:"pointer",boxShadow:`0 0 30px ${C.accent}44`,letterSpacing:0.3}}>
                Empezar Gratis →
              </button>
              <button onClick={()=>setShowLanding(false)} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.glassBorder}`,borderRadius:12,padding:"14px 32px",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer",backdropFilter:"blur(8px)"}}>
                Explorar Mercado
              </button>
            </div>
            {/* Stats */}
            <div style={{display:"flex",gap:0,justifyContent:"center",flexWrap:"wrap",borderTop:`1px solid ${C.glassBorder}`,paddingTop:36}}>
              {[["12,400+","Traders activos"],["$2.4B","Volumen discutido"],["1.2M","Predicciones hechas"],["98%","Satisfacción"]].map(([num,label],i)=>(
                <div key={i} style={{padding:"0 36px",borderRight:i<3?`1px solid ${C.glassBorder}`:"none",textAlign:"center"}}>
                  <div style={{fontSize:28,fontWeight:900,color:"#fff",letterSpacing:-0.5}}>{num}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:4,fontWeight:500}}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PREDICCIÓN DEL DÍA */}
      {page===0 && !showLanding && <PredictionBanner/>}

      {/* BODY */}
      <div style={{maxWidth:1140,margin:"0 auto",padding:"24px 14px",display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
        <div>{renderPage()}</div>
        <Sidebar user={user} following={following} onFollow={toggleFollow} onProfile={setProfUser} onNeedAuth={()=>setAuth("register")} onAI={()=>setShowAI(true)} lang={lang}/>
      </div>

      <Footer/>

      {/* MODALS */}
      {auth&&<AuthModal mode={auth} onClose={()=>setAuth(null)} onAuth={(u)=>{setUser(u);setShowLanding(false);}} lang={lang}/>}
      {profUser&&<ProfilePage user={profUser} currentUser={user} isFollowing={following.includes(profUser.id)} onFollow={toggleFollow} onClose={()=>setProfUser(null)} lang={lang}/>}
      {showAI&&<AIAssistant lang={lang} onClose={()=>setShowAI(false)}/>}
      {showAlerts&&<AlertsPanel lang={lang} onClose={()=>setAlerts(false)}/>}
      <PointToast show={toast.show} points={toast.points} reason={toast.reason}/>
    </div>
    </PriceProvider>
  );
}
