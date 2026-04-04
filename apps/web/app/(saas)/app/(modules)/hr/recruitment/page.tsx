export default function RecruitmentPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold">Recruitment</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Manage job postings and candidate recruitment process
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">Job Postings</h3>
					<p className="text-sm text-gray-600 mb-4">
						Create and manage job postings
					</p>
					<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700">
						Manage Jobs
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Candidate Pipeline
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Track candidates through hiring process
					</p>
					<button className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm hover:bg-green-700">
						View Pipeline
					</button>
				</div>

				<div className="bg-white p-6 border border-gray-200 rounded-lg">
					<h3 className="text-lg font-medium mb-4">
						Interview Scheduling
					</h3>
					<p className="text-sm text-gray-600 mb-4">
						Schedule and manage interviews
					</p>
					<button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm hover:bg-purple-700">
						Schedule Interview
					</button>
				</div>
			</div>

			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium mb-4">
					Active Recruitments
				</h3>
				<div className="text-sm text-gray-600">
					<p>
						Currently open positions and candidate activity will
						appear here...
					</p>
				</div>
			</div>
		</div>
	);
}
