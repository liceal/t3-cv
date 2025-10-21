import { HydrateClient } from "@/trpc/server";
import CV from "./_components/cv";

export default async function Home() {
	function Header() {
		const navs = [
			{
				url: "/",
				name: "简历",
			},
			{
				url: "https://progressively-render.vercel.app/",
				blank: true,
				name: "动态简历",
			},
		];
		return (
			<div className="header-container">
				<div className="logo">
					<img className="img" src="/images/head.jpg" alt="header" />
				</div>
				<div className="text">
					<p className="name">liceal</p>
				</div>
				<div className="nav">
					{navs.map((v, index) => {
						return v.blank ? (
							<a href={v.url} key={v.url}>
								{v.name}
							</a>
						) : (
							<a href={v.url} key={v.url}>
								{v.name}
							</a>
						);
					})}
				</div>
			</div>
		);
	}

	function Footer() {
		return (
			<div className="text-center text-[0.8em] leading-4 ">
				<p>@liceal | © 2020</p>
			</div>
		);
	}

	return (
		<HydrateClient>
			<Header />
			<CV />
			<Footer />
		</HydrateClient>
	);
}
