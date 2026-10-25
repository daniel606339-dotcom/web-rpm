// Datos generales del sitio. Lo que cambia por entorno va en variables de Vercel.

export const SITE = {
  nombre: "Distribuidora RPM",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.distribuidorarpm.com.py").replace(/\/$/, ""),
  descripcion:
    "Distribuidora de artículos de librería, papelería, limpieza, higiene y empaque para empresas en Paraguay.",
  // Número de WhatsApp de ventas, formato internacional sin "+".
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "595976634184",
  whatsappVisible: "+595 976 634 184",
  // Teléfono principal (llamadas): el mismo que figura en el Perfil de Empresa de Google.
  telefono: "595971155666",
  telefonoVisible: "0971 155 666",
  direccion: "12 de Octubre N° 521, Barrio Pinozá, Asunción",
  // Calles que cruzan (el local está a mitad de cuadra). Igual que la línea 2 del Perfil de Google.
  entreCalles: "entre 14 de Junio e Igualdad",
  email: "ventas@distribuidorarpm.com.py",
  anios: 19,
  ciudad: "Asunción",
  pais: "PY",
  moneda: "PYG",
  razonSocial: "DISTRIBUIDORA RPM S.A.",
  ruc: "80122009-2",
  fundacion: "2007-03",
  // Ubicación del depósito (la misma que publica el sitio de Porta y el Perfil de Google).
  geo: { lat: -25.308001, lng: -57.613601 },
  // Perfiles oficiales. Se usan en el footer y en el "sameAs" de los datos estructurados:
  // agregar acá cualquier red nueva (LinkedIn, TikTok, el Perfil de Google, etc.).
  redes: [
    { nombre: "Instagram", url: "https://www.instagram.com/distribuidorarpm/" },
    { nombre: "Facebook", url: "https://www.facebook.com/distribuidorarpm/" },
  ],
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

/** Horario de atención del local: el mismo que el Perfil de Empresa de Google. */
export const HORARIO_ATENCION = [
  { dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], abre: "08:00", cierra: "17:00", texto: "Lunes a viernes de 8:00 a 17:00" },
  { dias: ["Saturday"], abre: "08:00", cierra: "12:00", texto: "Sábados de 8:00 a 12:00" },
];

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
