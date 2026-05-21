import { Button } from "@repo/ui/button";
import { TabsContent } from "@repo/ui/tabs";
import { OrganizationLogo } from "@saas/organizations/components/OrganizationLogo";
import { type ChangeEvent, useRef } from "react";
import { InputRow, SectionCard } from "./shared";

type OrganizationLike = {
	name?: string | null;
	logo?: string | null;
} | null;

export function WhitelableTabContent({
	activeOrganization,
	whiteLabelOrgName,
	setWhiteLabelOrgName,
	savingWhiteLabelName,
	uploadingWhiteLabelLogo,
	onSaveName,
	onUploadLogo,
}: {
	activeOrganization: OrganizationLike;
	whiteLabelOrgName: string;
	setWhiteLabelOrgName: (value: string) => void;
	savingWhiteLabelName: boolean;
	uploadingWhiteLabelLogo: boolean;
	onSaveName: () => Promise<void>;
	onUploadLogo: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
}) {
	const fileInputReference = useRef<HTMLInputElement | null>(null);

	return (
		<TabsContent value="whitelable" className="space-y-4">
			<SectionCard id="whitelable" title="Whitelable">
				<div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
					<div className="flex items-center justify-center">
						<OrganizationLogo
							className="size-20 text-lg"
							name={activeOrganization?.name ?? "Organization"}
							logoUrl={activeOrganization?.logo ?? undefined}
						/>
					</div>
					<div className="space-y-3">
						<InputRow
							label="Organization Name"
							value={whiteLabelOrgName}
							onChange={setWhiteLabelOrgName}
							placeholder="Organization name"
						/>
						<div className="flex flex-wrap gap-2">
							<Button
								type="button"
								onClick={onSaveName}
								disabled={
									savingWhiteLabelName ||
									!activeOrganization ||
									!whiteLabelOrgName.trim()
								}
							>
								{savingWhiteLabelName
									? "Saving..."
									: "Save Name"}
							</Button>
							<input
								ref={fileInputReference}
								type="file"
								accept="image/png,image/jpeg,image/webp"
								onChange={onUploadLogo}
								className="hidden"
								disabled={
									uploadingWhiteLabelLogo ||
									!activeOrganization
								}
							/>
							<Button
								type="button"
								variant="outline"
								disabled={
									uploadingWhiteLabelLogo ||
									!activeOrganization
								}
								onClick={() =>
									fileInputReference.current?.click()
								}
							>
								{uploadingWhiteLabelLogo
									? "Uploading..."
									: "Upload Logo"}
							</Button>
						</div>
						<p className="text-muted-foreground text-xs">
							Updated organization branding is consumed by shared
							organization logo components used across the app.
						</p>
					</div>
				</div>
			</SectionCard>
		</TabsContent>
	);
}
