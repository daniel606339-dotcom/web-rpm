export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Escapar "<" evita cerrar la etiqueta si algún texto trae "</script>".
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
