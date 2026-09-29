import Link from "next/link";

/**
 * Carrusel de banners del inicio (se desliza con el dedo en celular).
 * Para usar imágenes: subirlas a /public/banners/ y completar "imagen".
 */
interface Banner {
  titulo: string;
  texto: string;
  boton: string;
  href: string;
  imagen?: string; // p. ej. "/banners/vuelta-a-clases.jpg"
  fondo: string;
}

const BANNERS: Banner[] = [
  {
    titulo: "Todo para tu oficina, en un solo pedido",
    texto: "Librería, papelería, limpieza y cafetería con factura legal y entrega.",
    boton: "Ver catálogo",
    href: "/buscar",
    fondo: "from-marca to-marca-oscuro",
  },
  {
    titulo: "Resmas y papelería al por mayor",
    texto: "Precios por volumen para empresas e instituciones.",
    boton: "Ver papelería",
    href: "/d/papeleria",
    fondo: "from-[#0b3fa8] to-marca",
  },
  {
    titulo: "Limpieza e higiene institucional",
    texto: "Detergentes, dispensadores, bolsas y más.",
    boton: "Ver limpieza",
    href: "/d/limpieza",
    fondo: "from-acento-oscuro to-acento",
  },
];

export default function Banners() {
  return (
    <section aria-label="Promociones" className="contenedor mt-4">
      <ul className="scroll-x flex snap-x snap-mandatory gap-3">
        {BANNERS.map((b, i) => (
          <li key={i} className="w-full shrink-0 snap-center">
            <Link
              href={b.href}
              className={`relative flex min-h-44 flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-r ${b.fondo} p-6 text-white md:min-h-72 md:p-12`}
              style={b.imagen ? { backgroundImage: `url(${b.imagen})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              <h2 className="max-w-xl text-2xl font-extrabold leading-tight md:text-4xl">{b.titulo}</h2>
              <p className="mt-2 max-w-lg text-sm text-white/85 md:text-lg">{b.texto}</p>
              <span className="mt-4 w-fit rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-marca">{b.boton}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
