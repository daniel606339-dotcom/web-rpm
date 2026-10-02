"use client";

import { useCallback, useEffect, useState } from "react";
import { refrescarWeb, sb } from "./cliente";

interface Banner {
  id: number;
  titulo: string;
  enlace: string;
  imagen_escritorio: string | null;
  imagen_celular: string | null;
  orden: number;
  activo: boolean;
  desde: string | null;
  hasta: string | null;
}

const BUCKET = "web-banners";
const MAX_MB = 2;
const MEDIDAS = {
  escritorio: { w: 1280, h: 400, texto: "Computadora: 1280 × 400 px" },
  celular: { w: 720, h: 320, texto: "Celular: 720 × 320 px (opcional)" },
} as const;

const campo = "h-10 w-full rounded-lg border border-borde bg-white px-3 text-sm outline-none focus:border-marca";

// datetime-local <-> ISO (hora de Paraguay del navegador)
const aLocal = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const aIso = (local: string) => (local ? new Date(local).toISOString() : null);

function estado(b: Banner): { texto: string; clase: string } {
  const ahora = Date.now();
  if (!b.imagen_escritorio) return { texto: "Falta imagen", clase: "bg-[#fde2e1] text-[#8a1c13]" };
  if (!b.activo) return { texto: "Pausado", clase: "bg-[#e6e8ee] text-texto" };
  if (b.desde && new Date(b.desde).getTime() > ahora)
    return { texto: `Programado desde ${new Date(b.desde).toLocaleDateString("es-PY")}`, clase: "bg-[#fff1d6] text-[#7a4b00]" };
  if (b.hasta && new Date(b.hasta).getTime() <= ahora) return { texto: "Vencido", clase: "bg-[#e6e8ee] text-suave" };
  return { texto: "Visible en la web", clase: "bg-[#dff3e6] text-[#0d5b2b]" };
}

/** Lee el tamaño de una imagen antes de subirla. */
function medir(file: File): Promise<{ w: number; h: number }> {
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      ok({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => mal(new Error("No se pudo leer la imagen"));
    img.src = url;
  });
}

