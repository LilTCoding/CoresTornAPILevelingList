import { createFileRoute } from "@tanstack/react-router";
import TornScripts from "@/components/TornScripts";

export const Route = createFileRoute("/torn-scripts")({
    component: RouteComponent,
});

function RouteComponent() {
    return <TornScripts />;
} 