// Datos generales del sitio. Lo que cambia por entorno va en variables de Vercel.

export const SITE = {
  nombre: "Distribuidora RPM",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.distribuidorarpm.com.py").replace(/\/$/, ""),
  descripcion:
    "Distribuidora de artículos de librería, papelería, limpieza, higiene y empaque para empresas en Paraguay.",
  // Número de WhatsApp de ventas, formato internacional sin "+".
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "595976634184",
  whatsappVisible: "+595 976 634 184",
  direccion: "12 de Octubre N° 521, Barrio Pinozá, Asunción",
  email: "ventas@distribuidorarpm.com.py",
  anios: 19,
  ciudad: "Asunción",
  pais: "PY",
  moneda: "PYG",
};

/** Datos para transferencia (los mismos que publica Porta hoy). */
export const BANCO = {
  banco: "Banco Continental S.A.E.C.A.",
  alias: "RUC 80122009-2",
  cuenta: "34-23106000-03",
  tipo: "Cuenta corriente en guaraníes",
  razonSocial: "DISTRIBUIDORA RPM S.A.",
  ruc: "80122009-2",
  emailComprobante: "rcaballero@distribuidorarpm.com.py",
};

export const HORARIO_ENTREGA = ["Lunes a viernes: 09:00 a 17:00", "Sábados: 09:00 a 12:00"];

export const SUPABASE = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://yrvunjrqxowuraezggdh.supabase.co",
  // Clave publicable (solo lectura, protegida por RLS). No es secreta.
  key: process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "sb_publishable_mayUH2l4jQO_PYLAL119gg_o23N8EJb",
};

// Cada cuánto se regeneran las páginas con precio y stock (segundos).
// El stock en Supabase se actualiza cada hora; 15 minutos es suficiente.
export const REVALIDAR = 900;

export const POR_PAGINA = 36;
