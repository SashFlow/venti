"use client";
import { config } from "@repo/config";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { useSession } from "@saas/auth/hooks/use-session";
import {
	setActiveOrganization,
	useOrganizationListQuery,
} from "@saas/organizations/lib/api";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useRouter } from "@shared/hooks/router";
import { clearCache } from "@shared/lib/cache";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { OrganizationLogo } from "./OrganizationLogo";

export function OrganzationSelect({ className }: { className?: string }) {
	const t = useTranslations();
	const { user, organization, reloadSession } = useSession();
	const router = useRouter();
	const { data: allOrganizations } = useOrganizationListQuery();

	if (!user) {
		return null;
	}

	return (
		<div className={className}>
			<DropdownMenu>
				<DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-md border p-2 text-left outline-none focus-visible:bg-primary/10 focus-visible:ring-none">
					<div className="flex flex-1 items-center justify-start gap-2 text-sm overflow-hidden">
						{organization ? (
							<>
								<OrganizationLogo
									name={organization.name}
									logoUrl={organization.logo}
									className="hidden size-6 sm:block"
								/>
								<span className="block flex-1 truncate">
									{organization.name}
								</span>
							</>
						) : (
							<>
								<UserAvatar
									className="hidden size-6 sm:block"
									name={user.name ?? ""}
									avatarUrl={user.image}
								/>
								<span className="block truncate">
									{t(
										"organizations.organizationSelect.personalAccount",
									)}
								</span>
							</>
						)}
					</div>

					<ChevronsUpDownIcon className="block size-4 opacity-50" />
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-full">
					{!config.organizations.requireOrganization && (
						<>
							<DropdownMenuRadioGroup
								value={organization?.id ?? user.id}
								onValueChange={async (value: string) => {
									if (value === user.id) {
										await clearCache();
										router.replace("/app/home");
									}
								}}
							>
								<DropdownMenuLabel className="text-foreground/60 text-xs">
									{t(
										"organizations.organizationSelect.personalAccount",
									)}
								</DropdownMenuLabel>
								<DropdownMenuRadioItem
									value={user.id}
									className="flex cursor-pointer items-center justify-center gap-2 pl-3"
								>
									<div className="flex flex-1 items-center justify-start gap-2">
										<UserAvatar
											className="size-8"
											name={user.name ?? ""}
											avatarUrl={user.image}
										/>
										{user.name}
									</div>
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
							<DropdownMenuSeparator />
						</>
					)}
					<DropdownMenuRadioGroup
						value={organization?.slug}
						onValueChange={async (organizationSlug: string) => {
							await clearCache();
							setActiveOrganization(organizationSlug);
							await reloadSession();
						}}
					>
						<DropdownMenuLabel className="text-foreground/60 text-xs">
							{t(
								"organizations.organizationSelect.organizations",
							)}
						</DropdownMenuLabel>
						{allOrganizations?.map((organization) => (
							<DropdownMenuRadioItem
								key={organization.slug}
								value={organization.slug}
								className="flex cursor-pointer items-center justify-center gap-2 pl-3"
							>
								<div className="flex flex-1 items-center justify-start gap-2">
									<OrganizationLogo
										className="size-8"
										name={organization.name}
										logoUrl={organization.logo}
									/>
									{organization.name}
								</div>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>

					{config.organizations.enableUsersToCreateOrganizations && (
						<DropdownMenuGroup>
							<DropdownMenuItem
								asChild
								className="text-primary! cursor-pointer text-sm"
							>
								<Link href="/new-organization">
									<PlusIcon className="mr-2 size-6 rounded-md bg-primary/20 p-1" />
									{t(
										"organizations.organizationSelect.createNewOrganization",
									)}
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
