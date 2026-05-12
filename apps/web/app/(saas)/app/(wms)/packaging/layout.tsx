import type { ReactNode } from "react";
import { PackagingProvider } from "./lib/packaging-context";

export default function PackagingLayout({ children }: { children: ReactNode }) {
	return <PackagingProvider>{children}</PackagingProvider>;
}
