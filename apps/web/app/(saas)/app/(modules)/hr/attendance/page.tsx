export default function AttendancePage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Attendance</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Track employee attendance and time management
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Time Clock</h3>
					<p className="text-sm text-gray-600 mb-4">
						Manage check-in and check-out times
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Time Clock
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Leave Management
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Handle leave requests and approvals
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						Manage Leave
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Attendance Reports
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Generate attendance analytics and reports
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						View Reports
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">Today's Attendance</h3>
				<div className="text-sm text-gray-600">
					<p>
						Current day attendance status and trends will appear
						here...
					</p>
				</div>
			</div>
		</div>
	);
}
