/**
 * Excel del pedido para importar en el ERP. Copia el formato del export de Porta:
 * - una hoja con el nombre del pedido (p. ej. "W000001")
 * - fila 1 con encabezados: "Código de Artículo" | "Cantidad" | "Precio"
 * - todas las celdas como TEXTO (formato @), incluidos cantidad y precio
 */
export interface ItemExcel {
  cod_articulo: string;
  cantidad: number | string;
  precio: number | string;
}

const texto = (v: string | number) => ({ type: String, format: "@", value: String(v) });

export function hojaPedido(items: ItemExcel[]) {
  return [
    [texto("Código de Artículo"), texto("Cantidad"), texto("Precio")],
    ...items.map((i) => [texto(i.cod_articulo), texto(Math.round(Number(i.cantidad))), texto(Math.round(Number(i.precio)))]),
  ];
}

export const COLUMNAS_EXCEL = [{ width: 20 }, { width: 10 }, { width: 12 }];
