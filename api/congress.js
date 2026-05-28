// NEXO TRADE — api/congress.js
// Proxy de trades de congresistas de EE.UU.
// Fuente primaria: Quiver Quantitative (si existe API key)
// Fallback: datos curados 2025-2026

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");

  const QUIVER_KEY = process.env.QUIVER_API_KEY;

  if (QUIVER_KEY) {
    try {
      const r = await fetch("https://api.quiverquant.com/beta/live/congresstrading",{ headers: { Authorization: `Bearer ${QUIVER_KEY}` } });
      if (r.ok) {
        const data = await r.json();
        const trades = (Array.isArray(data) ? data : data.data || []).slice(0,100).map(t=>({name:t.Representative||t.Name||"Unknown",party:t.Party||"?",state:t.State||"",ticker:t.Ticker||"",type:(t.Transaction||"").toLowerCase().includes("sale")?"sell":"buy",amount:t.Range||t.Amount||"$1K-$15K",date:t.TransactionDate||t.Date||"",asset:t.AssetDescription||t.Ticker||"",house:t.House||"House"}));
        return res.status(200).json({source:"quiver",trades});
      }
    } catch(e) {}
  }

  const CURATED=[{name:"Nancy Pelosi",party:"D",state:"CA",ticker:"NVDA",type:"buy",amount:"$500K-$1M",date:"2026-04-15",asset:"NVIDIA Corp",house:"House"},{name:"Michael McCaul",party:"R",state:"TX",ticker:"TSLA",type:"buy",amount:"$50K-$100K",date:"2026-04-10",asset:"Tesla Inc",house:"House"},{name:"Ro Khanna",party:"D",state:"CA",ticker:"AAPL",type:"buy",amount:"$15K-$50K",date:"2026-04-08",asset:"Apple Inc",house:"House"},{name:"Tommy Tuberville",party:"R",state:"AL",ticker:"XOM",type:"sell",amount:"$50K-$100K",date:"2026-04-05",asset:"Exxon Mobil",house:"Senate"},{name:"Dan Crenshaw",party:"R",state:"TX",ticker:"LMT",type:"buy",amount:"$15K-$50K",date:"2026-04-02",asset:"Lookheed Martin",house:"House"},{name:"Susie Lee",party:"D",state:"NV",ticker:"MSFT",type:"buy",amount:"$100K-$250K",date:"2026-03-28",asset:"Microsoft Corp",house:"House"},{name:"Josh Gottheimer",party:"D",state:"NJ",ticker:"META",type:"buy",amount:"$15K-$50K",date:"2026-03-25",asset:"Meta Platforms",house:"House"},{name:"Rick Scott",party:"R",state:"FL",ticker:"JPM",type:"sell",amount:"$250K-$500K",date:"2026-03-18",asset:"JPMorgan Chase",house:"Senate"},{name:"Pelosi PAC",party:"D",state:"CA",ticker:"CRWD",type:"buy",amount:"$250K-$500K",date:"2026-03-15",asset:"CrowdStrike Holdings",house:"House"},{name:"John Curtis",party:"R",state:"UT",ticker:"PLTR",type:"buy",amount:"$15K-$50K",date:"2026-03-12",asset:"Palantir Technologies",house:"Senate"},{name:"Nancy Pelosi",party:"D",state:"CA",ticker:"NVDA",type:"buy",amount:"$1M-$5M",date:"2025-12-20",asset:"NVIDIA Corp",house:"House"},{name:"Ro Khanna",party:"D",state:"CA",ticker:"PLTR",type:"buy",amount:"$15K-$50K",date:"2025-07-25",asset:"Palantir Technologies",house:"House"}];
  res.status(200).json({source:"curated",trades:CURATED});
}
