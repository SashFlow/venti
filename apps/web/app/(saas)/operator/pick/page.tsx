import { redirect } from "next/navigation";

export default async function OperatorPickRedirect({
	searchParams,
}: {
	searchParams: Promise<{ waveId?: string; picker?: string }>;
}) {
	const params = await searchParams;
	if (params.waveId) {
		const q = params.picker ? `?picker=${params.picker}` : "";
		redirect(`/operator/pick/${params.waveId}${q}`);
	}
	redirect("/operator");
}
