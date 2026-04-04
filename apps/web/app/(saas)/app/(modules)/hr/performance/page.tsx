export default function PerformancePage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Performance</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage employee performance reviews and evaluations
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Performance Reviews
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Conduct and manage performance evaluations
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Start Review
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Goal Setting</h3>
					<p className="text-sm text-gray-600 mb-4">
						Set and track employee goals and objectives
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Goals
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Performance Analytics
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Analyze performance trends and metrics
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Analytics
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Upcoming Reviews</h3>
				<div className="text-sm text-gray-600">
					<p>
						Scheduled performance reviews and evaluation deadlines
						will appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