async function subir(file: File, tipo: keyof typeof MEDIDAS): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("La imagen tiene que ser JPG, PNG o WEBP.");
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`La imagen pesa más de ${MAX_MB} MB. Exportala más liviana (JPG calidad 80).`);
  const { w, h } = await medir(file);
  const m = MEDIDAS[tipo];
  const proporcion = w / h / (m.w / m.h);
  if (proporcion < 0.95 || proporcion > 1.05) {
    const seguir = confirm(
      `La imagen mide ${w} × ${h} px. Lo recomendado es ${m.w} × ${m.h} px: con otra proporción se va a recortar. ¿Subirla igual?`,
    );
    if (!seguir) throw new Error("cancelado");
  }
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const ruta = `${tipo}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(ruta, file, { cacheControl: "31536000", contentType: file.type });
  if (error) throw new Error(error.message);
  return sb.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}

export default function Banners({ email }: { email: string }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    const { data, error } = await sb.from("banners").select("*").order("orden").order("id");
    if (error) setError(error.message);
    else setBanners(data as Banner[]);
    setCargando(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(cargar, 0);
    return () => clearTimeout(t);
  }, [cargar]);

  /** Guarda y hace que la web lo muestre enseguida. */
  async function publicar(msg: string) {
    await cargar();
    const ok = await refrescarWeb();
    setAviso(ok ? `${msg} La web ya está actualizada.` : `${msg} La web lo va a mostrar en unos minutos.`);
    setTimeout(() => setAviso(null), 5000);
  }

  async function guardar(id: number, cambios: Partial<Banner>, msg = "Guardado.") {
    const { error } = await sb
      .from("banners")
      .update({ ...cambios, actualizado_at: new Date().toISOString(), actualizado_por: email })
      .eq("id", id);
    if (error) return alert(`No se pudo guardar: ${error.message}`);
    await publicar(msg);
  }

  async function mover(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= banners.length) return;
    const lista = [...banners];
    [lista[i], lista[j]] = [lista[j], lista[i]];
    const res = await Promise.all(lista.map((b, k) => sb.from("banners").update({ orden: (k + 1) * 10 }).eq("id", b.id)));
    const err = res.find((r) => r.error)?.error;
    if (err) return alert(`No se pudo ordenar: ${err.message}`);
    await publicar("Orden actualizado.");
  }

  async function eliminar(b: Banner) {
    if (!confirm(`¿Eliminar el banner "${b.titulo}"? No se puede deshacer.`)) return;
    const { error } = await sb.from("banners").delete().eq("id", b.id);
    if (error) return alert(`No se pudo eliminar: ${error.message}`);
    const rutas = [b.imagen_escritorio, b.imagen_celular]
      .filter((u): u is string => !!u && u.includes(`/${BUCKET}/`))
      .map((u) => u.split(`/${BUCKET}/`)[1]);
    if (rutas.length) await sb.storage.from(BUCKET).remove(rutas);
    await publicar("Banner eliminado.");
  }

  return (
    <div className="contenedor py-4 md:py-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Banners del inicio</h1>
        {!nuevo && (
          <button onClick={() => setNuevo(true)} className="h-10 rounded-lg bg-acento px-4 text-sm font-bold text-white hover:bg-acento-oscuro">
            + Nuevo banner
          </button>
        )}
      </div>
      <p className="mb-4 text-sm text-suave">
        Se muestran en el carrusel del inicio, en este orden. Medidas: {MEDIDAS.escritorio.texto} · {MEDIDAS.celular.texto}. JPG, PNG o WEBP de
        hasta {MAX_MB} MB. Si no cargás la de celular, se usa la de computadora.
      </p>

      {aviso && <p className="mb-4 rounded-lg bg-[#dff3e6] px-4 py-2.5 text-sm font-semibold text-[#0d5b2b]">{aviso}</p>}
      {error && <p className="mb-4 rounded-lg bg-[#fde2e1] px-4 py-2.5 text-sm text-[#8a1c13]">{error}</p>}

      {nuevo && (
        <FormularioNuevo
          email={email}
          orden={(banners.at(-1)?.orden ?? 0) + 10}
          onListo={async () => {
            setNuevo(false);
            await publicar("Banner creado.");
          }}
          onCancelar={() => setNuevo(false)}
        />
      )}

      {cargando ? (
        <p className="py-10 text-center text-suave">Cargando…</p>
      ) : banners.length === 0 && !nuevo ? (
        <div className="rounded-2xl border border-borde bg-white p-10 text-center text-suave">
          Todavía no hay banners. Mientras tanto la web muestra los espacios reservados.
        </div>
      ) : (
        <ul className="space-y-4">
          {banners.map((b, i) => (
            <TarjetaBanner
              key={b.id}
              b={b}
              primero={i === 0}
              ultimo={i === banners.length - 1}
              onGuardar={(c, msg) => guardar(b.id, c, msg)}
              onMover={(d) => mover(i, d)}
              onEliminar={() => eliminar(b)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SelectorImagen({
  tipo,
  url,
  onArchivo,
  ocupado,
}: {
  tipo: keyof typeof MEDIDAS;
  url: string | null;
  onArchivo: (f: File) => void;
  ocupado: boolean;
}) {
  const m = MEDIDAS[tipo];
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-titulo">{m.texto}</p>
      <label
        className={`relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-borde bg-fondo text-center text-xs text-suave hover:border-marca ${
          tipo === "escritorio" ? "aspect-[1280/400]" : "aspect-[720/320] max-w-[260px]"
        }`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="px-3">{ocupado ? "Subiendo…" : "Elegir imagen"}</span>
        )}
        {url && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
            {ocupado ? "Subiendo…" : "Cambiar"}
          </span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={ocupado}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) onArchivo(f);
          }}
        />
      </label>
    </div>
  );
}

function CamposTexto({
  v,
  set,
}: {
  v: { titulo: string; enlace: string; desde: string; hasta: string };
  set: (c: Partial<{ titulo: string; enlace: string; desde: string; hasta: string }>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm">
        <span className="mb-1 block font-semibold">Título (no se ve; lo leen Google y los lectores de pantalla)</span>
        <input className={campo} value={v.titulo} onChange={(e) => set({ titulo: e.target.value })} placeholder="Ej.: Promoción resmas octubre" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-semibold">Al hacer clic lleva a</span>
        <input className={campo} value={v.enlace} onChange={(e) => set({ enlace: e.target.value })} placeholder="/c/resmas o /buscar?q=resma" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-semibold">Mostrar desde (opcional)</span>
        <input type="datetime-local" className={campo} value={v.desde} onChange={(e) => set({ desde: e.target.value })} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-semibold">Mostrar hasta (opcional)</span>
        <input type="datetime-local" className={campo} value={v.hasta} onChange={(e) => set({ hasta: e.target.value })} />
      </label>
    </div>
  );
}

const enlaceValido = (e: string) => /^\/[^\s]*$/.test(e) || /^https:\/\/[^\s]+$/.test(e);

function FormularioNuevo({
  email,
  orden,
  onListo,
  onCancelar,
}: {
  email: string;
  orden: number;
  onListo: () => void;
  onCancelar: () => void;
}) {
  const [v, setV] = useState({ titulo: "", enlace: "/", desde: "", hasta: "" });
  const [img, setImg] = useState<{ escritorio: string | null; celular: string | null }>({ escritorio: null, celular: null });
  const [subiendo, setSubiendo] = useState<keyof typeof MEDIDAS | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function elegir(tipo: keyof typeof MEDIDAS, f: File) {
    setSubiendo(tipo);
    try {
      const url = await subir(f, tipo);
      setImg((x) => ({ ...x, [tipo]: url }));
    } catch (e) {
      if ((e as Error).message !== "cancelado") alert((e as Error).message);
    } finally {
      setSubiendo(null);
    }
  }

  async function crear() {
    if (!v.titulo.trim()) return alert("Poné un título.");
    if (!enlaceValido(v.enlace.trim())) return alert("El enlace tiene que empezar con / (una página de la web) o con https://");
    if (!img.escritorio) return alert("Falta la imagen de computadora.");
    setGuardando(true);
    const { error } = await sb.from("banners").insert({
      titulo: v.titulo.trim(),
      enlace: v.enlace.trim(),
      imagen_escritorio: img.escritorio,
      imagen_celular: img.celular,
      desde: aIso(v.desde),
      hasta: aIso(v.hasta),
      orden,
      actualizado_por: email,
    });
    setGuardando(false);
    if (error) return alert(`No se pudo crear: ${error.message}`);
    onListo();
  }

  return (
    <div className="mb-6 space-y-4 rounded-2xl border-2 border-marca/30 bg-white p-4 md:p-5">
      <h2 className="text-lg font-bold">Nuevo banner</h2>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <SelectorImagen tipo="escritorio" url={img.escritorio} ocupado={subiendo === "escritorio"} onArchivo={(f) => elegir("escritorio", f)} />
        <SelectorImagen tipo="celular" url={img.celular} ocupado={subiendo === "celular"} onArchivo={(f) => elegir("celular", f)} />
      </div>
      <CamposTexto v={v} set={(c) => setV((x) => ({ ...x, ...c }))} />
      <div className="flex gap-2">
        <button
          onClick={crear}
          disabled={guardando || !!subiendo}
          className="h-10 rounded-lg bg-marca px-5 text-sm font-bold text-white disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Publicar banner"}
        </button>
        <button onClick={onCancelar} className="h-10 px-3 text-sm text-suave underline">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function TarjetaBanner({
  b,
  primero,
  ultimo,
  onGuardar,
  onMover,
  onEliminar,
}: {
  b: Banner;
  primero: boolean;
  ultimo: boolean;
  onGuardar: (c: Partial<Banner>, msg?: string) => Promise<void>;
  onMover: (d: -1 | 1) => void;
  onEliminar: () => void;
}) {
  const [v, setV] = useState({ titulo: b.titulo, enlace: b.enlace, desde: aLocal(b.desde), hasta: aLocal(b.hasta) });
  const [subiendo, setSubiendo] = useState<keyof typeof MEDIDAS | null>(null);
  const e = estado(b);
  const cambiado = v.titulo !== b.titulo || v.enlace !== b.enlace || v.desde !== aLocal(b.desde) || v.hasta !== aLocal(b.hasta);

  async function reemplazar(tipo: keyof typeof MEDIDAS, f: File) {
    setSubiendo(tipo);
    try {
      const url = await subir(f, tipo);
      await onGuardar(tipo === "escritorio" ? { imagen_escritorio: url } : { imagen_celular: url }, "Imagen cambiada.");
    } catch (err) {
      if ((err as Error).message !== "cancelado") alert((err as Error).message);
    } finally {
      setSubiendo(null);
    }
  }

  return (
    <li className="space-y-4 rounded-2xl border border-borde bg-white p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${e.clase}`}>{e.texto}</span>
          <span className="text-sm font-semibold">{b.titulo}</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <button onClick={() => onMover(-1)} disabled={primero} className="h-9 w-9 rounded-lg border border-borde disabled:opacity-30" aria-label="Subir">
            ↑
          </button>
          <button onClick={() => onMover(1)} disabled={ultimo} className="h-9 w-9 rounded-lg border border-borde disabled:opacity-30" aria-label="Bajar">
            ↓
          </button>
          <button
            onClick={() => onGuardar({ activo: !b.activo }, b.activo ? "Banner pausado." : "Banner activado.")}
            className="h-9 rounded-lg border border-borde px-3"
          >
            {b.activo ? "Pausar" : "Activar"}
          </button>
          <button onClick={onEliminar} className="h-9 px-2 text-[#8a1c13] underline">
            Eliminar
          </button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <SelectorImagen tipo="escritorio" url={b.imagen_escritorio} ocupado={subiendo === "escritorio"} onArchivo={(f) => reemplazar("escritorio", f)} />
        <div>
          <SelectorImagen tipo="celular" url={b.imagen_celular} ocupado={subiendo === "celular"} onArchivo={(f) => reemplazar("celular", f)} />
          {b.imagen_celular && (
            <button onClick={() => onGuardar({ imagen_celular: null }, "Imagen de celular quitada.")} className="mt-1 text-xs text-suave underline">
              Quitar imagen de celular
            </button>
          )}
        </div>
      </div>
      <CamposTexto v={v} set={(c) => setV((x) => ({ ...x, ...c }))} />
      {cambiado && (
        <button
          onClick={() => {
            if (!v.titulo.trim()) return alert("Poné un título.");
            if (!enlaceValido(v.enlace.trim())) return alert("El enlace tiene que empezar con / (una página de la web) o con https://");
            onGuardar({ titulo: v.titulo.trim(), enlace: v.enlace.trim(), desde: aIso(v.desde), hasta: aIso(v.hasta) });
          }}
          className="h-10 rounded-lg bg-marca px-5 text-sm font-bold text-white"
        >
          Guardar cambios
        </button>
      )}
    </li>
  );
}
