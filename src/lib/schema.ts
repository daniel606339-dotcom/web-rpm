import { HORARIO_ATENCION, SITE } from "./config";

/**
 * Datos estructurados (schema.org) de la empresa. Le dicen a Google y a las IA
 * quién es RPM: nombre legal, dirección, contacto y perfiles oficiales.
 * Tienen que coincidir letra por letra con el Perfil de Empresa de Google.
 */

/** Identificador estable de la empresa: los productos y el sitio la referencian por este @id. */
export const ID_ORGANIZACION = `${SITE.url}/#organizacion`;
export const ID_SITIO = `${SITE.url}/#sitio`;

export function schemaOrganizacion() {
  return {
    "@context": "https://schema.org",
    // Store = comercio con local físico; es a la vez Organization y LocalBusiness.
    "@type": "Store",
    "@id": ID_ORGANIZACION,
    name: SITE.nombre,
    legalName: SITE.razonSocial,
    alternateName: "RPM",
    description: SITE.descripcion,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    image: `${SITE.url}/compartir.png`,
    email: SITE.email,
    telephone: `+${SITE.telefono}`,
    taxID: SITE.ruc,
    foundingDate: SITE.fundacion,
    currenciesAccepted: SITE.moneda,
    address: {
      "@type": "PostalAddress",
      streetAddress: `12 de Octubre N° 521, ${SITE.entreCalles}, Barrio Pinozá`,
      addressLocality: SITE.ciudad,
      postalCode: "001236",
      addressCountry: SITE.pais,
    },
    geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    hasMap: `https://www.google.com/maps?q=${SITE.geo.lat},${SITE.geo.lng}`,
    openingHoursSpecification: HORARIO_ATENCION.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dias,
      opens: h.abre,
      closes: h.cierra,
    })),
    areaServed: { "@type": "Country", name: "Paraguay" },
    sameAs: SITE.redes.map((r) => r.url),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${SITE.whatsapp}`,
      email: SITE.email,
      contactType: "sales",
      areaServed: "PY",
      availableLanguage: "es",
    },
  };
}

/** El sitio, con la búsqueda interna (las IA y Google la usan para buscar productos en RPM). */
export function schemaSitio() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": ID_SITIO,
    name: SITE.nombre,
    url: SITE.url,
    inLanguage: "es-PY",
    publisher: { "@id": ID_ORGANIZACION },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/buscar?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Preguntas frecuentes: solo preguntas que los clientes hacen de verdad, con la respuesta visible en la página. */
export function schemaPreguntas(preguntas: { pregunta: string; respuesta: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((p) => ({
      "@type": "Question",
      name: p.pregunta,
      acceptedAnswer: { "@type": "Answer", text: p.respuesta },
    })),
  };
}
