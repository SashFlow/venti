"use client";

import { Badge } from "@repo/ui/badge";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

export function SubscriptionStatusBadge({
	status,
	className,
}: {
	status: string;
	className?: string;
}) {
	const t = useTranslations();

	const badgeLabels: Record<string, string> = {
		active: t("settings.billing.activePlan.status.active"),
		canceled: t("settings.billing.activePlan.status.canceled"),
		expired: t("settings.billing.activePlan.status.expired"),
		incomplete: t("settings.billing.activePlan.status.incomplete"),
		past_due: t("settings.billing.activePlan.status.past_due"),
		paused: t("settings.billing.activePlan.status.paused"),
		trialing: t("settings.billing.activePlan.status.trialing"),
		unpaid: t("settings.billing.activePlan.status.unpaid"),
	};

	const badgeColors: Record<string, NonNullable<BadgeVariant>> = {
		active: "default",
		canceled: "destructive",
		expired: "destructive",
		incomplete: "outline",
		past_due: "outline",
		paused: "outline",
		trialing: "secondary",
		unpaid: "destructive",
	};

	return (
		<Badge
			className={className}
			variant={badgeColors[status] ?? "secondary"}
		>
			{badgeLabels[status] ?? status}
		</Badge>
	);
}
