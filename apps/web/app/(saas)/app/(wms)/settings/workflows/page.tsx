import { WorkflowBuilder } from "./components/workflow-builder";

export const metadata = {
	title: "Workflow Builder - Warehouse OS",
};

export default function WorkflowsPage() {
	return (
		<div className="container mx-auto space-y-6 py-6 h-[calc(100vh-4rem)] flex flex-col">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					Workflow Editor
				</h1>
				<p className="text-sm text-muted-foreground">
					Design custom inbound, outbound, and return processes using
					a drag-and-drop node editor.
				</p>
			</div>

			<div className="flex-1 rounded-md border overflow-hidden relative bg-muted/10">
				<WorkflowBuilder />
			</div>
		</div>
	);
}
