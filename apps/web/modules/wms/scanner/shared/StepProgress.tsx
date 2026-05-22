import { cn } from "@repo/ui/lib/utils";

interface StepProgressProps {
	steps: string[];
	currentStep: number; // 0-indexed
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
	return (
		<div className="flex items-center gap-2 px-4">
			{steps.map((label, idx) => (
				<div key={label} className="flex items-center gap-2 flex-1">
					<div className="flex flex-col items-center gap-1 flex-1">
						<div
							className={cn(
								"w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
								idx < currentStep
									? "bg-green-500 text-white"
									: idx === currentStep
										? "bg-blue-600 text-white"
										: "bg-muted text-muted-foreground",
							)}
						>
							{idx < currentStep ? "✓" : idx + 1}
						</div>
						<span
							className={cn(
								"text-[10px] text-center leading-none",
								idx === currentStep
									? "text-blue-600 font-semibold"
									: "text-muted-foreground",
							)}
						>
							{label}
						</span>
					</div>
					{idx < steps.length - 1 && (
						<div
							className={cn(
								"h-0.5 flex-1 rounded mb-4",
								idx < currentStep ? "bg-green-500" : "bg-muted",
							)}
						/>
					)}
				</div>
			))}
		</div>
	);
}
