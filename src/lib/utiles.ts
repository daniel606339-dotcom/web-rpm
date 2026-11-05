import { rpc } from "./db";
import { REVALIDAR } from "./config";

/** Listas de útiles escolares por colegio y grado (esquema web.utiles_*). */

export interface GradoResumen {
  slug: string;
  grado: string;
  anio: number;
  actualizado_at: string;
}
export interface ColegioResumen {
  slug: string;
  nombre: string;
  nombre_corto: string | null;
  barrio: string | null;
  distrito: string | null;
  grados: GradoResumen[];
}
export interface ArticuloUtil {
  cod: string;
  nombre: string;
  foto: string | null;
  precio: number | null;
  stock: number | null;
  url: string;
}
export interface Renglon {
  id: number;
  texto: string;
  cantidad: number;
  tipo: "util" | "fuera";
  coincidencia: "igual" | "equivalente" | "sin_catalogo";
  nota: string | null;
  principal: ArticuloUtil | null;
  alternativa: ArticuloUtil | null;
}
export interface ListaUtiles {
  id: number;
  colegio: string;
  colegio_corto: string | null;
  colegio_slug: string;
  anio: number;
  grado: string;
  grado_slug: string;
  fuente_url: string | null;
  nota: string | null;
  actualizado_at: string;
  renglones: Renglon[];
}

export async function getColegiosUtiles(): Promise<ColegioResumen[]> {
  try {
    return (await rpc<ColegioResumen[] | null>("utiles_listas_publicas", {}, REVALIDAR)) ?? [];
  } catch {
    return [];
  }
}

export async function getListaUtiles(colegio: string, grado: string): Promise<ListaUtiles | null> {
  return rpc<ListaUtiles | null>("utiles_lista_publica", { p_colegio: colegio, p_grado: grado }, REVALIDAR);
}


export { anioEscolar, esReferencia } from "./anioEscolar";
