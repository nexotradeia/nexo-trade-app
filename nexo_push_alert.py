#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NEXO TRADE — Emisor de Web Push para alertas de precio 🔔
Evalúa las alertas de cada usuario (tabla user_alerts) contra el precio real
y envía notificaciones push a sus dispositivos AUNQUE LA APP ESTÉ CERRADA.

USO:
  python3 nexo_push_alert.py            # evalúa y envía push de alertas disparadas
  python3 nexo_push_alert.py --test     # imprime qué enviaría, SIN enviar ni tocar el estado
  python3 nexo_push_alert.py --selftest # prueba la lógica de evaluación con datos simulados (sin red)

REQUISITOS (una sola vez):
  pip3 install pywebpush
  # Claves VAPID: ya están en .vapid.json (junto a este script)
  # Service role de Supabase: crea el archivo .supabase_service_role con la key
  #   (Supabase → Project Settings → API → service_role secret), o expórtala:
  #   export SUPABASE_SERVICE_ROLE="eyJ..."

CRON (cada 5 min; ajusta a tu gusto):
  */5 * * * *  cd "/Users/mariangat26/Desktop/NEXO TRADE" && /usr/bin/python3 nexo_push_alert.py >> nexo_push_log.txt 2>&1
"""
import json, sys, os, time, urllib.request, urllib.parse, urllib.error
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))

# ── CONFIG ──────────────────────────────────────────────────────────────────
SUPABASE_URL   = "https://glvrzrtatekuuhwtzzhd.supabase.co"
FINNHUB_KEY    = "d86clthr01qgiu44rtmgd86clthr01qgiu44rtn0"
VAPID_SUBJECT  = "mailto:admin@nexotradeia.com"
STATE_FILE     = os.path.join(HERE, "nexo_push_sent.json")
RESEND_COOLDOWN_MIN = 10          # mínimo entre reenvíos de la misma alerta (freq != "Una vez")
CRYPTO_MAP = {"BTC":"BINANCE:BTCUSDT","ETH":"BINANCE:ETHUSDT","SOL":"BINANCE:SOLUSDT",
              "BNB":"BINANCE:BNBUSDT","XRP":"BINANCE:XRPUSDT","ADA":"BINANCE:ADAUSDT","DOGE":"BINANCE:DOGEUSDT"}

TEST = "--test" in sys.argv
SELFTEST = "--selftest" in sys.argv


def _load_service_role():
    tok = os.environ.get("SUPABASE_SERVICE_ROLE", "").strip()
    if not tok:
        try:
            with open(os.path.join(HERE, ".supabase_service_role")) as f:
                tok = f.read().strip()
        except FileNotFoundError:
            pass
    return tok


def _load_vapid():
    with open(os.path.join(HERE, ".vapid.json")) as f:
        d = json.load(f)
    return d["publicKey"], d["privateKey"]


# ── EVALUACIÓN DE ALERTAS (pura, testeable sin red) ─────────────────────────
def alert_fires(alert, quote):
    """alert: {sym,type,target,freq}; quote: {'c':precio,'dp':cambio%}. Devuelve bool."""
    try:
        tgt = float(str(alert.get("target", "")).replace(",", "").replace("$", "").strip())
    except (ValueError, TypeError):
        return False
    c = quote.get("c")
    dp = quote.get("dp")
    t = alert.get("type")
    if c is None or c <= 0:
        return False
    if t == "price_above":
        return c > tgt
    if t == "price_below":
        return c < tgt
    if t == "pct_change":
        return dp is not None and abs(dp) >= tgt
    return False


def cond_text(alert, c):
    t = alert.get("type"); tgt = alert.get("target")
    sym = alert.get("sym")
    if t == "price_above":
        return f"{sym} subió por encima de ${tgt} — ahora ${c:.2f}"
    if t == "price_below":
        return f"{sym} bajó por debajo de ${tgt} — ahora ${c:.2f}"
    if t == "pct_change":
        return f"{sym} se movió {tgt}%+ hoy — ahora ${c:.2f}"
    return f"{sym} — ${c:.2f}"


# ── RED ─────────────────────────────────────────────────────────────────────
def _get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


def supabase_rows(table, sb_key, select="*"):
    url = f"{SUPABASE_URL}/rest/v1/{table}?select={urllib.parse.quote(select)}"
    return _get(url, {"apikey": sb_key, "authorization": f"Bearer {sb_key}"})


def finnhub_quote(symbol):
    sym = CRYPTO_MAP.get(symbol.upper(), symbol.upper())
    url = f"https://finnhub.io/api/v1/quote?symbol={urllib.parse.quote(sym)}&token={FINNHUB_KEY}"
    try:
        return _get(url)
    except Exception:
        return {}


# ── ESTADO (dedup) ──────────────────────────────────────────────────────────
def load_state():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)


def should_send(state, key, freq, now_ts):
    last = state.get(key)
    if last is None:
        return True
    if freq == "Una vez":
        return False  # ya se envió una vez
    if freq == "Diaria":
        return datetime.fromtimestamp(last).date() != datetime.fromtimestamp(now_ts).date()
    return (now_ts - last) >= RESEND_COOLDOWN_MIN * 60


# ── SELFTEST (sin red) ──────────────────────────────────────────────────────
def run_selftest():
    cases = [
        ({"sym":"NVDA","type":"price_above","target":"200","freq":"Una vez"}, {"c":208.3,"dp":2.4}, True),
        ({"sym":"NVDA","type":"price_above","target":"250","freq":"Una vez"}, {"c":208.3,"dp":2.4}, False),
        ({"sym":"AAPL","type":"price_below","target":"190","freq":"Diaria"},  {"c":185.0,"dp":-1.2}, True),
        ({"sym":"AAPL","type":"price_below","target":"180","freq":"Diaria"},  {"c":185.0,"dp":-1.2}, False),
        ({"sym":"TSLA","type":"pct_change","target":"5",   "freq":"Siempre"}, {"c":410.0,"dp":-6.1}, True),
        ({"sym":"TSLA","type":"pct_change","target":"5",   "freq":"Siempre"}, {"c":410.0,"dp":2.0},  False),
        ({"sym":"BTC","type":"price_above","target":"$70,000","freq":"Una vez"}, {"c":72000.0,"dp":1.9}, True),
        ({"sym":"X","type":"price_above","target":"10","freq":"Una vez"}, {"c":0,"dp":0}, False),  # sin precio
    ]
    ok = 0
    for a, q, exp in cases:
        got = alert_fires(a, q)
        flag = "OK" if got == exp else "FAIL"
        if got == exp: ok += 1
        print(f"[{flag}] {a['sym']:5} {a['type']:12} tgt={a['target']:>8}  c={q['c']:>9} dp={q['dp']:>5}  → {got} (esperado {exp})")
    # dedup
    st = {}; now = time.time()
    s1 = should_send(st, "u:1", "Una vez", now); st["u:1"] = now
    s2 = should_send(st, "u:1", "Una vez", now + 1)        # no reenviar "Una vez"
    s3 = should_send(st, "u:2", "Siempre", now); st["u:2"] = now
    s4 = should_send(st, "u:2", "Siempre", now + 60)       # < cooldown
    s5 = should_send(st, "u:2", "Siempre", now + 11*60)    # > cooldown
    dd = [s1, s2, s3, s4, s5] == [True, False, True, False, True]
    print(f"[{'OK' if dd else 'FAIL'}] dedup once/cooldown → {[s1,s2,s3,s4,s5]}")
    total_ok = ok == len(cases) and dd
    print(f"\n{'ALL PASS ✅' if total_ok else 'FALLOS ❌'}  ({ok}/{len(cases)} casos)")
    sys.exit(0 if total_ok else 1)


# ── MAIN ────────────────────────────────────────────────────────────────────
def main():
    if SELFTEST:
        run_selftest()

    sb_key = _load_service_role()
    if not sb_key:
        print("❌ Falta la SERVICE ROLE key de Supabase.")
        print("   Crea el archivo .supabase_service_role con la key, o export SUPABASE_SERVICE_ROLE=...")
        sys.exit(1)
    try:
        vapid_pub, vapid_priv = _load_vapid()
    except Exception as e:
        print(f"❌ No pude leer .vapid.json: {e}")
        sys.exit(1)

    if not TEST:
        try:
            from pywebpush import webpush, WebPushException
        except ImportError:
            print("❌ Falta pywebpush. Instala con:  pip3 install pywebpush")
            sys.exit(1)

    # 1) alertas en la nube + suscripciones (service role ignora RLS)
    try:
        alert_rows = supabase_rows("user_alerts", sb_key, "user_id,alerts")
        sub_rows   = supabase_rows("push_subscriptions", sb_key, "user_id,endpoint,p256dh,auth")
    except urllib.error.HTTPError as e:
        print(f"❌ Supabase {e.code}: {e.read().decode()[:200]}")
        sys.exit(1)

    subs_by_user = {}
    for s in sub_rows:
        subs_by_user.setdefault(s.get("user_id"), []).append(s)

    state = load_state()
    now_ts = time.time()
    quote_cache = {}
    sent = 0

    for row in alert_rows:
        uid = row.get("user_id")
        alerts = row.get("alerts") or []
        subs = subs_by_user.get(uid, [])
        if not subs or not alerts:
            continue
        for a in alerts:
            sym = (a.get("sym") or "").upper()
            if not sym:
                continue
            if sym not in quote_cache:
                quote_cache[sym] = finnhub_quote(sym)
            q = quote_cache[sym]
            if not alert_fires(a, q):
                continue
            key = f"{uid}:{a.get('id')}"
            if not should_send(state, key, a.get("freq", ""), now_ts):
                continue
            c = q.get("c") or 0
            body = cond_text(a, c)
            payload = json.dumps({"title": f"🔔 NEXO · {sym}", "body": body,
                                  "url": "/", "tag": f"alert-{a.get('id')}"})
            if TEST:
                print(f"[TEST] → {uid[:8]}…  {body}  ({len(subs)} disp.)")
            else:
                from pywebpush import webpush, WebPushException
                for s in subs:
                    try:
                        webpush(
                            subscription_info={"endpoint": s["endpoint"],
                                               "keys": {"p256dh": s["p256dh"], "auth": s["auth"]}},
                            data=payload,
                            vapid_private_key=vapid_priv,
                            vapid_claims={"sub": VAPID_SUBJECT},
                        )
                    except WebPushException as e:
                        print(f"   ⚠️ push falló ({sym}): {e}")
            state[key] = now_ts
            sent += 1

    if not TEST:
        save_state(state)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    print(f"{stamp} · {'(test) ' if TEST else ''}alertas disparadas: {sent} · usuarios: {len(alert_rows)}")


if __name__ == "__main__":
    main()
