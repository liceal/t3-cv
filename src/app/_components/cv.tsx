"use client";

import { marked } from "marked";
import "@/styles/cv.scss";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { api } from "@/trpc/react";
import axios from "axios";

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
		axios({
			method: "get",
			url:
				process.env.NODE_ENV === "development"
					? "./cv.md"
					: "https://raw.githubusercontent.com/liceal/t3-cv/refs/heads/main/public/cv.md",
		}).then(async (res) => {
			const cvHTML = await marked(res.data);
			setCVHTML(DOMPurify.sanitize(cvHTML));
		});
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
					if (process.env.NEXT_PUBLIC_PDF_LOCAL === "true") {
						if (!isGenerating) {
							generatePdf({ cvHTML });
						}
					} else {
						if (process.env.NODE_ENV === "development") {
							window.open("./cv.pdf", "_blank");
						} else {
							window.open(
								"https://raw.githubusercontent.com/liceal/t3-cv/refs/heads/main/public/cv.pdf",
								"_blank",
							);
						}
					}
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
