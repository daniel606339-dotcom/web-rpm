# Web RPM

Sitio de Distribuidora RPM (reemplazo de Porta). Next.js 16 + Supabase (esquema `web`), alojado en Vercel (región São Paulo).

## Cómo funciona

- **Catálogo**: se lee del esquema `web` de Supabase (vista `web.productos`, `lineas`, `departamentos`, `marcas`, `colecciones`).
  Los datos llegan desde el ERP con `sync-web.ps1` en el servidor (stock/precio cada hora, clasificación diaria).
- **Páginas** (se regeneran solas cada 15 min):
  - `/` inicio · `/d/{departamento}` · `/c/{línea o colección}` · `/m/{marca}` · `/p/{código}/{nombre}` ficha · `/buscar?q=` · `/carrito`
- **Redirecciones de Porta**: `src/proxy.ts` manda las URL viejas (`/producto/...`, `/categoria/...`, `/marca/...`, `/index.php/...`)
  a las nuevas con 301, usando la función `web.resolver_redireccion` de Supabase.
- **SEO**: `sitemap.xml` con todos los productos, datos estructurados (Product, BreadcrumbList, Organization), URL canónicas.
  Fuera de producción el sitio responde `noindex` y `robots.txt` bloquea todo.
- **Carrito**: vive en el navegador. El pedido sale por WhatsApp. Pago online con uPay: pendiente.

## Variables en Vercel

| Variable | Dónde | Valor |
|---|---|---|
| `RPM_INDEXAR` | **solo al pasar al dominio real** | `1` (antes de eso Google no indexa nada, ni web-rpm.vercel.app) |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://www.distribuidorarpm.com.py` |
| `NEXT_PUBLIC_WHATSAPP` | todas (opcional) | `595976634184` |
| `NEXT_PUBLIC_GTM_ID` | **solo Production** | `GTM-NWJ3WCN` (no cargar en pruebas: contaría conversiones falsas) |
| `NEXT_PUBLIC_MINIMO_ENVIO_GRATIS` | opcional | p. ej. `150000` para mostrar la barra de envío gratis |

La URL y la clave publicable de Supabase tienen valores por defecto en `src/lib/config.ts` (la clave es pública y de solo lectura).

## Cambios frecuentes

- **Logo**: subir `public/logo.svg` y poner la ruta en `src/components/Logo.tsx`.
- **Banners del inicio**: `src/components/Banners.tsx` (imágenes en `public/banners/`).
- **Filas del inicio**: `LINEAS_INICIO` en `src/app/page.tsx`.
- **Nombre, texto y SEO de un producto**: tabla `web.producto_seo` en Supabase (no hace falta tocar código).

## Desarrollo local

```bash
npm install
npm run dev                  # contra Supabase real
RPM_FIXTURES=1 npm run dev   # con datos de ejemplo, sin conexión
```
