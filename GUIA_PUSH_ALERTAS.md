# 🔔 Push de alertas con la app cerrada — Guía de activación

Las notificaciones de tus **alertas de precio** ahora pueden llegar al teléfono/escritorio
**aunque NexoTrade esté cerrado**. La app ya hace su parte (suscribe el navegador y sube tus
alertas a la nube). Falta encender el "cartero": un pequeño script que corre en tu Mac, mira los
precios y envía las notificaciones.

## Cómo funciona (en 1 párrafo)
Cuando un usuario activa notificaciones, su navegador se registra en la tabla `push_subscriptions`
y sus alertas activas se guardan en `user_alerts`. El script `nexo_push_alert.py` lee ambas tablas,
consulta el precio real (Finnhub), y si una alerta se cumple envía un Web Push a los dispositivos
de esa persona. El service worker (`public/sw.js`) muestra la notificación.

---

## Pasos (una sola vez)

### 1) Aplicar las migraciones en Supabase
En **supabase.com → tu proyecto → SQL Editor → New Query**, ejecuta (RUN) estos dos archivos del repo:
- `supabase/migrations/014_push_subscriptions.sql`  *(suscripciones de navegador — quizás ya estaba)*
- `supabase/migrations/022_user_alerts.sql`  *(alertas en la nube — nuevo)*

Son idempotentes: si ya existían, no rompen nada.

### 2) Conseguir la Service Role key
Supabase → **Project Settings → API → `service_role` secret** → copiar.
Guárdala junto al script en un archivo llamado `.supabase_service_role` (una sola línea):
```
echo "eyJhbGciOi...TU_SERVICE_ROLE..." > "/Users/mariangat26/Desktop/NEXO TRADE/.supabase_service_role"
```
> Esta key es secreta y **omite RLS** (por eso el cartero puede leer las alertas de todos).
> Ya está en `.gitignore`, no se sube a GitHub. Lo mismo para `.vapid.json` (tus claves VAPID).

### 3) Instalar la librería de envío
```
pip3 install pywebpush
```

### 4) Probar
```
cd "/Users/mariangat26/Desktop/NEXO TRADE"
python3 nexo_push_alert.py --selftest   # valida la lógica (sin red) → debe decir ALL PASS ✅
python3 nexo_push_alert.py --test        # lee tus tablas reales e imprime qué enviaría, SIN enviar
python3 nexo_push_alert.py               # de verdad: evalúa y ENVÍA los push que correspondan
```

### 5) Automatizar 24/7 — RECOMENDADO: GitHub Actions (sin depender del Mac)
El repo ya incluye el workflow `.github/workflows/push-alerts.yml`, que corre el cartero **cada 5
minutos en la infraestructura de GitHub** (gratis). Tu Mac puede estar apagada.

Para activarlo, define **3 secretos** en GitHub → tu repo `nexotradeia/nexo-trade-app` →
**Settings → Secrets and variables → Actions → New repository secret**:

| Nombre del secreto       | De dónde sale                                                        |
|--------------------------|----------------------------------------------------------------------|
| `SUPABASE_SERVICE_ROLE`  | Supabase → Project Settings → API → `service_role` secret            |
| `VAPID_PUBLIC_KEY`       | el campo `publicKey` de tu `.vapid.json`                             |
| `VAPID_PRIVATE_KEY`      | el campo `privateKey` de tu `.vapid.json`                           |

Listo. En la pestaña **Actions** verás "Push Alerts (24/7)" corriendo cada 5 min; también puedes
ejecutarlo a mano con **Run workflow**. (El estado anti-spam se conserva entre ejecuciones con el
caché de Actions, así que las alertas "Una vez" no se repiten.)

> Nota: GitHub a veces retrasa los cron unos minutos si hay carga, y pausa los workflows
> programados si el repo queda 60 días sin actividad — con deploys regulares no es problema.

### 5-bis) Alternativa: cron en tu Mac (si prefieres no usar GitHub Actions)
```
crontab -e
```
y añade esta línea (requiere la Mac encendida y con red):
```
*/5 * * * *  cd "/Users/mariangat26/Desktop/NEXO TRADE" && /usr/bin/python3 nexo_push_alert.py >> nexo_push_log.txt 2>&1
```

---

## Notas
- **Anti-spam:** cada alerta no se reenvía dentro de los 10 min (salvo `freq` distinto). Las de
  tipo **"Una vez"** se envían **una sola vez**; **"Diaria"**, una vez por día. El estado se guarda
  en `nexo_push_sent.json`.
- **Tipos de alerta soportados:** precio por encima, precio por debajo, cambio % del día.
- **Cripto:** BTC/ETH/SOL/BNB/XRP/ADA/DOGE se mapean a Binance automáticamente.
- **Claves VAPID:** están en `.vapid.json`. La pública también está en `src/App.jsx`
  (`VAPID_PUBLIC_KEY`). **No las cambies**: si rotas las claves, todas las suscripciones actuales
  dejan de servir y cada usuario tendría que volver a activar notificaciones.
- **Permiso del usuario:** en iOS/Safari el push requiere que la persona haya **instalado la app a
  la pantalla de inicio** (PWA) y aceptado notificaciones; en Chrome/Android/escritorio basta con
  aceptar el permiso.

## Archivos de esta función
- `nexo_push_alert.py` — el cartero (este script).
- `supabase/migrations/022_user_alerts.sql` — tabla de alertas en la nube.
- `supabase/migrations/014_push_subscriptions.sql` — suscripciones de navegador.
- `public/sw.js` — muestra la notificación (handlers `push` y `notificationclick`).
- `src/App.jsx` — suscribe el navegador (`subscribeWebPush`) y sincroniza alertas a `user_alerts`.
- Secretos locales (no en git): `.vapid.json`, `.supabase_service_role`.
