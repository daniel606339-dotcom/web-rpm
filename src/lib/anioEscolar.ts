/** Año escolar que se está preparando: desde octubre ya se compran útiles para el año siguiente. */
export function anioEscolar(hoy = new Date()): number {
  const f = new Date(hoy.toLocaleString("en-US", { timeZone: "America/Asuncion" }));
  return f.getMonth() >= 9 ? f.getFullYear() + 1 : f.getFullYear();
}

/** true si la lista cargada es de un año anterior: se muestra como referencia hasta que el colegio publique la nueva. */
export const esReferencia = (anio: number) => anio < anioEscolar();
