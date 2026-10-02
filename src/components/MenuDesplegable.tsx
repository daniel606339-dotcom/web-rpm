"use client";

import { useState } from "react";

/**
 * Ítem del menú de departamentos con su panel desplegable (se abre con el mouse o el teclado).
 * Al elegir un enlace se cierra: sin esto, el panel quedaba abierto porque el enlace
 * conserva el foco y el mouse sigue encima después de navegar.
 */
export default function MenuDesplegable({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [cerrado, setCerrado] = useState(false);
  return (
    <li
      className={`group relative ${cerrado ? "menu-cerrado" : ""} ${className}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a")) {
          setCerrado(true);
          (document.activeElement as HTMLElement | null)?.blur();
        }
      }}
      onMouseLeave={() => setCerrado(false)}
    >
      {children}
    </li>
  );
}
