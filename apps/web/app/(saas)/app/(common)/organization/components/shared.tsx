import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@repo/ui/collapsible";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";
import { Switch } from "@repo/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@repo/ui/tooltip";
import { ChevronDownIcon, ChevronRightIcon, InfoIcon } from "lucide-react";
import { useState } from "react";
import type { Option } from "./types";

export function HelpTip({ text }: { text: string }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
					aria-label="More info"
				>
					<InfoIcon className="size-4" />
				</button>
			</TooltipTrigger>
			<TooltipContent className="max-w-72 text-xs">{text}</TooltipContent>
		</Tooltip>
	);
}

export function SectionCard({
	id,
	title,
	actions,
	children,
}: {
	id?: string;
	title: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<Card id={id} className="rounded-2xl border">
			<CardContent className="space-y-4 p-4 md:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h3 className="font-semibold text-lg tracking-tight">{title}</h3>
					{actions}
				</div>
				{children}
			</CardContent>
		</Card>
	);
}

export function SwitchRow({
	label,
	description,
	checked,
	onCheckedChange,
	size = "default",
	helpText,
}: {
	label: string;
	description?: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	size?: "sm" | "default";
	helpText?: string;
}) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-lg border p-3">
			<div className="space-y-1">
				<div className="flex items-center gap-2">
					<p className="font-medium text-sm">{label}</p>
					{helpText ? <HelpTip text={helpText} /> : null}
				</div>
				{description ? (
					<p className="text-muted-foreground text-xs">{description}</p>
				) : null}
			</div>
			<Switch
				size={size}
				checked={checked}
				onCheckedChange={onCheckedChange}
			/>
		</div>
	);
}

export function SelectRow({
	label,
	value,
	onValueChange,
	options,
	helpText,
}: {
	label: string;
	value: string;
	onValueChange: (value: string) => void;
	options: Option[];
	helpText?: string;
}) {
	return (
		<div className="space-y-2 rounded-lg border p-3">
			<div className="flex items-center gap-2">
				<Label>{label}</Label>
				{helpText ? <HelpTip text={helpText} /> : null}
			</div>
			<Select
				value={value}
				onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
			>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

export function InputRow({
	label,
	value,
	onChange,
	placeholder,
	type = "text",
	min,
	max,
	helpText,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	type?: "text" | "email" | "number";
	min?: number;
	max?: number;
	helpText?: string;
}) {
	return (
		<div className="space-y-2 rounded-lg border p-3">
			<div className="flex items-center gap-2">
				<Label>{label}</Label>
				{helpText ? <HelpTip text={helpText} /> : null}
			</div>
			<Input
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				min={min}
				max={max}
			/>
		</div>
	);
}

export function CollapsibleGroup({
	title,
	defaultOpen,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(Boolean(defaultOpen));

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div className="rounded-lg border">
				<CollapsibleTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						className="h-auto w-full justify-between rounded-lg px-3 py-2"
					>
						<span className="font-medium text-sm">{title}</span>
						{open ? (
							<ChevronDownIcon className="size-4" />
						) : (
							<ChevronRightIcon className="size-4" />
						)}
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent className="space-y-3 border-t p-3">
					{children}
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}
