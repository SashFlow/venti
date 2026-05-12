import type { ReactNode } from "react";
import { VendorsProvider } from "./lib/vendors-context";

export default function VendorsLayout({ children }: { children: ReactNode }) {
	return <VendorsProvider>{children}</VendorsProvider>;
}
