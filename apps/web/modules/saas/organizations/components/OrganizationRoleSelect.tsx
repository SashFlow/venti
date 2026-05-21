import type { OrganizationMemberRole } from "@repo/auth";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { useOrganizationMemberRoles } from "@saas/organizations/hooks/member-roles";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";

export function OrganizationRoleSelect({
	value,
	onSelect,
	disabled,
	placeholder,
	organizationId,
}: {
	value?: string;
	onSelect: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	organizationId?: string;
}) {
	const organizationMemberRoles = useOrganizationMemberRoles();

	const { data: accessConfig, isLoading } = useQuery({
		...orpc.workforce.listAccessConfig.queryOptions({
			input: { organizationId: organizationId! },
		}),
		enabled: !!organizationId,
	});

	const roleOptions = organizationId
		? (accessConfig?.roleGroups ?? []).map((rg) => ({
				value: rg.id,
				label: rg.name,
			}))
		: Object.entries(organizationMemberRoles).map(([value, label]) => ({
				value: value as OrganizationMemberRole,
				label,
			}));

	return (
		<Select
			value={value}
			onValueChange={(selectedRole) => {
				if (selectedRole) {
					onSelect(selectedRole);
				}
			}}
			disabled={disabled || (!!organizationId && isLoading)}
		>
			<SelectTrigger className="h-10">
				<SelectValue placeholder={placeholder}>
					{value
						? (roleOptions.find((o) => o.value === value)?.label ??
							value)
						: undefined}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{roleOptions.map((option) => (
					<SelectItem
						key={option.value}
						value={option.value}
						className="h-10"
					>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
