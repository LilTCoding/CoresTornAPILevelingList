import create from "zustand";

interface UserStatus {
	xid: number;
	status: string;
	hosp_out?: number;
	error?: string;
	name?: string;
	level?: number;
	stats?: Record<string, number>;
}

interface StoreState {
	apiKey: string;
	setApiKey: (key: string) => void;
	xids: string[];
	setXids: (xids: string[]) => void;
	statuses: UserStatus[];
	setStatuses: (statuses: UserStatus[]) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
	apiKey: localStorage.getItem("apiKey") || "",
	setApiKey: (key) => set({ apiKey: key }),
	xids: localStorage
		.getItem("xids")
		?.split(",")
		.filter((x) => x) || ["1776074", "1999595"],
	setXids: (xids) => set({ xids }),
	statuses: [],
	setStatuses: (statuses) => set({ statuses }),
	loading: false,
	setLoading: (loading) => set({ loading }),
}));
