import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, trpc } from "./utils/trpc";
import "./index.css";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPendingComponent: () => <Loader />,
	context: { trpc, queryClient },
	Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>
				<ThemeProvider defaultTheme="dark" storageKey="torn-api-theme">
					{children}
					<Toaster position="top-right" />
				</ThemeProvider>
			</QueryClientProvider>
		);
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
