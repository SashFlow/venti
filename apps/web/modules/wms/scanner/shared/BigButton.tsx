import { cn } from "@repo/ui/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger";
}

export function BigButton({
	variant = "primary",
	className,
	...props
}: BigButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"w-full rounded-xl py-5 text-lg font-bold tracking-wide transition-colors active:scale-95 select-none",
				variant === "primary" &&
					"bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
				variant === "secondary" &&
					"bg-muted text-foreground hover:bg-muted/80",
				variant === "danger" &&
					"bg-red-500 text-white hover:bg-red-600",
				props.disabled &&
					"opacity-50 cursor-not-allowed active:scale-100",
				className,
			)}
			{...props}
		/>
	);
}
