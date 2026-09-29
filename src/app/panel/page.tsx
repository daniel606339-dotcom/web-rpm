import type { Metadata } from "next";
import Panel from "./Panel";

export const metadata: Metadata = {
  title: "Panel de pedidos",
  robots: { index: false, follow: false },
};

export default function PaginaPanel() {
  return <Panel />;
}
