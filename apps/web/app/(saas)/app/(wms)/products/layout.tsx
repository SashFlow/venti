import type { ReactNode } from "react";
import { ProductsProvider } from "./lib/products-context";

export default function ProductsLayout({ children }: { children: ReactNode }) {
	return <ProductsProvider>{children}</ProductsProvider>;
}
