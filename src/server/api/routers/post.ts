import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import puppeteer from "puppeteer";

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
	generatePdf: publicProcedure
		.input(z.object({ cvHTML: z.string() }))
		.mutation(async ({ input }) => {
			// 使用Puppeteer生成PDF
			const browser = await puppeteer.launch({
				headless: true,
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--disable-dev-shm-usage", // 禁止使用共享内存
					"--no-zygote", // 关闭子进程孵化
					"--max-old-space-size=512", // Node.js内存限制(MB)
				], // Docker/Server需添加
			});
			const page = await browser.newPage();

			// 设置HTML内容
			await page.setContent(input.cvHTML, {
				waitUntil: "networkidle0", // 等待所有资源加载
			});

			// 生成PDF
			const pdf = await page.pdf({
				format: "A4",
				printBackground: true, // 打印背景
				margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
			});

			await browser.close();
			return { pdf };
		}),
});
