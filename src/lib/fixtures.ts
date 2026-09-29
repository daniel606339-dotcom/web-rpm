/**
 * Datos de ejemplo para desarrollar sin conexión a Supabase (RPM_FIXTURES=1).
 * No se usan en producción.
 */
import type { Consulta, Resultado } from "./db";
import { limpiarBusqueda } from "./db";

type Fila = Record<string, unknown>;

const FOTO = (c: string) =>
  `https://yrvunjrqxowuraezggdh.supabase.co/storage/v1/object/public/imagenes-articulos/IMAG_DISENHO/CODIFICADO/${c}/${c}.jpg`;

const departamentos: Fila[] = [
  ["libreria", "Librería"],
  ["papeleria", "Papelería"],
  ["higiene", "Higiene"],
  ["limpieza", "Limpieza"],
  ["empaque", "Empaque"],
  ["alimentos-y-bebidas", "Alimentos y bebidas"],
  ["informatica", "Informática"],
  ["hogar", "Hogar"],
  ["mantenimiento-integral", "Mantenimiento integral"],
].map(([slug, nombre], i) => ({ slug, nombre, orden: i + 1, visible: true }));

const lineas: Fila[] = [
  ["11", "Boligrafos", "boligrafos", "libreria"],
  ["224", "Marcador Permanente", "marcador-permanente", "libreria"],
  ["62", "Resmas", "resmas", "papeleria"],
  ["64", "Cuadernos Escolares", "cuadernos-escolares", "papeleria"],
  ["26", "Detergentes", "detergentes", "higiene"],
  ["33", "Jabon Liquido", "jabon-liquido", "higiene"],
  ["32", "Film Plasticos", "film-plasticos", "empaque"],
  ["8", "Cafe", "cafe", "alimentos-y-bebidas"],
  ["21", "Pilas", "pilas", "informatica"],
  ["41", "Basureros", "basureros", "mantenimiento-integral"],
  ["30", "Paños", "panos", "limpieza"],
  ["2", "Biblioratos", "biblioratos", "libreria"],
  ["27", "Cintas", "cintas", "libreria"],
  ["17", "Dispensadores", "dispensadores", "higiene"],
  ["54", "Pizarras", "pizarras", "libreria"],
].map(([cod_linea, nombre, slug, departamento]) => ({ cod_linea, nombre, slug, departamento, publicar: true }));

const linea_menu: Fila[] = [
  { cod_linea: "26", departamento: "limpieza" },
  { cod_linea: "41", departamento: "limpieza" },
];

const rubros_negocio: Fila[] = [
  ["oficinas", "Oficinas", "Resmas, biblioratos, escritura, cafetería, papel higiénico"],
  ["colegios-y-universidades", "Colegios y universidades", "Útiles escolares, pizarras, resmas, higiene institucional"],
  ["restaurantes-y-cafeterias", "Restaurantes y cafeterías", "Descartables, film, bolsas, limpieza, servilletas"],
  ["clinicas-y-consultorios", "Clínicas y consultorios", "Cofias, guantes, dispensadores, químicos de limpieza"],
  ["industrias-y-depositos", "Industrias y depósitos", "Film stretch, cintas, embalaje, seguridad, contenedores"],
  ["hoteles", "Hoteles", "Papel higiénico, amenities, bolsas de residuo, limpieza"],
].map(([slug, nombre, descripcion], i) => ({ slug, nombre, descripcion, orden: i + 1, visible: true }));

const rubro_negocio_linea: Fila[] = [
  { rubro: "oficinas", cod_linea: "11" },
  { rubro: "oficinas", cod_linea: "62" },
  { rubro: "industrias-y-depositos", cod_linea: "32" },
];

const colecciones: Fila[] = [
  { slug: "bolsas-plasticas", nombre: "Bolsas plásticas", cod_familia: "34", departamento: "hogar", publicar: true },
  { slug: "embalajes", nombre: "Embalajes", cod_familia: "4", departamento: "libreria", publicar: true },
  { slug: "rollos-de-papel", nombre: "Rollos de papel", cod_familia: "16", departamento: "papeleria", publicar: true },
  { slug: "cafeteria", nombre: "Cafetería", cod_familia: "15", departamento: "alimentos-y-bebidas", publicar: true },
];

const marcas: Fila[] = [
  ["1", "Bic", "bic"],
  ["2", "Foska", "foska"],
  ["3", "Artline", "artline"],
  ["4", "Basy", "basy"],
].map(([cod_marca, nombre, slug]) => ({ cod_marca, nombre_erp: nombre, nombre, slug, publicar: true }));

const L = Object.fromEntries(lineas.map((l) => [l.cod_linea, l]));
const M = Object.fromEntries(marcas.map((m) => [m.slug, m]));

