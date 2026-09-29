const nf = new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 });

/** 64600 -> "Gs. 64.600" */
export function gs(valor: number | null | undefined): string {
  if (valor == null) return "Consultar";
  return `Gs. ${nf.format(valor)}`;
}

/** Igual que web.slugify() en Supabase, para que las URL coincidan. */
export function slugify(t: string | null | undefined): string {
  const desde = "ÁÉÍÓÚÜÑáéíóúüñÀÈÌÒÙàèìòùÂÊÎÔÛâêîôû";
  const hacia = "AEIOUUNaeiouunAEIOUaeiouAEIOUaeiou";
  let s = "";
  for (const ch of t ?? "") {
    const i = desde.indexOf(ch);
    s += i >= 0 ? hacia[i] : ch;
  }
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function urlProducto(p: { cod_articulo: string; slug?: string | null; nombre: string }) {
  return `/p/${encodeURIComponent(p.cod_articulo)}/${p.slug || slugify(p.nombre)}`;
}

export function linkWhatsApp(numero: string, texto: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/** 20440 -> "20.440 disponibles" */
export function disponibles(n: number | null | undefined): string {
  const v = Math.floor(Number(n ?? 0));
  return v > 0 ? `${nf.format(v)} disponible${v === 1 ? "" : "s"}` : "Sin stock";
}
