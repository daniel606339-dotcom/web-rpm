import type React from "react";

type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconoBuscar = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconoCarrito = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 8H6" />
  </svg>
);

export const IconoMenu = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

export const IconoCamion = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M1 4h14v12H1zM15 8h4l4 4v4h-8" />
    <circle cx="6" cy="18.5" r="2" />
    <circle cx="18" cy="18.5" r="2" />
  </svg>
);

export const IconoFactura = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
    <path d="M9 7h6M9 11h6M9 15h4" />
  </svg>
);

export const IconoEscudo = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconoTienda = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M3 9 4.5 4h15L21 9M3 9v11h18V9M3 9h18" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

export const IconoWhatsApp = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A9.9 9.9 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 1 1 7 3.9zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
  </svg>
);

export const IconoUsuario = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
);

export const IconoInicio = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M3 11l9-7 9 7v9H3z" />
  </svg>
);

export const IconoCategorias = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <rect x="14" y="14" width="6" height="6" rx="1" />
  </svg>
);

export const IconoTarjeta = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

export const IconoChat = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" />
  </svg>
);

export const IconoImagen = ({ className = "size-8" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.6}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="m21 16-5-5-9 9" />
  </svg>
);

/** Íconos por departamento (slug) */
const DEP: Record<string, React.ReactNode> = {
  higiene: <><path d="M9 3h6v4H9z" /><path d="M7 7h10l-1 14H8z" /></>,
  libreria: <path d="M16 3l5 5-11 11H5v-5z" />,
  papeleria: <><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4" /></>,
  limpieza: <><path d="M12 3v10" /><path d="M6 13h12l-1 8H7z" /></>,
  empaque: <><path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  "alimentos-y-bebidas": <><path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2" /></>,
  informatica: <><rect x="3" y="4" width="18" height="12" rx="1" /><path d="M8 20h8M12 16v4" /></>,
  hogar: <path d="M3 11l9-7 9 7v9H3z" />,
  "mantenimiento-integral": <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />,
  todo: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>,
};

export const IconoDepartamento = ({ slug, className = "size-[26px]" }: P & { slug: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.8}>
    {DEP[slug] ?? DEP.todo}
  </svg>
);

/** Íconos por rubro de negocio (slug) */
const RUB: Record<string, React.ReactNode> = {
  oficinas: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  "colegios-y-universidades": <><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c3 2 9 2 12 0v-5" /></>,
  "restaurantes-y-cafeterias": <><path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2" /></>,
  "clinicas-y-consultorios": <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" /></>,
  "industrias-y-depositos": <><path d="M3 21V9l6 4V9l6 4V5l6 4v12z" /></>,
  hoteles: <><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="2" /></>,
};

export const IconoRubro = ({ slug, className = "size-6" }: P & { slug: string }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.8}>
    {RUB[slug] ?? RUB.oficinas}
  </svg>
);
