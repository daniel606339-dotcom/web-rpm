// presupuesto-ia: lee el pedido de un cliente (texto de WhatsApp o correo, PDF o foto),
// lo separa en renglones con Claude y sugiere el artículo de RPM para cada uno.
// Solo personal de RPM (web.staff). Secretos: ANTHROPIC_API_KEY (obligatorio),
// OPENAI_API_KEY (opcional: suma búsqueda por similitud con los embeddings del catálogo).
import { createClient } from "npm:@supabase/supabase-js@2";

const MODELO = "claude-sonnet-5";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Renglon {
  texto: string;
  cantidad: number;
  busqueda: string;
  patrones?: string[];
  excluir?: string | null;
  marca?: string | null;
}
interface Candidato {
  cod_articulo: string;
  nombre: string;
  precio_lista: number;
  precio: number;
  regla: string;
  cant_dispon: number;
  porc_iva: number;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

async function claude(system: string, content: unknown[], maxTokens = 4000): Promise<string> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: MODELO, max_tokens: maxTokens, system, messages: [{ role: "user", content }] }),
  });
  if (!r.ok) throw new Error(`Claude respondió ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const d = await r.json();
  return (d.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("");
}

function extraerJson<T>(texto: string): T {
  const i = texto.indexOf("{");
  const f = texto.lastIndexOf("}");
  if (i < 0 || f < i) throw new Error("La IA no devolvió datos legibles");
  return JSON.parse(texto.slice(i, f + 1)) as T;
}

const norm = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[°º]/g, ".").replace(/\s+/g, " ").trim();

/** Texto para lo aprendido: sin la cantidad del principio ("12 resma oficio" -> "resma oficio"). Igual que web.norm_aprendizaje. */
const normAprendizaje = (t: string) => {
  const n = norm(t);
  const sin = n.replace(/^\d+([.,]\d+)?\s*(x\s+|u\.?\s+|unid\.?\s+|unidades\s+)?/, "").trim();
  return sin || n;
};

async function embedding(texto: string): Promise<number[] | null> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return null;
  const r = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "text-embedding-3-small", input: texto }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d.data?.[0]?.embedding ?? null;
}

const SISTEMA_LECTURA = `Sos asistente de ventas de Distribuidora RPM (Paraguay): artículos de librería, papelería, limpieza, higiene, empaque, cafetería e informática para empresas.
Te paso el pedido o la consulta de un cliente (mensaje de WhatsApp, correo, PDF o foto). Extraé cada producto pedido como un renglón.
Reglas:
- Un renglón por producto. Si un renglón agrupa varios productos, separalos.
- cantidad: número de unidades pedidas (si dice "2 cajas de 10", poné 2 y aclaralo en "texto"). Si no dice cantidad, 1.
- texto: lo que pidió el cliente, tal cual, corto.
- busqueda: 2 a 6 palabras clave para buscar en un catálogo (producto + medida/tipo + marca si la exige), en minúsculas, sin cantidades del pedido. Usá términos de Paraguay: resma, bibliorato, plasticola, borrador, papel higiénico, lavandina, detergente, bolsa de residuos, etc.
- patrones: 1 a 4 expresiones regulares (minúsculas, sin acentos) que el NOMBRE del artículo debe cumplir TODAS. Usá alternativas para sinónimos y variantes, por ejemplo ["(boligrafo|lapicera)", "azul"], ["resma", "oficio"], ["(folio|funda)"], ["(plasticola|adhesivo vinilico|cola blanca)"], ["(borrador|goma de borrar)"], ["(post.?it|notas? adhesiv|taco adhesiv)"], ["(cinta|teipe)", "(papel|enmascarar)"], ["(porta ?(boligrafo|lapiz|lapices)|organizador de escritorio|cubilete)"]. Medidas con alternativas: "(48|50) ?h". No pongas cantidades del pedido ni palabras de relleno.
- excluir: una expresión regular de lo que NO es (falsos positivos), por ejemplo "goma eva" al buscar borrador, "tapa|encuaderna" al buscar folios, o null.
- Sinónimos de Paraguay: borrador/goma, plasticola/cola blanca/adhesivo vinílico, crayola/crayón, lápiz de papel/grafito, sacapunta/sacapuntas, bibliorato/archivador, folio/funda, presilladora/abrochadora, chinche/tachuela, cinta scotch/cinta adhesiva, lavandina/cloro.
- marca: solo si el cliente la exige.
- Ignorá saludos, firmas y datos que no sean productos.
- Si el mensaje trae datos del cliente (razón social, RUC, contacto, correo, teléfono), devolvelos en "cliente".
Respondé SOLO con JSON: {"cliente":{"razon_social":null,"ruc":null,"contacto":null,"email":null,"telefono":null},"renglones":[{"texto":"","cantidad":1,"busqueda":"","patrones":[""],"excluir":null,"marca":null}]}`;

const SISTEMA_ELECCION = `Sos vendedora experta de Distribuidora RPM (Paraguay). Para cada renglón pedido por el cliente te paso candidatos del catálogo (código, nombre, precio, stock).
Elegí el mejor candidato para cada renglón, como lo haría una vendedora:
- "igual": es el producto pedido o cumple todo lo pedido.
- "equivalente": sirve pero difiere (otra marca, otra medida, otra presentación). Explicá la diferencia en "nota" (corta).
- "no_trabajamos": ningún candidato sirve. cod = null.
STOCK: elegí SIEMPRE un artículo con stock (stock > 0) si alguno sirve, aunque sea "equivalente". Solo elegí uno sin stock si ningún candidato con stock sirve, y poné "sin stock" en la nota. Muchos artículos sin stock están discontinuados.
Si el cliente no especifica un atributo (color, tamaño, marca), elegí la opción más común (azul o negro en bolígrafos, A4 u oficio según lo pedido) entre las que tienen más stock, y aclaralo en la nota.
Fijate que el candidato sea el MISMO tipo de producto (un porta bolígrafos no es un bolígrafo; un folio no es una tapa de encuadernación). Si no hay del mismo tipo, es "no_trabajamos".
Si el cliente exige marca y no hay, es "equivalente" y la nota lo dice.
Si el renglón trae "elegido_antes", es el artículo que una vendedora de RPM eligió antes para ese mismo pedido: elegilo, salvo que no tenga stock y haya otro del mismo tipo con stock.
Respondé SOLO con JSON: {"elecciones":[{"i":0,"cod":"...","coincidencia":"igual","nota":""}]}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const usuario = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      db: { schema: "web" },
    });
    const { data: esStaff } = await usuario.rpc("es_staff");
    if (!esStaff) return json({ error: "Solo personal de RPM" }, 403);
    if (!Deno.env.get("ANTHROPIC_API_KEY")) return json({ error: "Falta configurar ANTHROPIC_API_KEY en Supabase" }, 500);

    const body = await req.json();
    const texto: string = String(body.texto ?? "").slice(0, 20000);
    const archivo: { data: string; tipo: string } | null = body.archivo ?? null;
    const codCliente: string | null = body.cod_cliente || null;
    if (!texto.trim() && !archivo) return json({ error: "Pegá el mensaje o adjuntá un archivo" }, 400);

    // 1) Leer el mensaje y separarlo en renglones
    const contenido: unknown[] = [];
    if (archivo?.data) {
      if (archivo.tipo === "application/pdf") {
        contenido.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: archivo.data } });
      } else if (/^image\/(png|jpeg|webp|gif)$/.test(archivo.tipo)) {
        contenido.push({ type: "image", source: { type: "base64", media_type: archivo.tipo, data: archivo.data } });
      } else {
        return json({ error: "Formato no soportado: usá PDF, JPG, PNG o pegá el texto" }, 400);
      }
    }
    contenido.push({ type: "text", text: texto.trim() ? `Mensaje del cliente:\n${texto}` : "Extraé los productos del archivo adjunto." });
    const lectura = extraerJson<{ cliente?: Record<string, string | null>; renglones: Renglon[] }>(
      await claude(SISTEMA_LECTURA, contenido, 6000),
    );
    const renglones = (lectura.renglones ?? []).filter((r) => r.texto || r.busqueda).slice(0, 120);
    if (renglones.length === 0) return json({ cliente: lectura.cliente ?? null, renglones: [] });

    // 2) Candidatos: lo aprendido + búsqueda por texto + (opcional) similitud
    const servicio = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { db: { schema: "web" } });
    const textos = renglones.map((r) => normAprendizaje(r.texto));
    const { data: aprendidas } = await servicio
      .from("asignaciones_texto")
      .select("texto_norm, cod_cliente, cod_articulo")
      .in("texto_norm", textos)
      .in("cod_cliente", [codCliente ?? "", ""]);

    const previas: (string | null)[] = textos.map(
      (t) =>
        ((aprendidas ?? []).find((a) => a.texto_norm === t && a.cod_cliente === (codCliente ?? "")) ??
          (aprendidas ?? []).find((a) => a.texto_norm === t))?.cod_articulo ?? null,
    );

    const candidatos: Candidato[][] = await Promise.all(
      renglones.map(async (r, i) => {
        const lista = new Map<string, Candidato>();
        const buscar = async (q: string, n: number) => {
          const { data } = await servicio.rpc("buscar_articulos_vendedor", { p_q: q, p_cod_cliente: codCliente, p_limite: n });
          for (const c of (data ?? []) as Candidato[]) if (!lista.has(c.cod_articulo)) lista.set(c.cod_articulo, c);
        };
        if (previas[i]) await buscar(previas[i]!, 1);
        const patrones = (r.patrones ?? []).filter((x) => x && x.trim());
        const porPatron = async (conStock: boolean, n: number) => {
          if (!patrones.length) return;
          const { data } = await servicio.rpc("buscar_articulos_patrones", {
            p_patrones: patrones, p_excluir: r.excluir ?? null, p_cod_cliente: codCliente, p_con_stock: conStock, p_limite: n,
          });
          for (const c of (data ?? []) as Candidato[]) if (!lista.has(c.cod_articulo)) lista.set(c.cod_articulo, c);
        };
        // primero lo que tiene stock, después unos pocos sin stock como referencia
        await porPatron(true, 8);
        const { data: porTexto } = await servicio.rpc("buscar_articulos_vendedor", {
          p_q: r.busqueda || r.texto, p_cod_cliente: codCliente, p_limite: 6, p_con_stock: true,
        });
        for (const c of (porTexto ?? []) as Candidato[]) if (!lista.has(c.cod_articulo)) lista.set(c.cod_articulo, c);
        const emb = await embedding(r.busqueda || r.texto);
        if (emb) {
          const { data: cercanos } = await servicio.rpc("buscar_articulos_embedding", { p_emb: emb, p_limite: 6 });
          for (const c of (cercanos ?? []) as { cod_articulo: string }[]) if (!lista.has(c.cod_articulo)) await buscar(c.cod_articulo, 1);
        }
        await porPatron(false, 3);
        if (lista.size < 3) await buscar(r.busqueda || r.texto, 6);
        // con stock primero
        return [...lista.values()].sort((a, b) => Number(Number(b.cant_dispon) > 0) - Number(Number(a.cant_dispon) > 0)).slice(0, 16);
      }),
    );

    // 3) Elegir el mejor candidato de cada renglón
    const resumen = renglones.map((r, i) => ({
      i,
      pedido: r.texto,
      cantidad: r.cantidad,
      marca_exigida: r.marca ?? null,
      elegido_antes: previas[i] && candidatos[i].some((c) => c.cod_articulo === previas[i]) ? previas[i] : null,
      candidatos: candidatos[i].map((c) => ({ cod: c.cod_articulo, nombre: c.nombre, precio: c.precio, stock: Math.floor(Number(c.cant_dispon) || 0) })),
    }));
    const eleccion = extraerJson<{ elecciones: { i: number; cod: string | null; coincidencia: string; nota?: string }[] }>(
      await claude(SISTEMA_ELECCION, [{ type: "text", text: JSON.stringify(resumen) }], 6000),
    );
    const porIndice = new Map(eleccion.elecciones.map((e) => [e.i, e]));

    return json({
      cliente: lectura.cliente ?? null,
      renglones: renglones.map((r, i) => {
        const e = porIndice.get(i);
        const valido = e?.cod && candidatos[i].some((c) => c.cod_articulo === e.cod) ? e.cod : null;
        return {
          texto: r.texto,
          cantidad: Math.max(1, Math.round(Number(r.cantidad) || 1)),
          cod: valido,
          coincidencia: valido ? (e?.coincidencia === "igual" ? "igual" : "equivalente") : "no_trabajamos",
          nota: e?.nota ?? "",
          candidatos: candidatos[i],
        };
      }),
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
