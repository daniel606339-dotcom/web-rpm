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

export const IconoWhatsApp = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.2-1.4A9.9 9.9 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3a8.2 8.2 0 1 1 7 3.9zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
  </svg>
);
