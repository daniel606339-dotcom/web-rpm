import { SITE } from "@/lib/config";
import { linkWhatsApp } from "@/lib/format";
import { IconoWhatsApp } from "./iconos";

export default function WhatsAppFlotante() {
  return (
    <a
      href={linkWhatsApp(SITE.whatsapp, "Hola RPM, quiero hacer una consulta.")}
      target="_blank"
      rel="noopener"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-20 right-4 md:bottom-5 md:right-5 z-30 flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition hover:scale-105"
    >
      <IconoWhatsApp className="size-8" />
    </a>
  );
}
