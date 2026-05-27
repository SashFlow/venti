import { getSession } from "@saas/auth/lib/server";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
	const session = await getSession();
	const organizationId = session?.session.activeOrganizationId ?? "";

	return (
		<div className="container py-8 max-w-7xl mx-auto">
			<HomeClient organizationId={organizationId} />
		</div>
	);
}
