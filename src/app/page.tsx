import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { HydrateClient, api } from "@/trpc/server";

export default async function Home() {
	const hello = await api.post.hello({ text: "from tRPC" });

	void api.post.getLatest.prefetch();

	const list = await api.post.getList();

	return (
		<HydrateClient>
			{list.map((v) => (
				<div key={v.id}>
					{v.name} | {v.createdAt.toLocaleString()} |{" "}
					{v.updatedAt.toLocaleString()}
				</div>
			))}
			<LatestPost />
			{hello.greeting}
		</HydrateClient>
	);
}
