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
		<div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
			{/* Body */}
			{loading ? (
				<div className="flex items-center justify-center py-16 text-dashWhite">
					Loading Achievements...
				</div>
			) : error ? (
				<div className="flex items-center justify-center py-16 text-red-600">
					{error}
				</div>
			) : items.length === 0 ? (
				<div className="flex items-center justify-center py-16 text-dashWhite">
					No achievements Yet.
				</div>
			) : (
				<ul className="overflow-y-auto max-h-[70vh]">
					{items.map((a) => (
						<li key={a._id} className="mb-6 sm:mb-8 last:mb-0 bg-white px-5 sm:px-8 rounded-2xl shadow-lg border flex flex-col sm:flex-row gap-4 sm:gap-6 py-4 items-center sm:items-center text-center sm:text-left">
							{/* Logo */}
							<div className="flex justify-center w-full sm:w-auto">
								<div className="h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-lg">
									{a.logo ? (
										<img
											alt="Achievement Icon"
											src={a.logo}
											className="h-full w-full object-contain"
										/>
									) : (
										<img
											alt="Achievement Icon"
											src={'/dash/achievements.png'}
											className="h-full w-full object-contain"
										/>
									)}
								</div>
							</div>

							{/* Text */}
							<div className="min-w-0 flex-1 text-center sm:text-left">
								<h3 className="text-2xl sm:text-3xl font-semibold text-customBlack">
									{a.title || ""}
								</h3>
								<p className="mt-1 text-base sm:text-lg text-gray-700 whitespace-pre-line break-words">
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