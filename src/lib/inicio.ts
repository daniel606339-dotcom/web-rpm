/**
 * Contenido editable del inicio. Cambiar acá y subir: Vercel publica solo.
 */

/** "Lo más pedido": códigos de artículo en el orden en que se muestran. */
export const LO_MAS_PEDIDO = [
  "7792540231091", // Resma Executive A4
  "R11725", // Film stretch 2,5 kg
  "FILMSTRECH2K", // Film stretch 2 kg
  "0000000000539", // Detergente Aromas 5 L
  "R11472", // Bolsa residuos 80 L
  "7891000414903", // Nescafé 160 g
  "R11482", // Bolígrafo Bic Round Stic azul
  "0000000000641", // Borrador pizarra Stalo
];

/** "Categorías más buscadas": slug de línea o colección (/c/...). La foto sale del primer producto con stock. */
export const CATEGORIAS_BUSCADAS = [
  "bolsas-plasticas",
  "resmas",
  "embalajes",
  "rollos-de-papel",
  "dispensadores",
  "biblioratos",
  "cintas",
  "pizarras",
];

/** Búsquedas rápidas bajo el buscador en celular. */
export const BUSQUEDAS_RAPIDAS = ["Resmas", "Film stretch", "Biblioratos", "Bolsas de residuo", "Detergente"];

/** Carrusel del inicio. Con "imagen" vacía se muestra el espacio reservado. */
export interface Banner {
  titulo: string;
  href: string;
  imagen?: string; // escritorio 1280×400, p. ej. "/banners/promo-1.jpg"
  imagenCelular?: string; // celular 720×320
}

export const BANNERS: Banner[] = [
  { titulo: "Banner 1 · Promoción del mes", href: "/buscar" },
  { titulo: "Banner 2 · Vuelta a clases", href: "/rubro/colegios-y-universidades" },
  { titulo: "Banner 3 · Limpieza institucional", href: "/d/limpieza" },
];
