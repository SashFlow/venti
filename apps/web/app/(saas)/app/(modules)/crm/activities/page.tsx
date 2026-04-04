export default function ActivitiesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Activities</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Track and manage customer interaction activities
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Schedule Activity
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Plan calls, meetings, and follow-ups
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						New Activity
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Activity Calendar
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						View scheduled activities and appointments
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						View Calendar
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Activity Reports
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Analyze activity performance and outcomes
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Reports
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Upcoming Activities
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Today's scheduled activities and overdue tasks will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
