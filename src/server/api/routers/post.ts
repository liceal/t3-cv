import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import puppeteer, { type LaunchOptions } from "puppeteer";
import chromium from "@sparticuz/chromium";

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
			const puppeteerConfig: LaunchOptions = {
				args: [
					"--no-sandbox",
					"--disable-setuid-sandbox",
					// "--disable-dev-shm-usage", // 禁止使用共享内存
					// "--no-zygote", // 关闭子进程孵化
					// "--max-old-space-size=512", // Node.js内存限制(MB)
				], // Docker/Server需添加
			};
			if (process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD) {
				puppeteerConfig.executablePath =
					process.env.CHROME_PATH || (await chromium.executablePath());
				console.log(11, puppeteerConfig.executablePath);
			} else {
				puppeteerConfig.headless = true;
			}
			const browser = await puppeteer.launch(puppeteerConfig);
			const page = await browser.newPage();

			// 设置HTML内容
			await page.setContent(
				`
					<html>
						<head>
							<meta charset="UTF-8">
							<link
								rel="stylesheet"
								href="https://chinese-fonts-cdn.deno.dev/packages/maple-mono-cn/dist/MapleMono-CN-SemiBold/result.css"
							/>
							<style>
								body {font-family:'Maple Mono CN SemiBold';font-weight:'400'};
							</style>
						</head>
						<body>
							${input.cvHTML}
						</body>
					</html>
				`,
				{
					waitUntil: "networkidle0", // 等待所有网络请求完成（包括字体加载）
					timeout: 30000, // 增加超时时间到30秒
				},
			);

			// 额外等待字体加载（如果网络较慢）
			await page.evaluate(async () => {
				const font = new FontFace(
					"Maple Mono CN SemiBold",
					'url("https://chinese-fonts-cdn.deno.dev/packages/maple-mono-cn/dist/MapleMono-CN-SemiBold/result.css")',
				);
				await font.load();
				document.fonts.add(font);
			});

			// 确保所有内容已渲染
			await page.waitForFunction(() => {
				return document.fonts.ready.then(() => {
					return document.body.textContent !== "";
				});
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
