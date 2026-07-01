type SearchSnippet = {
	title: string;
	snippet: string;
	url?: string;
};

export async function searchWeb(query: string): Promise<SearchSnippet[]> {
	try {
		const res = await fetch(
			`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`,
			{ signal: AbortSignal.timeout(8000) },
		);

		if (!res.ok) {
			return [];
		}

		const data = (await res.json()) as {
			AbstractText?: string;
			AbstractURL?: string;
			Heading?: string;
			RelatedTopics?: Array<
				| { Text?: string; FirstURL?: string }
				| { Name?: string; Topics?: Array<{ Text?: string; FirstURL?: string }> }
			>;
		};

		const snippets: SearchSnippet[] = [];

		if (data.AbstractText) {
			snippets.push({
				title: data.Heading ?? "Summary",
				snippet: data.AbstractText,
				url: data.AbstractURL,
			});
		}

		for (const topic of data.RelatedTopics ?? []) {
			if ("Topics" in topic && topic.Topics) {
				for (const sub of topic.Topics.slice(0, 2)) {
					if (sub.Text) {
						snippets.push({
							title: topic.Name ?? "Related",
							snippet: sub.Text,
							url: sub.FirstURL,
						});
					}
				}
			} else if ("Text" in topic && topic.Text) {
				snippets.push({
					title: "Related",
					snippet: topic.Text,
					url: topic.FirstURL,
				});
			}
			if (snippets.length >= 4) break;
		}

		return snippets.slice(0, 4);
	} catch {
		return [];
	}
}
