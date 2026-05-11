import { Button } from "@repo/ui/button";
import { Switch } from "@repo/ui/switch";
import { TabsContent } from "@repo/ui/tabs";
import { ArrowRightIcon, BoxIcon, ScanLineIcon, TagIcon } from "lucide-react";
import Link from "next/link";
import { SectionCard } from "./shared";

export function ScanningTabContent({
	toggles,
	updateToggle,
}: {
	toggles: Record<string, boolean>;
	updateToggle: (key: string, checked: boolean) => void;
}) {
	return (
		<TabsContent value="scanning" className="space-y-4">
			<SectionCard
				id="scanning"
				title="Barcode Scanning"
				actions={
					<Button asChild size="sm">
						<Link href="/company/features/scanner-setup">
							<ScanLineIcon className="size-4" />
							<span>Scanner Setup</span>
						</Link>
					</Button>
				}
			>
				<div className="space-y-6 rounded-xl border bg-muted/20 p-4 md:p-6">
					<p className="font-semibold text-sm">
						Fulfillment Scan Points:
					</p>

					<div className="grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-start">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<BoxIcon className="size-5" />
								</div>
								<p className="font-semibold text-base">Bin</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2 pl-1">
									<p className="font-semibold text-xl">
										Pick
									</p>
									<ArrowRightIcon className="size-4 text-muted-foreground" />
								</div>
								<div className="flex items-center gap-3 pl-1">
									<Switch
										size="sm"
										checked={
											toggles.batch_scanBinWhenRemovingFromBin
										}
										onCheckedChange={(checked) =>
											updateToggle(
												"batch_scanBinWhenRemovingFromBin",
												checked,
											)
										}
									/>
									<p className="font-semibold text-sm">
										Scan Bin
									</p>
								</div>
								<div className="flex items-center gap-3 pl-1">
									<Switch
										size="sm"
										checked={
											toggles.batch_scanItemWhenRemovingFromBin
										}
										onCheckedChange={(checked) =>
											updateToggle(
												"batch_scanItemWhenRemovingFromBin",
												checked,
											)
										}
									/>
									<p className="font-semibold text-sm">
										Scan Item
									</p>
								</div>
								<div className="flex items-center gap-3 pl-1">
									<Switch
										size="sm"
										checked={toggles.batch_scanEachItem}
										onCheckedChange={(checked) =>
											updateToggle(
												"batch_scanEachItem",
												checked,
											)
										}
									/>
									<p className="font-semibold text-sm">
										1 scan = 1 qty
									</p>
								</div>
							</div>
						</div>

						<div className="hidden self-center md:block">
							<ArrowRightIcon className="size-5 text-muted-foreground" />
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<TagIcon className="size-5" />
								</div>
								<p className="font-semibold text-base">Batch</p>
							</div>
							<div className="space-y-2 pl-1">
								<div className="flex items-center gap-2">
									<p className="font-semibold text-xl">
										Pack
									</p>
									<ArrowRightIcon className="size-4 text-muted-foreground" />
								</div>
								<div className="flex items-center gap-3">
									<Switch
										size="sm"
										checked={
											toggles.batch_scanItemWhenAddingToShipment
										}
										onCheckedChange={(checked) =>
											updateToggle(
												"batch_scanItemWhenAddingToShipment",
												checked,
											)
										}
									/>
									<p className="font-semibold text-sm">
										Scan Item
									</p>
								</div>
							</div>
						</div>

						<div className="hidden self-center md:block">
							<ArrowRightIcon className="size-5 text-muted-foreground" />
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
									<BoxIcon className="size-5" />
								</div>
								<p className="font-semibold text-base">
									Shipment
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-3 pt-1">
					<div className="flex items-center justify-between gap-4">
						<p className="font-semibold text-base">
							Enable webcam scanner
						</p>
						<Switch
							checked={toggles.userConfig_enableCameraScanner}
							onCheckedChange={(checked) =>
								updateToggle(
									"userConfig_enableCameraScanner",
									checked,
								)
							}
						/>
					</div>
					<div className="flex items-center justify-between gap-4">
						<p className="font-semibold text-base">
							Enable test scanner
						</p>
						<Switch
							checked={toggles.userConfig_enableDevScanner}
							onCheckedChange={(checked) =>
								updateToggle(
									"userConfig_enableDevScanner",
									checked,
								)
							}
						/>
					</div>
					<div className="flex items-center justify-between gap-4">
						<p className="font-semibold text-base">
							Enable native scanner (BLE / USB)
						</p>
						<Switch
							checked={toggles.userConfig_enableNativeScanner}
							onCheckedChange={(checked) =>
								updateToggle(
									"userConfig_enableNativeScanner",
									checked,
								)
							}
						/>
					</div>
					<div className="flex items-center justify-between gap-4">
						<p className="font-semibold text-base">
							Listen for hardware scans
						</p>
						<Switch
							checked={toggles.scanPrefixValue}
							onCheckedChange={(checked) =>
								updateToggle("scanPrefixValue", checked)
							}
						/>
					</div>
				</div>
			</SectionCard>
		</TabsContent>
	);
}
