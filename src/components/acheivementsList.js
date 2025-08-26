// src/components/acheivementsList.js
import { useEffect, useState } from "react";

export default function AchievementsList() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	async function load() {
		try {
			setLoading(true);
			setError("");
			const params = new URLSearchParams({ page: "1", pageSize: "200" });

			const res = await fetch(`/api/achievements?${params.toString()}`, { cache: "no-store" });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			setItems(Array.isArray(data.items) ? data.items : []);
		} catch (e) {
			console.error("Load achievements failed:", e);
			setError("Failed to load achievements.");
			setItems([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, []);

	return (
		<div className="mx-auto w-fit max-w-3xl">
			{/* Body */}
			{loading ? (
				<div className="flex items-center justify-center py-16 text-gray-500">
					Loading achievements…
				</div>
			) : error ? (
				<div className="flex items-center justify-center py-16 text-red-600">
					{error}
				</div>
			) : items.length === 0 ? (
				<div className="flex items-center justify-center py-16 text-gray-500">
					No achievements found.
				</div>
			) : (
				<ul className="overflow-y-auto max-h-[475px]">
					{items.map((a) => (
						<li key={a._id} className="mb-8 last:mb-0 bg-white px-8 rounded-2xl shadow-lg border flex gap-6 py-4 items-center">
							{/* Logo */}
							<div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg">
								{a.logo ? (
									<img
										alt="Achievement Icon"
										src={a.logo}
										className="h-full w-full object-contain"
									/>
								) : (
									<img
										alt="Achievement Icon"
										src={'/trophy.png'}
										className="h-full w-full object-contain"
									/>
								)}
							</div>

							{/* Text */}
							<div className="min-w-0 flex-1">
								<h3 className="text-3xl font-semibold text-customBlack">
									{a.title || ""}
								</h3>
								<p className="mt-1 text-lg text-gray-700 whitespace-pre-line">
									{a.description || ""}
								</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}