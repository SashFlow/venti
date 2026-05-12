import type { ReactNode } from "react";
import { WorkforceProvider } from "./lib/workforce-context";

export default function WorkforceLayout({ children }: { children: ReactNode }) {
	return <WorkforceProvider>{children}</WorkforceProvider>;
}
