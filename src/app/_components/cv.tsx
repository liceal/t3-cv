"use client";

import { marked } from "marked";
import "@/styles/cv.scss";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { api } from "@/trpc/react";

export default function CV() {
	const [cvHTML, setCVHTML] = useState("");
	const [topShow, setTopShow] = useState(false);

	// 配置 marked（可选）
	marked.setOptions({
		breaks: true, // 转换换行符为 <br>
		gfm: true, // 支持 GitHub Flavored Markdown
	});

	useEffect(() => {
		// 读取静态资源文本内容
		fetch(
			// "/CV.md",
			"https://raw.githubusercontent.com/liceal/t3-cv/refs/heads/main/public/cv.md",
			{
				method: "get",
			},
		)
			.then((res) => res.text())
			.then(async (data) => {
				const cvHTML = await marked(data);
				// console.log(cvHTML);
				setCVHTML(DOMPurify.sanitize(cvHTML));

				// console.log('data:', data);
			});
		// 用useEffect避免ssr渲染 对于DOMPurify.sanitize
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = document.documentElement.scrollTop; //滚动条滚动高度
			setTopShow(scrollTop >= 400);
		};
		// 设置指定按钮出现
		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll); // ✅ 清理
		};
	}, []);

	/**
	 * 下载和置顶按钮
	 */
	function FixedButton(props: { showTop: boolean }) {
		// ✅ 正确方式：使用 useMutation
		const { mutate: generatePdf, isPending: isGenerating } =
			api.post.generatePdf.useMutation({
				onSuccess: (data) => {
					// 将 Buffer/Uint8Array 转为 Blob
					const blob = new Blob([new Uint8Array(data.pdf).buffer], {
						type: "application/pdf",
					});
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = "cv.pdf";
					a.click();
					window.URL.revokeObjectURL(url); // 释放内存
				},
				onError: (error) => {
					console.error("生成PDF失败:", error);
				},
			});

		return [
			<div
				key="download"
				className={`fixed-button iconfont icon-xiazai download ${isGenerating && "loading-dots"}`}
				title="下载PDF简历"
				onClick={() => {
					if (!isGenerating) {
						generatePdf({ cvHTML });
					}
					// window.open(
					// 	"https://github.com/liceal/cv/raw/master/src/static/cv.pdf",
					// );
				}}
			/>,
			props.showTop && (
				<div
					key="goTop"
					className="fixed-button go-top"
					onClick={() => {
						document.documentElement.scrollTo({
							top: 0,
							behavior: "smooth",
						});
					}}
				>
					<div className="text iconfont icon-shang" />
				</div>
			),
		];
	}

	return (
		<div className="cv" key="cv">
			<div
				id="cv"
				className="page"
				dangerouslySetInnerHTML={{ __html: cvHTML }}
			/>
			<FixedButton key="fixed-button" showTop={topShow} />
		</div>
	);
}
