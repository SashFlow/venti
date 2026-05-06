import { PackageTypeFormPage } from "../components/PackageTypeFormPage";

export default async function EditPackageTypePage({
	params,
}: {
	params: Promise<{ packageId: string }>;
}) {
	const { packageId } = await params;

	return <PackageTypeFormPage mode="edit" packageId={packageId} />;
}
