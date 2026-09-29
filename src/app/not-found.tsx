import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="contenedor py-16 text-center">
      <h1 className="text-3xl font-bold">No encontramos esta página</h1>
      <p className="mt-2 text-suave">Puede que el producto ya no esté disponible. Probá buscarlo:</p>
      <form action="/buscar" className="mx-auto mt-6 flex max-w-md">
        <input name="q" type="search" placeholder="Producto, marca o código" className="h-12 flex-1 rounded-l-lg border border-borde px-4" />
        <button className="rounded-r-lg bg-acento px-5 font-semibold text-white">Buscar</button>
      </form>
      <Link href="/" className="mt-6 inline-block text-marca underline">
        Volver al inicio
      </Link>
    </div>
  );
}
