import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFlotante from "@/components/WhatsAppFlotante";
import NavInferior from "@/components/NavInferior";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/config";

// Google Tag Manager: cargar SOLO en el dominio real (variable definida en Vercel
// para Production). Si no, las pruebas en la dirección de prueba contarían como conversiones.
const GTM = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Distribuidora RPM | Librería, limpieza y papelería para empresas",
    template: "%s | Distribuidora RPM",
  },
  description: SITE.descripcion,
  openGraph: { siteName: SITE.nombre, locale: "es_PY", type: "website" },
  // Solo se indexa cuando RPM_INDEXAR=1 (se activa al pasar al dominio real).
  robots: process.env.RPM_INDEXAR === "1" ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#01297e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PY" className="h-full antialiased">
      <body className="flex min-h-full flex-col pb-16 md:pb-0">
        {GTM && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');`}
          </Script>
        )}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFlotante />
        <NavInferior />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Distribuidora RPM S.A.",
            url: SITE.url,
            contactPoint: {
              "@type": "ContactPoint",
              telephone: `+${SITE.whatsapp}`,
              contactType: "sales",
              areaServed: "PY",
              availableLanguage: "es",
            },
          }}
        />
      </body>
    </html>
  );
}
