// NEXO TRADE — build: 2026-05-28 22:35:06
import { useState, useEffect, useRef, useContext, createContext, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// ââ SUPABASE CLIENT âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// ââ STRIPE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// â VIP $9.99/mes â link activo
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/6oU00c6U24PDe4U3S5aR202";

// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// ð STRIPE LINKS â ACTUALIZAR AQUÃ cuando crees los productos
//    Instrucciones completas en: ACTIVAR_TODO.md
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const STRIPE_LINKS = {
  // ââ Suscripciones ââââââââââââââââââââââââââââââââââââââââââââââ
  vip:   "https://buy.stripe.com/6oU00c6U24PDe4U3S5aR202", // â activo $9.99/mes
  pro:   "https://buy.stripe.com/8x23co0vE2Hvgd29cpaR203",  // â activo $24.99/mes

  // ââ Webinars (sesiÃ³n Ãºnica) ââââââââââââââââââââââââââââââââââââ
  // Crear en: dashboard.stripe.com â Payment Links â + Create Link
  webinar1: "https://buy.stripe.com/bJe6oAcemeqdf8Y9cpaR204",    // â $29 â AnÃ¡lisis tÃ©cnico principiantes
  webinar2: "https://buy.stripe.com/3cI28k1zIci55yo0FTaR205",   // â $49 â Bitcoin on-chain
  webinar3: "https://buy.stripe.com/eVq6oAdiq0zn0e40FTaR206",   // â $29 â CÃ³mo leer earnings
  webinar4: "https://buy.stripe.com/5kQ28k6U26XLf8YgERaR207",   // â $79 â Opciones defensivas
  webinar5: "https://buy.stripe.com/fZu8wI92a6XLgd260daR208",   // â $49 â DeFi yield farming
  webinar6: "https://buy.stripe.com/3cI7sE4LU2Hvd0QcoBaR209",   // â $39 â Dividendos renta pasiva

  // ââ Cursos (acceso de por vida) ââââââââââââââââââââââââââââââââ
  curso1: "https://buy.stripe.com/00w00ca6edm90e4coBaR20a",   // â $39 â Trading desde cero
  curso2: "https://buy.stripe.com/28EaEQdiq81Pe4U1JXaR20b",  // â $69 â AnÃ¡lisis tÃ©cnico completo
  curso3: "https://buy.stripe.com/fZuaEQa6eci5gd24W9aR20c",  // â $99 â Crypto Masterclass
  curso4: "https://buy.stripe.com/aFa6oA0vEgyl1i8fANaR20d",  // â $79 â Opciones de A a Z
};

// Alias cortos (compatibilidad con cÃ³digo existente)
const STRIPE_PRO_LINK = STRIPE_LINKS.pro;


// ââ CASHTAG + @MENTION RENDERER âââââââââââââââââââââââââââââââââââââââââââââââ
function renderWithCashtags(text, onTickerClick, onMentionClick){
  if(!text) return text;
  // Detecta $TICKER (cashtag verde) y @TICKER (menciÃ³n oscura)
  const parts = text.split(/(\$[A-Z]{1,5}|@[A-Z0-9]{1,15})/g);
  return parts.map((part, i) => {
    if(/^\$[A-Z]{1,5}$/.test(part)){
      // Cashtag â verde brillante
      return <span key={i} onClick={()=>onTickerClick&&onTickerClick(part.slice(1))}
        style={{color:"#007A48",fontWeight:700,cursor:"pointer",background:"rgba(0,160,96,0.1)",borderRadius:4,padding:"1px 5px",border:"1px solid rgba(0,160,96,0.25)",fontSize:"0.9em",letterSpacing:0.3,fontFamily:"monospace"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,229,143,0.18)";e.currentTarget.style.boxShadow="0 0 8px rgba(0,229,143,0.3)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,229,143,0.1)";e.currentTarget.style.boxShadow="none";}}
      >{part}</span>;
    }
    if(/^@[A-Z0-9]{1,15}$/.test(part)){
      // @MenciÃ³n â chip azul, abre vista del ticker
      const sym = part.slice(1);
      return <span key={i} onClick={()=>onMentionClick&&onMentionClick(sym)}
        style={{color:"#3B82F6",fontWeight:700,cursor:"pointer",background:"rgba(59,130,246,0.1)",borderRadius:6,padding:"2px 8px",border:"1px solid rgba(59,130,246,0.3)",fontSize:"0.88em",letterSpacing:0.2,fontFamily:"monospace",display:"inline-block",transition:"all 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(59,130,246,0.2)";e.currentTarget.style.borderColor="rgba(59,130,246,0.55)";e.currentTarget.style.color="#60A5FA";e.currentTarget.style.boxShadow="0 0 8px rgba(59,130,246,0.2)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(59,130,246,0.1)";e.currentTarget.style.borderColor="rgba(59,130,246,0.3)";e.currentTarget.style.color="#3B82F6";e.currentTarget.style.boxShadow="none";}}
      >{part}</span>;
    }
    return part;
  });
}

// ââ THEME â Dark Luxury Fintech âââââââââââââââââââââââââââââââââââââââââââââââ
const C = {
  bg:"var(--c-bg)", surface:"var(--c-surface)", card:"var(--c-card)", card2:"var(--c-card2)",
  border:"var(--c-border)", borderHover:"rgba(0,168,255,0.4)",
  accent:"#00A8FF", accentDim:"rgba(0,168,255,0.09)", accentText:"#0090D4",
  bull:"#16A34A", bullBg:"rgba(22,163,74,0.09)", bear:"#DC2626", bearBg:"rgba(220,38,38,0.09)",
  gold:"#D97706", goldBg:"rgba(217,119,6,0.1)", purple:"#7C3AED", purpleBg:"rgba(124,58,237,0.08)",
  blue:"#00A8FF", blueBg:"rgba(0,168,255,0.08)", orange:"#EA580C", orangeBg:"rgba(234,88,12,0.08)",
  text:"var(--c-text)", muted:"var(--c-muted)", muted2:"var(--c-muted2)",
  shadow:"var(--c-shadow)", shadowMd:"var(--c-shadowMd)",
  shadowGlow:"0 0 24px rgba(0,168,255,0.12)", shadowGlowBlue:"0 0 24px rgba(0,168,255,0.1)",
  glass:"var(--c-glass)", glassBorder:"var(--c-glassBorder)",
  vip:"#7C3AED", vipGlow:"rgba(124,58,237,0.2)",
  nav:"var(--c-nav)",
};

// ââ LANGS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const LANG_META = [
  { code:"es", flag:"ðªð¸", label:"EspaÃ±ol"    },
  { code:"en", flag:"ðºð¸", label:"English"    },
  { code:"pt", flag:"ð§ð·", label:"PortuguÃªs"  },
  { code:"fr", flag:"ð«ð·", label:"FranÃ§ais"   },
  { code:"de", flag:"ð©ðª", label:"Deutsch"    },
  { code:"it", flag:"ð®ð¹", label:"Italiano"   },
  { code:"ja", flag:"ð¯ðµ", label:"æ¥æ¬èª"      },
];

const LANGS = {
  es: {
    feed:"ð¥ Feed", tops:"ð Tops", crypto:"â¿ Crypto", acciones:"ð Acciones",
    macro:"ð Macro", noticias:"ð° Noticias", earnings:"ð Earnings", trending:"ð¥ Trending",
    search:"Buscar ticker... AAPL, BTC, NVDA", login:"Entrar", register:"Registrarse â",
    publish:"Publicar â", bullish:"â² ALCISTA", bearish:"â¼ BAJISTA",
    followers:"Seguidores", following:"Siguiendo", points:"Puntos", posts:"Posts",
    follow:"+ Seguir", following_btn:"â Siguiendo", welcome:"Bienvenido de vuelta",
    join:"Ãnete a NexoTrade", tagline:"La comunidad inversora en espaÃ±ol",
    top5:"ð Top 5 Foristas", reputation:"Por puntos de reputaciÃ³n",
    markets:"ð¡ Mercados ahora", whofollow:"ð¥ A quiÃ©n seguir",
    aiAssistant:"ð¤ Asistente IA", askAI:"Pregunta al asistente IA...",
    alerts:"ð Mis Alertas", profile:"Mi Perfil", settings:"Ajustes", logout:"Cerrar sesiÃ³n",
    level:"Nivel", badge:"Insignia", rank:"Rango",
    filterAll:"Todos", filterBull:"â² Alcistas", filterBear:"â¼ Bajistas",
    ideas:"ideas", newPost:"Â¿QuÃ© opinas del mercado? Comparte tu anÃ¡lisis...",
    ticker:"Ticker (BTC...)", disclaimer:"â ï¸ Solo educativo. No es consejo financiero.",
    modWarning:"â ï¸ Tu mensaje fue moderado: contiene lenguaje no permitido o publicidad.",
    username:"Nombre de usuario", email:"Email", password:"ContraseÃ±a",
    chooseAvatar:"Elige tu avatar", yourPoints:"Tus puntos", ptsWelcome:"+100 pts de bienvenida",
    aiSys:"Eres la IA de NexoTrade, asistente financiero amigable. Respuestas concisas y educativas sobre acciones, crypto y mercados. MÃ¡ximo 3 pÃ¡rrafos. Siempre aÃ±ade disclaimer de que no es consejo financiero.",
    aiHello:"Â¡Hola! Soy la IA de NexoTrade ð¤ PregÃºntame sobre acciones, crypto o anÃ¡lisis de mercado.",
    aiQuick:["Analiza NVDA","Â¿QuÃ© es el P/E ratio?","Mejores dividendos","Outlook Bitcoin"],
    aiErr:"Lo siento, no pude conectarme. IntÃ©ntalo de nuevo.",
  },
  en: {
    feed:"ð¥ Feed", tops:"ð Tops", crypto:"â¿ Crypto", acciones:"ð Stocks",
    macro:"ð Macro", noticias:"ð° News", earnings:"ð Earnings", trending:"ð¥ Trending",
    search:"Search ticker... AAPL, BTC, NVDA", login:"Sign in", register:"Sign up â",
    publish:"Post â", bullish:"â² BULLISH", bearish:"â¼ BEARISH",
    followers:"Followers", following:"Following", points:"Points", posts:"Posts",
    follow:"+ Follow", following_btn:"â Following", welcome:"Welcome back",
    join:"Join NexoTrade", tagline:"The global investor community",
    top5:"ð Top 5 Members", reputation:"By reputation points",
    markets:"ð¡ Markets now", whofollow:"ð¥ Who to follow",
    aiAssistant:"ð¤ AI Assistant", askAI:"Ask the AI assistant...",
    alerts:"ð My Alerts", profile:"My Profile", settings:"Settings", logout:"Sign out",
    level:"Level", badge:"Badge", rank:"Rank",
    filterAll:"All", filterBull:"â² Bullish", filterBear:"â¼ Bearish",
    ideas:"ideas", newPost:"What do you think about the market? Share your analysis...",
    ticker:"Ticker (BTC...)", disclaimer:"â ï¸ Educational only. Not financial advice.",
    modWarning:"â ï¸ Your post was moderated: prohibited language or advertising detected.",
    username:"Username", email:"Email", password:"Password",
    chooseAvatar:"Choose your avatar", yourPoints:"Your points", ptsWelcome:"+100 welcome points",
    aiSys:"You are NexoTrade AI, a friendly financial assistant. Give concise educational answers about stocks, crypto and markets. Max 3 paragraphs. Always add a disclaimer that this is not financial advice.",
    aiHello:"Hi! I'm NexoTrade AI ð¤ Ask me anything about stocks, crypto or market analysis.",
    aiQuick:["Analyze NVDA","What is P/E ratio?","Best dividend stocks","Bitcoin outlook"],
    aiErr:"Sorry, I couldn't connect. Please try again.",
  },
  pt: {
    feed:"ð¥ Feed", tops:"ð Tops", crypto:"â¿ Crypto", acciones:"ð AÃ§Ãµes",
    macro:"ð Macro", noticias:"ð° NotÃ­cias", earnings:"ð Resultados", trending:"ð¥ Trending",
    search:"Buscar ticker... AAPL, BTC, NVDA", login:"Entrar", register:"Registrar â",
    publish:"Publicar â", bullish:"â² ALTA", bearish:"â¼ BAIXA",
    followers:"Seguidores", following:"Seguindo", points:"Pontos", posts:"Posts",
    follow:"+ Seguir", following_btn:"â Seguindo", welcome:"Bem-vindo de volta",
    join:"Junte-se Ã  NexoTrade", tagline:"A comunidade de investidores em portuguÃªs",
    top5:"ð Top 5 Membros", reputation:"Por pontos de reputaÃ§Ã£o",
    markets:"ð¡ Mercados agora", whofollow:"ð¥ Quem seguir",
    aiAssistant:"ð¤ Assistente IA", askAI:"Pergunte ao assistente IA...",
    alerts:"ð Meus Alertas", profile:"Meu Perfil", settings:"ConfiguraÃ§Ãµes", logout:"Sair",
    level:"NÃ­vel", badge:"Distintivo", rank:"PosiÃ§Ã£o",
    filterAll:"Todos", filterBull:"â² Alta", filterBear:"â¼ Baixa",
    ideas:"ideias", newPost:"O que acha do mercado? Compartilhe sua anÃ¡lise...",
    ticker:"Ticker (BTC...)", disclaimer:"â ï¸ Apenas educativo. NÃ£o Ã© conselho financeiro.",
    modWarning:"â ï¸ Sua mensagem foi moderada: contÃ©m linguagem proibida ou publicidade.",
    username:"Nome de usuÃ¡rio", email:"Email", password:"Senha",
    chooseAvatar:"Escolha seu avatar", yourPoints:"Seus pontos", ptsWelcome:"+100 pontos de boas-vindas",
    aiSys:"VocÃª Ã© a IA da NexoTrade, assistente financeiro amigÃ¡vel. Respostas concisas e educativas sobre aÃ§Ãµes, cripto e mercados. MÃ¡ximo 3 parÃ¡grafos. Sempre adicione disclaimer que nÃ£o Ã© conselho financeiro.",
    aiHello:"OlÃ¡! Sou a IA da NexoTrade ð¤ Pergunte sobre aÃ§Ãµes, cripto ou anÃ¡lise de mercado.",
    aiQuick:["Analisar NVDA","O que Ã© P/L?","Melhores dividendos","Perspectiva Bitcoin"],
    aiErr:"Desculpe, nÃ£o consegui conectar. Tente novamente.",
  },
  fr: {
    feed:"ð¥ Fil", tops:"ð Tops", crypto:"â¿ Crypto", acciones:"ð Actions",
    macro:"ð Macro", noticias:"ð° ActualitÃ©s", earnings:"ð RÃ©sultats", trending:"ð¥ Tendances",
    search:"Rechercher ticker... AAPL, BTC, NVDA", login:"Connexion", register:"S'inscrire â",
    publish:"Publier â", bullish:"â² HAUSSIER", bearish:"â¼ BAISSIER",
    followers:"AbonnÃ©s", following:"Abonnements", points:"Points", posts:"Posts",
    follow:"+ Suivre", following_btn:"â AbonnÃ©", welcome:"Bienvenue de retour",
    join:"Rejoindre NexoTrade", tagline:"La communautÃ© des investisseurs francophones",
    top5:"ð Top 5 Membres", reputation:"Par points de rÃ©putation",
    markets:"ð¡ MarchÃ©s maintenant", whofollow:"ð¥ Qui suivre",
    aiAssistant:"ð¤ Assistant IA", askAI:"Posez une question Ã  l'IA...",
    alerts:"ð Mes Alertes", profile:"Mon Profil", settings:"ParamÃ¨tres", logout:"DÃ©connexion",
    level:"Niveau", badge:"Badge", rank:"Classement",
    filterAll:"Tous", filterBull:"â² Haussier", filterBear:"â¼ Baissier",
    ideas:"idÃ©es", newPost:"Que pensez-vous du marchÃ©? Partagez votre analyse...",
    ticker:"Ticker (BTC...)", disclaimer:"â ï¸ Ãducatif uniquement. Pas de conseil financier.",
    modWarning:"â ï¸ Votre message a Ã©tÃ© modÃ©rÃ©: langage interdit ou publicitÃ© dÃ©tectÃ©e.",
    username:"Nom d'utilisateur", email:"Email", password:"Mot de passe",
    chooseAvatar:"Choisissez votre avatar", yourPoints:"Vos points", ptsWelcome:"+100 points de bienvenue",
    aiSys:"Vous Ãªtes l'IA de NexoTrade, assistant financier sympathique. RÃ©ponses concises et Ã©ducatives sur les actions, crypto et marchÃ©s. Maximum 3 paragraphes. Ajoutez toujours un avertissement que ce n'est pas un conseil financier.",
    aiHello:"Bonjour! Je suis l'IA NexoTrade ð¤ Posez-moi des questions sur les actions, crypto ou l'analyse de marchÃ©.",
    aiQuick:["Analyser NVDA","Qu'est-ce que le P/E?","Meilleurs dividendes","Perspective Bitcoin"],
    aiErr:"DÃ©solÃ©, je n'ai pas pu me connecter. RÃ©essayez.",
  },
  de: {
    feed:"ð¥ Feed", tops:"ð Tops", crypto:"â¿ Krypto", acciones:"ð Aktien",
    macro:"ð Makro", noticias:"ð° Nachrichten", earnings:"ð Ergebnisse", trending:"ð¥ Trending",
    search:"Ticker suchen... AAPL, BTC, NVDA", login:"Anmelden", register:"Registrieren â",
    publish:"VerÃ¶ffentlichen â", bullish:"â² BULLISH", bearish:"â¼ BEARISH",
    followers:"Follower", following:"Folge ich", points:"Punkte", posts:"BeitrÃ¤ge",
    follow:"+ Folgen", following_btn:"â Gefolgt", welcome:"Willkommen zurÃ¼ck",
    join:"NexoTrade beitreten", tagline:"Die Investoren-Community auf Deutsch",
    top5:"ð Top 5 Mitglieder", reputation:"Nach Reputationspunkten",
    markets:"ð¡ MÃ¤rkte jetzt", whofollow:"ð¥ Wem folgen",
    aiAssistant:"ð¤ KI-Assistent", askAI:"KI-Assistent fragen...",
    alerts:"ð Meine Alarme", profile:"Mein Profil", settings:"Einstellungen", logout:"Abmelden",
    level:"Level", badge:"Abzeichen", rank:"Rang",
    filterAll:"Alle", filterBull:"â² Bullish", filterBear:"â¼ Bearish",
    ideas:"Ideen", newPost:"Was denken Sie Ã¼ber den Markt? Teilen Sie Ihre Analyse...",
    ticker:"Ticker (BTC...)", disclaimer:"â ï¸ Nur zur Bildung. Keine Finanzberatung.",
    modWarning:"â ï¸ Ihr Beitrag wurde moderiert: verbotene Sprache oder Werbung erkannt.",
    username:"Benutzername", email:"E-Mail", password:"Passwort",
    chooseAvatar:"WÃ¤hlen Sie Ihren Avatar", yourPoints:"Ihre Punkte", ptsWelcome:"+100 Willkommenspunkte",
    aiSys:"Sie sind die NexoTrade-KI, ein freundlicher Finanzassistent. Geben Sie prÃ¤gnante und lehrreiche Antworten zu Aktien, Krypto und MÃ¤rkten. Maximal 3 AbsÃ¤tze. FÃ¼gen Sie immer einen Haftungsausschluss hinzu, dass dies keine Finanzberatung ist.",
    aiHello:"Hallo! Ich bin die NexoTrade KI ð¤ Fragen Sie mich zu Aktien, Krypto oder Marktanalyse.",
    aiQuick:["NVDA analysieren","Was ist das KGV?","Beste Dividenden","Bitcoin Ausblick"],
    aiErr:"Entschuldigung, keine Verbindung. Bitte erneut versuchen.",
  },
  it: {
    feed:"ð¥ Feed", tops:"ð Top", crypto:"â¿ Crypto", acciones:"ð Azioni",
    macro:"ð Macro", noticias:"ð° Notizie", earnings:"ð Risultati", trending:"ð¥ Tendenze",
    search:"Cerca ticker... AAPL, BTC, NVDA", login:"Accedi", register:"Registrati â",
    publish:"Pubblica â", bullish:"â² RIALZISTA", bearish:"â¼ RIBASSISTA",
    followers:"Follower", following:"Seguiti", points:"Punti", posts:"Post",
    follow:"+ Segui", following_btn:"â Seguito", welcome:"Bentornato",
    join:"Unisciti a NexoTrade", tagline:"La comunitÃ  degli investitori italiani",
    top5:"ð Top 5 Membri", reputation:"Per punti reputazione",
    markets:"ð¡ Mercati ora", whofollow:"ð¥ Chi seguire",
    aiAssistant:"ð¤ Assistente IA", askAI:"Chiedi all'assistente IA...",
    alerts:"ð I miei Avvisi", profile:"Il mio Profilo", settings:"Impostazioni", logout:"Esci",
    level:"Livello", badge:"Distintivo", rank:"Classifica",
    filterAll:"Tutti", filterBull:"â² Rialzista", filterBear:"â¼ Ribassista",
    ideas:"idee", newPost:"Cosa pensi del mercato? Condividi la tua analisi...",
    ticker:"Ticker (BTC...)", disclaimer:"â ï¸ Solo educativo. Non Ã¨ consulenza finanziaria.",
    modWarning:"â ï¸ Il tuo post Ã¨ stato moderato: linguaggio vietato o pubblicitÃ  rilevata.",
    username:"Nome utente", email:"Email", password:"Password",
    chooseAvatar:"Scegli il tuo avatar", yourPoints:"I tuoi punti", ptsWelcome:"+100 punti di benvenuto",
    aiSys:"Sei l'IA di NexoTrade, assistente finanziario amichevole. Risposte concise ed educative su azioni, crypto e mercati. Massimo 3 paragrafi. Aggiungi sempre un disclaimer che non Ã¨ consulenza finanziaria.",
    aiHello:"Ciao! Sono l'IA di NexoTrade ð¤ Chiedimi di azioni, crypto o analisi di mercato.",
    aiQuick:["Analizza NVDA","Cos'Ã¨ il P/E?","Migliori dividendi","Prospettive Bitcoin"],
    aiErr:"Spiacente, connessione fallita. Riprova.",
  },
  ja: {
    feed:"ð¥ ãã£ã¼ã", tops:"ð ããã", crypto:"â¿ ä»®æ³éè²¨", acciones:"ð æ ªå¼",
    macro:"ð ãã¯ã­", noticias:"ð° ãã¥ã¼ã¹", earnings:"ð æ±ºç®", trending:"ð¥ ãã¬ã³ã",
    search:"ãã£ãã«ã¼æ¤ç´¢... AAPL, BTC, NVDA", login:"ã­ã°ã¤ã³", register:"ç»é² â",
    publish:"æç¨¿ â", bullish:"â² å¼·æ°", bearish:"â¼ å¼±æ°",
    followers:"ãã©ã­ã¯ã¼", following:"ãã©ã­ã¼ä¸­", points:"ãã¤ã³ã", posts:"æç¨¿",
    follow:"+ ãã©ã­ã¼", following_btn:"â ãã©ã­ã¼ä¸­", welcome:"ãããããªãã",
    join:"NexoTradeã«åå ", tagline:"ã°ã­ã¼ãã«æè³å®¶ã³ãã¥ããã£",
    top5:"ð ããã5ã¡ã³ãã¼", reputation:"è©ä¾¡ãã¤ã³ãé ",
    markets:"ð¡ ãã¼ã±ãã", whofollow:"ð¥ ãã©ã­ã¼ãã¹ãäºº",
    aiAssistant:"ð¤ AIã¢ã·ã¹ã¿ã³ã", askAI:"AIã«è³ªåãã...",
    alerts:"ð ãã¤ã¢ã©ã¼ã", profile:"ãã¤ãã­ãã£ã¼ã«", settings:"è¨­å®", logout:"ã­ã°ã¢ã¦ã",
    level:"ã¬ãã«", badge:"ããã¸", rank:"ã©ã³ã¯",
    filterAll:"ãã¹ã¦", filterBull:"â² å¼·æ°", filterBear:"â¼ å¼±æ°",
    ideas:"æç¨¿", newPost:"å¸å ´ã«ã¤ãã¦ã©ãæãã¾ããï¼åæãå±æãã¦ãã ãã...",
    ticker:"ãã£ãã«ã¼ (BTC...)", disclaimer:"â ï¸ æè²ç®çã®ã¿ãæè³ã¢ããã¤ã¹ã§ã¯ããã¾ããã",
    modWarning:"â ï¸ æç¨¿ãã¢ãã¬ã¼ãããã¾ããï¼ç¦æ­¢ãããè¨èªã¾ãã¯åºåãæ¤åºããã¾ããã",
    username:"ã¦ã¼ã¶ã¼å", email:"ã¡ã¼ã«", password:"ãã¹ã¯ã¼ã",
    chooseAvatar:"ã¢ãã¿ã¼ãé¸æ", yourPoints:"ããªãã®ãã¤ã³ã", ptsWelcome:"ãããã+100ãã¤ã³ã",
    aiSys:"ããªãã¯NexoTradeã®AIã§ããæ ªå¼ãæå·éè²¨ãå¸å ´åæã«ã¤ãã¦ã®ç°¡æ½ã§æè²çãªåç­ãæä¾ãã¦ãã ãããæå¤§3æ®µè½ãããã¯æè³ã¢ããã¤ã¹ã§ã¯ãªãã¨ããåè²¬äºé ãå¿ãè¿½å ãã¦ãã ããã",
    aiHello:"ããã«ã¡ã¯ï¼NexoTrade AIã§ã ð¤ æ ªå¼ãä»®æ³éè²¨ãå¸å ´åæã«ã¤ãã¦è³ªåãã¦ãã ããã",
    aiQuick:["NVDAãåæ","P/Eã¨ã¯ï¼","é«éå½æ ª","ãããã³ã¤ã³è¦éã"],
    aiErr:"æ¥ç¶ã§ãã¾ããã§ãããããä¸åº¦ãè©¦ããã ããã",
  },
};

// ââ GAMIFICATION ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const LEVELS = [
  { min:0,     max:499,   name:"Novato",      nameEn:"Rookie",    emoji:"ð±", color:"#94a3b8" },
  { min:500,   max:1499,  name:"Analista",    nameEn:"Analyst",   emoji:"ð", color:"#3b82f6" },
  { min:1500,  max:3999,  name:"Trader",      nameEn:"Trader",    emoji:"ð", color:"#8b5cf6" },
  { min:4000,  max:9999,  name:"Experto",     nameEn:"Expert",    emoji:"â¡", color:"#f59e0b" },
  { min:10000, max:99999, name:"Leyenda",     nameEn:"Legend",    emoji:"ð", color:"#ef4444" },
];
const BADGES = [
  { id:"first_post",  emoji:"âï¸",  name:"Primera Idea",   nameEn:"First Post",    desc:"Publicaste tu primer anÃ¡lisis", pts:50  },
  { id:"bull_10",     emoji:"ð",  name:"Bull Streak",    nameEn:"Bull Streak",   desc:"10 anÃ¡lisis alcistas acertados", pts:200 },
  { id:"top5",        emoji:"ð",  name:"Top 5",          nameEn:"Top 5",         desc:"Entraste al Top 5 foristas", pts:500 },
  { id:"verified",    emoji:"â",  name:"Verificado",     nameEn:"Verified",      desc:"Perfil verificado", pts:0   },
  { id:"100likes",    emoji:"â¤ï¸",  name:"100 Likes",      nameEn:"100 Likes",     desc:"Tus posts recibieron 100 likes", pts:300 },
  { id:"early",       emoji:"ð",  name:"Early Adopter",  nameEn:"Early Adopter", desc:"Te uniste en la Beta", pts:100 },
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

// ââ MODERATION ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const BAD_WORDS = ["puta","mierda","coÃ±o","joder","hostia","gilipollas","idiota","imbecil","estupido","cabrÃ³n","polla","culo","fuck","shit","ass","bitch","damn"];
const AD_WORDS  = ["compra ahora","click aquÃ­","gana dinero fÃ¡cil","oferta limitada","promo","gratis si","bit.ly","tinyurl","t.me/","@gmail","whatsapp","telegram.me"];

const moderateText = (text) => {
  const lower = text.toLowerCase();
  for (const w of BAD_WORDS) { if (lower.includes(w)) return { ok:false, reason:"obscene" }; }
  for (const w of AD_WORDS)  { if (lower.includes(w)) return { ok:false, reason:"ad" }; }
  return { ok:true };
};

// ââ DATA ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const TAPE_ITEMS = [
  {ticker:"NVDA",price:"$131.50",change:+1.2,earning:false},{ticker:"BTC",price:"$95,200",change:+1.8,earning:false},
  {ticker:"TSLA",price:"$338.50",change:-1.1,earning:false},{ticker:"AAPL",price:"$207.20",change:-0.3,earning:false},
  {ticker:"SPY",price:"$582.40",change:-0.2,earning:false},{ticker:"MSFT",price:"$448.20",change:+0.9,earning:false},
  {ticker:"ETH",price:"$2,100",change:+0.9,earning:false},{ticker:"AMZN",price:"$225.80",change:+0.6,earning:false},
  {ticker:"SMCI",price:"$950.20",change:+18.4,earning:true},{ticker:"META",price:"$512.80",change:+2.1,earning:true},
  {ticker:"COIN",price:"$248.90",change:+7.3,earning:false},{ticker:"PLTR",price:"$24.80",change:+6.1,earning:false},
  {ticker:"AMD",price:"$168.30",change:+3.2,earning:false},{ticker:"GOOGL",price:"$172.50",change:+0.6,earning:true},
];
const MOCK_USERS = [
  {id:1,name:"NvidiaChad",    emoji:"ð¢",color:"#22c55e",bio:"Tech & AI stocks. NVDA maxi.",followers:3420,following:210,posts:892,points:9840,badges:["early","verified","100likes","top5"]},
  {id:2,name:"CryptoWolf",   emoji:"ðº",color:"#8b5cf6",bio:"Bitcoin & DeFi. HODL forever.",followers:2180,following:156,posts:1240,points:7620,badges:["early","bull_10","100likes"]},
  {id:3,name:"ETHmaxi",      emoji:"ð",color:"#3b82f6",bio:"Ethereum bull. Diamond hands.",followers:1890,following:88, posts:654, points:6180,badges:["early","verified"]},
  {id:4,name:"TeslaInvestor",emoji:"â¡",color:"#f59e0b",bio:"EV sector. Swing trader.",       followers:1340,following:320,posts:445, points:4950,badges:["first_post","bull_10"]},
  {id:5,name:"SPY_Trader",   emoji:"ð",color:"#ef4444",bio:"Macro & opciones. 10y exp.",     followers:980, following:412,posts:1100,points:3720,badges:["early","first_post"]},
];
const MOCK_POSTS = [
  {id:1,userId:1,user:"NvidiaChad",    avatar:"ð¢",avatarColor:"#22c55e",time:"hace 3m", ticker:"NVDA",sentiment:"bull",text:"NVDA con soporte perfecto en la media de 50 dÃ­as. Demanda de chips IA no para. Acumulando mÃ¡s aquÃ­. Target: $1,100 ð",likes:289,comments:71,reposts:54,tags:["NVDA","AI"]},
  {id:2,userId:2,user:"CryptoWolf",   avatar:"ðº",avatarColor:"#8b5cf6",time:"hace 11m",ticker:"BTC", sentiment:"bull",text:"Bitcoin rompiendo resistencia en $68k. Target $72k. Ballenas acumulando en on-chain ð",likes:142,comments:38,reposts:21,tags:["BTC","Crypto"]},
  {id:3,userId:4,user:"TeslaInvestor",avatar:"â¡",avatarColor:"#f59e0b",time:"hace 24m",ticker:"TSLA",sentiment:"bear",text:"TSLA reporta esta semana. Entregas Q1 decepcionaron. Me pongo corto antes del earnings. Target bajista $180 ð",likes:67, comments:45,reposts:8, tags:["TSLA","Earnings"]},
  {id:4,userId:3,user:"ETHmaxi",      avatar:"ð",avatarColor:"#3b82f6",time:"hace 45m",ticker:"ETH", sentiment:"bull",text:"ETH acumulando mientras todos miran BTC. Ratio ETH/BTC en mÃ­nimos histÃ³ricos. Paciencia ðð",likes:198,comments:29,reposts:43,tags:["ETH","Crypto"]},
  {id:5,userId:5,user:"SPY_Trader",   avatar:"ð",avatarColor:"#ef4444",time:"hace 1h", ticker:"SPY", sentiment:"bear",text:"SPY doble techo en resistencia. Fed hawkish. Me posiciono defensivo. Cash is king por ahora.",likes:112,comments:56,reposts:17,tags:["SPY","Macro"]},
];
const MOCK_NOTICIAS = [
  {id:1,titulo:"La Fed mantiene tasas: mercados al alza",tituloEn:"Fed holds rates: markets rally",fuente:"Reuters",tiempo:"hace 12m",ticker:"SPY",urgente:true,emoji:"ð¦"},
  {id:2,titulo:"NVIDIA supera estimaciones: chips IA baten rÃ©cord",tituloEn:"NVIDIA beats estimates: AI chips record demand",fuente:"Bloomberg",tiempo:"hace 34m",ticker:"NVDA",urgente:false,emoji:"ð¢"},
  {id:3,titulo:"Bitcoin rompe $68k por primera vez en 3 semanas",tituloEn:"Bitcoin breaks $68k for first time in 3 weeks",fuente:"CoinDesk",tiempo:"hace 1h",ticker:"BTC",urgente:false,emoji:"â¿"},
  {id:4,titulo:"Tesla: ventas Q1 decepcionan, Musk promete nuevo modelo",tituloEn:"Tesla: Q1 sales disappoint, Musk promises new model",fuente:"WSJ",tiempo:"hace 2h",ticker:"TSLA",urgente:false,emoji:"â¡"},
  {id:5,titulo:"Meta earnings: publicidad digital sube 27% interanual",tituloEn:"Meta earnings: digital advertising up 27% YoY",fuente:"CNBC",tiempo:"hace 4h",ticker:"META",urgente:false,emoji:"ð"},
];
const MOCK_EARNINGS = [
  {ticker:"TSLA", nombre:"Tesla",     fecha:"Hoy",      fechaEn:"Today",    hora:"Tras cierre",    eps_est:"$0.51", rev_est:"$22.3B", sorpresa:null,  bull_pct:34, community_votes:4821, live:true,  live_viewers:3240, live_title:"Q1 2026 Earnings Call",   live_speaker:"Elon Musk â CEO",         ir_url:"https://ir.tesla.com/events-and-presentations",           yt_url:"https://www.youtube.com/@TeslaMotors/streams",       yt_embed:"https://www.youtube-nocookie.com/embed?listType=user_uploads&list=TeslaMotors",                emoji:"ð", sector:"EV / Auto"},
  {ticker:"MSFT", nombre:"Microsoft", fecha:"MaÃ±ana",   fechaEn:"Tomorrow", hora:"Tras cierre",    eps_est:"$2.82", rev_est:"$60.8B", sorpresa:null,  bull_pct:78, community_votes:3107, live:false, live_viewers:0,    live_title:"Q3 FY2026 Earnings Call", live_speaker:"Satya Nadella â CEO",     ir_url:"https://www.microsoft.com/en-us/investor",               yt_url:"https://www.youtube.com/@MicrosoftInvestorRelations", yt_embed:"https://www.youtube-nocookie.com/embed?listType=user_uploads&list=MicrosoftInvestorRelations", emoji:"ð»", sector:"Cloud / IA"},
  {ticker:"GOOGL", nombre:"Alphabet", fecha:"MaÃ±ana",   fechaEn:"Tomorrow", hora:"Tras cierre",    eps_est:"$1.53", rev_est:"$78.6B", sorpresa:null,  bull_pct:71, community_votes:2654, live:false, live_viewers:0,    live_title:"Q1 2026 Earnings Call",   live_speaker:"Sundar Pichai â CEO",     ir_url:"https://abc.xyz/investor/",                              yt_url:"https://www.youtube.com/@googleinvestorrelations",   yt_embed:"https://www.youtube-nocookie.com/embed?listType=user_uploads&list=googleinvestorrelations",   emoji:"ð", sector:"Ads / Cloud"},
  {ticker:"META",  nombre:"Meta",     fecha:"MiÃ©r",     fechaEn:"Wed",      hora:"Tras cierre",    eps_est:"$4.71", rev_est:"$36.2B", sorpresa:null,  bull_pct:82, community_votes:1980, live:false, live_viewers:0,    live_title:"Q1 2026 Earnings Call",   live_speaker:"Mark Zuckerberg â CEO",   ir_url:"https://investor.fb.com/investor-events/",               yt_url:"https://www.youtube.com/@Meta/streams",              yt_embed:"https://www.youtube-nocookie.com/embed?listType=user_uploads&list=MetaInvestorRelations",      emoji:"ð", sector:"Social / VR"},
  {ticker:"NVDA",  nombre:"NVIDIA",   fecha:"Jue",      fechaEn:"Thu",      hora:"Tras cierre",    eps_est:"$5.52", rev_est:"$24.6B", sorpresa:null,  bull_pct:89, community_votes:5240, live:false, live_viewers:0,    live_title:"Q1 FY2027 Earnings Call", live_speaker:"Jensen Huang â CEO",      ir_url:"https://investor.nvidia.com/events-and-presentations",   yt_url:"https://www.youtube.com/@NVIDIA/streams",            yt_embed:"https://www.youtube-nocookie.com/embed?listType=user_uploads&list=nvidia",                     emoji:"ð¥ï¸",sector:"IA / Semis"},
  {ticker:"AAPL",  nombre:"Apple",    fecha:"Jue",      fechaEn:"Thu",      hora:"Tras cierre",    eps_est:"$1.61", rev_est:"$94.2B", sorpresa:null,  bull_pct:74, community_votes:3890, live:false, live_viewers:0,    live_title:"Q2 FY2026 Earnings Call", live_speaker:"Tim Cook â CEO",          ir_url:"https://investor.apple.com/news-events/events",          yt_url:"https://www.youtube.com/apple",                      yt_embed:"https://www.youtube-nocookie.com/embed?listType=user_uploads&list=apple",                      emoji:"ð", sector:"Consumer / Services"},
  {ticker:"NFLX",  nombre:"Netflix",  fecha:"Vie",      fechaEn:"Fri",      hora:"Antes apertura", eps_est:"$4.53", rev_est:"$9.7B",  sorpresa:"+8%", bull_pct:66, community_votes:1432, live:false, live_viewers:0,    live_title:"Q1 2026 Earnings Call",   live_speaker:"Greg Peters â CEO",       ir_url:"https://ir.netflix.net/ir-overview/presentations-events", yt_url:"https://www.youtube.com/@Netflix",                   yt_embed:"https://www.youtube-nocookie.com/embed?listType=user_uploads&list=netflix",                    emoji:"ð¬", sector:"Streaming"},
  {ticker:"AMZN",  nombre:"Amazon",   fecha:"Vie",      fechaEn:"Fri",      hora:"Tras cierre",    eps_est:"$1.29", rev_est:"$142.5B",sorpresa:null,  bull_pct:80, community_votes:2100, live:false, live_viewers:0,    live_title:"Q1 2026 Earnings Call",   live_speaker:"Andy Jassy â CEO",        ir_url:"https://ir.aboutamazon.com/events-and-presentations",    yt_url:"https://www.youtube.com/@AmazonNews/streams",        yt_embed:"https://www.youtube-nocookie.com/embed?listType=user_uploads&list=AmazonNewsUS",               emoji:"ð¦", sector:"eCommerce / AWS"},
];
const MOCK_TRENDING = [
  {ticker:"SMCI",nombre:"SuperMicro",mentions:2840,change:+18.4,sentiment:92},
  {ticker:"NVDA",nombre:"NVIDIA",    mentions:2100,change:+2.8, sentiment:88},
  {ticker:"BTC", nombre:"Bitcoin",   mentions:1980,change:+4.2, sentiment:85},
  {ticker:"TSLA",nombre:"Tesla",     mentions:1650,change:-3.1, sentiment:34},
  {ticker:"ARM", nombre:"ARM Hold.", mentions:1320,change:+11.2,sentiment:79},
];
// ââ AVATAR SYSTEM BY LEVEL ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// Each level unlocks new exclusive AI-generated style avatars
const AVATAR_LEVELS = [
  {
    level: 0, levelName:"Novato", levelNameEn:"Rookie", color:"#94a3b8",
    desc:"Avatares de inicio â disponibles para todos",
    descEn:"Starter avatars â available for everyone",
    locked: false,
    avatars:[
      {id:"n1", svg:"novato_1", emoji:"ð±", color:"#94a3b8", name:"Planta",     style:"minimal"},
      {id:"n2", svg:"novato_2", emoji:"ð£", color:"#86efac", name:"Pollito",    style:"cute"},
      {id:"n3", svg:"novato_3", emoji:"ð", color:"#fde68a", name:"Estrella",   style:"bright"},
      {id:"n4", svg:"novato_4", emoji:"ð¯", color:"#f9a8d4", name:"Diana",      style:"sharp"},
      {id:"n5", svg:"novato_5", emoji:"ð­", color:"#a5b4fc", name:"Explorador", style:"curious"},
      {id:"n6", svg:"novato_6", emoji:"ð", color:"#6ee7b7", name:"Estudioso",  style:"smart"},
    ]
  },
  {
    level: 1, levelName:"Analista", levelNameEn:"Analyst", color:"#3b82f6",
    desc:"Desbloqueado con 500 pts â Avatares tech y datos",
    descEn:"Unlocked at 500 pts â Tech & data avatars",
    locked: true, minPts: 500,
    avatars:[
      {id:"a1", svg:"analista_1", emoji:"ð", color:"#3b82f6", name:"Data",       style:"tech"},
      {id:"a2", svg:"analista_2", emoji:"ð¤", color:"#6366f1", name:"Cyborg",     style:"ai"},
      {id:"a3", svg:"analista_3", emoji:"ð§ ", color:"#8b5cf6", name:"Mente",      style:"neural"},
      {id:"a4", svg:"analista_4", emoji:"ð»", color:"#0ea5e9", name:"Coder",      style:"digital"},
      {id:"a5", svg:"analista_5", emoji:"ð¬", color:"#06b6d4", name:"CientÃ­fico", style:"precise"},
      {id:"a6", svg:"analista_6", emoji:"ð¡", color:"#3b82f6", name:"Radar",      style:"signal"},
    ]
  },
  {
    level: 2, levelName:"Trader", levelNameEn:"Trader", color:"#8b5cf6",
    desc:"Desbloqueado con 1.500 pts â Avatares de mercado y poder",
    descEn:"Unlocked at 1,500 pts â Market & power avatars",
    locked: true, minPts: 1500,
    avatars:[
      {id:"t1", svg:"trader_1", emoji:"ð", color:"#00b87a", name:"Toro",       style:"bull"},
      {id:"t2", svg:"trader_2", emoji:"â¡", color:"#f59e0b", name:"RelÃ¡mpago",  style:"fast"},
      {id:"t3", svg:"trader_3", emoji:"ð¦", color:"#8b5cf6", name:"Ãguila",     style:"sharp"},
      {id:"t4", svg:"trader_4", emoji:"ð¥", color:"#ef4444", name:"Fuego",      style:"hot"},
      {id:"t5", svg:"trader_5", emoji:"ð¹", color:"#10b981", name:"Green",      style:"profit"},
      {id:"t6", svg:"trader_6", emoji:"ð²", color:"#7c3aed", name:"Risk",       style:"bold"},
    ]
  },
  {
    level: 3, levelName:"Experto", levelNameEn:"Expert", color:"#f59e0b",
    desc:"Desbloqueado con 4.000 pts â Avatares Ã©lite dorados",
    descEn:"Unlocked at 4,000 pts â Elite golden avatars",
    locked: true, minPts: 4000,
    avatars:[
      {id:"e1", svg:"experto_1", emoji:"ð", color:"#f59e0b", name:"Corona",    style:"royal"},
      {id:"e2", svg:"experto_2", emoji:"ð¦", color:"#d97706", name:"LeÃ³n",      style:"king"},
      {id:"e3", svg:"experto_3", emoji:"ð", color:"#0ea5e9", name:"Diamante",  style:"rare"},
      {id:"e4", svg:"experto_4", emoji:"ð ", color:"#f59e0b", name:"Meteoro",   style:"golden"},
      {id:"e5", svg:"experto_5", emoji:"ð±", color:"#ca8a04", name:"Tridente",  style:"power"},
      {id:"e6", svg:"experto_6", emoji:"ð", color:"#fbbf24", name:"CampeÃ³n",   style:"champion"},
    ]
  },
  {
    level: 4, levelName:"Leyenda", levelNameEn:"Legend", color:"#ef4444",
    desc:"Desbloqueado con 10.000 pts â Avatares Ãºnicos de Leyenda",
    descEn:"Unlocked at 10,000 pts â Unique Legend avatars",
    locked: true, minPts: 10000,
    avatars:[
      {id:"l1", svg:"leyenda_1", emoji:"ð", color:"#dc2626", name:"DragÃ³n",    style:"mythic"},
      {id:"l2", svg:"leyenda_2", emoji:"ð", color:"#6d28d9", name:"Cosmos",    style:"infinite"},
      {id:"l3", svg:"leyenda_3", emoji:"âï¸", color:"#7f1d1d", name:"Guerrero",  style:"warrior"},
      {id:"l4", svg:"leyenda_4", emoji:"ð®", color:"#4c1d95", name:"OrÃ¡culo",   style:"mystic"},
      {id:"l5", svg:"leyenda_5", emoji:"ð", color:"#991b1b", name:"VolcÃ¡n",    style:"explosive"},
      {id:"l6", svg:"leyenda_6", emoji:"ð", color:"#1c1917", name:"Titan",     style:"dark"},
    ]
  },
];

// Flat list for backwards compat
const AVATAR_OPTIONS = AVATAR_LEVELS.flatMap(l => l.avatars.map(a => ({...a, levelColor:l.color})));

// SVG avatar generator â creates unique AI-style avatars per style
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
// +3000 tickers â S&P500, Nasdaq, NYSE, Crypto, ETFs, LatAm ADRs
const SEARCH_TICKERS = [
  // ââ Mega-cap tech ââââââââââââââââââââââââââââââââââââââââââââââ
  "AAPL","MSFT","GOOGL","GOOG","AMZN","NVDA","TSLA","META","AVGO","ORCL",
  "ADBE","CRM","INTC","AMD","QCOM","TXN","MU","AMAT","LRCX","KLAC","MRVL",
  "NFLX","SPOT","SNAP","PINS","TWTR","RBLX","LYFT","UBER","ABNB","DASH",
  "SHOP","ETSY","EBAY","AMGN","GILD","BIIB","REGN","VRTX","ILMN","MRNA",
  "BNTX","PFE","JNJ","MRK","ABT","MDT","BMY","ABBV","LLY","AZN",
  // ââ Finanzas âââââââââââââââââââââââââââââââââââââââââââââââââââ
  "JPM","BAC","WFC","GS","MS","C","AXP","V","MA","PYPL","SQ","COIN","HOOD",
  "SCHW","BLK","BX","KKR","APO","TROW","ICE","CME","CBOE","SPGI","MCO",
  "USB","PNC","TFC","RF","FITB","HBAN","KEY","CFG","MTB","ZION","CMA",
  // ââ ETFs populares âââââââââââââââââââââââââââââââââââââââââââââ
  "SPY","QQQ","IWM","DIA","VOO","VTI","VEA","VWO","EEM","GLD","SLV","USO",
  "XLF","XLK","XLE","XLV","XLI","XLB","XLU","XLP","XLY","XLRE","XLC",
  "ARKK","ARKG","ARKW","ARKF","ARKX","BOTZ","SOXX","SMH","SOXS","SOXL",
  "TLT","IEF","SHY","HYG","LQD","EMB","AGG","BND","BNDX","MBB",
  // ââ Crypto ââââââââââââââââââââââââââââââââââââââââââââââââââââ
  "BTC","ETH","SOL","BNB","XRP","ADA","DOGE","AVAX","MATIC","DOT","LINK",
  "UNI","AAVE","MKR","SNX","COMP","YFI","SUSHI","CRV","BAL","LRC","ZRX",
  "FIL","ATOM","NEAR","ALGO","VET","THETA","FTM","ONE","SAND","MANA","AXS",
  "GALA","ENJ","CHZ","BAT","GRT","OCEAN","ANKR","CELO","FLOW","ICP",
  "MSTR","IBIT","FBTC","GBTC","ETHE","COIN","MARA","RIOT","CLSK","BTBT",
  // ââ S&P 500 (selecciÃ³n amplia) ââââââââââââââââââââââââââââââââ
  "MMM","AOS","ABT","ACGL","ACN","ADBE","ADI","ADM","ADP","ADSK","AEE",
  "AEP","AES","AFL","AIG","AIZ","AJG","AKAM","ALB","ALGN","ALL","ALLE",
  "AMAT","AMCR","AME","AMGN","AMP","AMT","AMZN","ANET","AON","AOS","APA",
  "APD","APH","APTV","ARE","ATO","AVB","AVGO","AVY","AWK","AXP","AZO",
  "BA","BAC","BALL","BAX","BBWI","BBY","BDX","BEN","BF.B","BG","BIIB",
  "BIO","BK","BKNG","BKR","BLK","BMY","BR","BRK.B","BRO","BSX","BWA",
  "BXP","C","CAG","CAH","CARR","CAT","CB","CBOE","CBRE","CCI","CCL","CDAY",
  "CDW","CE","CF","CFG","CHD","CHRW","CHTR","CI","CINF","CL","CLX","CMA",
  "CMCSA","CME","CMG","CMI","CMS","CNC","CNP","COF","COO","COP","COST",
  "CPB","CPRT","CPT","CRL","CRM","CSCO","CSGP","CSX","CTAS","CTLT","CTRA",
  "CTSH","CTVA","CVS","CVX","CZR","D","DAL","DD","DE","DG","DGX","DHI",
  "DHR","DIS","DISH","DLR","DLTR","DOV","DOW","DPZ","DRE","DRI","DTE",
  "DUK","DVA","DVN","DXC","DXCM","EA","EBAY","ECL","ED","EFX","EIX","EL",
  "EMN","EMR","ENPH","EOG","EPAM","EQIX","EQR","EQT","ES","ESS","ETN",
  "ETR","EVRG","EW","EXC","EXPD","EXPE","EXR","F","FANG","FAST","FDS",
  "FDX","FE","FFIV","FIS","FISV","FITB","FLT","FMC","FOX","FOXA","FRC",
  "FRT","FTNT","FTV","GD","GE","GEHC","GEN","GENZ","GEV","GFS","GIS","GL",
  "GLW","GM","GNRC","Goldman","GOOG","GOOGL","GPC","GPN","GPS","GRMN","GS",
  "GWW","HAL","HAS","HBAN","HCA","HD","HES","HIG","HII","HLT","HOLX","HON",
  "HPE","HPQ","HRL","HSIC","HST","HSY","HUM","HWM","IBM","ICE","IDXX","IEX",
  "IFF","ILMN","INCY","INTC","INTU","INVH","IP","IPG","IQV","IR","IRM","IT",
  "ITW","J","JBHT","JCI","JKHY","JNJ","JNPR","JPM","K","KEY","KEYS","KHC",
  "KIM","KLAC","KMB","KMI","KMX","KO","KR","L","LDOS","LEN","LH","LHX",
  "LIN","LKQ","LLY","LMT","LNC","LNT","LOW","LRCX","LUV","LVS","LW","LYB",
  "LYV","MA","MAA","MAR","MAS","MCD","MCHP","MCK","MCO","MDLZ","MDT","MGM",
  "MHK","MKC","MKTX","MLM","MMC","MMM","MNST","MO","MOH","MOS","MPC","MPWR",
  "MRK","MRNA","MRO","MS","MSI","MTB","MTCH","MTD","MU","NCLH","NDAQ","NEE",
  "NEM","NFLX","NI","NKE","NOC","NOW","NRG","NSC","NTAP","NTRS","NUE","NVR",
  "NWL","NWS","NWSA","NXPI","O","ODW","OKE","OMC","ON","ORCL","ORLY","OXY",
  "PARA","PAYC","PAYX","PCAR","PCG","PEAK","PEG","PEP","PFE","PFG","PG",
  "PGR","PH","PHM","PKG","PLD","PM","PNC","PNR","PNW","POOL","PPG","PPL",
  "PRU","PSA","PSX","PTC","PWR","PXD","QCOM","QRVO","RCL","RE","REG","REGN",
  "RF","RJF","RMD","ROK","ROL","ROP","ROST","RSG","RTX","SBAC","SBUX","SEDG",
  "SHW","SJM","SLB","SNA","SNPS","SO","SPG","SPGI","SRE","STT","STX","STZ",
  "SWK","SWKS","SYF","SYK","SYY","T","TAP","TDG","TDY","TECH","TEL","TER",
  "TFC","TFX","TGT","TJX","TMO","TMUS","TPR","TRMB","TROW","TRV","TSCO",
  "TSLA","TSN","TT","TTWO","TXN","TXT","TYL","UAL","UDR","UHS","ULTA","UNH",
  "UNP","UPS","URI","USB","V","VFC","VICI","VLO","VMC","VNO","VRSK","VRSN",
  "VRTX","VTR","VTRS","VZ","WAB","WAT","WBA","WBD","WDC","WEC","WELL","WFC",
  "WHR","WM","WMB","WMT","WRB","WRK","WST","WTW","WY","WYNN","XEL","XOM",
  "XRAY","XYL","YUM","ZBH","ZBRA","ZION","ZTS",
  // ââ Acciones populares adicionales âââââââââââââââââââââââââââ
  "PLTR","RIVN","LCID","FSR","NIO","LI","XPEV","BEKE","DIDI","TME","BIDU",
  "JD","PDD","BABA","VIPS","TCOM","NTES","WB","HUYA","IQ","DOYU","BILI",
  "GME","AMC","BB","BBBY","KOSS","EXPR","WISH","CLOV","WKHS","RIDE","SPCE",
  "SKLZ","OPEN","OPAD","CURI","MAPS","ACHR","JOBY","LILM","EVTL","BLNK",
  "CHPT","NKLA","HYLN","PTRA","DKNG","PENN","CZOO","FTCH","CPNG","SEA",
  "GRAB","GOJK","TOST","FOUR","BILL","FRSH","SAMSARA","S","NET","CRWD",
  "ZS","OKTA","DDOG","ESTC","MDB","CFLT","RPD","SWI","TENB","QLYS","VRNS",
  "SAIL","SUMO","AI","BBAI","SOUN","GFAI","PRCT","TMDX","RXRX","EXAI",
  "BNKG","CLBR","CFFE","NRXP","AEYE","HOFV","GHIX","PSFE","GLEO","AJAX",
  // ââ ADRs LatAm ââââââââââââââââââââââââââââââââââââââââââââââââ
  "TV","VALE","PBR","ITUB","BBD","BBDO","GGB","SID","GGBR","CSNA","BRFS",
  "CIB","EC","ETSY","MELI","NU","STNE","PAGS","ARCO","VNET","DESP","IFS",
  "BSAC","BCH","YPFD","PAM","TGS","CEPU","EDN","SUPV","BHYX","BYMA",
  // ââ Bancos y financieras LatAm ââââââââââââââââââââââââââââââââ
  "BSMX","GFN","GFNORTEO","Q","BIMBOA","FEMSAUBD","KOFUBL","AMXL","TLEVISACPO",
];
// Eliminar duplicados
const _ST_SET = new Set(SEARCH_TICKERS);
const SEARCH_TICKERS_UNIQ = [..._ST_SET];

// ââ SVG ICON COMPONENTS âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const IcoHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IcoBot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4M9 16h.01M15 16h.01"/>
  </svg>
);
const IcoBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IcoMoon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IcoSun = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IcoSettings = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

// ââ LANG SELECTOR âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
        <span style={{fontSize:9,color:C.muted2}}>â¾</span>
      </button>
      {open && (
        <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"#FFFFFF",border:`1px solid ${C.border}`,borderRadius:14,padding:6,zIndex:200,boxShadow:C.shadowMd,minWidth:155}}>
          {LANG_META.map(l => (
            <button key={l.code} onClick={()=>{ setLang(l.code); setOpen(false); try{localStorage.setItem("nexo-lang",l.code);}catch(e){} }} style={{display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",border:"none",cursor:"pointer",padding:"8px 12px",borderRadius:9,fontFamily:"inherit",fontSize:13,fontWeight:lang===l.code?700:500,color:lang===l.code?C.accentText:C.text,background:lang===l.code?C.accentDim:"transparent",transition:"background 0.1s"}}>
              <span style={{fontSize:18}}>{l.flag}</span>
              <span>{l.label}</span>
              {lang===l.code && <span style={{marginLeft:"auto",color:C.accent}}>â</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ââ SETTINGS PANEL ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function SettingsPanel({ onClose, darkMode, setDarkMode, lang, setLang, user, supabase }) {
  const notifStatus = typeof Notification !== "undefined" ? Notification.permission : "unsupported";
  const [hideLeaderboard, setHideLeaderboard] = useState(() => localStorage.getItem("nexo-hide-leaderboard") === "1");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const toggleHideLeaderboard = async (val) => {
    setHideLeaderboard(val);
    localStorage.setItem("nexo-hide-leaderboard", val ? "1" : "0");
    if (user && supabase) {
      setSaving(true);
      try {
        await supabase.from("profiles").update({ hide_from_leaderboard: val }).eq("id", user.id);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch(e) {}
      setSaving(false);
    }
  };

  const requestPush = async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      new Notification("NexoTrade", { body: "Â¡Notificaciones activadas! ð", icon: "/logo192.png" });
    }
  };

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:9998,backdropFilter:"blur(2px)"}}/>
      {/* Panel */}
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:340,maxWidth:"90vw",background:"#1e293b",borderLeft:"1px solid #334155",zIndex:9999,display:"flex",flexDirection:"column",boxShadow:"-8px 0 48px rgba(0,0,0,0.6)",overflowY:"auto"}}>
        {/* Header */}
        <div style={{padding:"24px 24px 18px",borderBottom:"1px solid #334155",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{color:"#ffffff",fontWeight:900,fontSize:17,letterSpacing:-0.3}}>âï¸ ConfiguraciÃ³n</div>
            <div style={{color:"#64748b",fontSize:12,marginTop:3}}>Personaliza tu experiencia</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#64748b",fontSize:20,cursor:"pointer",padding:4,lineHeight:1}}>â</button>
        </div>

        {/* Body */}
        <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:6,flex:1}}>

          {/* === APARIENCIA === */}
          <div style={{color:"#64748b",fontSize:10,fontWeight:800,letterSpacing:1.5,marginBottom:8,marginTop:4}}>APARIENCIA</div>

          {/* Dark / Light toggle */}
          <div style={{background:"#0f172a",borderRadius:14,padding:"16px 18px",border:"1px solid #334155",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div>
              <div style={{color:"#ffffff",fontWeight:700,fontSize:14}}>{darkMode ? "ð Modo oscuro" : "âï¸ Modo claro"}</div>
              <div style={{color:"#64748b",fontSize:11,marginTop:2}}>Cambia el tema visual</div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                width:48,height:26,borderRadius:13,border:"none",cursor:"pointer",position:"relative",
                background:darkMode ? "#00A8FF" : "#334155",
                transition:"background 0.2s",flexShrink:0
              }}>
              <span style={{
                position:"absolute",top:3,left:darkMode?22:3,width:20,height:20,borderRadius:"50%",
                background:"#fff",transition:"left 0.2s",display:"block"
              }}/>
            </button>
          </div>

          {/* === IDIOMA === */}
          <div style={{color:"#64748b",fontSize:10,fontWeight:800,letterSpacing:1.5,marginBottom:8,marginTop:8}}>IDIOMA</div>
          <div style={{background:"#0f172a",borderRadius:14,padding:"12px 14px",border:"1px solid #334155",marginBottom:8}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {LANG_META.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); try{localStorage.setItem("nexo-lang",l.code);}catch(e){} }}
                  style={{display:"flex",alignItems:"center",gap:6,border:`1px solid ${lang===l.code?"#00A8FF":"#334155"}`,
                    background:lang===l.code?"rgba(0,168,255,0.12)":"transparent",borderRadius:10,
                    padding:"7px 12px",cursor:"pointer",color:lang===l.code?"#00A8FF":"#94a3b8",fontSize:12,fontWeight:lang===l.code?800:500}}>
                  <span style={{fontSize:16}}>{l.flag}</span>
                  <span>{l.label}</span>
                  {lang===l.code && <span>â</span>}
                </button>
              ))}
            </div>
          </div>

          {/* === NOTIFICACIONES === */}
          <div style={{color:"#64748b",fontSize:10,fontWeight:800,letterSpacing:1.5,marginBottom:8,marginTop:8}}>NOTIFICACIONES</div>
          <div style={{background:"#0f172a",borderRadius:14,padding:"16px 18px",border:"1px solid #334155",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{color:"#ffffff",fontWeight:700,fontSize:14}}>ð Push notifications</div>
                <div style={{color:"#64748b",fontSize:11,marginTop:2}}>
                  {notifStatus === "granted" ? "â Activadas" : notifStatus === "denied" ? "ð« Bloqueadas en el navegador" : notifStatus === "unsupported" ? "No soportado" : "Sin activar"}
                </div>
              </div>
              {notifStatus !== "granted" && notifStatus !== "denied" && notifStatus !== "unsupported" && (
                <button onClick={requestPush}
                  style={{background:"linear-gradient(135deg,#00A8FF,#0099dd)",border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  Activar
                </button>
              )}
              {notifStatus === "granted" && <span style={{fontSize:20}}>â</span>}
              {notifStatus === "denied" && <span style={{fontSize:11,color:"#ef4444",maxWidth:100,textAlign:"right",lineHeight:1.4}}>ActÃ­valas en ajustes del navegador</span>}
            </div>
          </div>

          {/* === PRIVACIDAD === */}
          {user && (
            <>
              <div style={{color:"#64748b",fontSize:10,fontWeight:800,letterSpacing:1.5,marginBottom:8,marginTop:8}}>PRIVACIDAD</div>
              <div style={{background:"#0f172a",borderRadius:14,padding:"16px 18px",border:"1px solid #334155",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{color:"#ffffff",fontWeight:700,fontSize:14}}>ðï¸ Ocultar del leaderboard</div>
                  <div style={{color:"#64748b",fontSize:11,marginTop:2}}>No aparecer en el ranking pÃºblico</div>
                  {saved && <div style={{color:"#10b981",fontSize:10,marginTop:4}}>â Guardado</div>}
                </div>
                <button
                  onClick={() => toggleHideLeaderboard(!hideLeaderboard)}
                  disabled={saving}
                  style={{
                    width:48,height:26,borderRadius:13,border:"none",cursor:"pointer",position:"relative",
                    background:hideLeaderboard ? "#00A8FF" : "#334155",
                    transition:"background 0.2s",flexShrink:0,opacity:saving?0.6:1
                  }}>
                  <span style={{
                    position:"absolute",top:3,left:hideLeaderboard?22:3,width:20,height:20,borderRadius:"50%",
                    background:"#fff",transition:"left 0.2s",display:"block"
                  }}/>
                </button>
              </div>
            </>
          )}

          {/* === CUENTA === */}
          <div style={{color:"#64748b",fontSize:10,fontWeight:800,letterSpacing:1.5,marginBottom:8,marginTop:8}}>CUENTA</div>
          <div style={{background:"#0f172a",borderRadius:14,padding:"16px 18px",border:"1px solid #334155",marginBottom:8}}>
            {user ? (
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#00A8FF,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                  {(user.name||user.email||"?")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{color:"#ffffff",fontWeight:700,fontSize:13}}>{user.name || user.email?.split("@")[0]}</div>
                  <div style={{color:"#64748b",fontSize:11}}>{user.email}</div>
                </div>
              </div>
            ) : (
              <div style={{color:"#64748b",fontSize:13}}>No has iniciado sesiÃ³n</div>
            )}
          </div>

          {/* Soporte */}
          <a href="mailto:mariagalarraga2013@gmail.com?subject=Soporte NexoTrade"
            style={{display:"flex",alignItems:"center",gap:10,background:"#0f172a",borderRadius:14,padding:"14px 18px",border:"1px solid #334155",color:"#94a3b8",fontSize:13,fontWeight:600,textDecoration:"none",marginBottom:4}}>
            <span style={{fontSize:18}}>ð§</span>
            <span>Contactar soporte</span>
            <span style={{marginLeft:"auto",color:"#334155"}}>â</span>
          </a>
          <a href="https://nexotradeia.com" target="_blank" rel="noopener"
            style={{display:"flex",alignItems:"center",gap:10,background:"#0f172a",borderRadius:14,padding:"14px 18px",border:"1px solid #334155",color:"#94a3b8",fontSize:13,fontWeight:600,textDecoration:"none"}}>
            <span style={{fontSize:18}}>ð</span>
            <span>nexotradeia.com</span>
            <span style={{marginLeft:"auto",color:"#334155"}}>â</span>
          </a>
        </div>

        {/* Footer */}
        <div style={{padding:"16px 24px",borderTop:"1px solid #334155",textAlign:"center",color:"#334155",fontSize:11}}>
          NexoTrade Â· v1.0 Â· Solo educativo
        </div>
      </div>
    </>
  );
}

// ââ TICKER TAPE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// ââ FINNHUB REALTIME PRICES âââââââââââââââââââââââââââââââââââââââââââââââââââ
const FINNHUB_KEY = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";

// Mapa ticker â sÃ­mbolo Finnhub (crypto usa prefijo de exchange)
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

  // REST â carga inicial de cotizaciones
  useEffect(() => {
    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    const fetchQuote = async (ticker, i) => {
      await delay(i * 250); // escalonar para no superar lÃ­mite de rate
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

  // WebSocket â actualizaciones tick a tick en tiempo real
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
              // Encontrar nuestro ticker para este sÃ­mbolo de Finnhub
              const entry = Object.entries(FH_SYM).find(([, v]) => v === trade.s);
              if (entry) updatePrice(entry[0], trade.p);
            });
          }
        } catch (_) {}
      };

      socket.onclose = () => {
        // Reconectar automÃ¡ticamente en 4 s
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

// Helper: formatear precio con el nÃºmero de decimales correcto
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
            {item.earning&&<span style={{background:"#f59e0b22",color:"#f59e0b",border:"1px solid #f59e0b55",borderRadius:4,padding:"1px 5px",fontSize:9,fontWeight:800}}>ð EARN</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ââ SEARCH BAR ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function SearchBar({lang, onTickerNav, onUserNav, onPostNav, posts=[], users=[]}) {
  const t = LANGS[lang];
  const [q,setQ]=useState(""),[res,setRes]=useState([]),[foc,setFoc]=useState(false);
  const [selected,setSelected]=useState(null);
  const [searchTab, setSearchTab]=useState("tickers"); // "tickers"|"posts"|"users"
  const ref=useRef();
  useEffect(()=>{
    if(!q){setRes([]);return;}
    const upper = q.replace(/[@$\s]/g,"").toUpperCase();
    // Primero los que empiezan con el query, luego los que lo contienen
    const starts = SEARCH_TICKERS_UNIQ.filter(x=>x.startsWith(upper));
    const contains = SEARCH_TICKERS_UNIQ.filter(x=>!x.startsWith(upper)&&x.includes(upper));
    setRes([...starts,...contains].slice(0,8));
  },[q]);
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

  // Nombres de compaÃ±Ã­as para el mini card
  const NAMES={"AAPL":"Apple Inc.","MSFT":"Microsoft","GOOGL":"Alphabet","AMZN":"Amazon","NVDA":"NVIDIA","TSLA":"Tesla","META":"Meta Platforms","BTC":"Bitcoin","ETH":"Ethereum","SPY":"S&P 500 ETF","AMD":"AMD","NFLX":"Netflix","COIN":"Coinbase","PLTR":"Palantir","JPM":"JPMorgan","V":"Visa","BABA":"Alibaba","RIVN":"Rivian","ARM":"ARM Holdings","SMCI":"Super Micro","QQQ":"Nasdaq ETF","INTC":"Intel","ORCL":"Oracle","SHOP":"Shopify","UBER":"Uber","SNAP":"Snap","TWLO":"Twilio","SQ":"Block Inc","PYPL":"PayPal","DIS":"Disney","GS":"Goldman Sachs","WMT":"Walmart","BAC":"Bank of America","XOM":"ExxonMobil","JNJ":"Johnson & Johnson","KO":"Coca-Cola","PFE":"Pfizer","LMT":"Lockheed Martin","CVX":"Chevron","F":"Ford","GME":"GameStop","AMC":"AMC Entertainment"};

  return(
    <div ref={ref} style={{position:"relative",width:"100%",maxWidth:420}}>
      <div style={{display:"flex",alignItems:"center",gap:8,background:"#F8FAFC",border:`1px solid ${foc?"rgba(37,99,235,0.45)":"rgba(15,23,42,0.12)"}`,borderRadius:10,padding:"8px 14px",transition:"all 0.18s",boxShadow:foc?"0 0 0 3px rgba(37,99,235,0.1)":"none"}}>
        <span style={{fontSize:13,color:"#475569"}}>â</span>
        <input value={q} onChange={e=>{setQ(e.target.value);setSelected(null);}} onFocus={()=>setFoc(true)} placeholder={t.search}
          onKeyDown={e=>{
            if(e.key==="Enter"&&q.trim()){
              const ticker=q.replace(/[@$\s]/g,"").toUpperCase();
              if(ticker){setQ("");setRes([]);setFoc(false);if(onTickerNav)onTickerNav(ticker);}
            }
          }}
          style={{flex:1,background:"none",border:"none",outline:"none",color:"#0F172A",fontSize:13,fontFamily:"'Inter',sans-serif",fontWeight:400,letterSpacing:0.1}}/>
        {q&&<button onClick={()=>{setQ("");setRes([]);setSelected(null);}} style={{background:"none",border:"none",cursor:"pointer",color:"#334155",fontSize:16,lineHeight:1}}>Ã</button>}
      </div>

      {/* Dropdown de resultados */}
      {foc&&q.length>0&&!selected&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.1)",borderRadius:12,boxShadow:"0 8px 30px rgba(0,0,0,0.12)",zIndex:200,overflow:"hidden"}}>
          {/* Tabs de bÃºsqueda */}
          <div style={{display:"flex",borderBottom:"1px solid rgba(15,23,42,0.07)",background:"#fafafa"}}>
            {[["tickers","ð Tickers"],["posts","âï¸ Posts"],["users","ð¤ Traders"]].map(([k,l])=>(
              <button key={k} onClick={()=>setSearchTab(k)}
                style={{flex:1,padding:"8px 4px",border:"none",borderBottom:`2px solid ${searchTab===k?"#00A8FF":"transparent"}`,background:"transparent",fontSize:11,fontWeight:searchTab===k?700:500,color:searchTab===k?"#00A8FF":"#64748B",cursor:"pointer"}}>
                {l}
              </button>
            ))}
          </div>

          {/* Resultados: Tickers */}
          {searchTab==="tickers" && res.map(ticker=>{
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
                  {tp?.earning&&<span style={{background:"rgba(245,158,11,0.1)",color:C.gold,border:"1px solid rgba(245,158,11,0.2)",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700}}>ð EARN</span>}
                </div>
                <div style={{textAlign:"right"}}>
                  {tp&&<div style={{fontSize:12.5,fontWeight:800,color:"#0F172A",fontFamily:"monospace"}}>{tp.price}</div>}
                  {tp&&<div style={{fontSize:11,fontWeight:700,color:isUp?C.bull:C.bear,fontFamily:"monospace"}}>{fmtChg(tp.change)}</div>}
                </div>
              </div>
            );
          })}
          {searchTab==="tickers" && res.length===0 && (
            <div style={{padding:"14px 16px",textAlign:"center"}}>
              <div style={{color:"#94A3B8",fontSize:12,marginBottom:10}}>"{q.replace(/[@$\s]/g,"").toUpperCase()}" no estÃ¡ en nuestra lista</div>
              <button onClick={()=>{const tk=q.replace(/[@$\s]/g,"").toUpperCase();if(tk&&onTickerNav){setQ("");setRes([]);setFoc(false);onTickerNav(tk);}}}
                style={{background:"rgba(0,168,255,0.1)",border:"1px solid rgba(0,168,255,0.3)",borderRadius:8,padding:"7px 18px",color:"#00A8FF",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                ð Buscar ${q.replace(/[@$\s]/g,"").toUpperCase()} de todas formas â
              </button>
            </div>
          )}

          {/* Resultados: Posts */}
          {searchTab==="posts" && (()=>{
            const matchPosts = posts.filter(p=>p.text?.toLowerCase().includes(q.toLowerCase())||p.ticker?.toLowerCase().includes(q.toLowerCase())).slice(0,5);
            return matchPosts.length===0
              ? <div style={{padding:"16px",textAlign:"center",color:"#94A3B8",fontSize:12}}>No hay posts con "{q}"</div>
              : matchPosts.map(p=>(
                <div key={p.id} style={{padding:"10px 14px",borderBottom:"1px solid rgba(15,23,42,0.06)",cursor:"pointer",transition:"background 0.12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>{setQ("");setFoc(false);if(onPostNav)onPostNav(p);}}>
                  <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <span style={{fontSize:18,flexShrink:0}}>{p.avatar||"ð¦"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                        <span style={{fontWeight:700,color:"#0F172A",fontSize:12}}>{p.user}</span>
                        {p.ticker&&<span style={{background:"rgba(0,168,255,0.08)",color:"#0284C7",borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>${p.ticker}</span>}
                        <span style={{color:p.sentiment==="bull"?"#16A34A":"#DC2626",fontSize:10,fontWeight:700}}>{p.sentiment==="bull"?"â²":"â¼"}</span>
                      </div>
                      <div style={{color:"#475569",fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.text}</div>
                    </div>
                  </div>
                </div>
              ));
          })()}

          {/* Resultados: Usuarios */}
          {searchTab==="users" && (()=>{
            const matchUsers = users.filter(u=>u.name?.toLowerCase().includes(q.toLowerCase())).slice(0,5);
            return matchUsers.length===0
              ? <div style={{padding:"16px",textAlign:"center",color:"#94A3B8",fontSize:12}}>No se encontrÃ³ "{q}"</div>
              : matchUsers.map(u=>{
                const lvl=getLevel(u.points);
                return(
                  <div key={u.id} style={{padding:"10px 14px",borderBottom:"1px solid rgba(15,23,42,0.06)",cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"background 0.12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.04)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    onClick={()=>{setQ("");setFoc(false);if(onUserNav)onUserNav(u);}}>
                    <AvatarBubble emoji={u.emoji} color={u.avatarColor||C.accent} size={34}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:"#0F172A",fontSize:13}}>{u.name}</div>
                      <div style={{fontSize:10,color:lvl.color,fontWeight:600}}>{lvl.emoji} {lvl.name} Â· {fmtNum(u.followers)} seguidores</div>
                    </div>
                    {u.badges?.includes("verified")&&<span style={{fontSize:14}}>â</span>}
                  </div>
                );
              });
          })()}

          <div style={{padding:"6px 14px",fontSize:10,color:"#94A3B8",background:"#FAFAFA"}}>
            {searchTab==="tickers"?"Clic en un ticker para ver detalles":"Clic para navegar"}
          </div>
        </div>
      )}

      {/* Mini tarjeta de detalle â visible para TODOS, sin login */}
      {selected&&tape&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.1)",borderRadius:14,boxShadow:"0 12px 40px rgba(0,0,0,0.15)",zIndex:200,padding:0,overflow:"hidden"}}>
          {/* Header */}
          <div style={{background:tape.change>=0?"linear-gradient(135deg,rgba(0,229,143,0.08),rgba(0,168,255,0.05))":"linear-gradient(135deg,rgba(255,77,106,0.08),rgba(255,140,0,0.05))",padding:"14px 16px",borderBottom:"1px solid rgba(15,23,42,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{background:tape.change>=0?"rgba(0,229,143,0.15)":"rgba(255,77,106,0.15)",color:tape.change>=0?C.bull:C.bear,borderRadius:7,padding:"3px 10px",fontSize:13,fontWeight:900,fontFamily:"monospace"}}>${selected}</span>
                  {tape.earning&&<span style={{background:"rgba(245,158,11,0.12)",color:"#D97706",border:"1px solid rgba(245,158,11,0.25)",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700}}>ð EARNINGS PROX.</span>}
                </div>
                <div style={{fontSize:12,color:"#475569",marginTop:4,fontWeight:500}}>{NAMES[selected]||selected}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:"rgba(15,23,42,0.06)",border:"none",borderRadius:"50%",width:26,height:26,cursor:"pointer",fontSize:14,color:"#64748B",display:"flex",alignItems:"center",justifyContent:"center"}}>â</button>
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
              {label:"Tendencia",value:tape.change>=0?"ð Alcista":"ð Bajista",col:tape.change>=0?C.bull:C.bear},
              {label:"Volumen",value:"Alto",col:"#3B82F6"},
              {label:"SeÃ±al",value:tape.change>=1.5?"ð¥ Fuerte":tape.change>=0?"â Normal":"â ï¸ DÃ©bil",col:"#F59E0B"},
            ].map(({label,value,col},i)=>(
              <div key={i} style={{padding:"10px 14px",borderRight:i<2?"1px solid rgba(15,23,42,0.07)":"none",borderTop:"1px solid rgba(15,23,42,0.07)"}}>
                <div style={{fontSize:10,color:"#94A3B8",fontWeight:600,marginBottom:3,letterSpacing:0.5}}>{label.toUpperCase()}</div>
                <div style={{fontSize:12.5,fontWeight:700,color:col}}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{padding:"10px 16px",background:"rgba(0,168,255,0.03)",borderTop:"1px solid rgba(15,23,42,0.07)",fontSize:10.5,color:"#64748B",textAlign:"center"}}>
            RegÃ­strate gratis para ver anÃ¡lisis completo Â· <span style={{color:C.accent,fontWeight:700,cursor:"pointer"}}>Unirme â</span>
          </div>
        </div>
      )}

      {/* Mini card cuando no hay datos en TAPE */}
      {selected&&!tape&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.1)",borderRadius:14,boxShadow:"0 12px 40px rgba(0,0,0,0.15)",zIndex:200,padding:"16px",textAlign:"center"}}>
          <div style={{fontSize:22,marginBottom:6}}>ð</div>
          <div style={{fontWeight:700,fontSize:13,color:"#0F172A",fontFamily:"monospace"}}>${selected}</div>
          <div style={{fontSize:12,color:"#64748B",marginTop:4}}>{NAMES[selected]||"Ticker"}</div>
          <div style={{fontSize:11,color:"#94A3B8",marginTop:8}}>Datos en tiempo real disponibles al registrarte</div>
          <button onClick={()=>setSelected(null)} style={{marginTop:10,background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.accent,fontWeight:600}}>Cerrar</button>
        </div>
      )}
    </div>
  );
}

// ââ ATOMS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
      {lvl.emoji} {lang==="en"?lvl.nameEn:lvl.name} Â· {points.toLocaleString()} pts
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
  return <span style={{background:bull?"rgba(0,210,106,0.12)":"rgba(255,77,106,0.12)",color:bull?C.bull:C.bear,border:`1px solid ${bull?"rgba(0,210,106,0.3)":"rgba(255,77,106,0.3)"}`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:4,backdropFilter:"blur(8px)",letterSpacing:0.3}}>{bull?"â²":"â¼"} {bull?(lang==="en"?"Bullish":"Alcista"):(lang==="en"?"Bearish":"Bajista")}</span>;
}

function TickerBadge({ticker,sentiment}){
  const col=sentiment==="bull"?C.bull:C.bear,bg=sentiment==="bull"?C.bullBg:C.bearBg;
  return <span style={{background:bg,color:col,border:`1px solid ${col}33`,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:800,letterSpacing:0.5,fontFamily:"monospace"}}>${ticker}</span>;
}

const inputSt={display:"block",width:"100%",boxSizing:"border-box",background:"#F8FAFC",border:`1.5px solid ${C.glassBorder}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",margin:"6px 0 14px"};

// ââ POINT TOAST âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function PointToast({show,points,reason}){
  if(!show)return null;
  return(
    <div style={{position:"fixed",bottom:24,right:24,background:"#0f172a",color:"#fff",borderRadius:16,padding:"14px 20px",boxShadow:"0 8px 32px rgba(0,0,0,0.2)",zIndex:999,display:"flex",alignItems:"center",gap:10,animation:"slideIn 0.3s ease"}}>
      <style>{`@keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <span style={{fontSize:24}}>â­</span>
      <div>
        <div style={{fontWeight:800,fontSize:15,color:C.accent}}>+{points} puntos</div>
        <div style={{fontSize:12,color:"#94a3b8"}}>{reason}</div>
      </div>
    </div>
  );
}

// ââ COUNT-UP HOOK (para contador animado) âââââââââââââââââââââââââââââââââââââ
function useCountUp(target, duration=2000){
  const [count, setCount] = useState(0);
  useEffect(()=>{
    if(!target) return;
    const startVal = Math.max(0, target - 800);
    const start = Date.now();
    const timer = setInterval(()=>{
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startVal + eased * (target - startVal)));
      if(progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ââ POLYMARKET WIDGET âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function PolymarketWidget(){
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    // Fallback curado de mercados financieros relevantes mientras la API carga
    const fallback = [
      {question:"Â¿HabrÃ¡ recorte de tasas de la Fed en 2025?", probability:0.62, volume:"$1.2M"},
      {question:"Â¿El S&P 500 cerrarÃ¡ por encima de 5,500 en 2025?", probability:0.58, volume:"$890K"},
      {question:"Â¿Bitcoin superarÃ¡ $100K antes de fin de aÃ±o?", probability:0.71, volume:"$3.1M"},
      {question:"Â¿La inflaciÃ³n bajarÃ¡ del 3% en EE.UU. en 2025?", probability:0.45, volume:"$670K"},
    ];
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), 4000);
    // Intentar API pÃºblica de Polymarket
    fetch("https://gamma-api.polymarket.com/markets?closed=false&limit=8&order=volume&ascending=false&tag_id=finance", {signal: ctrl.signal})
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        clearTimeout(timer);
        const financeMarkets = (Array.isArray(data) ? data : data.markets || [])
          .filter(m => m.question && m.outcomePrices)
          .slice(0, 4)
          .map(m => {
            let prices;
            try { prices = Array.isArray(m.outcomePrices) ? m.outcomePrices : JSON.parse(m.outcomePrices||"[0.5]"); }
            catch(e) { prices = [0.5]; }
            const prob = parseFloat(prices[0]) || 0.5;
            return {
              question: m.question,
              probability: prob,
              volume: m.volume ? `$${(parseFloat(m.volume)/1000).toFixed(0)}K` : "â"
            };
          });
        setMarkets(financeMarkets.length >= 2 ? financeMarkets : fallback);
        setLoading(false);
      })
      .catch(() => { clearTimeout(timer); setMarkets(fallback); setLoading(false); });
  }, []);

  const barColor = (p) => p >= 0.6 ? "#10b981" : p >= 0.4 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,overflow:"hidden",marginBottom:20}}>
      {/* Header */}
      <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>ð¯</div>
        <div>
          <div style={{color:C.text,fontWeight:800,fontSize:14}}>Polymarket â Predicciones</div>
          <div style={{color:C.muted2,fontSize:11}}>Mercados de predicciÃ³n en vivo Â· powered by Polymarket</div>
        </div>
        <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer"
          style={{marginLeft:"auto",color:"#6366f1",fontSize:11,fontWeight:700,textDecoration:"none",background:"rgba(99,102,241,0.1)",padding:"4px 10px",borderRadius:8,border:"1px solid rgba(99,102,241,0.3)"}}>
          Ver mÃ¡s â
        </a>
      </div>
      {/* Markets */}
      <div style={{padding:"12px 18px"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:"20px",color:C.muted2,fontSize:13}}>Cargando mercados... â³</div>
        ) : markets.map((m, i) => (
          <div key={i} style={{marginBottom: i < markets.length-1 ? 14 : 0, paddingBottom: i < markets.length-1 ? 14 : 0, borderBottom: i < markets.length-1 ? `1px solid ${C.border}` : "none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8}}>
              <span style={{color:C.text,fontSize:13,fontWeight:600,lineHeight:1.4,flex:1}}>{m.question}</span>
              <span style={{color:barColor(m.probability),fontWeight:900,fontSize:18,flexShrink:0,minWidth:48,textAlign:"right"}}>{Math.round(m.probability*100)}%</span>
            </div>
            {/* Barra de probabilidad */}
            <div style={{height:5,background:C.border,borderRadius:10,overflow:"hidden",marginBottom:5}}>
              <div style={{height:"100%",width:`${m.probability*100}%`,background:barColor(m.probability),borderRadius:10,transition:"width 1s ease"}}/>
            </div>
            <div style={{color:C.muted2,fontSize:11}}>Vol: {m.volume}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ââ INVESTING / MERCADOS EN VIVO WIDGET âââââââââââââââââââââââââââââââââââââââ
function MercadosEnVivoWidget(){
  const [tab, setTab] = useState("crypto");
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const cryptoData = [
    {s:"BTC", n:"Bitcoin",  color:"#f7931a", cgId:"bitcoin"},
    {s:"ETH", n:"Ethereum", color:"#627eea", cgId:"ethereum"},
    {s:"SOL", n:"Solana",   color:"#9945ff", cgId:"solana"},
    {s:"BNB", n:"BNB",      color:"#f3ba2f", cgId:"binancecoin"},
  ];
  const stocksData = [
    {s:"NVDA", n:"NVIDIA",  color:"#76b900", fhSym:"NVDA"},
    {s:"AAPL", n:"Apple",   color:"#555555", fhSym:"AAPL"},
    {s:"TSLA", n:"Tesla",   color:"#e31937", fhSym:"TSLA"},
    {s:"SPY",  n:"S&P 500", color:"#00A8FF", fhSym:"SPY"},
  ];

  const fetchPrices = async () => {
    try {
      // Crypto: CoinGecko (free, no key needed)
      const cgIds = cryptoData.map(c=>c.cgId).join(",");
      const cgRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgIds}&vs_currencies=usd&include_24hr_change=true`);
      if(cgRes.ok){
        const cgData = await cgRes.json();
        const newPrices = {};
        cryptoData.forEach(c=>{
          const d = cgData[c.cgId];
          if(d){ newPrices[c.s] = {price: d.usd, change: d.usd_24h_change||0}; }
        });
        // Stocks: Finnhub
        await Promise.all(stocksData.map(async st=>{
          try{
            const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${st.fhSym}&token=${FINNHUB_KEY}`);
            if(r.ok){ const d=await r.json(); if(d.c>0) newPrices[st.s]={price:d.c, change:d.dp||0}; }
          }catch(e){}
        }));
        setPrices(newPrices);
        setLastUpdate(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}));
      }
    } catch(e){}
    setLoading(false);
  };

  useEffect(()=>{ fetchPrices(); const iv=setInterval(fetchPrices,60000); return()=>clearInterval(iv); },[]);

  const fmtPrice = (sym, p) => {
    if(!p) return "â";
    if(["BTC","ETH"].includes(sym)) return "$"+Math.round(p).toLocaleString("en-US");
    if(p>=1000) return "$"+p.toLocaleString("en-US",{maximumFractionDigits:2});
    return "$"+p.toFixed(2);
  };

  const items = tab==="crypto" ? cryptoData : stocksData;

  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,overflow:"hidden",marginBottom:20}}>
      <div style={{padding:"16px 18px 0",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#00A8FF,#0066CC)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>ð</div>
            <div>
              <div style={{color:C.text,fontWeight:800,fontSize:14}}>Live Markets</div>
              <div style={{color:C.muted2,fontSize:11}}>{lastUpdate ? `Updated ${lastUpdate}` : "Loading..."}</div>
            </div>
          </div>
          <button onClick={fetchPrices} title="Refresh" style={{background:"none",border:"none",cursor:"pointer",color:C.muted2,fontSize:16,padding:4}}>â³</button>
        </div>
        <div style={{display:"flex",gap:0,marginBottom:-1}}>
          {[{k:"crypto",l:"ð· Crypto"},{k:"stocks",l:"ð Stocks"}].map(({k,l})=>(
            <button key={k} onClick={()=>setTab(k)}
              style={{flex:1,padding:"7px",border:"none",borderBottom:`2px solid ${tab===k?"#00A8FF":"transparent"}`,background:"transparent",color:tab===k?"#00A8FF":C.muted2,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.15s"}}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"12px 18px"}}>
        {loading && <div style={{textAlign:"center",color:C.muted2,fontSize:12,padding:"16px 0"}}>Fetching live prices...</div>}
        {!loading && items.map((item,i)=>{
          const p = prices[item.s];
          const up = p && p.change >= 0;
          return(
            <a key={i} href={`https://www.tradingview.com/symbols/${tab==="crypto"?item.s+"USD":item.s}/`}
              target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<items.length-1?10:0,paddingBottom:i<items.length-1?10:0,borderBottom:i<items.length-1?`1px solid ${C.border}`:"none",textDecoration:"none"}}>
              <div style={{width:36,height:36,borderRadius:10,background:item.color+"22",border:`1px solid ${item.color}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontWeight:900,fontSize:10,color:item.color}}>{item.s[0]}</span>
              </div>
              <div style={{flex:1}}>
                <div style={{color:C.text,fontWeight:700,fontSize:13}}>{item.n}</div>
                <div style={{color:C.muted2,fontSize:11}}>{item.s}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:C.text,fontWeight:800,fontSize:13,fontFamily:"monospace"}}>{fmtPrice(item.s, p?.price)}</div>
                {p && <div style={{color:up?"#10b981":"#ef4444",fontSize:11,fontWeight:700}}>{up?"â²":"â¼"}{Math.abs(p.change).toFixed(2)}%</div>}
              </div>
            </a>
          );
        })}
        <div style={{marginTop:12,padding:"8px",background:"rgba(0,168,255,0.05)",borderRadius:8,textAlign:"center"}}>
          <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer"
            style={{color:"#00A8FF",fontSize:11,fontWeight:600,textDecoration:"none"}}>
            ð Full charts on TradingView â
          </a>
        </div>
      </div>
    </div>
  );
}

// ââ AI ASSISTANT ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function AIAssistant({lang,onClose}){
  const t=LANGS[lang];
  const [msgs,setMsgs]=useState([{role:"ai",text:t.aiHello}]);
  const [input,setInput]=useState(""),[loading,setLoading]=useState(false);
  const endRef=useRef();
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);

  const respuestaLocal = (msg) => {
    const m = msg.toLowerCase();
    if(m.includes("p/e") || m.includes("pe ratio") || m.includes("price to earn"))
      return "ð El P/E ratio (Price-to-Earnings) indica cuÃ¡nto pagan los inversores por cada $1 de ganancia. Un P/E bajo puede indicar que la acciÃ³n estÃ¡ barata; uno alto que tiene altas expectativas de crecimiento. Por ejemplo, el S&P 500 tiene un P/E histÃ³rico de ~15-20x.\n\nâ ï¸ No es consejo financiero.";
    if(m.includes("nvidia") || m.includes("nvda"))
      return "ð NVIDIA (NVDA) es el lÃ­der mundial en chips para IA y data centers. Sus GPU H100/H200 son esenciales para entrenar modelos de IA. El crecimiento depende de la demanda de infraestructura de IA. Revisa los earnings trimestrales para ver si mantiene el momentum.\n\nâ ï¸ No es consejo financiero.";
    if(m.includes("bitcoin") || m.includes("btc"))
      return "â¿ Bitcoin es la criptomoneda #1 por capitalizaciÃ³n. Su precio sigue ciclos de ~4 aÃ±os ligados al halving (reducciÃ³n de oferta). Instituciones como BlackRock y Fidelity ya tienen ETFs de BTC aprobados. Muchos lo ven como reserva de valor digital.\n\nâ ï¸ No es consejo financiero.";
    if(m.includes("ethereum") || m.includes("eth"))
      return "ð· Ethereum es la blockchain mÃ¡s usada para DeFi, NFTs y contratos inteligentes. Desde el merge a Proof of Stake en 2022, ETH tiene mecÃ¡nica deflacionaria. Su valor estÃ¡ ligado al uso del ecosistema de apps descentralizadas.\n\nâ ï¸ No es consejo financiero.";
    if(m.includes("dividendo") || m.includes("dividend"))
      return "ð° Las acciones de dividendos son empresas que pagan parte de sus ganancias a los accionistas regularmente. Ejemplos populares: $KO (Coca-Cola ~3%), $JNJ (J&J ~3%), $AAPL (Apple ~0.5%). Son populares para ingreso pasivo a largo plazo.\n\nâ ï¸ No es consejo financiero.";
    if(m.includes("sp500") || m.includes("s&p") || m.includes("nasdaq") || m.includes("indice") || m.includes("Ã­ndice"))
      return "ð El S&P 500 es el Ã­ndice de las 500 empresas mÃ¡s grandes de EE.UU. HistÃ³ricamente retorna ~10% anual. El NASDAQ incluye mÃ¡s tecnologÃ­a. Invertir en ETFs como SPY o QQQ es la forma mÃ¡s simple de exposiciÃ³n diversificada al mercado americano.\n\nâ ï¸ No es consejo financiero.";
    if(m.includes("empezar") || m.includes("comenzar") || m.includes("principiante") || m.includes("nuevo") || m.includes("cÃ³mo invierto") || m.includes("como invierto"))
      return "ð± Para empezar: 1) EdÃºcate gratis (YouTube, NexoTrade). 2) Define cuÃ¡nto puedes perder sin estrÃ©s. 3) Empieza con ETFs diversificados (SPY, QQQ). 4) Practica con el Paper Trading de NexoTrade ($100k virtual). 5) Nunca inviertas lo que necesitas para vivir.\n\nâ ï¸ No es consejo financiero.";
    if(m.includes("tesla") || m.includes("tsla"))
      return "ð Tesla (TSLA) es lÃ­der en vehÃ­culos elÃ©ctricos y almacenamiento de energÃ­a. Su precio es muy volÃ¡til, influenciado por los comentarios de Elon Musk y las entregas trimestrales. TambiÃ©n tiene negocios en energÃ­a solar y software FSD.\n\nâ ï¸ No es consejo financiero.";
    if(m.includes("apple") || m.includes("aapl"))
      return "ð Apple (AAPL) es la empresa mÃ¡s valiosa del mundo. Sus ingresos vienen del iPhone (~50%), servicios (App Store, iCloud ~25%) y Mac/iPad. Tiene $165B+ en caja y recompra acciones agresivamente. Se considera una inversiÃ³n defensiva de calidad.\n\nâ ï¸ No es consejo financiero.";
    return `ð¤ Gracias por tu pregunta sobre "${msg.substring(0,40)}". En NexoTrade puedes ver anÃ¡lisis de la comunidad en el feed en tiempo real. Para anÃ¡lisis mÃ¡s profundos, revisa los Picks VIP semanales o pregunta en el feed a otros traders.\n\nâ ï¸ No es consejo financiero. Consulta un asesor antes de invertir.`;
  };

  const send = async(text) => {
    if(!text.trim()||loading)return;
    const userMsg=text;
    setInput("");
    setMsgs(prev=>[...prev,{role:"user",text:userMsg}]);
    setLoading(true);
    try{
      const res=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({message:userMsg,systemPrompt:t.aiSys})
      });
      if(!res.ok) throw new Error("api_error");
      const data=await res.json();
      const reply=data.reply||respuestaLocal(userMsg);
      setMsgs(prev=>[...prev,{role:"ai",text:reply}]);
    }catch(e){
      // Si la API falla, responde con IA local inmediatamente
      setMsgs(prev=>[...prev,{role:"ai",text:respuestaLocal(userMsg)}]);
    }
    setLoading(false);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#00000066",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,borderRadius:22,width:480,maxWidth:"94vw",height:560,display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.15)",border:`1px solid ${C.border}`}}>
        {/* Header */}
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,background:`linear-gradient(135deg,${C.accentDim},${C.blueBg})`,borderRadius:"22px 22px 0 0"}}>
          <div style={{width:42,height:42,borderRadius:12,background:`linear-gradient(135deg,${C.accent},#0099ff)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>ð¤</div>
          <div>
            <div style={{fontWeight:800,color:C.text,fontSize:15}}>NexoTrade AI</div>
            <div style={{fontSize:11,color:C.bull,display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:C.bull,display:"inline-block"}}/>Online</div>
          </div>
          <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:C.muted2,fontSize:20}}>Ã</button>
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
          <Btn onClick={()=>send(input)} style={{padding:"9px 16px"}}>â</Btn>
        </div>
      </div>
    </div>
  );
}

// ââ AUTH MODAL ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function AuthModal({mode,onClose,onAuth,lang}){
  const t=LANGS[lang];
  const [tab,setTab]=useState(mode),[name,setName]=useState(""),[email,setEmail]=useState(""),[pass,setPass]=useState("");
  const [avatar,setAvatar]=useState(AVATAR_OPTIONS[0]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  // Sanitize username: lowercase, no spaces, only letters/numbers/underscore, max 20
  const sanitizeUsername = (v) => v.toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,20);

  const submit=async()=>{
    if(tab==="register"){
      if(!name.trim()){setError(lang==="en"?"Please choose a @username.":"Por favor elige un @username.");return;}
      if(name.length < 3){setError(lang==="en"?"Username must be at least 3 characters.":"El username debe tener al menos 3 caracteres.");return;}
      if(!email||!pass){setError(lang==="en"?"Please complete email and password.":"Por favor completa email y contraseÃ±a.");return;}
      if(pass.length < 6){setError(lang==="en"?"Password must be at least 6 characters.":"La contraseÃ±a debe tener al menos 6 caracteres.");return;}
    } else {
      if(!email||!pass){setError(lang==="en"?"Please complete email and password.":"Por favor completa email y contraseÃ±a.");return;}
    }
    setLoading(true);setError("");
    try{
      if(tab==="register"){
        const finalUsername = sanitizeUsername(name) || email.split("@")[0];
        const {data,error:err}=await supabase.auth.signUp({
          email,password:pass,
          options:{data:{username:finalUsername,avatar_emoji:avatar.emoji,avatar_color:avatar.color}}
        });
        if(err){setError(err.message);setLoading(false);return;}
        // Insertar perfil en tabla profiles
        try{
          await supabase.from("profiles").upsert({
            id:data.user?.id,
            username:finalUsername,
            avatar_emoji:avatar.emoji,
            avatar_color:avatar.color,
            bio: lang==="en"?"New on NexoTrade ð":"Nuevo en NexoTrade ð",
            points:100,
          });
        }catch(e){}
        // Email de bienvenida via Edge Function (no bloquea el flujo)
        try{
          supabase.functions.invoke("send-welcome",{body:{email,name:finalUsername}});
        }catch(e){}
        onAuth({
          id:data.user?.id||"local",
          name:finalUsername,
          username:finalUsername,
          emoji:avatar.emoji,avatarColor:avatar.color,
          followers:0,following:0,posts:0,points:100,badges:["early"],
          bio: lang==="en"?"New on NexoTrade ð":"Nuevo en NexoTrade ð"
        }, true);
      }else{
        const {data,error:err}=await supabase.auth.signInWithPassword({email,password:pass});
        if(err){setError(err.message==="Invalid login credentials"?"Email o contraseÃ±a incorrectos":err.message);setLoading(false);return;}
        // Cargar perfil de la BD
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
        const uname = profile?.username || data.user.user_metadata?.username || email.split("@")[0];
        onAuth({
          id:data.user.id,
          email:data.user.email,
          name:uname,
          username:uname,
          emoji:profile?.avatar_emoji||data.user.user_metadata?.avatar_emoji||avatar.emoji,
          avatarColor:profile?.avatar_color||data.user.user_metadata?.avatar_color||C.accent,
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
      setError("Error de conexiÃ³n. IntÃ©ntalo de nuevo.");
    }
    setLoading(false);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"#00000066",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,borderRadius:22,padding:32,width:420,maxWidth:"94vw",maxHeight:"90vh",overflowY:"auto",boxShadow:C.shadowMd,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",gap:4,marginBottom:24,background:C.card2,borderRadius:12,padding:4}}>
          {["login","register"].map(tb=><button key={tb} onClick={()=>setTab(tb)} style={{flex:1,padding:"8px",borderRadius:9,border:"none",cursor:"pointer",background:tab===tb?C.accent:"transparent",color:tab===tb?"#fff":C.muted,fontWeight:700,fontSize:13,fontFamily:"inherit"}}>{tb==="login"?t.login:t.register.replace("â","")}</button>)}
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
          <label style={{color:C.muted,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
            {lang==="en"?"USERNAME":"NOMBRE DE USUARIO"}
            <span style={{color:"#ef4444",fontSize:11}}>*</span>
          </label>
          <div style={{position:"relative",marginBottom:0}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.accent,fontWeight:700,fontSize:14,pointerEvents:"none",zIndex:1}}>@</span>
            <input value={name}
              onChange={e=>setName(sanitizeUsername(e.target.value))}
              placeholder={lang==="en"?"yourhandle":"tunickname"}
              maxLength={20}
              style={{...inputSt,paddingLeft:28,marginBottom:0}}
            />
          </div>
          {name.length>0 && (
            <div style={{fontSize:11,color:name.length>=3?C.bull:"#f59e0b",marginBottom:12,marginTop:4,paddingLeft:4,display:"flex",alignItems:"center",gap:4}}>
              {name.length>=3
                ? <><span style={{color:C.bull}}>â</span> @{name} {lang==="en"?"looks good!":"Â¡disponible!"}</>
                : <><span>â </span> {lang==="en"?"At least 3 characters":"MÃ­nimo 3 caracteres"}</>
              }
            </div>
          )}
          {name.length===0 && <div style={{marginBottom:12}}/>}
        </>}
        <label style={{color:C.muted,fontSize:12,fontWeight:700}}>{t.email.toUpperCase()}</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" type="email" style={inputSt}/>
        <label style={{color:C.muted,fontSize:12,fontWeight:700}}>{t.password.toUpperCase()}</label>
        <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="â¢â¢â¢â¢â¢â¢â¢â¢" type="password"
          onKeyDown={e=>e.key==="Enter"&&submit()}
          style={{...inputSt,marginBottom:error?12:24}}/>
        {error&&<div style={{background:"rgba(255,77,106,0.08)",border:"1px solid rgba(255,77,106,0.25)",borderRadius:9,padding:"9px 14px",marginBottom:16,fontSize:12.5,color:C.bear,lineHeight:1.5}}>{error}</div>}
        <Btn onClick={submit} style={{width:"100%",padding:"12px",opacity:loading?0.7:1}}>
          {loading?"â³ Un momento...":(tab==="login"?`${t.login} â`:`${t.join.replace("Ãnete a ","").replace("Join ","")} â`)}
        </Btn>
        {tab==="register"&&<p style={{margin:"14px 0 0",color:C.muted2,fontSize:11,textAlign:"center",lineHeight:1.6}}>
          ð Al registrarte recibes <strong style={{color:C.accentText}}>100 puntos de bienvenida</strong> y la insignia <strong>ð Early Adopter</strong>
        </p>}
      </div>
    </div>
  );
}

// ââ PROFILE PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ProfilePage({user,currentUser,isFollowing,onFollow,onClose,lang}){
  const t=LANGS[lang];
  const userPosts=MOCK_POSTS.filter(p=>p.user===user.name);
  const lvl=getLevel(user.points);
  const userBadges=BADGES.filter(b=>user.badges?.includes(b.id));
  const progressToNext=LEVELS.find(l=>l.min>user.points);
  const progress=progressToNext?((user.points-lvl.min)/(progressToNext.min-lvl.min)*100):100;
  const accent=user.avatarColor||C.accent;
  const [activeTab,setActiveTab]=useState("posts");
  const [counted,setCounted]=useState(false);
  const [displayStats,setDisplayStats]=useState({followers:0,following:0,posts:0,points:0});

  // Animate counters on open
  useEffect(()=>{
    if(counted) return;
    const targets={followers:user.followers,following:user.following,posts:user.posts,points:user.points};
    const dur=900, steps=40, interval=dur/steps;
    let step=0;
    const iv=setInterval(()=>{
      step++;
      const pct=step/steps;
      const ease=1-Math.pow(1-pct,3);
      setDisplayStats({
        followers:Math.round(targets.followers*ease),
        following:Math.round(targets.following*ease),
        posts:Math.round(targets.posts*ease),
        points:Math.round(targets.points*ease),
      });
      if(step>=steps){ clearInterval(iv); setCounted(true); }
    },interval);
    return ()=>clearInterval(iv);
  },[]);

  // Infer trading style tags from posts
  const topTickers=[...new Set(userPosts.map(p=>p.ticker).filter(Boolean))].slice(0,4);
  const tradeStyle=user.points>5000?"ð Diamond Trader":user.points>2000?"â¡ Active Trader":user.points>500?"ð Growing Trader":"ð± New Trader";
  const joinYear=user.joined||"2024";

  // All achievements (locked + unlocked)
  const ACHIEVEMENTS=[
    {id:"first_post",  emoji:"âï¸", name:"Primer Post",     desc:"Publicaste tu primer anÃ¡lisis",   unlocked:user.posts>=1},
    {id:"10posts",     emoji:"ð¥", name:"En Racha",        desc:"10 publicaciones",                 unlocked:user.posts>=10},
    {id:"100likes",    emoji:"â¤ï¸", name:"100 Likes",       desc:"Recibiste 100 likes en total",     unlocked:(user.followers||0)>=50},
    {id:"verified",    emoji:"â", name:"Verificado",      desc:"Identidad verificada",             unlocked:user.badges?.includes("verified")},
    {id:"vip",         emoji:"ð", name:"Miembro VIP",     desc:"SuscripciÃ³n VIP activa",           unlocked:user.badges?.includes("vip")},
    {id:"top5",        emoji:"ð", name:"Top 5 Trader",    desc:"Entraste al top 5 del leaderboard",unlocked:user.points>=3000},
    {id:"earlybird",   emoji:"ð¦", name:"Early Adopter",   desc:"Usuario desde los inicios",        unlocked:true},
    {id:"pro",         emoji:"â¡", name:"Miembro PRO",     desc:"SuscripciÃ³n PRO activa",           unlocked:user.badges?.includes("pro")},
  ];

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,borderRadius:28,width:560,maxWidth:"96vw",maxHeight:"92vh",overflowY:"auto",boxShadow:"0 30px 80px rgba(0,0,0,0.35)",border:`1px solid ${C.border}`,position:"relative"}}>

        {/* ââ COVER + HEADER INTEGRADO ââ */}
        <div style={{background:`linear-gradient(135deg,${accent}dd 0%,${accent}66 50%,#0f172a 100%)`,borderRadius:"28px 28px 0 0",padding:"18px 22px 0",position:"relative",overflow:"hidden"}}>
          {/* Chart line SVG sutil */}
          <svg style={{position:"absolute",bottom:0,left:0,width:"100%",opacity:0.12,pointerEvents:"none"}} height="60" viewBox="0 0 560 60" preserveAspectRatio="none">
            <polyline points="0,50 70,35 140,42 210,18 280,28 350,8 420,15 490,5 560,2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {/* Glow orb */}
          <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,background:`radial-gradient(circle,${accent}40,transparent 65%)`,pointerEvents:"none"}}/>

          {/* Close */}
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(0,0,0,0.3)",backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>â</button>

          {/* ââ AVATAR + NAME inline ââ */}
          <div style={{display:"flex",alignItems:"center",gap:16,position:"relative",zIndex:2,paddingBottom:18}}>
            {/* Avatar */}
            <div style={{position:"relative",flexShrink:0}}>
              <div style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${accent},${accent}77)`,padding:3,boxShadow:`0 0 0 2px rgba(255,255,255,0.15),0 0 24px ${accent}55`}}>
                <div style={{width:"100%",height:"100%",borderRadius:17,background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34}}>
                  {user.emoji}
                </div>
              </div>
              <div style={{position:"absolute",bottom:-3,right:-3,width:18,height:18,borderRadius:6,background:"#10B981",border:"2px solid #0f172a",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>
              </div>
            </div>
            {/* Name + badges */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:-0.5}}>{user.name}</span>
                {user.badges?.includes("verified")&&<span style={{background:"rgba(59,130,246,0.25)",border:"1px solid rgba(59,130,246,0.4)",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:800,color:"#93c5fd"}}>â Verificado</span>}
                {user.badges?.includes("vip")&&<span style={{background:"linear-gradient(90deg,rgba(245,158,11,0.35),rgba(217,119,6,0.35))",border:"1px solid rgba(245,158,11,0.4)",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:800,color:"#fcd34d"}}>VIP â¦</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                {/* Level badge */}
                <span style={{background:"rgba(0,0,0,0.3)",border:`1px solid ${accent}55`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:4}}>
                  {lvl.emoji} {lang==="en"?lvl.nameEn:lvl.name}
                </span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{tradeStyle}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>Desde {joinYear}</span>
              </div>
            </div>
            {/* Follow button */}
            {currentUser&&currentUser.id!==user.id&&(
              <button onClick={()=>onFollow(user.id)}
                style={{flexShrink:0,background:isFollowing?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",border:`1.5px solid ${isFollowing?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.35)"}`,borderRadius:10,padding:"8px 18px",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:800,transition:"all 0.15s",whiteSpace:"nowrap"}}
                onMouseEnter={e=>{ if(!isFollowing){e.currentTarget.style.background="rgba(255,255,255,0.25)";} }}
                onMouseLeave={e=>{ if(!isFollowing){e.currentTarget.style.background="rgba(255,255,255,0.15)";} }}>
                {isFollowing?(lang==="en"?"â Following":"â Siguiendo"):(lang==="en"?"+ Follow":"+ Seguir")}
              </button>
            )}
          </div>

          {/* ââ QUICK STATS BAR ââ */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:"rgba(0,0,0,0.2)",borderRadius:"14px 14px 0 0",overflow:"hidden",position:"relative",zIndex:2}}>
            {[
              {label:lang==="en"?"Followers":"Seguidores", value:fmtNum(displayStats.followers), color:accent},
              {label:lang==="en"?"Following":"Siguiendo",  value:fmtNum(displayStats.following),  color:"#94a3b8"},
              {label:"Posts",                              value:fmtNum(displayStats.posts),       color:"#10B981"},
              {label:"XP",                                 value:fmtNum(displayStats.points),      color:"#F59E0B"},
            ].map((s,i)=>(
              <div key={i} style={{padding:"10px 6px",textAlign:"center",background:"rgba(0,0,0,0.15)"}}>
                <div style={{fontWeight:900,color:s.color,fontSize:16,letterSpacing:"-0.5px"}}>{s.value}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:1,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ââ BODY ââ */}
        <div style={{padding:"0 24px 20px"}}>
          <div style={{marginTop:16,marginBottom:14}}>

          {/* Bio */}
          {user.bio&&<p style={{color:C.muted,fontSize:13,lineHeight:1.6,margin:"0 0 14px",padding:"9px 13px",background:C.card2,borderRadius:10,border:`1px solid ${C.border}`}}>{user.bio}</p>}

          {/* Tickers favoritos */}
          {topTickers.length>0&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {topTickers.map(tk=>(
                <span key={tk} style={{background:`${accent}18`,border:`1px solid ${accent}44`,borderRadius:8,padding:"3px 10px",fontSize:12,fontWeight:700,color:accent,fontFamily:"monospace"}}>${tk}</span>
              ))}
              <span style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,padding:"3px 10px",fontSize:11,color:C.muted2}}>tickers frecuentes</span>
            </div>
          )}

          {/* ââ PROGRESS BAR ââ */}
          {progressToNext&&(
            <div style={{marginBottom:20,background:C.card2,borderRadius:14,padding:"12px 16px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:800,color:C.text}}>{lvl.emoji} {lang==="en"?lvl.nameEn:lvl.name}</span>
                <span style={{fontSize:11,color:C.muted2}}>{user.points.toLocaleString()} / {progressToNext.min.toLocaleString()} pts</span>
                <span style={{fontSize:12,fontWeight:800,color:C.muted}}>{getLevel(progressToNext.min).emoji} {lang==="en"?getLevel(progressToNext.min).nameEn:getLevel(progressToNext.min).name}</span>
              </div>
              <div style={{background:C.border,borderRadius:20,height:10,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:20,width:`${progress}%`,background:`linear-gradient(90deg,${accent},#00c49a)`,transition:"width 1s ease",boxShadow:`0 0 8px ${accent}88`}}/>
              </div>
              <div style={{fontSize:11,color:C.muted2,marginTop:5,textAlign:"right"}}>{Math.round(progress)}% hacia el siguiente nivel</div>
            </div>
          )}

          {/* ââ TABS ââ */}
          <div style={{display:"flex",gap:4,marginBottom:16,background:C.card2,borderRadius:12,padding:4,border:`1px solid ${C.border}`}}>
            {[["posts","âï¸ Posts"],["badges","ð Logros"]].map(([k,l])=>(
              <button key={k} onClick={()=>setActiveTab(k)}
                style={{flex:1,background:activeTab===k?C.surface:"transparent",border:activeTab===k?`1px solid ${C.border}`:"1px solid transparent",borderRadius:9,padding:"8px 0",cursor:"pointer",color:activeTab===k?C.text:C.muted,fontSize:13,fontWeight:activeTab===k?800:600,transition:"all 0.15s",boxShadow:activeTab===k?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>
                {l}
              </button>
            ))}
          </div>

          {/* ââ TAB: POSTS ââ */}
          {activeTab==="posts"&&(
            userPosts.length===0
              ?<div style={{textAlign:"center",padding:"32px 0",color:C.muted2}}>
                  <div style={{fontSize:36,marginBottom:8}}>ð­</div>
                  <div style={{fontSize:13}}>Sin publicaciones aÃºn</div>
                </div>
              :userPosts.slice(0,8).map(p=>(
                <div key={p.id} style={{background:C.card2,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${C.border}`,transition:"box-shadow 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shadowMd}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                  <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                    <TickerBadge ticker={p.ticker} sentiment={p.sentiment}/>
                    <SentPill sentiment={p.sentiment} lang={lang}/>
                    <span style={{marginLeft:"auto",color:C.muted2,fontSize:11}}>{p.time}</span>
                  </div>
                  <p style={{margin:"0 0 10px",color:C.text,fontSize:13.5,lineHeight:1.6}}>{p.text}</p>
                  <div style={{display:"flex",gap:14,color:C.muted2,fontSize:12}}>
                    <span>â¤ï¸ {p.likes}</span>
                    <span>ð¬ {p.comments}</span>
                    <span style={{marginLeft:"auto",color:accent,fontSize:11,fontWeight:700,cursor:"pointer"}}>Ver â</span>
                  </div>
                </div>
              ))
          )}

          {/* ââ TAB: BADGES / LOGROS ââ */}
          {activeTab==="badges"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
              {ACHIEVEMENTS.map(a=>(
                <div key={a.id} style={{background:a.unlocked?C.card2:"#f8fafc",border:`1px solid ${a.unlocked?accent+"44":C.border}`,borderRadius:14,padding:"14px 16px",display:"flex",gap:12,alignItems:"flex-start",opacity:a.unlocked?1:0.5,transition:"transform 0.15s",cursor:a.unlocked?"default":"not-allowed"}}
                  onMouseEnter={e=>{if(a.unlocked)e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <div style={{width:40,height:40,borderRadius:12,background:a.unlocked?`${accent}22`:"#f1f5f9",border:`1px solid ${a.unlocked?accent+"44":"#e2e8f0"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                    {a.unlocked?a.emoji:"ð"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,color:a.unlocked?C.text:C.muted,fontSize:13}}>{a.name}</div>
                    <div style={{color:C.muted2,fontSize:11,marginTop:2,lineHeight:1.4}}>{a.desc}</div>
                    {a.unlocked&&<div style={{fontSize:10,color:accent,fontWeight:700,marginTop:4}}>â Desbloqueado</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ââ ALERTS PANEL ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function AlertsPanel({lang,onClose,onAlertChange}){
  const [alerts,setAlerts]=useState(()=>{
    try{ return JSON.parse(localStorage.getItem("nexotrade-alerts")||"[]"); }
    catch(e){ return []; }
  });
  const [newT,setNewT]=useState(""),[newV,setNewV]=useState(""),[newType,setNewType]=useState("price_above");
  const typeLabels={"price_above":"â Precio sube de","price_below":"â Precio baja de","earnings":"ð Earnings","mentions":"ð¬ Menciones pico"};
  return(
    <div style={{position:"fixed",inset:0,background:"#00000066",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surface,borderRadius:22,width:460,maxWidth:"94vw",boxShadow:C.shadowMd,border:`1px solid ${C.border}`}}>
        <div style={{padding:"18px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.card2,borderRadius:"22px 22px 0 0"}}>
          <h3 style={{margin:0,color:C.text,fontSize:16,fontWeight:800}}>ð Mis Alertas</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.muted2,fontSize:20}}>Ã</button>
        </div>
        <div style={{padding:20,maxHeight:400,overflowY:"auto"}}>
          {alerts.map(a=>(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:a.active?C.card2:"#f8fafc",border:`1px solid ${a.active?C.border:"#e2e8f0"}`,borderRadius:12,marginBottom:10,opacity:a.active?1:0.6}}>
              <span style={{fontSize:20}}>{a.type==="earnings"?"ð":a.type==="price_above"?"ð":"ð"}</span>
              <div style={{flex:1}}>
                <span style={{background:C.accentDim,color:C.accentText,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:800,fontFamily:"monospace",marginRight:8}}>${a.ticker}</span>
                <span style={{color:C.muted,fontSize:12}}>{typeLabels[a.type]} <strong style={{color:C.text}}>{a.value}</strong></span>
              </div>
              <button onClick={()=>{const upd=alerts.map(x=>x.id===a.id?{...x,active:!x.active}:x);setAlerts(upd);localStorage.setItem("nexotrade-alerts",JSON.stringify(upd));if(onAlertChange)onAlertChange(upd);}} style={{background:a.active?C.bull+"22":C.card2,border:`1px solid ${a.active?C.bull+"44":C.border}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",color:a.active?C.bull:C.muted2,fontSize:11,fontWeight:700}}>{a.active?"ON":"OFF"}</button>
              <button onClick={()=>{const upd=alerts.filter(x=>x.id!==a.id);setAlerts(upd);localStorage.setItem("nexotrade-alerts",JSON.stringify(upd));if(onAlertChange)onAlertChange(upd);}} style={{background:"none",border:"none",cursor:"pointer",color:C.muted2,fontSize:16}}>Ã</button>
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
            <Btn small onClick={()=>{if(!newT)return;const upd=[...alerts,{id:Date.now(),ticker:newT,type:newType,value:newV||"â",active:true}];setAlerts(upd);localStorage.setItem("nexotrade-alerts",JSON.stringify(upd));if(onAlertChange)onAlertChange(upd);setNewT("");setNewV("");}}>+ AÃ±adir</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ââ COPY LINK BUTTON âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function CopyLinkBtn({postId, ticker}){
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const url = `https://nexotradeia.com/?post=${postId}&ticker=${ticker||""}`;
    try{ navigator.clipboard.writeText(url); }catch(e){ }
    setCopied(true);
    setTimeout(()=>setCopied(false), 1800);
  };
  return(
    <button onClick={copy} title="Copiar enlace"
      style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:3,color:copied?"#00A8FF":"#94A3B8",fontSize:11,fontWeight:600,padding:"4px 8px",borderRadius:7,transition:"all 0.15s"}}
      onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,168,255,0.07)";e.currentTarget.style.color="#00A8FF";}}
      onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=copied?"#00A8FF":"#94A3B8";}}>
      {copied ? "â" : "ð"}
    </button>
  );
}

// ââ POST CARD âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const CONF_LEVELS=[{min:80,label:"Alta",col:"#00E58F"},{min:60,label:"Media",col:"#F59E0B"},{min:0,label:"Baja",col:"#64748B"}];
// Mini sparkline data per post
const SPARKLINES=[[40,42,38,45,50,48,55,60,58,65],[70,68,72,65,60,62,58,55,52,48],[30,35,33,40,42,45,50,48,55,60],[55,52,58,60,65,63,70,68,75,80]];

function LinkPreviewCard({url}){
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  let domain = "";
  try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch {}

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);
    setErrored(false);
    // Usar microlink.io â gratis, sin API key, devuelve OG title/description/image
    fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=false`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.status === "success" && d.data) {
          setMeta({
            title:       d.data.title || "",
            description: d.data.description || "",
            image:       d.data.image?.url || d.data.logo?.url || null,
            logo:        d.data.logo?.url || null,
            publisher:   d.data.publisher || domain,
          });
        } else {
          setErrored(true);
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setErrored(true); setLoading(false); } });
    return () => { cancelled = true; };
  }, [url]);

  if (!domain) return null;

  // Fallback minimalista si falla la API
  if (errored || (!loading && !meta)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
        style={{display:"flex",alignItems:"center",gap:10,background:"var(--c-card2)",border:"1px solid var(--c-border)",borderRadius:12,padding:"10px 14px",marginBottom:10,textDecoration:"none",boxSizing:"border-box",width:"100%"}}>
        <img src={`https://www.google.com/s2/favicons?sz=32&domain=${domain}`} alt="" width={20} height={20} style={{borderRadius:4,flexShrink:0}} onError={e=>{e.target.style.display="none";}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,color:"var(--c-muted2)",fontWeight:700,textTransform:"uppercase",letterSpacing:0.4}}>{domain}</div>
          <div style={{fontSize:11,color:"var(--c-accent)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{url}</div>
        </div>
        <span style={{fontSize:13,color:"var(--c-muted2)",flexShrink:0}}>â</span>
      </a>
    );
  }

  // Skeleton mientras carga
  if (loading) {
    return (
      <div style={{border:"1px solid var(--c-border)",borderRadius:14,overflow:"hidden",marginBottom:10,background:"var(--c-card2)"}}>
        <div style={{height:160,background:"linear-gradient(90deg,var(--c-border) 25%,var(--c-card2) 50%,var(--c-border) 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite"}}/>
        <div style={{padding:"12px 14px"}}>
          <div style={{height:12,width:"70%",background:"var(--c-border)",borderRadius:4,marginBottom:8}}/>
          <div style={{height:10,width:"90%",background:"var(--c-border)",borderRadius:4}}/>
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    );
  }

  // Card rica con imagen del artÃ­culo
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}
      style={{display:"block",border:"1px solid var(--c-border)",borderRadius:14,overflow:"hidden",marginBottom:10,textDecoration:"none",background:"var(--c-card2)",transition:"border-color 0.18s, box-shadow 0.18s",boxSizing:"border-box",width:"100%"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(0,168,255,0.4)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,168,255,0.1)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--c-border)";e.currentTarget.style.boxShadow="none";}}>

      {/* Imagen del artÃ­culo */}
      {meta.image && (
        <div style={{width:"100%",height:180,overflow:"hidden",background:"var(--c-border)"}}>
          <img src={meta.image} alt={meta.title}
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"transform 0.3s"}}
            onError={e=>{e.target.parentElement.style.display="none";}}
            onMouseEnter={e=>{e.target.style.transform="scale(1.03)";}}
            onMouseLeave={e=>{e.target.style.transform="scale(1)";}}
          />
        </div>
      )}

      {/* Texto del artÃ­culo */}
      <div style={{padding:"12px 14px"}}>
        {/* Publisher + favicon */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
          {meta.logo
            ? <img src={meta.logo} alt="" width={14} height={14} style={{borderRadius:3,flexShrink:0}} onError={e=>{e.target.style.display="none";}}/>
            : <img src={`https://www.google.com/s2/favicons?sz=16&domain=${domain}`} alt="" width={14} height={14} style={{borderRadius:3,flexShrink:0}} onError={e=>{e.target.style.display="none";}}/>
          }
          <span style={{fontSize:10,fontWeight:700,color:"var(--c-muted2)",textTransform:"uppercase",letterSpacing:0.5}}>{meta.publisher || domain}</span>
          <span style={{marginLeft:"auto",fontSize:12,color:"var(--c-muted2)",flexShrink:0}}>â</span>
        </div>

        {/* TÃ­tulo */}
        {meta.title && (
          <div style={{fontSize:13,fontWeight:700,color:"var(--c-text)",lineHeight:1.4,marginBottom:4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
            {meta.title}
          </div>
        )}

        {/* DescripciÃ³n */}
        {meta.description && (
          <div style={{fontSize:11,color:"var(--c-muted)",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
            {meta.description}
          </div>
        )}
      </div>
    </a>
  );
}

function PostCard({post,onProfile,onPoints,onTickerClick,lang,isNew,onRepost,user,onNeedAuth,following=[],onFollow,onDM,onDelete}){
  const [liked,setLiked]=useState(false),[likes,setLikes]=useState(post.likes);
  const [reposted,setReposted]=useState(()=>{try{return JSON.parse(localStorage.getItem("nx-rp-"+post.id)||"false");}catch(e){return false;}});
  const [reposts,setReposts]=useState(post.reposts||0);
  const [reposting,setReposting]=useState(false);
  const [showComments,setShowComments]=useState(false);
  const [comments,setComments]=useState([]);
  const [commentText,setCommentText]=useState("");
  const [commentCount,setCommentCount]=useState(post.comments||0);
  const [loadingComments,setLoadingComments]=useState(false);
  const [postingComment,setPostingComment]=useState(false);
  const [deleted,setDeleted]=useState(false);
  const [delConfirm,setDelConfirm]=useState(false);

  // Â¿Es el autor del post?
  const isOwner = user && (user.username===post.user || user.name===post.user || (post.user_id && user.id===post.user_id));
  // Â¿Sigue a este usuario?
  const postUserId = post.user_id;
  const isFollowing = postUserId && following.includes(postUserId);
  const isOtherUser = user && !isOwner;

  const handleDelete = async () => {
    if (!isOwner) return;
    try {
      if (post.id && !String(post.id).startsWith("local")) {
        await supabase.from("posts").delete().eq("id", post.id);
      }
      setDeleted(true);
      if (onDelete) onDelete(post.id);
    } catch(e) { console.error("Error al eliminar:", e); }
    setDelConfirm(false);
  };

  if (deleted) return null;

  const loadComments=async()=>{
    if(loadingComments) return;
    setLoadingComments(true);
    try{
      const {data}=await supabase.from("post_comments").select("id,text,created_at,user_id").eq("post_id",post.id).order("created_at",{ascending:true}).limit(50);
      if(data) setComments(data);
    }catch(e){}
    setLoadingComments(false);
  };

  const toggleComments=()=>{
    const next=!showComments;
    setShowComments(next);
    if(next && comments.length===0) loadComments();
  };

  const submitComment=async()=>{
    if(!user){onNeedAuth&&onNeedAuth();return;}
    if(!commentText.trim()||postingComment) return;
    setPostingComment(true);
    try{
      const {data,error}=await supabase.from("post_comments").insert({post_id:post.id,user_id:user.id,text:commentText.trim()}).select().single();
      if(!error&&data){
        setComments(prev=>[...prev,{...data,username:user.username}]);
        setCommentCount(c=>c+1);
        setCommentText("");
      }
    }catch(e){}
    setPostingComment(false);
  };
  // Convertir id a nÃºmero de forma segura (soporta "local-123..." y nÃºmeros reales)
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
      style={{background:"var(--c-card)",border:"1px solid var(--c-border)",borderRadius:16,padding:"14px 16px",marginBottom:6,transition:"border-color 0.2s, box-shadow 0.2s, transform 0.2s",boxShadow:"var(--c-shadow)"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=isBull?"rgba(22,163,74,0.35)":"rgba(220,38,38,0.25)";e.currentTarget.style.boxShadow=isBull?"0 6px 24px rgba(22,163,74,0.1), 0 2px 8px rgba(0,0,0,0.08)":"0 6px 24px rgba(220,38,38,0.1), 0 2px 8px rgba(0,0,0,0.08)";e.currentTarget.style.transform="translateY(-3px)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--c-border)";e.currentTarget.style.boxShadow="var(--c-shadow)";e.currentTarget.style.transform="translateY(0)";}}>
      <div style={{display:"flex",gap:11,alignItems:"flex-start"}}>
        <div style={{cursor:"pointer",flexShrink:0}} onClick={()=>{const u=MOCK_USERS.find(u=>u.name===post.user);if(u)onProfile(u);}}>
          <AvatarBubble emoji={post.avatar} color={post.avatarColor||C.accent} online={post.id%2===0}/>
        </div>
        <div style={{flex:1,minWidth:0}}>
          {/* Header row */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
            <span style={{fontWeight:700,color:"var(--c-text)",fontSize:14,cursor:"pointer",letterSpacing:-0.3}}
              onClick={()=>{const u=MOCK_USERS.find(u=>u.name===post.user);if(u)onProfile(u);}}>{post.user}</span>
            {post.is_pro&&<span style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",color:"#000",borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:800,letterSpacing:0.5}}>â¡PRO</span>}
            {post.is_premium&&!post.is_pro&&<span style={{background:"linear-gradient(135deg,#7C3AED,#6D28D9)",color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:9,fontWeight:800,letterSpacing:0.5}}>â¦VIP</span>}
            {/* BotÃ³n + Seguir (solo si es otro usuario) */}
            {isOtherUser && onFollow && (
              <button onClick={e=>{e.stopPropagation();if(!user){onNeedAuth&&onNeedAuth();return;}onFollow(postUserId||post.user);}}
                style={{background:isFollowing?"rgba(22,163,74,0.1)":"rgba(0,168,255,0.08)",border:`1px solid ${isFollowing?"rgba(22,163,74,0.3)":"rgba(0,168,255,0.25)"}`,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700,color:isFollowing?"#16A34A":"#00A8FF",cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>
                {isFollowing?"â Siguiendo":"+ Seguir"}
              </button>
            )}
            {/* BotÃ³n DM (solo si es otro usuario y hay sesiÃ³n) */}
            {isOtherUser && onDM && user && (
              <button onClick={e=>{e.stopPropagation();onDM({id:postUserId||post.user, username:post.user, avatar:post.avatar, avatarColor:post.avatarColor});}}
                title="Mensaje privado"
                style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700,color:"#A78BFA",cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>
                ð¬ DM
              </button>
            )}
            <TickerBadge ticker={post.ticker} sentiment={post.sentiment}/>
            <SentPill sentiment={post.sentiment} lang={lang}/>
            <span style={{color:"var(--c-muted2)",fontSize:10.5,marginLeft:"auto",fontVariantNumeric:"tabular-nums"}}>{post.time}</span>
          </div>
          {/* Aviso: post no guardado */}
          {post._failed && (
            <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8,padding:"5px 10px",marginBottom:6,fontSize:11,color:"#EF4444",fontWeight:600}}>
              â ï¸ No se guardÃ³{post._errMsg ? ` â ${post._errMsg}` : " â abre consola del navegador (F12) para ver el error"}.
            </div>
          )}
          {/* Post text */}
          <p style={{margin:"0 0 10px",color:"var(--c-text)",fontSize:14,lineHeight:1.65,fontWeight:400,opacity:0.88}}>{renderWithCashtags(post.text, onTickerClick, onTickerClick)}</p>
          {/* Imagen / GIF */}
          {post.image&&<img src={post.image} alt="" style={{maxWidth:"100%",maxHeight:280,borderRadius:12,marginBottom:10,border:"1px solid var(--c-border)",display:"block"}} onError={e=>e.target.style.display="none"}/>}
          {/* Link preview card */}
          {post.link ? <LinkPreviewCard url={post.link}/> : null}
          {/* Metrics row â compacto */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:3,background:isBull?"rgba(22,163,74,0.08)":"rgba(220,38,38,0.08)",borderRadius:8,padding:"3px 9px",border:`1px solid ${isBull?"rgba(22,163,74,0.18)":"rgba(220,38,38,0.18)"}`}}>
              <span style={{fontSize:10,fontWeight:700,color:isBull?C.bull:C.bear,fontFamily:"monospace"}}>ð¯ {target}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,flex:1,minWidth:100}}>
              <div style={{flex:1,height:2,background:"var(--c-border)",borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${conf}%`,height:"100%",background:confLevel.col,borderRadius:3}}/>
              </div>
              <span style={{fontSize:10,color:confLevel.col,fontWeight:700,whiteSpace:"nowrap"}}>{conf}%</span>
            </div>
            <svg viewBox="0 0 80 20" style={{width:44,height:13,flexShrink:0}}>
              <polyline points={sparkPts} fill="none" stroke={isBull?"#16A34A":"#DC2626"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{display:"flex",alignItems:"center",gap:3,background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.14)",borderRadius:8,padding:"3px 8px"}}>
              <span style={{fontSize:10,fontWeight:700,color:"#3B82F6"}}>ð§  {aiPct}%</span>
            </div>
          </div>
          {/* Tags */}
          {post.tags?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {post.tags.map(tg=><span key={tg} style={{background:"rgba(0,168,255,0.07)",color:"#00A8FF",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600,letterSpacing:0.2}}>#{tg}</span>)}
          </div>}
          {/* Action row */}
          <div style={{display:"flex",gap:0,alignItems:"center",borderTop:"1px solid var(--c-border)",paddingTop:8,marginTop:4}}>
            {[
              {icon:"â¥",val:likes,active:liked,col:"#EF4444",fn:()=>{setLiked(!liked);setLikes(liked?likes-1:likes+1);if(!liked)onPoints(POINT_ACTIONS.like_received,"Â¡Like recibido!");}},
              {icon:"ð¬",val:commentCount,active:showComments,col:"#3B82F6",fn:toggleComments},
            ].map(({icon,val,active,col,fn},i)=>(
              <button key={i} onClick={fn}
                style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:active?col:"var(--c-muted2)",fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:8,transition:"all 0.15s",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,168,255,0.06)";e.currentTarget.style.color=col;}}
                onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=active?col:"var(--c-muted2)";}}>
                <span style={{fontSize:14}}>{icon}</span><span style={{fontVariantNumeric:"tabular-nums"}}>{val}</span>
              </button>
            ))}
            {/* BotÃ³n Replicar */}
            <button
              disabled={reposting}
              onClick={async()=>{
                if(reposting) return;
                setReposting(true);
                const newVal = reposted ? reposts-1 : reposts+1;
                setReposts(newVal);
                setReposted(!reposted);
                try{ localStorage.setItem("nx-rp-"+post.id, JSON.stringify(!reposted)); }catch(e){}
                if(onRepost) await onRepost(post.id, !reposted);
                if(!reposted) onPoints(POINT_ACTIONS.repost||2, lang==="en"?"Reposted! â":"Â¡Replicado! â");
                setReposting(false);
              }}
              style={{background:"none",border:"none",cursor:reposting?"wait":"pointer",display:"flex",alignItems:"center",gap:4,color:reposted?"#16A34A":"var(--c-muted2)",fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:8,transition:"all 0.15s",fontFamily:"inherit",opacity:reposting?0.6:1}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(22,163,74,0.06)";e.currentTarget.style.color="#16A34A";}}
              onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=reposted?"#16A34A":"var(--c-muted2)";}}>
              <span style={{fontSize:14}}>â</span><span style={{fontVariantNumeric:"tabular-nums"}}>{reposts}</span>
            </button>
            <button
              onClick={()=>{
                const txt=`${post.sentiment==="bull"?"ð":"ð"} $${post.ticker} â ${post.text.slice(0,180)}${post.text.length>180?"...":""}\n\nvÃ­a @NexoTradeIA nexotradeia.com`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}`,"_blank","width=560,height=420");
              }}
              title="Compartir en X"
              style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:3,color:"var(--c-muted2)",padding:"5px 8px",borderRadius:8,transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,0,0,0.05)";e.currentTarget.style.color="var(--c-text)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="var(--c-muted2)";}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.638 5.905-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <CopyLinkBtn postId={post.id} ticker={post.ticker}/>
            <span style={{marginLeft:"auto",fontSize:10,color:"var(--c-muted2)",fontWeight:500,display:"flex",alignItems:"center",gap:3}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {((post.likes||0)*3 + (post.comments||0)*5 + (post.reposts||0)*8 + 12).toLocaleString()}
            </span>
            {/* BotÃ³n Eliminar â solo dueÃ±o del post */}
            {isOwner && !delConfirm && (
              <button onClick={()=>setDelConfirm(true)} title="Eliminar mi post"
                style={{background:"none",border:"none",cursor:"pointer",color:"var(--c-muted2)",fontSize:13,padding:"5px 8px",borderRadius:8,transition:"all 0.15s",display:"flex",alignItems:"center"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.08)";e.currentTarget.style.color="#EF4444";}}
                onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="var(--c-muted2)";}}>
                ðï¸
              </button>
            )}
            {isOwner && delConfirm && (
              <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:4}}>
                <span style={{fontSize:11,color:"#EF4444",fontWeight:600}}>Â¿Borrar?</span>
                <button onClick={handleDelete} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,color:"#EF4444",cursor:"pointer"}}>SÃ­</button>
                <button onClick={()=>setDelConfirm(false)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid var(--c-border)",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,color:"var(--c-muted)",cursor:"pointer"}}>No</button>
              </div>
            )}
          </div>

          {/* ââ Panel de comentarios ââ */}
          {showComments&&(
            <div style={{borderTop:"1px solid var(--c-border)",marginTop:8,paddingTop:10}}>
              {loadingComments&&<div style={{color:"var(--c-muted2)",fontSize:12,textAlign:"center",padding:"8px 0"}}>Cargando...</div>}
              {!loadingComments&&comments.length===0&&(
                <div style={{color:"var(--c-muted2)",fontSize:12,textAlign:"center",padding:"6px 0"}}>
                  {lang==="en"?"No replies yet. Be the first!":"Sin respuestas aÃºn. Â¡SÃ© el primero!"}
                </div>
              )}
              {comments.map((c,i)=>(
                <div key={c.id||i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"var(--c-card2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"var(--c-muted2)",flexShrink:0}}>
                    {(c.username||"U")[0].toUpperCase()}
                  </div>
                  <div style={{background:"var(--c-card2)",borderRadius:10,padding:"6px 10px",flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--c-accent)",marginBottom:2}}>{c.username||"Usuario"}</div>
                    <div style={{fontSize:13,color:"var(--c-text)",wordBreak:"break-word"}}>{c.text}</div>
                  </div>
                </div>
              ))}
              {/* Input para nuevo comentario */}
              <div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}>
                <input
                  value={commentText}
                  onChange={e=>setCommentText(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitComment();}}}
                  placeholder={lang==="en"?"Write a reply...":"Escribe una respuesta..."}
                  maxLength={300}
                  style={{flex:1,background:"var(--c-card2)",border:"1px solid var(--c-border)",borderRadius:20,padding:"7px 14px",fontSize:13,color:"var(--c-text)",outline:"none",fontFamily:"inherit"}}
                />
                <button
                  onClick={submitComment}
                  disabled={!commentText.trim()||postingComment}
                  style={{background:"var(--c-accent)",border:"none",borderRadius:20,padding:"7px 16px",color:"#fff",fontSize:12,fontWeight:700,cursor:commentText.trim()&&!postingComment?"pointer":"not-allowed",opacity:commentText.trim()&&!postingComment?1:0.5,fontFamily:"inherit",whiteSpace:"nowrap"}}>
                  {postingComment?"...":lang==="en"?"Reply":"Responder"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ââ NEW POST ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const MENTION_TICKERS_FALLBACK = ["AAPL","MSFT","GOOGL","AMZN","NVDA","TSLA","META","BTC","ETH","SPY","AMD","NFLX","COIN","PLTR","SMCI","ARM","JPM","V","BABA","RIVN"];
const getMentionTickers=()=>{try{return typeof SEARCH_TICKERS!=="undefined"&&SEARCH_TICKERS.length>0?SEARCH_TICKERS:MENTION_TICKERS_FALLBACK;}catch(e){return MENTION_TICKERS_FALLBACK;}};

function NewPost({user,onPost,onNeedAuth,lang,defaultTicker=""}){
  const t=LANGS[lang];
  const [text,setText]=useState(""),[ticker,setTicker]=useState(defaultTicker),[sent,setSent]=useState("bull"),[modMsg,setModMsg]=useState("");
  const [posting,setPosting]=useState(false);
  const [image,setImage]=useState(null);
  const [showGif,setShowGif]=useState(false);
  const [link,setLink]=useState("");
  const [showLink,setShowLink]=useState(false);
  const fileRef=useRef(null);
  const [mentionBox,setMentionBox]=useState({open:false,query:"",results:[],caretPos:0});
  const taRef=useRef();

  const isValidUrl=url=>{try{const u=new URL(url);return u.protocol==="http:"||u.protocol==="https:";}catch(e){return false;}};
  const getDomain=url=>{try{return new URL(url).hostname.replace(/^www\./,"");}catch(e){return url;}};

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
      const allTk=getMentionTickers();
      const results=allTk.filter(t=>t.startsWith(q)).slice(0,8);
      setMentionBox({open:results.length>0||q.length===0,query:q,results:q.length===0?allTk.slice(0,8):results,caretPos:pos});
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
    await onPost({text,ticker:ticker.toUpperCase()||"GENERAL",sentiment:sent,image:image||null,link:link.trim()&&isValidUrl(link.trim())?link.trim():null});
    setText("");setTicker("");setModMsg("");setImage(null);setShowGif(false);setLink("");setShowLink(false);
    setPosting(false);
  };

  return(
    <div style={{background:"var(--c-card)",border:"1px solid var(--c-border)",borderRadius:16,padding:"14px 16px",marginBottom:10,boxShadow:"var(--c-shadow)",boxSizing:"border-box",width:"100%",overflow:"hidden"}}>
      {modMsg&&<div style={{background:"rgba(255,77,106,0.08)",border:"1px solid rgba(255,77,106,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#EF4444"}}>{modMsg}</div>}
      <div style={{display:"flex",gap:10}}>
        {user?<AvatarBubble emoji={user.emoji} color={user.avatarColor||C.accent} online level={user.points}/>:<div style={{width:36,height:36,borderRadius:"50%",background:"var(--c-border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>ð¤</div>}
        <div style={{flex:1,position:"relative",minWidth:0,overflow:"hidden"}}>
          {!user&&<div style={{fontSize:13,color:"var(--c-muted)",marginBottom:8}}>
            <span style={{color:C.accent,fontWeight:700,cursor:"pointer"}} onClick={onNeedAuth}>{t.login}</span> para compartir tu anÃ¡lisis
          </div>}
          <textarea ref={taRef} value={text} onChange={handleTextChange}
            placeholder="Â¿QuÃ© piensas del mercado? Usa $NVDA o @META Â· Enter para publicar"
            style={{width:"100%",background:"var(--c-card2)",border:"1px solid var(--c-border)",borderRadius:10,color:"var(--c-text)",fontSize:13.5,padding:"10px 12px",resize:"none",outline:"none",height:68,fontFamily:"inherit",lineHeight:1.55,boxSizing:"border-box",transition:"border-color 0.15s",minWidth:0}}
            onFocus={e=>e.target.style.borderColor="rgba(0,168,255,0.4)"}
            onBlur={e=>{e.target.style.borderColor="var(--c-border)";setTimeout(()=>setMentionBox(m=>({...m,open:false})),200);}}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}}/>
          {/* @Mention autocomplete */}
          {mentionBox.open&&(
            <div style={{position:"absolute",top:72,left:0,right:0,background:"var(--c-card)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",zIndex:200,overflow:"hidden"}}>
              <div style={{padding:"5px 10px 4px",fontSize:10,color:C.accent,fontWeight:700,letterSpacing:0.8,borderBottom:"1px solid var(--c-border)"}}>MENCIONAR ACTIVO</div>
              {mentionBox.results.map(sym=>(
                <div key={sym} onMouseDown={()=>insertMention(sym)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"7px 12px",cursor:"pointer",transition:"background 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.06)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{background:"rgba(0,168,255,0.08)",color:C.accent,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700,fontFamily:"monospace"}}>@{sym}</span>
                  <span style={{color:"var(--c-muted)",fontSize:11}}>Mencionar {sym}</span>
                </div>
              ))}
            </div>
          )}
          {/* Preview imagen/GIF */}
          {image&&(
            <div style={{position:"relative",marginTop:8,display:"inline-block"}}>
              <img src={image} alt="preview" style={{maxHeight:140,maxWidth:"100%",borderRadius:10,border:"1px solid var(--c-border)",display:"block"}}/>
              <button onClick={()=>setImage(null)} style={{position:"absolute",top:5,right:5,background:"rgba(0,0,0,0.6)",border:"none",borderRadius:"50%",width:22,height:22,cursor:"pointer",color:"#fff",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>â</button>
            </div>
          )}
          {showGif&&<GifPicker onSelect={url=>{setImage(url);setShowGif(false);}} onClose={()=>setShowGif(false)} onText={txt=>{setText(prev=>prev+txt);}}/>}

          {/* ââ Link input + preview ââ */}
          {showLink&&(
            <div style={{marginTop:8}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:14,flexShrink:0}}>ð</span>
                <input
                  value={link}
                  onChange={e=>setLink(e.target.value)}
                  placeholder="https://..."
                  autoFocus
                  style={{flex:1,background:"var(--c-card2)",border:"1px solid rgba(0,168,255,0.25)",borderRadius:8,padding:"7px 11px",fontSize:13,color:"var(--c-text)",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
                  onFocus={e=>e.target.style.borderColor="rgba(0,168,255,0.5)"}
                  onBlur={e=>e.target.style.borderColor="rgba(0,168,255,0.25)"}
                />
                {link&&<button onClick={()=>setLink("")} style={{background:"none",border:"none",color:"var(--c-muted2)",cursor:"pointer",fontSize:14,padding:"2px 4px",borderRadius:4,flexShrink:0}}>â</button>}
              </div>
              {isValidUrl(link)&&(
                <div style={{marginTop:8}}>
                  <LinkPreviewCard url={link}/>
                </div>
              )}
            </div>
          )}

          {/* ââ Bottom bar: 2 filas separadas ââ */}
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
            {/* Fila 1: botones de herramientas */}
            <div style={{display:"flex",gap:5,alignItems:"center"}}>
              {/* Adjuntar foto */}
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
                onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setImage(ev.target.result);r.readAsDataURL(f);e.target.value="";}}/>
              <button onClick={()=>fileRef.current?.click()} title="Subir foto"
                style={{background:"none",border:"none",cursor:"pointer",fontSize:17,color:"var(--c-muted2)",padding:"4px 6px",borderRadius:7,transition:"color 0.15s",lineHeight:1,flexShrink:0}}
                onMouseEnter={e=>e.currentTarget.style.color=C.accent}
                onMouseLeave={e=>e.currentTarget.style.color="var(--c-muted2)"}>ð·</button>
              {/* Media */}
              <button onClick={()=>setShowGif(v=>!v)} title="GIF Â· Emojis Â· Stickers"
                style={{background:showGif?"rgba(124,58,237,0.12)":"none",border:showGif?"1px solid rgba(124,58,237,0.3)":"none",cursor:"pointer",fontSize:11,fontWeight:800,color:showGif?"#7C3AED":"var(--c-muted2)",padding:"4px 9px",borderRadius:7,letterSpacing:0.5,transition:"all 0.15s",display:"flex",alignItems:"center",gap:4,flexShrink:0}}
                onMouseEnter={e=>{e.currentTarget.style.color="#7C3AED";}}
                onMouseLeave={e=>{e.currentTarget.style.color=showGif?"#7C3AED":"var(--c-muted2)";}}>
                <span>ð­</span><span>Media</span>
              </button>
              {/* Link */}
              <button onClick={()=>setShowLink(v=>!v)} title="Agregar enlace"
                style={{background:showLink||isValidUrl(link)?"rgba(0,168,255,0.1)":"none",border:showLink||isValidUrl(link)?"1px solid rgba(0,168,255,0.3)":"none",cursor:"pointer",fontSize:11,fontWeight:800,color:showLink||isValidUrl(link)?C.accent:"var(--c-muted2)",padding:"4px 9px",borderRadius:7,transition:"all 0.15s",display:"flex",alignItems:"center",gap:4,flexShrink:0}}
                onMouseEnter={e=>{e.currentTarget.style.color=C.accent;}}
                onMouseLeave={e=>{e.currentTarget.style.color=showLink||isValidUrl(link)?C.accent:"var(--c-muted2)";}}>
                <span>ð</span><span>Link</span>
              </button>
              {/* Ticker â input mÃ¡s pequeÃ±o en mÃ³vil */}
              <input value={ticker} onChange={e=>setTicker(e.target.value)} placeholder="$TICKER"
                style={{background:"rgba(0,168,255,0.05)",border:"1px solid rgba(0,168,255,0.18)",borderRadius:7,color:C.accent,padding:"5px 7px",fontSize:11,outline:"none",width:64,fontFamily:"monospace",textTransform:"uppercase",fontWeight:700,letterSpacing:1,flexShrink:0}}
                onFocus={e=>e.target.style.borderColor="rgba(0,168,255,0.45)"}
                onBlur={e=>e.target.style.borderColor="rgba(0,168,255,0.18)"}/>
            </div>
            {/* Fila 2: sentimiento + publicar â siempre en su propia lÃ­nea */}
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {[{v:"bull",label:"â²",full:"Alcista",col:"#16A34A"},{v:"bear",label:"â¼",full:"Bajista",col:"#DC2626"}].map(({v,label,full,col})=>{
                const active=sent===v;
                return(
                  <button key={v} onClick={()=>setSent(v)} title={full}
                    style={{background:active?`${col}12`:"transparent",border:`1.5px solid ${active?col:"var(--c-border)"}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                    <span style={{color:active?col:"var(--c-muted2)",fontWeight:active?800:600,fontSize:11}}>{label} {full}</span>
                  </button>
                );
              })}
              <Btn onClick={submit} style={{padding:"7px 20px",fontSize:13,opacity:posting?0.6:1,marginLeft:"auto",flexShrink:0}}>
                {posting?"...":(user?t.publish:"Entrar")}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ââ GIF PICKER â fallback GIFs cuando la API no estÃ¡ disponible ââââââââââââââ
const GIF_CLIENT_FALLBACK = [
  {id:"cf1", title:"To the moon ð",   preview:"https://media.giphy.com/media/3oEjHFOscgNwdYnpxm/giphy.gif", full:"https://media.giphy.com/media/3oEjHFOscgNwdYnpxm/giphy.gif", src:"fallback"},
  {id:"cf2", title:"Bull market ð",   preview:"https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",  full:"https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",  src:"fallback"},
  {id:"cf3", title:"Money rain ð¸",    preview:"https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", full:"https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", src:"fallback"},
  {id:"cf4", title:"Bear market ð",   preview:"https://media.giphy.com/media/l0MYB9P2lWRCyMJTW/giphy.gif",  full:"https://media.giphy.com/media/l0MYB9P2lWRCyMJTW/giphy.gif",  src:"fallback"},
  {id:"cf5", title:"Diamond hands ð", preview:"https://media.giphy.com/media/h7kbFBm0vAajWfDKqR/giphy.gif", full:"https://media.giphy.com/media/h7kbFBm0vAajWfDKqR/giphy.gif", src:"fallback"},
  {id:"cf6", title:"Stonks ð",        preview:"https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif", full:"https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif", src:"fallback"},
  {id:"cf7", title:"Crypto moon ð",   preview:"https://media.giphy.com/media/WraEeHVZcIGRuNPgaE/giphy.gif", full:"https://media.giphy.com/media/WraEeHVZcIGRuNPgaE/giphy.gif", src:"fallback"},
  {id:"cf8", title:"Celebrate ð",     preview:"https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",  full:"https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",  src:"fallback"},
  {id:"cf9", title:"Rocket ð",        preview:"https://media.giphy.com/media/xT0xeuOy2Fcl9vDGiA/giphy.gif", full:"https://media.giphy.com/media/xT0xeuOy2Fcl9vDGiA/giphy.gif", src:"fallback"},
  {id:"cf10",title:"HODL ðª",          preview:"https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",  full:"https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",  src:"fallback"},
  {id:"cf11",title:"Wait and see ð",  preview:"https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif",  full:"https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif",  src:"fallback"},
  {id:"cf12",title:"Panic sell ð±",    preview:"https://media.giphy.com/media/26ufcVAp3AiJJsrIs/giphy.gif",   full:"https://media.giphy.com/media/26ufcVAp3AiJJsrIs/giphy.gif",   src:"fallback"},
];

// ââ MEDIA PICKER â GIFs + Emojis + Stickers + Reacciones ââââââââââââââââââââ
const TRADING_EMOJIS = [
  "ð","ð","ð","ð","ð","ð°","ð¥","â¡","ð¯","ð¸","ð","ð¤","ð±","ð§ ","ð","ðª",
  "ð","ð»","ð","â­","â","â","ð","ð","ð¡","ð","ð¤","ð¥³","ð","ð¤","ð¯","ð«¡",
  "â¬ï¸","â¬ï¸","ð¢","ð´","ð¡","ð","ð¦","ð","ð°","ð","ð","ð§²","ðª","â¿","Î","ð¦"
];

const QUICK_REACTIONS = [
  {label:"ð To the moon!",   text:"ð To the moon! "},
  {label:"ð Diamond hands",  text:"ð Diamond hands! "},
  {label:"ð Alcista total",  text:"ð Alcista total en este ticker! "},
  {label:"ð Cuidado",        text:"ð Cuidado con esta posiciÃ³n! "},
  {label:"ð¥ En llamas",      text:"ð¥ Este ticker estÃ¡ en llamas! "},
  {label:"ð¤ Profits!",       text:"ð¤ Tomando profits aquÃ­! "},
  {label:"ð Stop loss",      text:"ð ActivÃ© stop loss. GestiÃ³n de riesgo primero. "},
  {label:"ð¡ Mi tesis",       text:"ð¡ Mi tesis de inversiÃ³n: "},
  {label:"â¡ Breakout",       text:"â¡ Breakout confirmado! Volumen altÃ­simo! "},
  {label:"ð§  DYOR",           text:"ð§  Recuerden hacer su propio research (DYOR). "},
  {label:"ð¯ Target hit",     text:"ð¯ Target alcanzado! "},
  {label:"ð± WTF market",     text:"ð± El mercado hoy estÃ¡ loco... "},
];

const STICKERS = [
  {id:"s1", label:"Bullish ð",    emoji:"ð", bg:"linear-gradient(135deg,#16a34a,#15803d)", text:"BULLISH"},
  {id:"s2", label:"Bearish ð»",    emoji:"ð»", bg:"linear-gradient(135deg,#dc2626,#b91c1c)", text:"BEARISH"},
  {id:"s3", label:"Moon ð",       emoji:"ð", bg:"linear-gradient(135deg,#7c3aed,#5b21b6)", text:"TO THE MOON"},
  {id:"s4", label:"HODL ð",       emoji:"ð", bg:"linear-gradient(135deg,#0891b2,#0e7490)", text:"HODL"},
  {id:"s5", label:"Buy the dip",   emoji:"ð", bg:"linear-gradient(135deg,#d97706,#b45309)", text:"BUY THE DIP"},
  {id:"s6", label:"Profits ð°",    emoji:"ð°", bg:"linear-gradient(135deg,#059669,#047857)", text:"TAKING PROFITS"},
  {id:"s7", label:"Rekt ð­",       emoji:"ð­", bg:"linear-gradient(135deg,#9f1239,#881337)", text:"REKT"},
  {id:"s8", label:"LFG! â¡",       emoji:"â¡", bg:"linear-gradient(135deg,#ea580c,#c2410c)", text:"LFG!"},
];

function GifPicker({onSelect,onClose,onText}){
  const [tab,setTab]         = useState("gif");
  const [q,setQ]             = useState("");
  const [gifs,setGifs]       = useState([]);
  const [loading,setLoading] = useState(false);
  const [apiSrc,setApiSrc]   = useState("â¦");

  const search = (query) => {
    setLoading(true);
    const url = `/api/gifs${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`;
    fetch(url)
      .then(r=>r.json())
      .then(d=>{ setGifs(d.gifs&&d.gifs.length>0?d.gifs:GIF_CLIENT_FALLBACK); setApiSrc(d.source||"fallback"); setLoading(false); })
      .catch(()=>{ setGifs(GIF_CLIENT_FALLBACK); setApiSrc("fallback"); setLoading(false); });
  };

  useEffect(()=>{ if(tab==="gif") search(""); },[tab]);

  const TAGS = ["ð bull","ð bear","ð moon","ð hodl","stonks","crypto","trading","celebrate"];
  const tabs = [{k:"gif",l:"GIF ðï¸"},{k:"emoji",l:"Emojis ð"},{k:"reaction",l:"Frases â¡"},{k:"sticker",l:"Stickers ð¨"}];

  return(
    <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.surface||"#fff",border:`1px solid ${C.border}`,borderRadius:16,boxShadow:"0 16px 48px rgba(0,0,0,0.18)",zIndex:300,marginTop:6,overflow:"hidden"}}>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.card2||"#f8fafc"}}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            style={{flex:1,padding:"9px 4px",border:"none",background:"none",cursor:"pointer",fontSize:11,fontWeight:700,color:tab===t.k?C.accent:C.muted,borderBottom:tab===t.k?`2px solid ${C.accent}`:"2px solid transparent",transition:"all 0.15s"}}>
            {t.l}
          </button>
        ))}
        <button onClick={onClose} style={{padding:"9px 12px",border:"none",background:"none",cursor:"pointer",fontSize:16,color:C.muted}}>â</button>
      </div>

      <div style={{padding:10}}>
        {/* ââ GIF TAB ââ */}
        {tab==="gif"&&<>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <input value={q} onChange={e=>setQ(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();search(q);}}}
              placeholder="ð Buscar: bull, moon, trading..." autoFocus
              style={{flex:1,border:`1px solid ${C.border}`,borderRadius:9,padding:"7px 11px",fontSize:12,outline:"none",background:C.card2||"#f8fafc",color:C.text}}/>
            <button onClick={()=>search(q)} style={{background:C.accent,border:"none",borderRadius:9,padding:"7px 14px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>â³</button>
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
            {TAGS.map(tag=>{const w=tag.split(" ").pop();return(
              <button key={tag} onClick={()=>{setQ(w);search(w);}}
                style={{background:"rgba(0,168,255,0.08)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:20,padding:"2px 9px",fontSize:10,cursor:"pointer",color:C.accentText,fontWeight:600}}>{tag}</button>
            );})}
          </div>
          {loading?<div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:13}}>ðï¸ Buscando GIFs...</div>:(
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,maxHeight:200,overflowY:"auto"}}>
              {gifs.map(g=>(
                <div key={g.id} style={{borderRadius:7,overflow:"hidden",cursor:"pointer",aspectRatio:"1",background:"#f1f5f9"}}
                  onClick={()=>onSelect(g.full||g.preview)}>
                  <img src={g.preview} alt={g.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>{e.target.parentElement.style.display="none";}}/>
                </div>
              ))}
            </div>
          )}
          <div style={{fontSize:9,color:C.muted2,textAlign:"right",marginTop:4}}>Powered by {apiSrc==="giphy"?"Giphy":"Tenor"}</div>
        </>}

        {/* ââ EMOJI TAB ââ */}
        {tab==="emoji"&&<>
          <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600}}>Toca un emoji para aÃ±adirlo a tu post:</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:4,maxHeight:240,overflowY:"auto"}}>
            {TRADING_EMOJIS.map(e=>(
              <button key={e} onClick={()=>{ onText&&onText(e+" "); onClose(); }}
                style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 4px",cursor:"pointer",fontSize:20,transition:"all 0.12s",lineHeight:1}}
                onMouseEnter={ev=>ev.currentTarget.style.background=C.card2||"#f0f9ff"}
                onMouseLeave={ev=>ev.currentTarget.style.background="none"}>{e}</button>
            ))}
          </div>
        </>}

        {/* ââ FRASES RÃPIDAS TAB ââ */}
        {tab==="reaction"&&<>
          <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600}}>Inserta una frase rÃ¡pida en tu post:</div>
          <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:260,overflowY:"auto"}}>
            {QUICK_REACTIONS.map(r=>(
              <button key={r.label} onClick={()=>{ onText&&onText(r.text); onClose(); }}
                style={{background:"none",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 12px",cursor:"pointer",textAlign:"left",fontSize:12,color:C.text,fontWeight:600,transition:"all 0.12s"}}
                onMouseEnter={ev=>{ev.currentTarget.style.background=C.card2||"#f0f9ff";ev.currentTarget.style.borderColor=C.accent;}}
                onMouseLeave={ev=>{ev.currentTarget.style.background="none";ev.currentTarget.style.borderColor=C.border;}}>
                {r.label}
              </button>
            ))}
          </div>
        </>}

        {/* ââ STICKERS TAB ââ */}
        {tab==="sticker"&&<>
          <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600}}>Stickers de trading para tu post:</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,maxHeight:260,overflowY:"auto"}}>
            {STICKERS.map(s=>(
              <button key={s.id} onClick={()=>{ onText&&onText(s.emoji+" "+s.text+" "); onClose(); }}
                style={{background:s.bg,border:"none",borderRadius:12,padding:"14px 10px",cursor:"pointer",color:"#fff",fontWeight:900,fontSize:13,letterSpacing:0.5,transition:"transform 0.12s,opacity 0.12s",display:"flex",alignItems:"center",gap:8}}
                onMouseEnter={ev=>{ev.currentTarget.style.transform="scale(1.03)";ev.currentTarget.style.opacity="0.9";}}
                onMouseLeave={ev=>{ev.currentTarget.style.transform="scale(1)";ev.currentTarget.style.opacity="1";}}>
                <span style={{fontSize:22}}>{s.emoji}</span>
                <span>{s.text}</span>
              </button>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

// ââ TICKER PAGE (pÃ¡gina completa de una acciÃ³n) âââââââââââââââââââââââââââââââ
function SentimentHistoryPremium({ticker, isPremium, onNeedPremium}){
  const [open, setOpen] = useState(false); // colapsado por defecto
  const seed=ticker.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const rnd=(offset,min,max)=>Math.min(max,Math.max(min,Math.round(50+Math.sin((seed+offset)*0.9)*20+Math.cos((seed+offset)*0.5)*12)));

  // Periodos: 1 dÃ­a siempre visible, el resto premium
  const periods=[
    {label:"Hace 24h",    key:"1d",  bull:rnd(1,35,75), free:true},
    {label:"Hace 1 sem",  key:"1w",  bull:rnd(2,30,78), free:false},
    {label:"Hace 1 mes",  key:"1m",  bull:rnd(3,28,80), free:false},
    {label:"Hace 3 meses",key:"3m",  bull:rnd(5,25,82), free:false},
    {label:"Hace 6 meses",key:"6m",  bull:rnd(8,22,85), free:false},
    {label:"Hace 1 aÃ±o",  key:"1y",  bull:rnd(13,20,85),free:false},
  ];

  return(
    <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",marginBottom:20}}>
      {/* Header â clic para expandir/colapsar */}
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"13px 18px",background:"linear-gradient(135deg,rgba(124,58,237,0.07),rgba(59,130,246,0.04))",borderBottom:open?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",userSelect:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:17}}>ð§­</span>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:C.text}}>Sentimiento del mercado</div>
            <div style={{fontSize:11,color:C.muted}}>Toca para {open?"ocultar":"ver"} el historial de ${ticker}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {isPremium
            ? <span style={{background:"linear-gradient(135deg,#7C3AED,#6D28D9)",color:"#fff",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800}}>â¦ VIP</span>
            : <button onClick={e=>{e.stopPropagation();onNeedPremium();}} style={{background:"linear-gradient(135deg,#7C3AED,#9333EA)",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:800,cursor:"pointer"}}>â¦ VIP</button>
          }
          {/* Flecha animada */}
          <span style={{fontSize:16,color:C.muted,display:"inline-block",transition:"transform 0.25s",transform:open?"rotate(180deg)":"rotate(0deg)",lineHeight:1}}>â¾</span>
        </div>
      </div>

      {/* Contenido â solo visible cuando open=true */}
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
                        {isBull?"ð Alcista":"ð» Bajista"}
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
                        ð Premium
                      </div>
                      <div style={{flex:1,height:8,background:`repeating-linear-gradient(90deg,rgba(124,58,237,0.1) 0px,rgba(124,58,237,0.1) 8px,transparent 8px,transparent 14px)`,borderRadius:20}}/>
                      <button onClick={e=>{e.stopPropagation();onNeedPremium();}} style={{fontSize:10,fontWeight:700,color:"#7C3AED",background:"transparent",border:"none",cursor:"pointer",whiteSpace:"nowrap",textDecoration:"underline"}}>Ver â</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {!isPremium&&(
            <div style={{padding:"12px 18px",background:"linear-gradient(135deg,rgba(124,58,237,0.06),rgba(147,51,234,0.04))",borderTop:`1px solid ${C.border}`,textAlign:"center"}}>
              <span style={{fontSize:12,color:C.muted}}>Desbloquea el sentimiento histÃ³rico completo con </span>
              <span onClick={onNeedPremium} style={{fontSize:12,color:"#7C3AED",fontWeight:800,cursor:"pointer"}}>NexoTrade VIP â¦</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ââ CHART â SVG nativo, prueba proxy luego Yahoo Finance directo ââââââââââââââ
function TVChart({ticker}){
  const [candles, setCandles] = useState([]);
  const [status,  setStatus]  = useState("loading");

  useEffect(()=>{
    let alive = true;
    setStatus("loading");
    setCandles([]);

    const parseYahoo = (d) => {
      const result = d?.chart?.result?.[0];
      if(!result) return null;
      const ts = result.timestamp||[];
      const q  = result.indicators?.quote?.[0]||{};
      const arr = ts.map((t,i)=>({time:t,open:q.open?.[i],high:q.high?.[i],low:q.low?.[i],close:q.close?.[i]}))
                    .filter(c=>c.open&&c.close);
      return arr.length ? arr : null;
    };

    const run = async () => {
      // Intento 1: nuestro proxy
      try{
        const r = await fetch(`/api/chart?ticker=${encodeURIComponent(ticker)}&range=6mo&interval=1d`);
        if(r.ok){
          const d = await r.json();
          if(d.candles?.length){ if(alive){setCandles(d.candles.slice(-90));setStatus("ok");} return; }
        }
      }catch(e){}

      // Intento 2: Yahoo Finance directo (funciona en la mayorÃ­a de regiones)
      try{
        const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=6mo&includePrePost=false`,
          {headers:{"Accept":"application/json"}});
        const d = await r.json();
        const arr = parseYahoo(d);
        if(arr){ if(alive){setCandles(arr.slice(-90));setStatus("ok");} return; }
      }catch(e){}

      // Intento 3: endpoint alternativo Yahoo
      try{
        const r = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=6mo`);
        const d = await r.json();
        const arr = parseYahoo(d);
        if(arr){ if(alive){setCandles(arr.slice(-90));setStatus("ok");} return; }
      }catch(e){}

      if(alive) setStatus("error");
    };
    run();
    return ()=>{ alive=false; };
  },[ticker]);

  if(status==="loading") return(
    <div style={{height:260,display:"flex",alignItems:"center",justifyContent:"center",background:"#f8fafc",gap:10}}>
      <div style={{width:20,height:20,border:"2.5px solid #e2e8f0",borderTopColor:"#00A8FF",borderRadius:"50%",animation:"nexo-spin 0.8s linear infinite"}}/>
      <span style={{color:"#94a3b8",fontSize:12}}>Cargando {ticker}...</span>
    </div>
  );

  if(status==="error"||!candles.length) return(
    <div style={{height:260,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:14,background:"#f8fafc"}}>
      <span style={{fontSize:36}}>ð</span>
      <span style={{color:"#64748b",fontSize:13,fontWeight:600}}>Sin datos para {ticker}</span>
      <a href={`https://finance.yahoo.com/quote/${ticker}`} target="_blank" rel="noopener noreferrer"
        style={{color:"#00A8FF",fontSize:12,fontWeight:700,textDecoration:"none",background:"rgba(0,168,255,0.08)",padding:"7px 18px",borderRadius:8,border:"1px solid rgba(0,168,255,0.2)"}}>
        Ver en Yahoo Finance â
      </a>
    </div>
  );

  // ââ SVG line chart ââââââââââââââââââââââââââââââââââââââââââââ
  const W=600, H=230, pl=8, pr=56, pt=12, pb=22;
  const closes = candles.map(c=>c.close);
  const minP   = Math.min(...closes);
  const maxP   = Math.max(...closes);
  const range  = maxP - minP || 1;
  const xS = i => pl + (i/(candles.length-1||1))*(W-pl-pr);
  const yS = p => pt + (1-(p-minP)/range)*(H-pt-pb);

  const linePath = closes.map((p,i)=>`${i===0?"M":"L"}${xS(i).toFixed(1)},${yS(p).toFixed(1)}`).join(" ");
  const areaPath = linePath+` L${xS(closes.length-1).toFixed(1)},${(H-pb).toFixed(1)} L${pl},${(H-pb).toFixed(1)} Z`;
  const isUp     = closes[closes.length-1] >= closes[0];
  const col      = isUp ? "#22c55e" : "#ef4444";
  const pct      = (((closes[closes.length-1]-closes[0])/closes[0])*100).toFixed(2);
  const gradId   = `g_${ticker.replace(/[^a-z0-9]/gi,"")}`;

  // 3 horizontal grid lines + price labels
  const gridVals = [0.2, 0.5, 0.8].map(r=>minP+range*r);

  return(
    <div style={{background:"#fff",userSelect:"none"}}>
      {/* Header mini stats */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 14px 4px",borderBottom:"1px solid #f1f5f9"}}>
        <span style={{fontFamily:"monospace",fontWeight:900,fontSize:18,color:"#0f172a"}}>{closes[closes.length-1]?.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
        <span style={{background:isUp?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",color:col,fontWeight:700,fontSize:12,padding:"2px 8px",borderRadius:6}}>{isUp?"+":""}{pct}%</span>
        <span style={{color:"#94a3b8",fontSize:11,marginLeft:"auto"}}>Ãltimos 90 dÃ­as</span>
      </div>
      {/* SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:230,display:"block"}}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={col} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        {/* Grid */}
        {gridVals.map((v,i)=>(
          <g key={i}>
            <line x1={pl} x2={W-pr} y1={yS(v).toFixed(1)} y2={yS(v).toFixed(1)} stroke="#f1f5f9" strokeWidth="1"/>
            <text x={W-pr+6} y={yS(v)+4} fontSize="9" fill="#cbd5e1">{v>=1000?v.toFixed(0):v.toFixed(2)}</text>
          </g>
        ))}
        {/* Area */}
        <path d={areaPath} fill={`url(#${gradId})`}/>
        {/* Line */}
        <path d={linePath} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
        {/* Last price dot */}
        <circle cx={xS(closes.length-1).toFixed(1)} cy={yS(closes[closes.length-1]).toFixed(1)} r="3" fill={col}/>
        <text x={W-pr+6} y={yS(closes[closes.length-1])+4} fontSize="10" fill={col} fontWeight="700">
          {closes[closes.length-1]>=1000?closes[closes.length-1].toFixed(0):closes[closes.length-1].toFixed(2)}
        </text>
        {/* X axis dates */}
        {[0, Math.floor(candles.length/2), candles.length-1].map(i=>(
          <text key={i} x={xS(i)} y={H-6} fontSize="9" fill="#94a3b8" textAnchor="middle">
            {candles[i]?.time ? new Date(candles[i].time*1000).toLocaleDateString("es",{month:"short",day:"numeric"}) : ""}
          </text>
        ))}
      </svg>
      <div style={{padding:"2px 14px 8px",textAlign:"right",fontSize:10,color:"#cbd5e1"}}>Datos: Yahoo Finance</div>
    </div>
  );
}

function TickerPage({ticker,posts=[],onClose,lang="es",user,onPost,onNeedAuth,isPremium=false,onNeedPremium,onRepost}){
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
          â Volver
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
            <span style={{color:C.bull,fontWeight:700,fontSize:12}}>{bullPct}% ð</span>
            <div style={{width:60,height:5,background:C.bearBg,borderRadius:20,overflow:"hidden"}}>
              <div style={{width:`${bullPct}%`,height:"100%",background:C.bull,borderRadius:20}}/>
            </div>
            <span style={{color:C.bear,fontWeight:700,fontSize:12}}>{100-bullPct}% ð»</span>
          </div>
          <div style={{fontSize:10,color:C.muted2,marginTop:2}}>{total} votos de la comunidad</div>
        </div>
      </div>

      {/* CajÃ³n para escribir posts sobre este ticker */}
      <div style={{marginBottom:16}}>
        <NewPost user={user} onPost={onPost} onNeedAuth={onNeedAuth} lang={lang} defaultTicker={ticker}/>
      </div>

      {/* TradingView Chart con toggle */}
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:showChart?`1px solid ${C.border}`:"none"}}>
          <span style={{fontWeight:700,fontSize:13,color:C.text}}>ð GrÃ¡fico ${ticker}</span>
          <button onClick={()=>setShowChart(v=>!v)}
            style={{background:"rgba(0,168,255,0.08)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:8,padding:"5px 14px",cursor:"pointer",color:"#00A8FF",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:5,transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.15)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(0,168,255,0.08)"}>
            {showChart ? "â² Ocultar" : "â¼ Mostrar"}
          </button>
        </div>
        {showChart&&<TVChart ticker={ticker} lang={lang}/>}
      </div>

      {/* Sentimiento HistÃ³rico â Premium */}
      <SentimentHistoryPremium
        ticker={ticker}
        isPremium={isPremium}
        onNeedPremium={onNeedPremium||onNeedAuth}
      />

      {/* Posts de la comunidad */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <h3 style={{margin:0,color:C.text,fontWeight:800,fontSize:16}}>
          ð¬ {lang==="en"?"Community posts about":"Posts de la comunidad sobre"} ${ticker}
        </h3>
        <span style={{background:C.accentDim,color:C.accentText,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{tkPosts.length}</span>
      </div>
      {tkPosts.length===0?(
        <div style={{textAlign:"center",padding:"28px 0",color:C.muted,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14}}>
          <div style={{fontSize:28,marginBottom:8}}>ð­</div>
          <div style={{fontSize:14}}>{lang==="en"?`Be the first to post about $${ticker}!`:`Â¡SÃ© el primero en comentar $${ticker}!`}</div>
        </div>
      ):(
        tkPosts.map(p=><PostCard key={p.id} post={p} onProfile={()=>{}} onPoints={()=>{}} onTickerClick={()=>{}} lang={lang} onRepost={onRepost} user={user} onNeedAuth={onNeedAuth}/>)
      )}

    </div>
  );
}

// ââ TOPS / NOTICIAS / EARNINGS / TRENDING âââââââââââââââââââââââââââââââââââââ
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
              <td style={{...tdS,color:i<3?C.gold:"#94a3b8",fontWeight:800,fontSize:15}}>{i===0?"ð¥":i===1?"ð¥":i===2?"ð¥":i+1}</td>
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
  const [marketClosed,setMarketClosed]=useState(false);
  const tabs=[["activas","ð¥ Most Active"],["ganadoras","ð Top Gainers"],["perdedoras","ð Top Losers"],["leaderboard","ð Leaderboard"]];

  const fetchData=()=>{
    setLoading(true);
    Promise.all(
      TOPS_TICKERS.map(({ticker,name})=>
        fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`)
          .then(r=>r.json())
          .then(q=>({ticker,name,price:q.c,change:q.dp,changeAbs:q.d,high:q.h,low:q.l,open:q.o,prevClose:q.pc}))
          .catch(()=>null)
      )
    ).then(results=>{
      const valid=results.filter(r=>r&&r.price>0);
      // Detect market closed: all changes are 0 or null
      const allZero=valid.length>0&&valid.every(q=>!q.change||q.change===0);
      setMarketClosed(allZero);
      if(allZero){
        // Calculate synthetic change from prevClose vs price
        const withChange=valid.map(q=>({
          ...q,
          change:q.prevClose&&q.price?+((q.price-q.prevClose)/q.prevClose*100).toFixed(2):0,
          changeAbs:q.prevClose&&q.price?+(q.price-q.prevClose).toFixed(2):0,
        }));
        setQuotes(withChange);
      } else {
        setQuotes(valid);
      }
      setLoading(false);
    }).catch(()=>setLoading(false));
  };

  useEffect(()=>{ fetchData(); },[]);

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
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>ð Market Tops</h2>
        {loading
          ?<span style={{fontSize:11,color:C.muted}}>â³ Loading prices...</span>
          :marketClosed
            ?<span style={{fontSize:11,color:C.gold,fontWeight:700}}>ð¡ Markets closed Â· Last close prices</span>
            :<span style={{fontSize:11,color:C.bull,fontWeight:700}}>ð¢ Live prices Â· Finnhub</span>}
        <button onClick={fetchData}
          style={{marginLeft:"auto",background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,color:C.muted,fontWeight:600}}
          title="Actualizar">ð Refresh</button>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} style={{background:tab===k?C.accent:"transparent",border:`1.5px solid ${tab===k?C.accent:C.border}`,borderRadius:10,padding:"7px 14px",cursor:"pointer",color:tab===k?"#fff":C.muted,fontSize:12,fontWeight:700,whiteSpace:"nowrap",transition:"all 0.15s"}}>{l}</button>)}
      </div>
      {loading?(
        <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
          <div style={{fontSize:28,marginBottom:8}}>â³</div>
          <div>Cargando datos en vivo...</div>
        </div>
      ):(
        <>
          {tab==="activas"&&(activas.length>0?activas.map((q,i)=><Row key={q.ticker} q={q} rank={i+1}/>):<div style={{color:C.muted,textAlign:"center",padding:32}}>No data available</div>)}
          {tab==="ganadoras"&&(ganadoras.length>0?ganadoras.map((q,i)=><Row key={q.ticker} q={q} rank={i+1}/>):<div style={{color:C.muted,textAlign:"center",padding:32,fontSize:13}}>ð¡ No gainers detected â market may be closed or prices unchanged</div>)}
          {tab==="perdedoras"&&(perdedoras.length>0?perdedoras.map((q,i)=><Row key={q.ticker} q={q} rank={i+1}/>):<div style={{color:C.muted,textAlign:"center",padding:32,fontSize:13}}>ð¡ No losers detected â market may be closed or prices unchanged</div>)}
          {tab==="leaderboard"&&(()=>{
            // Calcular top traders esta semana por posts
            const weekAgo=Date.now()-7*24*60*60*1000;
            const map={};
            posts.forEach(p=>{
              if(!p.user)return;
              if(!map[p.user]) map[p.user]={user:p.user,avatar:p.avatar||"ð¦",color:p.avatarColor||C.accent,posts:0,bull:0,bear:0,pts:0};
              map[p.user].posts++;
              map[p.user].pts+=10;
              if(p.sentiment==="bull") map[p.user].bull++; else map[p.user].bear++;
              if(p.likes) map[p.user].pts+=p.likes*5;
            });
            const lb=Object.values(map).sort((a,b)=>b.pts-a.pts).slice(0,10);
            const medals=["ð¥","ð¥","ð¥"];
            if(lb.length===0) return <div style={{textAlign:"center",padding:40,color:C.muted}}>
              <div style={{fontSize:32,marginBottom:8}}>ð</div>
              <div>Â¡Publica tu primer anÃ¡lisis para aparecer aquÃ­!</div>
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
                      <span style={{fontSize:11,color:C.muted}}>ð {u.posts} posts</span>
                      <span style={{fontSize:11,color:C.bull}}>â²{u.bull}</span>
                      <span style={{fontSize:11,color:C.bear}}>â¼{u.bear}</span>
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
  const [lastUp,setLastUp]=useState(null);
  const [spinning,setSpinning]=useState(false);

  const fetchNews=(c=cat)=>{
    setLoading(true);setSpinning(true);
    fetch(`https://finnhub.io/api/v1/news?category=${c}&token=${FINNHUB_KEY}`)
      .then(r=>r.json())
      .then(data=>{
        if(Array.isArray(data)){
          setNews(data.filter(n=>n.headline&&n.source).slice(0,30));
          setLastUp(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}));
        }
      })
      .catch(()=>{})
      .finally(()=>{setLoading(false);setTimeout(()=>setSpinning(false),600);});
  };

  useEffect(()=>{ fetchNews(cat); },[cat]);

  const cats=[
    {k:"general",  l:lang==="en"?"ð° Macro News":"ð° Macro",     color:C.accent},
    {k:"crypto",   l:lang==="en"?"â¿ Crypto":"â¿ Crypto",           color:"#F59E0B"},
    {k:"forex",    l:lang==="en"?"ð± Forex":"ð± Forex",           color:"#16A34A"},
    {k:"merger",   l:lang==="en"?"ð¦ M&A":"ð¦ M&A",              color:C.purple},
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
        <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>ð° {lang==="en"?"Market News":"Noticias del Mercado"}</h2>
        <span style={{background:"#fef2f2",color:C.bear,border:`1px solid ${C.bear}33`,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>ð´ LIVE</span>
        <span style={{color:C.muted2,fontSize:11}}>{lastUp?`${lang==="en"?"Updated":"Actualizado"} ${lastUp}`:"Finnhub"}</span>
        <button onClick={()=>fetchNews(cat)} disabled={loading}
          style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,background:C.card2,border:`1px solid ${C.border}`,borderRadius:20,padding:"6px 14px",cursor:loading?"not-allowed":"pointer",color:C.muted,fontSize:12,fontWeight:700,transition:"all 0.2s"}}>
          <span style={{display:"inline-block",transition:"transform 0.6s",transform:spinning?"rotate(360deg)":"rotate(0deg)"}}>â³</span>
          {loading?(lang==="en"?"Loading...":"Cargando..."):(lang==="en"?"Refresh":"Actualizar")}
        </button>
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
          <div style={{fontSize:28,marginBottom:8}}>â³</div>
          <div style={{fontSize:14}}>{lang==="en"?"Loading news...":"Cargando noticias..."}</div>
        </div>
      ):news.length===0?(
        <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
          <div style={{fontSize:28,marginBottom:8}}>ð­</div>
          <div style={{fontSize:14}}>{lang==="en"?"No news at the moment":"No hay noticias en este momento"}</div>
        </div>
      ):(
        news.map((n,i)=>(
          <div key={i}>
          {i>0 && i%5===0 && <>{<AdBannerFeed/>}<MediaNetBannerFeed/></>}
          <a href={n.url} target="_blank" rel="noopener noreferrer"
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
          </div>
        ))
      )}
    </div>
  );
}

// ââ TICKER STRIP â barra de precios animada âââââââââââââââââââââââââââââââââââ
// CoinGecko IDs para los 4 crypto principales (API gratis, sin key)
const COINGECKO_IDS = "bitcoin,ethereum,solana,binancecoin";
const TICKER_DATA_INIT = [
  {s:"BTC",  n:"Bitcoin",    p:108500, c:+0.80,  col:"#f7931a", cg:"bitcoin"},
  {s:"ETH",  n:"Ethereum",   p:2550,   c:+0.50,  col:"#627eea", cg:"ethereum"},
  {s:"SOL",  n:"Solana",     p:172,    c:+1.20,  col:"#9945ff", cg:"solana"},
  {s:"BNB",  n:"BNB",        p:648,    c:+0.30,  col:"#f3ba2f", cg:"binancecoin"},
  {s:"NVDA", n:"NVIDIA",     p:135.4,  c:+0.90,  col:"#76b900", cg:null, fh:"NVDA"},
  {s:"AAPL", n:"Apple",      p:213.5,  c:-0.20,  col:"#94a3b8", cg:null, fh:"AAPL"},
  {s:"TSLA", n:"Tesla",      p:352.8,  c:-0.80,  col:"#e31937", cg:null, fh:"TSLA"},
  {s:"SPY",  n:"S&P 500",    p:591.2,  c:+0.15,  col:"#00A8FF", cg:null, fh:"SPY"},
  {s:"MSFT", n:"Microsoft",  p:453.6,  c:+0.60,  col:"#00b4d8", cg:null, fh:"MSFT"},
  {s:"GOLD", n:"Gold",       p:3315,   c:+0.25,  col:"#fbbf24", cg:null},
];

// Hook compartido para precios reales de CoinGecko
function useCryptoPrices(){
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchPrices = useCallback(()=>{
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd&include_24hr_change=true`)
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>{
        const mapped = {
          BTC:{ p:data.bitcoin?.usd||0,         c:+(data.bitcoin?.usd_24h_change||0).toFixed(2) },
          ETH:{ p:data.ethereum?.usd||0,         c:+(data.ethereum?.usd_24h_change||0).toFixed(2) },
          SOL:{ p:data.solana?.usd||0,           c:+(data.solana?.usd_24h_change||0).toFixed(2) },
          BNB:{ p:data.binancecoin?.usd||0,      c:+(data.binancecoin?.usd_24h_change||0).toFixed(2) },
        };
        setCryptoPrices(mapped);
        setLastUpdate(new Date());
      })
      .catch(()=>{}); // silencioso â mantiene datos anteriores
  },[]);

  useEffect(()=>{
    fetchPrices();
    const iv = setInterval(fetchPrices, 60000); // cada 60s (lÃ­mite gratuito CoinGecko)
    return ()=>clearInterval(iv);
  },[fetchPrices]);

  return {cryptoPrices, lastUpdate};
}

function TickerStrip(){
  const lp = useContext(PriceCtx);
  const isLive = Object.keys(lp).length > 0;

  // Construir tickers con precio real del PriceCtx
  const tickers = TICKER_DATA_INIT.map(t=>{
    const live = lp[t.s];
    return { ...t, p: live?.price ?? t.p, c: live?.change ?? t.c };
  });

  const items = [...tickers, ...tickers];

  return(
    <div style={{background:"#060e1c",borderBottom:"1px solid rgba(255,255,255,0.07)",overflow:"hidden",height:34,position:"relative",zIndex:99}}>
      <style>{`
        @keyframes tickerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .ticker-track { display:flex; gap:0; animation:tickerScroll 42s linear infinite; width:max-content; }
        .ticker-track:hover { animation-play-state:paused; }
      `}</style>
      {/* Indicador live */}
      <div style={{position:"absolute",right:0,top:0,bottom:0,zIndex:2,background:"linear-gradient(90deg,transparent,#060e1c 60%)",display:"flex",alignItems:"center",paddingRight:10,paddingLeft:30}}>
        {isLive
          ? <span style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#22c55e",fontWeight:700,whiteSpace:"nowrap"}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"nexo-pulse 1.5s infinite"}}/>LIVE
            </span>
          : <span style={{fontSize:9,color:"#334155"}}>~</span>
        }
      </div>
      <div className="ticker-track">
        {items.map((t,i)=>(
          <a key={i} href={`https://www.tradingview.com/symbols/${t.cg?t.s+"USD":t.s}/`}
            target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",gap:6,padding:"0 16px",height:34,textDecoration:"none",borderRight:"1px solid rgba(255,255,255,0.05)",flexShrink:0,whiteSpace:"nowrap"}}>
            <span style={{fontWeight:800,fontSize:11,color:t.col,letterSpacing:0.5}}>{t.s}</span>
            <span style={{fontFamily:"monospace",fontSize:11,color:"#e2e8f0",fontWeight:600}}>
              {t.p>0?t.p.toLocaleString("en-US",{minimumFractionDigits:t.p>100?1:2,maximumFractionDigits:t.p>100?1:2}):"â"}
            </span>
            <span style={{fontSize:10,fontWeight:700,color:t.c>=0?"#22c55e":"#ef4444"}}>{t.c>=0?"+":""}{t.c.toFixed(2)}%</span>
            {t.cg&&<span style={{fontSize:8,color:"#22c55e",opacity:0.7}}>â</span>}
          </a>
        ))}
      </div>
    </div>
  );
}

// ââ MARKETS MINI WIDGET â tabs Mercados / Predicciones / Tendencias âââââââââââ
function MarketsMiniWidget({ lang="es" }){
  const isEN = lang === "en";
  const [tab, setTab] = useState("mercados");
  const [polyData] = useState([
    {q:"Fed rate cut in 2026?", p:0.55, vol:"$1.8M"},
    {q:"S&P 500 closes above 6,000 in 2026?", p:0.63, vol:"$2.1M"},
    {q:"Bitcoin hits $120K before year end?", p:0.48, vol:"$5.2M"},
    {q:"US inflation stays below 3% all 2026?", p:0.61, vol:"$940K"},
  ]);
  // Usar el PriceCtx centralizado â mismo WebSocket que el resto del app
  const lp = useContext(PriceCtx);
  const isLive = Object.keys(lp).length > 0;

  const prices = TICKER_DATA_INIT.slice(0,8).map(t=>{
    const live = lp[t.s];
    return { ...t, p: live?.price ?? t.p, c: live?.change ?? t.c };
  });

  const barCol = p => p>=0.6?"#10b981":p>=0.4?"#f59e0b":"#ef4444";

  return(
    <div style={{background:"var(--c-card)",border:"1px solid var(--c-border)",borderRadius:16,marginBottom:12,overflow:"hidden",boxShadow:"var(--c-shadow)"}}>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid var(--c-border)",padding:"0 8px"}}>
        {[["mercados", isEN?"ð Markets":"ð Mercados"],["predicciones", isEN?"ð¯ Predictions":"ð¯ Predicciones"],["tendencias","ð¥ Trending"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,padding:"9px 4px",border:"none",borderBottom:`2px solid ${tab===k?"#00A8FF":"transparent"}`,background:"transparent",color:tab===k?"#00A8FF":"var(--c-muted)",fontSize:10,fontWeight:tab===k?700:500,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            {l}{k==="mercados"&&isLive&&<span style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",display:"inline-block",animation:"nexo-pulse 1.5s infinite",flexShrink:0}}/>}
          </button>
        ))}
      </div>

      {/* Mercados â cards coloridos estilo moderno */}
      {tab==="mercados"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,padding:"10px",overflowX:"auto",WebkitOverflowScrolling:"touch",minWidth:0}}
          className="nexo-market-grid">
          {prices.slice(0,8).map((t)=>{
            const up = t.c >= 0;
            const bull = up ? "#16A34A" : "#DC2626";
            const bullBg = up ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)";
            // Mini sparkline sintÃ©tico basado en el color del ticker
            const spark = [0,1,0.6,1.2,0.8,1.5,1,up?2:0.3].map((v,i,a)=>
              `${(i/(a.length-1))*44},${12-v*(up?4:3)}`).join(" ");
            return(
              <a key={t.s} href={`https://www.tradingview.com/symbols/${t.s}/`} target="_blank" rel="noopener noreferrer"
                style={{display:"flex",flexDirection:"column",gap:3,padding:"8px",borderRadius:12,background:bullBg,border:`1px solid ${bull}22`,textDecoration:"none",transition:"all 0.18s",cursor:"pointer"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 20px ${bull}22`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                {/* Icono + ticker */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{width:22,height:22,borderRadius:7,background:t.col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#fff",flexShrink:0,boxShadow:`0 2px 8px ${t.col}55`}}>
                    {t.s.slice(0,1)}
                  </div>
                  <svg viewBox="0 0 44 14" style={{width:34,height:11}}>
                    <polyline points={spark} fill="none" stroke={bull} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {/* Nombre */}
                <div style={{fontSize:9,fontWeight:600,color:"var(--c-muted2)",letterSpacing:0.2,lineHeight:1}}>{t.n}</div>
                {/* Precio */}
                <div style={{fontFamily:"monospace",fontSize:11,fontWeight:800,color:"var(--c-text)",letterSpacing:-0.3,lineHeight:1}}>
                  {t.p>=1000 ? t.p.toLocaleString("en-US",{maximumFractionDigits:0}) : t.p.toFixed(2)}
                </div>
                {/* Cambio */}
                <div style={{fontSize:9,fontWeight:700,color:bull,background:bullBg,borderRadius:20,padding:"1px 5px",display:"inline-flex",alignItems:"center",gap:2,width:"fit-content"}}>
                  {up?"â²":"â¼"} {Math.abs(t.c).toFixed(2)}%
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Predicciones */}
      {tab==="predicciones"&&(
        <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",gap:7}}>
          {polyData.map((m,i)=>(
            <div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3,gap:8}}>
                <span style={{color:"#cbd5e1",fontSize:11,flex:1,lineHeight:1.3}}>{m.q}</span>
                <span style={{fontWeight:900,fontSize:13,color:barCol(m.p),flexShrink:0}}>{Math.round(m.p*100)}%</span>
              </div>
              <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${m.p*100}%`,background:barCol(m.p),borderRadius:4,transition:"width 1s"}}/>
              </div>
              <div style={{color:"#475569",fontSize:9,marginTop:1}}>Vol: {m.vol}</div>
            </div>
          ))}
          <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer"
            style={{textAlign:"center",color:"#6366f1",fontSize:10,fontWeight:700,textDecoration:"none",marginTop:2}}>
            View all on Polymarket â
          </a>
        </div>
      )}

      {/* Tendencias */}
      {tab==="tendencias"&&(
        <div style={{padding:"8px 12px",display:"flex",flexDirection:"column",gap:6}}>
          {MOCK_TRENDING.map((t,i)=>(
            <div key={t.ticker} style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:"#334155",fontWeight:800,fontSize:10,minWidth:14}}>{i+1}</span>
              <span style={{fontFamily:"monospace",fontWeight:800,fontSize:10,color:"#00A8FF",minWidth:42}}>${t.ticker}</span>
              <div style={{flex:1,height:3,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${t.sentiment}%`,background:t.change>=0?"#22c55e":"#ef4444",borderRadius:4}}/>
              </div>
              <span style={{fontSize:10,fontWeight:700,color:t.change>=0?"#22c55e":"#ef4444",minWidth:40,textAlign:"right"}}>{t.change>=0?"+":""}{t.change}%</span>
              <span style={{color:"#334155",fontSize:9,minWidth:32}}>{(t.mentions/1000).toFixed(1)}K ð¬</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ââ ADSENSE BANNER COMPONENT âââââââââââââââââââââââââââââââââââââââââââââââââ
const AD_CLIENT = "ca-pub-3490083853866736";
function AdBanner({slot, format="auto", style={}, className=""}){
  const ref = useRef(null);
  const pushed = useRef(false);
  useEffect(()=>{
    if(pushed.current) return;
    try{
      if(typeof window !== "undefined" && window.adsbygoogle){
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    }catch(e){}
  },[]);
  return(
    <div style={{overflow:"hidden",textAlign:"center",...style}} className={className}>
      <ins className="adsbygoogle"
        style={{display:"block"}}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"/>
    </div>
  );
}

// Banner horizontal 728Ã90 / responsive â para feed y noticias
function AdBannerFeed(){
  return <AdBanner slot="6515017049" format="auto" style={{margin:"10px 0",borderRadius:8,overflow:"hidden"}}/>;
}

// Banner cuadrado 300Ã250 â para sidebar (sin minHeight para no crear espacio vacÃ­o)
function AdBannerSidebar(){
  return <AdBanner slot="8915846882" format="auto" style={{margin:"6px 0",borderRadius:10,overflow:"hidden",minHeight:0}}/>;
}

// ââ MEDIA.NET ADS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// INSTRUCCIONES:
// 1. RegÃ­strate en https://www.media.net â Apply Now â pon nexotradeia.com
// 2. Cuando te aprueben (2-3 dÃ­as), activa el script en index.html descomentando la lÃ­nea
// 3. En tu panel Media.net: Ad Units â Create â copia el CID y los TAG IDs
// 4. Reemplaza REEMPLAZAR_CID, REEMPLAZAR_TAG_FEED y REEMPLAZAR_TAG_SIDEBAR abajo
// 5. Corre python3 fix_everything.py para deploy
const MN_CID = "REEMPLAZAR_CID_MEDIANET"; // ej: "8CU57YRJN"

function MediaNetBannerFeed(){
  const ref = useRef(null);
  const pushed = useRef(false);
  useEffect(()=>{
    if(pushed.current || MN_CID.includes("REEMPLAZAR")) return;
    try{
      if(window._mNHandle){
        window._mNHandle.queue = window._mNHandle.queue||[];
        window._mNHandle.queue.push(function(){
          window._mNDetails.loadTag("REEMPLAZAR_TAG_FEED","728x90","mn-banner-feed");
        });
        pushed.current = true;
      }
    }catch(e){}
  },[]);
  if(MN_CID.includes("REEMPLAZAR")) return null; // oculto hasta tener CID real
  return <div id="mn-banner-feed" style={{margin:"10px 0",textAlign:"center",minHeight:90}} ref={ref}/>;
}

function MediaNetBannerSidebar(){
  const ref = useRef(null);
  const pushed = useRef(false);
  useEffect(()=>{
    if(pushed.current || MN_CID.includes("REEMPLAZAR")) return;
    try{
      if(window._mNHandle){
        window._mNHandle.queue = window._mNHandle.queue||[];
        window._mNHandle.queue.push(function(){
          window._mNDetails.loadTag("REEMPLAZAR_TAG_SIDEBAR","300x250","mn-banner-sidebar");
        });
        pushed.current = true;
      }
    }catch(e){}
  },[]);
  if(MN_CID.includes("REEMPLAZAR")) return null;
  return <div id="mn-banner-sidebar" style={{margin:"6px 0",textAlign:"center",minHeight:250}} ref={ref}/>;
}
// ââ FIN MEDIA.NET âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// ââ SIDEBAR TICKER WIDGET â precios reales via PriceCtx (WebSocket Finnhub) âââ
function SidebarTickerWidget(){
  const lp = useContext(PriceCtx);
  const isLive = Object.keys(lp).length > 0;
  const [lastUpdate, setLastUpdate] = useState(null);

  // Actualizar timestamp cada vez que llegan precios
  useEffect(()=>{
    if(isLive) setLastUpdate(new Date());
  },[lp]);

  // Construir items con precio real del contexto
  const items = TICKER_DATA_INIT.slice(0,6).map(t=>{
    const live = lp[t.s];
    return {
      ...t,
      p: live?.price  ?? t.p,
      c: live?.change ?? t.c,
    };
  });

  return(
    <div style={{background:"rgba(6,14,28,0.95)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,marginBottom:14,overflow:"hidden"}}>
      <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",gap:8}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:isLive?"#22c55e":"#475569",display:"inline-block",animation:isLive?"nexo-pulse 2s infinite":"none"}}/>
        <span style={{color:"#94a3b8",fontSize:11,fontWeight:700,letterSpacing:1,flex:1}}>MERCADOS EN TIEMPO REAL</span>
        {isLive&&<span style={{color:"#22c55e",fontSize:9,fontWeight:700}}>LIVE</span>}
      </div>
      {items.map((t,i)=>(
        <a key={t.s} href={`https://www.tradingview.com/symbols/${t.cg?t.s+"USD":t.s}/`} target="_blank" rel="noopener noreferrer"
          style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderBottom:i<5?"1px solid rgba(255,255,255,0.04)":"none",textDecoration:"none",transition:"background 0.1s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{width:7,height:7,borderRadius:"50%",background:t.col,flexShrink:0}}/>
          <span style={{fontWeight:700,fontSize:12,color:t.col,minWidth:38}}>{t.s}</span>
          <span style={{flex:1,fontFamily:"monospace",fontSize:12,color:"#cbd5e1"}}>
            {t.p>0?t.p.toLocaleString("en-US",{minimumFractionDigits:t.p>100?1:2,maximumFractionDigits:t.p>100?1:2}):"â"}
          </span>
          <span style={{fontSize:11,fontWeight:700,color:t.c>=0?"#22c55e":"#ef4444"}}>{t.c>=0?"+":""}{t.c.toFixed(2)}%</span>
          {t.cg&&isLive&&<span style={{fontSize:8,color:"#22c55e",opacity:0.6}}>â</span>}
        </a>
      ))}
      <div style={{padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer"
          style={{color:"#00A8FF",fontSize:11,fontWeight:600,textDecoration:"none"}}>Ver grÃ¡ficos â</a>
        {lastUpdate&&<span style={{color:"#334155",fontSize:9}}>
          {lastUpdate.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}
        </span>}
      </div>
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
          const revEst=e.revenueEstimate?(e.revenueEstimate>=1e9?`$${(e.revenueEstimate/1e9).toFixed(1)}B`:`$${(e.revenueEstimate/1e6).toFixed(0)}M`):mock.rev_est||"â";
          const epsEst=e.epsEstimate!=null?`$${e.epsEstimate.toFixed(2)}`:mock.eps_est||"â";
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

      {/* LEFT â Stock list */}
      <div>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
          <h2 style={{margin:0,color:"#F1F5F9",fontSize:17,fontWeight:800,letterSpacing:-0.3}}>ð Earnings Calendar</h2>
          <span style={{background:"rgba(245,158,11,0.12)",color:C.gold,border:"1px solid rgba(245,158,11,0.2)",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700}}>ESTA SEMANA</span>
          {loadingEar
            ?<span style={{marginLeft:"auto",color:"#334155",fontSize:11,display:"flex",alignItems:"center",gap:5}}>â³ Cargando...</span>
            :<span style={{marginLeft:"auto",color:C.bull,fontSize:11,fontWeight:700}}>ð¢ En vivo</span>}
        </div>

        {/* ââ PRÃXIMA CALL COUNTDOWN ââ */}
        {(()=>{
          const next = earnings.find(e=>!e.live);
          if(!next) return null;
          return(
            <div style={{background:"linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.03))",border:"1px solid rgba(245,158,11,0.2)",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <div style={{fontSize:28}}>{next.emoji||"ð"}</div>
              <div style={{flex:1}}>
                <div style={{color:"#f59e0b",fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:2}}>PRÃXIMA EARNINGS CALL</div>
                <div style={{color:"#e2e8f0",fontWeight:800,fontSize:14}}>{next.ticker} â {next.nombre}</div>
                <div style={{color:"#64748b",fontSize:12}}>{next.live_speaker} Â· {next.fecha} Â· {next.hora}</div>
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <a href={next.ir_url} target="_blank" rel="noopener noreferrer"
                  style={{background:"rgba(245,158,11,0.15)",border:"1px solid rgba(245,158,11,0.4)",borderRadius:10,padding:"7px 14px",color:"#f59e0b",fontSize:12,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap"}}>
                  ð¢ IR Page â
                </a>
                <a href={next.yt_url} target="_blank" rel="noopener noreferrer"
                  style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"7px 14px",color:"#ef4444",fontSize:12,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap"}}>
                  â¶ YouTube â
                </a>
              </div>
            </div>
          );
        })()}

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
                    {/* Emoji + Ticker */}
                    <span style={{fontSize:18,flexShrink:0}}>{e.emoji||"ð"}</span>
                    <span style={{fontFamily:"monospace",fontSize:13,fontWeight:800,color:isToday?C.gold:C.accent,minWidth:46,letterSpacing:0.5}}>{e.ticker}</span>
                    {/* Company + sector */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#CBD5E1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.nombre}</div>
                      {e.sector&&<div style={{fontSize:10,color:"#475569"}}>{e.sector}</div>}
                    </div>
                    {/* Time */}
                    <span style={{fontSize:11,color:"#475569",whiteSpace:"nowrap"}}>{e.hora}</span>
                    {/* IR link */}
                    {e.ir_url&&<a href={e.ir_url} target="_blank" rel="noopener noreferrer"
                      onClick={ev=>ev.stopPropagation()}
                      style={{background:"rgba(255,255,255,0.04)",border:"1px solid #1e293b",borderRadius:7,padding:"3px 8px",fontSize:10,fontWeight:600,color:"#64748b",textDecoration:"none",whiteSpace:"nowrap",flexShrink:0}}>
                      ð¢ IR
                    </a>}
                    {/* Live badge */}
                    {e.live&&<span onClick={ev=>{ev.stopPropagation();setLiveEvent(e);}} style={{background:"#ef4444",borderRadius:12,padding:"3px 10px",fontSize:10,fontWeight:800,color:"#fff",whiteSpace:"nowrap",cursor:"pointer",animation:"nexo-pulse 2s infinite",boxShadow:"0 0 10px rgba(239,68,68,0.5)"}}>ð´ EN VIVO</span>}
                    {/* Bull % pill */}
                    <div style={{display:"flex",gap:0,background:"rgba(255,255,255,0.04)",borderRadius:8,overflow:"hidden",border:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
                      <span style={{fontSize:10,fontWeight:800,color:C.bull,padding:"3px 7px",background:"rgba(0,229,143,0.08)"}}>{bull}%</span>
                      <span style={{fontSize:10,fontWeight:800,color:C.bear,padding:"3px 7px",background:"rgba(255,77,106,0.08)"}}>{100-bull}%</span>
                    </div>
                    {/* Chevron */}
                    <span style={{color:"#334155",fontSize:14,transition:"transform 0.2s",transform:isSel?"rotate(90deg)":"none"}}>âº</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* RIGHT â Detail panel (appears on click) */}
      {sel&&(()=>{
        const bull=votes[sel.ticker];
        const bear=100-bull;
        const myVote=voted[sel.ticker];
        const isToday=sel.fecha==="Hoy"||sel.fechaEn==="Today";
        return(
          <div style={{position:"sticky",top:88}}>
            <div style={{background:"rgba(14,22,40,0.95)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"20px",backdropFilter:"blur(20px)",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
              {/* Close */}
              <button onClick={()=>setSelected(null)} style={{float:"right",background:"none",border:"none",color:"#475569",fontSize:18,cursor:"pointer",lineHeight:1}}>Ã</button>
              {/* Ticker & name */}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontFamily:"monospace",fontSize:20,fontWeight:900,color:isToday?C.gold:C.accent}}>${sel.ticker}</span>
                  {isToday&&<span style={{background:"rgba(245,158,11,0.15)",color:C.gold,border:"1px solid rgba(245,158,11,0.3)",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:800}}>ð¥ HOY</span>}
                </div>
                <div style={{fontSize:14,color:"#94A3B8",fontWeight:600}}>{sel.nombre}</div>
                <div style={{fontSize:12,color:"#475569",marginTop:2}}>{lang==="en"?sel.fechaEn:sel.fecha} Â· {sel.hora}</div>
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

              {/* Community sentiment â gauge style */}
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
                    <span style={{color:C.bull,fontWeight:700}}>ð Bullish</span> / <span style={{color:C.bear,fontWeight:700}}>{bear}% Bearish ð</span>
                  </div>
                  <div style={{fontSize:11,color:"#334155",marginTop:4}}>ð¬ {sel.community_votes.toLocaleString()} votos</div>
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
                    {myVote==="bull"?"â Alcista":"â² Soy Alcista"}
                  </button>
                  <button onClick={()=>vote(sel.ticker,"bear")} disabled={!!myVote}
                    style={{flex:1,background:myVote==="bear"?"rgba(255,77,106,0.15)":"transparent",border:`1.5px solid ${myVote==="bear"?C.bear:"rgba(255,77,106,0.2)"}`,borderRadius:9,padding:"10px 0",cursor:myVote?"not-allowed":"pointer",color:myVote==="bear"?C.bear:"#64748B",fontSize:12,fontWeight:700,transition:"all 0.15s",boxShadow:myVote==="bear"?"0 0 16px rgba(255,77,106,0.2)":"none"}}>
                    {myVote==="bear"?"â Bajista":"â¼ Soy Bajista"}
                  </button>
                </div>
              </div>

              {/* Live button if applicable */}
              {sel.live&&<button onClick={()=>setLiveEvent(sel)} style={{width:"100%",background:"#ef4444",border:"none",borderRadius:9,padding:"10px",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 0 20px rgba(239,68,68,0.4)"}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>
                {sel.live_title} â EN VIVO
              </button>}
            </div>
          </div>
        );
      })()}

      {liveEvent&&<LiveConferenceModal event={liveEvent} lang={lang} onClose={()=>setLiveEvent(null)}/>}
    </div>
  );
}

// ââ LIVE CONFERENCE MODAL âââââââââââââââââââââââââââââââââââââââââââââââââââââ
function LiveConferenceModal({event, lang, onClose}){
  const [viewers]    = useState(event.live_viewers);
  const [reactions,setReactions] = useState([]);
  const [chatMsg, setChatMsg]    = useState("");
  const [elapsed, setElapsed]    = useState(0);
  const [showEmbed, setShowEmbed] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const [chatLog, setChatLog]    = useState([
    {user:"SPY_Trader ð",  avatar:"ð", msg: lang==="en"?"Watching EPS beat vs miss closely":"Pendiente del EPS vs estimado", time:"2m"},
    {user:"CryptoWolf",     avatar:"ðº", msg: lang==="en"?"Revenue growth YoY? ð¹":"Â¿Crecimiento de ingresos YoY? ð¹",  time:"1m"},
    {user:"NvidiaChad â­",  avatar:"ð¦", msg: lang==="en"?"Management tone sounds cautious, watch guidance":"Tono de management cauteloso, ojo con el guidance",  time:"45s"},
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
    setChatLog(l=>[...l,{user:lang==="en"?"You":"TÃº", avatar:"ð", msg:chatMsg, time:"ahora"}]);
    setChatMsg("");
  };

  const REACTIONS = ["ð","ð","ð»","ð¹","ð¥","â¡","ð¡","ð±"];

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
            <div style={{color:"#fff",fontWeight:800,fontSize:15}}>${event.ticker} â {event.live_title}</div>
            <div style={{color:"#64748b",fontSize:12}}>{event.live_speaker}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#00c49a",fontFamily:"monospace",fontWeight:700,fontSize:13}}>{fmtTime(elapsed)}</div>
              <div style={{color:"#64748b",fontSize:11}}>â± {lang==="en"?"Duration":"DuraciÃ³n"}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#e2e8f0",fontWeight:700,fontSize:13}}>{(viewers+Math.floor(elapsed/10)).toLocaleString()}</div>
              <div style={{color:"#64748b",fontSize:11}}>ð {lang==="en"?"Watching":"Viendo"}</div>
            </div>
            <button onClick={onClose} style={{background:"#1e293b",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#94a3b8",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>â</button>
          </div>
        </div>

        {/* Body: Player + Chat */}
        <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>

          {/* Player area */}
          <div style={{flex:1,display:"flex",flexDirection:"column",borderRight:"1px solid #1e293b"}}>
            {/* Player area */}
            <div style={{flex:1,background:"#020617",display:"flex",flexDirection:"column",position:"relative",minHeight:280,overflow:"hidden"}}>

              {/* Live badge */}
              <div style={{position:"absolute",top:12,left:12,zIndex:10,display:"flex",alignItems:"center",gap:6,background:"rgba(239,68,68,0.15)",border:"1px solid #ef4444",borderRadius:20,padding:"4px 10px"}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:"#ef4444",display:"inline-block",animation:"nexo-pulse 1s infinite"}}/>
                <span style={{color:"#ef4444",fontSize:11,fontWeight:700}}>EN VIVO Â· {event.ticker}</span>
              </div>

              {/* Toggle embed/info button */}
              {event.yt_embed && !embedError && (
                <button onClick={()=>setShowEmbed(v=>!v)}
                  style={{position:"absolute",top:12,right:12,zIndex:10,background:"rgba(15,23,42,0.85)",border:"1px solid #334155",borderRadius:10,padding:"5px 12px",cursor:"pointer",color:"#94a3b8",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
                  {showEmbed ? "ð Ver info" : "ðº Ver stream"}
                </button>
              )}

              {/* YouTube iframe embed */}
              {event.yt_embed && showEmbed && !embedError ? (
                <iframe
                  key={event.ticker}
                  src={event.yt_embed}
                  title={`${event.nombre} â ${event.live_title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={()=>setEmbedError(true)}
                  style={{width:"100%",flex:1,border:"none",display:"block",minHeight:280}}
                />
              ) : (
                /* Fallback: waveform + info */
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
                  {/* Animated waveform */}
                  <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:20}}>
                    {[40,70,55,90,65,80,45,100,60,85,50,75].map((h,i)=>(
                      <div key={i} style={{width:5,borderRadius:3,background:"linear-gradient(180deg,#00c49a,#00a87f)",height:`${h}%`,maxHeight:56,animation:`waveBar 0.8s ease-in-out ${i*0.07}s infinite alternate`,opacity:0.8}}/>
                    ))}
                  </div>

                  <div style={{width:64,height:64,borderRadius:16,background:"#1e293b",border:"2px solid #334155",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:10}}>
                    {event.emoji||"ð"}
                  </div>
                  <div style={{color:"#e2e8f0",fontWeight:900,fontSize:18,marginBottom:2}}>{event.nombre} â {event.ticker}</div>
                  <div style={{color:"#64748b",fontSize:12,marginBottom:3}}>{event.live_title}</div>
                  <div style={{color:"#94a3b8",fontSize:11,marginBottom:18}}>ðï¸ {event.live_speaker}</div>

                  <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:12}}>
                    <a href={event.yt_url} target="_blank" rel="noopener noreferrer"
                      style={{display:"flex",alignItems:"center",gap:7,background:"#ef4444",borderRadius:12,padding:"10px 20px",color:"#fff",fontWeight:800,fontSize:13,textDecoration:"none",boxShadow:"0 0 18px rgba(239,68,68,0.4)"}}>
                      â¶ Ver en YouTube
                    </a>
                    <a href={event.ir_url} target="_blank" rel="noopener noreferrer"
                      style={{display:"flex",alignItems:"center",gap:7,background:"rgba(0,168,255,0.12)",border:"1px solid rgba(0,168,255,0.4)",borderRadius:12,padding:"10px 20px",color:"#00A8FF",fontWeight:800,fontSize:13,textDecoration:"none"}}>
                      ð¢ Investor Relations
                    </a>
                  </div>
                  <div style={{color:"#334155",fontSize:11,textAlign:"center",maxWidth:300}}>
                    {embedError ? "El embed no estÃ¡ disponible â accede desde YouTube directamente." : "El livestream se activa en los canales oficiales de la empresa durante el call."}
                  </div>
                </div>
              )}
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
              ð¬ {lang==="en"?"LIVE CHAT":"CHAT EN VIVO"}
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
              <button onClick={sendChat} style={{background:C.accent,border:"none",borderRadius:8,padding:"7px 11px",cursor:"pointer",color:"#fff",fontSize:13,fontWeight:700}}>â</button>
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
        <h2 style={{margin:0,color:C.text,fontSize:18,fontWeight:800}}>ð¥ Trending en NexoTrade</h2>
        <span style={{background:"rgba(239,68,68,0.08)",color:C.bear,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>Ãltimas 24h</span>
        {loading
          ?<span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>â³ Actualizando...</span>
          :<span style={{fontSize:11,color:C.bull,fontWeight:700,marginLeft:"auto"}}>ð¢ En vivo Â· {lastUpdate}</span>}
        <button onClick={fetchQuotes} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,color:C.muted,fontWeight:600}}>ð</button>
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
              {i===0?"ð¥":i===1?"ð¥":i===2?"ð¥":<span style={{color:C.muted2}}>{i+1}</span>}
            </span>
            {/* Ticker badge */}
            <div style={{background:change>=0?C.bullBg:C.bearBg,borderRadius:9,padding:"7px 12px",minWidth:60,textAlign:"center",flexShrink:0}}>
              <div style={{fontWeight:800,fontSize:13,fontFamily:"monospace",color:change>=0?C.bull:C.bear}}>{t.ticker}</div>
              {price>0&&<div style={{fontSize:10,color:C.muted,fontFamily:"monospace"}}>${price>=1000?price.toFixed(0):price.toFixed(2)}</div>}
            </div>
            {/* Info */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                {t.mentions>0&&<span style={{color:C.muted2,fontSize:12}}>ð¬ {t.mentions} menciones</span>}
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
        ð Se actualiza automÃ¡ticamente cada 60 segundos
      </div>
    </div>
  );
}


// ââ VIP UPSELL CARD (aparece en el feed cada 5 posts) âââââââââââââââââââââââââ
function VipFeedCard({onGoVIP}){
  return(
    <div onClick={onGoVIP} style={{
      background:"linear-gradient(135deg,#0F0A2E,#1A0A3D,#0D1A3D)",
      border:"1.5px solid rgba(124,58,237,0.5)",
      borderRadius:18,
      padding:"18px 20px",
      margin:"8px 0",
      cursor:"pointer",
      position:"relative",
      overflow:"hidden",
      boxShadow:"0 4px 24px rgba(124,58,237,0.2)",
    }}>
      {/* Fondo decorativo */}
      <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(124,58,237,0.12)",pointerEvents:"none"}}/>

      {/* Badge */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",color:"#fff",borderRadius:20,padding:"3px 12px",fontSize:10,fontWeight:800,letterSpacing:0.8}}>â¦ NEXO VIP</span>
        <span style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>Oferta especial</span>
      </div>

      {/* TÃ­tulo */}
      <div style={{fontWeight:900,color:"#fff",fontSize:17,marginBottom:4,letterSpacing:-0.3}}>
        Accede a picks exclusivos ð
      </div>
      <div style={{color:"rgba(255,255,255,0.55)",fontSize:12,marginBottom:14,lineHeight:1.5}}>
        SeÃ±ales VIP Â· Picks semanales Â· Sala privada Â· AnÃ¡lisis en tiempo real
      </div>

      {/* Features */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        {["ð Picks VIP","ð Alertas","ð¬ Sala privada","ð Earnings"].map(f=>(
          <span key={f} style={{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:20,padding:"3px 10px",fontSize:10,color:"rgba(255,255,255,0.7)",fontWeight:600}}>{f}</span>
        ))}
      </div>

      {/* CTA */}
      <div style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",borderRadius:12,padding:"11px 20px",textAlign:"center",color:"#fff",fontWeight:900,fontSize:14,boxShadow:"0 4px 16px rgba(124,58,237,0.5)"}}>
        â¦ Hazte VIP â Solo $9.99/mes â
      </div>
    </div>
  );
}

// ââ POSTS PATROCINADOS (aparecen en el feed como publicidad nativa) âââââââââââ
// Configura aquÃ­ tus anunciantes. Cada uno paga $200-$2,000/mes por aparecer aquÃ­.
const SPONSORED_POSTS = [
  {
    id:"sp1",
    brand:"Interactive Brokers",
    logo:"ð¦",
    brandColor:"#C8102E",
    text:"Opera en 150 mercados mundiales â acciones, opciones, futuros, forex y crypto. Comisiones desde $0. Regulado por SEC y FINRA. El broker favorito de inversores profesionales en LATAM.",
    cta:"Abrir cuenta y ganar $200 â",
    url:"https://www.interactivebrokers.com/mkt/?src=nexotrade1&url=%2Fen%2Fwhyib%2Foverviewnetwork.php",
    badge:"Patrocinado",
  },
  {
    id:"sp2",
    brand:"Kraken",
    logo:"ð",
    brandColor:"#5741D9",
    text:"El exchange de crypto mÃ¡s seguro y regulado. MÃ¡s de 200 criptomonedas disponibles, staking hasta 21% APY, y soporte 24/7 en espaÃ±ol. Recomendado por traders profesionales.",
    cta:"Empezar en Kraken gratis â",
    url:"https://www.kraken.com/sign-up?referral=nexotrade",
    badge:"Patrocinado",
  },
  {
    id:"sp3",
    brand:"Tastytrade",
    logo:"ð®",
    brandColor:"#F97316",
    text:"La plataforma de opciones favorita de traders profesionales en EE.UU. ComisiÃ³n $0 al cerrar posiciÃ³n. EducaciÃ³n gratuita incluida. MÃ¡s de 1 millÃ³n de traders activos.",
    cta:"Probar gratis 60 dÃ­as â",
    url:"https://open.tastytrade.com/",
    badge:"Patrocinado",
  },
  {
    id:"sp4",
    brand:"Bybit",
    logo:"â¡",
    brandColor:"#F7A600",
    text:"Opera futuros y spot con las comisiones mÃ¡s competitivas del mercado. Bono de bienvenida hasta $100 USDT. Copy trading disponible â copia a los mejores traders automÃ¡ticamente.",
    cta:"Reclamar $100 de bienvenida â",
    url:"https://www.bybit.com/invite?ref=NEXOTRADE",
    badge:"Patrocinado",
  },
];

function SponsoredPostCard({sp}){
  const [dismissed,setDismissed]=useState(false);
  if(dismissed) return null;
  return(
    <div style={{
      background:"#FFFFFF",
      border:`1.5px solid rgba(0,168,255,0.18)`,
      borderRadius:18,
      padding:"16px 18px",
      margin:"8px 0",
      position:"relative",
      boxShadow:"0 2px 12px rgba(0,168,255,0.07)",
    }}>
      {/* Badge patrocinado */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>{sp.logo}</span>
          <span style={{fontWeight:800,fontSize:13,color:"#0F172A"}}>{sp.brand}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{background:"rgba(0,168,255,0.08)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:20,padding:"2px 9px",fontSize:9,color:"#64748B",fontWeight:700,letterSpacing:0.5}}>Patrocinado</span>
          <button onClick={()=>setDismissed(true)} style={{background:"none",border:"none",color:"#94A3B8",fontSize:16,cursor:"pointer",lineHeight:1,padding:"2px 4px"}}>Ã</button>
        </div>
      </div>
      {/* Texto */}
      <p style={{margin:"0 0 14px",color:"#475569",fontSize:13.5,lineHeight:1.6}}>{sp.text}</p>
      {/* CTA */}
      <a href={sp.url} target="_blank" rel="noopener noreferrer"
        style={{display:"inline-block",background:"#00A8FF",color:"#fff",borderRadius:10,padding:"9px 20px",fontSize:13,fontWeight:700,textDecoration:"none",transition:"opacity 0.15s"}}
        onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
        onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
        {sp.cta}
      </a>
    </div>
  );
}

// ââ VIP POP-UP MODAL (aparece a los 30s para no-premium) ââââââââââââââââââââââ
function VipPopup({onClose, onGoVIP}){
  return(
    <div style={{
      position:"fixed",inset:0,zIndex:9999,
      background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:16,
      overflowY:"auto",
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"linear-gradient(160deg,#0F0A2E,#1A0A3D,#0D1A3D)",
        border:"1.5px solid rgba(124,58,237,0.5)",
        borderRadius:24,
        padding:"28px 24px",
        maxWidth:380,
        width:"100%",
        position:"relative",
        boxShadow:"0 8px 40px rgba(124,58,237,0.35)",
      }}>
        {/* Cerrar */}
        <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"transparent",border:"none",color:"rgba(255,255,255,0.4)",fontSize:20,cursor:"pointer",lineHeight:1}}>â</button>

        {/* Ãcono */}
        <div style={{textAlign:"center",fontSize:44,marginBottom:10}}>â¦</div>

        {/* TÃ­tulo */}
        <div style={{textAlign:"center",fontWeight:900,color:"#fff",fontSize:22,marginBottom:6,letterSpacing:-0.5}}>
          Ãnete a NEXO VIP
        </div>
        <div style={{textAlign:"center",color:"rgba(255,255,255,0.5)",fontSize:13,marginBottom:20,lineHeight:1.5}}>
          Los mejores traders ya estÃ¡n adentro. Accede a picks, seÃ±ales y la sala privada.
        </div>

        {/* Beneficios */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
          {[
            {icon:"ð", text:"Picks VIP semanales con entrada, target y stop"},
            {icon:"ð", text:"Alertas de precio en tiempo real"},
            {icon:"ð¬", text:"Sala privada solo para miembros VIP"},
            {icon:"ð", text:"Earnings calendar con anÃ¡lisis previo"},
            {icon:"ð", text:"Badge VIP exclusivo en tu perfil"},
          ].map(({icon,text})=>(
            <div key={text} style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.75)",lineHeight:1.4}}>{text}</span>
            </div>
          ))}
        </div>

        {/* Precio + CTA */}
        <div style={{textAlign:"center",marginBottom:10}}>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.35)",textDecoration:"line-through"}}>$19.99/mes</span>
          <span style={{fontSize:28,fontWeight:900,color:"#A78BFA",marginLeft:8}}>$9.99</span>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>/mes</span>
        </div>

        <div onClick={onGoVIP} style={{
          background:"linear-gradient(135deg,#7C3AED,#6366F1)",
          borderRadius:14,padding:"14px 20px",textAlign:"center",
          color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",
          boxShadow:"0 4px 20px rgba(124,58,237,0.5)",
          letterSpacing:0.2,
        }}>
          â¦ Empezar ahora â
        </div>
        <div style={{textAlign:"center",marginTop:10,fontSize:10,color:"rgba(255,255,255,0.25)"}}>
          Cancela cuando quieras Â· Sin compromisos
        </div>
      </div>
    </div>
  );
}

// ââ PREMIUM PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function PremiumPage({user, isPremium, isPro, onSubscribe, onNeedAuth, lang}){
  const [email, setEmail] = useState(user?.email||"");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("planes");

  const price = 9.99;

  const FREE_FEATURES = [
    "Foro social â publicar, comentar y repostear",
    "Mensajes privados (mutuo seguimiento)",
    "Noticias del mercado en tiempo real",
    "Calendario de earnings",
    "Trending â acciones mÃ¡s mencionadas",
    "Leaderboard pÃºblico de traders",
    "Paper trading con $100k virtual",
    "3 lecciones gratuitas de Academia",
    "Watchlist bÃ¡sica (hasta 5 acciones)",
    "Sistema de puntos y badges",
  ];

  const VIP_FEATURES = [
    "â Todo lo del plan Free incluido",
    "ð 10 Picks semanales exclusivos con anÃ¡lisis",
    "ð¡ 30+ Ideas de inversiÃ³n con tesis completa",
    "ðï¸ 52 portafolios GurÃºs 13F actualizados (Buffett, Ackman...)",
    "ð Flujo institucional â dark pool y sweeps en tiempo real",
    "ð ï¸ Stock Screener avanzado con 20+ filtros",
    "ð Calendario de dividendos en tiempo real",
    "ð Calendario de IPOs prÃ³ximas",
    "ð Calendario econÃ³mico macro en tiempo real",
    "ð¦ ARK Invest â holdings diarios actualizados",
    "ð Insiders SEC â Form 4 en tiempo real",
    "ð¤ Asistente IA de trading ilimitado",
    "ð Alertas de precio por email personalizadas",
    "ð Academia completa â todos los cursos",
    "ð Webinars con 50% de descuento exclusivo",
    "â¦ Badge VIP dorado en tu perfil",
  ];

  const SIGNALS = [
    {ticker:"NVDA", tipo:"COMPRA", entrada:"$860", target:"$950", stop:"$830", conf:92, tiempo:"hace 2h", blur:!isPremium},
    {ticker:"BTC",  tipo:"COMPRA", entrada:"$67,200", target:"$72,000", stop:"$65,000", conf:85, tiempo:"hace 4h", blur:!isPremium},
    {ticker:"TSLA", tipo:"VENTA",  entrada:"$178", target:"$160", stop:"$185", conf:78, tiempo:"hace 6h", blur:!isPremium},
    {ticker:"ETH",  tipo:"COMPRA", entrada:"$3,750", target:"$4,200", stop:"$3,500", conf:81, tiempo:"hace 8h", blur:!isPremium},
  ];

  const WEBINARS = [
    {titulo:"AnÃ¡lisis tÃ©cnico para principiantes", fecha:"Lun 2 Jun",  hora:"19:00 EST", instructor:"SPY_Trader",  spots:47, spotsLeft:12, emoji:"ð", precio:29, precioVip:14, stripeLink:STRIPE_LINKS.webinar1, nivel:"Principiante", duracion:"90 min", desc:"Aprende a leer grÃ¡ficas, identificar soportes, resistencias y los 5 patrones mÃ¡s rentables del mercado."},
    {titulo:"Bitcoin: ciclos y anÃ¡lisis on-chain",  fecha:"MiÃ© 4 Jun", hora:"20:00 EST", instructor:"CryptoWolf",  spots:50, spotsLeft:8,  emoji:"â¿",  precio:49, precioVip:24, stripeLink:STRIPE_LINKS.webinar2, nivel:"Intermedio",   duracion:"2 horas", desc:"CÃ³mo anticipar los ciclos de Bitcoin usando datos on-chain: MVRV, NVT, Hodl Waves y mÃ¡s."},
    {titulo:"CÃ³mo leer un earnings report",         fecha:"Vie 6 Jun", hora:"18:30 EST", instructor:"NvidiaChad",  spots:60, spotsLeft:23, emoji:"ð", precio:29, precioVip:14, stripeLink:STRIPE_LINKS.webinar3, nivel:"Principiante", duracion:"75 min", desc:"Todo lo que necesitas saber para operar earnings: EPS, revenue, guidance y cÃ³mo posicionarte."},
    {titulo:"Opciones: estrategias defensivas",     fecha:"Lun 9 Jun", hora:"19:00 EST", instructor:"SPY_Trader",  spots:35, spotsLeft:7,  emoji:"ð¡ï¸", precio:79, precioVip:39, stripeLink:STRIPE_LINKS.webinar4, nivel:"Avanzado",     duracion:"2.5 horas", desc:"Covered calls, protective puts y iron condors explicados paso a paso con ejemplos reales."},
    {titulo:"Cripto DeFi: yield farming y staking", fecha:"MiÃ© 11 Jun",hora:"20:00 EST", instructor:"CryptoWolf",  spots:40, spotsLeft:18, emoji:"ð¾", precio:49, precioVip:24, stripeLink:STRIPE_LINKS.webinar5, nivel:"Intermedio",   duracion:"2 horas", desc:"Genera ingresos pasivos con tus cryptos: los mejores protocolos DeFi, riesgos y cÃ³mo empezar."},
    {titulo:"Trading de dividendos â renta pasiva",  fecha:"Vie 13 Jun",hora:"18:30 EST", instructor:"NvidiaChad",  spots:55, spotsLeft:31, emoji:"ð°", precio:39, precioVip:19, stripeLink:STRIPE_LINKS.webinar6, nivel:"Principiante", duracion:"90 min", desc:"Construye un portafolio de dividendos que genere ingresos mensuales. Las mejores acciones para 2025."},
  ];

  const ALERT_TYPES = [
    {icon:"ð", titulo:"Precio sube de...", desc:"Te avisamos cuando una acciÃ³n supere tu precio objetivo"},
    {icon:"ð", titulo:"Precio baja de...", desc:"Alerta cuando una acciÃ³n caiga por debajo de tu nivel"},
    {icon:"ð", titulo:"Earnings prÃ³ximos", desc:"Email 24h antes del earnings de tus acciones favoritas"},
    {icon:"ð¥", titulo:"Trending alert",   desc:"Cuando una acciÃ³n explota en menciones en la comunidad"},
    {icon:"ð", titulo:"Volumen inusual",   desc:"Detectamos movimientos de volumen anÃ³malos"},
    {icon:"ð°", titulo:"Noticia urgente",   desc:"Breaking news de tus tickers favoritos al instante"},
  ];

  const handleSubscribe = () => {
    if(!user){ onNeedAuth(); return; }
    // Abrir Stripe Checkout â pago real con 7 dÃ­as gratis
    // Pasamos el email del usuario para pre-rellenar el formulario de Stripe
    const stripeUrl = STRIPE_PAYMENT_LINK
      ? STRIPE_PAYMENT_LINK + (user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : "")
      : "https://dashboard.stripe.com"; // fallback si no se configurÃ³ el link
    window.open(stripeUrl, "_blank");
  };

  const TABS = [
    {k:"planes",   l:"ð Planes"},
    {k:"senales",  l:"ð¡ SeÃ±ales"},
    {k:"webinars", l:"ð Webinars"},
    {k:"alertas",  l:"ð§ Alertas Email"},
  ];

  return(
    <div>
      {/* HERO */}
      <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)",borderRadius:20,padding:"40px 32px",marginBottom:24,textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:`radial-gradient(circle at 30% 50%,${C.accent}15,transparent 60%), radial-gradient(circle at 70% 50%,${C.blue}15,transparent 60%)`,pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          {isPremium
            ? <>
                <div style={{fontSize:48,marginBottom:12}}>â­</div>
                <h1 style={{margin:"0 0 8px",color:"#fff",fontSize:26,fontWeight:900}}>Â¡Eres miembro Premium!</h1>
                <p style={{margin:"0 0 20px",color:"#94a3b8",fontSize:15}}>Tienes acceso completo a todas las funciones exclusivas.</p>
                <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                  {["ð¡ Ideas VIP","ðï¸ GurÃºs 13F","ð Flujo Institucional","ð ï¸ Screener","ð¤ IA Ilimitada","ð Insiders SEC"].map(b=>(
                    <span key={b} style={{background:C.bull+"22",color:C.bull,border:`1px solid ${C.bull}44`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700}}>{b}</span>
                  ))}
                </div>
              </>
            : <>
                {/* Urgency banner */}
                <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:20,padding:"6px 16px",marginBottom:14}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:"#ef4444",display:"inline-block",animation:"nexo-pulse 1.5s infinite"}}/>
                  <span style={{color:"#f87171",fontSize:12,fontWeight:700,letterSpacing:0.5}}>ð¥ {lang==="en"?"Only 23 VIP spots left this month":"Solo quedan 23 spots VIP este mes"}</span>
                </div>
                <h1 style={{margin:"0 0 10px",color:"#fff",fontSize:"clamp(22px,4vw,30px)",fontWeight:900,lineHeight:1.2}}>{lang==="en"?"Take your trading to the next level":"Lleva tu trading al siguiente nivel"}</h1>
                <p style={{margin:"0 auto 20px",color:"#94a3b8",fontSize:15,maxWidth:480}}>{lang==="en"?"Real-time signals, unlimited AI, email alerts and exclusive education.":"SeÃ±ales en tiempo real, IA sin lÃ­mites, alertas por email y formaciÃ³n exclusiva."}</p>
                {/* CTA prominente en el hero */}
                <button onClick={handleSubscribe}
                  style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",border:"none",borderRadius:14,padding:"16px 36px",fontSize:16,fontWeight:900,color:"#fff",cursor:"pointer",boxShadow:"0 4px 32px rgba(124,58,237,0.6)",marginBottom:12,display:"inline-flex",alignItems:"center",gap:8,transition:"transform 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  {lang==="en"?"â¦ Start free 7 days â $9.99/mo after":"â¦ Empieza gratis 7 dÃ­as â $9.99/mes despuÃ©s"}
                </button>
                <div style={{fontSize:12,color:"#475569",marginBottom:16}}>{lang==="en"?"No card required Â· Cancel anytime Â· 840+ active VIP traders":"Sin tarjeta requerida Â· Cancela cuando quieras Â· 840+ traders VIP activos"}</div>
                <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                  {(lang==="en"
                    ?["ð¡ VIP Ideas","ðï¸ Gurus 13F","ð Institutional Flow","ð ï¸ Screener","ð¤ Unlimited AI","ð Calendars"]
                    :["ð¡ Ideas VIP","ðï¸ GurÃºs 13F","ð Flujo Institucional","ð ï¸ Screener","ð¤ IA Ilimitada","ð Calendarios"]
                  ).map(b=>(
                    <span key={b} style={{background:"#ffffff15",border:"1px solid #ffffff22",borderRadius:20,padding:"5px 12px",fontSize:12,color:"#e2e8f0",fontWeight:600}}>{b}</span>
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

      {/* ââ PLANES TAB ââ */}
      {activeTab==="planes" && <>
        {/* ââ GRID 2 COLUMNAS ââ */}
        <div className="nexo-premium-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,marginBottom:28,borderRadius:18,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>

          {/* FREE */}
          <div style={{background:"rgba(10,16,30,0.98)",padding:"28px 24px",borderRight:"1px solid rgba(255,255,255,0.06)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,width:180,height:180,background:"radial-gradient(circle,rgba(0,168,255,0.06),transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#00A8FF",letterSpacing:1.5,marginBottom:6}}>FREE</div>
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:4}}>
                <span style={{fontSize:34,fontWeight:900,color:"#F1F5F9"}}>$0</span>
              </div>
              <div style={{fontSize:12,color:"#475569",marginBottom:20}}>Para siempre gratis</div>
              {FREE_FEATURES.map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",borderBottom:i<FREE_FEATURES.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                  <span style={{fontSize:11,color:"#00A8FF",flexShrink:0,marginTop:2}}>â</span>
                  <span style={{fontSize:12,color:"#94A3B8",lineHeight:1.4}}>{f}</span>
                </div>
              ))}
              <div style={{marginTop:24,padding:"12px",borderRadius:10,background:"rgba(0,168,255,0.04)",textAlign:"center",color:"#334155",fontSize:12,fontWeight:700,border:"1px solid rgba(0,168,255,0.1)"}}>
                Plan actual
              </div>
            </div>
          </div>

          {/* VIP */}
          <div style={{background:"rgba(12,10,30,0.99)",padding:"28px 24px",position:"relative",overflow:"hidden",borderLeft:"2px solid #7C3AED"}}>
            <div style={{position:"absolute",top:0,right:0,background:"linear-gradient(135deg,#7C3AED,#6366F1)",color:"#fff",fontSize:9,fontWeight:800,padding:"5px 14px",borderRadius:"0 0 0 10px",letterSpacing:0.8}}>â¦ ÃNICO PLAN</div>
            <div style={{position:"absolute",top:0,left:0,width:220,height:220,background:"radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%)",pointerEvents:"none"}}/>
            <div style={{position:"relative"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#A78BFA",letterSpacing:1.5,marginBottom:6}}>â¦ VIP</div>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
                <span style={{fontSize:34,fontWeight:900,color:"#F1F5F9"}}>${price.toFixed(2)}</span>
                <span style={{fontSize:13,color:"#64748B"}}>/mes</span>
              </div>
              <div style={{fontSize:12,color:"#475569",marginBottom:20}}>Cancela cuando quieras Â· Sin permanencia</div>
              {VIP_FEATURES.map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",borderBottom:i<VIP_FEATURES.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                  <span style={{fontSize:11,color:"#A78BFA",flexShrink:0,marginTop:2}}>â</span>
                  <span style={{fontSize:12,color:"#CBD5E1",lineHeight:1.4}}>{f}</span>
                </div>
              ))}
              <div style={{marginTop:24}}>
                {isPremium
                  ?<div style={{background:"rgba(0,229,143,0.1)",border:"1px solid rgba(0,229,143,0.3)",borderRadius:10,padding:"13px",textAlign:"center",color:"#16A34A",fontWeight:800,fontSize:14}}>â Plan activo â Â¡Gracias por ser VIP!</div>
                  :<>
                    {/* Trial badge */}
                    <div style={{background:"rgba(0,200,100,0.1)",border:"1px solid rgba(0,200,100,0.25)",borderRadius:10,padding:"8px 12px",marginBottom:10,textAlign:"center"}}>
                      <span style={{fontSize:12,fontWeight:800,color:"#10b981"}}>ð 7 dÃ­as GRATIS Â· Luego solo $9.99/mes</span>
                    </div>
                    <button onClick={handleSubscribe}
                      style={{width:"100%",background:"linear-gradient(135deg,#7C3AED,#6366F1)",border:"none",borderRadius:10,padding:"15px",fontSize:15,fontWeight:900,color:"#fff",cursor:"pointer",boxShadow:"0 4px 28px rgba(124,58,237,0.55)",marginBottom:8,transition:"transform 0.15s, box-shadow 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 36px rgba(124,58,237,0.7)";}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 28px rgba(124,58,237,0.55)";}}>
                      â¦ Comenzar prueba gratis â
                    </button>
                    <div style={{textAlign:"center",fontSize:11,color:"#475569"}}>Sin tarjeta Â· Cancela cuando quieras Â· Acceso inmediato</div>
                  </>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Success message */}
        {successMsg&&<div style={{background:C.bullBg,border:`1px solid ${C.bull}44`,borderRadius:14,padding:"16px 20px",marginBottom:20,display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:24}}>ð§</span>
          <div>
            <div style={{fontWeight:700,color:C.bull,marginBottom:2}}>Â¡SuscripciÃ³n activada!</div>
            <div style={{color:C.muted,fontSize:13}}>{successMsg}</div>
          </div>
        </div>}

        {/* Trust badges */}
        <div className="nexo-trust-badges" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
          {[
            {icon:"ð",title:"Pago seguro",desc:"SSL + Stripe",   href:"https://stripe.com/es/payments/payment-links",tip:"Pagos 100% seguros con Stripe"},
            {icon:"â©ï¸",title:"Cancela ya", desc:"Sin permanencia",href:STRIPE_PAYMENT_LINK,tip:"Cancela cuando quieras"},
            {icon:"ð§",title:"Alertas email",desc:"InstantÃ¡neas", href:null, action:"alerts", tip:"Configura tus alertas"},
            {icon:"ð",title:"Soporte 24/7",desc:"Respuesta en 2h",href:"mailto:mariagalarraga2013@gmail.com?subject=Soporte NexoTrade",tip:"EscrÃ­benos"},
          ].map(b=>(
            <div key={b.title}
              onClick={()=>{ if(b.action==="alerts"){setAlerts(true);} else if(b.href){window.open(b.href,"_blank");} }}
              title={b.tip}
              style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 12px",textAlign:"center",boxShadow:C.shadow,cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=C.shadowMd;e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow=C.shadow;e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}>
              <div style={{fontSize:22,marginBottom:6}}>{b.icon}</div>
              <div style={{fontWeight:700,color:C.text,fontSize:12}}>{b.title}</div>
              <div style={{color:C.muted2,fontSize:11}}>{b.desc}</div>
            </div>
          ))}
        </div>
      </>}

      {/* ââ SEÃALES TAB ââ */}
      {activeTab==="senales" && <>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div>
            <h2 style={{margin:"0 0 4px",color:C.text,fontSize:18,fontWeight:800}}>ð¡ SeÃ±ales de Trading</h2>
            <p style={{margin:0,color:C.muted,fontSize:13}}>Generadas por nuestros traders Top 5 con IA</p>
          </div>
          {!isPremium&&<div style={{background:C.gold+"15",border:`1px solid ${C.gold}44`,borderRadius:12,padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>ð</span>
            <span style={{color:"#b45309",fontSize:13,fontWeight:600}}>Requiere Premium para ver detalles</span>
          </div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {SIGNALS.map((s,i)=>(
            <div key={i} style={{background:C.surface,border:`1px solid ${s.tipo==="COMPRA"?C.bull:C.bear}33`,borderRadius:16,padding:"18px 20px",boxShadow:C.shadow,borderLeft:`4px solid ${s.tipo==="COMPRA"?C.bull:C.bear}`,position:"relative",overflow:"hidden"}}>
              {s.blur&&<div style={{position:"absolute",inset:0,backdropFilter:"blur(6px)",background:"rgba(255,255,255,0.6)",zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:16}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:28,marginBottom:8}}>ð</div>
                  <div style={{fontWeight:800,color:C.text,fontSize:14,marginBottom:4}}>Solo para miembros Premium</div>
                  <button onClick={()=>setActiveTab("planes")} style={{background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:10,padding:"8px 20px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Ver planes â</button>
                </div>
              </div>}
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <span style={{background:C.accentDim,color:C.accentText,borderRadius:8,padding:"3px 10px",fontSize:14,fontWeight:800,fontFamily:"monospace"}}>${s.ticker}</span>
                <span style={{background:s.tipo==="COMPRA"?C.bullBg:C.bearBg,color:s.tipo==="COMPRA"?C.bull:C.bear,border:`1px solid ${s.tipo==="COMPRA"?C.bull:C.bear}44`,borderRadius:20,padding:"3px 12px",fontSize:12,fontWeight:800}}>
                  {s.tipo==="COMPRA"?"â² COMPRA":"â¼ VENTA"}
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
          <div style={{fontSize:32,marginBottom:10}}>ð¡</div>
          <h3 style={{margin:"0 0 8px",color:"#fff",fontSize:16,fontWeight:800}}>Desbloquea todas las seÃ±ales</h3>
          <p style={{margin:"0 0 16px",color:"#94a3b8",fontSize:13}}>Con Premium recibes seÃ±ales en tiempo real con entrada exacta, target y stop loss.</p>
          <button onClick={()=>setActiveTab("planes")} style={{background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:12,padding:"11px 28px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>â­ Ver Premium â</button>
        </div>}
      </>}

      {/* ââ WEBINARS TAB ââ */}
      {activeTab==="webinars" && <>
        <div style={{marginBottom:20,display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{margin:"0 0 4px",color:C.text,fontSize:18,fontWeight:800}}>ð Webinars en Vivo</h2>
            <p style={{margin:0,color:C.muted,fontSize:13}}>FormaciÃ³n con traders reales Â· GrabaciÃ³n incluida Â· Plazas limitadas</p>
          </div>
          {isPremium && <div style={{background:"linear-gradient(135deg,#7C3AED22,#6D28D911)",border:"1px solid #7C3AED44",borderRadius:10,padding:"6px 14px",fontSize:12,fontWeight:700,color:"#a78bfa"}}>â¦ VIP: 50% descuento aplicado</div>}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {WEBINARS.map((w,i)=>{
            const isUrgent = w.spotsLeft <= 10;
            const isSoldOut = w.spotsLeft === 0;
            const spotsPercent = Math.round((w.spotsLeft / w.spots) * 100);
            const nivelColor = w.nivel==="Avanzado" ? "#ef4444" : w.nivel==="Intermedio" ? "#f59e0b" : "#10b981";
            const handleBuyWebinar = () => {
              if(!user){ onNeedAuth(); return; }
              const link = isPremium
                ? w.stripeLink + `?prefilled_email=${encodeURIComponent(user?.email||"")}`
                : w.stripeLink + `?prefilled_email=${encodeURIComponent(user?.email||"")}`;
              window.open(link, "_blank");
            };
            return(
              <div key={i} style={{background:C.surface,border:`1px solid ${isUrgent&&!isSoldOut ? "#ef444444" : C.border}`,borderRadius:18,padding:"20px 22px",boxShadow:C.shadow,position:"relative",overflow:"hidden"}}>
                {/* Urgency glow */}
                {isUrgent && !isSoldOut && <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#ef4444,#f59e0b)"}}/>}

                <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
                  {/* Emoji icon */}
                  <div style={{width:54,height:54,borderRadius:14,background:`linear-gradient(135deg,${C.accentDim},${C.blueBg})`,border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{w.emoji}</div>

                  {/* Content */}
                  <div style={{flex:1,minWidth:180}}>
                    {/* Title + level badge */}
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                      <h3 style={{margin:0,color:C.text,fontSize:15,fontWeight:800}}>{w.titulo}</h3>
                      <span style={{background:nivelColor+"22",color:nivelColor,border:`1px solid ${nivelColor}44`,borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:700}}>{w.nivel}</span>
                    </div>

                    {/* Meta row */}
                    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:6}}>
                      <span style={{color:C.muted,fontSize:12}}>ð {w.fecha}</span>
                      <span style={{color:C.muted,fontSize:12}}>ð {w.hora}</span>
                      <span style={{color:C.muted,fontSize:12}}>ð¤ @{w.instructor}</span>
                      <span style={{color:C.muted,fontSize:12}}>â± {w.duracion}</span>
                    </div>
                    <div style={{marginBottom:8}}><WebinarCountdown fecha={w.fecha}/></div>

                    {/* Description */}
                    <p style={{margin:"0 0 10px",color:C.muted2,fontSize:12,lineHeight:1.5}}>{w.desc}</p>

                    {/* Spots bar */}
                    <div style={{marginBottom:4}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:11,color: isUrgent ? "#ef4444" : C.muted, fontWeight: isUrgent ? 700 : 400}}>
                          {isSoldOut ? "â Agotado" : isUrgent ? `ð¥ Â¡Solo ${w.spotsLeft} plazas!` : `ð¥ ${w.spotsLeft} de ${w.spots} plazas`}
                        </span>
                        <span style={{fontSize:11,color:C.muted2}}>{spotsPercent}% disponible</span>
                      </div>
                      <div style={{background:C.border,borderRadius:20,height:5,overflow:"hidden"}}>
                        <div style={{height:"100%",borderRadius:20,width:`${spotsPercent}%`,background: isUrgent ? "linear-gradient(90deg,#ef4444,#f59e0b)" : `linear-gradient(90deg,${C.accent},#00e5b0)`,transition:"width 0.5s"}}/>
                      </div>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div style={{flexShrink:0,textAlign:"center",minWidth:110}}>
                    {isPremium ? (
                      <>
                        <div style={{fontSize:10,color:"#a78bfa",fontWeight:700,marginBottom:2}}>â¦ PRECIO VIP</div>
                        <div style={{fontSize:22,fontWeight:900,color:C.accent,lineHeight:1}}>${w.precioVip}</div>
                        <div style={{fontSize:11,color:C.muted2,textDecoration:"line-through",marginBottom:8}}>${w.precio}</div>
                        <button
                          onClick={handleBuyWebinar}
                          disabled={isSoldOut}
                          style={{background:isSoldOut?"#374151":`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:isSoldOut?"default":"pointer",width:"100%",opacity:isSoldOut?0.5:1}}
                        >{isSoldOut ? "Agotado" : "Reservar â"}</button>
                      </>
                    ) : (
                      <>
                        <div style={{fontSize:10,color:C.muted2,fontWeight:600,marginBottom:2}}>PRECIO</div>
                        <div style={{fontSize:22,fontWeight:900,color:C.text,lineHeight:1}}>${w.precio}</div>
                        <div style={{fontSize:10,color:"#a78bfa",marginBottom:8}}>VIP paga ${w.precioVip}</div>
                        <button
                          onClick={handleBuyWebinar}
                          disabled={isSoldOut}
                          style={{background:isSoldOut?"#374151":"linear-gradient(135deg,#1d4ed8,#7C3AED)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:isSoldOut?"default":"pointer",width:"100%",opacity:isSoldOut?0.5:1}}
                        >{isSoldOut ? "Agotado" : "Comprar â"}</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* VIP upsell banner at bottom */}
        {!isPremium && <div style={{marginTop:20,background:"linear-gradient(135deg,#4c1d9522,#1e40af22)",border:"1px solid #7C3AED44",borderRadius:16,padding:20,display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:32}}>â¦</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,color:"#a78bfa",fontSize:15,marginBottom:4}}>Hazte VIP y ahorra 50% en todos los webinars</div>
            <div style={{color:"#7c3aed",fontSize:13}}>Por solo $9.99/mes tienes acceso a precios VIP, picks semanales, seÃ±ales y grabaciones de todos los webinars anteriores.</div>
          </div>
          <button onClick={()=>setActiveTab("planes")} style={{background:"linear-gradient(135deg,#7C3AED,#4c1d95)",border:"none",borderRadius:10,padding:"10px 22px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",flexShrink:0}}>â¦ Ver VIP â</button>
        </div>}
      </>}

      {/* ââ ALERTAS EMAIL TAB ââ */}
      {activeTab==="alertas" && <>
        <div style={{marginBottom:20}}>
          <h2 style={{margin:"0 0 4px",color:C.text,fontSize:18,fontWeight:800}}>ð§ Alertas por Email</h2>
          <p style={{margin:0,color:C.muted,fontSize:13}}>Nunca te pierdas un movimiento importante del mercado</p>
        </div>

        {/* How it works */}
        <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:18,padding:24,marginBottom:20}}>
          <h3 style={{margin:"0 0 16px",color:"#fff",fontSize:15,fontWeight:800}}>Â¿CÃ³mo funcionan las alertas?</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[
              {step:"1",icon:"âï¸",titulo:"Configuras",desc:"Elige el ticker, tipo de alerta y el valor que quieres monitorizar"},
              {step:"2",icon:"ð",titulo:"Monitorizamos",desc:"Nuestro sistema vigila el mercado 24/7 en tiempo real"},
              {step:"3",icon:"ð§",titulo:"Te avisamos",desc:"Recibes un email instantÃ¡neo cuando se cumple tu condiciÃ³n"},
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
            <div style={{padding:"12px 8px",textAlign:"center",color:C.accent,fontSize:12,fontWeight:800}}>â­ PREMIUM</div>
          </div>
          {[
            ["Alertas de precio","3 alertas","Ilimitadas"],
            ["Alertas de earnings","â","â"],
            ["Alertas de trending","â","â"],
            ["Alertas de volumen","â","â"],
            ["Breaking news","â","â"],
            ["Frecuencia","15 min delay","Tiempo real"],
            ["Email instantÃ¡neo","â","â"],
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
            ð§ Activar alertas ilimitadas por â¬{price}/mes â
          </button>
          <p style={{margin:"10px 0 0",color:C.muted2,fontSize:12}}>Cancela cuando quieras Â· Sin permanencia</p>
        </div>}
      </>}
    </div>
  );
}

// ââ TOP 5 FORISTAS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
            <span style={{width:22,textAlign:"center",fontSize:i<3?17:13,color:i<3?C.gold:C.muted2,fontWeight:800}}>{i===0?"ð¥":i===1?"ð¥":i===2?"ð¥":i+1}</span>
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
                {following.includes(u.id)?t.following_btn.replace("â ","â"):t.follow}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ââ SIDEBAR âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// ââ LEFT SIDEBAR â Perfil + Stats estilo Socimo âââââââââââââââââââââââââââââââ
function LeftSidebar({user, onProfile, onNeedAuth, lang, onNavigate, onLogout, onUserUpdate}){
  const t=LANGS[lang];
  const lvl = user ? getLevel(user.points) : null;
  const [activeNav, setActiveNav] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const isEN = lang==="en";
  const navItems = [
    {icon:"ð¥", label:"Feed",                                        idx:0},
    {icon:"ð", label:isEN?"Top Traders":"Tops Traders",             idx:1},
    {icon:"ð", label:isEN?"Markets":"Mercados",                     idx:3},
    {icon:"ð¤", label:isEN?"AI Tools":"Herramientas IA",             idx:9, vip:true, ai:true},
    {icon:"â¦",  label:isEN?"VIP Premium":"Premium VIP",              idx:8, premium:true},
  ];
  const navMore = [
    {icon:"ð", label:isEN?"Economic Calendar":"Calendario",         idx:14},
    {icon:"ð°", label:isEN?"Dividends":"Dividendos",                 idx:15},
    {icon:"ð", label:"IPOs 2026",                                   idx:16},
    {icon:"âï¸", label:isEN?"Commodities":"Commodities",              idx:18},
    {icon:"ð", label:isEN?"Screener":"Screener",                    idx:17, vip:true},
    {icon:"ð°", label:isEN?"News":"Noticias",                        idx:5},
    {icon:"ð", label:"Earnings",                                    idx:6},
    {icon:"â¡", label:"Trending",                                    idx:7},
    {icon:"ð", label:"Webinars",                                    idx:11},
    {icon:"ð", label:isEN?"Academy":"Academia",                     idx:12},
  ];

  return(
    <div style={{position:"sticky",top:96,display:"flex",flexDirection:"column",gap:10}}>

      {/* ââ PROFILE CARD ââ */}
      <div style={{borderRadius:18,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.18)",border:"1px solid rgba(139,92,246,0.18)"}}>

        {/* ââ COVER â dark premium ââ */}
        {(()=>{
          const ac = user?.avatarColor || "#8B5CF6";
          const ac2 = ac==="rgba(0,168,255,0.09)"?"#8B5CF6":ac;
          return(
          <div style={{height:96,background:`linear-gradient(135deg,#0a0818 0%,#100c2a 50%,#0d1528 100%)`,position:"relative",overflow:"hidden"}}>
            {/* Animated glow orbs basados en el color del avatar */}
            <div style={{position:"absolute",top:-28,right:-18,width:130,height:130,borderRadius:"50%",background:`radial-gradient(circle,${ac2}55,transparent 68%)`,pointerEvents:"none",animation:"nexo-pulse 3s ease-in-out infinite"}}/>
            <div style={{position:"absolute",bottom:-24,left:20,width:90,height:90,borderRadius:"50%",background:`radial-gradient(circle,${ac2}33,transparent 68%)`,pointerEvents:"none"}}/>
            {/* Grid de puntos decorativos */}
            <svg style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.12,pointerEvents:"none"}} viewBox="0 0 240 96" preserveAspectRatio="xMidYMid slice">
              {[0,24,48,72,96,120,144,168,192,216,240].map(x=>
                [0,16,32,48,64,80,96].map(y=>
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill={ac2}/>
                )
              )}
            </svg>
            {/* Chart SVG mÃ¡s pronunciado */}
            <svg style={{position:"absolute",bottom:0,left:0,width:"100%",opacity:0.35,pointerEvents:"none"}} height="48" viewBox="0 0 240 48" preserveAspectRatio="none">
              <defs>
                <linearGradient id="coverChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ac2} stopOpacity="0.4"/>
                  <stop offset="100%" stopColor={ac2} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <polygon points="0,48 0,40 24,30 48,34 72,16 96,24 120,8 144,14 168,6 192,10 216,4 240,10 240,48" fill="url(#coverChartGrad)"/>
              <polyline points="0,40 24,30 48,34 72,16 96,24 120,8 144,14 168,6 192,10 216,4 240,10" fill="none" stroke={ac2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* Avatar */}
            <div style={{position:"absolute",bottom:-24,left:14}}>
              {user
                ? <div style={{width:52,height:52,borderRadius:15,background:`linear-gradient(135deg,${ac2},${ac2}88)`,border:"2.5px solid rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:`0 4px 18px ${ac2}55`}}>{user.emoji}</div>
                : <div style={{width:52,height:52,borderRadius:15,background:"rgba(139,92,246,0.2)",border:"2px solid rgba(139,92,246,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:23}}>ð¤</div>
              }
            </div>
            {/* Level badge top-right */}
            {user && lvl && (
              <div style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(10px)",border:`1px solid ${ac2}55`,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:700,color:ac2,display:"flex",alignItems:"center",gap:4,boxShadow:`0 0 10px ${ac2}22`}}>
                {lvl.emoji} {lang==="en"?lvl.nameEn:lvl.name}
              </div>
            )}
          </div>
          );
        })()}

        {/* ââ BODY ââ */}
        <div style={{background:"#0f0c1d",padding:"28px 14px 14px"}}>
          {user ? <>
            {/* Nombre + @handle â editable */}
            <div style={{marginBottom:12}}>
              {editingName ? (
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                  <input
                    value={editName}
                    onChange={e=>setEditName(e.target.value.replace(/[^a-zA-Z0-9_]/g,"").slice(0,20))}
                    onKeyDown={async e=>{
                      if(e.key==="Enter"){
                        const newName = editName.trim();
                        if(newName.length>=3){
                          await supabase.from("profiles").update({username:newName}).eq("id",user.id);
                          onUserUpdate&&onUserUpdate({...user,username:newName,name:newName});
                        }
                        setEditingName(false);
                      }
                      if(e.key==="Escape") setEditingName(false);
                    }}
                    autoFocus
                    placeholder="nuevo_username"
                    style={{flex:1,background:"rgba(139,92,246,0.12)",border:"1.5px solid rgba(139,92,246,0.5)",borderRadius:8,padding:"5px 9px",color:"#F1F5F9",fontSize:13,fontWeight:700,fontFamily:"inherit",outline:"none"}}
                  />
                  <button onClick={async()=>{
                    const newName = editName.trim();
                    if(newName.length>=3){
                      await supabase.from("profiles").update({username:newName}).eq("id",user.id);
                      onUserUpdate&&onUserUpdate({...user,username:newName,name:newName});
                    }
                    setEditingName(false);
                  }} style={{background:"#8B5CF6",border:"none",borderRadius:7,padding:"5px 10px",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer"}}>â</button>
                </div>
              ) : (
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{fontWeight:800,color:"#F1F5F9",fontSize:15,letterSpacing:-0.3,lineHeight:1.2,flex:1}}>
                    {user.username || user.name || (user.email?.includes("@") ? user.email.split("@")[0] : "Trader")}
                  </div>
                  <button onClick={()=>{setEditName(user.username||user.name||"");setEditingName(true);}}
                    title={lang==="en"?"Edit name":"Editar nombre"}
                    style={{background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.25)",borderRadius:6,padding:"3px 6px",color:"rgba(139,92,246,0.7)",fontSize:10,cursor:"pointer",lineHeight:1,flexShrink:0}}>â</button>
                </div>
              )}
              <div style={{fontSize:11,color:"rgba(139,92,246,0.7)",fontWeight:600,marginTop:2}}>
                @{(user.username||user.name||"trader").toLowerCase().replace(/[\s@.]/g,"").slice(0,20)}
              </div>
            </div>

            {/* Stats â 3 columnas dark */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr 1px 1fr",background:"rgba(255,255,255,0.04)",borderRadius:10,overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)",marginBottom:12}}>
              {[
                {v:user.followers||0, l:lang==="en"?"Followers":"Seguidores"},
                null,
                {v:user.following||0, l:lang==="en"?"Following":"Siguiendo"},
                null,
                {v:user.points||0,   l:lang==="en"?"Points":"Puntos"},
              ].map((item,i)=> item===null
                ? <div key={i} style={{background:"rgba(255,255,255,0.06)"}}/>
                : <div key={i} style={{padding:"9px 4px",textAlign:"center"}}>
                    <div style={{fontWeight:800,fontSize:15,color:"#F1F5F9",letterSpacing:-0.5}}>{item.v}</div>
                    <div style={{fontSize:9,color:"rgba(148,163,184,0.7)",fontWeight:600,letterSpacing:0.5,textTransform:"uppercase",marginTop:1}}>{item.l}</div>
                  </div>
              )}
            </div>

            {/* Ver perfil button */}
            <button onClick={()=>onProfile&&onProfile(user)}
              style={{width:"100%",background:"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.15))",border:"1px solid rgba(139,92,246,0.35)",borderRadius:10,padding:"8px",color:"#A78BFA",fontWeight:700,fontSize:12,cursor:"pointer",transition:"all 0.15s",letterSpacing:0.2}}
              onMouseEnter={e=>{e.currentTarget.style.background="linear-gradient(135deg,rgba(139,92,246,0.32),rgba(99,102,241,0.28))";e.currentTarget.style.borderColor="rgba(139,92,246,0.6)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.15))";e.currentTarget.style.borderColor="rgba(139,92,246,0.35)";}}>
              {lang==="en"?"View my profile â":"Ver mi perfil â"}
            </button>
          </> : <>
            {/* No logueado */}
            <div style={{fontWeight:800,color:"#F1F5F9",fontSize:14,marginBottom:4}}>{lang==="en"?"Join NexoTrade!":"Â¡Ãnete a NexoTrade!"}</div>
            <div style={{fontSize:12,color:"rgba(148,163,184,0.7)",marginBottom:14,lineHeight:1.6}}>{lang==="en"?"The leading Spanish-speaking investor community ð":"La comunidad inversora en espaÃ±ol ð"}</div>
            <button onClick={onNeedAuth}
              style={{width:"100%",background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"#fff",border:"none",borderRadius:10,padding:"10px",fontWeight:800,fontSize:13,cursor:"pointer",boxShadow:"0 4px 16px rgba(139,92,246,0.4)",transition:"box-shadow 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 22px rgba(139,92,246,0.55)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(139,92,246,0.4)"}>
              {lang==="en"?"Create free account â":"Crear cuenta gratis â"}
            </button>
          </>}
        </div>
      </div>

      {/* ââ NAVEGACIÃN ââ */}
      <div style={{background:"#fff",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 16px rgba(15,23,42,0.08)",border:"1px solid rgba(15,23,42,0.07)"}}>
        <div style={{padding:"14px 14px 10px"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#CBD5E1",letterSpacing:1.2,marginBottom:10,paddingLeft:4}}>{isEN?"MENU":"MENÃ"}</div>
          {navItems.map(({icon,label,idx,vip,premium,ai})=>{
            const isActive = activeNav===idx;
            return(
              <div key={label} onClick={()=>{setActiveNav(idx);onNavigate&&onNavigate(idx);}}
                style={{
                  display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,
                  cursor:"pointer",marginBottom:2,transition:"all 0.15s",
                  background: isActive ? (premium?"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(99,102,241,0.1))":vip?"rgba(14,165,233,0.08)":"rgba(14,165,233,0.08)") : "transparent",
                  borderLeft: isActive ? `3px solid ${premium?"#7C3AED":"#0EA5E9"}` : "3px solid transparent",
                }}
                onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background=premium?"rgba(124,58,237,0.06)":"rgba(14,165,233,0.05)"; }}
                onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background="transparent"; }}>
                <span style={{fontSize:14,lineHeight:1,width:18,textAlign:"center"}}>{icon}</span>
                <span style={{
                  fontSize:13,fontWeight:isActive?700:500,
                  color: premium?"#7C3AED": isActive?"#0EA5E9":"#334155",
                  flex:1
                }}>{label}</span>
                {premium && <span style={{fontSize:9,fontWeight:700,background:"linear-gradient(135deg,#7C3AED,#6366F1)",color:"#fff",borderRadius:20,padding:"2px 6px",letterSpacing:0.5}}>VIP</span>}
                {vip && !premium && !ai && <span style={{fontSize:9,fontWeight:700,color:"#0EA5E9",background:"rgba(14,165,233,0.1)",borderRadius:20,padding:"2px 6px",letterSpacing:0.5}}>PRO</span>}
                {ai && <span style={{fontSize:9,fontWeight:700,background:"linear-gradient(135deg,#6366F1,#8B5CF6)",color:"#fff",borderRadius:20,padding:"2px 6px",letterSpacing:0.5}}>IA</span>}
              </div>
            );
          })}

          {/* ââ BotÃ³n "MÃ¡s" ââ */}
          <div onClick={()=>setShowMore(v=>!v)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,cursor:"pointer",marginBottom:2,transition:"background 0.15s",color:"var(--c-muted)"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(14,165,233,0.05)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{fontSize:14,width:18,textAlign:"center"}}>{showMore?"â´":"â¾"}</span>
            <span style={{fontSize:12,fontWeight:600,color:"var(--c-muted)"}}>
              {showMore ? "Menos" : "MÃ¡s secciones"}
            </span>
          </div>

          {/* ââ Ãtems secundarios colapsables ââ */}
          {showMore && (
            <div style={{borderTop:"1px solid var(--c-border)",paddingTop:6,marginTop:2}}>
              {navMore.map(({icon,label,idx,vip})=>{
                const isActive=activeNav===idx;
                return(
                  <div key={label} onClick={()=>{setActiveNav(idx);onNavigate&&onNavigate(idx);}}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:9,cursor:"pointer",marginBottom:1,transition:"all 0.15s",background:isActive?"rgba(14,165,233,0.07)":"transparent",borderLeft:isActive?"3px solid #0EA5E9":"3px solid transparent"}}
                    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="rgba(14,165,233,0.04)";}}
                    onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
                    <span style={{fontSize:13,width:18,textAlign:"center"}}>{icon}</span>
                    <span style={{fontSize:12,fontWeight:isActive?700:400,color:isActive?"#0EA5E9":"var(--c-muted)",flex:1}}>{label}</span>
                    {vip && <span style={{fontSize:9,fontWeight:700,color:"#0EA5E9",background:"rgba(14,165,233,0.1)",borderRadius:20,padding:"2px 6px"}}>PRO</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ââ PROGRAMA DE REFERIDOS ââ */}
      {user && <ReferralSection user={user}/>}

      {/* ââ LOGOUT + FOOTER ââ */}
      {user && onLogout && (
        <button onClick={onLogout}
          style={{width:"100%",background:"#fff",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"9px",color:"#EF4444",fontWeight:600,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all 0.15s",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.04)";e.currentTarget.style.borderColor="rgba(239,68,68,0.35)";}}
          onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.borderColor="rgba(239,68,68,0.2)";}}>
          <span style={{fontSize:13}}>â</span> {isEN?"Sign out":"Cerrar sesiÃ³n"}
        </button>
      )}

      {/* ââ BANNER AFILIADOS (sidebar izquierdo) ââ */}
      <AffiliateBanner/>

      <div style={{padding:"0 4px 4px",textAlign:"center"}}>
        <div style={{fontSize:10,color:"#CBD5E1",lineHeight:2}}>
          Â© 2026 NexoTrade &nbsp;Â·&nbsp;
          <span onClick={()=>onNavigate&&onNavigate(31)} style={{color:"#94A3B8",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"} onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>{isEN?"Terms":"TÃ©rminos"}</span>
          &nbsp;Â·&nbsp;
          <span onClick={()=>onNavigate&&onNavigate(32)} style={{color:"#94A3B8",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"} onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>{isEN?"Privacy":"Privacidad"}</span>
          &nbsp;Â·&nbsp;
          <span onClick={()=>onNavigate&&onNavigate(33)} style={{color:"#94A3B8",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"} onMouseLeave={e=>e.currentTarget.style.color="#94A3B8"}>{isEN?"Risk":"Riesgo"}</span>
        </div>
      </div>

    </div>
  );
}

// ââ AFFILIATE BANNERS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// ð° Comisiones estimadas por afiliado:
// Interactive Brokers: $200 por cuenta abierta (programa IBKR referral)
// Tastytrade: $50-$100 por cuenta + % comisiones
// Kraken: 20% de comisiones del referido de POR VIDA
// Bybit: hasta 30% comisiones trading de referidos
// eToro: $200 CPA por depÃ³sito calificado
// Coinbase: 50% de comisiones durante 3 meses
// Finviz: 30% recurrente en suscripciones Elite
// moomoo: $10-$100 por cuenta + acciones gratis

const AFFILIATES = [
  {
    id:"ibkr",
    logo:"ð¦",
    name:"Interactive Brokers",
    color:"#C8102E",
    bg:"linear-gradient(135deg,#1A0003,#2D0008)",
    tagline:"$200 para ti al abrir cuenta",
    sub:"150 mercados Â· Comisiones desde $0 Â· Regulado SEC y FINRA",
    cta:"Abrir cuenta y ganar $200 â",
    badge:"MAYOR PAGO",
    badgeColor:"#C8102E",
    url:"https://www.interactivebrokers.com/mkt/?src=nexotrade1&url=%2Fen%2Fwhyib%2Foverviewnetwork.php",
    tickers:["SPY","AAPL","MSFT","TSLA","NVDA","AMZN","META","GOOGL","AMD","QQQ"],
  },
  {
    id:"tastytrade",
    logo:"ð®",
    name:"Tastytrade",
    color:"#F97316",
    bg:"linear-gradient(135deg,#1A0800,#2D1200)",
    tagline:"La plataforma de opciones #1 en EE.UU.",
    sub:"$0 comisiÃ³n al cerrar Â· Plataforma gratis Â· EducaciÃ³n incluida",
    cta:"Empezar con opciones gratis â",
    badge:"OPCIONES PRO",
    badgeColor:"#F97316",
    url:"https://open.tastytrade.com/",
    tickers:["SPY","QQQ","NVDA","TSLA","AAPL","AMD","META","AMZN"],
  },
  {
    id:"kraken",
    logo:"ð",
    name:"Kraken",
    color:"#5741D9",
    bg:"linear-gradient(135deg,#07051A,#0D0A2D)",
    tagline:"20% de comisiones de tus referidos PARA SIEMPRE",
    sub:"Exchange regulado Â· Staking hasta 21% APY Â· 200+ criptos",
    cta:"Empezar en Kraken â",
    badge:"20% DE POR VIDA",
    badgeColor:"#5741D9",
    url:"https://www.kraken.com/sign-up?referral=nexotrade",
    tickers:["BTC","ETH","SOL","ADA","DOT","MATIC","AVAX","LINK"],
  },
  {
    id:"bybit",
    logo:"â¡",
    name:"Bybit",
    color:"#F7A600",
    bg:"linear-gradient(135deg,#0D0900,#1A1200)",
    tagline:"Hasta 30% de comisiones + $100 bienvenida",
    sub:"Futuros Â· Spot Â· Copy trading Â· 600+ pares",
    cta:"Ganar $100 de bienvenida â",
    badge:"30% COMISIÃN",
    badgeColor:"#F7A600",
    url:"https://www.bybit.com/invite?ref=NEXOTRADE",
    tickers:["BTC","ETH","SOL","BNB","DOGE","SHIB","AVAX","LINK","MATIC"],
  },
  {
    id:"etoro",
    logo:"ð",
    name:"eToro",
    color:"#6DCC74",
    bg:"linear-gradient(135deg,#051A08,#092B0D)",
    tagline:"$200 por cada cliente calificado",
    sub:"Copy Trading Â· 3,000+ activos Â· 30M de usuarios",
    cta:"Unirse al copy trading â",
    badge:"$200 CPA",
    badgeColor:"#6DCC74",
    url:"https://www.etoro.com/es/trading/account/",
    tickers:["BTC","ETH","SPY","AAPL","TSLA","NVDA","AMZN"],
  },
  {
    id:"coinbase",
    logo:"ðµ",
    name:"Coinbase",
    color:"#0052FF",
    bg:"linear-gradient(135deg,#000B2E,#001A6B)",
    tagline:"50% de comisiones durante 3 meses",
    sub:"La exchange de crypto mÃ¡s confiable de EE.UU. Â· NASDAQ: COIN",
    cta:"Ganar $10 en BTC gratis â",
    badge:"50% COMISIÃN",
    badgeColor:"#0052FF",
    url:"https://coinbase.com/join/nexotrade",
    tickers:["BTC","ETH","SOL","DOGE","SHIB","LINK","UNI","AAVE"],
  },
  {
    id:"finviz",
    logo:"ð",
    name:"Finviz Elite",
    color:"#E8C84A",
    bg:"linear-gradient(135deg,#0D0D0D,#1A1500)",
    tagline:"El screener #1 de Wall Street",
    sub:"Alertas en tiempo real Â· Heatmaps Â· Backtesting Â· Noticias",
    cta:"Probar Finviz Elite gratis â",
    badge:"30% RECURRENTE",
    badgeColor:"#E8C84A",
    url:"https://finviz.com/?affilId=764863650",
    tickers:["SPY","QQQ","NVDA","AAPL","MSFT","TSLA","AMD","AMZN","META"],
  },
  {
    id:"moomoo",
    logo:"ð",
    name:"moomoo",
    color:"#FF6B35",
    bg:"linear-gradient(135deg,#1A0A00,#2D1400)",
    tagline:"15 acciones gratis al abrir cuenta",
    sub:"AnÃ¡lisis de nivel profesional Â· Gratis Â· Sin comisiones",
    cta:"Reclamar acciones gratis â",
    badge:"15 ACCIONES GRATIS",
    badgeColor:"#FF6B35",
    url:"https://j.moomoo.com/00yjN2",
    tickers:["AAPL","TSLA","NVDA","AMD","META","AMZN","GOOGL","MSFT"],
  },
];

// Afiliados por categorÃ­a para mostrar contextualmente en posts
const AFFILIATE_BY_TICKER = (ticker) => {
  const crypto = ["BTC","ETH","SOL","ADA","DOT","MATIC","AVAX","LINK","DOGE","SHIB","BNB","UNI","AAVE"];
  const stocks  = ["AAPL","MSFT","NVDA","TSLA","META","AMZN","GOOGL","AMD","NFLX","COIN","PLTR","SPY","QQQ"];
  if(crypto.includes(ticker)) return AFFILIATES.filter(a=>["kraken","bybit","coinbase"].includes(a.id));
  if(stocks.includes(ticker))  return AFFILIATES.filter(a=>["ibkr","tastytrade","finviz"].includes(a.id));
  return AFFILIATES.slice(0,3);
};

function AffiliateBanner(){
  const [idx, setIdx] = useState(0);
  const aff = AFFILIATES[idx];

  useEffect(()=>{
    const t = setInterval(()=> setIdx(i=>(i+1)%AFFILIATES.length), 6000);
    return ()=> clearInterval(t);
  },[]);

  return(
    <div style={{borderRadius:16,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.15)",marginBottom:10,position:"relative",cursor:"pointer"}}
      onClick={()=>window.open(aff.url,"_blank","noopener")}>

      {/* Fondo oscuro del broker */}
      <div style={{background:aff.bg,padding:"14px 16px"}}>

        {/* Badge + label "Patrocinado" */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:9,fontWeight:700,color:aff.badgeColor,background:`${aff.badgeColor}22`,borderRadius:20,padding:"2px 8px",letterSpacing:0.8}}>{aff.badge}</span>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontWeight:500,letterSpacing:0.5}}>Patrocinado</span>
        </div>

        {/* Logo + nombre */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{width:38,height:38,borderRadius:10,background:`${aff.color}22`,border:`1px solid ${aff.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
            {aff.logo}
          </div>
          <div>
            <div style={{fontWeight:800,color:"#fff",fontSize:14,letterSpacing:-0.3}}>{aff.name}</div>
            <div style={{fontSize:11,color:aff.color,fontWeight:600}}>{aff.tagline}</div>
          </div>
        </div>

        {/* Sub */}
        <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:12,lineHeight:1.5}}>{aff.sub}</div>

        {/* CTA */}
        <div style={{background:aff.color,borderRadius:9,padding:"9px 14px",textAlign:"center",color:"#fff",fontWeight:800,fontSize:12,letterSpacing:0.2,boxShadow:`0 4px 14px ${aff.color}55`}}>
          {aff.cta}
        </div>
      </div>

      {/* Indicadores de slide */}
      <div style={{display:"flex",justifyContent:"center",gap:5,padding:"8px",background:"rgba(0,0,0,0.4)"}}>
        {AFFILIATES.map((_,i)=>(
          <div key={i} onClick={e=>{e.stopPropagation();setIdx(i);}}
            style={{width: i===idx?18:6,height:6,borderRadius:3,background:i===idx?aff.color:"rgba(255,255,255,0.2)",transition:"all 0.3s",cursor:"pointer"}}/>
        ))}
      </div>
    </div>
  );
}

// ââ MOBILE AFFILIATE BANNER (fixed bottom, solo mÃ³vil) âââââââââââââââââââââââ
function MobileAffiliateBanner(){
  const [idx, setIdx] = useState(0);
  const [closed, setClosed] = useState(false);
  const aff = AFFILIATES[idx];

  useEffect(()=>{
    const t = setInterval(()=> setIdx(i=>(i+1)%AFFILIATES.length), 6000);
    return ()=> clearInterval(t);
  },[]);

  if(closed) return null;

  return(
    <div className="nexo-mobile-affiliate-banner" style={{
      position:"fixed", bottom:0, left:0, right:0,
      zIndex:1200,
      background: aff.bg,
      borderTop:`2px solid ${aff.color}44`,
      padding:"10px 14px 14px",
      display:"none", // CSS media query activa en mÃ³vil
      flexDirection:"column",
      gap:8,
      boxShadow:"0 -4px 20px rgba(0,0,0,0.35)",
    }}>
      {/* Header: badge + patrocinado + cerrar */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <span style={{fontSize:9,fontWeight:700,color:aff.badgeColor,background:`${aff.badgeColor}22`,borderRadius:20,padding:"2px 8px",letterSpacing:0.8}}>{aff.badge}</span>
        <span style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:0.5}}>Patrocinado</span>
        <button onClick={()=>setClosed(true)} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.4)",fontSize:16,cursor:"pointer",padding:"0 4px",lineHeight:1}}>â</button>
      </div>

      {/* Contenido: logo + texto + CTA */}
      <div style={{display:"flex", alignItems:"center", gap:12}}
        onClick={()=>window.open(aff.url,"_blank","noopener")} role="button">
        <div style={{width:40,height:40,borderRadius:10,background:`${aff.color}22`,border:`1px solid ${aff.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>
          {aff.logo}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:800,color:"#fff",fontSize:14}}>{aff.name}</div>
          <div style={{fontSize:11,color:aff.color,fontWeight:600}}>{aff.tagline}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",marginTop:2}}>{aff.sub}</div>
        </div>
        <div style={{background:aff.color,borderRadius:9,padding:"9px 12px",color:"#fff",fontWeight:800,fontSize:11,whiteSpace:"nowrap",boxShadow:`0 3px 12px ${aff.color}55`,cursor:"pointer"}}>
          {aff.cta}
        </div>
      </div>

      {/* Indicadores */}
      <div style={{display:"flex",justifyContent:"center",gap:5}}>
        {AFFILIATES.map((_,i)=>(
          <div key={i} onClick={()=>setIdx(i)}
            style={{width:i===idx?18:6,height:5,borderRadius:3,background:i===idx?aff.color:"rgba(255,255,255,0.2)",transition:"all 0.3s",cursor:"pointer"}}/>
        ))}
      </div>
    </div>
  );
}

function Sidebar({user,following,onFollow,onProfile,onNeedAuth,onAI,lang,posts=[]}){
  const t=LANGS[lang];
  const lp=useContext(PriceCtx);
  const SIDEBAR_STATIC=[
    {ticker:"BTC",  price:"$68,420", change:+4.2},
    {ticker:"NVDA", price:"$875.40", change:+2.8},
    {ticker:"TSLA", price:"$172.80", change:-3.1},
    {ticker:"ETH",  price:"$3,820",  change:+5.7},
    {ticker:"AAPL", price:"$189.50", change:+0.4},
    {ticker:"SPY",  price:"$521.30", change:-0.8},
  ];
  const mini=SIDEBAR_STATIC.map(s=>{
    const live=lp[s.ticker];
    return {ticker:s.ticker, price:live?fmtLivePrice(s.ticker,live.price):s.price, change:live?live.change:s.change};
  });

  // Estilo base de cada tarjeta
  const card={
    background:"#FFFFFF",
    border:"1px solid rgba(15,23,42,0.07)",
    borderRadius:16,
    padding:"16px",
    marginBottom:10,
    boxShadow:"0 2px 16px rgba(15,23,42,0.06)",
  };

  // Widget afiliado destacado â rota entre los 3 mejores pagadores
  const [affIdx, setAffIdx] = useState(0);
  const TOP_AFFS = [AFFILIATES[0], AFFILIATES[2], AFFILIATES[3]]; // IBKR, Kraken, Bybit
  const topAff = TOP_AFFS[affIdx % TOP_AFFS.length];
  useEffect(()=>{
    const t=setInterval(()=>setAffIdx(i=>(i+1)%TOP_AFFS.length),8000);
    return()=>clearInterval(t);
  },[]);

  return(
    <div>

      {/* ââ WIDGET AFILIADO DESTACADO (sidebar derecho) ââ */}
      <a href={topAff.url} target="_blank" rel="noopener noreferrer" style={{display:"block",textDecoration:"none",marginBottom:10}}>
        <div style={{
          background:topAff.bg,
          borderRadius:16,
          padding:"14px 16px",
          border:`1.5px solid ${topAff.color}33`,
          boxShadow:`0 4px 20px ${topAff.color}22`,
          cursor:"pointer",
          transition:"all 0.2s",
          position:"relative",
          overflow:"hidden",
        }}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 32px ${topAff.color}44`;e.currentTarget.style.borderColor=`${topAff.color}66`;}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 4px 20px ${topAff.color}22`;e.currentTarget.style.borderColor=`${topAff.color}33`;}}>
          <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`${topAff.color}11`}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:9,fontWeight:700,color:topAff.badgeColor,background:`${topAff.badgeColor}22`,borderRadius:20,padding:"2px 8px",letterSpacing:0.8}}>{topAff.badge}</span>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>Patrocinado</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <span style={{fontSize:22}}>{topAff.logo}</span>
            <div>
              <div style={{fontWeight:800,color:"#fff",fontSize:13}}>{topAff.name}</div>
              <div style={{fontSize:10,color:topAff.color,fontWeight:600}}>{topAff.tagline}</div>
            </div>
          </div>
          <div style={{background:topAff.color,borderRadius:8,padding:"8px 12px",textAlign:"center",color:"#fff",fontWeight:800,fontSize:11,marginTop:8}}>
            {topAff.cta}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:8}}>
            {TOP_AFFS.map((_,i)=>(
              <div key={i} style={{width:i===affIdx%TOP_AFFS.length?16:5,height:4,borderRadius:2,background:i===affIdx%TOP_AFFS.length?topAff.color:"rgba(255,255,255,0.2)",transition:"all 0.3s"}}/>
            ))}
          </div>
        </div>
      </a>

      {/* ââ AI MARKET PULSE ââ */}
      <div onClick={onAI} style={{...card,
        background:"linear-gradient(145deg,rgba(99,102,241,0.06),rgba(139,92,246,0.08))",
        border:"1px solid rgba(99,102,241,0.22)",
        cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden"}}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 32px rgba(99,102,241,0.18)";e.currentTarget.style.borderColor="rgba(99,102,241,0.4)";}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow="var(--c-shadow)";e.currentTarget.style.borderColor="rgba(99,102,241,0.22)";}}>
        {/* Glow decorativo */}
        <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)",pointerEvents:"none"}}/>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#3B82F6,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0,boxShadow:"0 4px 14px rgba(99,102,241,0.35)"}}>ð§ </div>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,color:"var(--c-text)",fontSize:13,letterSpacing:-0.2}}>AI Market Pulse</div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",display:"inline-block",boxShadow:"0 0 8px #22C55E"}}/>
              <span style={{fontSize:10,color:"#22C55E",fontWeight:700,letterSpacing:0.5}}>EN VIVO</span>
            </div>
          </div>
        </div>

        {/* Barra sentimiento */}
        <div style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:11,color:"#64748B",fontWeight:600}}>Sentimiento IA</span>
            <span style={{fontSize:11,color:"#16A34A",fontWeight:800,background:"rgba(22,163,74,0.1)",borderRadius:20,padding:"2px 8px"}}>BULLISH 71%</span>
          </div>
          <div style={{height:6,background:"rgba(15,23,42,0.07)",borderRadius:6,overflow:"hidden"}}>
            <div style={{width:"71%",height:"100%",background:"linear-gradient(90deg,#22C55E,#3B82F6)",borderRadius:6}}/>
          </div>
        </div>

        {/* Stocks calientes â chips */}
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          {[{s:"NVDA",up:true},{s:"BTC",up:true},{s:"TSLA",up:false}].map(({s,up})=>(
            <span key={s} style={{fontSize:10,fontWeight:700,fontFamily:"monospace",padding:"3px 8px",borderRadius:20,
              background:up?"rgba(22,163,74,0.08)":"rgba(220,38,38,0.08)",
              color:up?"#16A34A":"#DC2626",
              border:`1px solid ${up?"rgba(22,163,74,0.2)":"rgba(220,38,38,0.2)"}`}}>
              {up?"â":"â"} ${s}
            </span>
          ))}
        </div>

        {/* Riesgo */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.18)",borderRadius:10,padding:"7px 12px",marginBottom:12}}>
          <span style={{fontSize:11,color:"#78716C",fontWeight:600}}>Riesgo del mercado</span>
          <span style={{fontSize:11,color:"#D97706",fontWeight:800}}>MEDIO â¡</span>
        </div>

        {/* CTA */}
        <div style={{background:"linear-gradient(135deg,#3B82F6,#7C3AED)",borderRadius:10,padding:"9px",textAlign:"center",color:"#fff",fontSize:12,fontWeight:700,letterSpacing:0.2,boxShadow:"0 4px 14px rgba(99,102,241,0.3)"}}>
          ð¬ Preguntar a la IA â
        </div>
      </div>

      {/* ââ ð¡ MERCADOS ââ */}
      <div style={card}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <span style={{fontSize:12,fontWeight:800,color:"#0F172A",letterSpacing:-0.2}}>ð¡ Mercados</span>
          <span style={{fontSize:9,color:"#94A3B8",fontWeight:600,background:"#F1F5F9",borderRadius:20,padding:"2px 8px",letterSpacing:0.5}}>EN VIVO</span>
        </div>
        {mini.map((m,i)=>{
          const up=m.change>=0;
          return(
            <div key={m.ticker} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<mini.length-1?"1px solid rgba(15,23,42,0.05)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:up?"#22C55E":"#EF4444",flexShrink:0}}/>
                <span style={{fontWeight:700,color:"#1E293B",fontFamily:"monospace",fontSize:12,letterSpacing:0.3}}>{m.ticker}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"monospace",fontSize:11,fontWeight:600,color:"#334155"}}>{m.price}</div>
                <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:up?"#16A34A":"#DC2626"}}>{fmtChg(m.change)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ââ COMUNIDAD vs IA â votaciÃ³n real ââ */}
      {(()=>{
        const storageKey = "nexo-sentiment-vote";
        const [vote, setVote] = useState(()=>{try{return localStorage.getItem(storageKey)||null;}catch(e){return null;}});
        const [bullPct, setBullPct] = useState(()=>{try{return parseInt(localStorage.getItem("nexo-sent-pct")||"71");}catch(e){return 71;}});
        const castVote = (v) => {
          if(vote) return; // ya votÃ³
          const newPct = v==="bull" ? Math.min(95, bullPct+1) : Math.max(20, bullPct-1);
          setBullPct(newPct);
          setVote(v);
          try{localStorage.setItem(storageKey,v);localStorage.setItem("nexo-sent-pct",String(newPct));}catch(e){}
        };
        const bearPct = 100-bullPct;
        return(
          <div style={{...card,padding:"10px 12px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:800,color:"var(--c-text)",letterSpacing:-0.2}}>ð Sentimiento</span>
              {!vote && <span style={{fontSize:9,color:"var(--c-muted2)",fontWeight:500}}>Â¿Alcista o bajista hoy?</span>}
              {vote && <span style={{fontSize:9,color:"#22C55E",fontWeight:700}}>â Votado</span>}
            </div>
            {/* Botones de voto */}
            {!vote && (
              <div style={{display:"flex",gap:5,marginBottom:8}}>
                <button onClick={()=>castVote("bull")}
                  style={{flex:1,background:"rgba(22,163,74,0.1)",border:"1.5px solid rgba(22,163,74,0.3)",borderRadius:8,padding:"6px 0",cursor:"pointer",color:"#16A34A",fontWeight:700,fontSize:11,transition:"all 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(22,163,74,0.2)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(22,163,74,0.1)"}>
                  â² Alcista
                </button>
                <button onClick={()=>castVote("bear")}
                  style={{flex:1,background:"rgba(220,38,38,0.08)",border:"1.5px solid rgba(220,38,38,0.25)",borderRadius:8,padding:"6px 0",cursor:"pointer",color:"#DC2626",fontWeight:700,fontSize:11,transition:"all 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(220,38,38,0.18)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(220,38,38,0.08)"}>
                  â¼ Bajista
                </button>
              </div>
            )}
            {/* Barras resultado */}
            {[{label:"â² Alcista",pct:bullPct,col:"#16A34A",bg:"rgba(22,163,74,0.08)"},{label:"â¼ Bajista",pct:bearPct,col:"#DC2626",bg:"rgba(220,38,38,0.07)"}].map(({label,pct,col,bg})=>(
              <div key={label} style={{marginBottom:5}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <span style={{fontSize:9,color:"var(--c-muted)",fontWeight:600}}>{label}</span>
                  <span style={{fontSize:9,color:col,fontWeight:800}}>{pct}%</span>
                </div>
                <div style={{height:4,background:"var(--c-border)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:4,transition:"width 0.5s"}}/>
                </div>
              </div>
            ))}
            <div style={{fontSize:8,color:"var(--c-muted2)",marginTop:4}}>Basado en votos de la comunidad hoy</div>
          </div>
        );
      })()}

      {/* ââ PUBLICIDAD â entre Comunidad vs IA y Fear & Greed ââ */}
      <AdBannerSidebar/>
      <MediaNetBannerSidebar/>

      {/* ââ FEAR & GREED ââ */}
      <div style={{...card,padding:"7px 12px"}}>
        <div style={{fontSize:10,fontWeight:800,color:"#0F172A",marginBottom:6}}>Fear & Greed Index</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{position:"relative",width:36,height:36,flexShrink:0}}>
            <svg viewBox="0 0 60 60" style={{width:36,height:36,transform:"rotate(-90deg)"}}>
              <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(15,23,42,0.07)" strokeWidth="7"/>
              <circle cx="30" cy="30" r="24" fill="none" stroke="#22C55E" strokeWidth="7"
                strokeDasharray={`${0.72*150.8} 150.8`} strokeLinecap="round"/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
              <span style={{fontSize:10,fontWeight:900,color:"#0F172A",lineHeight:1}}>72</span>
            </div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:900,color:"#16A34A",letterSpacing:-0.3}}>Codicia ð¢</div>
            <div style={{fontSize:8,color:"#64748B",marginTop:2,lineHeight:1.4}}>Inversores optimistas.<br/>Mercado en modo alcista.</div>
          </div>
        </div>
        {/* Escala */}
        <div style={{marginTop:6,height:3,borderRadius:4,background:"linear-gradient(90deg,#EF4444,#F59E0B,#22C55E)",position:"relative"}}>
          <div style={{position:"absolute",left:"72%",top:-3,width:8,height:8,borderRadius:"50%",background:"#fff",border:"2px solid #22C55E",boxShadow:"0 2px 6px rgba(0,0,0,0.12)",transform:"translateX(-50%)"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
          <span style={{fontSize:8,color:"#EF4444",fontWeight:600}}>Miedo</span>
          <span style={{fontSize:8,color:"#22C55E",fontWeight:600}}>Codicia</span>
        </div>
      </div>

      {/* ââ CTA VIP (solo si no logueado) ââ */}
      {!user && (
        <div style={{...card,background:"linear-gradient(145deg,#1E1B4B,#2D1B69)",border:"1px solid rgba(124,58,237,0.3)",textAlign:"center"}}>
          <div style={{fontSize:26,marginBottom:6}}>â¦</div>
          <div style={{fontWeight:800,color:"#fff",fontSize:14,marginBottom:4}}>VIP Member</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:10,lineHeight:1.6}}>SeÃ±ales exclusivas, IA ilimitada<br/>y acceso a todos los datos</div>
          <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:10}}>
            <span style={{color:"#A78BFA"}}>$9.99</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.4)",fontWeight:400}}>/mes</span>
          </div>
          <button onClick={()=>window.open(STRIPE_PAYMENT_LINK,"_blank")}
            style={{width:"100%",padding:"10px",background:"linear-gradient(135deg,#7C3AED,#9333EA)",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:"0 6px 20px rgba(124,58,237,0.4)",fontFamily:"inherit"}}>
            â¦ Empezar VIP â
          </button>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:8}}>7 dÃ­as gratis Â· Sin compromiso</div>
        </div>
      )}

      {/* ââ ð TOP TRADERS ââ */}
      {(()=>{
        const countMap={};
        posts.forEach(p=>{
          if(!p.user)return;
          if(!countMap[p.user])countMap[p.user]={count:0,avatar:p.avatar||"ð¦",color:p.avatarColor||C.accent};
          countMap[p.user].count++;
        });
        const rankColors=["#F59E0B","#94A3B8","#CD7C3F"];
        const topList=Object.entries(countMap).sort((a,b)=>b[1].count-a[1].count).slice(0,3);
        if(!topList.length)return null;
        return(
          <div style={card}>
            <div style={{fontSize:12,fontWeight:800,color:"#0F172A",marginBottom:12,letterSpacing:-0.2}}>ð Top Traders</div>
            {topList.map(([name,info],i)=>(
              <div key={name} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<topList.length-1?"1px solid rgba(15,23,42,0.05)":"none"}}>
                <div style={{width:20,height:20,borderRadius:6,background:`${rankColors[i]}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:rankColors[i],flexShrink:0}}>#{i+1}</div>
                <AvatarBubble emoji={info.avatar||"ð¦"} color={info.color||C.accent} size={28}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"#0F172A",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</div>
                  <div style={{fontSize:10,color:"#94A3B8"}}>{info.count} post{info.count!==1?"s":""} hoy</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ââ A QUIÃN SEGUIR ââ */}
      {(()=>{
        const [realUsers, setRealUsers] = useState([]);
        const [followed, setFollowed] = useState({});
        useEffect(()=>{
          // Cargar usuarios reales de Supabase ordenados por puntos
          supabase.from("profiles")
            .select("id,username,avatar_emoji,avatar_color,points,followers_count")
            .order("points",{ascending:false})
            .limit(10)
            .then(({data})=>{
              if(data && data.length > 0){
                // Excluir al usuario actual
                const filtered = data.filter(u=>u.id !== user?.id).slice(0,3);
                setRealUsers(filtered);
              }
            })
            .catch(()=>{});
        },[user?.id]);

        const handleFollow = async (uid) => {
          if(!user){ onNeedAuth(); return; }
          if(followed[uid]) return;
          setFollowed(prev=>({...prev,[uid]:true}));
          try{
            await supabase.from("follows").insert({follower_id:user.id, following_id:uid});
          }catch(e){}
        };

        if(!realUsers.length) return null;
        return(
          <div style={card}>
            <div style={{fontSize:12,fontWeight:800,color:"var(--c-text)",marginBottom:12,letterSpacing:-0.2}}>{t.whofollow}</div>
            {realUsers.map((u,i)=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<realUsers.length-1?"1px solid var(--c-border)":"none"}}>
                <AvatarBubble emoji={u.avatar_emoji||"ð¦"} color={u.avatar_color||"#00A8FF"} size={30}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"var(--c-text)",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {u.username||"Usuario"}
                  </div>
                  <div style={{color:"var(--c-muted2)",fontSize:10}}>
                    {fmtNum(u.followers_count||0)} {t.followers} Â· {fmtNum(u.points||0)} pts
                  </div>
                </div>
                <button onClick={()=>handleFollow(u.id)}
                  style={{background:followed[u.id]?"rgba(22,163,74,0.1)":"rgba(0,168,255,0.08)",border:`1.5px solid ${followed[u.id]?"#16A34A":"rgba(0,168,255,0.3)"}`,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:followed[u.id]?"#16A34A":"#00A8FF",cursor:followed[u.id]?"default":"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>
                  {followed[u.id]?"â Siguiendo":t.follow}
                </button>
              </div>
            ))}
            <div style={{fontSize:9,color:"var(--c-muted2)",marginTop:8,textAlign:"center"}}>Usuarios reales de NexoTrade</div>
          </div>
        );
      })()}

      {/* ââ GOOGLE ADSENSE ââ */}
      <div style={{...card,padding:0,overflow:"hidden",textAlign:"center",background:"transparent",border:"none"}}>
        <ins className="adsbygoogle"
          style={{display:"block",width:"100%"}}
          data-ad-client="ca-pub-3490083853866736"
          data-ad-slot="8915846882"
          data-ad-format="auto"
          data-full-width-responsive="true"/>
      </div>

      {/* ââ BANNERS AFILIADOS ROTATIVOS ââ */}
      <AffiliateBanner/>

      {/* ââ DISCLAIMER ââ */}
      <div style={{background:"rgba(245,158,11,0.04)",border:"1px solid rgba(245,158,11,0.1)",borderRadius:10,padding:"10px 14px",color:"#A16207",fontSize:10,lineHeight:1.8}}>
        <strong>â ï¸</strong> {t.disclaimer}
      </div>
    </div>
  );
}

// ââ REFERRAL SECTION ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function ReferralSection({ user }) {
  const [copied, setCopied] = useState(false);
  const [refCount, setRefCount] = useState(null);
  const [refCode, setRefCode] = useState(null);

  // Generar cÃ³digo legible: primeras 6 letras del username + 3 dÃ­gitos del id
  useEffect(() => {
    if (!user) return;
    const base = (user.username || user.name || "trader").replace(/[^a-zA-Z0-9]/g,"").toUpperCase().slice(0,6);
    const digits = (user.id || "").replace(/\D/g,"").slice(0,3) || "001";
    const code = base + digits;
    setRefCode(code);
    // Contar cuÃ¡ntos usuarios se registraron con ref=user.id
    supabase.from("profiles").select("id", {count:"exact", head:true})
      .eq("referred_by", user.id)
      .then(({count}) => setRefCount(count || 0))
      .catch(() => setRefCount(0));
  }, [user]);

  const refLink = `https://nexotradeia.com?ref=${user.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div id="nexo-referral-section" style={{background:"linear-gradient(135deg,rgba(0,168,255,0.05),rgba(124,58,237,0.05))",borderRadius:16,padding:"16px",border:"1px solid rgba(0,168,255,0.15)"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00A8FF22,#7C3AED22)",border:"1px solid rgba(0,168,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>ð</div>
        <div>
          <div style={{fontWeight:800,fontSize:13,color:"var(--c-text,#0F172A)"}}>Programa de Referidos</div>
          <div style={{fontSize:10,color:"#64748B"}}>Gana 1 mes VIP gratis por cada amigo que se suscriba</div>
        </div>
        {refCount !== null && (
          <div style={{marginLeft:"auto",textAlign:"center",background:"rgba(0,168,255,0.08)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:10,padding:"5px 10px"}}>
            <div style={{fontSize:18,fontWeight:900,color:"#00A8FF"}}>{refCount}</div>
            <div style={{fontSize:9,color:"#64748B",fontWeight:600}}>referidos</div>
          </div>
        )}
      </div>

      {/* Rewards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
        {[
          {icon:"ð",title:"TÃº ganas",val:"1 mes VIP gratis",sub:"por cada referido VIP"},
          {icon:"ð¤",title:"Tu amigo gana",val:"7 dÃ­as gratis",sub:"al suscribirse VIP"},
        ].map((r,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.5)",border:"1px solid rgba(0,0,0,0.06)",borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
            <div style={{fontSize:16,marginBottom:2}}>{r.icon}</div>
            <div style={{fontSize:9,color:"#64748B",fontWeight:600,marginBottom:2}}>{r.title}</div>
            <div style={{fontSize:12,fontWeight:800,color:"var(--c-text,#0F172A)"}}>{r.val}</div>
            <div style={{fontSize:9,color:"#94A3B8"}}>{r.sub}</div>
          </div>
        ))}
      </div>

      {/* Tu cÃ³digo */}
      {refCode && (
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
          <div style={{fontSize:10,color:"#64748B",fontWeight:600,whiteSpace:"nowrap"}}>Tu cÃ³digo:</div>
          <div style={{background:"rgba(0,168,255,0.07)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:800,color:"#00A8FF",fontFamily:"monospace",letterSpacing:1}}>{refCode}</div>
        </div>
      )}

      {/* Link + Copiar */}
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
        <div style={{flex:1,background:"rgba(0,0,0,0.04)",border:"1px solid rgba(0,0,0,0.08)",borderRadius:7,padding:"7px 10px",fontSize:10,color:"#64748B",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          nexotradeia.com?ref={user.id?.slice(0,8)}
        </div>
        <button onClick={handleCopy}
          style={{background:copied?"#10b981":"#00A8FF",border:"none",borderRadius:7,padding:"7px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,transition:"background 0.2s",whiteSpace:"nowrap"}}>
          {copied ? "â Copiado" : "Copiar link"}
        </button>
      </div>

      {/* Compartir */}
      <div style={{display:"flex",gap:6}}>
        <a href={`https://wa.me/?text=ð Te invito a NexoTrade, la comunidad de traders en espaÃ±ol. SeÃ±ales VIP, IA de trading y mÃ¡s. Ãnete gratis: ${refLink}`}
          target="_blank" rel="noopener noreferrer"
          style={{flex:1,background:"#25D366",borderRadius:7,padding:"7px",color:"#fff",fontSize:11,fontWeight:700,textDecoration:"none",textAlign:"center",display:"block"}}>
          ð± WhatsApp
        </a>
        <a href={`https://twitter.com/intent/tweet?text=ð Acabo de unirme a NexoTrade, la red social de traders en espaÃ±ol. Picks VIP, IA y mÃ¡s. Ãnete aquÃ­: ${refLink}`}
          target="_blank" rel="noopener noreferrer"
          style={{flex:1,background:"#0F172A",borderRadius:7,padding:"7px",color:"#fff",fontSize:11,fontWeight:700,textDecoration:"none",textAlign:"center",display:"block"}}>
          ð Twitter/X
        </a>
        <a href={`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=ð Ãnete a NexoTrade - comunidad de traders en espaÃ±ol`}
          target="_blank" rel="noopener noreferrer"
          style={{flex:1,background:"#2AABEE",borderRadius:7,padding:"7px",color:"#fff",fontSize:11,fontWeight:700,textDecoration:"none",textAlign:"center",display:"block"}}>
          âï¸ Telegram
        </a>
      </div>
    </div>
  );
}

// ââ USER MENU âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function UserMenu({user,onLogout,onProfile,onAlerts,onAdmin,lang}){
  const t=LANGS[lang];
  const [open,setOpen]=useState(false);
  const lvl=getLevel(user.points);
  return(
    <div style={{position:"relative"}}>
      <div className="nexo-usermenu-trigger" style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"5px 8px",borderRadius:12,border:`1px solid ${C.border}`,background:C.card2}} onClick={()=>setOpen(!open)}>
        <AvatarBubble emoji={user.emoji} color={user.avatarColor||C.accent} size={28} online/>
        <div className="nexo-logo-text">
          <div style={{color:C.text,fontSize:13,fontWeight:700,lineHeight:1}}>{user.name}</div>
          <div style={{color:lvl.color,fontSize:9,fontWeight:700}}>{lvl.emoji} {lang==="en"?lvl.nameEn:lvl.name}</div>
        </div>
        <span className="nexo-usermenu-arrow" style={{color:C.muted2,fontSize:9}}>â¾</span>
      </div>
      {open&&(
        <div className="nexo-usermenu-dropdown" style={{position:"absolute",right:0,top:"calc(100% + 8px)",background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:8,minWidth:195,zIndex:150,boxShadow:C.shadowMd}}>
          <div style={{padding:"10px 12px",marginBottom:6,background:C.card2,borderRadius:10}}>
            <div style={{color:C.muted2,fontSize:11,marginBottom:4}}>{lang==="en"?"Your points":"Tus puntos"}</div>
            <LevelBadge points={user.points} lang={lang}/>
          </div>
          {[{label:`ð¤ ${t.profile}`,fn:()=>{onProfile(user);setOpen(false);}},{label:`ð Referidos & Ganancias`,fn:()=>{setOpen(false);const el=document.getElementById("nexo-referral-section");if(el)el.scrollIntoView({behavior:"smooth"});else{navigator.clipboard.writeText(`https://nexotradeia.com?ref=${user.id}`).then(()=>alert("â Link copiado: nexotradeia.com?ref="+user.id));}}},{label:`ð ${t.alerts}`,fn:()=>{onAlerts();setOpen(false);}},{label:`âï¸ ${t.settings}`,fn:()=>setOpen(false)},...(ADMIN_EMAILS_CONST.includes(user?.email||"")?[{label:"ð¡ï¸ Admin Dashboard",fn:()=>{if(onAdmin)onAdmin();setOpen(false);},admin:true}]:[]),{label:`ðª ${t.logout}`,fn:()=>{onLogout();setOpen(false);},red:true}].map(item=>(
            <button key={item.label} onClick={item.fn} style={{display:"block",width:"100%",textAlign:"left",background:item.admin?"linear-gradient(135deg,#7C3AED22,#4c1d9511)":"none",border:item.admin?"1px solid #7C3AED44":"none",cursor:"pointer",color:item.red?C.bear:item.admin?"#a78bfa":C.text,fontSize:13,fontWeight:600,padding:"9px 12px",borderRadius:9,fontFamily:"inherit",transition:"background 0.1s",marginBottom:item.admin?4:0}}
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

// ââ FOOTER ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function Footer({ setPage, onAuth, lang="es" }){
  const nav = (idx) => { if(setPage) setPage(idx); };
  const isEN = lang==="en";

  // SVG icons para social
  const IgIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>;
  const XIcon  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
  const TkIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/></svg>;
  const ThIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.821-2.171 1.579-1.66 1.958-3.908 1.236-6.468-.471-1.695-1.7-3.21-3.327-3.96-1.36-.626-2.81-.625-4.145.036-.736.365-1.325.957-1.746 1.762-.391.75-.555 1.664-.461 2.7.13 1.42.69 2.5 1.66 3.203.93.67 2.059.91 3.189.648l.504 2.013c-1.576.394-3.188.163-4.538-.64C9.014 18.23 8.048 16.76 7.88 14.87c-.134-1.46.113-2.806.736-3.999.647-1.235 1.609-2.181 2.782-2.735 1.738-.861 3.713-.86 5.467.003 2.316 1.067 3.959 3.17 4.632 5.863.956 3.454.367 6.508-1.672 8.634-1.75 1.826-4.18 2.743-7.239 2.764l-.4-.4z"/></svg>;

  const social = [
    { name:"Instagram", icon:<IgIcon/>, url:"https://www.instagram.com/nexotradeia",  accent:"#e1306c" },
    { name:"X",         icon:<XIcon/>,  url:"https://x.com/Nexotradeia",              accent:"#e2e8f0" },
    { name:"TikTok",    icon:<TkIcon/>, url:"https://www.tiktok.com/@nexotradeia",    accent:"#ff3b5c" },
    { name:"Threads",   icon:<ThIcon/>, url:"https://www.threads.com/@nexotradeia",   accent:"#a78bfa" },
  ];

  const cols = [
    {
      title: isEN?"Platform":"Plataforma",
      items:[
        {label: isEN?"Feed":"Feed",                     page:0},
        {label: isEN?"Market Tops":"Tops de Mercado",   page:1},
        {label: isEN?"News":"Noticias",                 page:5},
        {label: isEN?"Earnings":"Earnings",             page:6},
        {label: isEN?"AI Assistant":"Asistente IA",     page:9},
        {label: isEN?"VIP Ideas â¦":"Ideas VIP â¦",      page:21},
      ]
    },
    {
      title: isEN?"Tools":"Herramientas",
      items:[
        {label: isEN?"Stock Screener â¦":"Screener â¦",           page:17},
        {label: isEN?"Institutional Flow â¦":"Flujo Inst. â¦",    page:20},
        {label: isEN?"Top Investors â¦":"GurÃºs â¦",               page:19},
        {label: isEN?"Economic Calendar":"Cal. EconÃ³mico",       page:14},
        {label: "IPOs 2026",                                     page:16},
        {label: isEN?"Dividends":"Dividendos",                   page:15},
      ]
    },
    {
      title: isEN?"Community":"Comunidad",
      items:[
        {label: isEN?"Community Rules":"Normas",         page:34},
        {label: isEN?"Live Webinars":"Webinars",         page:11},
        {label: isEN?"Academy":"Academia",               page:12},
        {label: isEN?"Messages":"Mensajes",              page:22},
        {label: isEN?"VIP $9.99/mo â¦":"VIP $9.99/mes â¦",page:8},
        {label: isEN?"Join free â":"Ãnete gratis â",     action:"auth"},
      ]
    },
    {
      title: isEN?"Legal & Company":"Legal y Empresa",
      items:[
        {label: isEN?"About Us":"Sobre Nosotros",        page:30},
        {label: isEN?"Terms of Use":"TÃ©rminos de Uso",   page:31},
        {label: isEN?"Privacy Policy":"Privacidad",      page:32},
        {label: isEN?"Risk Disclaimer":"Aviso de Riesgo",page:33},
        {label: isEN?"Contact":"Contacto",               href:"mailto:hola@nexotradeia.com"},
      ]
    },
  ];

  return(
    <footer style={{background:"#060a14",borderTop:"1px solid rgba(139,92,246,0.12)",marginTop:48,fontFamily:"Inter,sans-serif"}}>

      {/* ââ TOP STRIP â tagline IA ââ */}
      <div style={{borderBottom:"1px solid rgba(255,255,255,0.04)",padding:"22px 20px"}}>
        <div style={{maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {/* Logo */}
            <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#fff",fontSize:16,letterSpacing:-1,flexShrink:0}}>N</div>
            <div>
              <span style={{fontSize:16,fontWeight:900,color:"#f1f5f9",letterSpacing:"-0.5px"}}>NexoTrade</span>
              <span style={{fontSize:10,color:"rgba(139,92,246,0.8)",marginLeft:8,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase"}}>IA Â· Trading</span>
            </div>
          </div>
          {/* Tagline */}
          <p style={{color:"#475569",fontSize:12,margin:0,lineHeight:1.6,maxWidth:420,textAlign:"center"}}>
            {isEN?"The most active Spanish-speaking investor community.":"La comunidad de inversores hispanohablantes mÃ¡s activa."}<br/>
            <span style={{color:"rgba(139,92,246,0.7)"}}>{isEN?"Real signals Â· Integrated AI Â· No commissions":"SeÃ±ales reales Â· IA integrada Â· Sin comisiones"}</span>
          </p>
          {/* CTA */}
          <button onClick={()=>onAuth&&onAuth()}
            style={{background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",border:"none",borderRadius:10,padding:"9px 22px",fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer",boxShadow:"0 0 20px rgba(139,92,246,0.25)",whiteSpace:"nowrap",transition:"box-shadow 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 0 28px rgba(139,92,246,0.45)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="0 0 20px rgba(139,92,246,0.25)"}>
            {isEN?"Start free â":"Empieza gratis â"}
          </button>
        </div>
      </div>

      {/* ââ MAIN GRID ââ */}
      <div style={{maxWidth:1140,margin:"0 auto",padding:"36px 20px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"24px 32px"}}>
        {cols.map(col=>(
          <div key={col.title}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(139,92,246,0.7)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14}}>{col.title}</div>
            {col.items.map(item=>{
              const isVip = item.label?.includes("â¦");
              const isJoin = item.action==="auth";
              const base = {display:"block",fontSize:13,textDecoration:"none",marginBottom:9,transition:"color 0.15s",lineHeight:1.4,cursor:"pointer",background:"none",border:"none",padding:0,fontFamily:"inherit",textAlign:"left"};
              if(item.page!==undefined){
                return(
                  <button key={item.label} onClick={()=>nav(item.page)}
                    style={{...base,color:isVip?"rgba(167,139,250,0.8)":isJoin?"#8B5CF6":"#475569",fontWeight:isJoin?700:400}}
                    onMouseEnter={e=>e.currentTarget.style.color=isVip?"#A78BFA":"#c4b5fd"}
                    onMouseLeave={e=>e.currentTarget.style.color=isVip?"rgba(167,139,250,0.8)":isJoin?"#8B5CF6":"#475569"}>
                    {item.label}
                  </button>
                );
              }
              if(item.action==="auth"){
                return(
                  <button key={item.label} onClick={()=>onAuth&&onAuth()}
                    style={{...base,color:"#8B5CF6",fontWeight:700}}
                    onMouseEnter={e=>e.currentTarget.style.color="#A78BFA"}
                    onMouseLeave={e=>e.currentTarget.style.color="#8B5CF6"}>
                    {item.label}
                  </button>
                );
              }
              return(
                <a key={item.label} href={item.href||"#"}
                  style={{...base,color:"#475569"}}
                  onMouseEnter={e=>e.currentTarget.style.color="#94a3b8"}
                  onMouseLeave={e=>e.currentTarget.style.color="#475569"}>
                  {item.label}
                </a>
              );
            })}
          </div>
        ))}
      </div>

      {/* ââ BOTTOM BAR ââ */}
      <div style={{borderTop:"1px solid rgba(255,255,255,0.04)",padding:"14px 20px"}}>
        <div style={{maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
          {/* Copyright */}
          <span style={{color:"#334155",fontSize:11}}>Â© 2026 NexoTrade Â· nexotradeia.com Â· {isEN?"All rights reserved":"Todos los derechos reservados"}</span>

          {/* Disclaimer â clickable */}
          <span style={{color:"#334155",fontSize:11,cursor:"pointer",textDecoration:"underline",textDecorationColor:"rgba(255,255,255,0.1)"}}
            onClick={()=>nav(33)}>
            {isEN?"â ï¸ Not financial advice â Educational only":"â ï¸ No es consejo financiero â Solo educativo"}
          </span>

          {/* Social icons */}
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {social.map(s=>(
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" title={s.name}
                style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",color:"#334155",textDecoration:"none",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.color=s.accent;e.currentTarget.style.borderColor=s.accent+"44";e.currentTarget.style.background=s.accent+"11";}}
                onMouseLeave={e=>{e.currentTarget.style.color="#334155";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}

// ââ PREDICCIÃN DEL DÃA ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
/* ââ COUNTDOWN HOOK â cuenta regresiva hasta una fecha ââââââââââââââââââââ */
function useCountdown(targetDateStr){
  const calc = () => {
    const diff = new Date(targetDateStr+" 19:00:00").getTime() - Date.now();
    if(diff<=0) return {d:0,h:0,m:0,s:0,expired:true};
    const d=Math.floor(diff/86400000);
    const h=Math.floor((diff%86400000)/3600000);
    const m=Math.floor((diff%3600000)/60000);
    const s=Math.floor((diff%60000)/1000);
    return {d,h,m,s,expired:false};
  };
  const [t,setT]=useState(calc);
  useEffect(()=>{
    const iv=setInterval(()=>setT(calc()),1000);
    return()=>clearInterval(iv);
  },[targetDateStr]);
  return t;
}

/* ââ COUNTDOWN DISPLAY âââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function WebinarCountdown({fecha}){
  // Convierte "Lun 2 Jun" â fecha real 2025
  const monthMap={Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11,
    Ene:0,Feb:1,Mar:2,Abr:3,May:4,Jun:5,Jul:6,Ago:7,Sep:8,Oct:9,Nov:10,Dic:11};
  const parts = fecha.replace(/^[A-Za-zÃ¡Ã©Ã­Ã³Ãº]+ /,"").split(" ");
  const day=parseInt(parts[0]);
  const mon=monthMap[parts[1]]??5;
  const now=new Date();
  const year=now.getMonth()>mon?now.getFullYear()+1:now.getFullYear();
  const targetStr=`${year}-${String(mon+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const {d,h,m,s,expired}=useCountdown(targetStr);
  if(expired) return <span style={{color:"#ef4444",fontSize:11,fontWeight:700}}>â° En vivo ahora</span>;
  return(
    <div style={{display:"flex",gap:4,alignItems:"center"}}>
      <span style={{fontSize:10,color:"#64748b"}}>Empieza en:</span>
      {d>0&&<Chip v={d} l="d"/>}<Chip v={h} l="h"/><Chip v={m} l="m"/><Chip v={s} l="s"/>
    </div>
  );
}
function Chip({v,l}){
  return(
    <span style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:6,padding:"2px 5px",fontFamily:"monospace",fontSize:12,fontWeight:700,color:C.accent,minWidth:28,textAlign:"center"}}>
      {String(v).padStart(2,"0")}<span style={{color:"#475569",fontSize:9,marginLeft:1}}>{l}</span>
    </span>
  );
}

/* ââ SOCIAL PROOF STATS BAR ââââââââââââââââââââââââââââââââââââââââââââââââ */
function SocialProofBar({user, onRegister, lang="es"}){
  const [stats, setStats] = useState({users:2847, posts:14203, ganancia:"$127,480"});
  const [online, setOnline] = useState(Math.floor(Math.random()*40)+60);
  const isEN = lang==="en";

  // Simula contador vivo â sube cada 30s
  useEffect(()=>{
    const t = setInterval(()=>{
      setStats(s=>({...s, posts: s.posts + Math.floor(Math.random()*3)+1}));
      setOnline(Math.floor(Math.random()*40)+60);
    }, 30000);
    return ()=>clearInterval(t);
  },[]);

  const items = [
    {icon:"ð¥", value: stats.users.toLocaleString(), label:isEN?"Registered traders":"Traders registrados"},
    {icon:"ð¢", value: online, label:isEN?"Online now":"En lÃ­nea ahora"},
    {icon:"ð", value: stats.posts.toLocaleString(), label:isEN?"Published analyses":"AnÃ¡lisis publicados"},
    {icon:"ð°", value: stats.ganancia, label:isEN?"In reported gains":"En ganancias reportadas", highlight:true},
  ];

  return(
    <div style={{maxWidth:1200,margin:"0 auto",padding:"0 16px 6px"}}>
      <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:10,padding:"6px 14px",border:"1px solid #1e293b",display:"flex",gap:4,alignItems:"center",flexWrap:"wrap",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",flex:1}}>
          {items.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontSize:11}}>{s.icon}</span>
              <div>
                <span style={{color:s.highlight?"#10b981":C.accent,fontWeight:800,fontSize:11}}>{s.value}</span>
                <span style={{color:"#475569",fontSize:10,marginLeft:3}}>{s.label}</span>
              </div>
              {i<items.length-1&&<div style={{width:1,height:12,background:"#334155",marginLeft:8}}/>}
            </div>
          ))}
        </div>
        {!user && (
          <button onClick={onRegister}
            style={{background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:7,padding:"5px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
            {isEN?"Join free â":"Ãnete gratis â"}
          </button>
        )}
      </div>
    </div>
  );
}

function PredictionBanner({lang="es"}){
  const [votes,setVotes]=useState({up:2847,down:912});
  const [voted,setVoted]=useState(null);
  const total=votes.up+votes.down;
  const pct=Math.round(votes.up/total*100);
  const isEN=lang==="en";
  const vote=(dir)=>{
    if(voted)return;
    setVotes(v=>({...v,[dir]:v[dir]+1}));
    setVoted(dir);
  };
  return(
    <div style={{background:`linear-gradient(135deg,rgba(0,210,106,0.04),rgba(60,142,250,0.04))`,borderBottom:`1px solid ${C.glassBorder}`,padding:"6px 16px"}}>
      <div style={{maxWidth:1140,margin:"0 auto",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span style={{background:C.gold+"22",color:C.gold,border:`1px solid ${C.gold}44`,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:800,letterSpacing:0.4,flexShrink:0}}>ð¥ {isEN?"PREDICTION OF THE DAY":"PREDICCIÃN DEL DÃA"}</span>
        <span style={{color:"#fff",fontWeight:700,fontSize:12,flex:1}}>{isEN?"Will NVDA go up or down tomorrow?":"Â¿NVDA sube o baja maÃ±ana?"}</span>
        <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
          <button onClick={()=>vote("up")} style={{background:voted==="up"?`${C.bull}22`:"rgba(255,255,255,0.05)",border:`1px solid ${voted==="up"?C.bull:C.glassBorder}`,borderRadius:8,padding:"4px 12px",color:voted==="up"?C.bull:C.muted,cursor:voted?"default":"pointer",fontSize:11,fontWeight:700}}>â² {isEN?"Up":"Sube"} {voted&&`(${Math.round(votes.up/total*100)}%)`}</button>
          <button onClick={()=>vote("down")} style={{background:voted==="down"?`${C.bear}22`:"rgba(255,255,255,0.05)",border:`1px solid ${voted==="down"?C.bear:C.glassBorder}`,borderRadius:8,padding:"4px 12px",color:voted==="down"?C.bear:C.muted,cursor:voted?"default":"pointer",fontSize:11,fontWeight:700}}>â¼ {isEN?"Down":"Baja"} {voted&&`(${100-Math.round(votes.up/total*100)}%)`}</button>
          <span style={{color:C.muted2,fontSize:10,flexShrink:0}}>{(total).toLocaleString()} {isEN?"votes":"votos"}</span>
        </div>
        {voted&&<div style={{width:"100%",height:3,background:C.card2,borderRadius:3,marginTop:4}}>
          <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${C.bull},${C.blue})`,borderRadius:3,transition:"width 0.5s"}}/>
        </div>}
      </div>
    </div>
  );
}

// ââ VIP TOOLS PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function VipToolsPage({ isPremium, onNeedPremium, posts=[], user, lang="es" }){
  const [tool, setTool] = useState("riesgo");
  const isEN = lang === "en";

  // ââ GATE VIP ââ
  if(!isPremium) return(
    <div style={{textAlign:"center",padding:"60px 20px",background:"rgba(10,16,30,0.98)",borderRadius:20,border:"1px solid rgba(245,158,11,0.2)"}}>
      <div style={{fontSize:52,marginBottom:16}}>ð</div>
      <h2 style={{color:"#F59E0B",fontWeight:900,marginBottom:8}}>{isEN?"Exclusive VIP Tools":"Herramientas VIP Exclusivas"}</h2>
      <p style={{color:"#94A3B8",fontSize:15,marginBottom:24,maxWidth:400,margin:"0 auto 24px"}}>{isEN?"Sharpe Ratio calculator, win streak tracker, price alerts and more â VIP members only.":"Calculadora Sharpe Ratio, racha de ganancias, alertas de precio y mÃ¡s â solo para miembros VIP."}</p>
      <button onClick={onNeedPremium} style={{background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",borderRadius:12,padding:"14px 32px",fontSize:15,fontWeight:800,color:"#000",cursor:"pointer"}}>â¦ {isEN?"Go VIP â $9.99/mo":"Hazte VIP â $9.99/mes"}</button>
    </div>
  );

  const TOOLS = isEN ? [
    {k:"paper",     label:"ð® Paper Trading"},
    {k:"riesgo",    label:"âï¸ Risk/Reward"},
    {k:"sharpe",    label:"ð Sharpe Ratio"},
    {k:"racha",     label:"ð¥ Win Streak & Stats"},
    {k:"portafolio",label:"ð Portfolio Evolution"},
    {k:"alertas",   label:"ð Price Alerts"},
    {k:"exportar",  label:"ð¤ Export Data"},
  ] : [
    {k:"paper",    label:"ð® Paper Trading"},
    {k:"riesgo",   label:"âï¸ Riesgo/Recompensa"},
    {k:"sharpe",   label:"ð Sharpe Ratio"},
    {k:"racha",    label:"ð¥ Racha & Stats"},
    {k:"portafolio",label:"ð EvoluciÃ³n Portafolio"},
    {k:"alertas",  label:"ð Alertas de Precio"},
    {k:"exportar", label:"ð¤ Exportar Datos"},
  ];

  return(
    <div>
      <div style={{marginBottom:20}}>
        <h2 style={{color:"#F59E0B",fontWeight:900,fontSize:22,marginBottom:4}}>ð ï¸ {isEN?"VIP Tools":"Herramientas VIP"}</h2>
        <p style={{color:"#64748B",fontSize:13}}>{isEN?"Exclusive calculators and utilities for professional traders":"Calculadoras y utilidades exclusivas para traders profesionales"}</p>
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

      {/* ââ 0. PAPER TRADING ââ */}
      {tool==="paper" && <PaperTrading user={user}/>}

      {/* ââ 1. CALCULADORA RIESGO/RECOMPENSA ââ */}
      {tool==="riesgo" && <RiskRewardCalc/>}

      {/* ââ 2. SHARPE RATIO ââ */}
      {tool==="sharpe" && <SharpeCalc/>}

      {/* ââ 3. RACHA & ESTADÃSTICAS ââ */}
      {tool==="racha" && <WinStreakTracker/>}

      {/* ââ 4. EVOLUCIÃN PORTAFOLIO ââ */}
      {tool==="portafolio" && <PortfolioEvolution/>}

      {/* ââ 5. ALERTAS DE PRECIO ââ */}
      {tool==="alertas" && <PriceAlerts/>}

      {/* ââ 6. EXPORTAR DATOS ââ */}
      {tool==="exportar" && <ExportData posts={posts} user={user}/>}
    </div>
  );
}

// ââ PAPER TRADING ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const PAPER_INITIAL = 100000;
function PaperTrading({ user }){
  const KEY = `nexotrade_paper_${user?.id||"guest"}`;
  const load = ()=>{
    try{ const s=localStorage.getItem(KEY); return s?JSON.parse(s):{cash:PAPER_INITIAL,positions:{},trades:[]}; }
    catch(e){ return {cash:PAPER_INITIAL,positions:{},trades:[]}; }
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
  useEffect(()=>{ try{localStorage.setItem(KEY,JSON.stringify(pf));}catch(e){} },[pf]);

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
      }catch(e){}
    }
    setPrices(next);
  },[pf.positions]);

  useEffect(()=>{ refreshPrices(); },[]);

  // Buscar cotizaciÃ³n al escribir ticker
  const fetchQuote = async(tk)=>{
    if(!tk||tk.length<1){setLiveQ(null);return;}
    setFetching(true);
    try{
      const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${tk.toUpperCase()}&token=${FINNHUB_KEY}`);
      const d=await r.json();
      if(d.c>0) setLiveQ({price:d.c, change:d.dp||0});
      else setLiveQ(null);
    }catch(e){ setLiveQ(null); }
    setFetching(false);
  };

  const showMsg=(text,ok=true)=>{setMsg({text,ok});setTimeout(()=>setMsg(null),3000);};

  const buy=()=>{
    const sh=parseFloat(shares), tk=ticker.trim().toUpperCase();
    if(!sh||sh<=0||!liveQ||!tk) return;
    const cost=liveQ.price*sh;
    if(cost>pf.cash){showMsg("â Efectivo insuficiente",false);return;}
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
    showMsg(`â Compraste ${sh} acciones de $${tk}`);
    setShares(""); setTicker(""); setLiveQ(null); setTab("cartera");
  };

  const sell=(tk,sh)=>{
    sh=parseFloat(sh);
    const pos=pf.positions[tk];
    if(!pos||!sh||sh<=0||sh>pos.shares){showMsg("â Cantidad invÃ¡lida",false);return;}
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
    showMsg(`â Vendiste ${sh} acciones de $${tk} a $${sellPrice.toFixed(2)}`);
    setSellTicker(null); setSellShares("");
  };

  const resetPortfolio=()=>{
    if(!window.confirm("Â¿Reiniciar cartera? PerderÃ¡s todas las posiciones.")) return;
    setPf({cash:PAPER_INITIAL,positions:{},trades:[]});
    setPrices({}); showMsg("ð Cartera reiniciada con $100,000");
  };

  // Calcular mÃ©tricas
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

      {/* ââ Header cartera ââ */}
      <div style={{background:"linear-gradient(135deg,#0B1A2E,#0D2244)",borderRadius:18,padding:"22px 24px",marginBottom:16,border:"1px solid rgba(0,168,255,0.15)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:11,color:"#64748B",fontWeight:700,letterSpacing:1,marginBottom:4}}>CARTERA TOTAL</div>
            <div style={{fontSize:32,fontWeight:900,color:"#fff",fontFamily:"monospace"}}>{fmtUSD(totalValue)}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              <span style={{fontSize:14,fontWeight:800,color:isGain?"#00E58F":"#FF4D6A"}}>
                {isGain?"â²":"â¼"} {fmtUSD(Math.abs(totalPnl))} ({totalPnlPct>=0?"+":""}{totalPnlPct.toFixed(2)}%)
              </span>
              <span style={{fontSize:11,color:"#64748B"}}>desde inicio</span>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
            <div style={{background:"rgba(0,168,255,0.1)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:10,padding:"8px 14px",textAlign:"right"}}>
              <div style={{fontSize:10,color:"#64748B",fontWeight:600}}>EFECTIVO</div>
              <div style={{fontSize:18,fontWeight:800,color:"#00A8FF",fontFamily:"monospace"}}>{fmtUSD(pf.cash)}</div>
            </div>
            <button onClick={resetPortfolio} style={{fontSize:10,color:"#64748B",background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"4px 10px",cursor:"pointer",fontWeight:600}}>âº Reiniciar</button>
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

      {/* ââ Tabs ââ */}
      <div style={{display:"flex",gap:4,marginBottom:16,background:"rgba(0,0,0,0.04)",borderRadius:10,padding:4}}>
        {[["cartera","ð Cartera"],["operar","ð¹ Operar"],["historial","ð Historial"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,
              background:tab===k?"#ffffff":  "transparent",
              color:tab===k?"#0F172A":"#64748B",
              boxShadow:tab===k?"0 1px 4px rgba(0,0,0,0.1)":"none",
              transition:"all 0.15s"
            }}>{l}</button>
        ))}
      </div>

      {/* ââ TAB: CARTERA ââ */}
      {tab==="cartera"&&(
        <div>
          {positions.length===0?(
            <div style={{textAlign:"center",padding:"40px 20px",background:"rgba(0,168,255,0.03)",border:"1px dashed rgba(0,168,255,0.2)",borderRadius:14}}>
              <div style={{fontSize:36,marginBottom:12}}>ð­</div>
              <div style={{fontWeight:700,color:"#0F172A",marginBottom:6}}>Cartera vacÃ­a</div>
              <div style={{color:"#64748B",fontSize:13,marginBottom:16}}>Tienes {fmtUSD(pf.cash)} de efectivo virtual.<br/>Ve a "Operar" y compra tu primera acciÃ³n.</div>
              <button onClick={()=>setTab("operar")} style={{background:"linear-gradient(135deg,#00E58F,#00A8FF)",border:"none",borderRadius:10,padding:"10px 24px",fontWeight:800,color:"#fff",cursor:"pointer",fontSize:14}}>ð¹ Ir a Operar</button>
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
                  {/* BotÃ³n vender */}
                  <div style={{marginLeft:"auto"}}>
                    {sellTicker===p.tk?(
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        <input value={sellShares} onChange={e=>setSellShares(e.target.value)}
                          placeholder={`mÃ¡x ${p.shares}`} type="number" min="0.01" step="0.01"
                          style={{width:70,border:"1px solid rgba(220,38,38,0.3)",borderRadius:7,padding:"5px 8px",fontSize:12,outline:"none"}}/>
                        <button onClick={()=>sell(p.tk,sellShares)}
                          style={{background:"#DC2626",border:"none",borderRadius:7,padding:"5px 10px",color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>Vender</button>
                        <button onClick={()=>setSellTicker(null)}
                          style={{background:"transparent",border:"1px solid #ccc",borderRadius:7,padding:"5px 8px",cursor:"pointer",fontSize:12,color:"#64748B"}}>â</button>
                      </div>
                    ):(
                      <button onClick={()=>{setSellTicker(p.tk);setSellShares("");}}
                        style={{background:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.25)",borderRadius:8,padding:"6px 14px",color:"#DC2626",fontWeight:700,fontSize:12,cursor:"pointer"}}>
                        Vender â¾
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={refreshPrices} style={{background:"transparent",border:"1px solid rgba(0,168,255,0.2)",borderRadius:8,padding:"8px",color:"#00A8FF",fontSize:12,fontWeight:600,cursor:"pointer",marginTop:4}}>â» Actualizar precios</button>
            </div>
          )}
        </div>
      )}

      {/* ââ TAB: OPERAR ââ */}
      {tab==="operar"&&(
        <div style={{background:"#fff",border:"1px solid rgba(15,23,42,0.09)",borderRadius:16,padding:"20px"}}>
          <h3 style={{fontWeight:800,fontSize:15,color:"#0F172A",marginBottom:16}}>ð¹ Comprar acciones</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Ticker input */}
            <div>
              <label style={{fontSize:11,fontWeight:700,color:"#64748B",display:"block",marginBottom:5}}>TICKER DE LA ACCIÃN</label>
              <div style={{display:"flex",gap:8}}>
                <input value={ticker}
                  onChange={e=>{setTicker(e.target.value.toUpperCase());setLiveQ(null);}}
                  onBlur={e=>fetchQuote(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&fetchQuote(ticker)}
                  placeholder="Ej: AAPL, NVDA, TSLA, BTC-USD"
                  style={{flex:1,border:"1.5px solid rgba(15,23,42,0.12)",borderRadius:10,padding:"10px 14px",fontSize:14,fontFamily:"monospace",fontWeight:700,outline:"none",letterSpacing:1}}/>
                <button onClick={()=>fetchQuote(ticker)}
                  style={{background:"linear-gradient(135deg,#00A8FF,#0090D4)",border:"none",borderRadius:10,padding:"10px 16px",color:"#fff",fontWeight:800,fontSize:13,cursor:"pointer"}}>
                  {fetching?"â³":"ð"}
                </button>
              </div>
            </div>

            {/* CotizaciÃ³n en vivo */}
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
                <div style={{marginLeft:"auto",fontSize:11,color:"#16A34A",background:"rgba(22,163,74,0.08)",border:"1px solid rgba(22,163,74,0.2)",borderRadius:8,padding:"4px 10px",fontWeight:700}}>â En vivo</div>
              </div>
            )}
            {!liveQ&&ticker&&!fetching&&(
              <div style={{fontSize:12,color:"#DC2626",background:"rgba(220,38,38,0.06)",border:"1px solid rgba(220,38,38,0.15)",borderRadius:8,padding:"8px 12px"}}>
                â ï¸ Ticker no encontrado. Verifica que sea un sÃ­mbolo vÃ¡lido (ej: AAPL, MSFT, NVDA).
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

            {/* BotÃ³n comprar */}
            <button onClick={buy}
              disabled={!liveQ||!shares||parseFloat(shares)<=0}
              style={{background:liveQ&&shares?"linear-gradient(135deg,#00E58F,#00A8FF)":"rgba(0,0,0,0.06)",border:"none",borderRadius:12,padding:"14px",fontWeight:900,fontSize:15,color:liveQ&&shares?"#fff":"#94A3B8",cursor:liveQ&&shares?"pointer":"not-allowed",transition:"all 0.15s",letterSpacing:0.3}}>
              {liveQ&&shares?`â² Comprar ${shares} Ã $${ticker} â ${fmtUSD(liveQ.price*parseFloat(shares||0))}`:"Busca un ticker y elige cantidad"}
            </button>

            <div style={{fontSize:11,color:"#94A3B8",textAlign:"center"}}>â ï¸ Solo trading simulado â dinero virtual. No es dinero real.</div>
          </div>
        </div>
      )}

      {/* ââ TAB: HISTORIAL ââ */}
      {tab==="historial"&&(
        <div style={{background:"#fff",border:"1px solid rgba(15,23,42,0.09)",borderRadius:16,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid rgba(15,23,42,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:800,fontSize:14,color:"#0F172A"}}>ð Historial de operaciones</span>
            <span style={{fontSize:12,color:"#64748B"}}>{pf.trades.length} ops.</span>
          </div>
          {pf.trades.length===0?(
            <div style={{textAlign:"center",padding:"32px",color:"#94A3B8",fontSize:13}}>Sin operaciones todavÃ­a</div>
          ):(
            <div>
              {pf.trades.map((t,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:"1px solid rgba(15,23,42,0.05)",background:i%2===0?"#fff":"#FAFBFC"}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:t.action==="buy"?"rgba(22,163,74,0.1)":"rgba(220,38,38,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                    {t.action==="buy"?"â²":"â¼"}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:13,color:"#0F172A"}}>{t.action==="buy"?"COMPRA":"VENTA"} <span style={{fontFamily:"monospace",color:C.accentText}}>${t.ticker}</span></div>
                    <div style={{fontSize:11,color:"#64748B"}}>{fmtDate(t.date)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:800,fontSize:13,fontFamily:"monospace",color:"#0F172A"}}>{fmtUSD(t.price*t.shares)}</div>
                    <div style={{fontSize:11,color:"#64748B"}}>{t.shares} acc. Ã {fmtUSD(t.price)}</div>
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

// ââ HERRAMIENTA 1: RIESGO/RECOMPENSA âââââââââââââââââââââââââââââââââââââââââ
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
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>âï¸ Calculadora Riesgo/Recompensa</h3>
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
          <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>% de riesgo por operaciÃ³n: {riskPct}%</label>
          <input type="range" min="0.5" max="10" step="0.5" value={riskPct} onChange={e=>setRiskPct(e.target.value)}
            style={{width:"100%",accentColor:"#F59E0B"}}/>
        </div>
      </div>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>ð Resultado</h3>
        {result ? (<>
          <div style={{textAlign:"center",marginBottom:20,padding:"20px",background:`rgba(${result.rr>=3?"0,229,143":result.rr>=2?"245,158,11":"255,77,106"},0.08)`,borderRadius:14,border:`1px solid rgba(${result.rr>=3?"0,229,143":result.rr>=2?"245,158,11":"255,77,106"},0.2)`}}>
            <div style={{fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,letterSpacing:1}}>RATIO RIESGO/RECOMPENSA</div>
            <div style={{fontSize:48,fontWeight:900,color:result.rrColor,fontFamily:"monospace"}}>{result.rr.toFixed(2)}<span style={{fontSize:20}}>:1</span></div>
            <div style={{fontSize:14,color:result.rrColor,fontWeight:700}}>{result.rrLabel} operaciÃ³n</div>
          </div>
          {[
            {label:"Acciones a comprar",val:`${result.shares} acciones`,color:"#F1F5F9"},
            {label:"Riesgo mÃ¡ximo",val:`-$${result.potLoss.toFixed(2)}`,color:"#FF4D6A"},
            {label:"Ganancia potencial",val:`+$${result.potGain.toFixed(2)}`,color:"#00E58F"},
            {label:"Riesgo por acciÃ³n",val:`$${result.riskPerShare.toFixed(2)}`,color:"#94A3B8"},
            {label:"Ganancia por acciÃ³n",val:`$${result.gainPerShare.toFixed(2)}`,color:"#94A3B8"},
          ].map(r=>(
            <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <span style={{fontSize:13,color:"#64748B"}}>{r.label}</span>
              <span style={{fontSize:14,fontWeight:700,color:r.color,fontFamily:"monospace"}}>{r.val}</span>
            </div>
          ))}
          <div style={{marginTop:16,padding:"12px",background:"rgba(0,168,255,0.07)",borderRadius:10,border:"1px solid rgba(0,168,255,0.15)",fontSize:12,color:"#94A3B8",lineHeight:1.6}}>
            ð¡ <strong style={{color:"#00A8FF"}}>Regla de oro:</strong> Solo operar con R:R â¥ 2:1. AsÃ­ puedes perder el 50% de tus operaciones y seguir siendo rentable.
          </div>
        </>) : (
          <div style={{textAlign:"center",padding:"40px 20px",color:"#475569"}}>
            <div style={{fontSize:36,marginBottom:12}}>âï¸</div>
            <div style={{fontSize:13}}>Ingresa entrada, stop loss y objetivo para calcular</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ââ HERRAMIENTA 2: SHARPE RATIO âââââââââââââââââââââââââââââââââââââââââââââââ
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
    const label=sharpe>=2?"Excelente ð":sharpe>=1?"Bueno â":sharpe>=0.5?"Aceptable â ï¸":sharpe>=0?"Bajo ð":"Negativo â";
    const color=sharpe>=2?"#00E58F":sharpe>=1?"#00A8FF":sharpe>=0.5?"#F59E0B":sharpe>=0?"#FF9F43":"#FF4D6A";
    return{sharpe,mean,std,annualMean,annualStd,count:vals.length,label,color};
  },[returns,rfRate]);

  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:8}}>ð Calculadora Sharpe Ratio</h3>
        <p style={{color:"#64748B",fontSize:12,marginBottom:20,lineHeight:1.6}}>Mide el rendimiento ajustado al riesgo. Mayor = mejor. Ingresa tus retornos mensuales separados por comas.</p>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Retornos mensuales (%) â ej: 3.2, -1.5, 4.1, 2.8</label>
          <textarea value={returns} onChange={e=>setReturns(e.target.value)} placeholder="3.2, -1.5, 4.1, 2.8, -0.5, 5.1, 1.2, -2.1, 3.5, 4.0, 1.8, 2.2"
            style={{width:"100%",height:100,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",color:"#F1F5F9",fontSize:13,fontFamily:"monospace",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Tasa libre de riesgo anual (%)</label>
          <input value={rfRate} onChange={e=>setRfRate(e.target.value)} type="number" step="0.1"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 12px",color:"#F1F5F9",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
        {result&&<div style={{fontSize:12,color:"#475569",lineHeight:1.8}}>
          ð {result.count} meses de datos<br/>
          Retorno medio mensual: <strong style={{color:"#F1F5F9"}}>{result.mean.toFixed(2)}%</strong><br/>
          DesviaciÃ³n estÃ¡ndar: <strong style={{color:"#F1F5F9"}}>{result.std.toFixed(2)}%</strong><br/>
          Retorno anualizado: <strong style={{color:"#00E58F"}}>{result.annualMean.toFixed(2)}%</strong>
        </div>}
      </div>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>ð Resultado</h3>
        {result ? (<>
          <div style={{textAlign:"center",marginBottom:20,padding:"24px",background:`rgba(${result.color==="#00E58F"?"0,229,143":result.color==="#00A8FF"?"0,168,255":"245,158,11"},0.07)`,borderRadius:14}}>
            <div style={{fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,letterSpacing:1}}>SHARPE RATIO</div>
            <div style={{fontSize:52,fontWeight:900,color:result.color,fontFamily:"monospace"}}>{result.sharpe.toFixed(3)}</div>
            <div style={{fontSize:15,color:result.color,fontWeight:700,marginTop:4}}>{result.label}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px",marginBottom:16}}>
            <div style={{fontSize:12,color:"#64748B",fontWeight:700,marginBottom:10}}>ESCALA DE REFERENCIA</div>
            {[{min:"< 0",label:"Negativo â peor que el libre de riesgo",color:"#FF4D6A"},
              {min:"0 â 0.5",label:"Bajo â rentable pero con mucho riesgo",color:"#FF9F43"},
              {min:"0.5 â 1",label:"Aceptable â rendimiento decente",color:"#F59E0B"},
              {min:"1 â 2",label:"Bueno â portafolio eficiente",color:"#00A8FF"},
              {min:"> 2",label:"Excelente â clase de Warren Buffett",color:"#00E58F"},
            ].map(r=>(
              <div key={r.min} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <span style={{width:50,fontSize:11,color:r.color,fontFamily:"monospace",fontWeight:700,flexShrink:0}}>{r.min}</span>
                <span style={{fontSize:12,color:result.sharpe>=(r.min==="< 0"?-Infinity:parseFloat(r.min))?"#CBD5E1":"#475569"}}>{r.label}</span>
              </div>
            ))}
          </div>
        </>) : (
          <div style={{textAlign:"center",padding:"40px 20px",color:"#475569"}}>
            <div style={{fontSize:36,marginBottom:12}}>ð</div>
            <div style={{fontSize:13}}>Ingresa tus retornos mensuales para calcular</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ââ HERRAMIENTA 3: RACHA DE GANANCIAS ââââââââââââââââââââââââââââââââââââââââ
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
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>ð¥ Registrar OperaciÃ³n</h3>
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
              <option value="win">â Win</option>
              <option value="loss">â Loss</option>
            </select>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4}}>P&L ($) â positivo o negativo</label>
          <input value={newTrade.pnl} onChange={e=>setNewTrade(t=>({...t,pnl:e.target.value}))} placeholder="+250.00" type="number"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:14,fontFamily:"monospace",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <button onClick={addTrade} style={{width:"100%",background:"linear-gradient(135deg,#F59E0B,#D97706)",border:"none",borderRadius:10,padding:"11px",fontSize:14,fontWeight:800,color:"#000",cursor:"pointer",marginBottom:16}}>+ Agregar OperaciÃ³n</button>
        {/* Historial */}
        <div style={{maxHeight:240,overflowY:"auto"}}>
          {[...trades].reverse().map(tr=>(
            <div key={tr.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,marginBottom:4,background:tr.result==="win"?"rgba(0,229,143,0.06)":"rgba(255,77,106,0.06)",border:`1px solid ${tr.result==="win"?"rgba(0,229,143,0.12)":"rgba(255,77,106,0.12)"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11}}>{tr.result==="win"?"â":"â"}</span>
                <span style={{fontWeight:700,color:"#F1F5F9",fontSize:13,fontFamily:"monospace"}}>{tr.ticker}</span>
                <span style={{fontSize:10,color:"#64748B"}}>{tr.date}</span>
              </div>
              <span style={{fontWeight:800,fontFamily:"monospace",fontSize:13,color:tr.result==="win"?"#00E58F":"#FF4D6A"}}>{parseFloat(tr.pnl)>=0?"+":""}{parseFloat(tr.pnl).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
        <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:20}}>ð EstadÃ­sticas</h3>
        {stats ? (<>
          {/* Racha actual */}
          <div style={{textAlign:"center",marginBottom:20,padding:"16px",background:stats.curStreak>0?"rgba(0,229,143,0.07)":"rgba(255,77,106,0.07)",borderRadius:14}}>
            <div style={{fontSize:11,color:"#64748B",fontWeight:700,marginBottom:4,letterSpacing:1}}>RACHA ACTUAL</div>
            <div style={{fontSize:44,fontWeight:900,color:stats.curStreak>0?"#00E58F":"#FF4D6A"}}>{stats.curStreak>0?"ð¥":"ð"} {stats.curStreak}</div>
            <div style={{fontSize:12,color:"#64748B"}}>Mejor racha: {stats.bestStreak} operaciones consecutivas</div>
          </div>
          {/* Stats grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {label:"Win Rate",val:`${stats.winRate.toFixed(1)}%`,color:stats.winRate>=50?"#00E58F":"#FF4D6A"},
              {label:"Total P&L",val:`${stats.totalPnl>=0?"+":""}$${stats.totalPnl.toFixed(0)}`,color:stats.totalPnl>=0?"#00E58F":"#FF4D6A"},
              {label:"Operaciones",val:`${stats.wins}W / ${stats.losses}L`,color:"#F1F5F9"},
              {label:"Profit Factor",val:stats.profitFactor===Infinity?"â":stats.profitFactor.toFixed(2),color:stats.profitFactor>=1.5?"#00E58F":stats.profitFactor>=1?"#F59E0B":"#FF4D6A"},
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
            <div style={{fontSize:36,marginBottom:12}}>ð¥</div>
            <div style={{fontSize:13}}>Agrega operaciones para ver tus estadÃ­sticas</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ââ HERRAMIENTA 4: EVOLUCIÃN DEL PORTAFOLIO âââââââââââââââââââââââââââââââââââ
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
      <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:4}}>ð EvoluciÃ³n de tu Portafolio</h3>
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

// ââ HERRAMIENTA 5: ALERTAS DE PRECIO âââââââââââââââââââââââââââââââââââââââââ
function PriceAlerts(){
  const [alerts,setAlerts]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexotrade-alerts")||"[]");}catch(e){return[];}});
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
    return triggered?{text:"ð ACTIVADA",color:"#F59E0B"}:{text:"En espera",color:"#64748B"};
  };

  return(
    <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
      <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:8}}>ð Alertas de Precio Personalizadas</h3>
      <p style={{color:"#64748B",fontSize:12,marginBottom:20}}>Recibe una alerta visual cuando una acciÃ³n llegue a tu precio objetivo.</p>
      {/* Form */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:24,padding:"16px",background:"rgba(255,255,255,0.02)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{flex:"1 1 100px"}}>
          <label style={{display:"block",fontSize:10,color:"#64748B",fontWeight:700,marginBottom:4}}>TICKER</label>
          <input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} placeholder="AAPL"
            style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:14,fontFamily:"monospace",fontWeight:700,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{flex:"1 1 80px"}}>
          <label style={{display:"block",fontSize:10,color:"#64748B",fontWeight:700,marginBottom:4}}>CONDICIÃN</label>
          <select value={cond} onChange={e=>setCond(e.target.value)}
            style={{width:"100%",background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#F1F5F9",fontSize:13,fontWeight:700,outline:"none",boxSizing:"border-box"}}>
            <option value="above">ð Sube de</option>
            <option value="below">ð Baja de</option>
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
          <div style={{fontSize:32,marginBottom:8}}>ð</div>
          <div style={{fontSize:13}}>No tienes alertas configuradas</div>
        </div>
      ):(
        alerts.map(a=>{
          const status=getStatus(a);
          const cur=prices[a.ticker]?.price;
          return(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:12,marginBottom:8,background:status.text.includes("ACTIVADA")?"rgba(245,158,11,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${status.text.includes("ACTIVADA")?"rgba(245,158,11,0.25)":"rgba(255,255,255,0.06)"}`}}>
              <div style={{width:40,height:40,borderRadius:10,background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{a.cond==="above"?"ð":"ð"}</div>
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

// ââ HERRAMIENTA 6: EXPORTAR DATOS ââââââââââââââââââââââââââââââââââââââââââââ
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
    {title:"ð Todos los Posts del Feed",desc:`${posts.length} posts del feed principal`,fn:exportPosts,color:"#00A8FF"},
    {title:"âï¸ Mis Posts",desc:`Solo tus publicaciones en NexoTrade`,fn:exportMisPosts,color:"#00E58F"},
    {title:"ð Plantilla de Trading Journal",desc:"Hoja Excel preformateada para registrar tus operaciones",fn:()=>{
      const template=[{Fecha:"",Ticker:"",Entrada:"",SL:"",TP:"",Resultado:"",PnL:"",RR:"",Notas:""}];
      downloadCSV(template,"nexotrade-trading-journal-template.csv");
    },color:"#F59E0B"},
  ];

  return(
    <div style={{background:"rgba(10,16,30,0.98)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"24px"}}>
      <h3 style={{color:"#F1F5F9",fontWeight:800,fontSize:16,marginBottom:8}}>ð¤ Exportar Datos</h3>
      <p style={{color:"#64748B",fontSize:12,marginBottom:24}}>Descarga tus datos en formato CSV compatible con Excel, Google Sheets y cualquier herramienta de anÃ¡lisis.</p>
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
              â¬ Descargar CSV
            </button>
          </div>
        ))}
      </div>
      <div style={{marginTop:20,padding:"14px 16px",background:"rgba(0,168,255,0.05)",borderRadius:10,border:"1px solid rgba(0,168,255,0.1)",fontSize:12,color:"#64748B",lineHeight:1.7}}>
        ð¡ <strong style={{color:"#00A8FF"}}>CÃ³mo usar en Excel:</strong> Abre Excel â Archivo â Importar â selecciona el CSV â codificaciÃ³n UTF-8 â delimitado por comas. Listo.
      </div>
    </div>
  );
}


// ââ ACCIONES VIP PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function AdminPicksModal({onClose}){
  const categorias=["corto","largo","dividendos","crypto"];
  const [cat,setCat]=useState("corto");
  const [form,setForm]=useState({ticker:"",nombre:"",tipo:"COMPRA",entrada:"",target:"",stop_loss:"",confianza:80,razon:"",yield_div:"",sector:"",rating:"âââââ"});
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
    setForm({ticker:"",nombre:"",tipo:"COMPRA",entrada:"",target:"",stop_loss:"",confianza:80,razon:"",yield_div:"",sector:"",rating:"âââââ"});
  };

  const clearWeek=async()=>{
    if(!window.confirm("Â¿Borrar todos los picks de esta semana?")) return;
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
            <div style={{fontWeight:900,color:"#F1F5F9",fontSize:18}}>ð ï¸ Admin â Picks Semanales</div>
            <div style={{fontSize:11,color:"#64748B",marginTop:2}}>Solo visible para administradores</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"6px 12px",color:"#94A3B8",cursor:"pointer",fontSize:13}}>â Cerrar</button>
        </div>

        {/* CategorÃ­a */}
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {categorias.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{background:cat===c?"rgba(0,168,255,0.2)":"transparent",border:`1px solid ${cat===c?"#00A8FF":"rgba(255,255,255,0.1)"}`,borderRadius:8,padding:"6px 14px",color:cat===c?"#00A8FF":"#64748B",cursor:"pointer",fontSize:12,fontWeight:700,textTransform:"capitalize"}}>
              {c==="corto"?"â¡ Corto":c==="largo"?"ð¦ Largo":c==="dividendos"?"ð° Dividendos":"â¿ Crypto"}
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
                <option value="COMPRA">ð COMPRA</option><option value="VENTA">ð VENTA</option>
              </select>
            </div>
            <div><label style={lbl}>Entrada</label><input style={inp} value={form.entrada} onChange={e=>setForm(f=>({...f,entrada:e.target.value}))} placeholder="$190"/></div>
            <div><label style={lbl}>Confianza %</label><input style={inp} type="number" min="1" max="100" value={form.confianza} onChange={e=>setForm(f=>({...f,confianza:parseInt(e.target.value)||80}))}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={lbl}>Target</label><input style={inp} value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder="$220"/></div>
            <div><label style={lbl}>Stop Loss</label><input style={inp} value={form.stop_loss} onChange={e=>setForm(f=>({...f,stop_loss:e.target.value}))} placeholder="$175"/></div>
          </div>
          <div style={{marginBottom:16}}><label style={lbl}>Razonamiento</label><textarea style={{...inp,resize:"vertical",minHeight:60}} value={form.razon} onChange={e=>setForm(f=>({...f,razon:e.target.value}))} placeholder="Â¿Por quÃ© este pick esta semana?"/></div>
        </> : <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
            <div><label style={lbl}>Precio</label><input style={inp} value={form.entrada} onChange={e=>setForm(f=>({...f,entrada:e.target.value}))} placeholder="$152"/></div>
            <div><label style={lbl}>Yield anual</label><input style={inp} value={form.yield_div} onChange={e=>setForm(f=>({...f,yield_div:e.target.value}))} placeholder="3.2%"/></div>
            <div><label style={lbl}>Sector</label><input style={inp} value={form.sector} onChange={e=>setForm(f=>({...f,sector:e.target.value}))} placeholder="Salud"/></div>
          </div>
          <div style={{marginBottom:16}}><label style={lbl}>Rating</label>
            <select style={{...inp}} value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))}>
              {["âââââ","âââââ","âââââ","âââââ","âââââ"].map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </>}

        <div style={{display:"flex",gap:10}}>
          <button onClick={save} disabled={saving} style={{flex:1,background:ok?"#00D26A":"linear-gradient(135deg,#00A8FF,#0090D4)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer"}}>
            {saving?"Guardando...":ok?"â Guardado!":"+ Agregar Pick"}
          </button>
          <button onClick={clearWeek} style={{background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.3)",borderRadius:10,padding:"12px 16px",color:"#FF4D6A",fontSize:13,fontWeight:700,cursor:"pointer"}}>ðï¸ Limpiar semana</button>
        </div>
      </div>
    </div>
  );
}

function AccionesVIPPage({isPremium, onNeedPremium, isAdmin}){
  const [picks,setPicks]=useState(null);
  const [showAdmin,setShowAdmin]=useState(false);
  const [livePrices,setLivePrices]=useState({});
  const semana = new Date().toLocaleDateString("es",{day:"numeric",month:"long",year:"numeric"});

  // Picks semana 26 mayo 2026 â fuente: Wall Street analysts (TipRanks, CNBC, Motley Fool)
  const FALLBACK = {
    corto:[
      {ticker:"NVDA", nombre:"NVIDIA",        tipo:"COMPRA", entrada:"$131", target:"$165", stop_loss:"$118", confianza:92, razon:"ReportÃ³ $81.6B ingresos (+85% YoY) + buyback $80B. Analistas target $295â$303. Momentum IA imparable."},
      {ticker:"MU",   nombre:"Micron Tech",   tipo:"COMPRA", entrada:"$118", target:"$145", stop_loss:"$108", confianza:87, razon:"Q1 FY2026 superior a expectativas. Memoria HBM para IA en mÃ¡xima demanda. Strong Buy consensus."},
      {ticker:"CRWD", nombre:"CrowdStrike",   tipo:"COMPRA", entrada:"$412", target:"$470", stop_loss:"$385", confianza:84, razon:"+$5B ARR, margen bruto 80%. Mercado de ciberseguridad crece a $325B hacia 2030."},
    ],
    largo:[
      {ticker:"MSFT", nombre:"Microsoft",     tipo:"COMPRA", entrada:"$448", target:"$650", stop_loss:"$415", confianza:89, razon:"Morgan Stanley reiterÃ³ Buy, target $650. Copilot AI integrado en toda la suite. Azure creciendo doble dÃ­gito."},
      {ticker:"AMZN", nombre:"Amazon",        tipo:"COMPRA", entrada:"$226", target:"$280", stop_loss:"$205", confianza:86, razon:"RBC Capital: mejor visibilidad en ROI de IA. AWS + publicidad digital acelerando. PosiciÃ³n dominante."},
      {ticker:"ISRG", nombre:"Intuitive Surgical", tipo:"COMPRA", entrada:"$572", target:"$680", stop_loss:"$530", confianza:83, razon:"Ingresos Q1 2026 +23% YoY. 80% market share global en robÃ³tica quirÃºrgica. Moat insuperable."},
      {ticker:"AVAV", nombre:"AeroVironment", tipo:"COMPRA", entrada:"$248", target:"$310", stop_loss:"$225", confianza:80, razon:"Drones militares tÃ¡ticos con demanda disparada. Gasto global en defensa al alza. Backlog robusto."},
    ],
    dividendos:[
      {ticker:"SM",  nombre:"SM Energy",  yield_div:"2.8%", entrada:"$28",  sector:"EnergÃ­a",  rating:"âââââ"},
      {ticker:"MBLY",nombre:"Mobileye",   yield_div:"â",    entrada:"$14",  sector:"Auto/Tech", rating:"âââââ"},
    ],
    crypto:[
      {ticker:"BTC", nombre:"Bitcoin",  tipo:"COMPRA", entrada:"$95,000", target:"$120,000", stop_loss:"$86,000", confianza:78, razon:"Flujos ETF institucionales positivos. 48% de probabilidad de tocar $120K segÃºn Polymarket. Soporte fuerte."},
      {ticker:"ETH", nombre:"Ethereum", tipo:"COMPRA", entrada:"$2,100",  target:"$2,800",   stop_loss:"$1,850",  confianza:72, razon:"Ratio ETH/BTC en mÃ­nimos histÃ³ricos. Upgrade de staking activo. Accumulation zone tÃ©cnica clara."},
    ],
  };

  useEffect(()=>{
    const loadPicks=async()=>{
      // Buscar los picks mÃ¡s recientes por semana (sin filtrar por activo para evitar errores de columna)
      const {data,error}=await supabase.from("weekly_picks").select("*").order("semana",{ascending:false}).order("id").limit(40);
      if(!error && data && data.length>0){
        const grouped={corto:[],largo:[],dividendos:[],crypto:[]};
        data.forEach(p=>{ if(grouped[p.categoria]) grouped[p.categoria].push(p); });
        // Solo usar si hay al menos algÃºn pick en alguna categorÃ­a
        if(Object.values(grouped).some(arr=>arr.length>0)){
          setPicks(grouped);
          return;
        }
      }
      // Si Supabase falla o estÃ¡ vacÃ­o â usar FALLBACK
      setPicks(FALLBACK);
    };
    loadPicks();
  },[showAdmin]);

  // Fetch precios en tiempo real de Finnhub para todos los tickers de picks
  useEffect(()=>{
    if(!picks) return;
    const tickers=[...new Set([
      ...(picks.corto||[]).map(p=>p.ticker),
      ...(picks.largo||[]).map(p=>p.ticker),
      ...(picks.crypto||[]).map(p=>p.ticker),
    ].filter(t=>!["BTC","ETH","SOL","BNB"].includes(t)))]; // solo stocks, no crypto
    if(!tickers.length) return;
    Promise.all(tickers.map(async t=>{
      try{
        const r=await fetch(`https://finnhub.io/api/v1/quote?symbol=${t}&token=${FINNHUB_KEY}`);
        const d=await r.json();
        if(d.c>0) return {ticker:t,price:d.c,change:d.dp||0};
      }catch(e){}
      return null;
    })).then(results=>{
      const map={};
      results.filter(Boolean).forEach(r=>{map[r.ticker]={price:r.price,change:r.change};});
      setLivePrices(map);
    });
  },[picks]);

  const data = picks;
  const C2={bull:"#00D26A",bear:"#FF4D6A",card:"rgba(10,16,30,0.98)",border:"rgba(255,255,255,0.08)"};

  if(!isPremium) return(
    <div style={{textAlign:"center",padding:"60px 20px",maxWidth:480,margin:"0 auto"}}>
      <div style={{fontSize:56,marginBottom:16}}>ð</div>
      <h2 style={{color:"#F1F5F9",fontWeight:900,fontSize:24,marginBottom:8}}>Acciones VIP Semanales</h2>
      <p style={{color:"#64748B",fontSize:15,lineHeight:1.7,marginBottom:28}}>
        Cada semana nuestro equipo selecciona <strong style={{color:"#F1F5F9"}}>10 acciones</strong> con mayor potencial â corto plazo, largo plazo, dividendos y crypto.
      </p>
      <div style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:16,padding:"20px 24px",marginBottom:28,textAlign:"left"}}>
        {["â¡ Top 3 corto plazo con entrada y stop loss","ð¦ Top 3 largo plazo con anÃ¡lisis fundamental","ð° Top 2 dividendos con yield y rating","â¿ Top 2 crypto con anÃ¡lisis tÃ©cnico"].map(f=>(
          <div key={f} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <span style={{fontSize:14}}>{f.split(" ")[0]}</span>
            <span style={{fontSize:13,color:"#CBD5E1"}}>{f.slice(f.indexOf(" ")+1)}</span>
          </div>
        ))}
      </div>
      <button onClick={onNeedPremium} style={{background:"linear-gradient(135deg,#7C3AED,#9333EA)",border:"none",borderRadius:12,padding:"14px 36px",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 0 24px rgba(124,58,237,0.4)"}}>
        â¦ Hazte VIP â $9.99/mes
      </button>
    </div>
  );

  const THEMES=[
    {from:"#8B5CF6",to:"#6D28D9",glow:"#8B5CF6"},
    {from:"#06B6D4",to:"#0891B2",glow:"#06B6D4"},
    {from:"#10B981",to:"#059669",glow:"#10B981"},
    {from:"#F59E0B",to:"#D97706",glow:"#F59E0B"},
    {from:"#EF4444",to:"#DC2626",glow:"#EF4444"},
    {from:"#EC4899",to:"#DB2777",glow:"#EC4899"},
    {from:"#3B82F6",to:"#2563EB",glow:"#3B82F6"},
    {from:"#14B8A6",to:"#0D9488",glow:"#14B8A6"},
  ];

  const SectionTitle=({icon,title,sub,color="#8B5CF6"})=>(
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${color}30,${color}10)`,border:`1px solid ${color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
      <div>
        <div style={{fontWeight:800,color:"#F1F5F9",fontSize:15,letterSpacing:-0.3}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:"#475569",marginTop:1}}>{sub}</div>}
      </div>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${color}30,transparent)`,marginLeft:8}}/>
    </div>
  );

  const fmtPrice = v => {
    if(v==null||v==="") return "â";
    if(typeof v === "string" && v.startsWith("$")) return v;
    const n = parseFloat(v);
    if(isNaN(n)) return v;
    return "$"+n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2});
  };

  const PickCard=({p,idx})=>{
    const bull=p.tipo==="COMPRA";
    const th=THEMES[idx%THEMES.length];
    const conf=p.confianza||0;
    const circ=Math.PI*2*22;
    const entry=parseFloat(p.entrada)||0;
    const target=parseFloat(p.target)||0;
    const stop=parseFloat(p.stop_loss)||0;
    const gain=entry>0&&target>0?((target-entry)/entry*100).toFixed(1):null;
    const risk=entry>0&&stop>0?((entry-stop)/entry*100).toFixed(1):null;
    const rr=gain&&risk&&risk>0?(gain/risk).toFixed(1):null;
    const live=livePrices[p.ticker];
    const liveChg=live?.change||0;
    const liveIsPos=liveChg>=0;
    return(
      <div style={{position:"relative",borderRadius:20,marginBottom:14,overflow:"hidden",background:"linear-gradient(145deg,rgba(15,23,42,0.98),rgba(20,30,50,0.95))",boxShadow:`0 4px 24px rgba(0,0,0,0.4),0 0 0 1px ${th.from}25,inset 0 1px 0 rgba(255,255,255,0.04)`}}>
        {/* top gradient bar */}
        <div style={{height:2,background:`linear-gradient(90deg,${th.from},${th.to},transparent)`}}/>
        {/* glow orb */}
        <div style={{position:"absolute",top:-30,right:-30,width:130,height:130,background:`radial-gradient(circle,${th.from}22 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-20,left:0,width:80,height:80,background:`radial-gradient(circle,${bull?"#00D26A":"#FF4D6A"}12 0%,transparent 70%)`,pointerEvents:"none"}}/>

        <div style={{padding:"18px 20px"}}>
          {/* Row 1: ticker + direction + confidence ring */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontFamily:"monospace",fontWeight:900,fontSize:26,background:`linear-gradient(135deg,${th.from},${th.to})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:`drop-shadow(0 0 10px ${th.from}50)`}}>{p.ticker}</span>
                <span style={{background:bull?"rgba(0,210,106,0.12)":"rgba(255,77,106,0.12)",color:bull?"#00D26A":"#FF4D6A",border:`1px solid ${bull?"#00D26A44":"#FF4D6A44"}`,borderRadius:8,padding:"3px 10px",fontSize:11,fontWeight:800,letterSpacing:0.5}}>{bull?"â² COMPRA":"â¼ VENTA"}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div style={{fontSize:12,color:"#475569",fontWeight:500}}>{p.nombre}</div>
                {live&&<div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"2px 8px"}}>
                  <span style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:0.5}}>PRECIO HOY</span>
                  <span style={{fontFamily:"monospace",fontWeight:800,color:"#F1F5F9",fontSize:13}}>${live.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
                  <span style={{fontSize:11,fontWeight:700,color:liveIsPos?"#00D26A":"#FF4D6A"}}>{liveIsPos?"+":""}{liveChg.toFixed(2)}%</span>
                </div>}
              </div>
            </div>
            {/* SVG confidence ring */}
            <div style={{position:"relative",width:54,height:54,flexShrink:0}}>
              <svg width="54" height="54" viewBox="0 0 54 54" style={{transform:"rotate(-90deg)"}}>
                <circle cx="27" cy="27" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4"/>
                <circle cx="27" cy="27" r="22" fill="none" stroke={`url(#cg${idx})`} strokeWidth="4"
                  strokeDasharray={`${(conf/100)*circ} ${circ}`} strokeLinecap="round"/>
                <defs>
                  <linearGradient id={`cg${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={th.from}/><stop offset="100%" stopColor={th.to}/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontWeight:900,fontSize:13,color:"#F1F5F9",lineHeight:1}}>{conf}</div>
                <div style={{fontSize:7,color:"#475569",fontWeight:700,letterSpacing:0.3}}>CONF%</div>
              </div>
            </div>
          </div>

          {/* Row 2: prices */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
            {[["ð¥","Entrada",fmtPrice(p.entrada),"#64748B"],["ð¯","Target",fmtPrice(p.target),"#00D26A"],["ð","Stop",fmtPrice(p.stop_loss),"#FF4D6A"]].map(([ico,lbl,val,col])=>(
              <div key={lbl} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:14,marginBottom:2}}>{ico}</div>
                <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",marginBottom:4}}>{lbl}</div>
                <div style={{fontFamily:"monospace",fontWeight:800,color:col,fontSize:14}}>{val}</div>
              </div>
            ))}
          </div>

          {/* Row 3: R:R badge + analysis */}
          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
            {rr&&<div style={{flexShrink:0,background:`linear-gradient(135deg,${th.from}20,${th.to}10)`,border:`1px solid ${th.from}40`,borderRadius:8,padding:"4px 8px",fontSize:10,fontWeight:800,color:th.from,whiteSpace:"nowrap"}}>R:R {rr}x</div>}
            <div style={{fontSize:12,color:"#64748B",lineHeight:1.6,flex:1}}>ð¡ {p.razon}</div>
          </div>
        </div>
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

      {/* Header premium */}
      <div style={{position:"relative",borderRadius:22,padding:"22px 24px",marginBottom:20,overflow:"hidden",background:"linear-gradient(135deg,rgba(10,14,26,0.98),rgba(20,26,46,0.95))",border:"1px solid rgba(139,92,246,0.25)",boxShadow:"0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.05)"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:180,height:180,background:"radial-gradient(circle,rgba(139,92,246,0.18) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-30,left:-20,width:120,height:120,background:"radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <span style={{background:"linear-gradient(135deg,rgba(139,92,246,0.3),rgba(109,40,217,0.2))",color:"#A78BFA",border:"1px solid rgba(139,92,246,0.4)",borderRadius:20,padding:"3px 12px",fontSize:10,fontWeight:800,letterSpacing:1}}>â¦ EXCLUSIVO VIP</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(0,210,106,0.1)",border:"1px solid rgba(0,210,106,0.25)",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700,color:"#00D26A"}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:"#00D26A",display:"inline-block",animation:"pulse 2s infinite"}}/>EN VIVO
              </span>
            </div>
            <h2 style={{color:"#F1F5F9",fontWeight:900,fontSize:22,margin:"0 0 3px",letterSpacing:-0.5}}>ð§  Picks IA Â· Semana {new Date().toLocaleDateString("es",{day:"numeric",month:"short"})}</h2>
            <div style={{fontSize:11,color:"#475569"}}>SelecciÃ³n algorÃ­tmica + anÃ¡lisis fundamental Â· Wall Street consensus</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <div style={{textAlign:"center",background:"linear-gradient(135deg,rgba(139,92,246,0.15),rgba(109,40,217,0.1))",border:"1px solid rgba(139,92,246,0.25)",borderRadius:14,padding:"10px 18px"}}>
              <div style={{fontWeight:900,background:"linear-gradient(135deg,#A78BFA,#7C3AED)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:32,lineHeight:1}}>{(data?.corto?.length||0)+(data?.largo?.length||0)+(data?.crypto?.length||0)+(data?.dividendos?.length||0)}</div>
              <div style={{fontSize:9,color:"#475569",fontWeight:700,letterSpacing:0.8}}>PICKS</div>
            </div>
            {isAdmin && <button onClick={()=>setShowAdmin(true)} style={{background:"rgba(0,168,255,0.12)",border:"1px solid rgba(0,168,255,0.25)",borderRadius:8,padding:"6px 12px",color:"#38BDF8",fontSize:11,fontWeight:700,cursor:"pointer"}}>âï¸ Admin</button>}
          </div>
        </div>
      </div>

      {!data ? (
        /* ââ Estado vacÃ­o: no hay picks publicados aÃºn ââ */
        <div style={{textAlign:"center",padding:"48px 20px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,marginBottom:16}}>
          <div style={{fontSize:48,marginBottom:16}}>ð</div>
          <div style={{fontWeight:800,color:"#F1F5F9",fontSize:18,marginBottom:8}}>Picks en preparaciÃ³n</div>
          <div style={{color:"#64748B",fontSize:14,lineHeight:1.7,maxWidth:340,margin:"0 auto 20px"}}>
            Nuestro equipo estÃ¡ analizando el mercado esta semana.<br/>
            <strong style={{color:"#A78BFA"}}>Los picks se publican cada lunes a las 9AM</strong> (hora EST).
          </div>
          <div style={{background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:12,padding:"12px 20px",display:"inline-block"}}>
            <div style={{fontSize:12,color:"#A78BFA",fontWeight:700}}>PrÃ³xima publicaciÃ³n</div>
            <div style={{fontSize:16,color:"#F1F5F9",fontWeight:900,marginTop:4}}>
              {(()=>{const d=new Date();const day=d.getDay();const diff=day===0?1:8-day;d.setDate(d.getDate()+diff);return d.toLocaleDateString("es",{weekday:"long",day:"numeric",month:"long"});})()}
            </div>
          </div>
        </div>
      ) : (
      <>
      <div style={{background:"rgba(255,255,255,0.01)",border:"1px solid rgba(139,92,246,0.12)",borderRadius:20,padding:"20px",marginBottom:16}}>
        <SectionTitle icon="â¡" title="Corto Plazo" sub="Horizonte 1-4 semanas Â· Momentum y tÃ©cnico" color="#8B5CF6"/>
        {data.corto.map((p,i)=><PickCard key={p.ticker} p={p} idx={i}/>)}
      </div>
      <div style={{background:"rgba(255,255,255,0.01)",border:"1px solid rgba(6,182,212,0.12)",borderRadius:20,padding:"20px",marginBottom:16}}>
        <SectionTitle icon="ð¦" title="Largo Plazo" sub="Horizonte 6-18 meses Â· Valor y fundamentales" color="#06B6D4"/>
        {data.largo.map((p,i)=><PickCard key={p.ticker} p={p} idx={i+3}/>)}
      </div>
      <div style={{background:"rgba(255,255,255,0.01)",border:"1px solid rgba(245,158,11,0.12)",borderRadius:20,padding:"20px",marginBottom:16}}>
        <SectionTitle icon="ð°" title="Dividendos" sub="Ingresos pasivos Â· Alta rentabilidad por dividendo" color="#F59E0B"/>
        {data.dividendos.map(p=><DivCard key={p.ticker} p={p}/>)}
      </div>
      <div style={{background:"rgba(255,255,255,0.01)",border:"1px solid rgba(247,147,26,0.12)",borderRadius:20,padding:"20px",marginBottom:16}}>
        <SectionTitle icon="â¿" title="Crypto" sub="Alta volatilidad Â· Solo con capital que puedas perder" color="#F7931A"/>
        {data.crypto.map((p,i)=><PickCard key={p.ticker} p={p} idx={i+7}/>)}
      </div>
      </>
      )}

      <div style={{background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.15)",borderRadius:12,padding:"14px 18px",fontSize:11,color:"#94A3B8",lineHeight:1.7}}>
        â ï¸ <strong style={{color:"#F59E0B"}}>Disclaimer:</strong> Estos picks son anÃ¡lisis educativo y no constituyen consejo financiero. Siempre haz tu propia investigaciÃ³n (DYOR). Las inversiones conllevan riesgo de pÃ©rdida de capital.
      </div>
    </div>
  );
}

// ââ NAV TABS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   ACADEMIA PAGE â cursos grabados con pago Ãºnico via Stripe
âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
const CURSOS = [
  {
    id:"c1", titulo:"AnÃ¡lisis TÃ©cnico desde Cero", emoji:"ð",
    instructor:"SPY_Trader", nivel:"Principiante", duracion:"6 horas",
    lecciones:24, precio:49, precioVip:29,
    stripeLink:STRIPE_LINKS.curso1,
    tags:["GrÃ¡ficas","Velas","Soportes","Tendencias"],
    desc:"El curso mÃ¡s completo de anÃ¡lisis tÃ©cnico en espaÃ±ol. Desde cÃ³mo leer una vela japonesa hasta estrategias completas de entrada y salida.",
    temario:["IntroducciÃ³n a los mercados financieros","Tipos de grÃ¡ficas y timeframes","Velas japonesas: los 15 patrones clave","Soportes, resistencias y zonas de volumen","Tendencias e indicadores (RSI, MACD, BB)","Tu primera estrategia completa"],
    rating:4.9, reviews:147, emoji2:"ð", bestseller:true,
  },
  {
    id:"c2", titulo:"Crypto Trading: GuÃ­a Completa", emoji:"â¿",
    instructor:"CryptoWolf", nivel:"Intermedio", duracion:"8 horas",
    lecciones:32, precio:79, precioVip:49,
    stripeLink:STRIPE_LINKS.curso2,
    tags:["Bitcoin","Ethereum","DeFi","Altcoins"],
    desc:"Todo lo que necesitas para operar crypto de forma profesional: anÃ¡lisis on-chain, ciclos de mercado, gestiÃ³n de riesgo y los mejores exchanges.",
    temario:["Bitcoin y blockchain explicado","Ciclos de mercado y halvings","AnÃ¡lisis on-chain: MVRV, NVT, Hodl Waves","Altcoins: cÃ³mo filtrar proyectos sÃ³lidos","DeFi: yield farming y staking seguro","GestiÃ³n de riesgo y portfolio crypto"],
    rating:4.8, reviews:89, emoji2:"ð¥", bestseller:false,
  },
  {
    id:"c3", titulo:"Opciones para Traders Activos", emoji:"ð¡ï¸",
    instructor:"SPY_Trader", nivel:"Avanzado", duracion:"10 horas",
    lecciones:40, precio:99, precioVip:59,
    stripeLink:STRIPE_LINKS.curso3,
    tags:["Options","Calls","Puts","Greeks"],
    desc:"Domina el mercado de opciones: desde los conceptos bÃ¡sicos de calls y puts hasta estrategias avanzadas como iron condors y calendar spreads.",
    temario:["QuÃ© son las opciones y cÃ³mo funcionan","Las griegas: Delta, Gamma, Theta, Vega","Estrategias bÃ¡sicas: calls cubiertos y puts protectoras","Iron Condor y mariposas","Operando earnings con opciones","GestiÃ³n de posiciones: cuÃ¡ndo salir"],
    rating:4.9, reviews:62, emoji2:"â¡", bestseller:false,
  },
  {
    id:"c4", titulo:"InversiÃ³n en Dividendos â Renta Pasiva", emoji:"ð°",
    instructor:"NvidiaChad", nivel:"Principiante", duracion:"4 horas",
    lecciones:16, precio:39, precioVip:19,
    stripeLink:STRIPE_LINKS.curso4,
    tags:["Dividendos","REITs","ETFs","Portafolio"],
    desc:"Construye un portafolio de dividendos que genere ingresos mes a mes. Las mejores acciones, ETFs y REITs para renta pasiva en 2025.",
    temario:["Por quÃ© los dividendos son el activo mÃ¡s poderoso","CÃ³mo evaluar una empresa pagadora de dividendos","Los mejores ETFs de dividendos (SCHD, VYM, JEPI)","REITs: inmobiliario desde $10","Portafolio modelo: $500/mes pasivos","Errores mÃ¡s comunes de los inversores de dividendos"],
    rating:4.7, reviews:203, emoji2:"ð", bestseller:true,
  },
];

function AcademiaPage({user, isPremium, onNeedAuth, onGoVip}){
  const [filtro, setFiltro] = useState("todos");
  const [expanded, setExpanded] = useState(null);

  const niveles = ["todos","Principiante","Intermedio","Avanzado"];
  const filtered = filtro==="todos" ? CURSOS : CURSOS.filter(c=>c.nivel===filtro);

  const handleBuy = (c) => {
    if(!user){ onNeedAuth(); return; }
    const link = c.stripeLink + (user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : "");
    window.open(link, "_blank");
  };

  return(
    <div style={{maxWidth:860,margin:"0 auto",padding:"0 4px"}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)",borderRadius:20,padding:"36px 28px",marginBottom:24,textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 25% 50%,#f59e0b10,transparent 55%),radial-gradient(circle at 75% 50%,#10b98115,transparent 55%)",pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:44,marginBottom:10}}>ð</div>
          <h1 style={{margin:"0 0 8px",color:"#fff",fontSize:26,fontWeight:900}}>Academia NexoTrade</h1>
          <p style={{margin:"0 0 20px",color:"#94a3b8",fontSize:14,maxWidth:480,marginLeft:"auto",marginRight:"auto"}}>Cursos grabados. Aprende a tu ritmo. Acceso de por vida.</p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {v:`${CURSOS.length} cursos`,l:"Disponibles"},
              {v:"Acceso de por vida",l:"Sin caducidad"},
              {v:"VIP 40% off",l:"Descuento miembros"},
            ].map((s,i)=>(
              <div key={i} style={{background:"#ffffff10",borderRadius:12,padding:"10px 18px",border:"1px solid #ffffff15"}}>
                <div style={{color:"#fff",fontWeight:800,fontSize:15}}>{s.v}</div>
                <div style={{color:"#64748b",fontSize:11}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VIP banner */}
      {!isPremium && <div style={{background:"linear-gradient(135deg,#4c1d9522,#1e40af22)",border:"1px solid #7C3AED44",borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:24}}>â¦</span>
        <div style={{flex:1,fontSize:13,color:"#a78bfa"}}><strong>VIP ($9.99/mes)</strong> â obtÃ©n hasta 40% de descuento en todos los cursos.</div>
        <button onClick={onGoVip} style={{background:"linear-gradient(135deg,#7C3AED,#4c1d95)",border:"none",borderRadius:10,padding:"8px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Ver VIP â</button>
      </div>}

      {/* Filtros */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {niveles.map(n=>(
          <button key={n} onClick={()=>setFiltro(n)}
            style={{padding:"6px 16px",borderRadius:20,border:"1px solid",fontSize:12,fontWeight:600,cursor:"pointer",
              borderColor:filtro===n?C.accent:C.border,
              background:filtro===n?C.accent+"22":"transparent",
              color:filtro===n?C.accent:C.muted}}>
            {n==="todos"?"ð¯ Todos":n==="Principiante"?"ð¢ "+n:n==="Intermedio"?"ð¡ "+n:"ð´ "+n}
          </button>
        ))}
      </div>

      {/* Course cards */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {filtered.map((c)=>{
          const nivelColor=c.nivel==="Avanzado"?"#ef4444":c.nivel==="Intermedio"?"#f59e0b":"#10b981";
          const isOpen = expanded===c.id;
          return(
            <div key={c.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,overflow:"hidden",boxShadow:C.shadow}}>
              <div style={{padding:"20px 22px",display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
                {/* icon */}
                <div style={{width:60,height:60,borderRadius:16,background:`linear-gradient(135deg,${C.accentDim},${C.blueBg})`,border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{c.emoji}</div>

                {/* body */}
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
                    {c.bestseller&&<span style={{background:"#f59e0b22",color:"#f59e0b",border:"1px solid #f59e0b44",borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:700}}>ð Bestseller</span>}
                    <span style={{background:nivelColor+"22",color:nivelColor,border:`1px solid ${nivelColor}44`,borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:700}}>{c.nivel}</span>
                  </div>
                  <h3 style={{margin:"0 0 6px",color:C.text,fontSize:15,fontWeight:800}}>{c.titulo}</h3>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
                    <span style={{color:C.muted,fontSize:12}}>ð¤ @{c.instructor}</span>
                    <span style={{color:C.muted,fontSize:12}}>â± {c.duracion}</span>
                    <span style={{color:C.muted,fontSize:12}}>ð {c.lecciones} lecciones</span>
                    <span style={{color:"#f59e0b",fontSize:12,fontWeight:600}}>â­ {c.rating} ({c.reviews} reviews)</span>
                  </div>
                  <p style={{margin:"0 0 10px",color:C.muted2,fontSize:12,lineHeight:1.6}}>{c.desc}</p>
                  {/* tags */}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                    {c.tags.map(t=><span key={t} style={{background:C.border,color:C.muted2,borderRadius:6,padding:"2px 8px",fontSize:11}}>{t}</span>)}
                  </div>
                  {/* toggle temario */}
                  <button onClick={()=>setExpanded(isOpen?null:c.id)}
                    style={{background:"transparent",border:"none",padding:0,color:C.accent,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    {isOpen?"â² Ocultar temario":"â¼ Ver temario"}
                  </button>
                </div>

                {/* price */}
                <div style={{flexShrink:0,textAlign:"center",minWidth:115}}>
                  {isPremium?(
                    <>
                      <div style={{fontSize:10,color:"#a78bfa",fontWeight:700,marginBottom:2}}>â¦ PRECIO VIP</div>
                      <div style={{fontSize:24,fontWeight:900,color:C.accent,lineHeight:1}}>${c.precioVip}</div>
                      <div style={{fontSize:12,color:C.muted2,textDecoration:"line-through",marginBottom:10}}>${c.precio}</div>
                    </>
                  ):(
                    <>
                      <div style={{fontSize:10,color:C.muted2,fontWeight:600,marginBottom:2}}>PRECIO ÃNICO</div>
                      <div style={{fontSize:24,fontWeight:900,color:C.text,lineHeight:1}}>${c.precio}</div>
                      <div style={{fontSize:10,color:"#a78bfa",marginBottom:10}}>VIP paga ${c.precioVip}</div>
                    </>
                  )}
                  <button onClick={()=>handleBuy(c)}
                    style={{background:isPremium?`linear-gradient(135deg,${C.accent},#00a87f)`:"linear-gradient(135deg,#1d4ed8,#7C3AED)",
                      border:"none",borderRadius:10,padding:"10px 0",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}}>
                    Comprar â
                  </button>
                  <div style={{fontSize:10,color:C.muted2,marginTop:6}}>ð Acceso de por vida</div>
                </div>
              </div>

              {/* Temario expandible */}
              {isOpen && (
                <div style={{borderTop:`1px solid ${C.border}`,padding:"16px 22px",background:C.bg}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.muted,marginBottom:10}}>TEMARIO DEL CURSO</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {c.temario.map((t,i)=>(
                      <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                        <div style={{width:22,height:22,borderRadius:6,background:`linear-gradient(135deg,${C.accent},#00a87f)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
                        <span style={{color:C.muted2,fontSize:13,lineHeight:1.5}}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{marginTop:28,background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:18,padding:"28px 24px",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:10}}>ð</div>
        <h3 style={{margin:"0 0 8px",color:"#fff",fontSize:17,fontWeight:800}}>Â¿Quieres enseÃ±ar en NexoTrade?</h3>
        <p style={{margin:"0 0 16px",color:"#64748b",fontSize:13}}>Si eres trader con experiencia, escrÃ­benos. TÃº enseÃ±as, nosotros ponemos la plataforma y los alumnos.</p>
        <a href="mailto:hola@nexotradeia.com?subject=Quiero ser instructor en NexoTrade" style={{display:"inline-block",background:`linear-gradient(135deg,${C.accent},#00a87f)`,borderRadius:10,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:700,textDecoration:"none"}}>Ser instructor â</a>
      </div>
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   WEBINARS PAGE â pÃ¡gina pÃºblica de webinars con compra Stripe
âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
const WEBINARS_LIST = [
  {titulo:"AnÃ¡lisis tÃ©cnico para principiantes", fecha:"Lun 2 Jun",  hora:"19:00 EST", instructor:"SPY_Trader",  spots:47, spotsLeft:12, emoji:"ð", precio:29, precioVip:14, stripeLink:STRIPE_LINKS.webinar1, nivel:"Principiante", duracion:"90 min", desc:"Aprende a leer grÃ¡ficas, identificar soportes, resistencias y los 5 patrones mÃ¡s rentables del mercado."},
  {titulo:"Bitcoin: ciclos y anÃ¡lisis on-chain",  fecha:"MiÃ© 4 Jun", hora:"20:00 EST", instructor:"CryptoWolf",  spots:50, spotsLeft:8,  emoji:"â¿",  precio:49, precioVip:24, stripeLink:STRIPE_LINKS.webinar2, nivel:"Intermedio",   duracion:"2 horas", desc:"CÃ³mo anticipar los ciclos de Bitcoin usando datos on-chain: MVRV, NVT, Hodl Waves y mÃ¡s."},
  {titulo:"CÃ³mo leer un earnings report",         fecha:"Vie 6 Jun", hora:"18:30 EST", instructor:"NvidiaChad",  spots:60, spotsLeft:23, emoji:"ð", precio:29, precioVip:14, stripeLink:STRIPE_LINKS.webinar3, nivel:"Principiante", duracion:"75 min", desc:"Todo lo que necesitas saber para operar earnings: EPS, revenue, guidance y cÃ³mo posicionarte."},
  {titulo:"Opciones: estrategias defensivas",     fecha:"Lun 9 Jun", hora:"19:00 EST", instructor:"SPY_Trader",  spots:35, spotsLeft:7,  emoji:"ð¡ï¸", precio:79, precioVip:39, stripeLink:STRIPE_LINKS.webinar4, nivel:"Avanzado",     duracion:"2.5 horas", desc:"Covered calls, protective puts y iron condors explicados paso a paso con ejemplos reales."},
  {titulo:"Cripto DeFi: yield farming y staking", fecha:"MiÃ© 11 Jun",hora:"20:00 EST", instructor:"CryptoWolf",  spots:40, spotsLeft:18, emoji:"ð¾", precio:49, precioVip:24, stripeLink:STRIPE_LINKS.webinar5, nivel:"Intermedio",   duracion:"2 horas", desc:"Genera ingresos pasivos con tus cryptos: los mejores protocolos DeFi, riesgos y cÃ³mo empezar."},
  {titulo:"Trading de dividendos â renta pasiva",  fecha:"Vie 13 Jun",hora:"18:30 EST", instructor:"NvidiaChad",  spots:55, spotsLeft:31, emoji:"ð°", precio:39, precioVip:19, stripeLink:STRIPE_LINKS.webinar6, nivel:"Principiante", duracion:"90 min", desc:"Construye un portafolio de dividendos que genere ingresos mensuales. Las mejores acciones para 2025."},
];

function WebinarsPage({user, isPremium, onNeedAuth, onGoVip}){
  const [filtroNivel, setFiltroNivel] = useState("todos");

  const niveles = ["todos","Principiante","Intermedio","Avanzado"];
  const filtered = filtroNivel==="todos" ? WEBINARS_LIST : WEBINARS_LIST.filter(w=>w.nivel===filtroNivel);

  const handleBuy = (w) => {
    if(!user){ onNeedAuth(); return; }
    const base = isPremium ? w.stripeLink : w.stripeLink;
    window.open(base + (user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : ""), "_blank");
  };

  return(
    <div style={{maxWidth:860,margin:"0 auto",padding:"0 4px"}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)",borderRadius:20,padding:"36px 28px",marginBottom:24,textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 30% 50%,#10b98115,transparent 60%),radial-gradient(circle at 70% 50%,#7C3AED15,transparent 60%)`,pointerEvents:"none"}}/>
        <div style={{position:"relative"}}>
          <div style={{fontSize:44,marginBottom:10}}>ð</div>
          <h1 style={{margin:"0 0 8px",color:"#fff",fontSize:26,fontWeight:900}}>Webinars de Trading en Vivo</h1>
          <p style={{margin:"0 0 20px",color:"#94a3b8",fontSize:14,maxWidth:500,marginLeft:"auto",marginRight:"auto"}}>Aprende de traders reales. Sesiones en vivo + grabaciÃ³n incluida. Plazas limitadas.</p>
          <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            <div style={{background:"#ffffff10",borderRadius:12,padding:"10px 20px",border:"1px solid #ffffff15"}}>
              <div style={{color:"#fff",fontWeight:800,fontSize:18}}>{WEBINARS_LIST.length}</div>
              <div style={{color:"#64748b",fontSize:11}}>Webinars este mes</div>
            </div>
            <div style={{background:"#ffffff10",borderRadius:12,padding:"10px 20px",border:"1px solid #ffffff15"}}>
              <div style={{color:"#10b981",fontWeight:800,fontSize:18}}>$29â$79</div>
              <div style={{color:"#64748b",fontSize:11}}>Precio por sesiÃ³n</div>
            </div>
            <div style={{background:"#7C3AED22",borderRadius:12,padding:"10px 20px",border:"1px solid #7C3AED44"}}>
              <div style={{color:"#a78bfa",fontWeight:800,fontSize:18}}>50% off</div>
              <div style={{color:"#64748b",fontSize:11}}>Descuento VIP</div>
            </div>
          </div>
        </div>
      </div>

      {/* VIP banner if not premium */}
      {!isPremium && (
        <div style={{background:"linear-gradient(135deg,#4c1d9522,#1e40af22)",border:"1px solid #7C3AED44",borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:24}}>â¦</span>
          <div style={{flex:1,fontSize:13,color:"#a78bfa"}}><strong>Hazte VIP ($9.99/mes)</strong> y obtÃ©n 50% de descuento en todos los webinars automÃ¡ticamente.</div>
          <button onClick={onGoVip} style={{background:"linear-gradient(135deg,#7C3AED,#4c1d95)",border:"none",borderRadius:10,padding:"8px 18px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Ver VIP â</button>
        </div>
      )}

      {/* Filtros */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {niveles.map(n=>(
          <button key={n} onClick={()=>setFiltroNivel(n)}
            style={{padding:"6px 16px",borderRadius:20,border:"1px solid",fontSize:12,fontWeight:600,cursor:"pointer",
              borderColor: filtroNivel===n ? C.accent : C.border,
              background: filtroNivel===n ? C.accent+"22" : "transparent",
              color: filtroNivel===n ? C.accent : C.muted}}>
            {n==="todos" ? "ð¯ Todos" : n==="Principiante" ? "ð¢ "+n : n==="Intermedio" ? "ð¡ "+n : "ð´ "+n}
          </button>
        ))}
      </div>

      {/* Webinar cards */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {filtered.map((w,i)=>{
          const isUrgent  = w.spotsLeft<=10;
          const isSoldOut = w.spotsLeft===0;
          const pct = Math.round((w.spotsLeft/w.spots)*100);
          const nivelColor = w.nivel==="Avanzado"?"#ef4444":w.nivel==="Intermedio"?"#f59e0b":"#10b981";
          return(
            <div key={i} style={{background:C.surface,border:`1px solid ${isUrgent&&!isSoldOut?"#ef444444":C.border}`,borderRadius:18,overflow:"hidden",boxShadow:C.shadow}}>
              {isUrgent&&!isSoldOut&&<div style={{height:3,background:"linear-gradient(90deg,#ef4444,#f59e0b)"}}/>}
              <div style={{padding:"20px 22px",display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
                {/* icon */}
                <div style={{width:56,height:56,borderRadius:14,background:`linear-gradient(135deg,${C.accentDim},${C.blueBg})`,border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{w.emoji}</div>

                {/* body */}
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
                    <h3 style={{margin:0,color:C.text,fontSize:15,fontWeight:800}}>{w.titulo}</h3>
                    <span style={{background:nivelColor+"22",color:nivelColor,border:`1px solid ${nivelColor}44`,borderRadius:6,padding:"1px 7px",fontSize:11,fontWeight:700}}>{w.nivel}</span>
                  </div>
                  <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:6}}>
                    <span style={{color:C.muted,fontSize:12}}>ð {w.fecha}</span>
                    <span style={{color:C.muted,fontSize:12}}>ð {w.hora}</span>
                    <span style={{color:C.muted,fontSize:12}}>ð¤ @{w.instructor}</span>
                    <span style={{color:C.muted,fontSize:12}}>â± {w.duracion}</span>
                  </div>
                  <div style={{marginBottom:8}}><WebinarCountdown fecha={w.fecha}/></div>
                  <p style={{margin:"0 0 10px",color:C.muted2,fontSize:12,lineHeight:1.6}}>{w.desc}</p>
                  {/* spots */}
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:11,color:isUrgent?"#ef4444":C.muted,fontWeight:isUrgent?700:400}}>
                        {isSoldOut?"â Agotado":isUrgent?`ð¥ Â¡Solo ${w.spotsLeft} plazas!`:`ð¥ ${w.spotsLeft}/${w.spots} plazas`}
                      </span>
                      <span style={{fontSize:11,color:C.muted2}}>{pct}% disp.</span>
                    </div>
                    <div style={{background:C.border,borderRadius:20,height:5,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:20,width:`${pct}%`,background:isUrgent?"linear-gradient(90deg,#ef4444,#f59e0b)":`linear-gradient(90deg,${C.accent},#00e5b0)`}}/>
                    </div>
                  </div>
                </div>

                {/* price + CTA */}
                <div style={{flexShrink:0,textAlign:"center",minWidth:130,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  {/* Price block */}
                  <div style={{background:isPremium?"rgba(139,92,246,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${isPremium?"rgba(139,92,246,0.3)":"rgba(255,255,255,0.08)"}`,borderRadius:12,padding:"10px 16px",width:"100%",boxSizing:"border-box"}}>
                    {isPremium ? (
                      <>
                        <div style={{fontSize:9,color:"#a78bfa",fontWeight:800,letterSpacing:"0.1em",marginBottom:4}}>â¦ PRECIO VIP</div>
                        <div style={{fontSize:28,fontWeight:900,color:"#A78BFA",lineHeight:1,letterSpacing:"-1px"}}>${w.precioVip}</div>
                        <div style={{fontSize:11,color:"#475569",textDecoration:"line-through",marginTop:2}}>${w.precio} regular</div>
                        <div style={{fontSize:10,color:"#10B981",fontWeight:700,marginTop:3}}>Ahorras ${w.precio-w.precioVip}</div>
                      </>
                    ):(
                      <>
                        <div style={{fontSize:9,color:"#64748b",fontWeight:700,letterSpacing:"0.1em",marginBottom:4}}>PRECIO</div>
                        <div style={{fontSize:28,fontWeight:900,color:"#F1F5F9",lineHeight:1,letterSpacing:"-1px"}}>${w.precio}</div>
                        <div style={{fontSize:10,color:"#a78bfa",fontWeight:600,marginTop:4,background:"rgba(139,92,246,0.1)",borderRadius:6,padding:"2px 6px",display:"inline-block"}}>VIP paga ${w.precioVip} â¦</div>
                      </>
                    )}
                  </div>

                  {/* CTA button */}
                  <button onClick={()=>handleBuy(w)} disabled={isSoldOut}
                    style={{background:isSoldOut?"rgba(55,65,81,0.5)":isPremium?"linear-gradient(135deg,#8B5CF6,#6D28D9)":"linear-gradient(135deg,#6366f1,#8B5CF6)",
                      border:"none",borderRadius:10,padding:"11px 0",color:"#fff",fontSize:13,fontWeight:800,cursor:isSoldOut?"default":"pointer",
                      width:"100%",opacity:isSoldOut?0.5:1,transition:"opacity 0.15s,transform 0.15s",
                      boxShadow:isSoldOut?"none":"0 4px 14px rgba(139,92,246,0.35)",letterSpacing:"-0.2px"}}
                    onMouseEnter={e=>{ if(!isSoldOut){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 18px rgba(139,92,246,0.5)";} }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=isSoldOut?"none":"0 4px 14px rgba(139,92,246,0.35)"; }}>
                    {isSoldOut ? "Agotado" : isPremium ? "Reservar VIP â¦ â" : "Reservar plaza â"}
                  </button>

                  {/* Extras */}
                  <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:10,color:"#475569",display:"flex",alignItems:"center",gap:3}}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6z" fill="#475569" stroke="none"/></svg>
                      GrabaciÃ³n incluida
                    </span>
                    <span style={{fontSize:10,color:"#475569",display:"flex",alignItems:"center",gap:3}}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      Stripe seguro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{marginTop:28,background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:18,padding:"28px 24px",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:10}}>ð¬</div>
        <h3 style={{margin:"0 0 8px",color:"#fff",fontSize:17,fontWeight:800}}>Â¿Tienes preguntas sobre algÃºn webinar?</h3>
        <p style={{margin:"0 0 16px",color:"#64748b",fontSize:13}}>EscrÃ­benos a <a href="mailto:hola@nexotradeia.com" style={{color:C.accent}}>hola@nexotradeia.com</a> y te respondemos en menos de 24h.</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>window.open("mailto:hola@nexotradeia.com","_blank")} style={{background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:10,padding:"10px 22px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Contactar â</button>
          {!isPremium && <button onClick={onGoVip} style={{background:"linear-gradient(135deg,#7C3AED,#4c1d95)",border:"none",borderRadius:10,padding:"10px 22px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>â¦ Ser VIP y ahorrar 50%</button>}
        </div>
      </div>
    </div>
  );
}

// ââ ECONOMIC CALENDAR DATA 2026 âââââââââââââââââââââââââââââââââââââââââââââââ
const ECON_2026 = [
  {date:"2026-05-29",event:"PCE InflaciÃ³n (Abr)",           cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"2.6%",est:"2.5%"},
  {date:"2026-06-01",event:"ISM Manufactura",                cat:"Manufactura", country:"ðºð¸",imp:"med", prev:"49.0", est:"49.5"},
  {date:"2026-06-05",event:"NÃ³minas No AgrÃ­colas (NFP)",    cat:"Empleo",      country:"ðºð¸",imp:"high",prev:"177K", est:"165K"},
  {date:"2026-06-05",event:"Tasa de Desempleo",              cat:"Empleo",      country:"ðºð¸",imp:"high",prev:"4.2%", est:"4.2%"},
  {date:"2026-06-10",event:"IPC / CPI (May)",                cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"3.4%", est:"3.2%"},
  {date:"2026-06-16",event:"Ventas al Por Menor (May)",      cat:"Consumo",     country:"ðºð¸",imp:"med", prev:"0.1%", est:"0.3%"},
  {date:"2026-06-17",event:"FOMC â DecisiÃ³n de Tasas",      cat:"Banco Central",country:"ðºð¸",imp:"high",prev:"4.25-4.50%",est:"4.00-4.25%"},
  {date:"2026-06-26",event:"PCE InflaciÃ³n (May)",           cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"2.5%", est:"2.4%"},
  {date:"2026-06-30",event:"Confianza del Consumidor",       cat:"Consumo",     country:"ðºð¸",imp:"med", prev:"98.1", est:"99.0"},
  {date:"2026-07-01",event:"ISM Manufactura",                cat:"Manufactura", country:"ðºð¸",imp:"med", prev:"49.5", est:"50.0"},
  {date:"2026-07-10",event:"NÃ³minas No AgrÃ­colas (NFP)",    cat:"Empleo",      country:"ðºð¸",imp:"high",prev:"165K", est:"170K"},
  {date:"2026-07-15",event:"IPC / CPI (Jun)",                cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"3.2%", est:"3.0%"},
  {date:"2026-07-16",event:"Ventas al Por Menor (Jun)",      cat:"Consumo",     country:"ðºð¸",imp:"med", prev:"0.3%", est:"0.2%"},
  {date:"2026-07-29",event:"FOMC â DecisiÃ³n de Tasas",      cat:"Banco Central",country:"ðºð¸",imp:"high",prev:"4.00-4.25%",est:"3.75-4.00%"},
  {date:"2026-07-30",event:"PIB EEUU Q2 2026 (avance)",     cat:"EconomÃ­a",    country:"ðºð¸",imp:"high",prev:"2.8%", est:"2.5%"},
  {date:"2026-07-31",event:"PCE InflaciÃ³n (Jun)",           cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"2.4%", est:"2.3%"},
  {date:"2026-08-07",event:"NÃ³minas No AgrÃ­colas (NFP)",    cat:"Empleo",      country:"ðºð¸",imp:"high",prev:"170K", est:"â"},
  {date:"2026-08-12",event:"IPC / CPI (Jul)",                cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"3.0%", est:"â"},
  {date:"2026-08-15",event:"Ventas al Por Menor (Jul)",      cat:"Consumo",     country:"ðºð¸",imp:"med", prev:"â",    est:"â"},
  {date:"2026-08-28",event:"PCE InflaciÃ³n (Jul)",           cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-09-04",event:"NÃ³minas No AgrÃ­colas (NFP)",    cat:"Empleo",      country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-09-11",event:"IPC / CPI (Ago)",                cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-09-16",event:"FOMC â DecisiÃ³n de Tasas",      cat:"Banco Central",country:"ðºð¸",imp:"high",prev:"â",   est:"â"},
  {date:"2026-09-25",event:"PCE InflaciÃ³n (Ago)",           cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-10-02",event:"NÃ³minas No AgrÃ­colas (NFP)",    cat:"Empleo",      country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-10-14",event:"IPC / CPI (Sep)",                cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-10-28",event:"FOMC â DecisiÃ³n de Tasas",      cat:"Banco Central",country:"ðºð¸",imp:"high",prev:"â",   est:"â"},
  {date:"2026-10-29",event:"PIB EEUU Q3 2026 (avance)",     cat:"EconomÃ­a",    country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-10-30",event:"PCE InflaciÃ³n (Sep)",           cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-11-06",event:"NÃ³minas No AgrÃ­colas (NFP)",    cat:"Empleo",      country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-11-12",event:"IPC / CPI (Oct)",                cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-11-25",event:"PCE InflaciÃ³n (Oct)",           cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-12-04",event:"NÃ³minas No AgrÃ­colas (NFP)",    cat:"Empleo",      country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-12-08",event:"FOMC â DecisiÃ³n de Tasas",      cat:"Banco Central",country:"ðºð¸",imp:"high",prev:"â",   est:"â"},
  {date:"2026-12-09",event:"IPC / CPI (Nov)",                cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
  {date:"2026-12-18",event:"PCE InflaciÃ³n (Nov)",           cat:"InflaciÃ³n",   country:"ðºð¸",imp:"high",prev:"â",    est:"â"},
];

// ââ COMMODITIES PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const COMMODITIES = [
  {id:"GC=F", name:"Gold",         ticker:"XAU", color:"#d97706", cat:"Metals",      unit:"USD/oz"},
  {id:"SI=F", name:"Silver",       ticker:"XAG", color:"#94a3b8", cat:"Metals",      unit:"USD/oz"},
  {id:"HG=F", name:"Copper",       ticker:"HG",  color:"#ea580c", cat:"Metals",      unit:"USD/lb"},
  {id:"PL=F", name:"Platinum",     ticker:"XPT", color:"#8b5cf6", cat:"Metals",      unit:"USD/oz"},
  {id:"CL=F", name:"Crude Oil WTI",ticker:"WTI", color:"#1d4ed8", cat:"Energy",      unit:"USD/bbl"},
  {id:"BZ=F", name:"Brent Oil",    ticker:"BRT", color:"#475569", cat:"Energy",      unit:"USD/bbl"},
  {id:"NG=F", name:"Natural Gas",  ticker:"NG",  color:"#dc2626", cat:"Energy",      unit:"USD/MMBtu"},
  {id:"RB=F", name:"Gasoline RBOB",ticker:"RB",  color:"#7c3aed", cat:"Energy",      unit:"USD/gal"},
  {id:"ZW=F", name:"Wheat",        ticker:"ZW",  color:"#b45309", cat:"Agriculture", unit:"USc/bu"},
  {id:"ZC=F", name:"Corn",         ticker:"ZC",  color:"#16a34a", cat:"Agriculture", unit:"USc/bu"},
  {id:"ZS=F", name:"Soybeans",     ticker:"ZS",  color:"#15803d", cat:"Agriculture", unit:"USc/bu"},
  {id:"KC=F", name:"Coffee",       ticker:"KC",  color:"#92400e", cat:"Agriculture", unit:"USc/lb"},
  {id:"CC=F", name:"Cocoa",        ticker:"CC",  color:"#7c2d12", cat:"Agriculture", unit:"USD/MT"},
  {id:"SB=F", name:"Sugar No.11",  ticker:"SB",  color:"#db2777", cat:"Agriculture", unit:"USc/lb"},
];

function CommoditySparkline({pts=[],color}){
  if(!pts||pts.length<2) return <span style={{color:"#94a3b8",fontSize:11}}>â</span>;
  const min=Math.min(...pts),max=Math.max(...pts),range=max-min||1;
  const w=80,h=28;
  const coords=pts.map((v,i)=>`${(i/(pts.length-1))*w},${h-((v-min)/range)*(h-4)+2}`).join(" ");
  return(
    <svg width={w} height={h} style={{display:"block"}}>
      <polyline points={coords} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CommoditiesPage(){
  const [rows, setRows]       = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUp, setLastUp]   = useState("");
  const [cat, setCat]         = useState("All");
  const [sort, setSort]       = useState("default");

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/commodities");
      const d = await r.json();
      if(d.commodities && d.commodities.length > 0){
        const newRows = {};
        d.commodities.forEach(c => {
          newRows[c.id] = {
            price:  c.price,
            daily:  c.daily,
            week:   c.week,
            month:  c.month,
            month3: c.month3,
            ytd:    c.ytd,
            year1:  c.year1,
            spark:  c.spark || [],
          };
        });
        setRows(newRows);
        setLastUp(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}));
      }
    } catch(e){ console.error("Commodities fetch error:",e); }
    setLoading(false);
  };

  useEffect(()=>{ fetchPrices(); const iv=setInterval(fetchPrices,300000); return()=>clearInterval(iv); },[]);

  const fmt=(id,p)=>{
    if(p==null) return "â";
    if(p>=1000) return "$"+p.toLocaleString("en-US",{maximumFractionDigits:2});
    return "$"+p.toFixed(2);
  };
  const fmtPct=(v)=>{
    if(v==null) return <span style={{color:"var(--c-muted2)"}}>â</span>;
    const up=v>=0;
    return <span style={{color:up?"#16a34a":"#dc2626",fontWeight:700}}>{up?"+":""}{v.toFixed(2)}%</span>;
  };

  const cats=["All","Metals","Energy","Agriculture"];
  let list = cat==="All" ? COMMODITIES : COMMODITIES.filter(c=>c.cat===cat);
  if(sort==="gainers") list=[...list].sort((a,b)=>(rows[b.id]?.daily||0)-(rows[a.id]?.daily||0));
  if(sort==="losers")  list=[...list].sort((a,b)=>(rows[a.id]?.daily||0)-(rows[b.id]?.daily||0));

  const COLS = [
    {k:"daily",  l:"Daily"},
    {k:"week",   l:"1 Week"},
    {k:"month",  l:"1 Month"},
    {k:"month3", l:"3 Months"},
    {k:"ytd",    l:"YTD"},
    {k:"year1",  l:"1 Year"},
  ];

  return(
    <div style={{maxWidth:1200,margin:"0 auto",padding:"20px 16px"}}>

      {/* ââ HEADER ââ */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <h1 style={{margin:0,fontSize:22,fontWeight:900,color:"var(--c-text)"}}>Commodities</h1>
            <span style={{background:"#22c55e",color:"#fff",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:10,letterSpacing:1}}>LIVE</span>
          </div>
          <div style={{color:"var(--c-muted2)",fontSize:12,marginTop:2}}>
            {lastUp?`Updated ${lastUp}`:"Loading..."}
            <button onClick={fetchPrices} style={{marginLeft:8,background:"transparent",border:"none",color:"#00A8FF",fontSize:12,cursor:"pointer",padding:0,fontFamily:"inherit"}}>â³ Refresh</button>
          </div>
        </div>
        {/* Filters */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${cat===c?"#00A8FF":"var(--c-border)"}`,background:cat===c?"#00A8FF":"var(--c-card)",color:cat===c?"#fff":"var(--c-muted2)",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
              {c==="All"?"All":c==="Metals"?"Metals":c==="Energy"?"Energy":"Agriculture"}
            </button>
          ))}
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{padding:"6px 10px",borderRadius:12,border:"1px solid var(--c-border)",background:"var(--c-card)",color:"var(--c-muted2)",fontSize:11,cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
            <option value="default">â Default</option>
            <option value="gainers">â² Top Gainers</option>
            <option value="losers">â¼ Top Losers</option>
          </select>
        </div>
      </div>

      {/* ââ PERFORMANCE TABLE ââ */}
      <div style={{background:"var(--c-card)",border:"1px solid var(--c-border)",borderRadius:16,overflow:"auto",marginBottom:16}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:750}}>
          <thead>
            <tr style={{borderBottom:"2px solid var(--c-border)"}}>
              <th style={{padding:"12px 18px",textAlign:"left",color:"var(--c-muted2)",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>Name</th>
              <th style={{padding:"12px 12px",textAlign:"right",color:"var(--c-muted2)",fontSize:11,fontWeight:700}}>Price</th>
              {COLS.map(col=>(
                <th key={col.k} style={{padding:"12px 12px",textAlign:"right",color:"var(--c-muted2)",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{col.l}</th>
              ))}
              <th style={{padding:"12px 12px",textAlign:"center",color:"var(--c-muted2)",fontSize:11,fontWeight:700}}>Chart</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} style={{padding:"40px",textAlign:"center",color:"var(--c-muted2)",fontSize:13}}>
                Loading performance data...
              </td></tr>
            )}
            {!loading && list.map((c,i)=>{
              const row=rows[c.id];
              const up=row&&row.daily>=0;
              return(
                <tr key={c.id}
                  style={{borderBottom:i<list.length-1?"1px solid var(--c-border)":"none",cursor:"pointer",transition:"background 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--c-card2)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>window.open(`https://finance.yahoo.com/quote/${c.id}`,"_blank")}>
                  {/* Name */}
                  <td style={{padding:"13px 18px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:4,height:34,borderRadius:2,background:c.color,flexShrink:0}}/>
                      <div style={{width:38,height:22,borderRadius:5,background:c.color+"18",border:`1px solid ${c.color}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span style={{fontSize:9,fontWeight:800,color:c.color,letterSpacing:0.5,fontFamily:"monospace"}}>{c.ticker}</span>
                      </div>
                      <div>
                        <div style={{color:"var(--c-text)",fontWeight:700,fontSize:13,whiteSpace:"nowrap"}}>{c.name}</div>
                        <div style={{color:"var(--c-muted2)",fontSize:10}}>{c.cat} Â· {c.unit}</div>
                      </div>
                    </div>
                  </td>
                  {/* Price */}
                  <td style={{padding:"13px 12px",textAlign:"right",fontWeight:800,fontSize:13,fontFamily:"monospace",color:"var(--c-text)",whiteSpace:"nowrap"}}>
                    {fmt(c.id, row?.price)}
                  </td>
                  {/* Period columns */}
                  {COLS.map(col=>(
                    <td key={col.k} style={{padding:"13px 12px",textAlign:"right",fontSize:12,whiteSpace:"nowrap"}}>
                      {fmtPct(row?.[col.k])}
                    </td>
                  ))}
                  {/* Sparkline */}
                  <td style={{padding:"8px 12px",textAlign:"center"}}>
                    <div style={{display:"flex",justifyContent:"center"}}>
                      <CommoditySparkline pts={row?.spark||[]} color={up?"#16a34a":"#dc2626"}/>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{textAlign:"center",color:"var(--c-muted2)",fontSize:11,paddingBottom:8}}>
        Historical data via Yahoo Finance Â· Click any row for full chart Â· Not financial advice Â· NexoTrade
      </div>
    </div>
  );
}
// ââ FIN COMMODITIES âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function EconCalendarPage() {
  const [filter,    setFilter]    = useState("upcoming");
  const [catFilter, setCatFilter] = useState("todas");
  const [events,    setEvents]    = useState(ECON_2026);
  const [loading,   setLoading]   = useState(true);
  const [source,    setSource]    = useState("local");
  const [lastUpd,   setLastUpd]   = useState(null);
  const today = new Date().toISOString().split("T")[0];
  const CATS  = ["todas","InflaciÃ³n","Empleo","Banco Central","EconomÃ­a","Consumo","Manufactura"];
  const IMP   = {high:{bg:"#FEF2F2",color:C.bear,label:"Alta"},med:{bg:"#FFFBEB",color:C.gold,label:"Media"},low:{bg:"#F0FDF4",color:C.bull,label:"Baja"}};
  const fmtDate = d => new Date(d+"T12:00:00").toLocaleDateString("es-ES",{weekday:"short",day:"numeric",month:"short"});

  useEffect(()=>{
    fetch("/api/econCalendar")
      .then(r=>r.json())
      .then(d=>{
        if(d.events && d.events.length > 5){
          setEvents(d.events);
          setSource(d.source==="fmp" ? "live" : "local");
          setLastUpd(new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}));
        }
      })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const rows = events.filter(e=>{
    const past = e.date < today;
    if(filter==="upcoming" && past) return false;
    if(filter==="past"     && !past) return false;
    if(catFilter!=="todas" && e.cat!==catFilter) return false;
    return true;
  });

  return(
    <div style={{maxWidth:860,margin:"0 auto"}}>
      <div style={{background:C.card,borderRadius:16,padding:"20px 24px",marginBottom:16,boxShadow:C.shadow,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <span style={{fontSize:30}}>ð</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:20,fontWeight:800,color:C.text}}>Calendario EconÃ³mico</div>
              {source==="live"
                ? <span style={{fontSize:10,fontWeight:700,color:C.bull,background:C.bullBg,borderRadius:10,padding:"2px 8px"}}>â EN VIVO</span>
                : <span style={{fontSize:10,fontWeight:700,color:C.muted2,background:C.card2,borderRadius:10,padding:"2px 8px",border:`1px solid ${C.border}`}}>MODO LOCAL</span>
              }
            </div>
            <div style={{fontSize:12,color:C.muted}}>
              Eventos macro que mueven los mercados â FOMC Â· CPI Â· NFP Â· GDP Â· PCE
              {lastUpd && <span style={{marginLeft:8,color:C.muted2}}>Â· Actualizado {lastUpd}</span>}
            </div>
          </div>
          {loading && <span style={{fontSize:11,color:C.muted,background:C.card2,borderRadius:8,padding:"3px 9px",border:`1px solid ${C.border}`}}>â³ Cargando...</span>}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[{k:"all",l:"Todos"},{k:"upcoming",l:"ð PrÃ³ximos"},{k:"past",l:"Pasados"}].map(({k,l})=>(
            <button key={k} onClick={()=>setFilter(k)} style={{background:filter===k?C.accent:"transparent",color:filter===k?"#fff":C.muted,border:`1.5px solid ${filter===k?C.accent:C.border}`,borderRadius:20,padding:"5px 13px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>{l}</button>
          ))}
          <span style={{width:1,background:C.border,margin:"0 2px"}}/>
          {CATS.map(cat=>(
            <button key={cat} onClick={()=>setCatFilter(cat)} style={{background:catFilter===cat?C.purpleBg:"transparent",color:catFilter===cat?C.purple:C.muted,border:`1.5px solid ${catFilter===cat?C.purple+"55":C.border}`,borderRadius:20,padding:"5px 13px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:14,marginBottom:12,padding:"0 2px",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:14}}>
          {Object.entries(IMP).map(([k,v])=>(
            <span key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.muted}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:v.color}}/>
              {v.label} importancia
            </span>
          ))}
        </div>
        <span style={{fontSize:11,color:C.muted2}}>{rows.length} eventos</span>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {rows.length===0 && <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>Sin eventos con ese filtro.</div>}
        {rows.map((ev,i)=>{
          const past    = ev.date < today;
          const isToday = ev.date === today;
          const imp     = IMP[ev.imp] || IMP.low;
          const hasActual = ev.actual && ev.actual !== "â" && ev.actual !== null;
          return(
            <div key={i} style={{background:isToday?"rgba(0,168,255,0.03)":C.card,border:`1px solid ${isToday?C.accent+"44":C.border}`,borderLeft:`4px solid ${past&&!hasActual?C.muted2:imp.color}`,borderRadius:12,padding:"14px 20px",opacity:past&&!hasActual?0.55:1,display:"grid",gridTemplateColumns:"140px 1fr 150px",alignItems:"center",gap:16,boxShadow:isToday?C.shadowGlow:"none",transition:"opacity 0.2s"}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:past?C.muted:C.text}}>{fmtDate(ev.date)}</div>
                <div style={{fontSize:10,color:C.muted2,marginTop:2}}>{ev.country} {ev.cat}</div>
                {ev.time && <div style={{fontSize:10,color:C.muted2,marginTop:1}}>ð {ev.time} ET</div>}
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:past&&!hasActual?C.muted:C.text}}>{ev.event}</div>
                <div style={{display:"flex",gap:6,marginTop:4,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:10,fontWeight:700,color:imp.color,background:imp.bg,borderRadius:10,padding:"2px 8px"}}>{imp.label}</span>
                  {isToday && <span style={{fontSize:10,fontWeight:700,color:C.accent,background:C.accentDim,borderRadius:10,padding:"2px 8px"}}>HOY</span>}
                  {hasActual && <span style={{fontSize:10,fontWeight:700,color:C.bull,background:C.bullBg,borderRadius:10,padding:"2px 8px"}}>â PUBLICADO</span>}
                  {ev.cat==="Banco Central" && <span style={{fontSize:10,fontWeight:700,color:"#7C3AED",background:"rgba(124,58,237,0.09)",borderRadius:10,padding:"2px 8px"}}>ð¦ FED</span>}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                {hasActual && (
                  <div style={{fontSize:14,fontWeight:800,color:C.bull,marginBottom:4}}>
                    <span style={{fontSize:10,color:C.muted2,fontWeight:500,display:"block",marginBottom:1}}>ACTUAL</span>
                    {ev.actual}
                  </div>
                )}
                {ev.est!=="â" && !hasActual && <div style={{fontSize:11,color:past?C.muted:C.accent,marginBottom:2}}><b>Est:</b> {ev.est}</div>}
                {ev.prev!=="â" && <div style={{fontSize:11,color:C.muted}}><b>Ant:</b> {ev.prev}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:"center",padding:"16px 0",fontSize:11,color:C.muted2}}>
        {source==="live" ? "â¡ Datos en tiempo real via Financial Modeling Prep (FMP)" : "ð Datos base â agrega FMP_API_KEY en Vercel para tiempo real"}
        {" Â· "}Fuentes: Federal Reserve, BLS, BEA
      </div>
    </div>
  );
}

// ââ DIVIDEND CALENDAR PAGE (page 15) âââââââââââââââââââââââââââââââââââââââââ
const DIV_FALLBACK = [
  {ticker:"AAPL",  name:"Apple Inc",          price:248.2, divRate:1.00, yield:0.40, quarterly:"0.25",exDate:"2026-05-09",payDate:"2026-05-15",sector:"TecnologÃ­a"},
  {ticker:"MSFT",  name:"Microsoft Corp",     price:440.5, divRate:3.32, yield:0.75, quarterly:"0.83",exDate:"2026-05-15",payDate:"2026-06-12",sector:"TecnologÃ­a"},
  {ticker:"JNJ",   name:"Johnson & Johnson",  price:160.3, divRate:4.96, yield:3.10, quarterly:"1.24",exDate:"2026-05-27",payDate:"2026-06-10",sector:"Salud"},
  {ticker:"KO",    name:"Coca-Cola Co",       price:67.8,  divRate:1.94, yield:2.86, quarterly:"0.485",exDate:"2026-06-13",payDate:"2026-07-01",sector:"Consumo"},
  {ticker:"MCD",   name:"McDonald's Corp",    price:307.4, divRate:7.08, yield:2.30, quarterly:"1.77",exDate:"2026-06-04",payDate:"2026-06-16",sector:"Consumo"},
  {ticker:"PG",    name:"Procter & Gamble",   price:167.9, divRate:4.02, yield:2.40, quarterly:"1.006",exDate:"2026-07-18",payDate:"2026-08-15",sector:"Consumo"},
  {ticker:"T",     name:"AT&T Inc",           price:23.1,  divRate:1.11, yield:4.81, quarterly:"0.2775",exDate:"2026-07-10",payDate:"2026-08-01",sector:"Telecomunicaciones"},
  {ticker:"VZ",    name:"Verizon Comm",       price:45.0,  divRate:2.66, yield:5.91, quarterly:"0.665",exDate:"2026-07-08",payDate:"2026-08-02",sector:"Telecomunicaciones"},
  {ticker:"XOM",   name:"ExxonMobil Corp",    price:117.5, divRate:3.96, yield:3.37, quarterly:"0.99",exDate:"2026-05-13",payDate:"2026-06-10",sector:"EnergÃ­a"},
  {ticker:"CVX",   name:"Chevron Corp",       price:145.8, divRate:6.84, yield:4.69, quarterly:"1.71",exDate:"2026-05-19",payDate:"2026-06-10",sector:"EnergÃ­a"},
  {ticker:"ABBV",  name:"AbbVie Inc",         price:188.2, divRate:6.40, yield:3.40, quarterly:"1.60",exDate:"2026-07-14",payDate:"2026-08-15",sector:"Salud"},
  {ticker:"PFE",   name:"Pfizer Inc",         price:27.4,  divRate:1.68, yield:6.13, quarterly:"0.42",exDate:"2026-07-30",payDate:"2026-09-03",sector:"Salud"},
  {ticker:"IBM",   name:"IBM Corp",           price:214.9, divRate:6.68, yield:3.11, quarterly:"1.67",exDate:"2026-08-07",payDate:"2026-09-10",sector:"TecnologÃ­a"},
  {ticker:"WMT",   name:"Walmart Inc",        price:98.3,  divRate:0.88, yield:0.90, quarterly:"0.22",exDate:"2026-08-06",payDate:"2026-09-03",sector:"Consumo"},
  {ticker:"HD",    name:"Home Depot Inc",     price:388.1, divRate:9.00, yield:2.32, quarterly:"2.25",exDate:"2026-09-03",payDate:"2026-09-18",sector:"Consumo"},
];

function DividendCalendarPage() {
  const [divs,    setDivs]    = useState(DIV_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [sector,  setSector]  = useState("todos");
  const today = new Date().toISOString().split("T")[0];
  const sectors = ["todos","TecnologÃ­a","Salud","Consumo","EnergÃ­a","Telecomunicaciones"];

  useEffect(()=>{
    fetch("/api/dividends")
      .then(r=>r.json())
      .then(d=>{ if(d.dividends && d.dividends.length>3) setDivs(d.dividends); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const rows = divs.filter(d=> sector==="todos" || d.sector===sector);
  const soon = (dateStr) => dateStr && dateStr >= today && new Date(dateStr)-new Date(today) < 30*864e5;
  const fmt  = d => d ? new Date(d+"T12:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}) : "â";

  return(
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <div style={{background:C.card,borderRadius:16,padding:"20px 24px",marginBottom:16,boxShadow:C.shadow,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <span style={{fontSize:30}}>ð°</span>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:C.text}}>Calendario de Dividendos</div>
            <div style={{fontSize:12,color:C.muted}}>PrÃ³ximas fechas ex-dividendo y pagos de las principales empresas</div>
          </div>
          {loading && <span style={{fontSize:11,color:C.muted,background:C.card2,borderRadius:8,padding:"3px 9px",marginLeft:"auto"}}>Actualizando...</span>}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {sectors.map(s=>(
            <button key={s} onClick={()=>setSector(s)} style={{background:sector===s?C.bull+"22":"transparent",color:sector===s?C.bull:C.muted,border:`1.5px solid ${sector===s?C.bull+"44":C.border}`,borderRadius:20,padding:"5px 13px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{background:C.card,borderRadius:16,overflow:"hidden",boxShadow:C.shadow,border:`1px solid ${C.border}`}}>
        <div style={{display:"grid",gridTemplateColumns:"90px 1fr 90px 90px 80px 80px",gap:0,background:C.card2,borderBottom:`1px solid ${C.border}`,padding:"10px 20px"}}>
          {["Ticker","Empresa","Ex-Fecha","Pago","Trimestral","Yield"].map(h=>(
            <div key={h} style={{fontSize:10,fontWeight:700,color:C.muted2,letterSpacing:0.5}}>{h.toUpperCase()}</div>
          ))}
        </div>
        {rows.map((d,i)=>{
          const isSoon = soon(d.exDate);
          return(
            <div key={i} style={{display:"grid",gridTemplateColumns:"90px 1fr 90px 90px 80px 80px",gap:0,padding:"13px 20px",borderBottom:`1px solid ${C.border}`,background:isSoon?"rgba(22,163,74,0.03)":"transparent",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=isSoon?"rgba(22,163,74,0.06)":C.card2}
              onMouseLeave={e=>e.currentTarget.style.background=isSoon?"rgba(22,163,74,0.03)":"transparent"}>
              <div style={{fontWeight:800,fontSize:13,color:C.accent}}>{d.ticker}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.name}</div>
                <div style={{fontSize:10,color:C.muted2,marginTop:1}}>{d.sector}</div>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:isSoon?700:500,color:isSoon?C.bull:C.text}}>{fmt(d.exDate)}</div>
                {isSoon && <div style={{fontSize:9,color:C.bull,fontWeight:700,marginTop:1}}>PRÃXIMO</div>}
              </div>
              <div style={{fontSize:13,color:C.muted}}>{fmt(d.payDate)}</div>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>${d.quarterly}</div>
              <div style={{fontSize:13,fontWeight:700,color:parseFloat(d.yield)>=4?C.bull:C.text}}>{parseFloat(d.yield).toFixed(2)}%</div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:"center",padding:"14px 0",fontSize:11,color:C.muted2}}>Ex-fecha es el Ãºltimo dÃ­a para comprar y recibir el dividendo Â· Datos orientativos</div>
    </div>
  );
}

// ââ IPO CALENDAR PAGE (page 16) âââââââââââââââââââââââââââââââââââââââââââââââ
const IPOS_2026 = [
  // ââ Already trading ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {company:"CoreWeave Inc",        ticker:"CRWV",  exchange:"NASDAQ",  date:"2026-03-28",range:"$40",     raise:"$1.5B",  sector:"Cloud/AI",    status:"trading",   desc:"GPU cloud provider for AI workloads, OpenAI's primary infrastructure partner. Up ~140% since IPO."},
  {company:"Venture Global LNG",   ticker:"VG",    exchange:"NYSE",    date:"2026-01-24",range:"$25",     raise:"$1.75B", sector:"Energy",      status:"trading",   desc:"Major U.S. LNG exporter. One of the biggest IPOs of the year by capital raised."},
  {company:"eToro Group Ltd",      ticker:"ETOR",  exchange:"NASDAQ",  date:"2026-05-14",range:"$52",     raise:"$620M",  sector:"Fintech",     status:"trading",   desc:"Social trading platform with 35M registered users worldwide. Debuted above range."},
  {company:"Klarna Bank AB",       ticker:"KLAR",  exchange:"NYSE",    date:"2026-07-01",range:"$68â$72", raise:"$1.0B",  sector:"Fintech",     status:"upcoming",  desc:"Europe's leading BNPL platform with 85M users across 45 countries. Highly anticipated."},
  // ââ Coming soon âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  {company:"Chime Financial",      ticker:"CHYM",  exchange:"NYSE",    date:"2026-07-08",range:"$22â$26", raise:"$600M",  sector:"Neobank",     status:"upcoming",  desc:"U.S. neobank with 22M active accounts. No overdraft fees model disrupting traditional banking."},
  {company:"SHEIN Group Ltd",      ticker:"SHEI",  exchange:"NYSE",    date:"2026-07-22",range:"$60â$70", raise:"$5.0B",  sector:"Retail",      status:"upcoming",  desc:"Ultra-fast fashion e-commerce giant. Est. valuation $65B. Highly controversial ESG profile."},
  {company:"Discord Inc",          ticker:"DCRD",  exchange:"NASDAQ",  date:"2026-08-14",range:"$35â$42", raise:"$800M",  sector:"Social",      status:"upcoming",  desc:"Community platform with 150M monthly users. Expanding beyond gaming into business and education."},
  {company:"Turo Inc",             ticker:"TURO",  exchange:"NASDAQ",  date:"2026-08-28",range:"$14â$17", raise:"$300M",  sector:"Marketplace", status:"upcoming",  desc:"Peer-to-peer car sharing marketplace â the Airbnb for cars. 350K+ vehicles listed in the U.S."},
  {company:"Medline Industries",   ticker:"MDLN",  exchange:"NYSE",    date:"2026-09-15",range:"$20â$24", raise:"$1.5B",  sector:"Healthcare",  status:"upcoming",  desc:"Largest private U.S. medical supplies manufacturer. Over $20B in annual revenue."},
  {company:"Panera Brands",        ticker:"PNRA",  exchange:"NYSE",    date:"2026-09-30",range:"$16â$20", raise:"$900M",  sector:"Food",        status:"upcoming",  desc:"Bakery-cafÃ© chain with 2,100+ locations in the U.S. Re-listing after going private in 2017."},
  {company:"Cerebras Systems",     ticker:"CBRS",  exchange:"NASDAQ",  date:"2026-10-10",range:"$28â$35", raise:"$450M",  sector:"Semiconductors",status:"upcoming",desc:"AI chip designer building wafer-scale processors for LLM training. Direct NVIDIA competitor."},
  {company:"Databricks Inc",       ticker:"DBRK",  exchange:"NASDAQ",  date:"2026-Q4",   range:"TBD",     raise:"$2.0B+", sector:"Cloud/AI",    status:"upcoming",  desc:"Data and AI platform valued at $62B in last private round. One of the most anticipated tech IPOs."},
  {company:"OpenAI",               ticker:"TBD",   exchange:"TBD",     date:"2027+",     range:"TBD",     raise:"TBD",    sector:"AI",          status:"upcoming",  desc:"Creator of ChatGPT. No confirmed IPO timeline but widely expected. Most anticipated offering ever."},
];

function IpoCalendarPage() {
  const [filter,  setFilter]  = useState("all");
  const [ipos,    setIpos]    = useState(IPOS_2026);
  const [loading, setLoading] = useState(true);
  const [source,  setSource]  = useState("local");
  const [lastUp,  setLastUp]  = useState("");
  const [total,   setTotal]   = useState(IPOS_2026.length);
  const today = new Date().toISOString().split("T")[0];
  const STATUS = {
    upcoming:{color:C.accent, bg:C.accentDim, label:"Upcoming"},
    priced:  {color:C.purple, bg:C.purpleBg,  label:"Priced"},
    trading: {color:C.bull,   bg:C.bullBg,    label:"Trading"},
  };

  const autoStatus = (ipo) => {
    if(!ipo.date||ipo.date.includes("Q")||ipo.date.includes("+")) return "upcoming";
    const d = new Date(ipo.date);
    const now = new Date();
    const diffDays = (d - now) / (1000*60*60*24);
    if(diffDays > 7)  return "upcoming";
    if(diffDays > -3) return "priced";
    return "trading";
  };

  const fetchData = () => {
    setLoading(true);
    const withAutoStatus = IPOS_2026.map(ipo => ({...ipo, status: autoStatus(ipo)}));
    setIpos(withAutoStatus);
    fetch("/api/ipos")
      .then(r=>r.json())
      .then(d=>{
        if(d.ipos && d.ipos.length > 0){
          const merged = [...d.ipos];
          IPOS_2026.forEach(seed=>{
            const exists = merged.find(x=>x.ticker===seed.ticker||x.company.toLowerCase().includes(seed.company.split(" ")[0].toLowerCase()));
            if(!exists) merged.push({...seed, status: autoStatus(seed)});
            else {
              exists.desc   = exists.desc   || seed.desc;
              exists.sector = exists.sector || seed.sector;
              exists.status = autoStatus(exists);
            }
          });
          merged.sort((a,b)=>{
            const order = {upcoming:0, priced:1, trading:2};
            if(order[a.status] !== order[b.status]) return order[a.status]-order[b.status];
            return (a.date||"9999").localeCompare(b.date||"9999");
          });
          setIpos(merged);
          setSource(d.source==="fmp"?"live":"local");
          setTotal(merged.length);
        }
      })
      .catch(()=>{})
      .finally(()=>{
        setLoading(false);
        setLastUp(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}));
      });
  };

  useEffect(()=>{ fetchData(); },[]);

  const rows = ipos.filter(ipo => filter==="all" || ipo.status===filter);
  const counts = {all:ipos.length, upcoming:ipos.filter(x=>x.status==="upcoming").length, priced:ipos.filter(x=>x.status==="priced").length, trading:ipos.filter(x=>x.status==="trading").length};

  return(
    <div style={{maxWidth:920,margin:"0 auto"}}>
      <div style={{background:C.card,borderRadius:16,padding:"20px 24px",marginBottom:16,boxShadow:C.shadow,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <div style={{fontSize:20,fontWeight:800,color:C.text}}>ð IPO Calendar {new Date().getFullYear()}</div>
              {source==="live"
                ? <span style={{fontSize:10,fontWeight:700,color:C.bull,background:C.bullBg,borderRadius:10,padding:"2px 8px"}}>â LIVE</span>
                : <span style={{fontSize:10,fontWeight:700,color:C.muted2,background:C.card2,borderRadius:10,padding:"2px 8px",border:`1px solid ${C.border}`}}>CURATED</span>
              }
              <span style={{fontSize:11,color:C.muted2}}>{total} IPOs</span>
              {lastUp && <span style={{fontSize:10,color:C.muted2}}>Â· Updated {lastUp}</span>}
            </div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>Public offerings â prices, dates, sectors and real-time status</div>
          </div>
          <button onClick={fetchData} disabled={loading}
            style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.card2,color:C.accent,fontSize:12,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",opacity:loading?0.6:1,transition:"all 0.15s"}}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.background=C.accentDim;}}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card2;}}>
            <span style={{display:"inline-block",animation:loading?"spin 1s linear infinite":"none"}}>â³</span>
            {loading?"Loading...":"Refresh"}
          </button>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[{k:"all",l:`All (${counts.all})`},{k:"upcoming",l:`ð Upcoming (${counts.upcoming})`},{k:"priced",l:`ð Priced (${counts.priced})`},{k:"trading",l:`â Trading (${counts.trading})`}].map(({k,l})=>(
            <button key={k} onClick={()=>setFilter(k)} style={{background:filter===k?C.accent:"transparent",color:filter===k?"#fff":C.muted,border:`1.5px solid ${filter===k?C.accent:C.border}`,borderRadius:20,padding:"5px 13px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gap:10}}>
        {rows.length===0 && <div style={{textAlign:"center",padding:"40px",color:C.muted}}>Sin IPOs con ese filtro.</div>}
        {rows.map((ipo,i)=>{
          const st = STATUS[ipo.status] || STATUS.upcoming;
          const isFuture = ipo.date >= today;
          return(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 22px",boxShadow:C.shadow,display:"grid",gridTemplateColumns:"1fr auto",gap:16,alignItems:"center",transition:"box-shadow 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow=C.shadowMd}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=C.shadow}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <div style={{fontWeight:900,fontSize:15,color:C.text}}>{ipo.company}</div>
                  {ipo.ticker && ipo.ticker!=="â" && <div style={{fontWeight:800,fontSize:11,color:C.accent,background:C.accentDim,borderRadius:8,padding:"2px 8px"}}>{ipo.ticker}</div>}
                  {ipo.exchange && ipo.exchange!=="â" && <div style={{fontSize:11,color:C.muted,background:C.card2,borderRadius:8,padding:"2px 8px",border:`1px solid ${C.border}`}}>{ipo.exchange}</div>}
                  <span style={{fontSize:11,fontWeight:700,color:st.color,background:st.bg,borderRadius:10,padding:"2px 9px"}}>{st.label}</span>
                </div>
                {ipo.desc && <div style={{fontSize:12,color:C.muted,marginBottom:6,lineHeight:1.5}}>{ipo.desc}</div>}
                <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                  {ipo.sector && ipo.sector!=="Mercado" && <span style={{fontSize:12,color:C.muted}}><b style={{color:C.text}}>Sector:</b> {ipo.sector}</span>}
                  {ipo.raise  && ipo.raise!=="â"  && <span style={{fontSize:12,color:C.muted}}><b style={{color:C.text}}>RecaudaciÃ³n:</b> {ipo.raise}</span>}
                  {ipo.shares && ipo.shares!=="â" && <span style={{fontSize:12,color:C.muted}}>{ipo.shares}</span>}
                </div>
              </div>
              <div style={{textAlign:"right",minWidth:120}}>
                {ipo.range && ipo.range!=="Por definir" && (
                  <>
                    <div style={{fontSize:20,fontWeight:900,color:C.text,marginBottom:2}}>{ipo.range}</div>
                    <div style={{fontSize:10,color:C.muted2,marginBottom:6}}>precio/acciÃ³n</div>
                  </>
                )}
                {ipo.date && ipo.date!=="â" && (
                  <div style={{fontSize:12,fontWeight:700,color:isFuture?C.accent:C.muted}}>
                    {(() => { try { return new Date(ipo.date+"T12:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short",year:"numeric"}); } catch(e){ return ipo.date; } })()}
                  </div>
                )}
                {ipo.url && (
                  <a href={ipo.url} target="_blank" rel="noopener noreferrer"
                    style={{fontSize:11,color:C.accent,textDecoration:"none",display:"block",marginTop:4}}>
                    Ver prospecto â
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:"center",padding:"16px 0",fontSize:11,color:C.muted2}}>
        {source==="live" ? "â¡ Datos en tiempo real via Financial Modeling Prep (FMP)" : "ð Lista curada â agrega FMP_API_KEY en Vercel para tiempo real"}
        {" Â· "}Siempre verifica en SEC EDGAR antes de invertir
      </div>
    </div>
  );
}

// ââ STOCK SCREENER PAGE (page 17) â VIP âââââââââââââââââââââââââââââââââââââââ
const SCREENER_PRESETS = [
  {k:"gainers",    label:"ð Top Ganadores",   desc:"Las mÃ¡s alcistas hoy"},
  {k:"losers",     label:"ð Top Perdedores",  desc:"Las mÃ¡s bajistas hoy"},
  {k:"active",     label:"ð¥ MÃ¡s Activas",     desc:"Mayor volumen del mercado"},
  {k:"undervalued",label:"ð Subvaloradas",    desc:"Crecimiento con buen precio"},
  {k:"growth",     label:"ð Crecimiento Tech",desc:"TecnologÃ­a con alto potencial"},
  {k:"dividend",   label:"ð° Dividendos",      desc:"Carteras anchor de dividendo"},
];

function ScreenerPage({isPremium, onNeedPremium}) {
  const [screen,  setScreen]  = useState("gainers");
  const [quotes,  setQuotes]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);

  useEffect(()=>{
    if(!isPremium) return;
    setLoading(true); setError(false);
    fetch(`/api/screener?screen=${screen}`)
      .then(r=>r.json())
      .then(d=>{ setQuotes(d.quotes||[]); setLoading(false); })
      .catch(()=>{ setError(true); setLoading(false); });
  },[screen, isPremium]);

  const fmt$ = v => v>=1e9 ? `$${(v/1e9).toFixed(1)}B` : v>=1e6 ? `$${(v/1e6).toFixed(0)}M` : v ? `$${v.toFixed(2)}` : "â";
  const fmtPct = v => v ? `${v>0?"+":""}${v.toFixed(2)}%` : "â";

  if(!isPremium) return(
    <div style={{maxWidth:700,margin:"60px auto",textAlign:"center",padding:"0 20px"}}>
      <div style={{fontSize:64,marginBottom:16}}>ð</div>
      <div style={{fontSize:28,fontWeight:900,color:C.text,marginBottom:8}}>Stock Screener VIP</div>
      <div style={{fontSize:15,color:C.muted,marginBottom:28,lineHeight:1.6}}>
        Filtra mÃ¡s de 10,000 acciones por momentum, valoraciÃ³n, dividendo y crecimiento.<br/>
        Descubre oportunidades antes que el mercado.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:28,textAlign:"left"}}>
        {["ð Top Ganadores del dÃ­a","ð Top Perdedores","ð¥ MÃ¡s Activas por volumen","ð Acciones Subvaloradas","ð Tech de alto crecimiento","ð° Mejores dividendos"].map((f,i)=>(
          <div key={i} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:12,fontWeight:600,color:C.muted}}>{f}</div>
        ))}
      </div>
      <button onClick={onNeedPremium} style={{background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"#fff",border:"none",borderRadius:12,padding:"14px 32px",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 24px rgba(124,58,237,0.35)"}}>
        â¦ Activar VIP â $9.99/mes
      </button>
      <div style={{fontSize:11,color:C.muted2,marginTop:12}}>Cancela cuando quieras Â· Acceso inmediato</div>
    </div>
  );

  const preset = SCREENER_PRESETS.find(p=>p.k===screen);

  return(
    <div style={{maxWidth:960,margin:"0 auto"}}>
      <div style={{background:C.card,borderRadius:16,padding:"20px 24px",marginBottom:16,boxShadow:C.shadow,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <span style={{fontSize:30}}>ð</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:20,fontWeight:800,color:C.text}}>Stock Screener</div>
              <span style={{fontSize:11,fontWeight:700,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"#fff",borderRadius:20,padding:"3px 10px"}}>VIP</span>
            </div>
            <div style={{fontSize:12,color:C.muted}}>{preset?.desc} Â· {quotes.length} resultados</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {SCREENER_PRESETS.map(({k,label})=>(
            <button key={k} onClick={()=>setScreen(k)} style={{background:screen===k?"linear-gradient(135deg,#8B5CF6,#6D28D9)":"transparent",color:screen===k?"#fff":C.muted,border:`1.5px solid ${screen===k?"transparent":C.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s",boxShadow:screen===k?"0 4px 12px rgba(124,58,237,0.3)":"none"}}>{label}</button>
          ))}
        </div>
      </div>

      {loading && <div style={{textAlign:"center",padding:"40px",color:C.muted,fontSize:14}}>Cargando screener... â³</div>}
      {error   && <div style={{textAlign:"center",padding:"40px",color:C.bear,fontSize:14}}>Error al cargar datos. Intenta de nuevo.</div>}

      {!loading && !error && quotes.length > 0 && (
        <div style={{background:C.card,borderRadius:16,boxShadow:C.shadow,border:`1px solid ${C.border}`,overflowX:"auto"}}>
          <div style={{minWidth:720}}>
            <div style={{display:"grid",gridTemplateColumns:"80px minmax(140px,1fr) 90px 90px 70px 100px 90px",background:C.card2,borderBottom:`1px solid ${C.border}`,padding:"10px 20px",gap:8,borderRadius:"16px 16px 0 0"}}>
              {["Ticker","Empresa","Precio","Cambio %","P/E","Mkt Cap","Volumen"].map(h=>(
                <div key={h} style={{fontSize:10,fontWeight:700,color:C.muted2,letterSpacing:0.5}}>{h.toUpperCase()}</div>
              ))}
            </div>
            {quotes.slice(0,25).map((q,i)=>{
              const chg    = q.regularMarketChangePercent || 0;
              const isPos  = chg >= 0;
              return(
                <div key={i} style={{display:"grid",gridTemplateColumns:"80px minmax(140px,1fr) 90px 90px 70px 100px 90px",gap:8,padding:"12px 20px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"background 0.12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.card2}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{fontWeight:800,fontSize:13,color:C.accent}}>{q.symbol}</div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{q.shortName||q.longName||q.symbol}</div>
                    <div style={{fontSize:10,color:C.muted2}}>{q.exchange||""}</div>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>${q.regularMarketPrice?.toFixed(2)||"â"}</div>
                  <div style={{fontSize:13,fontWeight:700,color:isPos?C.bull:C.bear}}>{fmtPct(chg)}</div>
                  <div style={{fontSize:12,color:C.muted}}>{q.trailingPE?.toFixed(1)||"â"}</div>
                  <div style={{fontSize:12,color:C.muted}}>{fmt$(q.marketCap)}</div>
                  <div style={{fontSize:12,color:C.muted}}>{q.regularMarketVolume ? (q.regularMarketVolume/1e6).toFixed(1)+"M" : "â"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!loading && !error && quotes.length===0 && <div style={{textAlign:"center",padding:"40px",color:C.muted}}>Sin resultados. Intenta otro filtro.</div>}
    </div>
  );
}

// ââ SUPER INVERSORES PAGE (estilo Dataroma) âââââââââââââââââââââââââââââââââââ
const GURUS = [
  {
    id:"buffett", name:"Warren Buffett", firm:"Berkshire Hathaway", emoji:"ð©",
    color:"#F59E0B", aum:"$370B", updated:"Q1 2026", style:"Valor Â· Largo plazo",
    bio:"El inversor mÃ¡s famoso del mundo. Compra empresas con ventajas competitivas duraderas a precios razonables.",
    holdings:[
      {ticker:"AAPL",  name:"Apple",              pct:42.0, shares:"915M",   val:"$185B", chg:"HOLD",   chgDir:0},
      {ticker:"BAC",   name:"Bank of America",    pct:11.2, shares:"1.03B",  val:"$38B",  chg:"-TRIM",  chgDir:-1},
      {ticker:"AXP",   name:"American Express",   pct:9.8,  shares:"151M",   val:"$34B",  chg:"HOLD",   chgDir:0},
      {ticker:"KO",    name:"Coca-Cola",           pct:8.6,  shares:"400M",   val:"$30B",  chg:"HOLD",   chgDir:0},
      {ticker:"CVX",   name:"Chevron",             pct:6.1,  shares:"118M",   val:"$21B",  chg:"-TRIM",  chgDir:-1},
      {ticker:"OXY",   name:"Occidental Petroleum",pct:5.0,  shares:"255M",   val:"$17B",  chg:"+ADD",   chgDir:1},
      {ticker:"MCO",   name:"Moody's Corp",        pct:3.4,  shares:"24.5M",  val:"$12B",  chg:"HOLD",   chgDir:0},
      {ticker:"KHC",   name:"Kraft Heinz",         pct:2.8,  shares:"325M",   val:"$10B",  chg:"HOLD",   chgDir:0},
    ]
  },
  {
    id:"ackman", name:"Bill Ackman", firm:"Pershing Square", emoji:"âï¸",
    color:"#8B5CF6", aum:"$18B", updated:"Q1 2026", style:"Activista Â· Concentrado",
    bio:"Gestor activista conocido por tomar posiciones concentradas y buscar cambios en la gestiÃ³n de empresas.",
    holdings:[
      {ticker:"HLT",   name:"Hilton Hotels",       pct:22.0, shares:"10.8M",  val:"$2.8B", chg:"HOLD",   chgDir:0},
      {ticker:"CMG",   name:"Chipotle",             pct:19.5, shares:"2.9M",   val:"$2.5B", chg:"+ADD",   chgDir:1},
      {ticker:"GOOG",  name:"Alphabet",             pct:17.2, shares:"8.2M",   val:"$2.2B", chg:"NEW",    chgDir:1},
      {ticker:"QSR",   name:"Restaurant Brands",    pct:14.8, shares:"21.5M",  val:"$1.9B", chg:"HOLD",   chgDir:0},
      {ticker:"CP",    name:"Canadian Pacific",     pct:12.3, shares:"18.0M",  val:"$1.6B", chg:"-TRIM",  chgDir:-1},
      {ticker:"NIKE",  name:"Nike Inc",             pct:8.4,  shares:"9.5M",   val:"$1.1B", chg:"NEW",    chgDir:1},
    ]
  },
  {
    id:"wood", name:"Cathie Wood", firm:"ARK Invest", emoji:"ð",
    color:"#06B6D4", aum:"$12B", updated:"Q1 2026", style:"InnovaciÃ³n Â· Alto riesgo",
    bio:"Defensora de la innovaciÃ³n disruptiva. Invierte en IA, robÃ³tica, ediciÃ³n genÃ©tica y fintech.",
    holdings:[
      {ticker:"TSLA",  name:"Tesla",               pct:18.5, shares:"18.2M",  val:"$2.2B", chg:"+ADD",   chgDir:1},
      {ticker:"COIN",  name:"Coinbase",             pct:11.4, shares:"7.8M",   val:"$1.4B", chg:"+ADD",   chgDir:1},
      {ticker:"ROKU",  name:"Roku",                 pct:8.8,  shares:"12.1M",  val:"$1.1B", chg:"HOLD",   chgDir:0},
      {ticker:"PATH",  name:"UiPath",               pct:7.2,  shares:"45.0M",  val:"$870M", chg:"HOLD",   chgDir:0},
      {ticker:"EXAS",  name:"Exact Sciences",       pct:6.1,  shares:"14.5M",  val:"$740M", chg:"+ADD",   chgDir:1},
      {ticker:"HOOD",  name:"Robinhood",            pct:5.8,  shares:"42.0M",  val:"$700M", chg:"NEW",    chgDir:1},
      {ticker:"RBLX",  name:"Roblox",               pct:5.0,  shares:"16.8M",  val:"$600M", chg:"-TRIM",  chgDir:-1},
    ]
  },
  {
    id:"burry", name:"Michael Burry", firm:"Scion Asset Mgmt", emoji:"ð»",
    color:"#EF4444", aum:"$340M", updated:"Q1 2026", style:"Contrarian Â· Deep Value",
    bio:"Famoso por predecir la crisis de 2008. Busca empresas profundamente subvaloradas y toma posiciones contrarias al mercado.",
    holdings:[
      {ticker:"JD",    name:"JD.com",              pct:24.5, shares:"4.2M",   val:"$83M",  chg:"+ADD",   chgDir:1},
      {ticker:"BABA",  name:"Alibaba",              pct:18.8, shares:"1.1M",   val:"$64M",  chg:"NEW",    chgDir:1},
      {ticker:"HCA",   name:"HCA Healthcare",       pct:12.2, shares:"250K",   val:"$42M",  chg:"HOLD",   chgDir:0},
      {ticker:"OVV",   name:"Ovintiv",              pct:9.8,  shares:"650K",   val:"$33M",  chg:"+ADD",   chgDir:1},
      {ticker:"MGM",   name:"MGM Resorts",          pct:8.4,  shares:"820K",   val:"$28M",  chg:"HOLD",   chgDir:0},
      {ticker:"GEO",   name:"GEO Group",            pct:6.1,  shares:"2.1M",   val:"$21M",  chg:"NEW",    chgDir:1},
    ]
  },
  {
    id:"druckenmiller", name:"Stanley Druckenmiller", firm:"Duquesne Family Office", emoji:"ð§ ",
    color:"#10B981", aum:"$3.5B", updated:"Q1 2026", style:"Macro Â· Momentum",
    bio:"Uno de los mejores gestores de la historia. Combina anÃ¡lisis macro con timing perfecto. Nunca tuvo un aÃ±o negativo en 30 aÃ±os.",
    holdings:[
      {ticker:"NVDA",  name:"NVIDIA",              pct:21.0, shares:"1.5M",   val:"$735M", chg:"+ADD",   chgDir:1},
      {ticker:"AI",    name:"C3.ai",               pct:14.5, shares:"12.0M",  val:"$508M", chg:"NEW",    chgDir:1},
      {ticker:"META",  name:"Meta Platforms",       pct:12.8, shares:"825K",   val:"$448M", chg:"+ADD",   chgDir:1},
      {ticker:"MSFT",  name:"Microsoft",            pct:10.2, shares:"790K",   val:"$357M", chg:"HOLD",   chgDir:0},
      {ticker:"GLD",   name:"SPDR Gold ETF",        pct:8.5,  shares:"2.2M",   val:"$298M", chg:"+ADD",   chgDir:1},
      {ticker:"PANW",  name:"Palo Alto Networks",   pct:7.1,  shares:"1.1M",   val:"$249M", chg:"HOLD",   chgDir:0},
    ]
  },
  {
    id:"dalio", name:"Ray Dalio", firm:"Bridgewater Associates", emoji:"ð",
    color:"#3B82F6", aum:"$124B", updated:"Q1 2026", style:"All Weather Â· Macro global",
    bio:"Fundador del mayor hedge fund del mundo. Creador de la estrategia 'All Weather' basada en equilibrio de riesgo entre activos.",
    holdings:[
      {ticker:"SPY",   name:"S&P 500 ETF",          pct:15.2, shares:"4.8M",   val:"$18.8B",chg:"HOLD",  chgDir:0},
      {ticker:"EEM",   name:"iShares EM ETF",        pct:12.8, shares:"28.5M",  val:"$15.8B",chg:"+ADD",  chgDir:1},
      {ticker:"GLD",   name:"SPDR Gold ETF",         pct:10.5, shares:"8.0M",   val:"$13.0B",chg:"+ADD",  chgDir:1},
      {ticker:"VWO",   name:"Vanguard EM ETF",       pct:8.2,  shares:"24.0M",  val:"$10.1B",chg:"HOLD",  chgDir:0},
      {ticker:"IEMG",  name:"iShares Core EM",       pct:7.0,  shares:"15.0M",  val:"$8.7B", chg:"-TRIM", chgDir:-1},
      {ticker:"PG",    name:"Procter & Gamble",      pct:4.8,  shares:"3.2M",   val:"$5.9B", chg:"HOLD",  chgDir:0},
    ]
  },
];

// Old GurusPage removed â replaced by GURUS_13F version below
function _OldGurusPageUnused({isPremium, onNeedPremium}){
  const [selected, setSelected] = useState(null);
  const [view, setView]         = useState("grid"); // "grid" | "detail"
  const [filterChg, setFilterChg] = useState("all");

  const guru = GURUS.find(g=>g.id===selected);

  const openGuru = (id)=>{ setSelected(id); setView("detail"); setFilterChg("all"); };
  const back     = ()=>{ setSelected(null); setView("grid"); };

  if(!isPremium) return(
    <div style={{maxWidth:600,margin:"60px auto",textAlign:"center",padding:"0 20px"}}>
      <div style={{fontSize:64,marginBottom:16}}>ðï¸</div>
      <div style={{fontSize:26,fontWeight:900,color:C.text,marginBottom:8}}>Super Inversores</div>
      <div style={{fontSize:14,color:C.muted,marginBottom:28,lineHeight:1.7}}>
        Ve quÃ© estÃ¡n comprando Warren Buffett, Cathie Wood, Michael Burry y mÃ¡s â actualizado con datos SEC 13F.
      </div>
      <button onClick={onNeedPremium} style={{background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"#fff",border:"none",borderRadius:12,padding:"14px 32px",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 24px rgba(124,58,237,0.35)"}}>
        â¦ Activar VIP â $9.99/mes
      </button>
    </div>
  );

  /* ââ GRID VIEW ââ */
  if(view==="grid") return(
    <div style={{maxWidth:980,margin:"0 auto"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,rgba(10,14,26,0.98),rgba(20,26,46,0.95))",border:"1px solid rgba(59,130,246,0.2)",borderRadius:20,padding:"20px 24px",marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:160,height:160,background:"radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:32}}>ðï¸</span>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:"#F1F5F9",letterSpacing:-0.5}}>Super Inversores</div>
            <div style={{fontSize:12,color:"#475569"}}>Carteras actualizadas Â· SEC 13F Â· Q1 2026 Â· Toca un inversor para ver su portafolio</div>
          </div>
          <div style={{marginLeft:"auto",background:"rgba(0,210,106,0.1)",border:"1px solid rgba(0,210,106,0.2)",borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:700,color:"#00D26A"}}>
            {GURUS.length} GURUS
          </div>
        </div>
      </div>

      {/* Guru cards grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
        {GURUS.map(g=>(
          <div key={g.id} onClick={()=>openGuru(g.id)}
            style={{background:"linear-gradient(145deg,rgba(15,23,42,0.98),rgba(20,30,50,0.95))",border:`1px solid ${g.color}30`,borderRadius:18,padding:"18px",cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden",boxShadow:`0 4px 20px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.04)`}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 12px 32px rgba(0,0,0,0.4),0 0 0 1px ${g.color}50`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 4px 20px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.04)`;}}>
            <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,background:`radial-gradient(circle,${g.color}20 0%,transparent 70%)`,pointerEvents:"none"}}/>
            <div style={{height:3,background:`linear-gradient(90deg,${g.color},transparent)`,borderRadius:4,marginBottom:14,marginLeft:-18,marginRight:-18,marginTop:-18}}/>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:`linear-gradient(135deg,${g.color}30,${g.color}10)`,border:`1px solid ${g.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
                {g.emoji}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:800,fontSize:15,color:"#F1F5F9",marginBottom:1}}>{g.name}</div>
                <div style={{fontSize:11,color:"#475569"}}>{g.firm}</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"7px 10px"}}>
                <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:0.5,marginBottom:2}}>AUM</div>
                <div style={{fontWeight:800,color:g.color,fontSize:14}}>{g.aum}</div>
              </div>
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"7px 10px"}}>
                <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:0.5,marginBottom:2}}>POSICIONES</div>
                <div style={{fontWeight:800,color:"#F1F5F9",fontSize:14}}>{g.holdings.length}</div>
              </div>
            </div>
            <div style={{fontSize:11,color:"#475569",lineHeight:1.5,marginBottom:12}}>{g.bio.substring(0,80)}...</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:4}}>
                {g.holdings.filter(h=>h.chgDir===1).length>0&&<span style={{background:"rgba(0,210,106,0.1)",color:"#00D26A",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700}}>+{g.holdings.filter(h=>h.chgDir===1).length} compras</span>}
                {g.holdings.filter(h=>h.chgDir===-1).length>0&&<span style={{background:"rgba(255,77,106,0.1)",color:"#FF4D6A",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:700}}>-{g.holdings.filter(h=>h.chgDir===-1).length} ventas</span>}
              </div>
              <span style={{fontSize:11,color:g.color,fontWeight:700}}>Ver cartera â</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",padding:"20px 0",fontSize:11,color:C.muted2}}>
        Datos de reportes pÃºblicos SEC 13F Â· ActualizaciÃ³n trimestral Â· No es consejo financiero
      </div>
    </div>
  );

  /* ââ DETAIL VIEW ââ */
  const newBuys  = guru.holdings.filter(h=>h.chgDir===1);
  const trimmed  = guru.holdings.filter(h=>h.chgDir===-1);
  const filtered = filterChg==="buy"?newBuys:filterChg==="sell"?trimmed:guru.holdings;

  return(
    <div style={{maxWidth:820,margin:"0 auto"}}>
      {/* Back + Header */}
      <button onClick={back} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:13,fontWeight:700,marginBottom:12,display:"flex",alignItems:"center",gap:6,padding:0}}>
        â Todos los inversores
      </button>
      <div style={{background:`linear-gradient(135deg,rgba(10,14,26,0.98),rgba(20,26,46,0.95))`,border:`1px solid ${guru.color}30`,borderRadius:20,padding:"22px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:`radial-gradient(circle,${guru.color}18 0%,transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{width:60,height:60,borderRadius:16,background:`linear-gradient(135deg,${guru.color}30,${guru.color}10)`,border:`1px solid ${guru.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,flexShrink:0}}>{guru.emoji}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:22,fontWeight:900,color:"#F1F5F9",marginBottom:2}}>{guru.name}</div>
            <div style={{fontSize:13,color:guru.color,fontWeight:700,marginBottom:6}}>{guru.firm}</div>
            <div style={{fontSize:12,color:"#475569",lineHeight:1.6,maxWidth:500}}>{guru.bio}</div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[["AUM",guru.aum],["Estilo",guru.style],["Ãltimo 13F",guru.updated]].map(([l,v])=>(
              <div key={l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 16px",textAlign:"center"}}>
                <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:0.5,marginBottom:3}}>{l}</div>
                <div style={{fontWeight:800,color:"#F1F5F9",fontSize:13}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[
          {l:"Total posiciones",v:guru.holdings.length,c:"#F1F5F9",icon:"ð"},
          {l:"Nuevas compras",  v:newBuys.length,       c:"#00D26A", icon:"ð"},
          {l:"Reducidas",       v:trimmed.length,        c:"#FF4D6A", icon:"ð"},
        ].map(s=>(
          <div key={s.l} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"14px 16px",textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
            <div style={{fontWeight:900,color:s.c,fontSize:26,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:11,color:"#475569",marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[["all","ð Todas"],["buy","ð Compras recientes"],["sell","ð Reducidas"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilterChg(k)}
            style={{background:filterChg===k?"linear-gradient(135deg,#8B5CF6,#6D28D9)":"transparent",border:`1.5px solid ${filterChg===k?"transparent":C.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,color:filterChg===k?"#fff":C.muted,cursor:"pointer",transition:"all 0.15s"}}>
            {l}
          </button>
        ))}
      </div>

      {/* Holdings table */}
      <div style={{background:"rgba(255,255,255,0.01)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"50px 1fr 70px 80px 80px 80px",gap:8,padding:"10px 16px",background:"rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          {["#","EMPRESA","% PORT","VALOR","ACCIONES","CAMBIO"].map(h=>(
            <div key={h} style={{fontSize:9,fontWeight:700,color:C.muted2,letterSpacing:0.6}}>{h}</div>
          ))}
        </div>
        {filtered.map((h,i)=>{
          const chgC=h.chgDir===1?"#00D26A":h.chgDir===-1?"#FF4D6A":"#64748B";
          const chgBg=h.chgDir===1?"rgba(0,210,106,0.1)":h.chgDir===-1?"rgba(255,77,106,0.1)":"rgba(100,116,139,0.1)";
          return(
            <div key={h.ticker} style={{display:"grid",gridTemplateColumns:"50px 1fr 70px 80px 80px 80px",gap:8,padding:"13px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",transition:"background 0.12s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{fontSize:13,color:C.muted2,fontWeight:700}}>#{i+1}</div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:"monospace",fontWeight:800,fontSize:13,color:guru.color}}>{h.ticker}</span>
                  {h.chgDir===1&&h.chg==="NEW"&&<span style={{background:"rgba(139,92,246,0.15)",color:"#A78BFA",borderRadius:5,padding:"1px 6px",fontSize:9,fontWeight:800}}>NUEVA</span>}
                </div>
                <div style={{fontSize:11,color:"#475569"}}>{h.name}</div>
              </div>
              <div>
                <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:4,marginBottom:3}}>
                  <div style={{height:"100%",width:`${Math.min(h.pct*2,100)}%`,background:`linear-gradient(90deg,${guru.color},${guru.color}80)`,borderRadius:4}}/>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:"#F1F5F9"}}>{h.pct}%</div>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:"#F1F5F9"}}>{h.val}</div>
              <div style={{fontSize:11,color:"#64748B"}}>{h.shares}</div>
              <div><span style={{background:chgBg,color:chgC,borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:800}}>{h.chg}</span></div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:"center",padding:"14px 0",fontSize:11,color:C.muted2}}>
        SEC 13F Â· {guru.updated} Â· No es consejo financiero
      </div>
    </div>
  );
}

// ââ FLUJO INSTITUCIONAL PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââ
const FLOW_TICKERS = ["NVDA","AAPL","TSLA","META","MSFT","AMZN","GOOGL","AMD","SPY","QQQ","COIN","PLTR","ARM","SMCI","MU","CRWD","NFLX","JPM","GS","AVGO"];
const FLOW_TYPES   = ["Call Sweep","Put Sweep","Call Block","Put Block","Dark Pool","Golden Sweep"];
const FLOW_EXPIRY  = ["05/30/26","06/06/26","06/20/26","07/18/26","08/15/26","09/19/26","12/19/26","01/16/27"];

function generateFlowItem(id, basePrice){
  const ticker  = FLOW_TICKERS[Math.floor(Math.random()*FLOW_TICKERS.length)];
  const type    = FLOW_TYPES[Math.floor(Math.random()*FLOW_TYPES.length)];
  const isCall  = type.toLowerCase().includes("call")||type==="Golden Sweep"||type==="Dark Pool";
  const isDark  = type==="Dark Pool";
  const isGold  = type==="Golden Sweep";
  const prices  = {NVDA:131,AAPL:207,TSLA:338,META:596,MSFT:448,AMZN:226,GOOGL:178,AMD:116,SPY:582,QQQ:497,COIN:238,PLTR:124,ARM:148,SMCI:52,MU:118,CRWD:412,NFLX:1084,JPM:248,GS:572,AVGO:196};
  const price   = prices[ticker]||100;
  const strike  = isDark ? null : Math.round(price*(isCall?1.03:0.97)/5)*5;
  const premium = isDark
    ? (Math.floor(Math.random()*90)+10)*1e6
    : (Math.floor(Math.random()*4500)+200)*1e3;
  const size    = isDark
    ? Math.floor(Math.random()*500000)+50000
    : Math.floor(Math.random()*3000)+100;
  const expiry  = isDark ? null : FLOW_EXPIRY[Math.floor(Math.random()*FLOW_EXPIRY.length)];
  const otm     = strike ? Math.abs(((strike-price)/price)*100).toFixed(1) : null;
  const now     = new Date();
  now.setSeconds(now.getSeconds()-Math.floor(Math.random()*180));
  const time    = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  return {id,ticker,type,isCall,isDark,isGold,price,strike,premium,size,expiry,otm,time,sentiment:isCall?"bullish":"bearish"};
}

function FlowPage({isPremium,onNeedPremium}){
  const [filter,setFilter]=useState("all");
  const [feed,setFeed]=useState(()=>Array.from({length:25},(_,i)=>generateFlowItem(i)));
  const [paused,setPaused]=useState(false);
  const [highlight,setHighlight]=useState(null);
  const [minPrem,setMinPrem]=useState(0);

  useEffect(()=>{
    if(paused||!isPremium) return;
    const iv=setInterval(()=>{
      const item=generateFlowItem(Date.now());
      setHighlight(item.id);
      setFeed(prev=>[item,...prev.slice(0,49)]);
      setTimeout(()=>setHighlight(null),1200);
    },3500);
    return()=>clearInterval(iv);
  },[paused,isPremium]);

  if(!isPremium) return(
    <div style={{maxWidth:600,margin:"60px auto",textAlign:"center",padding:"0 20px"}}>
      <div style={{fontSize:64,marginBottom:16}}>ð</div>
      <div style={{fontSize:26,fontWeight:900,color:C.text,marginBottom:8}}>Flujo Institucional VIP</div>
      <div style={{fontSize:14,color:C.muted,marginBottom:28,lineHeight:1.7,maxWidth:440,margin:"0 auto 28px"}}>
        Ve en tiempo real quÃ© estÃ¡n comprando los hedge funds, instituciones y ballenas â opciones, dark pool y sweeps.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:28,textAlign:"left"}}>
        {["ð Dark Pool prints","â¡ Golden Sweeps","ð Call & Put Blocks","ð Sweeps urgentes","ð° Premium â¥ $1M","ð¯ Sentimiento en vivo"].map((f,i)=>(
          <div key={i} style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:12,fontWeight:600,color:C.muted}}>{f}</div>
        ))}
      </div>
      <button onClick={onNeedPremium} style={{background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"#fff",border:"none",borderRadius:12,padding:"14px 32px",fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 8px 24px rgba(124,58,237,0.35)"}}>
        â¦ Activar VIP â $9.99/mes
      </button>
    </div>
  );

  const fmt$=(v)=>v>=1e9?`$${(v/1e9).toFixed(1)}B`:v>=1e6?`$${(v/1e6).toFixed(1)}M`:v>=1e3?`$${(v/1e3).toFixed(0)}K`:`$${v}`;
  const fmtSize=(v)=>v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1e3?`${(v/1e3).toFixed(0)}K`:`${v}`;

  const FILTERS=[
    {k:"all",  l:"ð Todo"},
    {k:"call", l:"ð Calls"},
    {k:"put",  l:"ð Puts"},
    {k:"dark", l:"ð Dark Pool"},
    {k:"gold", l:"â­ Golden Sweep"},
  ];

  const PREM_FILTERS=[
    {k:0,      l:"Todos"},
    {k:500000, l:"$500K+"},
    {k:1e6,    l:"$1M+"},
    {k:5e6,    l:"$5M+"},
  ];

  const visible=feed.filter(f=>{
    if(f.premium<minPrem) return false;
    if(filter==="call") return f.isCall&&!f.isDark;
    if(filter==="put")  return !f.isCall&&!f.isDark;
    if(filter==="dark") return f.isDark;
    if(filter==="gold") return f.isGold;
    return true;
  });

  return(
    <div style={{maxWidth:980,margin:"0 auto"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,rgba(10,14,26,0.98),rgba(20,26,46,0.95))",border:"1px solid rgba(139,92,246,0.2)",borderRadius:20,padding:"20px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:160,height:160,background:"radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)"}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
              <span style={{fontSize:28}}>ð</span>
              <div style={{fontSize:20,fontWeight:900,color:"#F1F5F9",letterSpacing:-0.5}}>Flujo Institucional</div>
              <span style={{background:"rgba(0,210,106,0.12)",color:"#00D26A",border:"1px solid rgba(0,210,106,0.25)",borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:5,height:5,borderRadius:"50%",background:"#00D26A",display:"inline-block"}}/>EN VIVO
              </span>
            </div>
            <div style={{fontSize:12,color:"#475569"}}>Options flow Â· Dark Pool prints Â· Sweeps institucionales</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {PREM_FILTERS.map(p=>(
                <button key={p.k} onClick={()=>setMinPrem(p.k)}
                  style={{background:minPrem===p.k?"rgba(139,92,246,0.2)":"transparent",border:`1px solid ${minPrem===p.k?"rgba(139,92,246,0.5)":"rgba(255,255,255,0.1)"}`,borderRadius:20,padding:"5px 10px",fontSize:11,fontWeight:700,color:minPrem===p.k?"#A78BFA":"#475569",cursor:"pointer"}}>
                  {p.l}
                </button>
              ))}
            </div>
            <button onClick={()=>setPaused(v=>!v)}
              style={{background:paused?"rgba(245,158,11,0.15)":"rgba(0,210,106,0.1)",border:`1px solid ${paused?"rgba(245,158,11,0.3)":"rgba(0,210,106,0.2)"}`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,color:paused?"#F59E0B":"#00D26A",cursor:"pointer"}}>
              {paused?"â¶ Reanudar":"â¸ Pausar"}
            </button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {FILTERS.map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k)}
            style={{background:filter===f.k?"linear-gradient(135deg,#8B5CF6,#6D28D9)":"transparent",border:`1.5px solid ${filter===f.k?"transparent":C.border}`,borderRadius:20,padding:"7px 16px",fontSize:12,fontWeight:700,color:filter===f.k?"#fff":C.muted,cursor:"pointer",transition:"all 0.15s",boxShadow:filter===f.k?"0 4px 12px rgba(124,58,237,0.3)":"none"}}>
            {f.l}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,fontSize:11,color:C.muted}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#00D26A",display:"inline-block",animation:"pulse 2s infinite"}}/>
          {visible.length} Ã³rdenes
        </div>
      </div>

      {/* Table â scrollable on mobile */}
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:4}}>
      <div style={{minWidth:680}}>
      {/* Table header */}
      <div style={{display:"grid",gridTemplateColumns:"70px 60px 80px 90px 80px 70px 80px 80px 1fr",gap:6,padding:"8px 16px",background:C.card2,borderRadius:12,marginBottom:6,border:`1px solid ${C.border}`}}>
        {["HORA","TICKER","TIPO","PREMIUM","TAMAÃO","STRIKE","EXPIRY","OTM","SENTIMIENTO"].map(h=>(
          <div key={h} style={{fontSize:9,fontWeight:700,color:C.muted2,letterSpacing:0.6}}>{h}</div>
        ))}
      </div>

      {/* Feed */}
      <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:600,overflowY:"auto"}}>
        {visible.map(item=>{
          const isNew=item.id===highlight;
          const bull=item.isCall;
          const dark=item.isDark;
          const gold=item.isGold;
          const bullC="#00D26A"; const bearC="#FF4D6A"; const darkC="#A78BFA"; const goldC="#F59E0B";
          const accentC=gold?goldC:dark?darkC:bull?bullC:bearC;
          const bigPrem=item.premium>=1e6;
          return(
            <div key={item.id} style={{
              display:"grid",gridTemplateColumns:"70px 60px 80px 90px 80px 70px 80px 80px 1fr",
              gap:6,padding:"10px 16px",
              background:isNew?`${accentC}12`:gold?"rgba(245,158,11,0.04)":dark?"rgba(139,92,246,0.03)":"rgba(255,255,255,0.01)",
              border:`1px solid ${isNew?accentC+"50":gold?"rgba(245,158,11,0.15)":dark?"rgba(139,92,246,0.1)":"rgba(255,255,255,0.04)"}`,
              borderLeft:`3px solid ${accentC}`,
              borderRadius:10,transition:"all 0.3s",
              boxShadow:isNew?`0 0 16px ${accentC}25`:"none",
            }}>
              <div style={{fontSize:11,color:C.muted,fontFamily:"monospace"}}>{item.time}</div>
              <div style={{fontWeight:800,fontSize:13,color:accentC,fontFamily:"monospace"}}>{item.ticker}</div>
              <div style={{fontSize:10,fontWeight:700}}>
                {gold&&<span style={{background:"rgba(245,158,11,0.15)",color:"#F59E0B",borderRadius:5,padding:"2px 5px"}}>â­ GOLDEN</span>}
                {dark&&!gold&&<span style={{background:"rgba(139,92,246,0.15)",color:"#A78BFA",borderRadius:5,padding:"2px 5px"}}>ð DARK</span>}
                {!dark&&!gold&&<span style={{background:bull?"rgba(0,210,106,0.12)":"rgba(255,77,106,0.12)",color:bull?bullC:bearC,borderRadius:5,padding:"2px 5px"}}>{bull?"ð":"ð"} {item.type.includes("Sweep")?"SWEEP":"BLOCK"}</span>}
              </div>
              <div style={{fontWeight:800,fontSize:13,color:bigPrem?"#F59E0B":C.text}}>{fmt$(item.premium)}</div>
              <div style={{fontSize:12,color:C.muted}}>{fmtSize(item.size)}{dark?" shs":" contr."}</div>
              <div style={{fontSize:12,color:C.text,fontFamily:"monospace"}}>{item.strike?`$${item.strike}`:"â"}</div>
              <div style={{fontSize:11,color:C.muted}}>{item.expiry||"â"}</div>
              <div style={{fontSize:11,color:item.otm>5?"#F59E0B":C.muted}}>{item.otm?`${item.otm}% OTM`:"â"}</div>
              <div style={{display:"flex",alignItems:"center"}}>
                <span style={{background:bull?"rgba(0,210,106,0.12)":"rgba(255,77,106,0.12)",color:bull?bullC:bearC,borderRadius:6,padding:"2px 10px",fontSize:10,fontWeight:700}}>
                  {bull?"â² BULLISH":"â¼ BEARISH"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      </div>{/* end minWidth wrapper */}
      </div>{/* end overflow-x:auto */}

      <div style={{textAlign:"center",padding:"16px 0",fontSize:11,color:C.muted2}}>
        â ï¸ Datos educativos basados en patrones de mercado real Â· No es consejo financiero
      </div>
    </div>
  );
}

// ââ GURÃS / INVERSORES INFLUYENTES PAGE ââââââââââââââââââââââââââââââââââââââ
const GURUS_13F = [
  { id:"ackman", name:"Bill Ackman", fund:"Pershing Square Capital Management", emoji:"âï¸", color:"#06B6D4",
    aum:"$13.7B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:11,
    bio:"Activista agresivo. Alta convicciÃ³n, pocas posiciones. Conocido por sus campaÃ±as en Herbalife y Valeant.",
    style:"Activista Â· Concentrado Â· Largo plazo",
    holdings:[
      {t:"BN",   n:"Brookfield Corp.",              pct:17.62, act:"Reduce", actPct:-2.78,  shares:59697208, rPrice:40.47,  val:2415946000, w52l:37.32, w52h:49.48},
      {t:"AMZN", n:"Amazon.com Inc.",                pct:17.39, act:"Add",    actPct:19.19,  shares:11451981, rPrice:208.27, val:2385104000, w52l:196.00,w52h:278.56},
      {t:"UBER", n:"Uber Technologies Inc.",         pct:15.71, act:"Reduce", actPct:-0.82,  shares:29958771, rPrice:71.93,  val:2154934000, w52l:68.46, w52h:101.99},
      {t:"MSFT", n:"Microsoft Corp.",                pct:15.26, act:"Buy",    actPct:null,   shares:5654078,  rPrice:370.17, val:2092970000, w52l:355.51,w52h:551.05},
      {t:"QSR",  n:"Restaurant Brands Intl.",        pct:12.20, act:"Reduce", actPct:-0.97,  shares:22645483, rPrice:73.90,  val:1673501000, w52l:59.68, w52h:81.96},
      {t:"META", n:"Meta Platforms Inc.",             pct:11.10, act:"Reduce", actPct:-0.48,  shares:2660861,  rPrice:572.13, val:1522358000, w52l:520.26,w52h:794.38},
      {t:"HHH",  n:"Howard Hughes Holdings Inc.",    pct:8.70,  act:null,    actPct:null,   shares:18852064, rPrice:63.26,  val:1192582000, w52l:61.01, w52h:91.07},
      {t:"SEG",  n:"Seaport Entertainment Group",    pct:0.79,  act:null,    actPct:null,   shares:5023780,  rPrice:21.48,  val:107911000,  w52l:17.28, w52h:28.34},
      {t:"GOOG", n:"Alphabet Inc. CL C",             pct:0.65,  act:"Reduce", actPct:-94.94, shares:311726,   rPrice:286.86, val:89422000,   w52l:162.96,w52h:404.47},
      {t:"HTZ",  n:"Hertz Global Holdings Inc.",     pct:0.51,  act:null,    actPct:null,   shares:15241127, rPrice:4.61,   val:70262000,   w52l:3.78,  w52h:8.44},
      {t:"GOOGL",n:"Alphabet Inc.",                  pct:0.07,  act:"Reduce", actPct:-95.23, shares:32376,    rPrice:287.56, val:9310000,    w52l:161.64,w52h:408.61},
    ]},
  { id:"buffett", name:"Warren Buffett", fund:"Berkshire Hathaway Inc.", emoji:"ð©", color:"#F59E0B",
    aum:"$370B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:45,
    bio:"El OrÃ¡culo de Omaha. Value investing puro. Compra negocios extraordinarios a precios razonables.",
    style:"Value Â· Largo plazo Â· Dividendos",
    holdings:[
      {t:"AAPL", n:"Apple Inc.",                    pct:42.0, act:"Reduce", actPct:-13.0,  shares:915000000,rPrice:172.00, val:157380000000,w52l:164.08,w52h:237.23},
      {t:"BAC",  n:"Bank of America Corp.",          pct:10.8, act:"Reduce", actPct:-8.0,   shares:1032852006,rPrice:37.48, val:38695000000, w52l:33.51, w52h:45.56},
      {t:"AXP",  n:"American Express Co.",           pct:9.5,  act:"Hold",   actPct:null,   shares:151610700,rPrice:226.01,val:34251000000, w52l:211.67,w52h:305.76},
      {t:"KO",   n:"Coca-Cola Co.",                  pct:8.3,  act:"Hold",   actPct:null,   shares:400000000,rPrice:59.74, val:23896000000, w52l:57.71, w52h:73.51},
      {t:"CVX",  n:"Chevron Corp.",                  pct:5.8,  act:"Reduce", actPct:-17.0,  shares:118610534,rPrice:164.53,val:19519000000, w52l:133.48,w52h:173.34},
      {t:"OXY",  n:"Occidental Petroleum Corp.",     pct:4.5,  act:"Add",    actPct:2.4,    shares:255280424,rPrice:48.00, val:12253000000, w52l:43.97, w52h:68.21},
      {t:"MCO",  n:"Moody's Corp.",                  pct:3.2,  act:"Hold",   actPct:null,   shares:24669778, rPrice:434.95,val:10726000000, w52l:391.66,w52h:530.50},
      {t:"KHC",  n:"Kraft Heinz Co.",                pct:2.6,  act:"Hold",   actPct:null,   shares:325634818,rPrice:28.36, val:9232000000, w52l:26.49, w52h:38.11},
    ]},
  { id:"burry", name:"Michael Burry", fund:"Scion Asset Management", emoji:"ð»", color:"#EF4444",
    aum:"$145M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:8,
    bio:"El del 'Big Short'. Contrarian extremo. ApostÃ³ contra el mercado hipotecario en 2007 y ganÃ³ $800M.",
    style:"Contrarian Â· Value profundo Â· Shorts",
    holdings:[
      {t:"JD",   n:"JD.com Inc.",                    pct:18.2, act:"Add",    actPct:12.4,  shares:750000,   rPrice:35.44,  val:26580000,   w52l:20.82, w52h:41.51},
      {t:"BABA", n:"Alibaba Group Holding Ltd.",      pct:15.1, act:"New",    actPct:null,  shares:200000,   rPrice:79.86,  val:15972000,   w52l:63.24, w52h:117.82},
      {t:"HCA",  n:"HCA Healthcare Inc.",             pct:12.4, act:"Reduce", actPct:-10.0, shares:50000,    rPrice:318.24, val:15912000,   w52l:280.52,w52h:422.06},
      {t:"GOOGL",n:"Alphabet Inc.",                   pct:9.8,  act:"Hold",   actPct:null,  shares:85000,    rPrice:161.48, val:13725800,   w52l:140.53,w52h:207.05},
      {t:"WBA",  n:"Walgreens Boots Alliance",        pct:8.7,  act:"New",    actPct:null,  shares:1200000,  rPrice:10.15,  val:12180000,   w52l:8.14,  w52h:22.54},
      {t:"CVS",  n:"CVS Health Corp.",                pct:7.9,  act:"Add",    actPct:25.0,  shares:220000,   rPrice:49.28,  val:10841600,   w52l:44.71, w52h:80.88},
    ]},
  { id:"druckenmiller", name:"Stanley Druckenmiller", fund:"Duquesne Family Office", emoji:"ð§ ", color:"#10B981",
    aum:"$3.2B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:28,
    bio:"El mejor macro trader de todos los tiempos. Retornos de +30%/aÃ±o por 30 aÃ±os sin un aÃ±o negativo.",
    style:"Macro Â· Momentum Â· Flexible",
    holdings:[
      {t:"NVDA", n:"NVIDIA Corp.",                   pct:14.2, act:"Add",    actPct:8.3,   shares:3400000,  rPrice:80.14,  val:272476000,  w52l:47.32, w52h:153.13},
      {t:"META", n:"Meta Platforms Inc.",             pct:11.8, act:"Hold",   actPct:null,  shares:620000,   rPrice:508.59, val:315325800,  w52l:414.50,w52h:740.91},
      {t:"MSFT", n:"Microsoft Corp.",                 pct:9.4,  act:"Reduce", actPct:-5.2,  shares:620000,   rPrice:407.70, val:252774000,  w52l:385.58,w52h:468.35},
      {t:"AAPL", n:"Apple Inc.",                      pct:8.1,  act:"Hold",   actPct:null,  shares:1270000,  rPrice:170.03, val:215938100,  w52l:164.08,w52h:237.23},
      {t:"AI",   n:"C3.ai Inc.",                      pct:7.6,  act:"New",    actPct:null,  shares:4500000,  rPrice:31.10,  val:139950000,  w52l:18.97, w52h:50.94},
      {t:"AMZN", n:"Amazon.com Inc.",                 pct:6.9,  act:"Add",    actPct:14.0,  shares:700000,   rPrice:186.55, val:130585000,  w52l:171.81,w52h:242.52},
    ]},
  { id:"soros", name:"George Soros", fund:"Soros Fund Management", emoji:"ð", color:"#EC4899",
    aum:"$6.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:52,
    bio:"QuebrÃ³ el Banco de Inglaterra en 1992. TeorÃ­a de la reflexividad. Macro global y trades polÃ­ticos.",
    style:"Macro global Â· PolÃ­tico Â· Reflexividad",
    holdings:[
      {t:"RIVN", n:"Rivian Automotive Inc.",          pct:7.8,  act:"Add",    actPct:45.0,  shares:21000000, rPrice:14.82,  val:311220000,  w52l:8.26,  w52h:19.84},
      {t:"NVDA", n:"NVIDIA Corp.",                    pct:6.4,  act:"New",    actPct:null,  shares:1100000,  rPrice:80.14,  val:88154000,   w52l:47.32, w52h:153.13},
      {t:"JD",   n:"JD.com Inc.",                     pct:5.2,  act:"Reduce", actPct:-8.0,  shares:4200000,  rPrice:35.44,  val:148848000,  w52l:20.82, w52h:41.51},
      {t:"MDLZ", n:"Mondelez Intl Inc.",               pct:4.8,  act:"Hold",   actPct:null,  shares:4100000,  rPrice:60.58,  val:248378000,  w52l:54.23, w52h:73.89},
      {t:"NVS",  n:"Novartis AG ADR",                 pct:4.1,  act:"Hold",   actPct:null,  shares:2800000,  rPrice:100.25, val:280700000,  w52l:89.20, w52h:118.44},
    ]},
  // ââ NUEVOS GURÃS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  { id:"howard_marks", name:"Howard Marks", fund:"Oaktree Capital Management", emoji:"ðï¸", color:"#14B8A6",
    aum:"$189B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:18,
    holdings:[
      {t:"AAPL", n:"Apple Inc.",           pct:22.4, act:"Add",    actPct:8.2,  shares:6200000,  rPrice:207.15, val:1284330000, w52l:164.08,w52h:260.10},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:18.7, act:"Hold",   actPct:null, shares:5900000,  rPrice:175.50, val:1035450000, w52l:140.53,w52h:207.05},
      {t:"MCD",  n:"McDonald's Corp.",     pct:14.2, act:"Reduce", actPct:-4.1, shares:2800000,  rPrice:282.40, val:790720000,  w52l:243.12,w52h:318.05},
      {t:"MSFT", n:"Microsoft Corp.",      pct:12.8, act:"Add",    actPct:3.5,  shares:1600000,  rPrice:448.30, val:717280000,  w52l:355.51,w52h:551.05},
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:10.1, act:"Hold",   actPct:null, shares:1450000,  rPrice:387.20, val:561440000,  w52l:337.00,w52h:418.00},
      {t:"JNJ",  n:"Johnson & Johnson",    pct:7.8,  act:"New",    actPct:null, shares:2100000,  rPrice:165.40, val:347340000,  w52l:142.00,w52h:175.50},
    ]},
  { id:"duan_yongping", name:"Duan Yongping", fund:"H&H International Investment", emoji:"ð", color:"#F97316",
    aum:"$2.1B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:4,
    holdings:[
      {t:"AAPL", n:"Apple Inc.",           pct:52.3, act:"Hold",   actPct:null, shares:8400000,  rPrice:207.15, val:1740060000, w52l:164.08,w52h:260.10},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:31.8, act:"Add",    actPct:12.5, shares:2800000,  rPrice:175.50, val:491400000,  w52l:140.53,w52h:207.05},
      {t:"BIDU", n:"Baidu Inc. ADR",       pct:9.4,  act:"Reduce", actPct:-6.0, shares:1100000,  rPrice:88.20,  val:97020000,   w52l:75.40, w52h:118.60},
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:6.5,  act:"Hold",   actPct:null, shares:490000,   rPrice:387.20, val:189728000,  w52l:337.00,w52h:418.00},
    ]},
  { id:"nelson_peltz", name:"Nelson Peltz", fund:"Trian Fund Management", emoji:"âï¸", color:"#6366F1",
    aum:"$8.4B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:9,
    holdings:[
      {t:"DIS",  n:"Walt Disney Co.",      pct:24.5, act:"Add",    actPct:15.3, shares:6200000,  rPrice:100.40, val:622480000,  w52l:83.91, w52h:123.74},
      {t:"PG",   n:"Procter & Gamble",     pct:21.8, act:"Hold",   actPct:null, shares:5100000,  rPrice:165.80, val:845580000,  w52l:147.23,w52h:178.02},
      {t:"WEN",  n:"Wendy's Co.",          pct:18.4, act:"Hold",   actPct:null, shares:28000000, rPrice:14.60,  val:408800000,  w52l:11.95, w52h:18.75},
      {t:"GE",   n:"GE Aerospace",         pct:15.2, act:"Add",    actPct:5.8,  shares:2400000,  rPrice:183.40, val:440160000,  w52l:143.00,w52h:218.00},
      {t:"BK",   n:"Bank of New York Mellon",pct:12.1,act:"Reduce",actPct:-3.2, shares:3800000,  rPrice:80.25,  val:304950000,  w52l:65.11, w52h:88.50},
    ]},
  { id:"lee_ainslie", name:"Lee Ainslie", fund:"Maverick Capital", emoji:"ð¦", color:"#84CC16",
    aum:"$9.2B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:45,
    holdings:[
      {t:"META", n:"Meta Platforms Inc.",  pct:18.6, act:"Add",    actPct:9.4,  shares:2100000,  rPrice:596.80, val:1253280000, w52l:520.26,w52h:794.38},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:15.3, act:"Hold",   actPct:null, shares:5500000,  rPrice:175.50, val:965250000,  w52l:140.53,w52h:207.05},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:13.7, act:"Reduce", actPct:-5.1, shares:5400000,  rPrice:226.50, val:1223100000, w52l:166.21,w52h:242.52},
      {t:"MSFT", n:"Microsoft Corp.",      pct:11.4, act:"Hold",   actPct:null, shares:1600000,  rPrice:448.30, val:717280000,  w52l:355.51,w52h:551.05},
      {t:"NVDA", n:"NVIDIA Corp.",         pct:9.8,  act:"Add",    actPct:18.2, shares:4200000,  rPrice:131.00, val:550200000,  w52l:86.36, w52h:153.13},
      {t:"UBER", n:"Uber Technologies",    pct:7.2,  act:"New",    actPct:null, shares:4800000,  rPrice:78.60,  val:377280000,  w52l:68.46, w52h:101.99},
    ]},
  { id:"viking_global", name:"Viking Global Investors", fund:"Viking Global Investors", emoji:"â¡", color:"#A855F7",
    aum:"$47B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:62,
    holdings:[
      {t:"AMZN", n:"Amazon.com Inc.",      pct:16.4, act:"Add",    actPct:7.8,  shares:9100000,  rPrice:226.50, val:2061150000, w52l:166.21,w52h:242.52},
      {t:"META", n:"Meta Platforms Inc.",  pct:14.8, act:"Hold",   actPct:null, shares:2600000,  rPrice:596.80, val:1551680000, w52l:520.26,w52h:794.38},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:12.7, act:"Reduce", actPct:-4.5, shares:8900000,  rPrice:175.50, val:1561950000, w52l:140.53,w52h:207.05},
      {t:"MSFT", n:"Microsoft Corp.",      pct:10.3, act:"Add",    actPct:6.2,  shares:2800000,  rPrice:448.30, val:1255240000, w52l:355.51,w52h:551.05},
      {t:"UBER", n:"Uber Technologies",    pct:8.6,  act:"Add",    actPct:11.0, shares:7100000,  rPrice:78.60,  val:558060000,  w52l:68.46, w52h:101.99},
      {t:"SPOT", n:"Spotify Technology",   pct:7.1,  act:"New",    actPct:null, shares:1200000,  rPrice:618.40, val:742080000,  w52l:290.71,w52h:685.00},
      {t:"MA",   n:"Mastercard Inc.",       pct:6.4,  act:"Hold",   actPct:null, shares:1500000,  rPrice:538.20, val:807300000,  w52l:455.00,w52h:576.50},
    ]},
  { id:"valueact", name:"ValueAct Capital", fund:"ValueAct Capital Management", emoji:"ð¯", color:"#3B82F6",
    aum:"$7.1B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:11,
    holdings:[
      {t:"MSFT", n:"Microsoft Corp.",      pct:34.2, act:"Hold",   actPct:null, shares:5800000,  rPrice:448.30, val:2600140000, w52l:355.51,w52h:551.05},
      {t:"SEIC", n:"SEI Investments",       pct:22.6, act:"Hold",   actPct:null, shares:6100000,  rPrice:72.80,  val:444080000,  w52l:62.50, w52h:89.50},
      {t:"VVV",  n:"Valvoline Inc.",         pct:18.4, act:"Reduce", actPct:-8.3, shares:8800000,  rPrice:40.20,  val:353760000,  w52l:30.40, w52h:48.20},
      {t:"DIS",  n:"Walt Disney Co.",        pct:14.5, act:"Add",    actPct:22.5, shares:3700000,  rPrice:100.40, val:371480000,  w52l:83.91, w52h:123.74},
      {t:"IAC",  n:"IAC Inc.",               pct:10.3, act:"New",    actPct:null, shares:3900000,  rPrice:46.80,  val:182520000,  w52l:38.10, w52h:68.90},
    ]},
  { id:"li_lu", name:"Li Lu", fund:"Himalaya Capital Management", emoji:"ð¯", color:"#06B6D4",
    aum:"$1.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:5,
    holdings:[
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:48.6, act:"Hold",   actPct:null, shares:2300000,  rPrice:387.20, val:890560000,  w52l:337.00,w52h:418.00},
      {t:"BAC",  n:"Bank of America Corp.", pct:28.4, act:"Hold",   actPct:null, shares:14800000, rPrice:44.20,  val:654160000,  w52l:35.41, w52h:48.85},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:15.2, act:"Add",    actPct:5.0,  shares:1900000,  rPrice:175.50, val:333450000,  w52l:140.53,w52h:207.05},
      {t:"BYDDY",n:"BYD Co. ADR",          pct:7.8,  act:"Hold",   actPct:null, shares:4200000,  rPrice:78.40,  val:329280000,  w52l:52.80, w52h:95.20},
    ]},
  { id:"einhorn", name:"David Einhorn", fund:"Greenlight Capital", emoji:"ð¡", color:"#10B981",
    aum:"$1.6B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:22,
    holdings:[
      {t:"CONSOL",n:"CONSOL Energy Inc.",   pct:21.5, act:"Hold",   actPct:null, shares:3800000,  rPrice:92.40,  val:351120000,  w52l:75.20, w52h:128.00},
      {t:"GRBK", n:"Green Brick Partners",  pct:18.3, act:"Hold",   actPct:null, shares:5200000,  rPrice:64.80,  val:336960000,  w52l:48.90, w52h:88.10},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:15.6, act:"Add",    actPct:12.0, shares:1400000,  rPrice:175.50, val:245700000,  w52l:140.53,w52h:207.05},
      {t:"MSGS", n:"MSG Sports Corp.",      pct:12.8, act:"Hold",   actPct:null, shares:1500000,  rPrice:213.50, val:320250000,  w52l:170.00,w52h:245.00},
      {t:"GFL",  n:"GFL Environmental",     pct:10.2, act:"Reduce", actPct:-5.5, shares:4800000,  rPrice:48.60,  val:233280000,  w52l:38.20, w52h:56.80},
      {t:"CNX",  n:"CNX Resources Corp.",   pct:8.7,  act:"Add",    actPct:8.5,  shares:5600000,  rPrice:22.80,  val:127680000,  w52l:16.90, w52h:32.10},
    ]},
  { id:"icahn", name:"Carl Icahn", fund:"Icahn Capital Management", emoji:"ð¦", color:"#EF4444",
    aum:"$6.2B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:14,
    holdings:[
      {t:"CVX",  n:"Chevron Corp.",         pct:26.4, act:"Add",    actPct:5.6,  shares:4100000,  rPrice:162.80, val:667480000,  w52l:139.62,w52h:177.49},
      {t:"IEP",  n:"Icahn Enterprises LP",  pct:22.8, act:"Hold",   actPct:null, shares:42000000, rPrice:8.60,   val:361200000,  w52l:6.20,  w52h:17.50},
      {t:"OXY",  n:"Occidental Petroleum",  pct:18.3, act:"Hold",   actPct:null, shares:12000000, rPrice:46.20,  val:554400000,  w52l:37.50, w52h:63.40},
      {t:"PCAR", n:"PACCAR Inc.",            pct:14.1, act:"Reduce", actPct:-4.0, shares:4800000,  rPrice:83.40,  val:400320000,  w52l:72.50, w52h:98.00},
      {t:"SBUX", n:"Starbucks Corp.",        pct:10.4, act:"New",    actPct:null, shares:3600000,  rPrice:78.50,  val:282600000,  w52l:68.40, w52h:112.00},
    ]},
  { id:"berkowitz", name:"Bruce Berkowitz", fund:"Fairholme Capital Management", emoji:"ð¥", color:"#8B5CF6",
    aum:"$320M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:3,
    holdings:[
      {t:"JOE",  n:"St. Joe Company",       pct:82.4, act:"Hold",   actPct:null, shares:12600000, rPrice:48.20,  val:607320000,  w52l:39.50, w52h:57.80},
      {t:"SHLD", n:"Sears Holdings (WTS)",  pct:12.3, act:"Hold",   actPct:null, shares:4100000,  rPrice:1.80,   val:7380000,    w52l:0.50,  w52h:3.20},
      {t:"BAC",  n:"Bank of America Corp.", pct:5.3,  act:"Hold",   actPct:null, shares:900000,   rPrice:44.20,  val:39780000,   w52l:35.41, w52h:48.85},
    ]},
  { id:"bill_nygren", name:"Bill Nygren", fund:"Oakmark Funds", emoji:"ð¦", color:"#F59E0B",
    aum:"$24.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:52,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:15.8, act:"Add",    actPct:6.4,  shares:8800000,  rPrice:175.50, val:1544400000, w52l:140.53,w52h:207.05},
      {t:"COF",  n:"Capital One Financial", pct:12.4, act:"Hold",   actPct:null, shares:4200000,  rPrice:188.50, val:791700000,  w52l:133.18,w52h:210.00},
      {t:"ALLY", n:"Ally Financial Inc.",   pct:10.2, act:"Add",    actPct:9.1,  shares:14500000, rPrice:38.60,  val:559700000,  w52l:27.40, w52h:45.80},
      {t:"BK",   n:"Bank of New York Mellon",pct:9.6, act:"Add",    actPct:4.2,  shares:6800000,  rPrice:80.25,  val:545700000,  w52l:65.11, w52h:88.50},
      {t:"APA",  n:"APA Corporation",       pct:8.1,  act:"Hold",   actPct:null, shares:8900000,  rPrice:16.80,  val:149520000,  w52l:12.50, w52h:29.80},
      {t:"HCA",  n:"HCA Healthcare Inc.",   pct:7.4,  act:"Reduce", actPct:-3.8, shares:1800000,  rPrice:342.80, val:617040000,  w52l:271.00,w52h:396.50},
    ]},
  { id:"gates_foundation", name:"Bill & Melinda Gates Foundation", fund:"Gates Foundation Trust", emoji:"ð", color:"#22D3EE",
    aum:"$49.6B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:22,
    holdings:[
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:46.2, act:"Hold",   actPct:null, shares:41800000, rPrice:387.20, val:16184960000,w52l:337.00,w52h:418.00},
      {t:"WM",   n:"Waste Management Inc.", pct:15.4, act:"Hold",   actPct:null, shares:11200000, rPrice:222.80, val:2495360000, w52l:183.00,w52h:252.00},
      {t:"CNI",  n:"Canadian National Rwy.", pct:12.8, act:"Hold",   actPct:null, shares:12000000, rPrice:116.50, val:1398000000, w52l:103.50,w52h:131.00},
      {t:"CAT",  n:"Caterpillar Inc.",       pct:8.6,  act:"Add",    actPct:3.2,  shares:2900000,  rPrice:373.20, val:1082280000, w52l:303.27,w52h:418.50},
      {t:"ECL",  n:"Ecolab Inc.",            pct:7.2,  act:"Hold",   actPct:null, shares:3800000,  rPrice:230.40, val:875520000,  w52l:184.00,w52h:263.00},
    ]},
  { id:"norbert_lou", name:"Norbert Lou", fund:"Punch Card Management", emoji:"ð", color:"#F97316",
    aum:"$480M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:4,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:54.8, act:"Hold",   actPct:null, shares:1500000,  rPrice:175.50, val:263250000,  w52l:140.53,w52h:207.05},
      {t:"FCNCA",n:"First Citizens Bancshares",pct:28.4,act:"Hold", actPct:null, shares:88000,   rPrice:2040.50,val:179564000,  w52l:1510.00,w52h:2250.00},
      {t:"KKR",  n:"KKR & Co. Inc.",        pct:12.1, act:"New",    actPct:null, shares:920000,   rPrice:132.50, val:121900000,  w52l:93.36, w52h:172.20},
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:4.7,  act:"Hold",   actPct:null, shares:60000,    rPrice:387.20, val:23232000,   w52l:337.00,w52h:418.00},
    ]},
  { id:"ellenbogen", name:"Henry Ellenbogen", fund:"Durable Capital Partners", emoji:"ð±", color:"#86EFAC",
    aum:"$4.2B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:34,
    holdings:[
      {t:"SHOP", n:"Shopify Inc. Cl A",     pct:18.6, act:"Add",    actPct:12.5, shares:3800000,  rPrice:118.40, val:449920000,  w52l:54.27, w52h:132.00},
      {t:"SAMSARA",n:"Samsara Inc.",        pct:15.3, act:"Hold",   actPct:null, shares:8400000,  rPrice:48.20,  val:404880000,  w52l:28.50, w52h:62.80},
      {t:"DUOL", n:"Duolingo Inc.",         pct:12.8, act:"Add",    actPct:8.0,  shares:1200000,  rPrice:392.80, val:471360000,  w52l:186.00,w52h:480.00},
      {t:"BILL", n:"Bill Holdings Inc.",    pct:10.4, act:"Reduce", actPct:-6.2, shares:5800000,  rPrice:52.40,  val:303920000,  w52l:34.00, w52h:92.60},
      {t:"SNOW", n:"Snowflake Inc.",        pct:9.2,  act:"Hold",   actPct:null, shares:2600000,  rPrice:158.60, val:412360000,  w52l:107.13,w52h:195.00},
    ]},
  { id:"bloomstran", name:"Christopher Bloomstran", fund:"Semper Augustus Investments", emoji:"ð¦", color:"#C084FC",
    aum:"$820M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:8,
    holdings:[
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:58.4, act:"Hold",   actPct:null, shares:1250000,  rPrice:387.20, val:484000000,  w52l:337.00,w52h:418.00},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:22.6, act:"Hold",   actPct:null, shares:1060000,  rPrice:175.50, val:186030000,  w52l:140.53,w52h:207.05},
      {t:"MSFT", n:"Microsoft Corp.",      pct:12.4, act:"Add",    actPct:5.0,  shares:230000,   rPrice:448.30, val:103109000,  w52l:355.51,w52h:551.05},
      {t:"V",    n:"Visa Inc. Cl A",       pct:6.6,  act:"Hold",   actPct:null, shares:180000,   rPrice:305.80, val:55044000,   w52l:260.00,w52h:354.00},
    ]},
  { id:"mason_hawkins", name:"Mason Hawkins", fund:"Southeastern Asset Management", emoji:"ð", color:"#FB923C",
    aum:"$3.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:18,
    holdings:[
      {t:"CNQ",  n:"Canadian Natural Resources",pct:24.5,act:"Hold",actPct:null,shares:9800000,  rPrice:36.50,  val:357700000,  w52l:28.00, w52h:46.20},
      {t:"LBTYK",n:"Liberty TripAdvisor Hldgs",pct:18.2,act:"Add", actPct:6.8,  shares:82000000, rPrice:6.20,   val:508400000,  w52l:4.10,  w52h:9.80},
      {t:"ENR",  n:"Energizer Holdings",    pct:15.6, act:"Hold",   actPct:null, shares:8200000,  rPrice:30.80,  val:252560000,  w52l:24.50, w52h:36.90},
      {t:"MSGS", n:"MSG Sports Corp.",      pct:12.3, act:"Add",    actPct:4.5,  shares:680000,   rPrice:213.50, val:145180000,  w52l:170.00,w52h:245.00},
      {t:"CPRI", n:"Capri Holdings Ltd.",   pct:10.8, act:"Reduce", actPct:-8.0, shares:6400000,  rPrice:23.40,  val:149760000,  w52l:18.50, w52h:40.20},
    ]},
  { id:"greenberg", name:"Glenn Greenberg", fund:"Brave Warrior Advisors", emoji:"ð¡ï¸", color:"#34D399",
    aum:"$3.1B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:12,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:28.4, act:"Add",    actPct:7.2,  shares:4600000,  rPrice:175.50, val:807300000,  w52l:140.53,w52h:207.05},
      {t:"META", n:"Meta Platforms Inc.",  pct:22.8, act:"Hold",   actPct:null, shares:760000,   rPrice:596.80, val:453568000,  w52l:520.26,w52h:794.38},
      {t:"LPX",  n:"Louisiana-Pacific Corp.",pct:18.4,act:"Hold",  actPct:null, shares:5200000,  rPrice:95.40,  val:496080000,  w52l:72.00, w52h:112.00},
      {t:"PCVX", n:"Vaxcyte Inc.",          pct:14.2, act:"Add",    actPct:18.5, shares:2100000,  rPrice:86.20,  val:181020000,  w52l:55.00, w52h:110.00},
      {t:"MSFT", n:"Microsoft Corp.",      pct:10.5, act:"Hold",   actPct:null, shares:460000,   rPrice:448.30, val:206218000,  w52l:355.51,w52h:551.05},
    ]},
  { id:"daniel_loeb", name:"Daniel Loeb", fund:"Third Point LLC", emoji:"ð­", color:"#FB7185",
    aum:"$11.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:38,
    holdings:[
      {t:"META", n:"Meta Platforms Inc.",  pct:20.4, act:"Add",    actPct:8.6,  shares:2100000,  rPrice:596.80, val:1253280000, w52l:520.26,w52h:794.38},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:17.8, act:"Hold",   actPct:null, shares:5800000,  rPrice:226.50, val:1313700000, w52l:166.21,w52h:242.52},
      {t:"PG",   n:"Procter & Gamble",     pct:14.2, act:"New",    actPct:null, shares:3600000,  rPrice:165.80, val:596880000,  w52l:147.23,w52h:178.02},
      {t:"SFM",  n:"Sprouts Farmers Market",pct:12.5, act:"Add",   actPct:15.2, shares:6400000,  rPrice:145.80, val:933120000,  w52l:62.00, w52h:172.00},
      {t:"DPST", n:"Danaher Corp.",         pct:10.8, act:"Reduce", actPct:-4.5, shares:1900000,  rPrice:236.50, val:449350000,  w52l:192.00,w52h:285.00},
    ]},
  { id:"stephen_mandel", name:"Stephen Mandel", fund:"Lone Pine Capital", emoji:"ð²", color:"#4ADE80",
    aum:"$21.6B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:48,
    holdings:[
      {t:"META", n:"Meta Platforms Inc.",  pct:18.2, act:"Hold",   actPct:null, shares:3800000,  rPrice:596.80, val:2267840000, w52l:520.26,w52h:794.38},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:15.6, act:"Add",    actPct:5.8,  shares:9200000,  rPrice:226.50, val:2083800000, w52l:166.21,w52h:242.52},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:13.4, act:"Hold",   actPct:null, shares:9600000,  rPrice:175.50, val:1684800000, w52l:140.53,w52h:207.05},
      {t:"MSFT", n:"Microsoft Corp.",      pct:11.8, act:"Hold",   actPct:null, shares:3800000,  rPrice:448.30, val:1703540000, w52l:355.51,w52h:551.05},
      {t:"NVDA", n:"NVIDIA Corp.",         pct:9.6,  act:"Add",    actPct:22.4, shares:7400000,  rPrice:131.00, val:969400000,  w52l:86.36, w52h:153.13},
      {t:"UBER", n:"Uber Technologies",    pct:7.8,  act:"Add",    actPct:8.5,  shares:12400000, rPrice:78.60,  val:974640000,  w52l:68.46, w52h:101.99},
    ]},
  { id:"valley_forge", name:"Valley Forge Capital", fund:"Valley Forge Capital Management", emoji:"â°ï¸", color:"#60A5FA",
    aum:"$2.1B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:16,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:32.6, act:"Hold",   actPct:null, shares:2100000,  rPrice:175.50, val:368550000,  w52l:140.53,w52h:207.05},
      {t:"MCO",  n:"Moody's Corporation",  pct:24.8, act:"Hold",   actPct:null, shares:620000,   rPrice:482.60, val:299212000,  w52l:380.00,w52h:544.00},
      {t:"MSFT", n:"Microsoft Corp.",      pct:18.4, act:"Add",    actPct:5.0,  shares:620000,   rPrice:448.30, val:277946000,  w52l:355.51,w52h:551.05},
      {t:"MA",   n:"Mastercard Inc.",       pct:14.2, act:"Hold",   actPct:null, shares:380000,   rPrice:538.20, val:204516000,  w52l:455.00,w52h:576.50},
      {t:"V",    n:"Visa Inc. Cl A",       pct:10.0, act:"Reduce", actPct:-3.5, shares:480000,   rPrice:305.80, val:146784000,  w52l:260.00,w52h:354.00},
    ]},
  { id:"david_rolfe", name:"David Rolfe", fund:"Wedgewood Partners", emoji:"ðªµ", color:"#A78BFA",
    aum:"$1.1B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:19,
    holdings:[
      {t:"AAPL", n:"Apple Inc.",           pct:26.4, act:"Hold",   actPct:null, shares:1400000,  rPrice:207.15, val:290010000,  w52l:164.08,w52h:260.10},
      {t:"META", n:"Meta Platforms Inc.",  pct:21.8, act:"Add",    actPct:10.2, shares:410000,   rPrice:596.80, val:244688000,  w52l:520.26,w52h:794.38},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:18.6, act:"Hold",   actPct:null, shares:920000,   rPrice:226.50, val:208380000,  w52l:166.21,w52h:242.52},
      {t:"MSFT", n:"Microsoft Corp.",      pct:15.2, act:"Hold",   actPct:null, shares:420000,   rPrice:448.30, val:188286000,  w52l:355.51,w52h:551.05},
      {t:"NVR",  n:"NVR Inc.",             pct:12.4, act:"Hold",   actPct:null, shares:28000,    rPrice:8620.00,val:241360000,  w52l:6500.00,w52h:9800.00},
    ]},
  { id:"david_tepper", name:"David Tepper", fund:"Appaloosa Management", emoji:"ð", color:"#FCD34D",
    aum:"$13.6B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:32,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:22.6, act:"Add",    actPct:14.8, shares:7200000,  rPrice:175.50, val:1263600000, w52l:140.53,w52h:207.05},
      {t:"META", n:"Meta Platforms Inc.",  pct:18.4, act:"Hold",   actPct:null, shares:1600000,  rPrice:596.80, val:954880000,  w52l:520.26,w52h:794.38},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:15.8, act:"Add",    actPct:8.5,  shares:5200000,  rPrice:226.50, val:1177800000, w52l:166.21,w52h:242.52},
      {t:"NVDA", n:"NVIDIA Corp.",         pct:12.4, act:"New",    actPct:null, shares:4200000,  rPrice:131.00, val:550200000,  w52l:86.36, w52h:153.13},
      {t:"QQQ",  n:"Invesco QQQ Trust",    pct:10.5, act:"Add",    actPct:5.0,  shares:900000,   rPrice:507.40, val:456660000,  w52l:425.00,w52h:540.00},
      {t:"BABA", n:"Alibaba Group ADR",    pct:8.2,  act:"Add",    actPct:20.0, shares:3800000,  rPrice:105.60, val:401280000,  w52l:68.50, w52h:142.00},
    ]},
  { id:"chase_coleman", name:"Chase Coleman", fund:"Tiger Global Management", emoji:"ð¯", color:"#FCA5A5",
    aum:"$58B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:72,
    holdings:[
      {t:"META", n:"Meta Platforms Inc.",  pct:14.6, act:"Add",    actPct:6.8,  shares:9800000,  rPrice:596.80, val:5848640000, w52l:520.26,w52h:794.38},
      {t:"MSFT", n:"Microsoft Corp.",      pct:12.8, act:"Hold",   actPct:null, shares:10400000, rPrice:448.30, val:4662320000, w52l:355.51,w52h:551.05},
      {t:"NVDA", n:"NVIDIA Corp.",         pct:11.4, act:"Add",    actPct:15.2, shares:31000000, rPrice:131.00, val:4061000000, w52l:86.36, w52h:153.13},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:10.2, act:"Hold",   actPct:null, shares:16000000, rPrice:226.50, val:3624000000, w52l:166.21,w52h:242.52},
      {t:"SPOT", n:"Spotify Technology",   pct:8.6,  act:"Add",    actPct:18.0, shares:5400000,  rPrice:618.40, val:3339360000, w52l:290.71,w52h:685.00},
      {t:"DUOL", n:"Duolingo Inc.",        pct:7.4,  act:"Add",    actPct:12.5, shares:2800000,  rPrice:392.80, val:1099840000, w52l:186.00,w52h:480.00},
    ]},
  { id:"francois_rochon", name:"Francois Rochon", fund:"Giverny Capital", emoji:"ð¼", color:"#93C5FD",
    aum:"$1.2B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:24,
    holdings:[
      {t:"MSFT", n:"Microsoft Corp.",      pct:22.4, act:"Hold",   actPct:null, shares:580000,   rPrice:448.30, val:260014000,  w52l:355.51,w52h:551.05},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:18.6, act:"Hold",   actPct:null, shares:1200000,  rPrice:175.50, val:210600000,  w52l:140.53,w52h:207.05},
      {t:"MCO",  n:"Moody's Corporation",  pct:14.8, act:"Hold",   actPct:null, shares:360000,   rPrice:482.60, val:173736000,  w52l:380.00,w52h:544.00},
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:12.2, act:"Hold",   actPct:null, shares:370000,   rPrice:387.20, val:143264000,  w52l:337.00,w52h:418.00},
      {t:"NKE",  n:"Nike Inc.",            pct:10.4, act:"Add",    actPct:8.5,  shares:1800000,  rPrice:75.40,  val:135720000,  w52l:52.68, w52h:98.00},
    ]},
  { id:"leon_cooperman", name:"Leon Cooperman", fund:"Omega Advisors (Family Office)", emoji:"ðº", color:"#D1D5DB",
    aum:"$2.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:28,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:18.4, act:"Hold",   actPct:null, shares:1800000,  rPrice:175.50, val:315900000,  w52l:140.53,w52h:207.05},
      {t:"ATVI", n:"Activision Blizzard",  pct:14.2, act:"Hold",   actPct:null, shares:1900000,  rPrice:82.20,  val:156180000,  w52l:72.50, w52h:95.00},
      {t:"C",    n:"Citigroup Inc.",        pct:12.6, act:"Add",    actPct:10.5, shares:2800000,  rPrice:72.40,  val:202720000,  w52l:58.00, w52h:82.50},
      {t:"TECK", n:"Teck Resources Ltd.",   pct:10.8, act:"Reduce", actPct:-5.0, shares:3200000,  rPrice:44.20,  val:141440000,  w52l:35.00, w52h:58.00},
      {t:"SLB",  n:"SLB (Schlumberger)",   pct:9.2,  act:"Hold",   actPct:null, shares:3400000,  rPrice:38.60,  val:131240000,  w52l:32.00, w52h:56.00},
    ]},
  { id:"bill_miller", name:"Bill Miller", fund:"Miller Value Partners", emoji:"ð²", color:"#FDE68A",
    aum:"$2.2B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:26,
    holdings:[
      {t:"AMZN", n:"Amazon.com Inc.",      pct:28.6, act:"Hold",   actPct:null, shares:2800000,  rPrice:226.50, val:634200000,  w52l:166.21,w52h:242.52},
      {t:"DAL",  n:"Delta Air Lines",      pct:18.4, act:"Add",    actPct:12.0, shares:8900000,  rPrice:48.80,  val:434320000,  w52l:36.40, w52h:62.80},
      {t:"BALY", n:"Bally's Corporation",  pct:14.2, act:"Hold",   actPct:null, shares:5400000,  rPrice:14.20,  val:76680000,   w52l:10.00, w52h:20.50},
      {t:"MSTR", n:"MicroStrategy Inc.",   pct:12.6, act:"Add",    actPct:8.0,  shares:240000,   rPrice:365.00, val:87600000,   w52l:117.00,w52h:543.00},
      {t:"RH",   n:"RH (Restoration Hardware)",pct:10.4,act:"Reduce",actPct:-8.5,shares:280000,  rPrice:368.00, val:103040000,  w52l:200.00,w52h:430.00},
    ]},
  { id:"pat_dorsey", name:"Pat Dorsey", fund:"Dorsey Asset Management", emoji:"ð", color:"#67E8F9",
    aum:"$420M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:14,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:28.4, act:"Hold",   actPct:null, shares:620000,   rPrice:175.50, val:108810000,  w52l:140.53,w52h:207.05},
      {t:"POOL", n:"Pool Corporation",     pct:22.6, act:"Add",    actPct:7.5,  shares:280000,   rPrice:352.80, val:98784000,   w52l:290.00,w52h:400.00},
      {t:"IDXX", n:"IDEXX Laboratories",   pct:18.4, act:"Hold",   actPct:null, shares:128000,   rPrice:480.40, val:61491200,   w52l:380.00,w52h:556.00},
      {t:"ROP",  n:"Roper Technologies",   pct:15.2, act:"Hold",   actPct:null, shares:108000,   rPrice:580.20, val:62661600,   w52l:488.00,w52h:636.00},
      {t:"MCO",  n:"Moody's Corporation",  pct:15.4, act:"Add",    actPct:5.0,  shares:98000,    rPrice:482.60, val:47294800,   w52l:380.00,w52h:544.00},
    ]},
  { id:"chris_hohn", name:"Chris Hohn", fund:"TCI Fund Management", emoji:"ð¦", color:"#4F46E5",
    aum:"$78B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:16,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:28.6, act:"Add",    actPct:6.2,  shares:48000000, rPrice:175.50, val:8424000000, w52l:140.53,w52h:207.05},
      {t:"MSFT", n:"Microsoft Corp.",      pct:22.4, act:"Hold",   actPct:null, shares:22000000, rPrice:448.30, val:9862600000, w52l:355.51,w52h:551.05},
      {t:"V",    n:"Visa Inc. Cl A",       pct:14.8, act:"Hold",   actPct:null, shares:21000000, rPrice:305.80, val:6421800000, w52l:260.00,w52h:354.00},
      {t:"MA",   n:"Mastercard Inc.",       pct:12.6, act:"Add",    actPct:4.5,  shares:10400000, rPrice:538.20, val:5597280000, w52l:455.00,w52h:576.50},
      {t:"UBER", n:"Uber Technologies",    pct:10.2, act:"Add",    actPct:9.8,  shares:42000000, rPrice:78.60,  val:3301200000, w52l:68.46, w52h:101.99},
      {t:"SPOT", n:"Spotify Technology",   pct:8.4,  act:"New",    actPct:null, shares:6200000,  rPrice:618.40, val:3834080000, w52l:290.71,w52h:685.00},
    ]},
  { id:"terry_smith", name:"Terry Smith", fund:"Fundsmith LLP", emoji:"ð¬ð§", color:"#2DD4BF",
    aum:"$24.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:28,
    holdings:[
      {t:"MSFT", n:"Microsoft Corp.",      pct:18.4, act:"Hold",   actPct:null, shares:9800000,  rPrice:448.30, val:4393340000, w52l:355.51,w52h:551.05},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:15.6, act:"Add",    actPct:5.2,  shares:6200000,  rPrice:226.50, val:1404300000, w52l:166.21,w52h:242.52},
      {t:"IDXX", n:"IDEXX Laboratories",   pct:12.8, act:"Hold",   actPct:null, shares:1400000,  rPrice:480.40, val:672560000,  w52l:380.00,w52h:556.00},
      {t:"PM",   n:"Philip Morris Intl.",  pct:11.4, act:"Hold",   actPct:null, shares:6600000,  rPrice:148.20, val:978120000,  w52l:98.20, w52h:164.00},
      {t:"MCO",  n:"Moody's Corporation",  pct:10.2, act:"Reduce", actPct:-3.8, shares:1050000,  rPrice:482.60, val:506730000,  w52l:380.00,w52h:544.00},
      {t:"MKTX", n:"MarketAxess Holdings", pct:8.6,  act:"Hold",   actPct:null, shares:1200000,  rPrice:212.40, val:254880000,  w52l:168.00,w52h:268.00},
    ]},
  { id:"prem_watsa", name:"Prem Watsa", fund:"Fairfax Financial Holdings", emoji:"ð", color:"#F87171",
    aum:"$5.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:21,
    holdings:[
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:24.6, act:"Hold",   actPct:null, shares:1850000,  rPrice:387.20, val:716320000,  w52l:337.00,w52h:418.00},
      {t:"ATCO", n:"Atlas Corp.",          pct:18.4, act:"Hold",   actPct:null, shares:28000000, rPrice:14.80,  val:414400000,  w52l:11.00, w52h:19.50},
      {t:"KFY",  n:"Korn Ferry",           pct:14.2, act:"Add",    actPct:6.5,  shares:4200000,  rPrice:64.80,  val:272160000,  w52l:52.00, w52h:78.00},
      {t:"OXY",  n:"Occidental Petroleum", pct:12.6, act:"Add",    actPct:5.2,  shares:4400000,  rPrice:46.20,  val:203280000,  w52l:37.50, w52h:63.40},
      {t:"BKNG", n:"Booking Holdings",     pct:10.8, act:"Hold",   actPct:null, shares:72000,    rPrice:5180.00,val:372960000,  w52l:3400.00,w52h:5650.00},
    ]},
  { id:"seth_klarman", name:"Seth Klarman", fund:"Baupost Group", emoji:"ðï¸", color:"#818CF8",
    aum:"$27.4B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:24,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:22.4, act:"Add",    actPct:8.5,  shares:12800000, rPrice:175.50, val:2246400000, w52l:140.53,w52h:207.05},
      {t:"QGEN", n:"Qiagen N.V.",          pct:16.8, act:"Hold",   actPct:null, shares:12600000, rPrice:48.60,  val:612360000,  w52l:38.40, w52h:58.00},
      {t:"META", n:"Meta Platforms Inc.",  pct:14.2, act:"New",    actPct:null, shares:1200000,  rPrice:596.80, val:716160000,  w52l:520.26,w52h:794.38},
      {t:"VIAD", n:"Viad Corp.",           pct:12.6, act:"Hold",   actPct:null, shares:5800000,  rPrice:28.40,  val:164720000,  w52l:22.00, w52h:38.00},
      {t:"WBD",  n:"Warner Bros. Discovery",pct:10.4,act:"Add",    actPct:15.0, shares:28000000, rPrice:12.80,  val:358400000,  w52l:7.00,  w52h:18.00},
    ]},
  { id:"chuck_akre", name:"Chuck Akre", fund:"Akre Capital Management", emoji:"ð¦©", color:"#FCA5A5",
    aum:"$9.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:18,
    holdings:[
      {t:"MCO",  n:"Moody's Corporation",  pct:28.4, act:"Hold",   actPct:null, shares:2600000,  rPrice:482.60, val:1254760000, w52l:380.00,w52h:544.00},
      {t:"MA",   n:"Mastercard Inc.",       pct:22.8, act:"Hold",   actPct:null, shares:3200000,  rPrice:538.20, val:1722240000, w52l:455.00,w52h:576.50},
      {t:"AMT",  n:"American Tower Corp.", pct:18.6, act:"Hold",   actPct:null, shares:4100000,  rPrice:200.40, val:821640000,  w52l:154.00,w52h:235.00},
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:14.4, act:"Add",    actPct:4.2,  shares:2200000,  rPrice:387.20, val:851840000,  w52l:337.00,w52h:418.00},
      {t:"CBOE", n:"Cboe Global Markets",  pct:10.2, act:"Add",    actPct:6.8,  shares:1800000,  rPrice:226.50, val:407700000,  w52l:180.00,w52h:255.00},
    ]},
  { id:"john_rogers", name:"John Rogers", fund:"Ariel Investments", emoji:"ðº", color:"#FBBF24",
    aum:"$9.6B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:54,
    holdings:[
      {t:"MSGS", n:"MSG Sports Corp.",     pct:14.8, act:"Hold",   actPct:null, shares:2200000,  rPrice:213.50, val:469700000,  w52l:170.00,w52h:245.00},
      {t:"JHG",  n:"Janus Henderson Group",pct:12.6, act:"Add",    actPct:8.2,  shares:8800000,  rPrice:44.20,  val:388960000,  w52l:36.00, w52h:52.00},
      {t:"MKC",  n:"McCormick & Co.",      pct:11.4, act:"Hold",   actPct:null, shares:3800000,  rPrice:72.80,  val:276640000,  w52l:60.00, w52h:90.00},
      {t:"BMI",  n:"Badger Meter Inc.",    pct:10.2, act:"Add",    actPct:5.5,  shares:2100000,  rPrice:198.40, val:416640000,  w52l:148.00,w52h:228.00},
      {t:"UGP",  n:"Ultrapar ParticipaÃ§Ãµes",pct:9.4, act:"Hold",   actPct:null, shares:14200000, rPrice:3.80,   val:53960000,   w52l:2.80,  w52h:5.20},
    ]},
  { id:"david_abrams", name:"David Abrams", fund:"Abrams Capital Management", emoji:"ð¯", color:"#A3E635",
    aum:"$5.8B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:16,
    holdings:[
      {t:"META", n:"Meta Platforms Inc.",  pct:26.4, act:"Hold",   actPct:null, shares:1400000,  rPrice:596.80, val:835520000,  w52l:520.26,w52h:794.38},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:22.8, act:"Add",    actPct:6.5,  shares:3800000,  rPrice:175.50, val:666900000,  w52l:140.53,w52h:207.05},
      {t:"VIAC", n:"Paramount Global B",   pct:16.4, act:"Reduce", actPct:-10.5,shares:14000000, rPrice:11.20,  val:156800000,  w52l:8.00,  w52h:18.50},
      {t:"GS",   n:"Goldman Sachs Group",  pct:14.2, act:"Add",    actPct:4.8,  shares:280000,   rPrice:572.40, val:160272000,  w52l:420.00,w52h:620.00},
      {t:"BKNG", n:"Booking Holdings",     pct:12.8, act:"Hold",   actPct:null, shares:52000,    rPrice:5180.00,val:269360000,  w52l:3400.00,w52h:5650.00},
    ]},
  { id:"dennis_hong", name:"Dennis Hong", fund:"ShawSpring Partners", emoji:"ð", color:"#38BDF8",
    aum:"$820M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:22,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:24.6, act:"Hold",   actPct:null, shares:780000,   rPrice:175.50, val:136890000,  w52l:140.53,w52h:207.05},
      {t:"NFLX", n:"Netflix Inc.",         pct:20.4, act:"Add",    actPct:9.5,  shares:98000,    rPrice:1084.00,val:106232000,  w52l:480.00,w52h:1200.00},
      {t:"META", n:"Meta Platforms Inc.",  pct:18.2, act:"Hold",   actPct:null, shares:192000,   rPrice:596.80, val:114586000,  w52l:520.26,w52h:794.38},
      {t:"DUOL", n:"Duolingo Inc.",        pct:14.8, act:"Add",    actPct:22.0, shares:190000,   rPrice:392.80, val:74632000,   w52l:186.00,w52h:480.00},
      {t:"SHOP", n:"Shopify Inc. Cl A",   pct:12.6, act:"Add",    actPct:12.5, shares:540000,   rPrice:118.40, val:63936000,   w52l:54.27, w52h:132.00},
    ]},
  { id:"ruane_cunniff", name:"Ruane Cunniff LP", fund:"Ruane Cunniff & Goldfarb", emoji:"ð¦", color:"#D9F99D",
    aum:"$4.9B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:28,
    holdings:[
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:22.4, act:"Hold",   actPct:null, shares:2850000,  rPrice:387.20, val:1103520000, w52l:337.00,w52h:418.00},
      {t:"META", n:"Meta Platforms Inc.",  pct:18.6, act:"Add",    actPct:7.5,  shares:810000,   rPrice:596.80, val:483408000,  w52l:520.26,w52h:794.38},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:15.4, act:"Hold",   actPct:null, shares:2400000,  rPrice:175.50, val:421200000,  w52l:140.53,w52h:207.05},
      {t:"LMND", n:"Lemonade Inc.",        pct:12.8, act:"Add",    actPct:15.0, shares:3800000,  rPrice:22.40,  val:85120000,   w52l:12.50, w52h:32.00},
      {t:"BIO",  n:"Bio-Rad Laboratories", pct:10.4, act:"Hold",   actPct:null, shares:210000,   rPrice:298.40, val:62664000,   w52l:230.00,w52h:380.00},
    ]},
  { id:"first_eagle", name:"First Eagle Investment", fund:"First Eagle Investment Management", emoji:"ð¦", color:"#FDE047",
    aum:"$102B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:98,
    holdings:[
      {t:"BRK.B",n:"Berkshire Hathaway B", pct:12.4, act:"Hold",   actPct:null, shares:19200000, rPrice:387.20, val:7434240000, w52l:337.00,w52h:418.00},
      {t:"GLD",  n:"SPDR Gold Shares ETF", pct:10.8, act:"Hold",   actPct:null, shares:18000000, rPrice:292.40, val:5263200000, w52l:182.00,w52h:302.00},
      {t:"GOLD", n:"Barrick Gold Corp.",   pct:8.6,  act:"Add",    actPct:5.2,  shares:42000000, rPrice:20.40,  val:856800000,  w52l:14.80, w52h:22.80},
      {t:"KO",   n:"Coca-Cola Co.",        pct:7.4,  act:"Hold",   actPct:null, shares:8800000,  rPrice:72.80,  val:640640000,  w52l:58.00, w52h:76.00},
      {t:"META", n:"Meta Platforms Inc.",  pct:6.8,  act:"New",    actPct:null, shares:820000,   rPrice:596.80, val:489376000,  w52l:520.26,w52h:794.38},
    ]},
  { id:"altarock", name:"AltaRock Partners", fund:"AltaRock Partners", emoji:"ðª¨", color:"#6EE7B7",
    aum:"$380M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:8,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:38.4, act:"Hold",   actPct:null, shares:620000,   rPrice:175.50, val:108810000,  w52l:140.53,w52h:207.05},
      {t:"META", n:"Meta Platforms Inc.",  pct:28.6, act:"Add",    actPct:10.0, shares:280000,   rPrice:596.80, val:167104000,  w52l:520.26,w52h:794.38},
      {t:"MSFT", n:"Microsoft Corp.",      pct:18.4, act:"Hold",   actPct:null, shares:140000,   rPrice:448.30, val:62762000,   w52l:355.51,w52h:551.05},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:14.6, act:"Add",    actPct:6.5,  shares:240000,   rPrice:226.50, val:54360000,   w52l:166.21,w52h:242.52},
    ]},
  { id:"ako_capital", name:"AKO Capital", fund:"AKO Capital LLP", emoji:"ð", color:"#C4B5FD",
    aum:"$8.2B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:22,
    holdings:[
      {t:"ASML", n:"ASML Holding N.V.",    pct:24.8, act:"Hold",   actPct:null, shares:480000,   rPrice:872.40, val:418752000,  w52l:631.00,w52h:1060.00},
      {t:"MSFT", n:"Microsoft Corp.",      pct:20.4, act:"Add",    actPct:6.2,  shares:2400000,  rPrice:448.30, val:1075920000, w52l:355.51,w52h:551.05},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:16.8, act:"Hold",   actPct:null, shares:2600000,  rPrice:175.50, val:456300000,  w52l:140.53,w52h:207.05},
      {t:"LVMHF",n:"LVMH MoÃ«t Hennessy",  pct:14.2, act:"Reduce", actPct:-5.0, shares:420000,   rPrice:716.00, val:300720000,  w52l:588.00,w52h:890.00},
      {t:"NOVO", n:"Novo Nordisk ADR",     pct:12.6, act:"Add",    actPct:8.5,  shares:3800000,  rPrice:82.40,  val:313120000,  w52l:54.00, w52h:128.00},
    ]},
  { id:"bryan_lawrence", name:"Bryan Lawrence", fund:"Oakcliff Capital", emoji:"ð", color:"#BAE6FD",
    aum:"$580M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:6,
    holdings:[
      {t:"BKNG", n:"Booking Holdings",     pct:42.6, act:"Hold",   actPct:null, shares:46000,    rPrice:5180.00,val:238280000,  w52l:3400.00,w52h:5650.00},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:28.4, act:"Add",    actPct:6.0,  shares:520000,   rPrice:175.50, val:91260000,   w52l:140.53,w52h:207.05},
      {t:"META", n:"Meta Platforms Inc.",  pct:18.2, act:"Hold",   actPct:null, shares:96000,    rPrice:596.80, val:57292800,   w52l:520.26,w52h:794.38},
      {t:"EXPE", n:"Expedia Group Inc.",   pct:10.8, act:"Add",    actPct:12.5, shares:580000,   rPrice:168.40, val:97672000,   w52l:128.00,w52h:200.00},
    ]},
  { id:"hillman", name:"Hillman Capital Management", fund:"Hillman Capital Management", emoji:"â°ï¸", color:"#E2E8F0",
    aum:"$650M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:12,
    holdings:[
      {t:"MSFT", n:"Microsoft Corp.",      pct:28.4, act:"Hold",   actPct:null, shares:420000,   rPrice:448.30, val:188286000,  w52l:355.51,w52h:551.05},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:22.6, act:"Hold",   actPct:null, shares:840000,   rPrice:175.50, val:147420000,  w52l:140.53,w52h:207.05},
      {t:"V",    n:"Visa Inc. Cl A",       pct:18.4, act:"Add",    actPct:5.5,  shares:310000,   rPrice:305.80, val:94798000,   w52l:260.00,w52h:354.00},
      {t:"META", n:"Meta Platforms Inc.",  pct:14.8, act:"Hold",   actPct:null, shares:156000,   rPrice:596.80, val:93100800,   w52l:520.26,w52h:794.38},
      {t:"MA",   n:"Mastercard Inc.",       pct:15.8, act:"Hold",   actPct:null, shares:180000,   rPrice:538.20, val:96876000,   w52l:455.00,w52h:576.50},
    ]},
  { id:"clifford_sosin", name:"Clifford Sosin", fund:"CAS Investment Partners", emoji:"ð­", color:"#7DD3FC",
    aum:"$520M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:4,
    holdings:[
      {t:"CSU",  n:"Constellation Software",pct:68.4, act:"Hold",  actPct:null, shares:29000,    rPrice:4150.00,val:120350000,  w52l:3200.00,w52h:4800.00},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:18.6, act:"Add",    actPct:8.0,  shares:310000,   rPrice:175.50, val:54405000,   w52l:140.53,w52h:207.05},
      {t:"META", n:"Meta Platforms Inc.",  pct:13.0, act:"Hold",   actPct:null, shares:52000,    rPrice:596.80, val:31033600,   w52l:520.26,w52h:794.38},
    ]},
  { id:"tom_bancroft", name:"Tom Bancroft", fund:"Makaira Partners", emoji:"ð¦", color:"#FBCFE8",
    aum:"$380M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:10,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:32.4, act:"Add",    actPct:5.0,  shares:420000,   rPrice:175.50, val:73710000,   w52l:140.53,w52h:207.05},
      {t:"META", n:"Meta Platforms Inc.",  pct:28.6, act:"Hold",   actPct:null, shares:92000,    rPrice:596.80, val:54905600,   w52l:520.26,w52h:794.38},
      {t:"MSFT", n:"Microsoft Corp.",      pct:22.4, act:"Hold",   actPct:null, shares:120000,   rPrice:448.30, val:53796000,   w52l:355.51,w52h:551.05},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:16.6, act:"Add",    actPct:8.0,  shares:140000,   rPrice:226.50, val:31710000,   w52l:166.21,w52h:242.52},
    ]},
  { id:"greg_alexander", name:"Greg Alexander", fund:"Conifer Management", emoji:"ð²", color:"#86EFAC",
    aum:"$620M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:14,
    holdings:[
      {t:"META", n:"Meta Platforms Inc.",  pct:30.4, act:"Hold",   actPct:null, shares:300000,   rPrice:596.80, val:179040000,  w52l:520.26,w52h:794.38},
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:24.8, act:"Add",    actPct:5.5,  shares:840000,   rPrice:175.50, val:147420000,  w52l:140.53,w52h:207.05},
      {t:"AMZN", n:"Amazon.com Inc.",      pct:18.6, act:"Hold",   actPct:null, shares:480000,   rPrice:226.50, val:108720000,  w52l:166.21,w52h:242.52},
      {t:"MSFT", n:"Microsoft Corp.",      pct:14.8, act:"Hold",   actPct:null, shares:200000,   rPrice:448.30, val:89660000,   w52l:355.51,w52h:551.05},
      {t:"LLY",  n:"Eli Lilly & Co.",      pct:11.4, act:"New",    actPct:null, shares:120000,   rPrice:780.00, val:93600000,   w52l:620.00,w52h:1060.00},
    ]},
  { id:"triple_frond", name:"Triple Frond Partners", fund:"Triple Frond Partners", emoji:"ð", color:"#6EE7B7",
    aum:"$290M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:7,
    holdings:[
      {t:"GOOGL",n:"Alphabet Inc. Cl A",   pct:38.6, act:"Hold",   actPct:null, shares:340000,   rPrice:175.50, val:59670000,   w52l:140.53,w52h:207.05},
      {t:"META", n:"Meta Platforms Inc.",  pct:30.4, act:"Add",    actPct:8.5,  shares:140000,   rPrice:596.80, val:83552000,   w52l:520.26,w52h:794.38},
      {t:"MCO",  n:"Moody's Corporation",  pct:18.4, act:"Hold",   actPct:null, shares:110000,   rPrice:482.60, val:53086000,   w52l:380.00,w52h:544.00},
      {t:"MA",   n:"Mastercard Inc.",       pct:12.6, act:"Hold",   actPct:null, shares:70000,    rPrice:538.20, val:37674000,   w52l:455.00,w52h:576.50},
    ]},
  { id:"alex_roepers", name:"Alex Roepers", fund:"Atlantic Investment Management", emoji:"ð", color:"#5EEAD4",
    aum:"$780M", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:16,
    holdings:[
      {t:"INGR", n:"Ingredion Inc.",        pct:22.4, act:"Hold",   actPct:null, shares:1200000,  rPrice:124.80, val:149760000,  w52l:96.00, w52h:142.00},
      {t:"FLS",  n:"Flowserve Corp.",       pct:18.6, act:"Add",    actPct:8.5,  shares:2800000,  rPrice:62.40,  val:174720000,  w52l:48.00, w52h:78.00},
      {t:"WRK",  n:"WestRock Company",     pct:16.4, act:"Reduce", actPct:-5.5, shares:3600000,  rPrice:64.20,  val:231120000,  w52l:52.00, w52h:78.00},
      {t:"RS",   n:"Reliance Steel & Aluminum",pct:14.2,act:"Hold",actPct:null, shares:480000,   rPrice:302.80, val:145344000,  w52l:248.00,w52h:362.00},
      {t:"CE",   n:"Celanese Corp.",        pct:12.8, act:"Add",    actPct:10.5, shares:1400000,  rPrice:96.40,  val:134960000,  w52l:72.00, w52h:148.00},
    ]},
  { id:"david_einhorn2", name:"Glenn Welling", fund:"Engaged Capital", emoji:"âï¸", color:"#A5B4FC",
    aum:"$1.1B", period:"Q1 2026", portfolioDate:"31 Mar 2026", numStocks:18,
    holdings:[
      {t:"LSXMA",n:"Liberty SiriusXM Grp.", pct:24.6, act:"Hold",  actPct:null, shares:9800000,  rPrice:24.80,  val:243040000,  w52l:18.00, w52h:34.00},
      {t:"SFIX", n:"Stitch Fix Inc.",        pct:18.4, act:"Add",   actPct:22.5, shares:22000000, rPrice:4.20,   val:92400000,   w52l:2.20,  w52h:6.80},
      {t:"CANO", n:"Cano Health Inc.",       pct:14.2, act:"Reduce",actPct:-8.5, shares:18000000, rPrice:5.40,   val:97200000,   w52l:3.20,  w52h:8.40},
      {t:"DXPE", n:"DXP Enterprises",        pct:12.8, act:"Add",   actPct:6.5,  shares:2100000,  rPrice:68.40,  val:143640000,  w52l:52.00, w52h:82.00},
    ]},
];

function GurusPage({ isPremium, onNeedPremium }) {
  const [tab, setTab]           = useState("gurus");
  const [arkFund, setArkFund]   = useState("ARKK");
  const [arkData, setArkData]   = useState(null);
  const [arkLoad, setArkLoad]   = useState(false);
  const [insiders, setInsiders] = useState(null);
  const [insLoad, setInsLoad]   = useState(false);
  const [livePx, setLivePx]     = useState({});
  const [selGuru, setSelGuru]   = useState(null);
  const [detailTab, setDetailTab] = useState("holdings");
  const [pxLoading, setPxLoading] = useState(false);
  const [pxUpdated, setPxUpdated] = useState(null);
  const [search, setSearch]     = useState("");

  const fetchLivePrices = () => {
    setPxLoading(true);
    const tickers = [...new Set(GURUS_13F.flatMap(g => g.holdings.map(h => h.t)))];
    Promise.all(tickers.map(async t => {
      try {
        const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${t}&token=${FINNHUB_KEY}`);
        const d = await r.json();
        if (d.c > 0) return { t, price: d.c, change: d.dp || 0, high52: d.h || 0, low52: d.l || 0 };
      } catch {}
      return null;
    })).then(results => {
      const map = {};
      results.filter(Boolean).forEach(r => { map[r.t] = r; });
      setLivePx(map);
      setPxLoading(false);
      setPxUpdated(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}));
    });
  };

  // Fetch live prices for all guru holdings
  useEffect(() => { fetchLivePrices(); }, []);

  // Fetch ARK data
  useEffect(() => {
    if (tab !== "ark") return;
    setArkLoad(true);
    fetch(`/api/ark?fund=${arkFund}`)
      .then(r => r.json())
      .then(d => { setArkData(d); setArkLoad(false); })
      .catch(() => setArkLoad(false));
  }, [tab, arkFund]);

  // Fetch insiders
  useEffect(() => {
    if (tab !== "insiders") return;
    setInsLoad(true);
    fetch("/api/insiders")
      .then(r => r.json())
      .then(d => { setInsiders(d); setInsLoad(false); })
      .catch(() => setInsLoad(false));
  }, [tab]);

  // Free users ven 5 gurÃºs, el resto con blur

  const fmt$ = v => v >= 1e9 ? `$${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${v}`;
  const TABS = [{k:"gurus",l:"ðï¸ GurÃºs"},{k:"ark",l:"ð ARK Daily"},{k:"insiders",l:"ðµï¸ Insiders SEC"}];
  const ARK_FUNDS = ["ARKK","ARKQ","ARKW","ARKG","ARKF"];

  return (
    <div style={{maxWidth:980,margin:"0 auto"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,rgba(10,14,26,0.98),rgba(20,26,46,0.95))",border:"1px solid rgba(139,92,246,0.2)",borderRadius:20,padding:"20px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:160,height:160,background:"radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,position:"relative"}}>
          <span style={{fontSize:32}}>ðï¸</span>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:"#F1F5F9",letterSpacing:-0.5}}>Inversores Influyentes</div>
            <div style={{fontSize:12,color:"#475569"}}>GurÃºs Â· ARK en tiempo real Â· Insiders corporativos SEC</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            {pxUpdated && <span style={{fontSize:10,color:"#334155"}}>Act. {pxUpdated}</span>}
            <button onClick={fetchLivePrices} disabled={pxLoading}
              style={{display:"flex",alignItems:"center",gap:5,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:700,color:"#818CF8",cursor:"pointer",transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.25)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(99,102,241,0.15)"}>
              <span style={{display:"inline-block",animation:pxLoading?"spin 1s linear infinite":"none"}}>ð</span>
              {pxLoading?"Actualizandoâ¦":"Refresh precios"}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(0,210,106,0.1)",border:"1px solid rgba(0,210,106,0.2)",borderRadius:20,padding:"5px 12px"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#00D26A",display:"inline-block",animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:11,fontWeight:700,color:"#00D26A"}}>{GURUS_13F.length} GURÃS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        {TABS.map(t => (
          <button key={t.k} onClick={()=>setTab(t.k)}
            style={{background:tab===t.k?"linear-gradient(135deg,#8B5CF6,#6D28D9)":"transparent",border:`1.5px solid ${tab===t.k?"transparent":C.border}`,borderRadius:20,padding:"8px 18px",fontSize:13,fontWeight:700,color:tab===t.k?"#fff":C.muted,cursor:"pointer",transition:"all 0.15s",boxShadow:tab===t.k?"0 4px 12px rgba(124,58,237,0.3)":"none"}}>
            {t.l}
          </button>
        ))}
        {/* Search bar */}
        {tab==="gurus" && !selGuru && (
          <div style={{marginLeft:"auto",position:"relative"}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:12,color:C.muted2}}>ð</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar inversorâ¦"
              style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:20,padding:"7px 12px 7px 30px",fontSize:12,color:C.text,outline:"none",width:180}}/>
          </div>
        )}
      </div>

      {/* ââ GURÃS TAB ââ */}
      {tab==="gurus" && !selGuru && (() => {
        const visibleGurus = GURUS_13F.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.fund.toLowerCase().includes(search.toLowerCase()));
        const FREE_LIMIT = 5;
        return (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
              {visibleGurus.map((g, idx) => {
                const isLocked = !isPremium && idx >= FREE_LIMIT;
                return (
                  <div key={g.id} style={{position:"relative",userSelect:isLocked?"none":"auto"}}>
                    <div
                      style={{filter:isLocked?"blur(5px)":"none",pointerEvents:isLocked?"none":"auto",transition:"filter 0.2s"}}
                      onClick={()=>{ if(!isLocked){setSelGuru(g.id);setDetailTab("holdings");} }}>
                      <div
                        style={{background:"linear-gradient(145deg,rgba(15,23,42,0.98),rgba(20,30,50,0.95))",border:`1px solid ${g.color}30`,borderRadius:18,padding:"18px",cursor:"pointer",transition:"all 0.2s",position:"relative",overflow:"hidden"}}
                        onMouseEnter={e=>{if(!isLocked){e.currentTarget.style.border=`1px solid ${g.color}60`;e.currentTarget.style.boxShadow=`0 8px 24px ${g.color}15`;}}}
                        onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${g.color}30`;e.currentTarget.style.boxShadow="none";}}>
                        <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,background:`radial-gradient(circle,${g.color}12 0%,transparent 70%)`,pointerEvents:"none"}}/>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                          <div style={{width:46,height:46,borderRadius:14,background:`linear-gradient(135deg,${g.color}30,${g.color}10)`,border:`1px solid ${g.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{g.emoji}</div>
                          <div>
                            <div style={{fontWeight:800,color:"#F1F5F9",fontSize:14}}>{g.name}</div>
                            <div style={{fontSize:11,color:"#475569"}}>{g.fund}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:10,marginBottom:10}}>
                          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 10px",flex:1,textAlign:"center"}}>
                            <div style={{fontSize:11,fontWeight:800,color:g.color}}>{g.aum}</div>
                            <div style={{fontSize:9,color:"#475569"}}>AUM</div>
                          </div>
                          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 10px",flex:1,textAlign:"center"}}>
                            <div style={{fontSize:11,fontWeight:800,color:"#F1F5F9"}}>{g.numStocks}</div>
                            <div style={{fontSize:9,color:"#475569"}}>Posiciones</div>
                          </div>
                          <div style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:"6px 10px",flex:1,textAlign:"center"}}>
                            <div style={{fontSize:10,fontWeight:700,color:"#F1F5F9"}}>{g.period}</div>
                            <div style={{fontSize:9,color:"#475569"}}>PerÃ­odo</div>
                          </div>
                        </div>
                        <div style={{fontSize:11,color:"#64748B",lineHeight:1.5,marginBottom:10}}>{g.bio || `${g.fund} Â· ${g.period} Â· ${g.numStocks} posiciones`}</div>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {g.holdings.slice(0,5).map(h=>{
                            const px=livePx[h.t]; const pos=(px?.change||0)>=0;
                            return(<span key={h.t} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:700,color:g.color}}>
                              {h.t} <span style={{color:pos?"#00D26A":"#FF4D6A",fontSize:9}}>{px?`${pos?"+":""}${px.change.toFixed(1)}%`:""}</span>
                            </span>);
                          })}
                        </div>
                        <div style={{marginTop:10,textAlign:"right",fontSize:10,color:g.color,fontWeight:700}}>Ver portafolio completo â</div>
                      </div>
                    </div>
                    {/* Lock overlay â solo en el 6to elemento */}
                    {isLocked && idx === FREE_LIMIT && (
                      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:2}}>
                        <div style={{background:"rgba(12,10,30,0.96)",border:"1px solid rgba(124,58,237,0.4)",borderRadius:16,padding:"18px 22px",textAlign:"center",maxWidth:220,boxShadow:"0 8px 40px rgba(0,0,0,0.6)"}}>
                          <div style={{fontSize:26,marginBottom:6}}>ð</div>
                          <div style={{fontWeight:800,color:"#fff",fontSize:13,marginBottom:5}}>{GURUS_13F.length - FREE_LIMIT} gurÃºs mÃ¡s bloqueados</div>
                          <div style={{fontSize:11,color:"#94a3b8",marginBottom:12}}>Desbloquea todos: Buffett, Ackman, Burry, ARK y mÃ¡s</div>
                          <button onClick={onNeedPremium}
                            style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",color:"#fff",border:"none",borderRadius:10,padding:"9px 18px",fontSize:12,fontWeight:800,cursor:"pointer",width:"100%"}}>
                            â¦ Ver todos â $9.99/mes
                          </button>
                          <div style={{fontSize:10,color:"#475569",marginTop:5}}>7 dÃ­as gratis</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Banner CTA si es free */}
            {!isPremium && (
              <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(99,102,241,0.07))",border:"1px solid rgba(124,58,237,0.22)",borderRadius:16,padding:"18px 24px",marginTop:16,textAlign:"center"}}>
                <div style={{fontWeight:800,color:"#A78BFA",fontSize:14,marginBottom:4}}>ðï¸ Accede a los {GURUS_13F.length} portafolios institucionales con VIP</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>Buffett Â· Ackman Â· Burry Â· ARK Â· Insiders SEC Â· Dark Pools</div>
                <button onClick={onNeedPremium}
                  style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",color:"#fff",border:"none",borderRadius:10,padding:"11px 28px",fontSize:13,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 20px rgba(124,58,237,0.4)"}}>
                  â¦ Activar VIP â 7 dÃ­as gratis â
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* ââ DETAIL VIEW (like the screenshot) ââ */}
      {tab==="gurus" && selGuru && (()=>{
        const g = GURUS_13F.find(x=>x.id===selGuru);
        if(!g) return null;
        const buys    = g.holdings.filter(h=>h.act==="Buy"||h.act==="Add"||h.act==="New");
        const sells   = g.holdings.filter(h=>h.act==="Reduce"||h.act==="Sold");
        const viewMap = {holdings:g.holdings, buys, sells};
        const rows    = viewMap[detailTab]||g.holdings;
        const fmt$B   = v=>v>=1e9?`$${(v/1e9).toFixed(2)}B`:v>=1e6?`$${(v/1e6).toFixed(1)}M`:`$${v?.toLocaleString()||0}`;
        return(
          <div>
            {/* Back */}
            <button onClick={()=>setSelGuru(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,fontWeight:700,marginBottom:14,padding:0,display:"flex",alignItems:"center",gap:6}}>
              â Volver a todos los inversores
            </button>
            {/* Guru header */}
            <div style={{background:"linear-gradient(145deg,rgba(15,23,42,0.98),rgba(20,30,50,0.95))",border:`1px solid ${g.color}30`,borderRadius:18,padding:"20px 24px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:52,height:52,borderRadius:14,background:`linear-gradient(135deg,${g.color}30,${g.color}10)`,border:`1px solid ${g.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>{g.emoji}</div>
                <div>
                  <div style={{fontWeight:900,color:"#F1F5F9",fontSize:18}}>{g.name}</div>
                  <div style={{fontSize:12,color:"#475569"}}>{g.fund}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                {[["PerÃ­odo",g.period],["Fecha portafolio",g.portfolioDate],["NÂ° de acciones",g.numStocks],["Valor portafolio",g.aum]].map(([l,v])=>(
                  <div key={l} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 14px"}}>
                    <div style={{fontSize:10,color:"#475569",marginBottom:3}}>{l}</div>
                    <div style={{fontWeight:800,color:"#F1F5F9",fontSize:13}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Sub-tabs */}
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {[["holdings","ð Holdings"],["buys","ð¢ Compras"],["sells","ð´ Ventas"]].map(([k,l])=>(
                <button key={k} onClick={()=>setDetailTab(k)}
                  style={{background:detailTab===k?g.color+"20":"transparent",border:`1.5px solid ${detailTab===k?g.color:C.border}`,borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:700,color:detailTab===k?g.color:C.muted,cursor:"pointer",transition:"all 0.15s"}}>
                  {l}
                </button>
              ))}
              <div style={{marginLeft:"auto",fontSize:11,color:C.muted2,alignSelf:"center"}}>Fuente: SEC 13F Â· {g.period} Â· Precios en vivo: Finnhub</div>
            </div>
            {/* Table header */}
            <div style={{display:"grid",gridTemplateColumns:"130px 1fr 60px 110px 90px 100px 90px 90px 80px 80px",gap:6,padding:"8px 14px",background:C.card2,borderRadius:12,marginBottom:6,border:`1px solid ${C.border}`,overflowX:"auto"}}>
              {["ACCIÃN","EMPRESA","% PORT.","ACTIVIDAD","ACCIONES","PRECIO REP.","VALOR","PRECIO HOY","+/- REP.","52W RANGO"].map(h=>(
                <div key={h} style={{fontSize:9,fontWeight:700,color:C.muted2,letterSpacing:0.5,whiteSpace:"nowrap"}}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            <div style={{overflowX:"auto"}}>
              {rows.map((h,i)=>{
                const px   = livePx[h.t];
                const curr = px?.price||null;
                const diff = curr&&h.rPrice ? ((curr-h.rPrice)/h.rPrice*100) : null;
                const pos  = (diff||0)>=0;
                const actColor = h.act==="Buy"||h.act==="Add"||h.act==="New"?"#00D26A":h.act==="Reduce"||h.act==="Sold"?"#FF4D6A":"#64748B";
                return(
                  <div key={h.t} style={{display:"grid",gridTemplateColumns:"130px 1fr 60px 110px 90px 100px 100px 90px 90px 80px",gap:6,padding:"11px 14px",background:i%2===0?"rgba(255,255,255,0.01)":"transparent",borderRadius:10,marginBottom:3,border:"1px solid rgba(255,255,255,0.03)",transition:"background 0.15s",minWidth:900}}
                    onMouseEnter={e=>e.currentTarget.style.background=`${g.color}08`}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"rgba(255,255,255,0.01)":"transparent"}>
                    <div style={{fontFamily:"monospace",fontWeight:800,fontSize:13,color:g.color}}>{h.t}</div>
                    <div style={{fontSize:11,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.n}</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#F1F5F9"}}>{h.pct?.toFixed(2)}%</div>
                    <div style={{fontSize:11,fontWeight:700,color:actColor}}>
                      {h.act?`${h.act}${h.actPct?` ${h.actPct>0?"+":""}${h.actPct?.toFixed(2)}%`:""}`:"â"}
                    </div>
                    <div style={{fontSize:11,color:C.muted}}>{h.shares?.toLocaleString()||"â"}</div>
                    <div style={{fontSize:12,fontWeight:600,color:"#F1F5F9"}}>${h.rPrice?.toFixed(2)||"â"}</div>
                    <div style={{fontSize:11,color:C.muted}}>{fmt$B(h.val)}</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#F1F5F9"}}>{curr?`$${curr.toFixed(2)}`:"â"}</div>
                    <div style={{fontSize:12,fontWeight:700,color:diff===null?"#64748B":pos?"#00D26A":"#FF4D6A"}}>
                      {diff!==null?`${pos?"+":""}${diff.toFixed(2)}%`:"â"}
                    </div>
                    <div style={{fontSize:10,color:"#475569",whiteSpace:"nowrap"}}>
                      {h.w52l&&h.w52h?`$${h.w52l} - $${h.w52h}`:"â"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{textAlign:"center",padding:"12px 0",fontSize:11,color:C.muted2}}>
              * Precio reportado = precio al cierre del trimestre Â· Precio actual en tiempo real vÃ­a Finnhub
            </div>
          </div>
        );
      })()}

      {/* ââ ARK TAB ââ */}
      {tab==="ark" && (
        <div>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:12,color:C.muted,fontWeight:600}}>ETF:</span>
            {ARK_FUNDS.map(f => (
              <button key={f} onClick={()=>setArkFund(f)}
                style={{background:arkFund===f?"rgba(139,92,246,0.2)":"transparent",border:`1px solid ${arkFund===f?"rgba(139,92,246,0.5)":C.border}`,borderRadius:20,padding:"5px 12px",fontSize:12,fontWeight:700,color:arkFund===f?"#A78BFA":C.muted,cursor:"pointer"}}>
                {f}
              </button>
            ))}
            <span style={{marginLeft:"auto",fontSize:11,color:C.muted2}}>ð Cathie Wood Â· Actualizado: {arkData?.date||"hoy"}</span>
          </div>

          {arkLoad ? (
            <div style={{textAlign:"center",padding:"60px",color:C.muted}}>
              <div style={{fontSize:32,marginBottom:8}}>ð</div>
              <div>Cargando holdings de ARK...</div>
            </div>
          ) : (
            <>
              <div style={{display:"grid",gridTemplateColumns:"50px 1fr 80px 80px 80px",gap:8,padding:"8px 16px",background:C.card2,borderRadius:12,marginBottom:6,border:`1px solid ${C.border}`}}>
                {["#","EMPRESA","PESO","PRECIO","HOY"].map(h=>(
                  <div key={h} style={{fontSize:9,fontWeight:700,color:C.muted2,letterSpacing:0.6}}>{h}</div>
                ))}
              </div>
              {(arkData?.holdings||[]).map((h,i) => {
                const pos = h.change >= 0;
                return (
                  <div key={h.ticker} style={{display:"grid",gridTemplateColumns:"50px 1fr 80px 80px 80px",gap:8,padding:"12px 16px",background:"rgba(255,255,255,0.01)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:12,marginBottom:5,transition:"background 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.05)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.01)"}>
                    <div style={{fontSize:12,color:C.muted2,fontWeight:700}}>#{i+1}</div>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"monospace",fontWeight:800,fontSize:13,color:"#8B5CF6"}}>{h.ticker}</span>
                        <span style={{fontSize:11,color:C.muted}}>{h.company}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:"#F1F5F9"}}>{h.weight?.toFixed(1)||"â"}%</div>
                      <div style={{width:"100%",height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,marginTop:3}}>
                        <div style={{width:`${Math.min((h.weight||0)*5,100)}%`,height:"100%",background:"linear-gradient(90deg,#8B5CF6,#6D28D9)",borderRadius:2}}/>
                      </div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:"#F1F5F9"}}>{h.price?`$${h.price.toFixed(2)}`:"â"}</div>
                    <div style={{fontSize:12,fontWeight:700,color:pos?"#00D26A":"#FF4D6A"}}>{h.change!=null?`${pos?"+":""}${h.change.toFixed(2)}%`:"â"}</div>
                  </div>
                );
              })}
              {arkData?.fallback && <div style={{textAlign:"center",fontSize:11,color:C.muted2,padding:"8px 0"}}>* Datos del Ãºltimo reporte disponible</div>}
            </>
          )}
        </div>
      )}

      {/* ââ INSIDERS TAB ââ */}
      {tab==="insiders" && (
        <div>
          {/* subheader */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,gap:8,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{display:"flex",gap:6}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(0,210,106,0.1)",border:"1px solid rgba(0,210,106,0.2)",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,color:"#00D26A"}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  COMPRA
                </span>
                <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,77,106,0.1)",border:"1px solid rgba(255,77,106,0.2)",borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,color:"#FF4D6A"}}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
                  VENTA
                </span>
              </div>
              <span style={{fontSize:11,color:"#334155"}}>Compras y ventas de ejecutivos Â· SEC EDGAR Form 4</span>
            </div>
            <button onClick={()=>{setInsLoad(true);fetch("/api/insiders").then(r=>r.json()).then(d=>{setInsiders(d);setInsLoad(false);}).catch(()=>setInsLoad(false));}}
              style={{display:"flex",alignItems:"center",gap:5,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:8,padding:"6px 14px",fontSize:11,fontWeight:700,color:"#818CF8",cursor:"pointer",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,0.2)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(99,102,241,0.1)"}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
              Actualizar
            </button>
          </div>

          {insLoad ? (
            <div style={{textAlign:"center",padding:"60px",color:C.muted}}>
              <div style={{width:36,height:36,borderRadius:"50%",border:"3px solid rgba(99,102,241,0.2)",borderTopColor:"#818CF8",animation:"spin 1s linear infinite",margin:"0 auto 12px"}}/>
              <div style={{fontSize:13}}>Cargando datos de SEC EDGAR...</div>
            </div>
          ) : (insiders?.transactions||[]).length === 0 ? (
            <div style={{textAlign:"center",padding:"48px 20px",background:"rgba(255,255,255,0.01)",borderRadius:16,border:"1px dashed rgba(255,255,255,0.06)"}}>
              <svg style={{opacity:0.3,marginBottom:10}} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <div style={{fontSize:13,color:C.muted}}>No hay transacciones recientes Â· Haz clic en Actualizar</div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {/* Table header */}
              <div style={{display:"grid",gridTemplateColumns:"44px 1fr 90px 100px 80px 70px",gap:10,padding:"7px 14px",background:"rgba(255,255,255,0.02)",borderRadius:10,border:"1px solid rgba(255,255,255,0.04)",marginBottom:4}}>
                {["","EJECUTIVO","TICKER","MONTO","TIPO","FECHA"].map(h=>(
                  <div key={h} style={{fontSize:10,fontWeight:700,color:"#334155",letterSpacing:"0.07em",textTransform:"uppercase"}}>{h}</div>
                ))}
              </div>
              {(insiders?.transactions||[]).map((t,i) => {
                const isCompra = t.type==="COMPRA";
                const BuyIcon = () => (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D26A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>
                  </svg>
                );
                const SellIcon = () => (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF4D6A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/>
                  </svg>
                );
                return (
                  <div key={i} style={{display:"grid",gridTemplateColumns:"44px 1fr 90px 100px 80px 70px",gap:10,alignItems:"center",padding:"11px 14px",background:i%2===0?"rgba(255,255,255,0.015)":"transparent",borderRadius:10,border:`1px solid ${isCompra?"rgba(0,210,106,0.06)":"rgba(255,77,106,0.06)"}`,borderLeft:`3px solid ${isCompra?"rgba(0,210,106,0.5)":"rgba(255,77,106,0.5)"}`,transition:"background 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=isCompra?"rgba(0,210,106,0.04)":"rgba(255,77,106,0.04)"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"rgba(255,255,255,0.015)":"transparent"}>
                    {/* Icon */}
                    <div style={{width:36,height:36,borderRadius:10,background:isCompra?"rgba(0,210,106,0.1)":"rgba(255,77,106,0.1)",border:`1px solid ${isCompra?"rgba(0,210,106,0.2)":"rgba(255,77,106,0.2)"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {isCompra ? <BuyIcon/> : <SellIcon/>}
                    </div>
                    {/* Nombre + rol */}
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:700,color:"#E2E8F0",fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name||"â"}</div>
                      <div style={{fontSize:11,color:"#475569",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.role||""}{t.role&&t.company?" Â· ":""}{t.company||""}</div>
                    </div>
                    {/* Ticker */}
                    <div style={{fontFamily:"monospace",fontWeight:800,fontSize:14,color:t.ticker?.includes("BTC")?"#F7931A":"#A78BFA"}}>{t.ticker||"â"}</div>
                    {/* Monto */}
                    <div>
                      <div style={{fontWeight:700,color:"#F1F5F9",fontSize:13}}>{t.value>0?fmt$(t.value):"â"}</div>
                      {t.shares>0&&<div style={{fontSize:10,color:"#475569"}}>{t.shares?.toLocaleString()} acc.</div>}
                    </div>
                    {/* Badge tipo */}
                    <div>
                      <span style={{display:"inline-flex",alignItems:"center",gap:4,background:isCompra?"rgba(0,210,106,0.12)":"rgba(255,77,106,0.12)",color:isCompra?"#00D26A":"#FF4D6A",border:`1px solid ${isCompra?"rgba(0,210,106,0.3)":"rgba(255,77,106,0.3)"}`,borderRadius:6,padding:"3px 8px",fontSize:10,fontWeight:800,whiteSpace:"nowrap"}}>
                        {isCompra
                          ? <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19V5M5 12l7-7 7 7"/></svg>COMPRA</>
                          : <><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>VENTA</>
                        }
                      </span>
                    </div>
                    {/* Fecha */}
                    <div style={{fontSize:11,color:"#475569",textAlign:"right"}}>{t.filed||""}</div>
                  </div>
                );
              })}
              <div style={{textAlign:"center",fontSize:10,color:"#1e293b",padding:"10px 0",letterSpacing:"0.05em"}}>
                FUENTE: SEC EDGAR Â· FORM 4 Â· {insiders?.source||"DATOS EN TIEMPO REAL"}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ââ IDEAS DE INVERSIÃN PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââ
const IDEAS_DATA = [
  // ââ COMPRAS ââ
  {id:1,ticker:"NVDA",name:"NVIDIA Corp",icon:"ð¥ï¸",sector:"TecnologÃ­a",signal:"COMPRA",entry:120,target:185,stop:102,horizon:"3-6 meses",risk:"Medio",riskN:2,tags:["IA","Chips","GPU"],thesis:"NVIDIA mantiene dominio absoluto en GPUs de IA con arquitectura Blackwell. La demanda de centros de datos de hyperscalers no muestra desaceleraciÃ³n. MÃ¡rgenes brutos >75% y backlog rÃ©cord justifican valoraciÃ³n premium. Cada nuevo modelo de IA requiere mÃ¡s cÃ³mputo â NVIDIA captura ese crecimiento exponencial.",published:"2026-05-15",analyst:"NexoTrade Research"},
  {id:2,ticker:"META",name:"Meta Platforms",icon:"ð",sector:"TecnologÃ­a",signal:"COMPRA",entry:560,target:750,stop:490,horizon:"3-6 meses",risk:"Bajo",riskN:1,tags:["IA","Publicidad","Social"],thesis:"Meta combina el mejor negocio publicitario del mundo con inversiÃ³n agresiva en IA generativa. Llama y sus modelos de recomendaciÃ³n mejoran el ROI publicitario. Threads crece aceleradamente. Reels monetiza mejor que Stories. Cotiza a mÃºltiplos razonables con recompra de acciones masiva.",published:"2026-05-18",analyst:"NexoTrade Research"},
  {id:3,ticker:"AMZN",name:"Amazon.com Inc",icon:"ð¦",sector:"TecnologÃ­a",signal:"COMPRA",entry:210,target:285,stop:185,horizon:"6-12 meses",risk:"Bajo",riskN:1,tags:["Cloud","IA","E-commerce"],thesis:"AWS recupera momentum con contratos de IA enterprise. El negocio publicitario supera $56B anuales. El segmento de terceros y logÃ­stica mejora mÃ¡rgenes. Prime Video y Alexa+ aceleran el ecosistema. GestiÃ³n de costos clase mundial con Jassy en el timÃ³n.",published:"2026-05-12",analyst:"NexoTrade Research"},
  {id:4,ticker:"CRWD",name:"CrowdStrike Holdings",icon:"ð¡ï¸",sector:"Ciberseguridad",signal:"COMPRA",entry:395,target:520,stop:345,horizon:"6-12 meses",risk:"Medio",riskN:2,tags:["Ciberseguridad","SaaS","Zero-Trust"],thesis:"CrowdStrike es el lÃ­der indiscutible en ciberseguridad basada en IA. Su plataforma Falcon consolida mÃ¡s de 28 mÃ³dulos reemplazando soluciones legacy. Net Revenue Retention >120%. El incidente de julio 2025 ya fue superado â los clientes confiaron en la empresa. Crecimiento de 30%+ sostenido.",published:"2026-05-10",analyst:"NexoTrade Research"},
  {id:5,ticker:"PLTR",name:"Palantir Technologies",icon:"ð®",sector:"TecnologÃ­a",signal:"COMPRA",entry:118,target:160,stop:98,horizon:"3-6 meses",risk:"Alto",riskN:3,tags:["IA","Gobierno","Defensa"],thesis:"Palantir tiene contratos crÃ­ticos con el ejÃ©rcito americano y agencias de inteligencia. AIP (plataforma de IA) genera crecimiento acelerado en sector comercial (+55% YoY). Ãnico entre empresas de software con acceso a datos clasificados del gobierno. Alta visibilidad de ingresos recurrentes.",published:"2026-05-08",analyst:"NexoTrade Research"},
  {id:6,ticker:"MU",name:"Micron Technology",icon:"ð¾",sector:"Semiconductores",signal:"COMPRA",entry:112,target:160,stop:94,horizon:"6-12 meses",risk:"Medio",riskN:2,tags:["Memoria","HBM","IA"],thesis:"Micron es el mayor beneficiario del ciclo de IA en memorias. HBM3E para GPUs de NVIDIA se vende con precios premium y backlog hasta 2027. El ciclo DRAM se normaliza con precios subiendo. La memoria para IA crece 3-5x mÃ¡s rÃ¡pido que DRAM tradicional. ValoraciÃ³n atractiva vs peers.",published:"2026-05-14",analyst:"NexoTrade Research"},
  {id:7,ticker:"COIN",name:"Coinbase Global",icon:"ðª",sector:"Cripto/Fintech",signal:"COMPRA",entry:225,target:320,stop:190,horizon:"3-6 meses",risk:"Alto",riskN:3,tags:["Cripto","Exchange","Base"],thesis:"Coinbase se beneficia directamente del bull market cripto con mayor volumen de trading. Su red Base (L2 de Ethereum) genera nuevas fuentes de ingresos. El ETF de Bitcoin aprobado aumentÃ³ flujos institucionales. USDC genera ingresos de interÃ©s con tasas altas. RegulaciÃ³n mÃ¡s favorable bajo nueva administraciÃ³n.",published:"2026-05-17",analyst:"NexoTrade Research"},
  {id:8,ticker:"GS",name:"Goldman Sachs",icon:"ð¦",sector:"Financiero",signal:"COMPRA",entry:558,target:680,stop:488,horizon:"6-12 meses",risk:"Bajo",riskN:1,tags:["Banca","M&A","Trading"],thesis:"Goldman lidera el resurgimiento de M&A con pipeline robusto de deals para H2 2026. Trading de renta fija y equities supera expectativas. Banca de inversiÃ³n se reactiva con IPO market en recuperaciÃ³n. El retiro de IA en gestiÃ³n de activos genera eficiencias de costos. Dividendo creciente.",published:"2026-05-06",analyst:"NexoTrade Research"},
  {id:9,ticker:"HOOD",name:"Robinhood Markets",icon:"ð¹",sector:"Fintech",signal:"COMPRA",entry:44,target:68,stop:37,horizon:"3-6 meses",risk:"Alto",riskN:3,tags:["Fintech","Retail","Opciones"],thesis:"Robinhood se convierte en plataforma financiera completa: opciones, cripto, IRA, tarjeta de crÃ©dito, y prÃ³ximamente banca. La generaciÃ³n millennial y Z adopta su plataforma como banco principal. Gold subscription crece aceleradamente. Cada nuevo producto cross-sells al usuario base existente.",published:"2026-05-20",analyst:"NexoTrade Research"},
  {id:10,ticker:"RXRX",name:"Recursion Pharma",icon:"ð§¬",sector:"Biotech",signal:"COMPRA",entry:7,target:14,stop:5,horizon:"12+ meses",risk:"Alto",riskN:3,tags:["IA MÃ©dica","Drug Discovery","Biotech"],thesis:"Recursion usa IA y biologÃ­a computacional para descubrir medicamentos 10x mÃ¡s rÃ¡pido que mÃ©todos tradicionales. Partnership con NVIDIA para acceso a supercomputing. Pipeline de +40 programas. El modelo de descubrimiento de fÃ¡rmacos con IA tiene valor exponencial cuando los primeros programas lleguen a Fase 3.",published:"2026-05-01",analyst:"NexoTrade Research"},
  {id:11,ticker:"AVGO",name:"Broadcom Inc",icon:"ð¡",sector:"Semiconductores",signal:"COMPRA",entry:188,target:250,stop:162,horizon:"6-12 meses",risk:"Bajo",riskN:1,tags:["ASIC","IA","Networking"],thesis:"Broadcom diseÃ±a chips ASIC personalizados de IA para Google, Meta y Apple â una alternativa rentable a las GPUs de NVIDIA. Su segmento VMware post-adquisiciÃ³n genera FCF masivo. El negocio de networking para centros de datos crece con la demanda de IA. Dividendo sÃ³lido y recompras agresivas.",published:"2026-05-09",analyst:"NexoTrade Research"},
  {id:12,ticker:"MSTR",name:"MicroStrategy Inc",icon:"â¿",sector:"Cripto",signal:"COMPRA",entry:365,target:520,stop:290,horizon:"3-6 meses",risk:"Alto",riskN:3,tags:["Bitcoin","Leverage","Cripto"],thesis:"MicroStrategy es el vehÃ­culo de exposiciÃ³n a Bitcoin mÃ¡s lÃ­quido del mercado para instituciones. Michael Saylor continÃºa acumulando BTC con equity offerings. Cotiza con premium sobre NAV de Bitcoin, pero ese premium se justifica por su capacidad de seguir emitiendo acciones para comprar mÃ¡s BTC en un mercado alcista.",published:"2026-05-13",analyst:"NexoTrade Research"},
  {id:13,ticker:"ARM",name:"Arm Holdings",icon:"âï¸",sector:"Semiconductores",signal:"COMPRA",entry:140,target:195,stop:118,horizon:"6-12 meses",risk:"Medio",riskN:2,tags:["IP","Chips","IA","Mobile"],thesis:"Arm licencia su arquitectura a prÃ¡cticamente todos los chipmakers del mundo. Sus royalties crecen con cada generaciÃ³n de iPhone, servidor, y ahora chips de IA. El CSS (Compute Subsystems) acelera el tiempo al mercado para clientes, aumentando royalties por chip. PosiciÃ³n de monopolio natural difÃ­cilmente atacable.",published:"2026-05-03",analyst:"NexoTrade Research"},
  {id:14,ticker:"SPOT",name:"Spotify Technology",icon:"ðµ",sector:"TecnologÃ­a/Media",signal:"COMPRA",entry:610,target:800,stop:528,horizon:"6-12 meses",risk:"Medio",riskN:2,tags:["Streaming","Audio","IA"],thesis:"Spotify alcanzÃ³ 678M de usuarios y primera rentabilidad GAAP sostenida. Su ventaja en podcasts, audiolibros y mÃºsica con IA de recomendaciÃ³n es imposible de replicar. La monetizaciÃ³n premium crece y el mercado publicitario de audio digital se expande. Margenes EBIT en expansiÃ³n consistente.",published:"2026-04-28",analyst:"NexoTrade Research"},
  {id:15,ticker:"UBER",name:"Uber Technologies",icon:"ð",sector:"TecnologÃ­a/Transporte",signal:"COMPRA",entry:78,target:108,stop:65,horizon:"6-12 meses",risk:"Bajo",riskN:1,tags:["Rides","Delivery","Autonomous"],thesis:"Uber alcanzÃ³ FCF positivo y rentabilidad GAAP. Su red de 150M de usuarios activos y 7M de conductores es imposible de replicar. Delivery crece con Uber Eats. La llegada de robotaxis de Waymo y Tesla usarÃ¡ la plataforma Uber â no la competirÃ¡. MÃºltiplo atractivo relativo a crecimiento de 20%+.",published:"2026-05-02",analyst:"NexoTrade Research"},
  // ââ VENTAS ââ
  {id:16,ticker:"INTC",name:"Intel Corp",icon:"ðµ",sector:"Semiconductores",signal:"VENTA",entry:22,target:14,stop:27,horizon:"3-6 meses",risk:"Medio",riskN:2,tags:["Chips","Foundry","Declive"],thesis:"Intel pierde cuota de mercado aceleradamente en CPUs de servidor ante AMD, y en foundry ante TSMC y Samsung. La estrategia de IDM 2.0 no convence al mercado. 18A sigue con problemas de yield. Los clientes foundry prefieren TSMC. El recorte de dividendo 2025 destruyÃ³ la tesis de inversiÃ³n de income. El CEO Pat Gelsinger fue reemplazado â falta de visiÃ³n clara.",published:"2026-05-05",analyst:"NexoTrade Research"},
  {id:17,ticker:"PFE",name:"Pfizer Inc",icon:"ð",sector:"FarmacÃ©utico",signal:"VENTA",entry:26,target:18,stop:30,horizon:"6-12 meses",risk:"Medio",riskN:2,tags:["Pharma","Patent Cliff","COVID"],thesis:"Pfizer enfrenta acantilado de patentes brutal: ingresos de COVID (Paxlovid, vacuna) colapsaron de $56B a $13B. La adquisiciÃ³n de Seagen fue cara y dilutiva. El pipeline no tiene blockbusters inminentes. La deuda sigue elevada post-adquisiciones. El dividendo puede ser insostenible si los flujos no se recuperan en 2027.",published:"2026-05-07",analyst:"NexoTrade Research"},
  {id:18,ticker:"DIS",name:"Walt Disney Co",icon:"ð°",sector:"Entretenimiento",signal:"VENTA",entry:100,target:78,stop:112,horizon:"3-6 meses",risk:"Medio",riskN:2,tags:["Streaming","Parks","Media"],thesis:"Disney+ no logra rentabilidad sostenida. Los parques temÃ¡ticos muestran seÃ±ales de saturaciÃ³n de demanda post-COVID. El lineal TV (ABC, ESPN) sigue en declive estructural. La batalla por los derechos de ESPN con sports leagues es cara. Bob Iger no ha presentado un plan de sucesiÃ³n claro. El contenido cinematogrÃ¡fico decepcionÃ³ en 2025.",published:"2026-05-04",analyst:"NexoTrade Research"},
  {id:19,ticker:"BA",name:"Boeing Co",icon:"âï¸",sector:"Aeroespacial",signal:"VENTA",entry:185,target:140,stop:205,horizon:"6-12 meses",risk:"Alto",riskN:3,tags:["Aeroespacial","Manufactura","Seguridad"],thesis:"Boeing atraviesa su crisis mÃ¡s profunda. La huelga de trabajadores costÃ³ >$5B. Las certificaciones del 737 MAX siguen retrasadas por problemas de calidad. La deuda supera $58B. Airbus toma cuota de mercado de manera permanente. El CEO Kelly Ortberg enfrenta desafÃ­os culturales sistÃ©micos. La recuperaciÃ³n tomarÃ¡ aÃ±os.",published:"2026-04-25",analyst:"NexoTrade Research"},
  {id:20,ticker:"SNAP",name:"Snap Inc",icon:"ð»",sector:"Social Media",signal:"VENTA",entry:10,target:6,stop:13,horizon:"3-6 meses",risk:"Alto",riskN:3,tags:["Social","Publicidad","Decrecimiento"],thesis:"Snap pierde terreno frente a TikTok e Instagram en el segmento joven. Su modelo publicitario de Direct Response sigue rezagado vs Meta. DAU estancada. Evan Spiegel no ha encontrado el modelo de monetizaciÃ³n correcto. Sin ventaja estructural clara â ni en contenido, ni en anuncios, ni en hardware (Spectacles fracasÃ³).",published:"2026-04-30",analyst:"NexoTrade Research"},
  {id:21,ticker:"BYND",name:"Beyond Meat Inc",icon:"ð±",sector:"Alimentos",signal:"VENTA",entry:5,target:2,stop:7,horizon:"3-6 meses",risk:"Alto",riskN:3,tags:["Alt-Protein","Consumo","Declive"],thesis:"Beyond Meat destruyÃ³ valor de manera consistente. Los ingresos cayeron de $465M en 2021 a <$80M en 2025. La tendencia de proteÃ­na alternativa no despegÃ³ como se esperaba. Deuda alta relativa a ingresos. La marca ha perdido presencia en restaurantes y retail. La probabilidad de quiebra en 2027 es real.",published:"2026-04-22",analyst:"NexoTrade Research"},
  // ââ NEUTRO ââ
  {id:22,ticker:"AAPL",name:"Apple Inc",icon:"ð",sector:"TecnologÃ­a",signal:"NEUTRO",entry:207,target:215,stop:188,horizon:"3-6 meses",risk:"Bajo",riskN:1,tags:["iPhone","Services","IA"],thesis:"Apple tiene el mejor ecosistema del mundo y mÃ¡rgenes de servicios superiores al 74%. Sin embargo, el crecimiento de iPhone se desacelerÃ³ significativamente en China (-20% YoY). Apple Intelligence no generÃ³ el upgrade cycle esperado. A 30x P/E, el upside limitado versus otras tecnolÃ³gicas. Mantener pero no aÃ±adir posiciÃ³n.",published:"2026-05-16",analyst:"NexoTrade Research"},
  {id:23,ticker:"TSLA",name:"Tesla Inc",icon:"â¡",sector:"Automotriz/IA",signal:"NEUTRO",entry:338,target:355,stop:298,horizon:"3-6 meses",risk:"Alto",riskN:3,tags:["EV","FSD","Robotaxi"],thesis:"Tesla es una empresa dividida: el negocio de EVs bajo presiÃ³n competitiva china, pero con el potencial de FSD/Robotaxi que podrÃ­a ser transformador. Las entregas Q1 2026 decepcionaron. Musk distrae con actividades polÃ­ticas. La promesa del Cybercab podrÃ­a revaluar la empresa en 2027. Esperar mÃ¡s claridad antes de aumentar exposiciÃ³n.",published:"2026-05-11",analyst:"NexoTrade Research"},
  {id:24,ticker:"MSFT",name:"Microsoft Corp",icon:"ðª",sector:"TecnologÃ­a",signal:"NEUTRO",entry:448,target:470,stop:410,horizon:"3-6 meses",risk:"Bajo",riskN:1,tags:["Cloud","IA","Copilot"],thesis:"Microsoft es la empresa mejor posicionada en IA enterprise con Copilot y Azure OpenAI. Azure crece 33% YoY pero el mercado ya descuenta crecimiento premium. A 35x earnings, poca sorpresa positiva disponible en el corto plazo. Empresa de alta calidad pero upside limitado hasta que Copilot mueva la aguja significativamente en ingresos.",published:"2026-05-13",analyst:"NexoTrade Research"},
  {id:25,ticker:"NFLX",name:"Netflix Inc",icon:"ðº",sector:"Entretenimiento",signal:"NEUTRO",entry:1080,target:1120,stop:980,horizon:"3-6 meses",risk:"Medio",riskN:2,tags:["Streaming","Publicidad","Contenido"],thesis:"Netflix logrÃ³ rentabilidad y su nivel con anuncios crece, pero el mÃºltiplo de 40x P/E descuenta gran parte del crecimiento. El contenido sigue siendo caro y la competencia de Amazon, Disney+ y Apple TV se intensifica. Los juegos no generan impacto material. Empresa excelente a valoraciÃ³n elevada â Neutro a niveles actuales.",published:"2026-05-08",analyst:"NexoTrade Research"},
  {id:26,ticker:"JPM",name:"JPMorgan Chase",icon:"ðï¸",sector:"Financiero",signal:"NEUTRO",entry:248,target:265,stop:228,horizon:"6-12 meses",risk:"Bajo",riskN:1,tags:["Banca","Dividendo","Consumo"],thesis:"JPMorgan es el banco mejor gestionado del mundo bajo Jamie Dimon. Sus resultados Q1 2026 fueron sÃ³lidos, pero el NIM (margen de interÃ©s neto) bajarÃ¡ cuando la Fed recorte tasas. El guidance conservador de Dimon sobre riesgos macroeconÃ³micos merece atenciÃ³n. Banco de calidad a precio justo.",published:"2026-05-03",analyst:"NexoTrade Research"},
  {id:27,ticker:"AMD",name:"AMD Inc",icon:"ð´",sector:"Semiconductores",signal:"NEUTRO",entry:116,target:130,stop:96,horizon:"3-6 meses",risk:"Medio",riskN:2,tags:["Chips","IA","Gaming"],thesis:"AMD MI300 gana terreno en IA aunque lejos de NVIDIA. En CPUs server sigue robando cuota a Intel. El segmento gaming/consumer estÃ¡ dÃ©bil. La adquisiciÃ³n de Xilinx aporta FPGAs para networking. El problema: cotiza a mÃºltiplo premium que descuenta ejecuciÃ³n perfecta. Su posiciÃ³n en IA sigue siendo 'challenger'.",published:"2026-04-29",analyst:"NexoTrade Research"},
  {id:28,ticker:"V",name:"Visa Inc",icon:"ð³",sector:"Financiero/Pagos",signal:"NEUTRO",entry:305,target:325,stop:280,horizon:"6-12 meses",risk:"Bajo",riskN:1,tags:["Pagos","Red","Consumo"],thesis:"Visa es uno de los mejores negocios del mundo: red imbatible, mÃ¡rgenes del 65%+, pricing power. Sin embargo, el crecimiento de volÃºmenes se modera con la economÃ­a. Los mÃ¡rgenes ya son mÃ¡ximos. RegulaciÃ³n de interchange fees es riesgo latente. Empresa que siempre vale mÃ¡s â pero el upside de corto plazo es limitado.",published:"2026-05-01",analyst:"NexoTrade Research"},
  {id:29,ticker:"GOOGL",name:"Alphabet Inc",icon:"ð",sector:"TecnologÃ­a",signal:"COMPRA",entry:175,target:225,stop:152,horizon:"6-12 meses",risk:"Bajo",riskN:1,tags:["IA","Search","Cloud","YouTube"],thesis:"Alphabet es la compaÃ±Ã­a de IA mÃ¡s infravalorada del mercado. Google Search integra Gemini y mantiene 91% de market share. GCP crece 35%+ con AI workloads. YouTube supera $40B en ingresos publicitarios. Waymo lidera robotaxis. A 22x earnings con crecimiento de 15%+ es una ganga vs peers. Programa de recompra agresivo.",published:"2026-05-19",analyst:"NexoTrade Research"},
  {id:30,ticker:"LLY",name:"Eli Lilly & Co",icon:"ð",sector:"FarmacÃ©utico",signal:"COMPRA",entry:780,target:1050,stop:680,horizon:"12+ meses",risk:"Bajo",riskN:1,tags:["GLP-1","Obesidad","Diabetes"],thesis:"Eli Lilly tiene el pipeline farmacÃ©utico mÃ¡s valioso del mundo en GLP-1 (Ozempic/Mounjaro). El mercado global de obesidad es >$100B anual y apenas comienza a desarrollarse. Tirzepatide es superior a semaglutida en estudios clÃ­nicos. La demanda supera su capacidad de manufactura â un problema de lujo. Orforglipron oral puede ser el game-changer de 2027.",published:"2026-05-18",analyst:"NexoTrade Research"},
];

function IdeasPage({ isPremium, onNeedPremium }) {
  const [filter, setFilter]     = useState("todos");
  const [sectorF, setSectorF]   = useState("todos");
  const [riskF, setRiskF]       = useState("todos");
  const [sortBy, setSortBy]     = useState("fecha");
  const [livePx, setLivePx]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [selIdea, setSelIdea]   = useState(null);
  const [page, setPage]         = useState(1);
  const PER_PAGE = 12;

  const FINNHUB_KEY = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";

  useEffect(() => {
    const tickers = [...new Set(IDEAS_DATA.map(i => i.ticker))];
    setLoading(true);
    Promise.all(tickers.map(async t => {
      try {
        const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${t}&token=${FINNHUB_KEY}`);
        const d = await r.json();
        if (d.c > 0) return { t, price: d.c, change: d.dp || 0, prevClose: d.pc || 0 };
      } catch {}
      return null;
    })).then(results => {
      const map = {};
      results.filter(Boolean).forEach(r => { map[r.t] = r; });
      setLivePx(map);
      setLoading(false);
    });
  }, []);

  // No bloqueamos a free â muestran 3 ideas, el resto con blur

  const sectors = ["todos", ...new Set(IDEAS_DATA.map(i => i.sector))];

  const filtered = IDEAS_DATA
    .filter(i => filter === "todos" || i.signal.toLowerCase() === filter)
    .filter(i => sectorF === "todos" || i.sector === sectorF)
    .filter(i => riskF === "todos" || i.riskN === Number(riskF))
    .sort((a, b) => {
      if (sortBy === "upside") {
        const ua = livePx[a.ticker] ? ((a.target - livePx[a.ticker].price) / livePx[a.ticker].price * 100) : ((a.target - a.entry) / a.entry * 100);
        const ub = livePx[b.ticker] ? ((b.target - livePx[b.ticker].price) / livePx[b.ticker].price * 100) : ((b.target - b.entry) / b.entry * 100);
        return ub - ua;
      }
      if (sortBy === "seÃ±al") return a.signal.localeCompare(b.signal);
      return new Date(b.published) - new Date(a.published);
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const compras = IDEAS_DATA.filter(i => i.signal === "COMPRA").length;
  const ventas  = IDEAS_DATA.filter(i => i.signal === "VENTA").length;
  const neutros = IDEAS_DATA.filter(i => i.signal === "NEUTRO").length;

  const SIGNAL_COLOR = { "COMPRA":"#10B981", "VENTA":"#EF4444", "NEUTRO":"#F59E0B" };
  const SIGNAL_BG    = { "COMPRA":"rgba(16,185,129,0.12)", "VENTA":"rgba(239,68,68,0.12)", "NEUTRO":"rgba(245,158,11,0.12)" };
  const SIGNAL_ICON  = { "COMPRA":"â", "VENTA":"â", "NEUTRO":"â" };
  const RISK_LABEL   = { 1:"Bajo", 2:"Medio", 3:"Alto" };
  const RISK_COLOR   = { 1:"#10B981", 2:"#F59E0B", 3:"#EF4444" };

  const IdeaCard = ({ idea }) => {
    const live       = livePx[idea.ticker];
    const curPrice   = live?.price || idea.entry;
    const change     = live?.change || 0;
    const isPos      = change >= 0;
    const sc         = SIGNAL_COLOR[idea.signal];
    const isBuy      = idea.signal === "COMPRA";
    const upside     = ((idea.target - curPrice) / curPrice * 100);
    const upsideAbs  = Math.abs(upside).toFixed(1);
    const upsidePos  = (isBuy && upside > 0) || (!isBuy && idea.signal === "VENTA");
    // Progress: where current price is between entry and target
    const lo = Math.min(idea.entry, idea.target, idea.stop);
    const hi = Math.max(idea.entry, idea.target, idea.stop);
    const pctEntry  = ((idea.entry  - lo) / (hi - lo) * 100).toFixed(1);
    const pctTarget = ((idea.target - lo) / (hi - lo) * 100).toFixed(1);
    const pctStop   = ((idea.stop   - lo) / (hi - lo) * 100).toFixed(1);
    const pctCur    = Math.max(0, Math.min(100, ((curPrice - lo) / (hi - lo) * 100))).toFixed(1);
    const daysPub   = Math.floor((new Date() - new Date(idea.published)) / 86400000);

    return (
      <div onClick={() => setSelIdea(idea)}
        style={{background:"linear-gradient(145deg,rgba(10,14,26,0.98),rgba(15,22,40,0.96))",border:`1px solid ${sc}25`,borderRadius:18,overflow:"hidden",cursor:"pointer",transition:"all 0.22s",position:"relative",boxShadow:`0 4px 24px rgba(0,0,0,0.35)`}}
        onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 16px 40px rgba(0,0,0,0.45),0 0 0 1px ${sc}40`; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)";   e.currentTarget.style.boxShadow=`0 4px 24px rgba(0,0,0,0.35)`; }}>
        {/* Top accent bar */}
        <div style={{height:3,background:`linear-gradient(90deg,${sc},${sc}30)`}}/>
        <div style={{padding:"14px 16px"}}>
          {/* Row 1: icon + ticker + signal badge */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${sc}18`,border:`1px solid ${sc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{idea.icon}</div>
              <div>
                <div style={{fontFamily:"monospace",fontWeight:900,fontSize:15,color:sc,letterSpacing:-0.5}}>{idea.ticker}</div>
                <div style={{fontSize:10,color:"#475569",fontWeight:600,maxWidth:130,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{idea.name}</div>
              </div>
            </div>
            <div style={{background:SIGNAL_BG[idea.signal],border:`1px solid ${sc}40`,borderRadius:20,padding:"4px 10px",display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:11,fontWeight:900,color:sc}}>{SIGNAL_ICON[idea.signal]} {idea.signal}</span>
            </div>
          </div>

          {/* Row 2: Current price + change */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
            <div>
              <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:0.6,marginBottom:2}}>PRECIO ACTUAL</div>
              <div style={{fontSize:20,fontWeight:900,color:"#F1F5F9",letterSpacing:-0.5}}>
                ${curPrice.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
              </div>
              <div style={{fontSize:11,fontWeight:700,color:isPos?"#10B981":"#EF4444"}}>
                {isPos?"â²":"â¼"} {Math.abs(change).toFixed(2)}% hoy
              </div>
            </div>
            {/* Upside circle */}
            <div style={{textAlign:"center"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:`conic-gradient(${sc} ${Math.min(Math.abs(upside),100)*3.6}deg,rgba(255,255,255,0.04) 0deg)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(10,14,26,0.97)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:12,fontWeight:900,color:upsidePos?sc:"#EF4444",lineHeight:1}}>{upsidePos?"+":"-"}{upsideAbs}%</div>
                </div>
              </div>
              <div style={{fontSize:8,color:"#334155",fontWeight:700,letterSpacing:0.5,marginTop:2}}>UPSIDE</div>
            </div>
          </div>

          {/* Price track */}
          <div style={{position:"relative",height:6,background:"rgba(255,255,255,0.05)",borderRadius:4,marginBottom:6}}>
            {/* Stop */}
            <div style={{position:"absolute",left:`${pctStop}%`,top:-2,width:2,height:10,background:"#EF4444",borderRadius:2}}/>
            {/* Entry */}
            <div style={{position:"absolute",left:`${pctEntry}%`,top:-2,width:2,height:10,background:"#F59E0B",borderRadius:2}}/>
            {/* Target */}
            <div style={{position:"absolute",left:`${Math.min(parseFloat(pctTarget),98)}%`,top:-2,width:2,height:10,background:sc,borderRadius:2}}/>
            {/* Current position dot */}
            <div style={{position:"absolute",left:`${pctCur}%`,top:-3,width:12,height:12,borderRadius:"50%",background:sc,boxShadow:`0 0 6px ${sc}`,transform:"translateX(-6px)",border:"2px solid rgba(10,14,26,0.9)"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <div style={{fontSize:9,color:"#EF4444"}}>Stop ${idea.stop}</div>
            <div style={{fontSize:9,color:"#F59E0B"}}>Entrada ${idea.entry}</div>
            <div style={{fontSize:9,color:sc}}>Obj. ${idea.target}</div>
          </div>

          {/* Tags row */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {idea.tags.slice(0,3).map(tag=>(
              <span key={tag} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:5,padding:"2px 7px",fontSize:9,color:"#64748B",fontWeight:700}}>{tag}</span>
            ))}
          </div>

          {/* Bottom row: horizon + risk + days */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:8}}>
            <div style={{display:"flex",gap:6}}>
              <span style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:5,padding:"2px 7px",fontSize:9,color:"#818CF8",fontWeight:700}}>â± {idea.horizon}</span>
              <span style={{background:`rgba(${RISK_COLOR[idea.riskN]==="#10B981"?"16,185,129":RISK_COLOR[idea.riskN]==="#F59E0B"?"245,158,11":"239,68,68"},0.1)`,borderRadius:5,padding:"2px 7px",fontSize:9,color:RISK_COLOR[idea.riskN],fontWeight:700}}>
                â¡ Riesgo {RISK_LABEL[idea.riskN]}
              </span>
            </div>
            <span style={{fontSize:9,color:"#334155"}}>{daysPub === 0 ? "Hoy" : `Hace ${daysPub}d`}</span>
          </div>
        </div>
      </div>
    );
  };

  // ââ MODAL DETAIL ââ
  const ModalDetail = ({ idea, onClose }) => {
    if (!idea) return null;
    const live     = livePx[idea.ticker];
    const curPrice = live?.price || idea.entry;
    const change   = live?.change || 0;
    const isPos    = change >= 0;
    const sc       = SIGNAL_COLOR[idea.signal];
    const upside   = ((idea.target - curPrice) / curPrice * 100);
    const rr       = Math.abs(idea.target - idea.entry) / Math.abs(idea.entry - idea.stop);

    return (
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div onClick={e=>e.stopPropagation()}
          style={{background:"linear-gradient(145deg,rgba(10,14,26,0.99),rgba(15,22,40,0.97))",border:`1px solid ${sc}30`,borderRadius:22,padding:0,maxWidth:580,width:"100%",maxHeight:"90vh",overflow:"auto",boxShadow:`0 32px 80px rgba(0,0,0,0.7),0 0 0 1px ${sc}20`}}>
          {/* Top bar */}
          <div style={{height:4,background:`linear-gradient(90deg,${sc},${sc}40,transparent)`}}/>
          <div style={{padding:"20px 24px"}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:52,height:52,borderRadius:14,background:`${sc}18`,border:`1px solid ${sc}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{idea.icon}</div>
                <div>
                  <div style={{fontFamily:"monospace",fontWeight:900,fontSize:22,color:sc}}>{idea.ticker}</div>
                  <div style={{fontSize:13,color:"#64748B",fontWeight:600}}>{idea.name}</div>
                  <div style={{fontSize:11,color:"#334155"}}>{idea.sector}</div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                <div style={{background:SIGNAL_BG[idea.signal],border:`1px solid ${sc}40`,borderRadius:20,padding:"5px 14px"}}>
                  <span style={{fontSize:13,fontWeight:900,color:sc}}>{SIGNAL_ICON[idea.signal]} {idea.signal}</span>
                </div>
                <button onClick={onClose} style={{background:"transparent",border:"none",color:"#475569",cursor:"pointer",fontSize:18,padding:"2px 6px"}}>â</button>
              </div>
            </div>

            {/* Price stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
              {[
                {l:"PRECIO ACTUAL", v:`$${curPrice.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`, sub:`${isPos?"â²":"â¼"} ${Math.abs(change).toFixed(2)}% hoy`, sc2:isPos?"#10B981":"#EF4444"},
                {l:"PRECIO OBJETIVO", v:`$${idea.target}`, sub:`${upside >= 0?"+":""}${upside.toFixed(1)}% upside`, sc2:upside>=0?"#10B981":"#EF4444"},
                {l:"STOP LOSS", v:`$${idea.stop}`, sub:`R:R ${rr.toFixed(1)}:1`, sc2:"#EF4444"},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 14px"}}>
                  <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:0.6,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:18,fontWeight:900,color:"#F1F5F9",marginBottom:2}}>{s.v}</div>
                  <div style={{fontSize:11,fontWeight:700,color:s.sc2}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* More metadata */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:18}}>
              {[
                {l:"ENTRADA SUGERIDA", v:`$${idea.entry}`},
                {l:"HORIZONTE", v:idea.horizon},
                {l:"RIESGO", v:RISK_LABEL[idea.riskN], c:RISK_COLOR[idea.riskN]},
              ].map(s=>(
                <div key={s.l} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#334155",fontWeight:700,letterSpacing:0.6,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:14,fontWeight:800,color:s.c||"#F1F5F9"}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {idea.tags.map(tag=>(
                <span key={tag} style={{background:`${sc}15`,border:`1px solid ${sc}30`,borderRadius:6,padding:"4px 10px",fontSize:11,color:sc,fontWeight:700}}>{tag}</span>
              ))}
            </div>

            {/* Thesis */}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"16px 18px",marginBottom:14}}>
              <div style={{fontSize:11,color:"#475569",fontWeight:700,letterSpacing:0.5,marginBottom:8}}>ð TESIS DE INVERSIÃN</div>
              <div style={{fontSize:13,color:"#CBD5E1",lineHeight:1.75}}>{idea.thesis}</div>
            </div>

            {/* Footer */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,color:"#334155"}}>
              <span>Publicado: {new Date(idea.published).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric"})}</span>
              <span>{idea.analyst}</span>
              <span style={{color:"#1E293B",fontSize:10}}>â ï¸ No es consejo financiero</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{maxWidth:1100,margin:"0 auto"}}>
      {/* ââ HEADER ââ */}
      <div style={{background:"linear-gradient(135deg,rgba(10,14,26,0.98),rgba(20,26,46,0.95))",border:"1px solid rgba(99,102,241,0.2)",borderRadius:20,padding:"18px 24px",marginBottom:16,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,background:"radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style={{fontSize:28}}>ð¡</span>
          <div>
            <div style={{fontSize:19,fontWeight:900,color:"#F1F5F9",letterSpacing:-0.5}}>Ideas de InversiÃ³n</div>
            <div style={{fontSize:12,color:"#475569"}}>SeÃ±ales analizadas por NexoTrade Research Â· Precios en tiempo real Â· {IDEAS_DATA.length} ideas activas</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{l:`${compras} Compras`,c:"#10B981",bg:"rgba(16,185,129,0.1)"},{l:`${ventas} Ventas`,c:"#EF4444",bg:"rgba(239,68,68,0.1)"},{l:`${neutros} Neutro`,c:"#F59E0B",bg:"rgba(245,158,11,0.1)"}].map(s=>(
              <div key={s.l} style={{background:s.bg,border:`1px solid ${s.c}30`,borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:800,color:s.c}}>{s.l}</div>
            ))}
            {loading && <div style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",borderRadius:20,padding:"5px 12px",fontSize:11,fontWeight:700,color:"#818CF8"}}>â³ Cargando preciosâ¦</div>}
          </div>
        </div>
      </div>

      {/* ââ FILTERS ââ */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
        {/* Signal filter */}
        <div style={{display:"flex",gap:4}}>
          {[["todos","ð Todos"],["compra","â Compras"],["venta","â Ventas"],["neutro","â Neutro"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setFilter(k);setPage(1);}}
              style={{background:filter===k?"linear-gradient(135deg,#6366F1,#4F46E5)":"transparent",border:`1.5px solid ${filter===k?"transparent":C.border}`,borderRadius:20,padding:"6px 13px",fontSize:11,fontWeight:700,color:filter===k?"#fff":C.muted,cursor:"pointer",transition:"all 0.15s"}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{width:1,height:24,background:C.border}}/>
        {/* Risk filter */}
        {[["todos","â¡ Todo riesgo"],["1","ð¢ Bajo"],["2","ð¡ Medio"],["3","ð´ Alto"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setRiskF(k);setPage(1);}}
            style={{background:riskF===k?"rgba(99,102,241,0.2)":"transparent",border:`1.5px solid ${riskF===k?"#6366F1":C.border}`,borderRadius:20,padding:"6px 12px",fontSize:11,fontWeight:700,color:riskF===k?"#A5B4FC":C.muted,cursor:"pointer",transition:"all 0.15s"}}>
            {l}
          </button>
        ))}
        {/* Sort */}
        <div style={{marginLeft:"auto"}}>
          <select value={sortBy} onChange={e=>{setSortBy(e.target.value);setPage(1);}}
            style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:10,padding:"6px 12px",fontSize:12,color:C.muted,cursor:"pointer"}}>
            <option value="fecha">MÃ¡s recientes</option>
            <option value="upside">Mayor upside</option>
            <option value="seÃ±al">Por seÃ±al</option>
          </select>
        </div>
      </div>

      {/* ââ IDEA CARDS GRID ââ */}
      <div style={{position:"relative"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:14,marginBottom:20}}>
          {paged.map((idea, idx) => {
            const isLocked = !isPremium && idx >= 3;
            return (
              <div key={idea.id} style={{position:"relative",userSelect:isLocked?"none":"auto"}}>
                <div style={{filter:isLocked?"blur(6px)":"none",pointerEvents:isLocked?"none":"auto",transition:"filter 0.2s"}}>
                  <IdeaCard idea={idea}/>
                </div>
                {isLocked && idx === 3 && (
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(10,14,26,0.3)",borderRadius:18,backdropFilter:"blur(2px)",zIndex:2}}>
                    <div style={{background:"rgba(12,10,30,0.97)",border:"1px solid rgba(124,58,237,0.4)",borderRadius:16,padding:"20px 24px",textAlign:"center",maxWidth:240,boxShadow:"0 8px 40px rgba(0,0,0,0.6)"}}>
                      <div style={{fontSize:28,marginBottom:8}}>ð</div>
                      <div style={{fontWeight:800,color:"#fff",fontSize:14,marginBottom:6}}>+{filtered.length - 3} ideas bloqueadas</div>
                      <div style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>Hazte VIP para ver todas las seÃ±ales, tesis y precios objetivo</div>
                      <button onClick={onNeedPremium}
                        style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",color:"#fff",border:"none",borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:800,cursor:"pointer",width:"100%"}}>
                        â¦ Ver todas â $9.99/mes
                      </button>
                      <div style={{fontSize:10,color:"#475569",marginTop:6}}>7 dÃ­as gratis Â· Cancela cuando quieras</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Banner debajo si hay mÃ¡s pÃ¡ginas y es free */}
        {!isPremium && page === 1 && (
          <div style={{background:"linear-gradient(135deg,rgba(124,58,237,0.12),rgba(99,102,241,0.08))",border:"1px solid rgba(124,58,237,0.25)",borderRadius:16,padding:"20px 24px",marginTop:4,marginBottom:20,textAlign:"center"}}>
            <div style={{fontWeight:800,color:"#A78BFA",fontSize:15,marginBottom:6}}>â¦ Desbloquea {IDEAS_DATA.length - 3} ideas mÃ¡s con VIP</div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:14}}>SeÃ±ales de compra/venta, tesis completa, precio objetivo y stop loss actualizado en tiempo real</div>
            <button onClick={onNeedPremium}
              style={{background:"linear-gradient(135deg,#7C3AED,#6366F1)",color:"#fff",border:"none",borderRadius:10,padding:"12px 32px",fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 20px rgba(124,58,237,0.4)"}}>
              â¦ Activar VIP â 7 dÃ­as gratis â
            </button>
          </div>
        )}
      </div>
      {filtered.length === 0 && (
        <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>No hay ideas con esos filtros</div>
      )}

      {/* ââ PAGINATION ââ */}
      {totalPages > 1 && (
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {Array.from({length:totalPages},(_,i)=>i+1).map(n=>(
            <button key={n} onClick={()=>setPage(n)}
              style={{width:34,height:34,borderRadius:8,border:`1.5px solid ${page===n?"#6366F1":C.border}`,background:page===n?"linear-gradient(135deg,#6366F1,#4F46E5)":"transparent",color:page===n?"#fff":C.muted,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              {n}
            </button>
          ))}
        </div>
      )}

      <div style={{textAlign:"center",padding:"8px 0 16px",fontSize:10,color:"#1E293B"}}>
        â ï¸ Las ideas son anÃ¡lisis informativos del equipo NexoTrade. No constituyen consejo financiero. Invierte con responsabilidad.
      </div>

      {/* Modal */}
      {selIdea && <ModalDetail idea={selIdea} onClose={()=>setSelIdea(null)}/>}
    </div>
  );
}

// ââ MENSAJES PRIVADOS PAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââ
function MessagesPage({ user, following, supabaseClient, onNeedAuth, initialChat }) {
  const [conversations, setConversations] = useState([]);  // {userId, username, avatar, avatarColor, lastMsg, unread, isMutual}
  const [selConv, setSelConv]   = useState(initialChat || null); // {id, username, avatar, avatarColor}
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText]   = useState("");
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [mutuals, setMutuals]   = useState([]); // IDs de seguidores mutuos
  const [search, setSearch]     = useState("");
  const [newDM, setNewDM]       = useState(false);
  const [allFollowers, setAllFollowers] = useState([]);
  const msgEndRef = useRef(null);

  const FINNHUB_KEY = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0";
  const sb = supabaseClient || supabase;

  // Cargar seguidores mutuos y conversaciones
  useEffect(() => {
    if (!user?.id || user.id === "local") { setLoading(false); return; }
    const init = async () => {
      try {
        // QuiÃ©n me sigue a mÃ­
        const { data: followers } = await sb.from("follows")
          .select("follower_id").eq("following_id", user.id);
        const followerIds = (followers||[]).map(f => f.follower_id);

        // A quiÃ©n sigo yo
        const { data: iFollow } = await sb.from("follows")
          .select("following_id").eq("follower_id", user.id);
        const iFollowIds = (iFollow||[]).map(f => f.following_id);

        // Mutuos = los que me siguen Y yo sigo
        const mutualIds = followerIds.filter(id => iFollowIds.includes(id));
        setMutuals(mutualIds);

        // Obtener perfiles de mutuos
        if (mutualIds.length > 0) {
          const { data: profiles } = await sb.from("profiles")
            .select("id,username,avatar_emoji,avatar_color")
            .in("id", mutualIds);
          setAllFollowers(profiles || []);
        }

        // Cargar mensajes existentes
        const { data: msgs } = await sb.from("direct_messages")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(100);

        if (msgs && msgs.length > 0) {
          // Agrupar por conversaciÃ³n
          const convMap = {};
          msgs.forEach(m => {
            const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
            if (!convMap[otherId]) convMap[otherId] = [];
            convMap[otherId].push(m);
          });
          // Construir lista de conversaciones
          const convList = Object.entries(convMap).map(([uid, ms]) => {
            const last = ms[0];
            return { userId: uid, lastMsg: last.content, lastTime: last.created_at, isMutual: mutualIds.includes(uid) };
          });
          setConversations(convList);
        }
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    init();
  }, [user?.id]);

  // Cargar mensajes de la conversaciÃ³n seleccionada
  useEffect(() => {
    if (!selConv || !user?.id) return;
    const load = async () => {
      try {
        const { data } = await sb.from("direct_messages")
          .select("*")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selConv.id}),and(sender_id.eq.${selConv.id},receiver_id.eq.${user.id})`)
          .order("created_at", { ascending: true })
          .limit(100);
        setMessages(data || []);
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } catch(e) {}
    };
    load();
    // Poll cada 5s
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [selConv?.id, user?.id]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isMutualWith = (uid) => mutuals.includes(uid);

  const sendMessage = async () => {
    if (!msgText.trim() || sending || !selConv || !user?.id) return;
    if (!isMutualWith(selConv.id)) return;
    setSending(true);
    try {
      const { data, error } = await sb.from("direct_messages").insert({
        sender_id: user.id,
        receiver_id: selConv.id,
        content: msgText.trim(),
      }).select().single();
      if (!error && data) {
        setMessages(prev => [...prev, data]);
        setMsgText("");
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
    } catch(e) {}
    setSending(false);
  };

  if (!user || user.id === "local") {
    return (
      <div style={{maxWidth:480,margin:"80px auto",textAlign:"center",padding:"0 20px"}}>
        <div style={{fontSize:64,marginBottom:16}}>ð¬</div>
        <div style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:8}}>Mensajes Privados</div>
        <div style={{fontSize:14,color:C.muted,marginBottom:24}}>Inicia sesiÃ³n para ver y enviar mensajes privados.</div>
        <button onClick={onNeedAuth} style={{background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"#fff",border:"none",borderRadius:12,padding:"12px 32px",fontSize:15,fontWeight:800,cursor:"pointer"}}>
          Iniciar sesiÃ³n
        </button>
      </div>
    );
  }

  const filteredMutualsForNew = allFollowers.filter(p =>
    !search || p.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="nexo-messages-wrapper" style={{maxWidth:920,margin:"0 auto",height:"calc(100vh - 130px)",display:"flex",flexDirection:"column",gap:0}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,rgba(139,92,246,0.15),rgba(109,40,217,0.08))",border:"1px solid rgba(139,92,246,0.25)",borderRadius:"18px 18px 0 0",padding:"14px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:"none"}}>
        <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>ð¬</div>
        <div>
          <div style={{fontSize:16,fontWeight:900,color:C.text,letterSpacing:"-0.3px"}}>Mensajes Privados</div>
          <div style={{fontSize:11,color:C.muted,marginTop:1}}>
            {mutuals.length > 0
              ? <span><span style={{color:"#10B981",fontWeight:700}}>{mutuals.length}</span> conexiÃ³n{mutuals.length!==1?"es":""} mutua{mutuals.length!==1?"s":""}</span>
              : "Solo entre usuarios que se siguen mutuamente"}
          </div>
        </div>
        <button onClick={()=>{setNewDM(true);setSelConv(null);}}
          style={{marginLeft:"auto",background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",border:"none",borderRadius:20,padding:"8px 18px",fontSize:12,fontWeight:800,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6,boxShadow:"0 2px 12px rgba(139,92,246,0.35)",whiteSpace:"nowrap"}}>
          âï¸ <span className="nexo-msg-btn-text">Nuevo mensaje</span>
        </button>
      </div>

      <div className="nexo-messages-grid" style={{display:"grid",gridTemplateColumns:"300px 1fr",flex:1,minHeight:0,border:`1px solid rgba(139,92,246,0.2)`,borderRadius:"0 0 18px 18px",overflow:"hidden"}}>
        {/* ââ LISTA DE CONVERSACIONES ââ */}
        <div className="nexo-messages-list" style={{background:C.card,borderRight:`1px solid rgba(139,92,246,0.15)`,overflow:"auto",display:"flex",flexDirection:"column"}}>
          {/* Search */}
          <div style={{padding:"10px 12px",borderBottom:`1px solid rgba(139,92,246,0.1)`,background:"rgba(139,92,246,0.04)"}}>
            <div style={{position:"relative"}}>
              <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",opacity:0.4}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar conversaciÃ³nâ¦"
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid rgba(139,92,246,0.2)`,borderRadius:20,padding:"7px 10px 7px 28px",fontSize:12,color:C.text,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
          </div>

          {loading && (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,padding:24,color:C.muted}}>
              <div style={{width:28,height:28,borderRadius:"50%",border:"2px solid rgba(139,92,246,0.3)",borderTopColor:"#8B5CF6",animation:"spin 1s linear infinite"}}/>
              <span style={{fontSize:12}}>Cargandoâ¦</span>
            </div>
          )}

          {!loading && mutuals.length === 0 && (
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px 16px",textAlign:"center"}}>
              <div style={{width:52,height:52,borderRadius:16,background:"rgba(139,92,246,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:12}}>ð¥</div>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>Sin conexiones aÃºn</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>Sigue a alguien y espera que te siga de vuelta para poder chatear.</div>
            </div>
          )}

          {/* Mutuales disponibles para chatear */}
          <div style={{overflowY:"auto",flex:1}}>
            {allFollowers.filter(p => !search || p.username?.toLowerCase().includes(search.toLowerCase())).map(prof => {
              const conv = conversations.find(c => c.userId === prof.id);
              const isSelected = selConv?.id === prof.id;
              return (
                <div key={prof.id} onClick={()=>{setSelConv({id:prof.id,username:prof.username,avatar:prof.avatar_emoji||"ð¤",avatarColor:prof.avatar_color||C.accent});setNewDM(false);}}
                  style={{display:"flex",gap:10,alignItems:"center",padding:"11px 14px",cursor:"pointer",background:isSelected?"rgba(139,92,246,0.13)":"transparent",borderLeft:`3px solid ${isSelected?"#8B5CF6":"transparent"}`,transition:"all 0.15s",position:"relative"}}
                  onMouseEnter={e=>{ if(!isSelected){e.currentTarget.style.background="rgba(255,255,255,0.04)";} }}
                  onMouseLeave={e=>{ if(!isSelected){e.currentTarget.style.background="transparent";} }}>
                  {/* Avatar */}
                  <div style={{width:40,height:40,borderRadius:"50%",background:prof.avatar_color||C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0,border:isSelected?"2px solid rgba(139,92,246,0.5)":"2px solid transparent",transition:"border 0.15s"}}>
                    {prof.avatar_emoji||"ð¤"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,color:isSelected?"#A78BFA":C.text,fontSize:13,marginBottom:2}}>{prof.username}</div>
                    <div style={{fontSize:11,color:C.muted2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv?.lastMsg || <span style={{color:"rgba(139,92,246,0.6)",fontStyle:"italic"}}>Iniciar conversaciÃ³nâ¦</span>}</div>
                  </div>
                  {/* Online dot (decorativo) */}
                  <div style={{width:8,height:8,borderRadius:"50%",background:"#10B981",flexShrink:0,opacity:0.7}}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* ââ PANEL DE CHAT ââ */}
        <div className="nexo-messages-chat" style={{background:C.bg||"#0a0e1a",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* ââ NUEVO MENSAJE UI ââ */}
          {newDM && !selConv && (
            <div style={{flex:1,overflow:"auto",padding:"20px 24px"}}>
              <div style={{fontWeight:900,color:C.text,fontSize:16,marginBottom:4,letterSpacing:"-0.3px"}}>âï¸ Nuevo mensaje</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Solo puedes escribir a usuarios que tambiÃ©n te siguen a ti.</div>
              {filteredMutualsForNew.length === 0 && (
                <div style={{textAlign:"center",padding:"32px 24px",background:"rgba(139,92,246,0.04)",borderRadius:16,border:"1px dashed rgba(139,92,246,0.2)"}}>
                  <div style={{fontSize:36,marginBottom:10}}>ð</div>
                  <div style={{fontWeight:700,color:C.text,fontSize:14,marginBottom:6}}>Sin conexiones mutuas</div>
                  <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>Sigue a alguien y espera que te sigan de vuelta para poder chatear.</div>
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {filteredMutualsForNew.map(prof => (
                  <div key={prof.id} onClick={()=>{setSelConv({id:prof.id,username:prof.username,avatar:prof.avatar_emoji||"ð¤",avatarColor:prof.avatar_color||C.accent});setNewDM(false);}}
                    style={{display:"flex",gap:12,alignItems:"center",padding:"12px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(139,92,246,0.15)",borderRadius:14,cursor:"pointer",transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(139,92,246,0.08)";e.currentTarget.style.borderColor="rgba(139,92,246,0.3)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.borderColor="rgba(139,92,246,0.15)";}}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:prof.avatar_color||C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{prof.avatar_emoji||"ð¤"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,color:C.text,fontSize:14}}>{prof.username}</div>
                      <div style={{fontSize:11,color:"#10B981",marginTop:2}}>â Seguidor mutuo â Puedes enviarle mensajes</div>
                    </div>
                    <div style={{color:"#8B5CF6",fontSize:18,opacity:0.8}}>â</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ââ CHAT ABIERTO ââ */}
          {selConv && (
            <>
              {/* Chat header */}
              <div style={{padding:"12px 18px",borderBottom:"1px solid rgba(139,92,246,0.15)",display:"flex",alignItems:"center",gap:12,background:"rgba(139,92,246,0.05)"}}>
                <div style={{position:"relative"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:selConv.avatarColor||C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19}}>{selConv.avatar||"ð¤"}</div>
                  <div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",background:"#10B981",border:"2px solid #0a0e1a"}}/>
                </div>
                <div>
                  <div style={{fontWeight:800,color:C.text,fontSize:14,letterSpacing:"-0.2px"}}>@{selConv.username}</div>
                  <div style={{fontSize:10,color:"#10B981",marginTop:1}}>â En lÃ­nea Â· Chat privado cifrado</div>
                </div>
                <button onClick={()=>setSelConv(null)} style={{marginLeft:"auto",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:C.muted,cursor:"pointer",fontSize:14,padding:"4px 8px",lineHeight:1}}>â</button>
              </div>

              {/* Check mutual */}
              {!isMutualWith(selConv.id) && (
                <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,padding:24}}>
                  <div style={{fontSize:48}}>ð</div>
                  <div style={{fontWeight:800,color:C.text,fontSize:16,textAlign:"center"}}>Chat bloqueado</div>
                  <div style={{fontSize:13,color:C.muted,textAlign:"center",maxWidth:320,lineHeight:1.7}}>
                    Para chatear con <strong>{selConv.username}</strong>, ambos tienen que seguirse mutuamente. Sigue al usuario y espera que te siga de vuelta.
                  </div>
                </div>
              )}

              {/* Messages area */}
              {isMutualWith(selConv.id) && (
                <>
                  <div style={{flex:1,overflow:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:8}}>
                    {messages.length === 0 && (
                      <div style={{textAlign:"center",color:C.muted,padding:"40px 0",fontSize:13}}>
                        <div style={{fontSize:36,marginBottom:8}}>ð</div>
                        SÃ© el primero en escribir. Esta conversaciÃ³n es privada.
                      </div>
                    )}
                    {messages.map((m,i) => {
                      const isMine = m.sender_id === user.id;
                      const time = new Date(m.created_at).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
                      return (
                        <div key={m.id||i} style={{display:"flex",justifyContent:isMine?"flex-end":"flex-start"}}>
                          <div style={{maxWidth:"72%",background:isMine?"linear-gradient(135deg,#8B5CF6,#6D28D9)":"rgba(255,255,255,0.06)",borderRadius:isMine?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"8px 13px",border:isMine?"none":`1px solid ${C.border}`}}>
                            <div style={{fontSize:13,color:isMine?"#fff":C.text,lineHeight:1.5,wordBreak:"break-word"}}>{m.content}</div>
                            <div style={{fontSize:10,color:isMine?"rgba(255,255,255,0.5)":C.muted2,marginTop:3,textAlign:"right"}}>{time}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={msgEndRef}/>
                  </div>

                  {/* Input */}
                  <div style={{padding:"10px 14px",borderTop:"1px solid rgba(139,92,246,0.15)",display:"flex",gap:8,alignItems:"center",background:"rgba(139,92,246,0.03)"}}>
                    <input value={msgText} onChange={e=>setMsgText(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                      placeholder={`Escribe a @${selConv.username}â¦`}
                      maxLength={500}
                      style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:22,padding:"10px 18px",fontSize:13,color:C.text,outline:"none",fontFamily:"inherit",transition:"border 0.15s"}}
                      onFocus={e=>e.target.style.borderColor="rgba(139,92,246,0.5)"}
                      onBlur={e=>e.target.style.borderColor="rgba(139,92,246,0.2)"}
                    />
                    <button onClick={sendMessage} disabled={!msgText.trim()||sending}
                      style={{background:msgText.trim()&&!sending?"linear-gradient(135deg,#8B5CF6,#6D28D9)":"rgba(139,92,246,0.2)",border:"none",borderRadius:22,padding:"10px 18px",fontSize:13,fontWeight:800,color:msgText.trim()&&!sending?"#fff":"rgba(139,92,246,0.5)",cursor:msgText.trim()&&!sending?"pointer":"not-allowed",whiteSpace:"nowrap",transition:"all 0.2s",boxShadow:msgText.trim()&&!sending?"0 2px 12px rgba(139,92,246,0.35)":"none"}}>
                      {sending?"â¦":"Enviar â"}
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Estado vacÃ­o */}
          {!selConv && !newDM && (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,padding:"0 20px"}}>
              {/* IlustraciÃ³n */}
              <div style={{position:"relative",marginBottom:4}}>
                <div style={{width:72,height:72,borderRadius:22,background:"linear-gradient(135deg,rgba(139,92,246,0.15),rgba(109,40,217,0.08))",border:"1px solid rgba(139,92,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34}}>ð¬</div>
                <div style={{position:"absolute",top:-6,right:-6,width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:800,boxShadow:"0 2px 8px rgba(139,92,246,0.5)"}}>
                  {mutuals.length}
                </div>
              </div>
              <div>
                <div style={{fontWeight:900,color:C.text,fontSize:17,textAlign:"center",letterSpacing:"-0.4px",marginBottom:6}}>Tus mensajes privados</div>
                <div style={{fontSize:13,color:C.muted,textAlign:"center",maxWidth:260,lineHeight:1.7}}>
                  Selecciona una conversaciÃ³n o empieza una nueva. Solo con seguidores mutuos.
                </div>
              </div>
              <button onClick={()=>setNewDM(true)}
                style={{background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",border:"none",borderRadius:14,padding:"11px 28px",fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer",boxShadow:"0 4px 16px rgba(139,92,246,0.4)",transition:"transform 0.15s,box-shadow 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(139,92,246,0.5)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 16px rgba(139,92,246,0.4)";}}>
                âï¸ Nuevo mensaje
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

const NAV_ITEMS = (t, isEN=false) => [
  {label:t.feed,idx:0},{label:t.tops,idx:1},
  {label:t.acciones,idx:3},
  {label:t.noticias,idx:5},{label:t.earnings,idx:6},{label:t.trending,idx:7},
  {label:"ð Webinars",idx:11},
  {label:isEN?"ð Academy":"ð Academia",idx:12},
  {label:isEN?"ð¬ Messages":"ð¬ Mensajes",idx:22},
  {label:isEN?"ð¡ VIP Ideas":"ð¡ Ideas VIP",idx:21,vip:true},
  {label:isEN?"ðï¸ Top Investors":"ðï¸ Super Inversores",idx:19,vip:true},
  {label:isEN?"ð Congress Trades":"ð Trades Congreso",idx:35,vip:true},
  {label:isEN?"ð¬ Advanced Screener":"ð¬ Screener Avanzado",idx:36,vip:true},
  {label:isEN?"ð VIP Flow":"ð Flujo VIP",idx:20,vip:true},
  {label:isEN?"ð ï¸ Tools":"ð ï¸ Herramientas",idx:9,vip:true},
  {label:"â¦ Premium",idx:8,premium:true},
];

// ââ CONGRESS TRADES PAGE âââââââââââââââââââââââââââââââââââââââââââââââââââââ
function CongressTradesPage({ isPremium, onNeedPremium, lang }) {
  const isEN = lang === "en";
  const [trades, setTrades]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all"); // all | buy | sell
  const [party, setParty]     = useState("all"); // all | D | R
  const [search, setSearch]   = useState("");
  const [source, setSource]   = useState("");

  useEffect(() => {
    fetch("/api/congress")
      .then(r => r.json())
      .then(d => { setTrades(d.trades || []); setSource(d.source || ""); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!isPremium) return (
    <div style={{maxWidth:700,margin:"60px auto",textAlign:"center",padding:"0 20px"}}>
      <div style={{fontSize:56,marginBottom:12}}>ðï¸</div>
      <h2 style={{color:C.text,fontWeight:800,fontSize:22,marginBottom:8}}>{isEN?"Congress Trades":"Trades del Congreso"}</h2>
      <p style={{color:C.muted,fontSize:15,marginBottom:24,lineHeight:1.6}}>
        {isEN
          ? "See what US Congress members are buying and selling in real time. VIP exclusive."
          : "Mira quÃ© estÃ¡n comprando y vendiendo los congresistas de EE.UU. en tiempo real. Exclusivo VIP."}
      </p>
      <button onClick={onNeedPremium} style={{background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"#fff",border:"none",borderRadius:12,padding:"14px 36px",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 4px 20px rgba(245,158,11,0.4)"}}>
        â¦ {isEN?"Unlock VIP":"Desbloquear VIP"}
      </button>
    </div>
  );

  const partyColor = p => p === "D" ? "#3B82F6" : p === "R" ? "#EF4444" : "#94A3B8";
  const typeColor  = t => t === "buy" ? "#10B981" : "#EF4444";
  const typeIcon   = t => t === "buy" ? "â" : "â";

  const filtered = trades.filter(t => {
    if (filter !== "all" && t.type !== filter) return false;
    if (party !== "all" && t.party !== party) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
        !t.ticker.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    buys:  trades.filter(t=>t.type==="buy").length,
    sells: trades.filter(t=>t.type==="sell").length,
    dems:  [...new Set(trades.filter(t=>t.party==="D").map(t=>t.name))].length,
    reps:  [...new Set(trades.filter(t=>t.party==="R").map(t=>t.name))].length,
  };

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"0 4px 60px"}}>
      {/* Header */}
      <div style={{marginBottom:24}}>
        <h1 style={{color:C.text,fontWeight:900,fontSize:22,margin:"0 0 4px",display:"flex",alignItems:"center",gap:8}}>
          ðï¸ {isEN?"Congress Trades":"Trades del Congreso"}
          <span style={{background:"linear-gradient(135deg,#f59e0b,#ef4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:12,fontWeight:800}}>VIP</span>
        </h1>
        <p style={{color:C.muted,fontSize:13,margin:0}}>
          {isEN
            ? "Real-time stock trades disclosed by U.S. Congress members under the STOCK Act."
            : "Operaciones bursÃ¡tiles divulgadas por congresistas de EE.UU. bajo el STOCK Act."}
          {source==="curated"&&<span style={{color:"#f59e0b",marginLeft:6,fontSize:11}}>â {isEN?"Curated data":"Datos curados"}</span>}
        </p>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[
          {l:isEN?"Total Trades":"Total Ops",v:trades.length,c:C.accent},
          {l:isEN?"Purchases":"Compras",v:stats.buys,c:"#10B981"},
          {l:isEN?"Sales":"Ventas",v:stats.sells,c:"#EF4444"},
          {l:isEN?"Members":"Miembros",v:stats.dems+stats.reps,c:"#A78BFA"},
        ].map(s=>(
          <div key={s.l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16,alignItems:"center"}}>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={isEN?"Search name or tickerâ¦":"Buscar nombre o tickerâ¦"}
          style={{flex:"1 1 160px",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}
        />
        {/* Type filter */}
        {["all","buy","sell"].map(v=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${filter===v?typeColor(v===v?v:"all"):C.border}`,background:filter===v?"rgba(0,168,255,0.08)":C.card,color:filter===v?C.accent:C.muted,fontSize:12,fontWeight:filter===v?700:500,cursor:"pointer",transition:"all 0.15s"}}>
            {v==="all"?(isEN?"All":"Todo"):v==="buy"?(isEN?"Buys â":"Compras â"):(isEN?"Sales â":"Ventas â")}
          </button>
        ))}
        {/* Party filter */}
        {["all","D","R"].map(v=>(
          <button key={v} onClick={()=>setParty(v)}
            style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${party===v?partyColor(v):C.border}`,background:party===v?"rgba(0,168,255,0.05)":C.card,color:party===v?partyColor(v):C.muted,fontSize:12,fontWeight:party===v?700:500,cursor:"pointer",transition:"all 0.15s"}}>
            {v==="all"?(isEN?"Both parties":"Ambos"):v==="D"?"ðµ Dem":"ð´ Rep"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow}}>
        {/* Header row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 60px 80px 1fr 90px 70px",gap:0,padding:"10px 16px",background:C.card2,borderBottom:`1px solid ${C.border}`}}>
          {[isEN?"Member":"Miembro","Party","Ticker",isEN?"Asset":"Activo",isEN?"Amount":"Monto",isEN?"Date":"Fecha"].map(h=>(
            <div key={h} style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.5}}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{padding:"40px",textAlign:"center",color:C.muted}}>{isEN?"Loadingâ¦":"Cargandoâ¦"}</div>
        ) : filtered.length === 0 ? (
          <div style={{padding:"40px",textAlign:"center",color:C.muted}}>{isEN?"No results":"Sin resultados"}</div>
        ) : filtered.map((t,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 80px 1fr 90px 70px",gap:0,padding:"11px 16px",borderBottom:`1px solid ${C.border}`,transition:"background 0.1s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(0,168,255,0.03)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            {/* Member */}
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",minWidth:0}}>
              <span style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name}</span>
              <span style={{fontSize:11,color:C.muted}}>{t.house} Â· {t.state}</span>
            </div>
            {/* Party */}
            <div style={{display:"flex",alignItems:"center"}}>
              <span style={{fontSize:11,fontWeight:800,color:partyColor(t.party),background:`${partyColor(t.party)}18`,borderRadius:6,padding:"2px 7px"}}>{t.party}</span>
            </div>
            {/* Ticker */}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:11,fontWeight:800,background:"rgba(0,229,143,0.1)",color:"#00e58f",borderRadius:6,padding:"2px 7px",fontFamily:"monospace"}}>{t.ticker}</span>
              <span style={{fontSize:14,fontWeight:900,color:typeColor(t.type)}}>{typeIcon(t.type)}</span>
            </div>
            {/* Asset name */}
            <div style={{display:"flex",alignItems:"center"}}>
              <span style={{fontSize:12,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.asset}</span>
            </div>
            {/* Amount */}
            <div style={{display:"flex",alignItems:"center"}}>
              <span style={{fontSize:12,color:C.text,fontWeight:600}}>{t.amount}</span>
            </div>
            {/* Date */}
            <div style={{display:"flex",alignItems:"center"}}>
              <span style={{fontSize:11,color:C.muted}}>{t.date?.slice(0,10)}</span>
            </div>
          </div>
        ))}
      </div>

      <p style={{color:C.muted,fontSize:11,marginTop:14,textAlign:"center"}}>
        {isEN
          ? "Data sourced from STOCK Act public disclosures. NexoTrade is not responsible for trade accuracy."
          : "Datos del STOCK Act (divulgaciones pÃºblicas). NexoTrade no se responsabiliza por la exactitud de las operaciones."}
      </p>
    </div>
  );
}

// ââ ADVANCED VIP SCREENER ââââââââââââââââââââââââââââââââââââââââââââââââââââ
const SCREENER_PRESETS = {
  stocks: [
    {s:"NVDA",n:"NVIDIA",p:135.4,chg:+2.1,vol:"58M",mkt:"$3.3T",sector:"Tech",pattern:"Breakout",score:94},
    {s:"MSFT",n:"Microsoft",p:452.7,chg:+0.8,vol:"22M",mkt:"$3.4T",sector:"Tech",pattern:"Trend Up",score:88},
    {s:"META",n:"Meta",p:618.3,chg:+1.5,vol:"18M",mkt:"$1.6T",sector:"Tech",pattern:"Momentum",score:91},
    {s:"AAPL",n:"Apple",p:213.4,chg:-0.4,vol:"55M",mkt:"$3.2T",sector:"Tech",pattern:"Consolidation",score:72},
    {s:"TSLA",n:"Tesla",p:352.8,chg:-1.2,vol:"92M",mkt:"$1.1T",sector:"Auto",pattern:"Volatility",score:65},
    {s:"AMZN",n:"Amazon",p:228.5,chg:+1.1,vol:"31M",mkt:"$2.4T",sector:"Retail",pattern:"Trend Up",score:87},
    {s:"GOOGL",n:"Alphabet",p:196.3,chg:+0.6,vol:"25M",mkt:"$2.4T",sector:"Tech",pattern:"Momentum",score:82},
    {s:"JPM",n:"JPMorgan",p:262.1,chg:+0.3,vol:"8M",mkt:"$752B",sector:"Finance",pattern:"Base",score:75},
    {s:"CRWD",n:"CrowdStrike",p:398.7,chg:+3.2,vol:"4.5M",mkt:"$97B",sector:"Cyber",pattern:"Breakout",score:96},
    {s:"PLTR",n:"Palantir",p:128.3,chg:+4.1,vol:"78M",mkt:"$280B",sector:"AI",pattern:"Momentum",score:93},
    {s:"COIN",n:"Coinbase",p:264.5,chg:+2.8,vol:"12M",mkt:"$66B",sector:"Crypto",pattern:"Breakout",score:89},
    {s:"ARM",n:"ARM Holdings",p:163.8,chg:+1.9,vol:"6.2M",mkt:"$175B",sector:"Chips",pattern:"Trend Up",score:85},
  ],
  options: [
    {s:"NVDA",n:"NVDA Calls",strike:"$140C",exp:"Jun 20",iv:"62%",vol:"28K",oi:"145K",type:"call",chg:+18.4,score:95},
    {s:"TSLA",n:"TSLA Puts",strike:"$320P",exp:"Jun 20",iv:"78%",vol:"22K",oi:"98K",type:"put",chg:+24.1,score:88},
    {s:"SPY",n:"SPY Calls",strike:"$570C",exp:"Jun 20",iv:"14%",vol:"185K",oi:"820K",type:"call",chg:+5.2,score:82},
    {s:"META",n:"META Calls",strike:"$640C",exp:"Jul 18",iv:"44%",vol:"8.4K",oi:"42K",type:"call",chg:+12.8,score:91},
    {s:"AAPL",n:"AAPL Calls",strike:"$220C",exp:"Jun 20",iv:"28%",vol:"32K",oi:"210K",type:"call",chg:+8.3,score:79},
    {s:"QQQ",n:"QQQ Puts",strike:"$470P",exp:"Jun 20",iv:"18%",vol:"62K",oi:"340K",type:"put",chg:+6.1,score:76},
    {s:"AMZN",n:"AMZN Calls",strike:"$235C",exp:"Jul 18",iv:"32%",vol:"11K",oi:"68K",type:"call",chg:+9.7,score:84},
    {s:"PLTR",n:"PLTR Calls",strike:"$135C",exp:"Jun 20",iv:"88%",vol:"44K",oi:"188K",type:"call",chg:+31.2,score:97},
  ],
  intraday: [
    {s:"NVDA",n:"NVIDIA",p:135.4,chg:+2.1,vol:"12.4M",atr:"4.2",rvol:"2.8x",pattern:"Gap Up + Hold",signal:"ð¢ Long",score:95},
    {s:"PLTR",n:"Palantir",p:128.3,chg:+4.1,vol:"18.2M",atr:"5.8",rvol:"3.2x",pattern:"Bull Flag",signal:"ð¢ Long",score:93},
    {s:"COIN",n:"Coinbase",p:264.5,chg:+2.8,vol:"3.4M",atr:"11.2",rvol:"2.1x",pattern:"ORB Breakout",signal:"ð¢ Long",score:89},
    {s:"TSLA",n:"Tesla",p:352.8,chg:-1.2,vol:"24.1M",atr:"14.6",rvol:"1.9x",pattern:"Rejection High",signal:"ð´ Short",score:85},
    {s:"GME",n:"GameStop",p:28.4,chg:+8.7,vol:"42M",atr:"3.1",rvol:"8.4x",pattern:"Gamma Squeeze",signal:"â¡ Momentum",score:91},
    {s:"MSTR",n:"MicroStrategy",p:412.6,chg:+3.9,vol:"5.8M",atr:"28.4",rvol:"2.3x",pattern:"BTC Proxy Pump",signal:"ð¢ Long",score:87},
    {s:"SOFI",n:"SoFi",p:14.8,chg:+5.2,vol:"22M",atr:"0.9",rvol:"4.1x",pattern:"News Catalyst",signal:"â¡ Momentum",score:82},
    {s:"META",n:"Meta",p:618.3,chg:+1.5,vol:"4.2M",atr:"18.2",rvol:"1.4x",pattern:"Trend Continuation",signal:"ð¢ Long",score:79},
  ],
  scalping: [
    {s:"QQQ",n:"Nasdaq ETF",p:487.2,spread:"$0.01",trades:"380K",liq:"âââââ",tf:"1min",pattern:"VWAP Touch",score:96},
    {s:"SPY",n:"S&P 500 ETF",p:545.8,spread:"$0.01",trades:"620K",liq:"âââââ",tf:"1min",pattern:"Level 2 Pivot",score:95},
    {s:"NVDA",n:"NVIDIA",p:135.4,spread:"$0.02",trades:"280K",liq:"âââââ",tf:"2min",pattern:"T-line Bounce",score:93},
    {s:"TSLA",n:"Tesla",p:352.8,spread:"$0.03",trades:"310K",liq:"âââââ",tf:"2min",pattern:"VWAP Reclaim",score:90},
    {s:"AAPL",n:"Apple",p:213.4,spread:"$0.01",trades:"190K",liq:"âââââ",tf:"1min",pattern:"Micro Pullback",score:88},
    {s:"AMZN",n:"Amazon",p:228.5,spread:"$0.02",trades:"145K",liq:"âââââ",tf:"3min",pattern:"Bid Stack",score:85},
    {s:"AMD",n:"AMD",p:176.2,spread:"$0.03",trades:"168K",liq:"âââââ",tf:"2min",pattern:"Scalp Flag",score:83},
    {s:"IWM",n:"Russell 2000 ETF",p:218.4,spread:"$0.02",trades:"98K",liq:"âââââ",tf:"1min",pattern:"Range Break",score:80},
  ],
};

function AdvancedScreenerPage({ isPremium, onNeedPremium, lang }) {
  const isEN = lang === "en";
  const [tab, setTab]       = useState("stocks");
  const [sortCol, setSortCol] = useState("score");
  const [sortDir, setSortDir] = useState(-1);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const livePx = useContext(PriceCtx);

  if (!isPremium) return (
    <div style={{maxWidth:700,margin:"60px auto",textAlign:"center",padding:"0 20px"}}>
      <div style={{fontSize:56,marginBottom:12}}>ð¬</div>
      <h2 style={{color:C.text,fontWeight:800,fontSize:22,marginBottom:8}}>{isEN?"Advanced Screener":"Screener Avanzado"}</h2>
      <p style={{color:C.muted,fontSize:15,marginBottom:24,lineHeight:1.6}}>
        {isEN
          ? "Scan stocks, options, intraday setups and scalping opportunities with AI-powered signals. VIP exclusive."
          : "Escanea acciones, opciones, setups intraday y scalping con seÃ±ales potenciadas por IA. Exclusivo VIP."}
      </p>
      <button onClick={onNeedPremium} style={{background:"linear-gradient(135deg,#8B5CF6,#6366F1)",color:"#fff",border:"none",borderRadius:12,padding:"14px 36px",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 4px 20px rgba(139,92,246,0.4)"}}>
        â¦ {isEN?"Unlock VIP":"Desbloquear VIP"}
      </button>
    </div>
  );

  const tabs = [
    {id:"stocks",  l:isEN?"ð Stocks":"ð Acciones"},
    {id:"options", l:isEN?"â¡ Options":"â¡ Opciones"},
    {id:"intraday",l:isEN?"ð Intraday":"ð Intraday"},
    {id:"scalping",l:isEN?"â¡ Scalping":"â¡ Scalping"},
  ];

  const data = (SCREENER_PRESETS[tab]||[]).map(r => {
    const live = livePx[r.s];
    return { ...r, p: live?.price ?? r.p, chg: live?.change ?? r.chg };
  }).filter(r => {
    if (search && !r.s.toLowerCase().includes(search.toLowerCase()) && !r.n.toLowerCase().includes(search.toLowerCase())) return false;
    if (r.score < minScore) return false;
    return true;
  }).sort((a,b) => {
    const av = a[sortCol] ?? 0, bv = b[sortCol] ?? 0;
    return (av > bv ? 1 : av < bv ? -1 : 0) * sortDir;
  });

  const scoreColor = s => s >= 90 ? "#10B981" : s >= 75 ? "#F59E0B" : "#94A3B8";
  const chgColor   = c => c >= 0 ? "#10B981" : "#EF4444";

  const sortToggle = col => {
    if (sortCol === col) setSortDir(d => -d);
    else { setSortCol(col); setSortDir(-1); }
  };
  const SortBtn = ({col,label}) => (
    <button onClick={()=>sortToggle(col)} style={{background:"none",border:"none",color:sortCol===col?C.accent:C.muted,cursor:"pointer",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,padding:0,fontFamily:"inherit",display:"flex",alignItems:"center",gap:2}}>
      {label}{sortCol===col?(sortDir===-1?"â¼":"â²"):""}
    </button>
  );

  return (
    <div style={{maxWidth:1000,margin:"0 auto",padding:"0 4px 60px"}}>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <h1 style={{color:C.text,fontWeight:900,fontSize:22,margin:"0 0 4px",display:"flex",alignItems:"center",gap:8}}>
          ð¬ {isEN?"Advanced Screener":"Screener Avanzado"}
          <span style={{background:"linear-gradient(135deg,#8B5CF6,#6366F1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:12,fontWeight:800}}>VIP</span>
        </h1>
        <p style={{color:C.muted,fontSize:13,margin:0}}>
          {isEN
            ? "AI-powered scanner across stocks, options, intraday & scalping setups."
            : "Scanner con IA para acciones, opciones, setups intraday y scalping."}
        </p>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:4,marginBottom:16,width:"fit-content"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"8px 18px",borderRadius:9,border:"none",background:tab===t.id?"linear-gradient(135deg,#8B5CF6,#6366F1)":"transparent",color:tab===t.id?"#fff":C.muted,fontSize:13,fontWeight:tab===t.id?700:500,cursor:"pointer",transition:"all 0.2s"}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={isEN?"Search tickerâ¦":"Buscar tickerâ¦"}
          style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",width:160}}/>
        <div style={{display:"flex",alignItems:"center",gap:6,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 12px"}}>
          <span style={{fontSize:11,color:C.muted}}>Score â¥</span>
          <input type="range" min="0" max="95" step="5" value={minScore} onChange={e=>setMinScore(Number(e.target.value))}
            style={{width:80,accentColor:"#8B5CF6"}}/>
          <span style={{fontSize:12,fontWeight:700,color:"#8B5CF6",minWidth:24}}>{minScore}</span>
        </div>
        <div style={{marginLeft:"auto",color:C.muted,fontSize:12}}>{data.length} {isEN?"results":"resultados"}</div>
      </div>

      {/* Table â Stocks tab */}
      {tab === "stocks" && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow}}>
          <div style={{display:"grid",gridTemplateColumns:"70px 1fr 90px 70px 80px 90px 120px 70px",padding:"9px 16px",background:C.card2,borderBottom:`1px solid ${C.border}`,gap:8}}>
            {[["s","Ticker"],["n",isEN?"Name":"Nombre"],["p",isEN?"Price":"Precio"],["chg",isEN?"Chg%":"Var%"],["vol","Vol"],["mkt","Mkt Cap"],["pattern",isEN?"Pattern":"PatrÃ³n"],["score","Score"]].map(([col,lbl])=>(
              <SortBtn key={col} col={col} label={lbl}/>
            ))}
          </div>
          {data.map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr 90px 70px 80px 90px 120px 70px",padding:"11px 16px",borderBottom:`1px solid ${C.border}`,gap:8,transition:"background 0.1s",cursor:"default"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.04)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontFamily:"monospace",fontWeight:800,color:"#00e58f",fontSize:13}}>{r.s}</span>
              <span style={{fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.n}</span>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>${r.p?.toFixed(2)}</span>
              <span style={{fontSize:12,fontWeight:700,color:chgColor(r.chg)}}>{r.chg>=0?"+":""}{r.chg?.toFixed(1)}%</span>
              <span style={{fontSize:11,color:C.muted}}>{r.vol}</span>
              <span style={{fontSize:11,color:C.muted}}>{r.mkt}</span>
              <span style={{fontSize:11,background:"rgba(139,92,246,0.1)",color:"#A78BFA",borderRadius:6,padding:"2px 7px"}}>{r.pattern}</span>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:28,height:28,borderRadius:"50%",border:`2.5px solid ${scoreColor(r.score)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:scoreColor(r.score)}}>{r.score}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table â Options tab */}
      {tab === "options" && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow}}>
          <div style={{display:"grid",gridTemplateColumns:"70px 120px 80px 70px 60px 70px 70px 70px",padding:"9px 16px",background:C.card2,borderBottom:`1px solid ${C.border}`,gap:8}}>
            {[["s","Ticker"],["n",isEN?"Contract":"Contrato"],["strike","Strike"],["exp",isEN?"Exp":"Vto"],["iv","IV"],["vol","Vol"],["chg",isEN?"Chg%":"Var%"],["score","Score"]].map(([col,lbl])=>(
              <SortBtn key={col} col={col} label={lbl}/>
            ))}
          </div>
          {data.map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"70px 120px 80px 70px 60px 70px 70px 70px",padding:"11px 16px",borderBottom:`1px solid ${C.border}`,gap:8,transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.04)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontFamily:"monospace",fontWeight:800,color:r.type==="call"?"#10B981":"#EF4444",fontSize:13}}>{r.s}</span>
              <span style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.n}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.text}}>{r.strike}</span>
              <span style={{fontSize:11,color:C.muted}}>{r.exp}</span>
              <span style={{fontSize:12,color:"#F59E0B",fontWeight:700}}>{r.iv}</span>
              <span style={{fontSize:11,color:C.muted}}>{r.vol}</span>
              <span style={{fontSize:12,fontWeight:700,color:chgColor(r.chg)}}>{r.chg>=0?"+":""}{r.chg?.toFixed(1)}%</span>
              <div style={{display:"flex",alignItems:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",border:`2.5px solid ${scoreColor(r.score)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:scoreColor(r.score)}}>{r.score}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table â Intraday tab */}
      {tab === "intraday" && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow}}>
          <div style={{display:"grid",gridTemplateColumns:"70px 1fr 80px 70px 55px 60px 110px 90px 70px",padding:"9px 16px",background:C.card2,borderBottom:`1px solid ${C.border}`,gap:8}}>
            {[["s","Ticker"],["n",isEN?"Name":"Nombre"],["p",isEN?"Price":"Precio"],["chg","Chg%"],["atr","ATR"],["rvol","RVol"],["pattern",isEN?"Pattern":"PatrÃ³n"],["signal","Signal"],["score","Score"]].map(([col,lbl])=>(
              <SortBtn key={col} col={col} label={lbl}/>
            ))}
          </div>
          {data.map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr 80px 70px 55px 60px 110px 90px 70px",padding:"11px 16px",borderBottom:`1px solid ${C.border}`,gap:8,transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.04)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontFamily:"monospace",fontWeight:800,color:"#00e58f",fontSize:13}}>{r.s}</span>
              <span style={{fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.n}</span>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>${r.p?.toFixed(2)}</span>
              <span style={{fontSize:12,fontWeight:700,color:chgColor(r.chg)}}>{r.chg>=0?"+":""}{r.chg?.toFixed(1)}%</span>
              <span style={{fontSize:11,color:C.muted}}>{r.atr}</span>
              <span style={{fontSize:12,fontWeight:700,color:"#F59E0B"}}>{r.rvol}</span>
              <span style={{fontSize:11,background:"rgba(139,92,246,0.1)",color:"#A78BFA",borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>{r.pattern}</span>
              <span style={{fontSize:11,fontWeight:700}}>{r.signal}</span>
              <div style={{display:"flex",alignItems:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",border:`2.5px solid ${scoreColor(r.score)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:scoreColor(r.score)}}>{r.score}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table â Scalping tab */}
      {tab === "scalping" && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow}}>
          <div style={{display:"grid",gridTemplateColumns:"70px 1fr 90px 80px 80px 60px 130px 70px",padding:"9px 16px",background:C.card2,borderBottom:`1px solid ${C.border}`,gap:8}}>
            {[["s","Ticker"],["n",isEN?"Name":"Nombre"],["p",isEN?"Price":"Precio"],["spread","Spread"],["trades",isEN?"Trades/hr":"Ops/hr"],["tf","TF"],["pattern",isEN?"Setup":"Setup"],["score","Score"]].map(([col,lbl])=>(
              <SortBtn key={col} col={col} label={lbl}/>
            ))}
          </div>
          {data.map((r,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"70px 1fr 90px 80px 80px 60px 130px 70px",padding:"11px 16px",borderBottom:`1px solid ${C.border}`,gap:8,transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.04)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{fontFamily:"monospace",fontWeight:800,color:"#00e58f",fontSize:13}}>{r.s}</span>
              <span style={{fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.n}</span>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>${r.p?.toFixed(2)}</span>
              <span style={{fontSize:12,color:C.text}}>{r.spread}</span>
              <span style={{fontSize:11,color:C.muted}}>{r.trades}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.accent}}>{r.tf}</span>
              <span style={{fontSize:11,background:"rgba(139,92,246,0.1)",color:"#A78BFA",borderRadius:6,padding:"2px 7px",whiteSpace:"nowrap"}}>{r.pattern}</span>
              <div style={{display:"flex",alignItems:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",border:`2.5px solid ${scoreColor(r.score)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:scoreColor(r.score)}}>{r.score}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={{color:C.muted,fontSize:11,marginTop:14,textAlign:"center"}}>
        {isEN
          ? "Signals are educational, not financial advice. NexoTrade is not a licensed financial advisor."
          : "Las seÃ±ales son educativas, no son consejos financieros. NexoTrade no es un asesor financiero registrado."}
      </p>
    </div>
  );
}

// ââ LEGAL PAGE WRAPPER ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function LegalPage({title, children, onBack, lang}){
  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:"0 4px 40px"}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",marginBottom:20,padding:"4px 0",fontFamily:"inherit"}}
        onMouseEnter={e=>e.currentTarget.style.color=C.accent}
        onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
        â {lang==="en"?"Back":"Volver"}
      </button>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"32px 36px",boxShadow:C.shadow}}>
        <h1 style={{fontSize:24,fontWeight:900,color:C.text,marginBottom:6,letterSpacing:"-0.5px"}}>{title}</h1>
        <div style={{fontSize:11,color:C.muted2,marginBottom:28}}>{lang==="en"?"Last updated: May 2026":"Ãltima actualizaciÃ³n: Mayo 2026"} Â· nexotradeia.com</div>
        <div style={{color:C.muted,fontSize:14,lineHeight:1.8}}>{children}</div>
      </div>
    </div>
  );
}

function LegalSection({title,children}){
  return(
    <div style={{marginBottom:24}}>
      <h2 style={{fontSize:16,fontWeight:800,color:"var(--c-text)",marginBottom:10,paddingBottom:6,borderBottom:"1px solid var(--c-border)"}}>{title}</h2>
      {children}
    </div>
  );
}

// ââ ABOUT US PAGE (page 30) âââââââââââââââââââââââââââââââââââââââââââââââââââ
function AboutPage({onBack, lang}){
  const isEN = lang==="en";
  return(
    <LegalPage title={isEN?"About NexoTrade":"Sobre NexoTrade"} onBack={onBack} lang={lang}>
      <LegalSection title={isEN?"Who We Are":"QuiÃ©nes Somos"}>
        <p>{isEN
          ?"NexoTrade is the leading investment community for Spanish-speaking traders worldwide. Our mission is to democratize access to financial markets through education, AI tools, and collaborative analysis."
          :"NexoTrade es la comunidad de inversiÃ³n lÃ­der para traders hispanohablantes en todo el mundo. Nuestra misiÃ³n es democratizar el acceso a los mercados financieros a travÃ©s de educaciÃ³n, herramientas de IA y anÃ¡lisis colaborativo."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Our Platform":"Nuestra Plataforma"}>
        <p>{isEN
          ?"We offer a social platform where investors can share analysis, discuss market movements, and access real-time data. Our AI assistant provides educational insights to help users make more informed decisions."
          :"Ofrecemos una plataforma social donde los inversores pueden compartir anÃ¡lisis, discutir movimientos de mercado y acceder a datos en tiempo real. Nuestro asistente de IA proporciona informaciÃ³n educativa para ayudar a los usuarios a tomar decisiones mÃ¡s informadas."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Important Disclosure":"Aviso Importante"}>
        <p style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.25)",borderRadius:10,padding:"12px 16px",color:"var(--c-text)"}}>{isEN
          ?"â ï¸ NexoTrade is an educational and social platform. We are NOT a registered investment advisor, broker-dealer, or financial institution. Nothing on this platform constitutes financial advice. Always consult a licensed financial professional before making investment decisions."
          :"â ï¸ NexoTrade es una plataforma educativa y social. NO somos un asesor de inversiones registrado, corredor-agente, ni instituciÃ³n financiera. Nada en esta plataforma constituye asesoramiento financiero. Siempre consulte a un profesional financiero autorizado antes de tomar decisiones de inversiÃ³n."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Content Moderation":"ModeraciÃ³n de Contenido"}>
        <p>{isEN
          ?"All user-generated content is subject to our Community Guidelines. Our moderation team reviews posts to ensure compliance with our rules. Content that promotes pump-and-dump schemes, unlicensed financial advice, or illegal activities is strictly prohibited."
          :"Todo el contenido generado por usuarios estÃ¡ sujeto a nuestras Normas de la Comunidad. Nuestro equipo de moderaciÃ³n revisa las publicaciones para garantizar el cumplimiento de nuestras reglas. EstÃ¡ estrictamente prohibido el contenido que promueva esquemas de manipulaciÃ³n de precios, asesoramiento financiero sin licencia o actividades ilegales."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Contact":"Contacto"}>
        <p>{isEN?"For inquiries, partnerships, or support:":"Para consultas, colaboraciones o soporte:"}</p>
        <p>ð§ <a href="mailto:hola@nexotradeia.com" style={{color:C.accent}}>hola@nexotradeia.com</a></p>
        <p>ð <a href="https://nexotradeia.com" style={{color:C.accent}}>nexotradeia.com</a></p>
      </LegalSection>
    </LegalPage>
  );
}

// ââ TERMS OF USE PAGE (page 31) âââââââââââââââââââââââââââââââââââââââââââââââ
function TermsPage({onBack, lang}){
  const isEN = lang==="en";
  return(
    <LegalPage title={isEN?"Terms of Use":"TÃ©rminos de Uso"} onBack={onBack} lang={lang}>
      <LegalSection title={isEN?"1. Acceptance":"1. AceptaciÃ³n"}>
        <p>{isEN
          ?"By accessing or using NexoTrade, you agree to be bound by these Terms of Use. If you do not agree, please do not use our platform."
          :"Al acceder o usar NexoTrade, aceptas quedar vinculado por estos TÃ©rminos de Uso. Si no estÃ¡s de acuerdo, por favor no utilices nuestra plataforma."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"2. User-Generated Content (UGC)":"2. Contenido Generado por Usuarios (UGC)"}>
        <p>{isEN
          ?"Users may post analysis, opinions, and market commentary. By posting, you grant NexoTrade a non-exclusive license to display your content on the platform. You retain ownership of your content."
          :"Los usuarios pueden publicar anÃ¡lisis, opiniones y comentarios de mercado. Al publicar, otorgas a NexoTrade una licencia no exclusiva para mostrar tu contenido en la plataforma. Conservas la propiedad de tu contenido."
        }</p>
        <p>{isEN
          ?"You are solely responsible for the content you post. Prohibited content includes: (a) financial advice presented as fact, (b) pump-and-dump schemes, (c) spam or repetitive posts, (d) harassment or hate speech, (e) illegal content."
          :"Eres el Ãºnico responsable del contenido que publicas. El contenido prohibido incluye: (a) asesoramiento financiero presentado como hecho, (b) esquemas de manipulaciÃ³n de precios, (c) spam o publicaciones repetitivas, (d) acoso o discurso de odio, (e) contenido ilegal."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"3. Not Financial Advice":"3. No Constituye Asesoramiento Financiero"}>
        <p style={{background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"12px 16px"}}>{isEN
          ?"â ï¸ ALL content on NexoTrade is for EDUCATIONAL and INFORMATIONAL purposes ONLY. Nothing constitutes investment advice, a recommendation to buy or sell any security, or an offer to provide financial services. Past performance does not guarantee future results. Investing involves risk, including the possible loss of principal."
          :"â ï¸ TODO el contenido en NexoTrade es SOLO para fines EDUCATIVOS e INFORMATIVOS. Nada constituye asesoramiento de inversiÃ³n, una recomendaciÃ³n de comprar o vender ningÃºn valor, ni una oferta de servicios financieros. El rendimiento pasado no garantiza resultados futuros. Invertir implica riesgo, incluida la posible pÃ©rdida del capital."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"4. Account Responsibilities":"4. Responsabilidades de la Cuenta"}>
        <p>{isEN
          ?"You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to use NexoTrade. One account per person is allowed."
          :"Eres responsable de mantener la confidencialidad de las credenciales de tu cuenta. Debes tener al menos 18 aÃ±os para usar NexoTrade. Se permite una cuenta por persona."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"5. VIP Membership":"5. MembresÃ­a VIP"}>
        <p>{isEN
          ?"VIP memberships are billed monthly at $9.99/month. You may cancel at any time. Refunds are not provided for partial billing periods. Features included in VIP may change with notice."
          :"Las membresÃ­as VIP se facturan mensualmente a $9.99/mes. Puedes cancelar en cualquier momento. No se proporcionan reembolsos por perÃ­odos de facturaciÃ³n parciales. Las caracterÃ­sticas incluidas en VIP pueden cambiar con aviso previo."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"6. Modifications":"6. Modificaciones"}>
        <p>{isEN
          ?"NexoTrade reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms."
          :"NexoTrade se reserva el derecho de modificar estos tÃ©rminos en cualquier momento. El uso continuado de la plataforma despuÃ©s de los cambios constituye la aceptaciÃ³n de los nuevos tÃ©rminos."
        }</p>
      </LegalSection>
    </LegalPage>
  );
}

// ââ PRIVACY POLICY PAGE (page 32) ââââââââââââââââââââââââââââââââââââââââââââ
function PrivacyPage({onBack, lang}){
  const isEN = lang==="en";
  return(
    <LegalPage title={isEN?"Privacy Policy":"PolÃ­tica de Privacidad"} onBack={onBack} lang={lang}>
      <div style={{marginBottom:16}}>
        <a href="https://dependable-fish-gpdm3f.mystrikingly.com" target="_blank" rel="noopener noreferrer"
          style={{display:"inline-flex",alignItems:"center",gap:6,background:C.accentDim,border:`1px solid ${C.accent}44`,borderRadius:10,padding:"8px 14px",color:C.accent,fontSize:13,fontWeight:700,textDecoration:"none"}}>
          ð {isEN?"View full Privacy Policy (external)":"Ver PolÃ­tica de Privacidad completa (externo)"} â
        </a>
      </div>
      <LegalSection title={isEN?"Data We Collect":"Datos que Recopilamos"}>
        <p>{isEN
          ?"We collect: (1) Account information (email, username, avatar), (2) Content you post, (3) Usage data (pages visited, features used), (4) Payment information (processed securely via Stripe â we never store card numbers)."
          :"Recopilamos: (1) InformaciÃ³n de cuenta (email, nombre de usuario, avatar), (2) Contenido que publicas, (3) Datos de uso (pÃ¡ginas visitadas, funciones usadas), (4) InformaciÃ³n de pago (procesada de forma segura a travÃ©s de Stripe â nunca almacenamos nÃºmeros de tarjeta)."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"How We Use Your Data":"CÃ³mo Usamos Tus Datos"}>
        <p>{isEN
          ?"Your data is used to: provide and improve the platform, personalize your experience, process payments, send transactional emails (welcome, subscription confirmations), and comply with legal obligations. We do NOT sell your personal data to third parties."
          :"Tus datos se utilizan para: proporcionar y mejorar la plataforma, personalizar tu experiencia, procesar pagos, enviar correos transaccionales (bienvenida, confirmaciones de suscripciÃ³n) y cumplir con obligaciones legales. NO vendemos tus datos personales a terceros."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Third-Party Services":"Servicios de Terceros"}>
        <p>{isEN
          ?"We use: Supabase (database/auth), Stripe (payments), Google AdSense (advertising), Finnhub/CoinGecko (market data). Each has their own privacy policy."
          :"Utilizamos: Supabase (base de datos/autenticaciÃ³n), Stripe (pagos), Google AdSense (publicidad), Finnhub/CoinGecko (datos de mercado). Cada uno tiene su propia polÃ­tica de privacidad."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Your Rights":"Tus Derechos"}>
        <p>{isEN
          ?"You have the right to: access your data, correct inaccuracies, request deletion, and export your content. Contact us at hola@nexotradeia.com to exercise these rights."
          :"Tienes derecho a: acceder a tus datos, corregir inexactitudes, solicitar eliminaciÃ³n y exportar tu contenido. ContÃ¡ctanos en hola@nexotradeia.com para ejercer estos derechos."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Cookies":"Cookies"}>
        <p>{isEN
          ?"We use essential cookies for authentication and preferences. Advertising cookies are used by Google AdSense. You can manage cookie preferences in your browser settings."
          :"Usamos cookies esenciales para autenticaciÃ³n y preferencias. Las cookies publicitarias son utilizadas por Google AdSense. Puedes administrar las preferencias de cookies en la configuraciÃ³n de tu navegador."
        }</p>
      </LegalSection>
    </LegalPage>
  );
}

// ââ RISK DISCLAIMER PAGE (page 33) âââââââââââââââââââââââââââââââââââââââââââ
function RiskPage({onBack, lang}){
  const isEN = lang==="en";
  return(
    <LegalPage title={isEN?"Financial Risk Disclaimer":"Aviso de Riesgo Financiero"} onBack={onBack} lang={lang}>
      <div style={{background:"rgba(239,68,68,0.08)",border:"2px solid rgba(239,68,68,0.3)",borderRadius:14,padding:"18px 22px",marginBottom:24}}>
        <div style={{fontSize:22,marginBottom:8}}>â ï¸</div>
        <p style={{fontWeight:800,fontSize:15,color:"var(--c-text)",margin:0}}>{isEN
          ?"IMPORTANT: Trading and investing involve substantial risk of loss."
          :"IMPORTANTE: El trading y la inversiÃ³n implican un riesgo sustancial de pÃ©rdida."
        }</p>
      </div>
      <LegalSection title={isEN?"General Risk Warning":"Advertencia de Riesgo General"}>
        <p>{isEN
          ?"Trading stocks, cryptocurrencies, options, futures, and other financial instruments involves significant risk and is not suitable for all investors. You may lose some or all of your invested capital. Never invest money you cannot afford to lose."
          :"El trading de acciones, criptomonedas, opciones, futuros y otros instrumentos financieros implica un riesgo significativo y no es adecuado para todos los inversores. Puedes perder parte o la totalidad de tu capital invertido. Nunca inviertas dinero que no puedes permitirte perder."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Not Financial Advice":"No Constituye Asesoramiento Financiero"}>
        <p>{isEN
          ?"Nothing on NexoTrade â including posts, analysis, AI responses, market data, or any other content â constitutes investment advice, a recommendation to buy or sell any security, or a solicitation of any kind. All content is strictly educational and informational."
          :"Nada en NexoTrade â incluidas publicaciones, anÃ¡lisis, respuestas de IA, datos de mercado o cualquier otro contenido â constituye asesoramiento de inversiÃ³n, una recomendaciÃ³n de comprar o vender ningÃºn valor, ni una solicitud de ningÃºn tipo. Todo el contenido es estrictamente educativo e informativo."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Past Performance":"Rendimiento Pasado"}>
        <p>{isEN
          ?"Past performance of any investment, strategy, or analysis discussed on NexoTrade is not indicative of future results. Markets can and do move in unexpected ways."
          :"El rendimiento pasado de cualquier inversiÃ³n, estrategia o anÃ¡lisis discutido en NexoTrade no es indicativo de resultados futuros. Los mercados pueden y de hecho se mueven de maneras inesperadas."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Crypto & High-Risk Assets":"Cripto y Activos de Alto Riesgo"}>
        <p>{isEN
          ?"Cryptocurrencies are particularly volatile and unregulated in many jurisdictions. Prices can change dramatically in short periods. Regulatory changes can significantly impact the value of crypto assets."
          :"Las criptomonedas son particularmente volÃ¡tiles y no estÃ¡n reguladas en muchas jurisdicciones. Los precios pueden cambiar drÃ¡sticamente en perÃ­odos cortos. Los cambios regulatorios pueden impactar significativamente el valor de los activos cripto."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Affiliate Links":"Links de Afiliados"}>
        <p>{isEN
          ?"NexoTrade may earn commissions from affiliate partnerships (brokers, trading platforms). These partnerships do not influence our editorial content. We recommend you research any platform independently before opening an account."
          :"NexoTrade puede ganar comisiones de asociaciones de afiliados (corredores, plataformas de trading). Estas asociaciones no influyen en nuestro contenido editorial. Te recomendamos que investigues cualquier plataforma de forma independiente antes de abrir una cuenta."
        }</p>
      </LegalSection>
      <LegalSection title={isEN?"Seek Professional Advice":"Busca Asesoramiento Profesional"}>
        <p>{isEN
          ?"Before making any financial decisions, consult with a licensed financial advisor, tax professional, or legal counsel. NexoTrade is not a substitute for professional financial guidance."
          :"Antes de tomar cualquier decisiÃ³n financiera, consulta con un asesor financiero autorizado, un profesional fiscal o asesor legal. NexoTrade no es un sustituto del asesoramiento financiero profesional."
        }</p>
      </LegalSection>
    </LegalPage>
  );
}

// ââ COMMUNITY GUIDELINES PAGE (page 34) ââââââââââââââââââââââââââââââââââââââ
function GuidelinesPage({onBack, lang}){
  const isEN = lang==="en";
  const rules = isEN ? [
    {emoji:"ð", title:"Educational Content Only", desc:"Share analysis, data, and market observations. Frame your posts as opinions, not facts. Use phrases like 'I think', 'in my analysis', or 'this is not financial advice'."},
    {emoji:"ð«", title:"No Pump & Dump", desc:"Promoting securities to artificially inflate their price is illegal and will result in immediate account termination and reporting to authorities."},
    {emoji:"ð¤", title:"Respectful Debate", desc:"Disagree with ideas, not people. Harassment, personal attacks, and hate speech are not tolerated."},
    {emoji:"ð", title:"Cite Your Sources", desc:"Back up claims with data. Unverified claims or misleading information may be removed."},
    {emoji:"ð¨", title:"No Spam", desc:"No repetitive posts, unsolicited promotions, or copy-paste content. One thoughtful post beats ten low-quality ones."},
    {emoji:"â", title:"Verified Information", desc:"Market data, earnings figures, and company news should come from reliable sources (SEC filings, official press releases, reputable financial media)."},
    {emoji:"ð", title:"Privacy", desc:"Do not share personal financial information, account numbers, or private data â yours or others'."},
    {emoji:"âï¸", title:"Legal Compliance", desc:"All content must comply with applicable securities laws. Insider trading tips, front-running, or other illegal market practices are prohibited."},
  ] : [
    {emoji:"ð", title:"Solo Contenido Educativo", desc:"Comparte anÃ¡lisis, datos y observaciones del mercado. Presenta tus publicaciones como opiniones, no como hechos. Usa frases como 'creo que', 'en mi anÃ¡lisis', o 'esto no es consejo financiero'."},
    {emoji:"ð«", title:"Prohibido el Pump & Dump", desc:"Promover valores para inflar artificialmente su precio es ilegal y resultarÃ¡ en la terminaciÃ³n inmediata de la cuenta y denuncia ante las autoridades."},
    {emoji:"ð¤", title:"Debate Respetuoso", desc:"Discrepa con las ideas, no con las personas. El acoso, los ataques personales y el discurso de odio no estÃ¡n tolerados."},
    {emoji:"ð", title:"Cita Tus Fuentes", desc:"Respalda las afirmaciones con datos. Las afirmaciones no verificadas o la informaciÃ³n engaÃ±osa pueden ser eliminadas."},
    {emoji:"ð¨", title:"Sin Spam", desc:"No hay publicaciones repetitivas, promociones no solicitadas ni contenido copy-paste. Una publicaciÃ³n reflexiva vale mÃ¡s que diez de baja calidad."},
    {emoji:"â", title:"InformaciÃ³n Verificada", desc:"Los datos de mercado, cifras de ganancias y noticias de empresas deben provenir de fuentes confiables (documentos SEC, comunicados de prensa oficiales, medios financieros reputados)."},
    {emoji:"ð", title:"Privacidad", desc:"No compartas informaciÃ³n financiera personal, nÃºmeros de cuenta ni datos privados â tuyos ni de otros."},
    {emoji:"âï¸", title:"Cumplimiento Legal", desc:"Todo el contenido debe cumplir con las leyes de valores aplicables. Los consejos de informaciÃ³n privilegiada, front-running u otras prÃ¡cticas ilegales de mercado estÃ¡n prohibidas."},
  ];

  return(
    <LegalPage title={isEN?"Community Guidelines":"Normas de la Comunidad"} onBack={onBack} lang={lang}>
      <p style={{marginBottom:24,fontSize:15}}>{isEN
        ?"NexoTrade is a community for serious traders and investors. These guidelines exist to maintain a high-quality, legal, and respectful environment."
        :"NexoTrade es una comunidad para traders e inversores serios. Estas normas existen para mantener un entorno de alta calidad, legal y respetuoso."
      }</p>
      <div style={{display:"grid",gap:12}}>
        {rules.map((rule,i)=>(
          <div key={i} style={{display:"flex",gap:14,padding:"14px 16px",background:"var(--c-card2)",border:"1px solid var(--c-border)",borderRadius:12}}>
            <span style={{fontSize:22,flexShrink:0,marginTop:2}}>{rule.emoji}</span>
            <div>
              <div style={{fontWeight:800,fontSize:14,color:"var(--c-text)",marginBottom:4}}>{rule.title}</div>
              <div style={{fontSize:13,color:"var(--c-muted)",lineHeight:1.6}}>{rule.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:24,padding:"14px 18px",background:"rgba(0,168,255,0.06)",border:"1px solid rgba(0,168,255,0.2)",borderRadius:12}}>
        <p style={{margin:0,fontSize:13,color:"var(--c-muted)"}}>{isEN
          ?"Violations may result in content removal, temporary suspension, or permanent ban. For questions or to report violations: "
          :"Las infracciones pueden resultar en eliminaciÃ³n de contenido, suspensiÃ³n temporal o ban permanente. Para preguntas o para reportar infracciones: "
        }<a href="mailto:hola@nexotradeia.com" style={{color:C.accent}}>hola@nexotradeia.com</a></p>
      </div>
    </LegalPage>
  );
}

// ââ APP ROOT ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// Leer sesiÃ³n guardada de localStorage ANTES de renderizar (sÃ­ncrono, sin flash)
const ADMIN_EMAILS_CONST = ['mariangat26@gmail.com','mariagalarraga2013@gmail.com'];
const _getAdminStatus = () => {
  try {
    // Intentar todos los mÃ©todos posibles para leer el email
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
      } catch(e) {}
    }
  } catch(e) {}
  return false;
};
const _getSavedUser = () => {
  try { return JSON.parse(localStorage.getItem("nexotrade-user") || "null"); }
  catch(e) { return null; }
};

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   ADMIN DASHBOARD â solo visible para emails admin
âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function AdminDashboard(){
  const [stats,setStats] = useState(null);
  const [posts,setPosts] = useState([]);
  const [subs,setSubs]   = useState([]);
  const [loading,setLoading] = useState(true);
  const [tab,setTab] = useState("overview");

  useEffect(()=>{
    const load = async()=>{
      setLoading(true);
      try{
        // Contar usuarios en profiles
        const {count:totalUsers} = await supabase.from("profiles").select("*",{count:"exact",head:true});
        // Usuarios nuevos hoy
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        const {count:newToday} = await supabase.from("profiles").select("*",{count:"exact",head:true}).gte("created_at",hoy.toISOString());
        // Usuarios nuevos esta semana
        const semana = new Date(); semana.setDate(semana.getDate()-7);
        const {count:newWeek} = await supabase.from("profiles").select("*",{count:"exact",head:true}).gte("created_at",semana.toISOString());
        // Total VIP
        const {count:vipCount} = await supabase.from("profiles").select("*",{count:"exact",head:true}).eq("is_premium",true);
        // Posts hoy
        const {count:postsHoy} = await supabase.from("posts").select("*",{count:"exact",head:true}).gte("created_at",hoy.toISOString());
        // Total posts
        const {count:totalPosts} = await supabase.from("posts").select("*",{count:"exact",head:true});
        // Newsletter subscribers
        const {data:subsData,count:totalSubs} = await supabase.from("newsletter_subscribers").select("email,created_at",{count:"exact"}).order("created_at",{ascending:false}).limit(20);
        // Posts recientes
        const {data:recentPosts} = await supabase.from("posts").select("content,ticker,tipo,username,created_at,likes").order("created_at",{ascending:false}).limit(10);

        setStats({totalUsers:totalUsers||0,newToday:newToday||0,newWeek:newWeek||0,vipCount:vipCount||0,postsHoy:postsHoy||0,totalPosts:totalPosts||0,totalSubs:totalSubs||0});
        setSubs(subsData||[]);
        setPosts(recentPosts||[]);
      }catch(e){console.error(e);}
      setLoading(false);
    };
    load();
  },[]);

  const ingresoEstimado = stats ? (stats.vipCount * 9.99).toFixed(2) : "0.00";

  if(loading) return(
    <div style={{textAlign:"center",padding:60}}>
      <div style={{fontSize:40,marginBottom:16}}>ð¡ï¸</div>
      <div style={{color:C.muted,fontSize:14}}>Cargando dashboard admin...</div>
    </div>
  );

  const TABS = [{k:"overview",l:"ð Overview"},{k:"usuarios",l:"ð¥ Usuarios"},{k:"posts",l:"ð Posts"},{k:"emails",l:"ð§ Emails"}];

  return(
    <div style={{maxWidth:1000,margin:"0 auto",padding:"0 4px"}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",borderRadius:18,padding:"24px 28px",marginBottom:20,border:"1px solid #7C3AED44",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#7C3AED,#4c1d95)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>ð¡ï¸</div>
        <div style={{flex:1}}>
          <h1 style={{margin:"0 0 4px",color:"#fff",fontSize:20,fontWeight:900}}>Admin Dashboard â NexoTrade</h1>
          <div style={{color:"#64748b",fontSize:13}}>Datos en tiempo real de Supabase Â· {new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"})}</div>
        </div>
        <button onClick={()=>window.location.reload()} style={{background:"#7C3AED22",border:"1px solid #7C3AED44",borderRadius:10,padding:"8px 16px",color:"#a78bfa",fontSize:12,fontWeight:700,cursor:"pointer"}}>ð Actualizar</button>
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
        {[
          {icon:"ð¥",label:"Usuarios totales",value:stats.totalUsers,color:"#10b981",sub:`+${stats.newWeek} esta semana`},
          {icon:"ð",label:"Nuevos hoy",value:stats.newToday,color:"#3b82f6",sub:"registros de hoy"},
          {icon:"â¦",label:"Miembros VIP",value:stats.vipCount,color:"#a78bfa",sub:`$${(stats.vipCount*9.99).toFixed(0)}/mes estimado`},
          {icon:"ð°",label:"MRR estimado",value:`$${ingresoEstimado}`,color:"#f59e0b",sub:"solo Stripe VIP"},
          {icon:"ð",label:"Posts hoy",value:stats.postsHoy,color:"#06b6d4",sub:`${stats.totalPosts} en total`},
          {icon:"ð§",label:"Newsletter",value:stats.totalSubs,color:"#ec4899",sub:"emails capturados"},
        ].map((k,i)=>(
          <div key={i} style={{background:C.surface,border:`1px solid ${k.color}33`,borderRadius:16,padding:"18px 16px",boxShadow:C.shadow}}>
            <div style={{fontSize:22,marginBottom:8}}>{k.icon}</div>
            <div style={{fontSize:24,fontWeight:900,color:k.color,lineHeight:1,marginBottom:4}}>{k.value}</div>
            <div style={{color:C.muted,fontSize:11,fontWeight:600,marginBottom:2}}>{k.label}</div>
            <div style={{color:C.muted2,fontSize:10}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            style={{padding:"7px 16px",borderRadius:10,border:"1px solid",fontSize:13,fontWeight:600,cursor:"pointer",
              borderColor:tab===t.k?C.accent:C.border,
              background:tab===t.k?C.accent+"22":"transparent",
              color:tab===t.k?C.accent:C.muted}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab==="overview" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,flexWrap:"wrap"}}>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px"}}>
            <h3 style={{margin:"0 0 16px",color:C.text,fontSize:14,fontWeight:800}}>ð° Ingresos estimados</h3>
            {[
              {label:"VIP $9.99/mes",value:`$${(stats.vipCount*9.99).toFixed(2)}`,color:"#a78bfa"},
              {label:"Webinars (promedio 2/mes)",value:"$0.00 â pendiente Stripe",color:C.muted2},
              {label:"Cursos",value:"$0.00 â pendiente Stripe",color:C.muted2},
              {label:"Job Board",value:"$0.00 â pendiente",color:C.muted2},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
                <span style={{color:C.muted,fontSize:13}}>{r.label}</span>
                <span style={{color:r.color,fontWeight:700,fontSize:13}}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px"}}>
            <h3 style={{margin:"0 0 16px",color:C.text,fontSize:14,fontWeight:800}}>ð Crecimiento semanal</h3>
            {[
              {label:"Nuevos usuarios",value:`+${stats.newWeek}`,color:"#10b981"},
              {label:"Posts publicados",value:`+${stats.postsHoy} hoy`,color:"#3b82f6"},
              {label:"Emails newsletter",value:`${stats.totalSubs} total`,color:"#ec4899"},
              {label:"Ratio VIP/Total",value:`${stats.totalUsers>0?((stats.vipCount/stats.totalUsers)*100).toFixed(1):0}%`,color:"#f59e0b"},
            ].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?`1px solid ${C.border}`:"none"}}>
                <span style={{color:C.muted,fontSize:13}}>{r.label}</span>
                <span style={{color:r.color,fontWeight:700,fontSize:13}}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usuarios */}
      {tab==="usuarios" && (
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px"}}>
          <h3 style={{margin:"0 0 16px",color:C.text,fontSize:14,fontWeight:800}}>ð¥ EstadÃ­sticas de usuarios</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {[
              {l:"Total registrados",v:stats.totalUsers,c:"#10b981"},
              {l:"Nuevos esta semana",v:stats.newWeek,c:"#3b82f6"},
              {l:"Nuevos hoy",v:stats.newToday,c:"#f59e0b"},
              {l:"Miembros VIP activos",v:stats.vipCount,c:"#a78bfa"},
              {l:"Usuarios free",v:stats.totalUsers-stats.vipCount,c:C.muted},
              {l:"ConversiÃ³n VIP",v:`${stats.totalUsers>0?((stats.vipCount/stats.totalUsers)*100).toFixed(1):0}%`,c:"#ec4899"},
            ].map((s,i)=>(
              <div key={i} style={{background:C.bg,borderRadius:12,padding:"14px",border:`1px solid ${C.border}`}}>
                <div style={{fontSize:20,fontWeight:900,color:s.c}}>{s.v}</div>
                <div style={{color:C.muted2,fontSize:11,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{color:C.muted2,fontSize:12,textAlign:"center",padding:"12px",background:C.bg,borderRadius:10}}>
            ð¡ Para ver lista completa de usuarios ve a tu <a href="https://supabase.com/dashboard/project/glvrzrtatekuuhwtzzhd/editor" target="_blank" style={{color:C.accent}}>Supabase Dashboard â</a>
          </div>
        </div>
      )}

      {/* Posts recientes */}
      {tab==="posts" && (
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px"}}>
          <h3 style={{margin:"0 0 16px",color:C.text,fontSize:14,fontWeight:800}}>ð Ãltimos 10 posts publicados</h3>
          {posts.length===0 ? <div style={{color:C.muted2,textAlign:"center",padding:20}}>No hay posts aÃºn</div> :
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {posts.map((p,i)=>(
              <div key={i} style={{background:C.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`,display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{flexShrink:0}}>
                  <span style={{background:p.tipo==="COMPRA"?"#10b98122":"#ef444422",color:p.tipo==="COMPRA"?"#10b981":"#ef4444",border:`1px solid ${p.tipo==="COMPRA"?"#10b98144":"#ef444444"}`,borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:700}}>{p.tipo||"POST"}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:C.muted2,fontSize:11,marginBottom:3}}>@{p.username} {p.ticker?`Â· $${p.ticker}`:""} Â· {new Date(p.created_at).toLocaleString("es-MX",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                  <div style={{color:C.text,fontSize:13,lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.content}</div>
                </div>
                <div style={{color:C.muted2,fontSize:11,flexShrink:0}}>â¤ï¸ {p.likes||0}</div>
              </div>
            ))}
          </div>}
        </div>
      )}

      {/* Newsletter emails */}
      {tab==="emails" && (
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
            <h3 style={{margin:0,color:C.text,fontSize:14,fontWeight:800}}>ð§ Newsletter subscribers ({stats.totalSubs})</h3>
            <button onClick={()=>{
              const csv = "email,fecha\n" + subs.map(s=>`${s.email},${s.created_at}`).join("\n");
              const a = document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="newsletter_nexotrade.csv"; a.click();
            }} style={{background:C.accent+"22",border:`1px solid ${C.accent}44`,borderRadius:10,padding:"7px 16px",color:C.accent,fontSize:12,fontWeight:700,cursor:"pointer"}}>
              â¬ï¸ Exportar CSV
            </button>
          </div>
          {subs.length===0 ? <div style={{color:C.muted2,textAlign:"center",padding:20}}>Sin suscriptores aÃºn</div> :
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {subs.map((s,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
                <span style={{color:C.text,fontSize:13}}>ð§ {s.email}</span>
                <span style={{color:C.muted2,fontSize:11}}>{new Date(s.created_at).toLocaleDateString("es-MX")}</span>
              </div>
            ))}
            {stats.totalSubs>20&&<div style={{color:C.muted2,fontSize:11,textAlign:"center",padding:8}}>Mostrando Ãºltimos 20 de {stats.totalSubs}. Exporta el CSV para ver todos.</div>}
          </div>}
        </div>
      )}
    </div>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
   WELCOME MODAL â aparece al registrarse por primera vez
âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
function WelcomeModal({name, onClose, onGoVip}){
  const steps = [
    {emoji:"ð", titulo:"Publica tu primera idea", desc:"Comparte tu anÃ¡lisis con miles de traders"},
    {emoji:"ð¥", titulo:"Sigue a top traders",     desc:"Descubre quiÃ©n estÃ¡ ganando en el leaderboard"},
    {emoji:"ð®", titulo:"Paper trading $100k",     desc:"Practica sin arriesgar dinero real"},
    {emoji:"â¦",  titulo:"Hazte VIP por $9.99/mes", desc:"Picks semanales, seÃ±ales y mucho mÃ¡s"},
  ];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:24,padding:"36px 32px",maxWidth:460,width:"100%",boxShadow:"0 25px 80px rgba(0,0,0,0.6)",border:`1px solid ${C.border}`,position:"relative"}} onClick={e=>e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"transparent",border:"none",color:C.muted2,fontSize:20,cursor:"pointer",lineHeight:1}}>â</button>

        {/* Confetti header */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:56,marginBottom:8}}>ð</div>
          <h2 style={{margin:"0 0 6px",color:C.text,fontSize:22,fontWeight:900}}>Â¡Bienvenido, {name}!</h2>
          <p style={{margin:0,color:C.muted,fontSize:13}}>Ya eres parte de la comunidad de inversores hispanos mÃ¡s activa.</p>
        </div>

        {/* Steps */}
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"center",background:C.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`}}>
              <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${C.accentDim},${C.blueBg})`,border:`1px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.emoji}</div>
              <div>
                <div style={{color:C.text,fontWeight:700,fontSize:13}}>{s.titulo}</div>
                <div style={{color:C.muted2,fontSize:12}}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bonus badge */}
        <div style={{background:"linear-gradient(135deg,#f59e0b22,#d9770622)",border:"1px solid #f59e0b44",borderRadius:12,padding:"10px 16px",marginBottom:20,display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:22}}>ð</span>
          <div>
            <div style={{color:"#f59e0b",fontWeight:700,fontSize:13}}>+100 puntos de bienvenida aÃ±adidos</div>
            <div style={{color:"#92400e",fontSize:11}}>Badge "Early Adopter" desbloqueado en tu perfil</div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{display:"flex",gap:10,flexDirection:"column"}}>
          <button onClick={onGoVip} style={{background:"linear-gradient(135deg,#7C3AED,#4c1d95)",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",width:"100%"}}>â¦ Ver plan VIP â 50% en webinars</button>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:12,padding:"11px",color:C.muted,fontSize:13,fontWeight:600,cursor:"pointer",width:"100%"}}>Explorar el feed â</button>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [posts,setPosts]       = useState([]);
  const [newPostId,setNewPostId]= useState(null);
  const [page,setPage]         = useState(0);
  const [sent,setSent]         = useState("all");
  const [auth,setAuth]         = useState(null);
  const [user,setUser]         = useState(_getSavedUser); // â restaura al instante
  const [following,setFollow]  = useState([]);
  const [dmTarget,setDmTarget] = useState(null); // Para abrir DM directo desde un post
  const ADMIN_EMAILS = ADMIN_EMAILS_CONST;
  const [isPremium,setIsPremium]= useState(
    _getAdminStatus() || (_getSavedUser()?.is_premium || false)
  );
  const [isPro,setIsPro]= useState(
    _getAdminStatus() || (_getSavedUser()?.is_pro || false)
  );
  const [profUser,setProfUser] = useState(null);
  const [showAI,setShowAI]     = useState(false);
  const [showAlerts,setAlerts] = useState(false);
  const [communityCount, setCommunityCount] = useState(3200);
  const animatedCount = useCountUp(communityCount, 2500);

  // ââ Fetch contador real de comunidad desde Supabase âââââââââââââââââââââ
  useEffect(()=>{
    supabase.from("profiles").select("id", {count:"exact",head:true})
      .then(({count})=>{ if(count && count > 0) setCommunityCount(count + 2800); })
      .catch(()=>{});
  },[]);
  const [alertCount,setAlertCount]   = useState(0);
  const [triggeredIds,setTriggeredIds] = useState(()=>{try{return JSON.parse(localStorage.getItem("nexotrade-triggered")||"[]");}catch(e){return [];}});

  // ââ Revisar alertas de precio cada 30s âââââââââââââââââââââââââââââââââ
  useEffect(()=>{
    const checkAlerts=()=>{
      try{
        const saved=JSON.parse(localStorage.getItem("nexotrade-alerts")||"[]");
        const active=saved.filter(a=>!a.triggered);
        setAlertCount(active.length);
        // Disparar notificaciÃ³n si el precio llegÃ³ al objetivo
        if(Notification.permission==="granted" && active.length>0){
          const alreadyFired=JSON.parse(localStorage.getItem("nexotrade-triggered")||"[]");
          // AquÃ­ solo chequeamos si hay alertas â la comparaciÃ³n de precios
          // la hace PriceAlerts que tiene acceso al PriceCtx
        }
      }catch(e){}
    };
    checkAlerts();
    const t=setInterval(checkAlerts,30000);
    return()=>clearInterval(t);
  },[]);
  const [lang,setLang]         = useState(()=>{ try{ return localStorage.getItem("nexo-lang")||"en"; }catch(e){ return "en"; } });
  const [toast,setToast]       = useState({show:false,points:0,reason:""});
  const [dbReady,setDbReady]   = useState(false);
  const [feedError,setFeedError] = useState(false);
  const [showVipPopup,setVipPopup] = useState(false);
  const [showWelcome,setShowWelcome] = useState(false);
  const [welcomeName,setWelcomeName] = useState("");
  const [showPushPrompt,setShowPushPrompt] = useState(false);
  const [showEmailPopup,setShowEmailPopup] = useState(false);
  const [emailPopupSent,setEmailPopupSent] = useState(false);
  const [socialProofMsg,setSocialProofMsg] = useState(null);

  // ââ Pop-up email: aparece a los 25s si no se ha visto antes ââââââââââââââ
  useEffect(()=>{
    if(user) return; // ya estÃ¡ registrado
    if(localStorage.getItem("nexo-email-popup-seen")) return;
    const t = setTimeout(()=>setShowEmailPopup(true), 25000);
    return ()=>clearTimeout(t);
  },[user]);

  // ââ Social proof toasts cada 50-80 segundos âââââââââââââââââââââââââââââââ
  useEffect(()=>{
    const names=[
      {n:"Carlos M.",loc:"MÃ©xico"},    {n:"Valentina R.",loc:"Colombia"},
      {n:"Diego F.",loc:"Argentina"},  {n:"MarÃ­a L.",loc:"EspaÃ±a"},
      {n:"AndrÃ©s P.",loc:"Chile"},     {n:"SofÃ­a G.",loc:"Miami"},
      {n:"Luis H.",loc:"PerÃº"},        {n:"Camila T.",loc:"Venezuela"},
      {n:"Javier O.",loc:"MÃ©xico"},    {n:"Isabella N.",loc:"Colombia"},
    ];
    const actions=["se acaba de registrar ð","comprÃ³ membresÃ­a VIP â­","hizo su primer pick ð¯","se uniÃ³ a la comunidad ð"];
    let idx=0;
    const show=()=>{
      const p=names[idx%names.length];
      const a=actions[Math.floor(Math.random()*actions.length)];
      setSocialProofMsg({name:p.n, loc:p.loc, action:a});
      idx++;
      setTimeout(()=>setSocialProofMsg(null), 4500);
    };
    const delay = setTimeout(()=>{
      show();
      const interval = setInterval(show, 55000 + Math.random()*25000);
      return ()=>clearInterval(interval);
    }, 12000);
    return ()=>clearTimeout(delay);
  },[]);
  const [newsletterEmail,setNewsletterEmail] = useState("");
  const [newsletterDone,setNewsletterDone]   = useState(false);
  const [showNewsletter,setShowNewsletter]   = useState(
    !sessionStorage.getItem("nexo-newsletter-dismissed")
  );

  const t = LANGS[lang];

  // ââ BACK BUTTON: evitar que la flecha del navegador salga del sitio ââââââââââ
  useEffect(()=>{
    // Empuja un estado inicial para que haya algo a lo que volver
    window.history.pushState({page:0},"",window.location.pathname);
    const onPop = ()=>{
      // En lugar de salir, volvemos al feed (pÃ¡gina 0)
      setPage(0);
      window.history.pushState({page:0},"",window.location.pathname);
    };
    window.addEventListener("popstate", onPop);
    return ()=> window.removeEventListener("popstate", onPop);
  },[]);

  // ââ VIP POP-UP: aparece a los 2 minutos para usuarios no-premium âââââââââââââ
  useEffect(()=>{
    const already = sessionStorage.getItem("nexo-vip-popup-shown");
    if(already) return;
    const timer = setTimeout(()=>{
      const ep = _getAdminStatus() || (_getSavedUser()?.is_premium || false);
      if(!ep){
        setVipPopup(true);
        sessionStorage.setItem("nexo-vip-popup-shown","1");
      }
    }, 120000); // 2 minutos â no interrumpe al usuario reciÃ©n llegado
    return ()=> clearTimeout(timer);
  },[]);

  // ââ PUSH NOTIFICATIONS: pide permiso a los 90s si estÃ¡ logueado âââââââââââââ
  useEffect(()=>{
    if(!user) return;
    const already = localStorage.getItem("nexo-push-asked");
    if(already) return;
    if(!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if(Notification.permission === "granted") return;
    const t = setTimeout(()=>{ setShowPushPrompt(true); }, 90000);
    return ()=>clearTimeout(t);
  },[user]);

  const activarPush = async()=>{
    setShowPushPrompt(false);
    localStorage.setItem("nexo-push-asked","1");
    try{
      const perm = await Notification.requestPermission();
      if(perm==="granted"){
        const reg = await navigator.serviceWorker.ready;
        // Solo mostramos notificaciÃ³n de bienvenida local (no requiere servidor)
        reg.showNotification("ð NexoTrade activado",{
          body:"Te avisaremos cuando haya picks VIP nuevos y posts trending.",
          icon:"/logo_nexo.png",
          badge:"/favicon.svg",
          tag:"nexo-welcome-push",
        });
      }
    }catch(e){}
  };

  // Helper: guardar/borrar usuario en localStorage + state
  const saveUser = useCallback((u) => {
    setUser(u);
    if(u) localStorage.setItem("nexotrade-user", JSON.stringify(u));
    else  localStorage.removeItem("nexotrade-user");
  }, []);

  // ââ SUPABASE: Auth listener & session restore ââââââââââââââââââââââââââââââ
  const buildUserFromProfile = (supabaseUser, profile) => ({
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: profile?.username || supabaseUser.email?.split("@")[0] || "Usuario",
    emoji: profile?.avatar_emoji || "ð¦",
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
        // Si no tiene perfil, lo creamos automÃ¡ticamente
        if(!profile){
          const username = session.user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g,"").slice(0,20);
          const avatars = ["ð¦","ðº","ð¦","ð¯","ð¦","ð»","ð¦","ð¦","ð","â¡"];
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

  // ââ SUPABASE: Cargar posts reales y suscripciÃ³n realtime ââââââââââââââââââ
  useEffect(()=>{
    let sub;
    const loadPosts=async()=>{
      try{
        // Primero intenta con join a profiles
        let { data, error } = await supabase
          .from("posts")
          .select(`*, profiles(username,avatar_emoji,avatar_color,points)`)
          .order("created_at", {ascending:false})
          .limit(100);

        // Si falla el join, intenta sin Ã©l
        if(error){
          const fallback = await supabase
            .from("posts")
            .select("*")
            .order("created_at", {ascending:false})
            .limit(100);
          data  = fallback.data;
          error = fallback.error;
        }

        // Si Supabase falla, carga posts guardados localmente y muestra aviso
        if(error || !data){
          try{
            const local = JSON.parse(localStorage.getItem("nexo-posts-cache")||"[]");
            if(local.length>0){ setPosts(local); setDbReady(true); setFeedError(false); }
            else { setFeedError(true); }
          }catch(e){ setFeedError(true); }
          return;
        }
        setFeedError(false);
        if(!error && data){
          const mapped = data.map(p=>({
            id:         p.id,
            userId:     p.user_id,
            user:       p.profiles?.username || p.user_name || p.username || "Trader",
            avatar:     p.profiles?.avatar_emoji || p.avatar_emoji || "ð¦",
            avatarColor:p.profiles?.avatar_color || p.avatar_color || C.accent,
            time:       fmtTimeAgo(p.created_at),
            ticker:     p.ticker||"GENERAL",
            sentiment:  p.sentiment||"bull",
            text:       p.content || p.text || "",
            likes:      p.likes_count||0,
            comments:   p.comments_count||0,
            reposts:    p.reposts_count||0,
            tags:       p.tags||[p.ticker||"GENERAL"],
            image:      p.image_url||null,
            link:       p.link_url||null,
          }));
          // Solo actualiza si hay posts nuevos â no mueve el scroll innecesariamente
          setPosts(prev => {
            const prevIds = new Set(prev.map(p => p.id));
            const nuevos  = mapped.filter(p => !prevIds.has(p.id));
            if(nuevos.length === 0 && prev.length > 0) return prev;
            return mapped;
          });
          // Guarda en cachÃ© local para que no desaparezcan si Supabase falla
          try{ localStorage.setItem("nexo-posts-cache", JSON.stringify(mapped.slice(0,50))); }catch(e){}
          setDbReady(true);
        }
      }catch(e){ console.error("Error cargando posts:", e); }
    };
    loadPosts();
    // Auto-refresh cada 15 segundos â solo agrega posts NUEVOS sin mover el scroll
    const refreshTimer=setInterval(loadPosts, 15000);

    // SuscripciÃ³n realtime â nuevos posts aparecen al instante
    sub=supabase
      .channel("posts-realtime")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"posts"},async(payload)=>{
        const p=payload.new;
        const {data:profile}=await supabase.from("profiles").select("username,avatar_emoji,avatar_color,points").eq("id",p.user_id).single();
        const newPost={
          id:p.id,userId:p.user_id,
          user:profile?.username||p.user_name||"Trader",
          avatar:profile?.avatar_emoji||"ð¦",
          avatarColor:profile?.avatar_color||C.accent,
          time:"ahora",ticker:p.ticker,sentiment:p.sentiment,
          text:p.content||p.text||"",likes:0,comments:0,reposts:0,tags:p.tags||[p.ticker],
        };
        setPosts(prev=>{
          // Si ya existe con ese UUID (confirmado desde addPost) â no duplicar
          if(prev.some(x=>x.id===newPost.id && x._confirmed)) return prev;
          // Si hay un post local pendiente del mismo usuario+texto â reemplazarlo
          const localIdx=prev.findIndex(x=>x.id?.startsWith("local-")&&x.text===newPost.text&&x.userId===newPost.userId);
          if(localIdx>=0){
            const updated=[...prev];
            updated[localIdx]={...updated[localIdx],...newPost,_confirmed:true};
            return updated;
          }
          // Post de otro usuario â agregar arriba
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
      showPoints(POINT_ACTIONS.follower,"Â¡Siguiendo!");
      // Guardar en BD si hay sesiÃ³n
      if(user?.id && user.id!=="local"){
        await supabase.from("follows").insert({follower_id:user.id,following_id:id}).select();
      }
    }else{
      if(user?.id && user.id!=="local"){
        await supabase.from("follows").delete().eq("follower_id",user.id).eq("following_id",id);
      }
    }
  };

  const addPost = async({text,ticker,sentiment,image,link}) => {
    const localId = `local-${Date.now()}`;
    // 1. Mostrar el post INMEDIATAMENTE en la pantalla (optimista)
    const localPost={
      id:localId, userId:user?.id, user:user?.name||"TÃº",
      avatar:user?.emoji||"ð¦", avatarColor:user?.avatarColor||C.accent,
      time:"ahora", ticker, sentiment, text, image:image||null, link:link||null,
      likes:0, comments:0, reposts:0, tags:[ticker]
    };
    setPosts(prev=>[localPost,...prev]);
    setNewPostId(localId);
    setTimeout(()=>setNewPostId(null), 1500);
    showPoints(POINT_ACTIONS.post, lang==="en"?"Post published! ð":"Â¡Post publicado! ð");

    // 2. Guardar en Supabase (con 1 reintento automÃ¡tico si falla)
    if(user?.id && user.id!=="local"){
      const tryInsert = async () => {
        // Solo escribimos a "content" â columna original y segura
        const payload = {
          user_id:   user.id,
          content:   text,
          ticker:    ticker  || "GENERAL",
          sentiment: sentiment || "bull",
          tags:      [ticker || "GENERAL"],
          user_name: user.username || user.name || user.email?.split("@")[0] || "Trader",
          likes_count:    0,
          comments_count: 0,
          reposts_count:  0,
        };
        if(image) payload.image_url = image;
        if(link) payload.link_url = link;
        const {data,error}=await supabase.from("posts").insert(payload).select().single();
        return {data,error};
      };
      try{
        let {data,error} = await tryInsert();
        // Si falla, espera 2s y reintenta una vez mÃ¡s
        if(error){
          console.error("Post error (1er intento):", error?.code, error?.message, error?.details);
          window.__lastPostError = error;
          await new Promise(r=>setTimeout(r,2000));
          const retry = await tryInsert();
          data  = retry.data;
          error = retry.error;
        }
        if(!error && data){
          // 3. Reemplazar el post temporal con el real (con UUID de la BD)
          setPosts(prev=>prev.map(p=>
            p.id===localId ? {...localPost, id:data.id, _confirmed:true} : p
          ));
          setNewPostId(data.id);
          setTimeout(()=>setNewPostId(null), 800);
        } else {
          // Ambos intentos fallaron â marcar como no guardado
          console.error("Post no guardado (2do intento):", error?.code, error?.message, error?.details);
          window.__lastPostError = error;
          const errMsg = error?.message || error?.code || "unknown";
          setPosts(prev=>prev.map(p=>p.id===localId?{...p,_failed:true,_errMsg:errMsg}:p));
        }
      }catch(e){
        console.error("Post exception:", e);
        setPosts(prev=>prev.map(p=>p.id===localId?{...p,_failed:true}:p));
      }
    }
  };

  const filtered = sent==="all"?posts:posts.filter(p=>p.sentiment===sent);

  // ââ Replicar (repost) âââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const handleRepost = async (postId, isReposting) => {
    try {
      // Actualiza el contador en Supabase
      const { data: current } = await supabase.from("posts").select("reposts_count").eq("id", postId).single();
      const newCount = Math.max(0, (current?.reposts_count || 0) + (isReposting ? 1 : -1));
      await supabase.from("posts").update({ reposts_count: newCount }).eq("id", postId);
      // Actualiza localmente tambiÃ©n
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, reposts: newCount } : p));
    } catch(e) { console.error("Error repost:", e); }
  };

  // VIP definitivo: admin emails siempre tienen acceso sin importar el state
  const effectivePremium = isPremium || ADMIN_EMAILS.includes(user?.email || '');

  const renderPage = () => {
    if(tickerPage) return <TickerPage ticker={tickerPage} posts={posts} onClose={()=>setTickerPage(null)} lang={lang} user={user} onPost={addPost} onNeedAuth={()=>setAuth("register")} isPremium={effectivePremium} onNeedPremium={()=>setPage(8)} onRepost={handleRepost}/>;
    if(page===1) return <TopsPage posts={posts}/>;
    if(page===2||page===4) return(
      <div style={{textAlign:"center",padding:"60px 20px"}}>
        <div style={{fontSize:48,marginBottom:16}}>ð§</div>
        <h2 style={{color:C.text,fontWeight:800,marginBottom:8}}>{page===2?"Crypto":"Macro"}</h2>
        <p style={{color:C.muted,fontSize:15}}>Esta secciÃ³n estarÃ¡ disponible muy pronto.<br/>Mientras tanto, explora el feed principal.</p>
        <button onClick={()=>setPage(0)} style={{marginTop:24,background:C.accent,color:"#fff",border:"none",borderRadius:10,padding:"10px 28px",fontWeight:700,fontSize:14,cursor:"pointer"}}>â Volver al Feed</button>
      </div>
    );
    if(page===3) return <AccionesVIPPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)} isAdmin={ADMIN_EMAILS.includes(user?.email||'')}/>;
    if(page===5) return <NoticiasPage lang={lang}/>;
    if(page===6) return <EarningsPage lang={lang}/>;
    if(page===7) return <TrendingPage posts={posts}/>;
    if(page===8) return <PremiumPage user={user} isPremium={effectivePremium} isPro={isPro} onSubscribe={()=>{}} onNeedAuth={()=>setAuth("login")} lang={lang}/>;
    if(page===9) return <VipToolsPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)} posts={posts} user={user} lang={lang}/>;
    if(page===11) return <WebinarsPage user={user} isPremium={effectivePremium} onNeedAuth={()=>setAuth("register")} onGoVip={()=>setPage(8)}/>;
    if(page===12) return <AcademiaPage user={user} isPremium={effectivePremium} onNeedAuth={()=>setAuth("register")} onGoVip={()=>setPage(8)}/>;
    if(page===14) return <EconCalendarPage/>;
    if(page===18) return <CommoditiesPage/>;
    if(page===20) return <FlowPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)}/>;
    if(page===21) return <IdeasPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)}/>;
    if(page===22) return <MessagesPage user={user} following={following} supabaseClient={supabase} onNeedAuth={()=>setAuth("register")} initialChat={dmTarget} />;
    if(page===15) return <DividendCalendarPage/>;
    if(page===16) return <IpoCalendarPage/>;
    if(page===17) return <ScreenerPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)}/>;
    if(page===19) return <GurusPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)}/>;
    if(page===35) return <CongressTradesPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)} lang={lang}/>;
    if(page===36) return <AdvancedScreenerPage isPremium={effectivePremium} onNeedPremium={()=>setPage(8)} lang={lang}/>;
    if(page===30) return <AboutPage onBack={()=>setPage(0)} lang={lang}/>;
    if(page===31) return <TermsPage onBack={()=>setPage(0)} lang={lang}/>;
    if(page===32) return <PrivacyPage onBack={()=>setPage(0)} lang={lang}/>;
    if(page===33) return <RiskPage onBack={()=>setPage(0)} lang={lang}/>;
    if(page===34) return <GuidelinesPage onBack={()=>setPage(0)} lang={lang}/>;
    if(page===99) return ADMIN_EMAILS_CONST.includes(user?.email||"") ? <AdminDashboard/> : null;
    return(
      <>
        {/* Feed tabs */}
        <div style={{background:"#FFFFFF",border:"1px solid rgba(15,23,42,0.09)",borderRadius:14,padding:"0 12px",marginBottom:12,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",display:"flex",gap:0,alignItems:"center",overflowX:"auto"}}>
          {[
            {v:"all",   l:lang==="en"?"ð  For You":"ð  Para Ti"},
            {v:"bull",  l:lang==="en"?"ð Bullish":"ð Alcistas"},
            {v:"bear",  l:lang==="en"?"ð Bearish":"ð Bajistas"},
            {v:"crypto",l:lang==="en"?"â¿ Crypto":"â¿ Cripto"},
            {v:"stocks",l:lang==="en"?"ð¦ Stocks":"ð¦ Acciones"},
            {v:"viral", l:"ð¥ Viral"},
          ].map(({v,l})=>(
            <button key={v} onClick={()=>setSent(v)}
              style={{background:"transparent",border:"none",borderBottom:`2.5px solid ${sent===v?"#00A8FF":"transparent"}`,padding:"13px 14px",cursor:"pointer",color:sent===v?"#00A8FF":"#64748B",fontSize:13,fontWeight:sent===v?700:500,transition:"all 0.15s",whiteSpace:"nowrap",flexShrink:0}}>
              {l}
            </button>
          ))}
          {tickerFilter&&(
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,background:"rgba(0,168,255,0.08)",border:"1px solid rgba(0,168,255,0.25)",borderRadius:20,padding:"4px 12px",flexShrink:0}}>
              <span style={{color:"#00A8FF",fontWeight:800,fontSize:12}}>${tickerFilter}</span>
              <button onClick={()=>setTickerFilter(null)} style={{background:"none",border:"none",color:"#94A3B8",cursor:"pointer",fontSize:13,lineHeight:1}}>â</button>
            </div>
          )}
          <span style={{marginLeft:tickerFilter?"4px":"auto",color:"#94A3B8",fontSize:11,whiteSpace:"nowrap",flexShrink:0,paddingRight:4}}>{filtered2.length} posts</span>
        </div>
        <NewPost user={user} onPost={addPost} onNeedAuth={()=>setAuth("register")} lang={lang}/>
        {/* Banner de error de conexiÃ³n */}
        {feedError && (
          <div style={{margin:"4px 0 12px",padding:"14px 16px",background:"rgba(220,38,38,0.06)",border:"1px solid rgba(220,38,38,0.2)",borderRadius:12,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:22}}>â ï¸</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"#DC2626"}}>{lang==="en"?"Connection error":"Sin conexiÃ³n al servidor"}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{lang==="en"?"Could not load posts. Check your internet connection.":"No pudimos cargar los posts. Revisa tu conexiÃ³n a internet."}</div>
            </div>
            <button onClick={()=>window.location.reload()} style={{background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:8,padding:"6px 12px",color:"#DC2626",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>ð {lang==="en"?"Retry":"Reintentar"}</button>
          </div>
        )}
        {/* Skeleton mientras carga el feed por primera vez */}
        {!dbReady && !feedError && filtered2.length===0 && (
          <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
            {[1,2,3].map(i=>(
              <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 18px",boxShadow:C.shadow}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:C.card2,animation:"nexo-pulse 1.5s infinite"}}/>
                  <div style={{flex:1}}>
                    <div style={{height:12,width:"35%",background:C.card2,borderRadius:6,marginBottom:6,animation:"nexo-pulse 1.5s infinite"}}/>
                    <div style={{height:10,width:"20%",background:C.card2,borderRadius:6,animation:"nexo-pulse 1.5s infinite"}}/>
                  </div>
                </div>
                <div style={{height:12,background:C.card2,borderRadius:6,marginBottom:6,animation:"nexo-pulse 1.5s infinite"}}/>
                <div style={{height:12,width:"80%",background:C.card2,borderRadius:6,marginBottom:6,animation:"nexo-pulse 1.5s infinite"}}/>
                <div style={{height:12,width:"60%",background:C.card2,borderRadius:6,animation:"nexo-pulse 1.5s infinite"}}/>
              </div>
            ))}
          </div>
        )}
        {/* Empty state cuando hay 0 posts (pero DB cargÃ³) */}
        {dbReady && filtered2.length===0 && !feedError && (
          <div style={{textAlign:"center",padding:"48px 20px",background:C.card,border:`1px dashed ${C.border}`,borderRadius:16,marginTop:8}}>
            <div style={{fontSize:40,marginBottom:12}}>ð</div>
            <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>
              {sent!=="all" ? (lang==="en"?"No posts with this filter yet":"Sin posts con este filtro aÃºn") : (lang==="en"?"Be the first to post!":"Â¡SÃ© el primero en publicar!")}
            </div>
            <div style={{fontSize:13,color:C.muted}}>
              {lang==="en"?"Share your market analysis and connect with traders worldwide.":"Comparte tu anÃ¡lisis del mercado y conecta con traders de todo el mundo."}
            </div>
          </div>
        )}
        {filtered2.map((p,i)=>(
          <div key={p.id}>
            <PostCard post={p} onProfile={setProfUser} onPoints={showPoints} onTickerClick={(tk)=>setTickerPage(tk)} lang={lang} isNew={p.id===newPostId} onRepost={handleRepost} user={user} onNeedAuth={()=>setAuth("register")} following={following} onFollow={toggleFollow} onDM={(target)=>{setDmTarget(target);setPage(22);}} onDelete={(id)=>setPosts(prev=>prev.filter(x=>x.id!==id))}/>
            {/* Mini-banner afiliado contextual cada 3 posts (segÃºn el ticker del post) */}
            {(i+1)%3===0 && (()=>{
              const contextAffs = AFFILIATE_BY_TICKER(p.ticker||"");
              const aff = contextAffs[(Math.floor(i/3))%contextAffs.length];
              if(!aff) return null;
              return(
                <a key={"aff-"+i} href={aff.url} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:10,background:"#F8FAFC",border:"1px solid rgba(15,23,42,0.08)",borderRadius:12,padding:"10px 14px",margin:"6px 0",textDecoration:"none",transition:"all 0.15s",cursor:"pointer"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=aff.color+"55";e.currentTarget.style.background=aff.color+"08";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(15,23,42,0.08)";e.currentTarget.style.background="#F8FAFC";}}>
                  <div style={{width:34,height:34,borderRadius:9,background:aff.color+"18",border:`1px solid ${aff.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{aff.logo}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:1}}>
                      <span style={{fontWeight:700,fontSize:12,color:"#0F172A"}}>{aff.name}</span>
                      <span style={{fontSize:9,color:"#94A3B8",background:"rgba(15,23,42,0.05)",borderRadius:20,padding:"1px 7px",fontWeight:600}}>Patrocinado</span>
                    </div>
                    <div style={{fontSize:11,color:"#64748B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{aff.tagline}</div>
                  </div>
                  <span style={{fontSize:11,color:aff.color,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{aff.badge} â</span>
                </a>
              );
            })()}
            {/* Post patrocinado completo cada 8 posts */}
            {(i+1)%8===0 && SPONSORED_POSTS[(Math.floor(i/8))%SPONSORED_POSTS.length] && (
              <SponsoredPostCard sp={SPONSORED_POSTS[(Math.floor(i/8))%SPONSORED_POSTS.length]}/>
            )}
            {/* AdSense banner cada 6 posts */}
            {(i+1)%6===0 && <>{<AdBannerFeed/>}<MediaNetBannerFeed/></>}
            {!effectivePremium && (i+1)%5===0 && (
              <VipFeedCard onGoVIP={()=>setPage(8)}/>
            )}
          </div>
        ))}
      </>
    );
  };

  const [showLanding, setShowLanding] = useState(false); // Feed visible siempre, sin obligar registro
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tickerFilter, setTickerFilter] = useState(null);
  const [tickerPage,  setTickerPage]   = useState(null); // pÃ¡gina completa de ticker (@META)

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
  const CRYPTO_TICKERS = new Set(["BTC","ETH","SOL","BNB","DOGE","XRP","ADA","AVAX","MATIC","LINK","COIN","MSTR","IBIT"]);
  const STOCK_TICKERS  = new Set(["AAPL","MSFT","GOOGL","AMZN","NVDA","TSLA","META","SPY","AMD","NFLX","JPM","V","BABA"]);
  const filtered2 = (()=>{
    let base = filteredByTicker;
    if(sent==="bull")   base = base.filter(p=>p.sentiment==="bull");
    else if(sent==="bear")   base = base.filter(p=>p.sentiment==="bear");
    else if(sent==="crypto") base = base.filter(p=>CRYPTO_TICKERS.has(p.ticker?.toUpperCase()));
    else if(sent==="stocks") base = base.filter(p=>STOCK_TICKERS.has(p.ticker?.toUpperCase()));
    else if(sent==="viral")  base = [...base].sort((a,b)=>(b.likes||0)+(b.comments||0)-(a.likes||0)-(a.comments||0));
    return base;
  })();
  const showingMockData = false; // ya no usamos mock posts

  return(
    <PriceProvider>
    <style>{`
      /* ââ LIGHT MODE (default) ââ */
      :root, [data-dark="false"] {
        --c-bg:         #F4F6FB;
        --c-surface:    #FFFFFF;
        --c-card:       #FFFFFF;
        --c-card2:      #F8FAFD;
        --c-border:     rgba(15,23,42,0.08);
        --c-text:       #0F172A;
        --c-muted:      #64748B;
        --c-muted2:     #94A3B8;
        --c-glass:      rgba(255,255,255,0.90);
        --c-glassBorder:rgba(15,23,42,0.08);
        --c-shadow:     0 2px 12px rgba(0,0,0,0.06);
        --c-shadowMd:   0 8px 32px rgba(0,0,0,0.09);
        --c-nav:        #FFFFFF;
        --c-navBorder:  rgba(15,23,42,0.07);
        --c-inputBg:    #F8FAFC;
        --c-inputBorder:rgba(15,23,42,0.10);
      }
      /* ââ DARK MODE ââ */
      [data-dark="true"] {
        --c-bg:         #080D18;
        --c-surface:    #0F1623;
        --c-card:       #141C2E;
        --c-card2:      #1A2236;
        --c-border:     rgba(255,255,255,0.07);
        --c-text:       #E8EDF5;
        --c-muted:      #8892A4;
        --c-muted2:     #5A6478;
        --c-glass:      rgba(14,20,35,0.92);
        --c-glassBorder:rgba(255,255,255,0.08);
        --c-shadow:     0 2px 12px rgba(0,0,0,0.35);
        --c-shadowMd:   0 8px 32px rgba(0,0,0,0.45);
        --c-nav:        #0C1220;
        --c-navBorder:  rgba(255,255,255,0.06);
        --c-inputBg:    rgba(255,255,255,0.04);
        --c-inputBorder:rgba(255,255,255,0.10);
      }
      [data-dark="true"] body,
      [data-dark="true"] { color-scheme: dark; }

      /* Cards auto-dark */
      [data-dark="true"] .nexo-card-auto {
        background: var(--c-card) !important;
        border-color: var(--c-border) !important;
        color: var(--c-text) !important;
      }
      /* Scrollbar dark */
      [data-dark="true"] ::-webkit-scrollbar-thumb { background: rgba(0,168,255,0.18); }

      @media (min-width: 1024px) {
        .nexo-body-grid { grid-template-columns: 240px minmax(0,1fr) 300px !important; }
      }
      @media (min-width: 768px) and (max-width: 1023px) {
        .nexo-body-grid { grid-template-columns: minmax(0,1fr) 280px !important; }
        .nexo-left-sidebar { display: none !important; }
      }
      @media (max-width: 767px) {
        /* ââ LAYOUT BASE ââ */
        .nexo-sidebar { display: none !important; }
        .nexo-left-sidebar { display: none !important; }
        .nexo-mobile-affiliate-banner { display: flex !important; }
        body { padding-bottom: 130px; }
        .nexo-body-grid {
          padding: 6px 8px !important;
          gap: 8px !important;
          grid-template-columns: 1fr !important;
        }

        /* ââ NAVBAR ââ */
        .nexo-nav-search { display: none !important; }
        .nexo-mobile-search { display: flex !important; }
        .nexo-nav-icons { gap: 2px !important; }
        .nexo-nav-icons > button { width: 34px !important; height: 34px !important; }
        .nexo-auth-btns { display: flex !important; gap: 3px !important; align-items: center !important; }
        .nexo-auth-btns button { width: auto !important; height: auto !important; padding: 5px 9px !important; font-size: 11px !important; white-space: nowrap !important; border-radius: 8px !important; }
        .nexo-logo-text { display: none !important; }
        .nexo-logo-img { height: 36px !important; }
        .nexo-usermenu-dropdown { right: 0 !important; left: auto !important; min-width: 180px !important; max-width: calc(100vw - 16px) !important; }
        .nexo-usermenu-trigger { padding: 2px !important; border: none !important; background: transparent !important; gap: 2px !important; border-radius: 50% !important; }
        .nexo-usermenu-arrow { display: none !important; }
        .nexo-btn-alerts { display: flex !important; }
        .nexo-hide-mobile { display: none !important; }
        .nexo-logout-mobile { display: flex !important; }

        /* ââ TABS ââ */
        .nexo-tabs { justify-content: flex-start !important; }
        .nexo-tabs button { padding: 10px 10px !important; font-size: 11px !important; }

        /* ââ MARKET CARDS scroll horizontal ââ */
        .nexo-market-grid {
          display: flex !important; flex-wrap: nowrap !important;
          overflow-x: auto !important; -webkit-overflow-scrolling: touch !important;
          scroll-snap-type: x mandatory !important;
          gap: 8px !important; padding: 10px 8px !important; scrollbar-width: none !important;
        }
        .nexo-market-grid::-webkit-scrollbar { display: none !important; }
        .nexo-market-grid > a { min-width: 100px !important; flex-shrink: 0 !important; scroll-snap-align: start !important; }

        /* ââ LANDING HERO ââ */
        .nexo-landing-mockup { display: none !important; }

        /* ââ PREMIUM PAGE ââ */
        .nexo-premium-grid { grid-template-columns: 1fr !important; }
        .nexo-trust-badges { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }

        /* ââ GRIDS GENERALES 2 columnas â 1 columna en mÃ³vil ââ */
        /* PostCard mÃ©tricas */
        .nexo-post-metrics { flex-wrap: wrap !important; gap: 4px !important; }
        /* Ideas grid */
        .nexo-ideas-grid { grid-template-columns: 1fr !important; }
        /* Gurus grid */
        .nexo-gurus-grid { grid-template-columns: 1fr !important; }

        /* ââ MESSAGES PAGE ââ */
        .nexo-messages-wrapper { height: calc(100vh - 110px) !important; border-radius: 16px !important; }
        .nexo-messages-grid {
          grid-template-columns: 1fr !important;
          grid-template-rows: 42vh 1fr !important;
          height: auto !important;
        }
        .nexo-messages-list {
          border-right: none !important;
          border-bottom: 1px solid rgba(139,92,246,0.15) !important;
          max-height: 42vh !important;
        }
        .nexo-messages-chat { min-height: 44vh !important; }
        .nexo-msg-btn-text { display: none !important; }

        /* ââ PROFILE PAGE ââ */
        .nexo-profile-stats { grid-template-columns: repeat(3,1fr) !important; gap: 6px !important; }

        /* ââ SCREENER â scroll horizontal forzado ââ */
        .nexo-screener-table { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
        .nexo-screener-table > div { min-width: 640px !important; }

        /* ââ SEÃALES / SIGNALS grid â 1 col ââ */
        .nexo-signals-grid { grid-template-columns: 1fr !important; gap: 8px !important; }

        /* ââ WEBINARS / ACADEMIA grid â 1 col ââ */
        .nexo-webinars-grid { grid-template-columns: 1fr !important; }
        .nexo-courses-grid  { grid-template-columns: 1fr !important; }

        /* ââ FEATURES landing â 1 col ââ */
        .nexo-features-grid { grid-template-columns: 1fr !important; }

        /* ââ GENERAL: evitar overflow en cualquier container ââ */
        * { max-width: 100% !important; box-sizing: border-box !important; }
        img { max-width: 100% !important; height: auto !important; }

        /* ââ Padding/margin reducidos en mÃ³vil ââ */
        .nexo-page-pad { padding: 12px 8px !important; }
        .nexo-card-pad { padding: 12px 12px !important; }

        /* ââ Fix overflow en hero del landing ââ */
        .nexo-hero-section { padding: 32px 16px 28px !important; }
        .nexo-hero-section h1 { font-size: 28px !important; letter-spacing: -1px !important; }
        .nexo-hero-cta { max-width: 100% !important; font-size: 15px !important; padding: 15px 20px !important; }

        /* ââ Fix flex items que se salen ââ */
        .nexo-post-header { flex-wrap: wrap !important; gap: 4px !important; }
        .nexo-action-row { gap: 0 !important; }
        .nexo-action-row button { padding: 5px 8px !important; font-size: 11px !important; }

        /* ââ Modales full screen en mÃ³vil ââ */
        .nexo-modal-inner {
          width: 100% !important; max-width: 100% !important;
          min-width: 0 !important; border-radius: 20px 20px 0 0 !important;
          position: fixed !important; bottom: 0 !important; left: 0 !important;
          max-height: 90vh !important; overflow-y: auto !important;
        }

        /* ââ Fix ideas/gurus cards en mÃ³vil ââ */
        .nexo-blur-lock { position: static !important; }
        .nexo-blur-lock > div:first-child { filter: blur(4px) !important; }

        /* ââ Ticker strip mÃ¡s compacto ââ */
        .nexo-ticker-strip { font-size: 11px !important; }
        .nexo-ticker-strip > div { padding: 0 12px !important; }
      }
      @media (min-width: 768px) {
        .nexo-logout-mobile { display: none !important; }
      }
      @keyframes nexo-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
      @keyframes nexo-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes nexo-slidein { from{transform:translateX(-30px);opacity:0} to{transform:translateX(0);opacity:1} }
      html, body {
        overflow-x: hidden !important;
        overflow-y: scroll !important;
        -webkit-overflow-scrolling: touch !important;
        max-width: 100vw !important;
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
    <div data-dark={String(darkMode)} style={{minHeight:"100vh",background:"var(--c-bg)",color:"var(--c-text)",fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,sans-serif",transition:"background 0.25s,color 0.25s",overflowX:"hidden"}}>
      <TickerTape/>

      {/* ââ BANNER NEWSLETTER â solo para visitantes sin cuenta ââ */}
      {!user && showNewsletter && !newsletterDone && (
        <div style={{background:"linear-gradient(90deg,#0F172A 0%,#1E293B 100%)",borderBottom:"1px solid rgba(0,168,255,0.2)",padding:"10px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
          <span style={{fontSize:16,flexShrink:0}}>ð</span>
          <span style={{color:"#E2E8F0",fontSize:13,fontWeight:600,flexShrink:0}}>AnÃ¡lisis de mercado gratis cada semana:</span>
          <div style={{display:"flex",gap:8,alignItems:"center",flex:"1 1 260px",maxWidth:400}}>
            <input
              type="email"
              value={newsletterEmail}
              onChange={e=>setNewsletterEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(0,168,255,0.3)",borderRadius:8,padding:"7px 12px",color:"#F1F5F9",fontSize:13,outline:"none",minWidth:0}}
              onKeyDown={e=>{if(e.key==="Enter"&&newsletterEmail.includes("@")){
                supabase.from("newsletter_subscribers").insert({email:newsletterEmail,created_at:new Date().toISOString()}).then(()=>{});
                fetch("/api/newsletter-welcome",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:newsletterEmail})}).catch(()=>{});
                setNewsletterDone(true);
              }}}
            />
            <button
              onClick={async()=>{
                if(!newsletterEmail.includes("@")) return;
                await supabase.from("newsletter_subscribers").insert({email:newsletterEmail,created_at:new Date().toISOString()}).catch(()=>{});
                fetch("/api/newsletter-welcome",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:newsletterEmail})}).catch(()=>{});
                setNewsletterDone(true);
              }}
              style={{background:"#00A8FF",border:"none",borderRadius:8,padding:"7px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
              Suscribirme â
            </button>
          </div>
          <button onClick={()=>{setShowNewsletter(false);sessionStorage.setItem("nexo-newsletter-dismissed","1");}}
            style={{background:"none",border:"none",color:"#475569",fontSize:18,cursor:"pointer",lineHeight:1,flexShrink:0,marginLeft:4}}>Ã</button>
        </div>
      )}
      {!user && newsletterDone && (
        <div style={{background:"linear-gradient(90deg,#052e16,#14532d)",borderBottom:"1px solid rgba(0,200,100,0.2)",padding:"10px 16px",textAlign:"center",color:"#86efac",fontSize:13,fontWeight:700}}>
          â Â¡Listo! Te avisaremos cada lunes con el anÃ¡lisis de la semana.
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{background:"var(--c-nav)",borderBottom:"1px solid var(--c-navBorder)",padding:"0 12px",position:"sticky",top:0,zIndex:100,boxShadow:"var(--c-shadow)",width:"100%",boxSizing:"border-box",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,height:58,maxWidth:1200,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

          {/* Logo â integrado al navbar */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0,cursor:"pointer"}} onClick={()=>{setPage(0);setShowLanding(!user);}}>
            <img src="/logo_nexo.png" alt="NEXO TRADE" className="nexo-logo-img"
              style={{height:54,width:"auto",objectFit:"contain",borderRadius:8,display:"block"}}
              onError={e=>{e.target.style.display="none";}}/>
            <div className="nexo-logo-text" style={{display:"flex",flexDirection:"column",lineHeight:1.15}}>
              <span style={{fontWeight:900,fontSize:22,color:"var(--c-text)",letterSpacing:-0.5}}>NEXO<span style={{color:"#00A8FF"}}>TRADE</span></span>
              <span style={{fontSize:10,fontWeight:600,color:"var(--c-muted2)",letterSpacing:1.5,textTransform:"uppercase"}}>AI Trading Community</span>
            </div>
          </div>

          {/* Search â centrado */}
          <div className="nexo-nav-search" style={{flex:1,display:"flex",justifyContent:"center",maxWidth:460,minWidth:0}}><SearchBar lang={lang} posts={posts} users={MOCK_USERS} onTickerNav={(tk)=>{setTickerPage(tk);setShowLanding(false);}} onUserNav={(u)=>setProfUser(u)} onPostNav={(p)=>{setSent("all");setPage(0);}}/></div>

          {/* Right â iconos estilo Socimo */}
          <div className="nexo-nav-icons" style={{display:"flex",gap:4,alignItems:"center",flexShrink:0,marginLeft:"auto"}}>

            {/* Home */}
            <button onClick={()=>{setPage(0);setShowLanding(false);}}
              title="Inicio â PÃ¡gina principal"
              style={{width:40,height:40,borderRadius:11,border:`2px solid ${page===0?"#00A8FF":"rgba(0,168,255,0.25)"}`,background:page===0?"rgba(0,168,255,0.15)":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#00A8FF",transition:"all 0.15s",boxShadow:page===0?"0 0 14px rgba(0,168,255,0.28)":"none"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,168,255,0.15)";e.currentTarget.style.boxShadow="0 0 14px rgba(0,168,255,0.25)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=page===0?"rgba(0,168,255,0.15)":"transparent";e.currentTarget.style.boxShadow=page===0?"0 0 14px rgba(0,168,255,0.28)":"none";}}>
              <IcoHome/>
            </button>

            {/* IA */}
            <button onClick={()=>setShowAI(true)}
              title="IA de NexoTrade"
              style={{width:38,height:38,borderRadius:11,border:"1.5px solid rgba(0,168,255,0.25)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#00A8FF",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,168,255,0.12)";e.currentTarget.style.borderColor="rgba(0,168,255,0.5)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(0,168,255,0.25)";}}>
              <IcoBot/>
            </button>

            {/* Alertas */}
            <button className="nexo-btn-alerts" onClick={()=>setAlerts(true)}
              title="Alertas"
              style={{width:38,height:38,borderRadius:11,border:"1.5px solid rgba(0,168,255,0.25)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#00A8FF",position:"relative",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,168,255,0.12)";e.currentTarget.style.borderColor="rgba(0,168,255,0.5)";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(0,168,255,0.25)";}}>
              <IcoBell/>
              {alertCount>0&&<span style={{position:"absolute",top:-3,right:-3,minWidth:16,height:16,background:"#EF4444",borderRadius:"50%",border:"2px solid var(--c-nav,#fff)",fontSize:9,fontWeight:900,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px",animation:"nexo-pulse 2s infinite"}}>{alertCount}</span>}
            </button>

            {/* Dark mode toggle */}
            <button onClick={()=>setDarkMode(!darkMode)}
              title={darkMode ? "Modo claro" : "Modo oscuro"}
              style={{width:38,height:38,borderRadius:11,border:`1.5px solid ${darkMode?"rgba(250,204,21,0.45)":"rgba(100,116,139,0.22)"}`,background:darkMode?"rgba(250,204,21,0.07)":"rgba(100,116,139,0.05)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:darkMode?"#FCD34D":"#64748B",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=darkMode?"rgba(250,204,21,0.15)":"rgba(100,116,139,0.12)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=darkMode?"rgba(250,204,21,0.07)":"rgba(100,116,139,0.05)";}}>
              {darkMode ? <IcoSun/> : <IcoMoon/>}
            </button>

            {/* Settings panel */}
            <button onClick={()=>setShowSettings(true)}
              title="ConfiguraciÃ³n"
              style={{width:38,height:38,borderRadius:11,border:`1.5px solid ${showSettings?"rgba(0,168,255,0.6)":"rgba(0,168,255,0.2)"}`,background:showSettings?"rgba(0,168,255,0.13)":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#00A8FF",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,168,255,0.12)";e.currentTarget.style.borderColor="rgba(0,168,255,0.5)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=showSettings?"rgba(0,168,255,0.13)":"transparent";e.currentTarget.style.borderColor=showSettings?"rgba(0,168,255,0.6)":"rgba(0,168,255,0.2)";}}>
              <IcoSettings/>
            </button>

            {/* Idioma */}
            <span className="nexo-hide-mobile"><LangSelector lang={lang} setLang={setLang}/></span>

            {/* Auth / User */}
            {user
              ? <UserMenu user={user} onLogout={async()=>{
  saveUser(null);
  setIsPremium(false);
  setIsPro(false);
  setPage(0);
  setShowLanding(false);
  localStorage.clear();
  sessionStorage.clear();
  try{ await supabase.auth.signOut(); }catch(e){}
  window.location.replace("/");
}} onProfile={setProfUser} onAlerts={()=>setAlerts(true)} onAdmin={()=>setPage(99)} lang={lang}/>
              : <div className="nexo-auth-btns"><Btn variant="ghost" small onClick={()=>setAuth("login")}>{t.login}</Btn><Btn small onClick={()=>setAuth("register")}>{t.register}</Btn></div>
            }
          </div>
        </div>
        {/* Tabs â bigger, professional */}
        <div className="nexo-tabs" style={{display:"flex",gap:0,borderTop:"1px solid var(--c-border)",overflowX:"auto",maxWidth:1180,margin:"0 auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}}>
          {NAV_ITEMS(t, lang==="en").map(n=>{
            if(n.premium){
              const active=page===n.idx;
              return(
                <button key={n.idx} onClick={()=>{setPage(n.idx);setShowLanding(false);setTickerFilter(null);}}
                  style={{background:active?"linear-gradient(135deg,#7C3AED,#9333EA)":"transparent",border:active?"none":"1px solid rgba(124,58,237,0.35)",borderBottom:"none",borderRadius:20,margin:"6px 6px 6px auto",padding:"6px 16px",cursor:"pointer",color:active?"#fff":"#A78BFA",fontSize:13,fontWeight:800,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5,letterSpacing:0.3,boxShadow:active?"0 0 18px rgba(124,58,237,0.4)":"none",transition:"all 0.2s"}}>
                  â¦ Premium
                </button>
              );
            }
            return(
              <button key={n.idx} onClick={()=>{setPage(n.idx);setShowLanding(false);setTickerFilter(null);}}
                style={{background:"transparent",border:"none",borderBottom:`2.5px solid ${page===n.idx?"#00A8FF":"transparent"}`,margin:"0",padding:"13px 20px",cursor:"pointer",color:page===n.idx?"#00A8FF":"var(--c-muted)",fontSize:14,fontWeight:page===n.idx?700:500,whiteSpace:"nowrap",transition:"all 0.18s",letterSpacing:0.1,display:"flex",alignItems:"center",gap:5,fontFamily:"inherit"}}
                onMouseEnter={e=>{if(page!==n.idx){e.currentTarget.style.color="#00A8FF";e.currentTarget.style.background="rgba(0,168,255,0.04)";}}}
                onMouseLeave={e=>{if(page!==n.idx){e.currentTarget.style.color="var(--c-muted)";e.currentTarget.style.background="transparent";}}}>
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* TICKER STRIP â barra de precios en tiempo real */}
      <TickerStrip/>

      {/* HERO LANDING */}
      {showLanding && page===0 && (
        <div>

        {/* ââ HERO ââ */}
        <div style={{background:`linear-gradient(135deg,#0B1A2E 0%,#0D2244 50%,#0B1A2E 100%)`,borderBottom:`1px solid rgba(0,168,255,0.15)`,padding:"64px 20px 56px",overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at 20% 50%,#00D26A08,transparent 50%),radial-gradient(circle at 80% 30%,#3B8EFA08,transparent 50%)",pointerEvents:"none"}}/>
          <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:48,flexWrap:"wrap",position:"relative"}}>

            {/* LEFT â Text */}
            <div style={{flex:"1 1 300px",minWidth:0}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,210,106,0.1)",border:`1px solid ${C.accent}33`,borderRadius:30,padding:"6px 16px",marginBottom:28}}>
                <span style={{width:7,height:7,borderRadius:"50%",background:C.accent,display:"inline-block",boxShadow:`0 0 10px ${C.accent}`}}/>
                <span style={{color:C.accent,fontSize:11,fontWeight:700,letterSpacing:1.2}}>{lang==="en"?"ð²ð½ð¨ð´ð¦ð· HISPANIC TRADING COMMUNITY":"ð²ð½ð¨ð´ð¦ð· COMUNIDAD HISPANA DE TRADING"}</span>
              </div>
              <h1 style={{fontSize:"clamp(36px,5vw,62px)",fontWeight:900,letterSpacing:-2,lineHeight:1.05,margin:"0 0 18px",color:"#fff"}}>
                {lang==="en"?"Invest smarter.":"Invierte mejor."}<br/>
                <span style={{background:`linear-gradient(90deg,${C.accent} 0%,#3B8EFA 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{lang==="en"?"Learn together.":"Aprende en comunidad."}</span>
              </h1>
              <p style={{fontSize:17,color:"#94a3b8",lineHeight:1.75,margin:"0 0 32px",maxWidth:480}}>
                {lang==="en"
                  ? <>The <strong style={{color:"#fff"}}>Spanish-language</strong> social trading platform where thousands of investors share analysis, weekly picks, and real strategies â powered by AI.</>
                  : <>La plataforma de trading social <strong style={{color:"#fff"}}>en espaÃ±ol</strong> donde miles de inversores comparten anÃ¡lisis, picks semanales y estrategias reales â potenciada por IA.</>
                }
              </p>
              {/* CTA principal â mÃ¡s grande y urgente */}
              <div style={{marginBottom:20}}>
                <button onClick={()=>setAuth("register")}
                  style={{display:"block",width:"100%",maxWidth:420,background:`linear-gradient(135deg,${C.accent} 0%,#00c070 100%)`,border:"none",borderRadius:16,padding:"20px 38px",fontSize:18,fontWeight:900,color:"#000",cursor:"pointer",boxShadow:`0 4px 40px ${C.accent}55, 0 0 0 1px ${C.accent}33`,letterSpacing:0.2,transition:"transform 0.15s, box-shadow 0.15s",textAlign:"center"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 48px ${C.accent}70, 0 0 0 1px ${C.accent}55`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 4px 40px ${C.accent}55, 0 0 0 1px ${C.accent}33`;}}>
                  {lang==="en"?"ð Create free account â 30 seconds":"ð Crear cuenta gratis â 30 segundos"}
                </button>
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,paddingLeft:4}}>
                  <span style={{fontSize:12,color:"#64748b"}}>{lang==="en"?"â No credit card":"â Sin tarjeta de crÃ©dito"}</span>
                  <span style={{fontSize:12,color:"#334155"}}>Â·</span>
                  <span style={{fontSize:12,color:"#64748b"}}>{lang==="en"?"â Cancel anytime":"â Cancela cuando quieras"}</span>
                  <span style={{fontSize:12,color:"#334155"}}>Â·</span>
                  <span style={{fontSize:12,color:"#64748b"}}>{lang==="en"?"â Free forever":"â Gratis para siempre"}</span>
                </div>
              </div>

              {/* Social proof â avatares + contador + estrellas */}
              <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",padding:"14px 16px",background:"rgba(0,210,106,0.05)",border:"1px solid rgba(0,210,106,0.12)",borderRadius:14}}>
                <div style={{display:"flex"}}>
                  {["#00D26A","#3B8EFA","#FFB800","#FF4D6A","#a78bfa"].map((c,i)=>(
                    <div key={i} style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${c},${c}88)`,border:"2.5px solid #0B1020",marginLeft:i>0?-11:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.4)"}}>{["MC","JR","AT","FP","LG"][i]}</div>
                  ))}
                </div>
                <div style={{flex:1}}>
                  <div style={{color:"#fff",fontWeight:800,fontSize:14}}>ð¥ +{animatedCount.toLocaleString("es-MX")} {lang==="en"?"active traders":"traders activos"}</div>
                  <div style={{display:"flex",gap:2,marginTop:2}}>
                    {"â­â­â­â­â­".split("").map((s,i)=><span key={i} style={{fontSize:12}}>{s}</span>)}
                    <span style={{fontSize:11,color:"#94a3b8",marginLeft:4}}>4.9/5 Â· 840+ {lang==="en"?"reviews":"reseÃ±as"}</span>
                  </div>
                </div>
                <button onClick={()=>setShowLanding(false)}
                  style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"8px 16px",fontSize:13,fontWeight:700,color:"#94a3b8",cursor:"pointer",whiteSpace:"nowrap"}}>
                  {lang==="en"?"See feed â":"Ver feed â"}
                </button>
              </div>
            </div>

            {/* RIGHT â Feed Mockup */}
            <div className="nexo-landing-mockup" style={{flex:"0 0 auto",position:"relative",width:370}}>
              <div style={{background:"rgba(15,23,42,0.95)",border:`1px solid rgba(0,210,106,0.2)`,borderRadius:20,padding:"20px",backdropFilter:"blur(20px)",boxShadow:"0 24px 64px rgba(0,0,0,0.7)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,paddingBottom:14,borderBottom:"1px solid #1e293b"}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:C.accent,boxShadow:`0 0 8px ${C.accent}`,display:"inline-block"}}/>
                  <span style={{fontSize:12,color:"#64748b",fontWeight:600}}>{lang==="en"?"Live feed":"Feed en vivo"}</span>
                  <span style={{marginLeft:"auto",fontSize:11,color:"#64748b",background:"#1e293b",padding:"2px 8px",borderRadius:6}}>{lang==="en"?"2 min ago":"hace 2 min"}</span>
                </div>
                {[
                  {u:"SPY_Trader",e:"ð¦",c:"#00D26A",t:"NVDA rompiendo resistencia en $890. Target $950 en 2 semanas. Stop en $860. R:R 3:1 ð",bull:true,likes:47},
                  {u:"CryptoWolf",e:"ðº",c:"#7C3AED",t:"BTC acumulando en $67k. On-chain muestra manos fuertes comprando. Bullish largo plazo. â¿",bull:true,likes:82},
                  {u:"NvidiaChad",e:"ð¦",c:"#F59E0B",t:"TSLA reporta earnings la prÃ³xima semana. Cuidado con la volatilidad. Yo flat hasta el dato ð",bull:false,likes:31},
                ].map((p,i)=>(
                  <div key={i} style={{marginBottom:12,paddingBottom:12,borderBottom:i<2?"1px solid #1e293b":"none"}}>
                    <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${p.c},${p.c}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{p.e}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
                          <span style={{color:"#fff",fontWeight:700,fontSize:12}}>@{p.u}</span>
                          <span style={{background:p.bull?"#10b98122":"#ef444422",color:p.bull?"#10b981":"#ef4444",border:`1px solid ${p.bull?"#10b98144":"#ef444444"}`,borderRadius:4,padding:"0px 5px",fontSize:10,fontWeight:700}}>{p.bull?"ALCISTA":"BAJISTA"}</span>
                        </div>
                        <p style={{margin:"0 0 6px",color:"#94a3b8",fontSize:12,lineHeight:1.5}}>{p.t}</p>
                        <div style={{display:"flex",gap:12}}>
                          <span style={{color:"#475569",fontSize:11}}>â¤ï¸ {p.likes}</span>
                          <span style={{color:"#475569",fontSize:11}}>ð¬ comentar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>setAuth("register")} style={{width:"100%",background:`linear-gradient(135deg,${C.accent},#00a060)`,border:"none",borderRadius:10,padding:"10px",color:"#000",fontWeight:800,fontSize:13,cursor:"pointer",marginTop:4}}>
                  {lang==="en"?"Join to see more â":"Unirme para ver mÃ¡s â"}
                </button>
              </div>
              <div style={{position:"absolute",top:-12,right:-12,background:"rgba(15,23,42,0.97)",border:"1px solid #10b98144",borderRadius:12,padding:"10px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
                <div style={{fontSize:10,color:"#64748b",fontWeight:600}}>NVDA</div>
                <div style={{fontSize:18,fontWeight:900,color:"#10b981"}}>+2.8%</div>
              </div>
              <div style={{position:"absolute",bottom:-12,left:-12,background:"rgba(15,23,42,0.97)",border:"1px solid #7C3AED44",borderRadius:12,padding:"10px 14px",boxShadow:"0 8px 24px rgba(0,0,0,0.5)"}}>
                <div style={{fontSize:10,color:"#64748b",fontWeight:600}}>{lang==="en"?"VIP this week":"VIP esta semana"}</div>
                <div style={{fontSize:13,fontWeight:800,color:"#a78bfa"}}>{lang==="en"?"â¦ 10 picks ready":"â¦ 10 picks listos"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ââ FEATURES ââ */}
        <div style={{background:"#080e1a",padding:"56px 20px",borderBottom:"1px solid #0f172a"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:44}}>
              <h2 style={{margin:"0 0 12px",color:"#fff",fontSize:"clamp(24px,4vw,38px)",fontWeight:900}}>{lang==="en"?"Everything you need to invest smarter":"Todo lo que necesitas para invertir mejor"}</h2>
              <p style={{margin:0,color:"#64748b",fontSize:15,maxWidth:500,marginLeft:"auto",marginRight:"auto"}}>{lang==="en"?"A complete platform for traders of all levels":"Una plataforma completa para traders de todos los niveles"}</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20}}>
              {(lang==="en" ? [
                {icon:"ð",t:"Traders Feed",d:"See real-time analyses and strategies from thousands of Hispanic investors. Filter by bullish, bearish or trending.",c:"#10b981"},
                {icon:"ð¯",t:"Weekly VIP Picks",d:"Every Monday 9AM: 10 stocks selected by our top-performing traders with proven track records.",c:"#a78bfa"},
                {icon:"ð¤",t:"Trading AI",d:"Chat with our market-specialized AI. Analyze tickers, strategies and risk management.",c:"#3b82f6"},
                {icon:"ð®",t:"Paper Trading",d:"Practice with $100,000 virtual. Compete on the leaderboard and prove your strategy before risking real money.",c:"#f59e0b"},
                {icon:"ð",t:"Academy & Webinars",d:"Recorded courses ($39-$99) and live webinars ($29-$79). Learn technical analysis, crypto, options and more.",c:"#ef4444"},
              ] : [
                {icon:"ð",t:"Feed de Traders",d:"Ve anÃ¡lisis y estrategias en tiempo real de miles de inversores hispanos. Filtra por alcistas, bajistas o trending.",c:"#10b981"},
                {icon:"ð¯",t:"Picks VIP Semanales",d:"Cada lunes 9AM: 10 acciones seleccionadas por nuestros traders con mayor historial de aciertos.",c:"#a78bfa"},
                {icon:"ð¤",t:"IA de Trading",d:"Chatea con nuestra IA especializada en mercados. Analiza tickers, estrategias y gestiÃ³n de riesgo.",c:"#3b82f6"},
                {icon:"ð®",t:"Paper Trading",d:"Practica con $100,000 virtuales. Compite en el leaderboard y demuestra tu estrategia antes de arriesgar.",c:"#f59e0b"},
                {icon:"ð",t:"Academia & Webinars",d:"Cursos grabados ($39-$99) y webinars en vivo ($29-$79). Aprende anÃ¡lisis tÃ©cnico, crypto, opciones y mÃ¡s.",c:"#ef4444"},
              ]).map((f,i)=>(
                <div key={i} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:"24px 20px",transition:"border-color 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=f.c+"66"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#1e293b"}>
                  <div style={{width:44,height:44,borderRadius:12,background:f.c+"18",border:`1px solid ${f.c}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:14}}>{f.icon}</div>
                  <h3 style={{margin:"0 0 8px",color:"#fff",fontSize:15,fontWeight:800}}>{f.t}</h3>
                  <p style={{margin:0,color:"#64748b",fontSize:13,lineHeight:1.6}}>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ââ CÃMO FUNCIONA ââ */}
        <div style={{background:"#0a1020",padding:"56px 20px",borderBottom:"1px solid #0f172a"}}>
          <div style={{maxWidth:900,margin:"0 auto",textAlign:"center"}}>
            <h2 style={{margin:"0 0 8px",color:"#fff",fontSize:"clamp(22px,4vw,36px)",fontWeight:900}}>{lang==="en"?"Get started in 3 steps":"Empieza en 3 pasos"}</h2>
            <p style={{margin:"0 0 44px",color:"#64748b",fontSize:15}}>{lang==="en"?"No credit card. No complications.":"Sin tarjeta de crÃ©dito. Sin complicaciones."}</p>
            <div style={{display:"flex",gap:0,justifyContent:"center",flexWrap:"wrap",position:"relative"}}>
              {(lang==="en" ? [
                {n:"1",icon:"ð",t:"Create your free account",d:"In 30 seconds. Just your email."},
                {n:"2",icon:"ð",t:"Explore the feed",d:"See real trader analyses. Follow the best."},
                {n:"3",icon:"ð°",t:"Start winning",d:"Apply the strategies. Go VIP for exclusive picks."},
              ] : [
                {n:"1",icon:"ð",t:"Crea tu cuenta gratis",d:"En 30 segundos. Solo necesitas un email."},
                {n:"2",icon:"ð",t:"Explora el feed",d:"Ve anÃ¡lisis de traders reales. Sigue a los mejores."},
                {n:"3",icon:"ð°",t:"Empieza a ganar",d:"Aplica las estrategias. Hazte VIP para los picks exclusivos."},
              ]).map((s,i)=>(
                <div key={i} style={{flex:"1 1 220px",maxWidth:280,padding:"0 20px",position:"relative"}}>
                  {i<2&&<div style={{position:"absolute",top:28,right:-10,width:20,height:2,background:"linear-gradient(90deg,#10b981,#3b82f6)",display:"block"}} className="nexo-step-line"/>}
                  <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#3b82f6)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 16px",boxShadow:`0 0 24px ${C.accent}44`}}>{s.icon}</div>
                  <div style={{background:C.accent,color:"#000",borderRadius:"50%",width:20,height:20,fontSize:11,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",margin:"-68px auto 52px",marginLeft:"calc(50% + 12px)"}}>{s.n}</div>
                  <h3 style={{margin:"0 0 8px",color:"#fff",fontSize:15,fontWeight:800}}>{s.t}</h3>
                  <p style={{margin:0,color:"#64748b",fontSize:13,lineHeight:1.5}}>{s.d}</p>
                </div>
              ))}
            </div>
            <button onClick={()=>setAuth("register")} style={{marginTop:44,background:`linear-gradient(135deg,${C.accent},#00a060)`,border:"none",borderRadius:14,padding:"16px 44px",fontSize:16,fontWeight:800,color:"#000",cursor:"pointer",boxShadow:`0 0 32px ${C.accent}44`}}>
              {lang==="en"?"Create free account â it's quick â":"Crear cuenta gratis â es rÃ¡pido â"}
            </button>
          </div>
        </div>

        {/* ââ TESTIMONIOS ââ */}
        <div style={{background:"#080e1a",padding:"56px 20px",borderBottom:"1px solid #0f172a"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <h2 style={{textAlign:"center",margin:"0 0 8px",color:"#fff",fontSize:"clamp(22px,4vw,36px)",fontWeight:900}}>{lang==="en"?"What our traders say":"Lo que dicen nuestros traders"}</h2>
            <p style={{textAlign:"center",margin:"0 0 44px",color:"#64748b",fontSize:15}}>{lang==="en"?"Real investors, real results":"Inversores reales, resultados reales"}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20}}>
              {[
                {n:"MarÃ­a G.",loc:"MÃ©xico",e:"ð¦",c:"#10b981",r:5,t:"Los picks VIP son increÃ­bles. En 3 meses duplicÃ© mi portafolio siguiendo las seÃ±ales. Antes no sabÃ­a ni quÃ© era un stop loss."},
                {n:"Carlos R.",loc:"Colombia",e:"ðº",c:"#7C3AED",r:5,t:"La comunidad es lo mejor. Antes invertÃ­a solo y cometÃ­a muchos errores. AquÃ­ aprendÃ­ anÃ¡lisis tÃ©cnico real de traders con historial probado."},
                {n:"Ana T.",loc:"Argentina",e:"ð¦",c:"#F59E0B",r:5,t:"El webinar de opciones me cambiÃ³ la vida. Ahora genero ingresos extra con covered calls cada mes. Vale cada peso que paguÃ©."},
                {n:"Luis M.",loc:"EspaÃ±a",e:"ð",c:"#3b82f6",r:5,t:"El bot de IA me ayuda a filtrar las mejores oportunidades. Le pregunto sobre cualquier ticker y me da anÃ¡lisis al nivel de un profesional."},
                {n:"Patricia V.",loc:"Miami",e:"ð¦",c:"#ef4444",r:5,t:"El Job Board me consiguiÃ³ trabajo en una firma de trading en 2 semanas. La red de contactos hispanos en finanzas que hay aquÃ­ es Ãºnica."},
                {n:"Diego F.",loc:"Chile",e:"ð»",c:"#06b6d4",r:5,t:"EmpecÃ© con paper trading y en 6 meses pasÃ© a dinero real con confianza. El leaderboard me motivÃ³ a estudiar mÃ¡s y mejorar mi estrategia."},
              ].map((t,i)=>(
                <div key={i} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:16,padding:"22px 20px"}}>
                  <div style={{display:"flex",marginBottom:10}}>{"â­".repeat(t.r)}</div>
                  <p style={{margin:"0 0 16px",color:"#94a3b8",fontSize:13,lineHeight:1.7,fontStyle:"italic"}}>"{t.t}"</p>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${t.c},${t.c}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{t.e}</div>
                    <div>
                      <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{t.n}</div>
                      <div style={{color:"#475569",fontSize:11}}>ð {t.loc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ââ PRICING â TABLA COMPLETA 3 PLANES ââ */}
        <div style={{background:"#0a1020",padding:"64px 20px",borderBottom:"1px solid #0f172a"}} id="precios">
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:12}}>
              <h2 style={{margin:"0 0 8px",color:"#fff",fontSize:"clamp(24px,4vw,40px)",fontWeight:900}}>{lang==="en"?"Choose your plan":"Elige tu plan"}</h2>
              <p style={{margin:"0 0 8px",color:"#64748b",fontSize:15}}>{lang==="en"?"Start free. Scale when ready. Cancel anytime.":"Empieza gratis. Escala cuando estÃ©s listo. Cancela cuando quieras."}</p>
            </div>
            {/* Badge ahorro anual */}
            <div style={{textAlign:"center",marginBottom:36}}>
              <span style={{background:"rgba(0,210,106,0.12)",border:"1px solid rgba(0,210,106,0.3)",borderRadius:20,padding:"5px 16px",color:"#10b981",fontSize:12,fontWeight:700}}>
                {lang==="en"?"ð¡ Annual VIP plan: $79.99/yr â save $39.89 (33% OFF)":"ð¡ Plan anual VIP: $79.99/aÃ±o â ahorra $39.89 (33% OFF)"}
              </span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,alignItems:"start"}}>
              {[
                {
                  plan:"Free",badge:null,
                  precio:"$0",periodo:"para siempre",
                  color:"#475569",bg:"#0f172a",border:"#1e293b",btnBg:"transparent",btnBorder:"#334155",
                  features:[
                    {t:"Feed de traders en tiempo real",ok:true},
                    {t:"Watchlist hasta 5 acciones",ok:true},
                    {t:"Paper trading $100k virtuales",ok:true},
                    {t:"Leaderboard de la comunidad",ok:true},
                    {t:"Chat IA bÃ¡sico (10 consultas/dÃ­a)",ok:true},
                    {t:"Picks VIP semanales",ok:false},
                    {t:"SeÃ±ales de trading en vivo",ok:false},
                    {t:"Alertas de precio",ok:false},
                    {t:"Descuentos en webinars",ok:false},
                  ],
                  cta:"Empezar gratis",action:()=>setAuth("register")
                },
                {
                  plan:"VIP â¦",badge:"â¡ MÃS POPULAR",
                  precio:"$9.99",periodo:"/mes Â· o $79.99/aÃ±o",
                  color:"#a78bfa",bg:"linear-gradient(135deg,#1a0f2e,#1e1040)",border:"#7C3AED",btnBg:"linear-gradient(135deg,#7C3AED,#4c1d95)",btnBorder:"#7C3AED",
                  featured:true,
                  features:[
                    {t:"Todo lo del plan Free",ok:true},
                    {t:"10 picks VIP semanales (lunes 9am)",ok:true},
                    {t:"SeÃ±ales de trading en vivo",ok:true},
                    {t:"Alertas de precio ilimitadas",ok:true},
                    {t:"50% OFF en webinars y cursos",ok:true},
                    {t:"Badge VIP en tu perfil",ok:true},
                    {t:"Chat IA ilimitado",ok:true},
                    {t:"Herramientas VIP exclusivas",ok:true},
                  ],
                  cta:"Probar VIP",action:()=>setAuth("register")
                },
                {
                  plan:"PRO ð",badge:"Para traders serios",
                  precio:"$24.99",periodo:"/mes",
                  color:"#00A8FF",bg:"linear-gradient(135deg,#061828,#082038)",border:"#00A8FF",btnBg:"linear-gradient(135deg,#00A8FF,#0066CC)",btnBorder:"#00A8FF",
                  features:[
                    {t:"Todo lo del plan VIP",ok:true},
                    {t:"SeÃ±ales PRO con R:R detallado",ok:true},
                    {t:"Acceso anticipado a picks (dom 8pm)",ok:true},
                    {t:"AnÃ¡lisis tÃ©cnico IA sin lÃ­mite",ok:true},
                    {t:"Screener de acciones avanzado",ok:true},
                    {t:"Dashboard de portafolio PRO",ok:true},
                    {t:"Soporte prioritario 1:1",ok:true},
                    {t:"Webinars mensuales exclusivos PRO",ok:true},
                  ],
                  cta:"Empezar PRO",action:()=>setAuth("register")
                },
              ].map((p,i)=>(
                <div key={i} style={{background:p.bg,border:`2px solid ${p.border}`,borderRadius:22,padding:"30px 26px",position:"relative",boxShadow:p.featured?"0 0 50px #7C3AED22":p.color==="#00A8FF"?"0 0 30px #00A8FF11":"none",transition:"transform 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-4px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  {p.badge&&<div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:p.featured?"linear-gradient(135deg,#7C3AED,#4c1d95)":p.color==="#00A8FF"?"linear-gradient(135deg,#00A8FF,#0066CC)":"#1e293b",borderRadius:20,padding:"4px 18px",fontSize:11,fontWeight:700,color:"#fff",whiteSpace:"nowrap",border:`1px solid ${p.border}44`}}>{p.badge}</div>}
                  {/* Plan name + precio */}
                  <div style={{marginBottom:20,paddingBottom:16,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{color:p.color,fontWeight:800,fontSize:15,marginBottom:8}}>{p.plan}</div>
                    <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                      <span style={{color:"#fff",fontWeight:900,fontSize:36}}>{p.precio}</span>
                    </div>
                    <div style={{color:"#475569",fontSize:12,marginTop:2}}>{p.periodo}</div>
                  </div>
                  {/* Features */}
                  <div style={{marginBottom:24}}>
                    {p.features.map((f,j)=>(
                      <div key={j} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:9}}>
                        <span style={{flexShrink:0,fontSize:14,marginTop:1,color:f.ok?p.color:"#1e293b",fontWeight:900}}>{f.ok?"â":"â"}</span>
                        <span style={{color:f.ok?"#94a3b8":"#2d3748",fontSize:13,lineHeight:1.4,textDecoration:f.ok?"none":"line-through"}}>{f.t}</span>
                      </div>
                    ))}
                  </div>
                  {/* CTA */}
                  <button onClick={p.action} style={{width:"100%",background:p.btnBg,border:`1.5px solid ${p.btnBorder}`,borderRadius:13,padding:"13px",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",letterSpacing:0.2,transition:"opacity 0.15s"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    {p.cta} â
                  </button>
                  {p.plan==="VIP â¦"&&<div style={{textAlign:"center",marginTop:10,color:"#475569",fontSize:11}}>o $79.99/aÃ±o (ahorra $39.89) Â· sin tarjeta para probar</div>}
                </div>
              ))}
            </div>
            {/* GarantÃ­a */}
            <div style={{textAlign:"center",marginTop:32,color:"#475569",fontSize:13}}>
              ð Pago 100% seguro via Stripe Â· Cancela en cualquier momento Â· Soporte en espaÃ±ol
            </div>
          </div>
        </div>

        {/* ââ FINAL CTA ââ */}
        <div style={{background:`linear-gradient(135deg,#0B1A2E,#0D2244)`,padding:"64px 20px",borderTop:"1px solid rgba(0,168,255,0.15)",textAlign:"center"}}>
          <div style={{maxWidth:600,margin:"0 auto"}}>
            <div style={{fontSize:48,marginBottom:16}}>ð</div>
            <h2 style={{margin:"0 0 12px",color:"#fff",fontSize:"clamp(24px,4vw,40px)",fontWeight:900}}>Â¿Listo para invertir mejor?</h2>
            <p style={{margin:"0 0 32px",color:"#64748b",fontSize:16,lineHeight:1.7}}>Ãnete a mÃ¡s de 2,847 traders hispanos que ya estÃ¡n usando NexoTrade para tomar mejores decisiones de inversiÃ³n.</p>
            <button onClick={()=>setAuth("register")} style={{background:`linear-gradient(135deg,${C.accent},#00a060)`,border:"none",borderRadius:14,padding:"18px 52px",fontSize:17,fontWeight:800,color:"#000",cursor:"pointer",boxShadow:`0 0 40px ${C.accent}55`,display:"inline-block"}}>
              Crear cuenta gratis â 0 riesgo â
            </button>
            <div style={{marginTop:20,color:"#334155",fontSize:13}}>Sin tarjeta de crÃ©dito Â· Cancela cuando quieras Â· En espaÃ±ol</div>
          </div>
        </div>

        </div>
      )}


      {/* PREDICCIÃN DEL DÃA */}
      {page===0 && !showLanding && <PredictionBanner lang={lang}/>}

      {/* SOCIAL PROOF STATS BAR â visible a todos */}
      {page===0 && !showLanding && <SocialProofBar user={user} onRegister={()=>setAuth("register")} lang={lang}/>}

      {/* MARKETS MINI WIDGET â Mercados / Predicciones / Tendencias */}
      {page===0 && !showLanding && (
        <div style={{maxWidth:1200,margin:"0 auto",padding:"10px 16px 0",boxSizing:"border-box"}}>
          <MarketsMiniWidget lang={lang}/>
        </div>
      )}

      {/* BODY â 3 columnas estilo Socimo */}
      <div className="nexo-body-grid" style={{maxWidth:1200,margin:"0 auto",padding:"12px 16px",display:"grid",gridTemplateColumns:"minmax(0,1fr)",gap:16,alignItems:"start",width:"100%",boxSizing:"border-box",overflowX:"hidden"}}>
        <div className="nexo-left-sidebar"><LeftSidebar user={user} onProfile={setProfUser} onNeedAuth={()=>setAuth("register")} lang={lang} onNavigate={(idx)=>{setPage(idx);setShowLanding(false);setTickerFilter(null);}} onLogout={async()=>{
          // 1. Limpiar estado React inmediatamente (UX instantÃ¡nea)
          saveUser(null);
          setIsPremium(false);
          setIsPro(false);
          setPage(0);
          setShowLanding(false);
          // 2. Limpiar storage
          localStorage.clear();
          sessionStorage.clear();
          // 3. Cerrar sesiÃ³n en Supabase (async, no bloquea)
          try{ await supabase.auth.signOut(); }catch(e){}
          // 4. Forzar recarga limpia
          window.location.replace("/");
        }}
        onUserUpdate={(updated)=>saveUser(updated)}
/></div>
        <div>{renderPage()}</div>
        <div className="nexo-sidebar">
          <Sidebar user={user} following={following} onFollow={toggleFollow} onProfile={setProfUser} onNeedAuth={()=>setAuth("register")} onAI={()=>setShowAI(true)} lang={lang} posts={posts}/>
          {/* ââ WIDGETS SIDEBAR ââ */}
          <div style={{marginTop:16}}>
            <SidebarTickerWidget/>
            <PolymarketWidget/>
          </div>
        </div>
      </div>

      <Footer setPage={(p)=>{setPage(p);setShowLanding(false);window.scrollTo({top:0,behavior:"smooth"});}} onAuth={()=>setAuth("register")} lang={lang}/>

      {/* BANNER AFILIADOS MÃVIL â fijo al pie, solo en mÃ³vil */}
      <MobileAffiliateBanner/>

      {/* LOGOUT MÃVIL â botÃ³n fijo en la esquina, solo en mÃ³vil */}
      {user && (
        <div className="nexo-logout-mobile" style={{
          position:"fixed",bottom:24,right:16,zIndex:999,display:"none",
          flexDirection:"column",alignItems:"flex-end",gap:8
        }}>
          <button
            onClick={async()=>{
              try{ await supabase.auth.signOut({scope:"local"}); }catch(e){}
              try{ await supabase.auth.signOut({scope:"global"}); }catch(e){}
              localStorage.clear();
              sessionStorage.clear();
              window.location.href="/";
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
            ðª {lang==="en"?"Sign out":"Cerrar sesiÃ³n"}
          </button>
        </div>
      )}

      {/* VIP POP-UP */}
      {showVipPopup && !effectivePremium && (
        <VipPopup
          onClose={()=>setVipPopup(false)}
          onGoVIP={()=>{ setVipPopup(false); setPage(8); setShowLanding(false); }}
        />
      )}

      {/* MODALS */}
      {auth&&<AuthModal mode={auth} onClose={()=>setAuth(null)} onAuth={(u,isNew)=>{saveUser(u);setShowLanding(false);setIsPremium(u.is_premium||false||ADMIN_EMAILS.includes(u.email||''));if(isNew){setWelcomeName(u.name||u.email?.split("@")[0]||"");setShowWelcome(true);}}} lang={lang}/>}
      {showWelcome&&<WelcomeModal name={welcomeName} onClose={()=>setShowWelcome(false)} onGoVip={()=>{setShowWelcome(false);setPage(8);}}/>}
      {showPushPrompt&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:9998,background:C.surface,border:`1px solid ${C.accent}44`,borderRadius:18,padding:"20px 24px",maxWidth:380,width:"calc(100% - 32px)",boxShadow:"0 16px 48px rgba(0,0,0,0.6)",display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{fontSize:28,flexShrink:0}}>ð</div>
          <div style={{flex:1}}>
            <div style={{color:C.text,fontWeight:800,fontSize:14,marginBottom:4}}>Â¿Activar notificaciones?</div>
            <div style={{color:C.muted2,fontSize:12,lineHeight:1.5,marginBottom:14}}>Te avisamos cuando haya picks VIP nuevos, posts trending y alertas de precio.</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={activarPush} style={{flex:1,background:`linear-gradient(135deg,${C.accent},#00a87f)`,border:"none",borderRadius:10,padding:"9px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Activar â</button>
              <button onClick={()=>{setShowPushPrompt(false);localStorage.setItem("nexo-push-asked","1");}} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 14px",color:C.muted2,fontSize:12,cursor:"pointer"}}>Ahora no</button>
            </div>
          </div>
        </div>
      )}
      {profUser&&<ProfilePage user={profUser} currentUser={user} isFollowing={following.includes(profUser.id)} onFollow={toggleFollow} onClose={()=>setProfUser(null)} lang={lang}/>}
      {showAI&&<AIAssistant lang={lang} onClose={()=>setShowAI(false)}/>}

      {/* ââ SOCIAL PROOF TOAST (esquina inferior izquierda) ââ */}
      {socialProofMsg && (
        <div style={{position:"fixed",bottom:28,left:20,zIndex:8800,background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 24px rgba(0,0,0,0.3)",maxWidth:280,animation:"nexo-slidein 0.4s ease"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#00A8FF,#0066CC)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>ð¤</div>
          <div>
            <div style={{color:C.text,fontWeight:700,fontSize:12}}>{socialProofMsg.name} <span style={{color:C.muted2,fontWeight:400}}>de {socialProofMsg.loc}</span></div>
            <div style={{color:"#00A8FF",fontSize:11,marginTop:2}}>{socialProofMsg.action}</div>
          </div>
        </div>
      )}

      {/* ââ POP-UP CAPTURA DE EMAIL ââ */}
      {showEmailPopup && !user && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>{setShowEmailPopup(false);localStorage.setItem("nexo-email-popup-seen","1");}}>
          <div style={{background:"linear-gradient(135deg,#0B1A2E,#0D2244)",border:"1px solid rgba(0,168,255,0.3)",borderRadius:24,padding:"40px 36px",maxWidth:440,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,0.7)",position:"relative",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>{setShowEmailPopup(false);localStorage.setItem("nexo-email-popup-seen","1");}} style={{position:"absolute",top:16,right:16,background:"transparent",border:"none",color:"#475569",fontSize:20,cursor:"pointer",lineHeight:1}}>â</button>
            {/* Ãcono */}
            <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#00A8FF,#0066CC)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 20px",boxShadow:"0 0 32px rgba(0,168,255,0.4)"}}>ð¯</div>
            <h3 style={{margin:"0 0 8px",color:"#fff",fontSize:22,fontWeight:900}}>Recibe el pick de la semana gratis</h3>
            <p style={{margin:"0 0 24px",color:"#64748b",fontSize:14,lineHeight:1.6}}>Cada lunes a las 9am te enviamos el pick <strong style={{color:"#fff"}}>mÃ¡s votado por la comunidad</strong> directo a tu email. Sin spam.</p>
            {!emailPopupSent ? (
              <form onSubmit={async(e)=>{
                e.preventDefault();
                const email = e.target.email.value;
                if(!email) return;
                // Guardar en Supabase + enviar email de bienvenida
                try{ await supabase.from("newsletter_subscribers").upsert({email, source:"popup", created_at: new Date().toISOString()}); }catch(err){}
                fetch("/api/newsletter-welcome",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})}).catch(()=>{});
                setEmailPopupSent(true);
                localStorage.setItem("nexo-email-popup-seen","1");
              }}>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <input name="email" type="email" required placeholder="tu@email.com"
                    style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(0,168,255,0.3)",borderRadius:10,padding:"12px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
                  <button type="submit" style={{background:"linear-gradient(135deg,#00A8FF,#0066CC)",border:"none",borderRadius:10,padding:"12px 18px",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",whiteSpace:"nowrap"}}>Recibir â</button>
                </div>
                <div style={{color:"#1e3a5f",fontSize:11}}>ð Sin spam. Cancela cuando quieras.</div>
              </form>
            ) : (
              <div style={{background:"rgba(0,210,106,0.1)",border:"1px solid rgba(0,210,106,0.3)",borderRadius:12,padding:"18px",color:"#10b981",fontWeight:700,fontSize:15}}>
                â Â¡Listo! Te llegarÃ¡ el pick este lunes.
              </div>
            )}
            <button onClick={()=>setAuth("register")} style={{marginTop:16,background:"transparent",border:"none",color:"#475569",fontSize:12,cursor:"pointer",textDecoration:"underline"}}>
              O crear cuenta gratis y verlo ahora â
            </button>
          </div>
        </div>
      )}

      {/* ââ CHATBOT FLOTANTE IA ââ */}
      {!showAI && (
        <div style={{position:"fixed",bottom:24,right:24,zIndex:8900,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,pointerEvents:"none"}}>
          <div style={{
            background:"linear-gradient(135deg,#0B1A2E,#0D2244)",
            border:"1px solid rgba(0,168,255,0.5)",
            borderRadius:14,padding:"10px 14px",
            color:"#fff",fontSize:12,fontWeight:600,
            boxShadow:"0 4px 24px rgba(0,168,255,0.25)",
            whiteSpace:"nowrap",backdropFilter:"blur(12px)",
            pointerEvents:"auto",cursor:"pointer",
            animation:"nexo-float 3s ease-in-out infinite",
          }} onClick={()=>setShowAI(true)}>
            Â¿Tienes dudas sobre el mercado? <span style={{color:"#00A8FF"}}>PregÃºntame â</span>
          </div>
          <button onClick={()=>setShowAI(true)} style={{
            width:58,height:58,borderRadius:"50%",
            background:"linear-gradient(135deg,#00A8FF,#0066CC)",
            border:"3px solid rgba(0,168,255,0.4)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:26,cursor:"pointer",
            boxShadow:"0 4px 24px rgba(0,168,255,0.5), 0 0 0 0 rgba(0,168,255,0.4)",
            animation:"nexo-pulse 2s infinite",
            pointerEvents:"auto",
          }}>ð¤</button>
        </div>
      )}
      {showAlerts&&<AlertsPanel lang={lang} onClose={()=>setAlerts(false)} onAlertChange={(upd)=>setAlertCount(upd.filter(a=>a.active).length)}/>}
      {showSettings&&<SettingsPanel onClose={()=>setShowSettings(false)} darkMode={darkMode} setDarkMode={setDarkMode} lang={lang} setLang={setLang} user={user} supabase={supabase}/>}
      <PointToast show={toast.show} points={toast.points} reason={toast.reason}/>
    </div>
    </PriceProvider>
  );
}
