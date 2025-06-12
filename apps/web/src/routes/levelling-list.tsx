import LevellingList from "@/components/LevellingList";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/levelling-list")({
	component: LevellingList,
});