function prod(cod: string, nombre: string, precio: number, stock: number, linea: string, marca: string, barra = ""): Fila {
  const l = L[linea] as Fila;
  const m = M[marca] as Fila;
  return {
    cod_articulo: cod,
    cod_barra_art: barra || null,
    cod_int_articulo: null,
    nombre,
    descripcion_erp: nombre,
    foto_url: FOTO(cod),
    precio_venta: precio,
    cant_dispon: stock,
    stock_actualizado_at: new Date().toISOString(),
    cod_linea: linea,
    linea_slug: l.slug,
    linea_nombre: l.nombre,
    departamento: l.departamento,
    slug: null,
    seo_title: null,
    seo_description: null,
    texto: null,
    cod_marca: m?.cod_marca ?? null,
    marca_slug: m?.slug ?? null,
    marca_nombre: m?.nombre ?? null,
    cod_familia: "1",
  };
}

const productos: Fila[] = [
  prod("403513", "Boligrafo Foska Azul Punta 1.0 ref:XH0927", 700, 20440, "11", "foska", "6937544340030"),
  prod("404513", "Boligrafo Foska Negro Punta 1.0 ref:XH0927", 800, 12490, "11", "foska", "6937544340085"),
  prod("R11482", "Boligrafos Bic Round Stic Azul unidad", 1400, 1143, "11", "bic", "070330201200"),
  prod("0000000000082", "Boligrafos Bic cristal azul por unidad", 1700, 1003, "11", "bic", "070330129627"),
  prod("Z0064RED", "Boligrafo Stopen Red Basy azul", 5100, 1000, "11", "basy"),
  prod("0000000000083", "Boligrafos Bic cristal negro por unidad", 1700, 997, "11", "bic"),
  prod("4974052801303", "Marcador Artline EK 70 Negro", 8400, 942, "11", "artline"),
  prod("4974052802300", "Marcador Artline 90 Negro", 8400, 639, "11", "artline"),
  prod("R11481", "Boligrafos Bic Round Stic Negro unidad", 1400, 634, "11", "bic"),
  prod("Z0064", "Boligrafo de mesa azul Basy tinta azul", 5100, 539, "11", "basy"),
  prod("RH3009", "Boligel Borrable Foska Blister de 3 Colores", 9000, 260, "11", "foska"),
  prod("4974052808517", "Marcador Artline Ek100 Azul", 15500, 0, "11", "artline"),
  prod("R11725", "Film Stretch Rollo X 2,5 Kg. pre estirado", 64600, 85, "32", "", ""),
  prod("7792540231091", "Resma Executive A4", 24800, 660, "62", "", ""),
  prod("FILMSTRECH2K", "Film Strech pre estirado 45 cm x 380 metros 2 kg", 50700, 67, "32", "", ""),
];

const lineas_con_stock: Fila[] = lineas.map((l) => ({ cod_linea: l.cod_linea }));

const localidades: Fila[] = [
  { id: 1, nombre: "Asunción", costo_envio: 20000, tipo: "envio" },
  { id: 3, nombre: "Luque", costo_envio: 25000, tipo: "envio" },
  { id: 19, nombre: "Interior del país (cobro a destino)", costo_envio: 0, tipo: "interior" },
  { id: 21, nombre: "Retiro en Centro de Distribución", costo_envio: 0, tipo: "retiro" },
];

const tablas: Record<string, Fila[]> = { lineas_con_stock, localidades, departamentos, lineas, linea_menu, colecciones, marcas, productos, rubros_negocio, rubro_negocio_linea };

function sinTildes(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export async function consultarFixture<T>(tabla: string, q: Consulta): Promise<Resultado<T>> {
  let filas = [...(tablas[tabla] ?? [])];
  for (const f of q.filtros ?? []) {
    filas = filas.filter((r) => {
      switch (f.op) {
        case "eq":
          return String(r[f.col]) === String(f.val);
        case "in":
          return f.val.map(String).includes(String(r[f.col]));
        case "gt":
          return Number(r[f.col] ?? -Infinity) > f.val;
        case "notnull":
          return r[f.col] != null;
        case "buscar":
          return limpiarBusqueda(f.texto).every((w) =>
            f.cols.some((c) => sinTildes(String(r[c] ?? "")).includes(sinTildes(w))),
          );
      }
    });
  }
  for (const o of [...(q.orden ?? [])].reverse()) {
    filas.sort((a, b) => {
      const x = a[o.col] as number | string | null;
      const y = b[o.col] as number | string | null;
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "es");
      return o.desc ? -c : c;
    });
  }
  const total = filas.length;
  const desde = q.desde ?? 0;
  filas = filas.slice(desde, q.limite != null ? desde + q.limite : undefined);
  return { filas: filas as T[], total: q.contar ? total : null };
}

export async function rpcFixture<T>(funcion: string, args: Record<string, unknown>): Promise<T> {
  if (funcion === "resolver_redireccion") {
    const path = String(args.p_path ?? "");
    const m = path.match(/\/marca\/\d+\/([^/?]+)/);
    return (m ? `/m/${m[1]}` : null) as T;
  }
  return null as T;
}
