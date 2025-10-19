"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function LatestPost() {
	const [latestPost] = api.post.getLatest.useSuspenseQuery();

	const utils = api.useUtils();
	const [name, setName] = useState("");
	const createPost = api.post.create.useMutation({
		onSuccess: async () => {
			await utils.post.invalidate();
			setName("");
		},
	});

	return (
		<div className="w-full max-w-xs">
			{latestPost ? (
				<p className="truncate">Your most recent post: {latestPost.name}</p>
			) : (
				<p>You have no posts yet.</p>
			)}

			<input
				type="text"
				placeholder="Title"
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="w-full border bg-white/10 px-4 py-2"
			/>
			<button
				type="button"
				className="cursor-pointer rounded-full bg-gray-500 px-10 py-3 font-semibold transition hover:bg-gray-600"
				disabled={createPost.isPending}
				onClick={() => {
					createPost.mutate({ name });
				}}
			>
				{createPost.isPending ? "Submitting..." : "Submit"}
			</button>
		</div>
	);
}
