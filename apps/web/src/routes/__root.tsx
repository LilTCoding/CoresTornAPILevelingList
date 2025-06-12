import Header from "@/components/header";
import Loader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import type { trpc } from "@/utils/trpc";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	HeadContent,
	Outlet,
	createRootRouteWithContext,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";

export interface RouterAppContext {
	trpc: typeof trpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Torn API Tools",
			},
			{
				name: "description",
				content: "A collection of tools for Torn City using the Torn API",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	return (
		<>
			<HeadContent />
			<ThemeProvider defaultTheme="dark" storageKey="torn-api-theme">
				<div className="grid h-svh grid-rows-[auto_1fr]">
					<Header />
					<main className="container mx-auto p-4">
						{isFetching ? <Loader /> : <Outlet />}
					</main>
				</div>
				<Toaster position="top-right" richColors />
			</ThemeProvider>
			{process.env.NODE_ENV === "development" && (
				<>
					<TanStackRouterDevtools position="bottom-left" />
					<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
				</>
			)}
		</>
	);
}
