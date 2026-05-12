import type { ReactNode } from "react";
import { CustomersProvider } from "./lib/customers-context";

export default function CustomersLayout({ children }: { children: ReactNode }) {
	return <CustomersProvider>{children}</CustomersProvider>;
}
