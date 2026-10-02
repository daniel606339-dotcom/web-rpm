import { REVALIDAR, SUPABASE } from "./config";

/**
 * Acceso mínimo de solo lectura al esquema "web" de Supabase por la API REST.
 * Sin librería: fetch directo, así Next.js cachea cada consulta (ISR).
 *
 * Con RPM_FIXTURES=1 usa datos de ejemplo locales (para desarrollo sin red).
 */

export type Filtro =
  | { op: "eq"; col: string; val: string | number | boolean }
  | { op: "in"; col: string; val: (string | number)[] }
  | { op: "gt"; col: string; val: number }
  | { op: "notnull"; col: string }
  | { op: "buscar"; cols: string[]; texto: string };

export interface Consulta {
  select?: string;
  filtros?: Filtro[];
  orden?: { col: string; desc?: boolean; nullsLast?: boolean }[];
  limite?: number;
  desde?: number;
  contar?: boolean;
  revalidar?: number | false;
}

export interface Resultado<T> {
  filas: T[];
  total: number | null;
}

const usarFixtures = process.env.RPM_FIXTURES === "1";

/** Etiqueta de todas las consultas a Supabase: /api/revalidar la usa para refrescar la web al instante. */
export const ETIQUETA = "supabase";

export async function consultar<T>(tabla: string, q: Consulta = {}): Promise<Resultado<T>> {
  if (usarFixtures) {
    const { consultarFixture } = await import("./fixtures");
    return consultarFixture<T>(tabla, q);
  }

  const p = new URLSearchParams();
  p.set("select", q.select ?? "*");
  for (const f of q.filtros ?? []) {
    switch (f.op) {
      case "eq":
        p.append(f.col, `eq.${f.val}`);
        break;
      case "in":
        p.append(f.col, `in.(${f.val.map((v) => `"${String(v).replace(/"/g, "")}"`).join(",")})`);
        break;
      case "gt":
        p.append(f.col, `gt.${f.val}`);
        break;
      case "notnull":
        p.append(f.col, "not.is.null");
        break;
      case "buscar": {
        // Cada palabra debe aparecer en alguna de las columnas.
        const palabras = limpiarBusqueda(f.texto);
        if (palabras.length) {
          const grupos = palabras.map((w) => `or(${f.cols.map((c) => `${c}.ilike.*${w}*`).join(",")})`);
          p.append("and", `(${grupos.join(",")})`);
        }
        break;
      }
    }
  }
  if (q.orden?.length) {
    p.set(
      "order",
      q.orden.map((o) => `${o.col}.${o.desc ? "desc" : "asc"}${o.nullsLast ? ".nullslast" : ""}`).join(","),
    );
  }
  if (q.limite != null) p.set("limit", String(q.limite));
  if (q.desde) p.set("offset", String(q.desde));

  const headers: Record<string, string> = {
    apikey: SUPABASE.key,
    Authorization: `Bearer ${SUPABASE.key}`,
    "Accept-Profile": "web",
  };
  if (q.contar) headers.Prefer = "count=exact";

  const res = await fetch(`${SUPABASE.url}/rest/v1/${tabla}?${p}`, {
    headers,
    next: q.revalidar === false ? undefined : { revalidate: q.revalidar ?? REVALIDAR, tags: [ETIQUETA] },
    cache: q.revalidar === false ? "no-store" : undefined,
  });
  if (!res.ok) {
    throw new Error(`Supabase ${tabla}: ${res.status} ${await res.text()}`);
  }
  const filas = (await res.json()) as T[];
  let total: number | null = null;
  const rango = res.headers.get("content-range");
  if (rango?.includes("/")) {
    const n = Number(rango.split("/")[1]);
    total = Number.isFinite(n) ? n : null;
  }
  return { filas, total };
}

export async function rpc<T>(funcion: string, args: Record<string, unknown>, revalidar = 3600): Promise<T> {
  if (usarFixtures) {
    const { rpcFixture } = await import("./fixtures");
    return rpcFixture<T>(funcion, args);
  }
  const res = await fetch(`${SUPABASE.url}/rest/v1/rpc/${funcion}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE.key,
      Authorization: `Bearer ${SUPABASE.key}`,
      "Content-Profile": "web",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    next: { revalidate: revalidar, tags: [ETIQUETA] },
  });
  if (!res.ok) throw new Error(`Supabase rpc ${funcion}: ${res.status}`);
  return (await res.json()) as T;
}

/** Palabras de búsqueda seguras para PostgREST (sin comas, paréntesis ni comodines). */
export function limpiarBusqueda(texto: string): string[] {
  return texto
    .replace(/[(),.*%:"'\\]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2)
    .slice(0, 6);
}
