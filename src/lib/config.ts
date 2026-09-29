// Datos generales del sitio. Lo que cambia por entorno va en variables de Vercel.

export const SITE = {
  nombre: "Distribuidora RPM",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.distribuidorarpm.com.py").replace(/\/$/, ""),
  descripcion:
    "Distribuidora de artículos de librería, papelería, limpieza, higiene y empaque para empresas en Paraguay.",
  // Número de WhatsApp de ventas, formato internacional sin "+".
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "595976634184",
  ciudad: "Asunción",
  pais: "PY",
  moneda: "PYG",
};

export const SUPABASE = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://yrvunjrqxowuraezggdh.supabase.co",
  // Clave publicable (solo lectura, protegida por RLS). No es secreta.
  key: process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "sb_publishable_mayUH2l4jQO_PYLAL119gg_o23N8EJb",
};

// Cada cuánto se regeneran las páginas con precio y stock (segundos).
// El stock en Supabase se actualiza cada hora; 15 minutos es suficiente.
export const REVALIDAR = 900;

export const POR_PAGINA = 36;
