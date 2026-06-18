// NexoTrade — Uso de la API de datos (Twelve Data). Lee el contador oficial
// /api_usage para mostrar cuántas llamadas/créditos se llevan consumidos.
// GET /api/data?type=usage
const TD_KEY = process.env.TWELVE_DATA_KEY || "c55564b877964430bc84dbd46ff63b35";

export default async function usage(req, res){
  res.setHeader("Cache-Control","no-store");
  try{
    const r = await fetch(`https://api.twelvedata.com/api_usage?apikey=${TD_KEY}`, { signal: AbortSignal.timeout(7000) });
    const j = await r.json().catch(()=>null);
    if(!j || typeof j!=="object"){ return res.status(200).json({ ok:false, error:"sin respuesta" }); }
    const num = x => (typeof x==="number" && isFinite(x)) ? x : null;
    const used  = num(j.current_usage) ?? num(j.daily_usage) ?? null;
    const limit = num(j.plan_limit) ?? num(j.plan_daily_limit) ?? null;
    return res.status(200).json({ ok:true, used, limit, plan:j.plan_category||null, ts:j.timestamp||null, raw:j });
  }catch(e){
    return res.status(200).json({ ok:false, error:String((e&&e.message)||e) });
  }
}
