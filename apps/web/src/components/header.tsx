import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
		{ to: "/torn-account", label: "Torn Account" },
		{ to: "/hospital-monitor", label: "Hospital Monitor" },
		{ to: "/ai-monitor", label: "AI Monitor" },
		{ to: "/levelling-list", label: "Levelling List" },
		{ to: "/torn-scripts", label: "Torn Scripts" },
		{ to: "/command-prompt", label: "Command Prompt" },
		{ to: "/tampermonkey-helper", label: "Tampermonkey Helper" },
	];

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} to={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}
