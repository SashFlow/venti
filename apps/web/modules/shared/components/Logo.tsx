import { cn } from "@repo/ui/utils";
import React from "react";

const Logo = ({
	className,
	withLabel = false,
}: {
	className?: string;
	withLabel?: boolean;
}) => {
	return <div className={cn("", className)}>Sashflow</div>;
};

export default Logo;
