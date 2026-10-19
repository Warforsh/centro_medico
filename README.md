# 🏥 Centro Médico Premier — MVP

Aplicación web (HTML + JavaScript modular, sin framework ni paso de compilación) con **Supabase** (Auth + Postgres + RLS) y despliegue en **Netlify**.

Módulos: Identidad/Pacientes · Citas · Consulta e historia clínica · Recetas y farmacia · Facturación y caja · Reportes/Dashboard.

## Estructura
```
public/            sitio estático (index.html, css/, js/)
supabase/schema.sql  tablas, triggers, RPC y políticas RLS
build.cjs          genera public/config.js desde variables de entorno
netlify.toml       configuración de Netlify
.env.example       plantilla de variables
```

## ✅ INFORMACIÓN QUE DEBE REGISTRARSE PARA LA INTEGRACIÓN

### A) Supabase  (https://supabase.com → New project)
| # | Dónde en Supabase | Qué registrar / hacer | Se usa como |
|---|---|---|---|
| 1 | Settings → API → **Project URL** | Copiar la URL (`https://xxxx.supabase.co`) | `SUPABASE_URL` |
| 2 | Settings → API → **anon public key** | Copiar la clave `anon` (pública) | `SUPABASE_ANON_KEY` |
| 3 | SQL Editor | Pegar y ejecutar **todo** `supabase/schema.sql` | Crea tablas, RLS, RPC |
| 4 | Authentication → Providers → Email | Dejar **Email activo** y **Confirm email = ON** (necesario para la seguridad del vínculo paciente↔correo) | Registro/login |
| 5 | Authentication → URL Configuration → **Site URL** | URL final de Netlify (`https://su-sitio.netlify.app`) | Enlaces de confirmación |
| 6 | Authentication → URL Configuration → **Redirect URLs** | Añadir `https://su-sitio.netlify.app` y `http://localhost:3000` | Redirección tras confirmar |
| 7 | Primer administrador | Regístrese en la app y ejecute en SQL Editor: `update public.profiles set role='admin' where email='su-correo@dominio.com';` | Rol `admin` |
| 8 | App → *Usuarios y auditoría* | El admin asigna roles `doctor`, `nurse`, `pharmacist`, `cashier` a los usuarios registrados | Permisos |
| 9 | App → Farmacia → Inventario | Registrar productos (nombre, stock, mínimo, precio) | Recetas/dispensación/facturación |

> ⚠️ **Nunca** use la clave `service_role` en este proyecto ni la suba a GitHub. Solo la `anon`; la seguridad la imponen las políticas RLS.

### B) Netlify  (https://app.netlify.com → Add new site → Import from Git)
| # | Dónde en Netlify | Valor |
|---|---|---|
| 1 | Repositorio | El repo de GitHub de este proyecto |
| 2 | Build command | `node build.cjs` (ya está en `netlify.toml`) |
| 3 | Publish directory | `public` (ya está en `netlify.toml`) |
| 4 | Site configuration → Environment variables | `SUPABASE_URL` = URL del paso A-1 |
| 5 | | `SUPABASE_ANON_KEY` = clave del paso A-2 |
| 6 | | `CONSULTATION_FEE` = precio de consulta en Q (ej. `150`) |
| 7 | Tras el primer deploy | Copiar el dominio asignado y registrarlo en Supabase (A-5 y A-6) |

### C) GitHub
```bash
git init
git add .
git commit -m "MVP Centro Médico Premier"
git branch -M main
git remote add origin https://github.com/SU_USUARIO/centro-medico-premier.git
git push -u origin main
```
`.env` y `public/config.js` están en `.gitignore` (no se suben).

## Desarrollo local (VS Code)
1. `cp .env.example .env` y complete los valores.
2. `npm run dev` → abre http://localhost:3000 (requiere Node 18+).

## Roles y permisos (aplicados por RLS en la base de datos)
| Rol | Alcance |
|---|---|
| `patient` | Solo su expediente, sus citas (solicita → `pendiente`), sus consultas, recetas y facturas |
| `doctor` | Todos los pacientes; solo sus citas, consultas y recetas; reportes clínicos de sus pacientes |
| `nurse` | Registra/edita pacientes y gestiona citas (sin acceso a consultas) |
| `pharmacist` | Recetas pendientes, dispensar (descuenta inventario), inventario |
| `cashier` | Facturas y caja (sin datos clínicos) |
| `admin` | Todo, incluyendo reportes financieros, usuarios, auditoría y desbloqueo de consultas |

## Notas de diseño / límites del MVP
- Roles `pharmacist` y `cashier` se añadieron a los 4 solicitados porque los módulos 4 y 5 los requieren.
- Citas en bloques de 30 min; la unicidad por médico/horario la garantiza un índice único en la BD.
- Escrituras (pacientes, citas, consultas, inventario, facturas, caja) se auditan por **triggers**; los accesos de lectura se registran desde la app.
- El historial lateral muestra solo las consultas **del propio médico** (coherente con la regla de aislamiento).
- Dispensar es una función RPC atómica que valida rol y stock.
- Fuera de alcance: recuperación de contraseña, impresión de factura, anulación de facturas, múltiples sucursales.
