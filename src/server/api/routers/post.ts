import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ text: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.text}`,
			};
		}),

	create: publicProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.post.create({
				data: {
					name: input.name,
				},
			});
		}),

	getLatest: publicProcedure.query(async ({ ctx }) => {
		const post = await ctx.db.post.findFirst({
			orderBy: { createdAt: "desc" },
		});

		return post ?? null;
	}),
	getList: publicProcedure.query(async ({ ctx }) => {
		const postList = await ctx.db.post.findMany({
			orderBy: { createdAt: "desc" },
		});
		return postList ?? null;
	}),
});
