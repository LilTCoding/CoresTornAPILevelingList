import { create } from "zustand";
import { persist } from "zustand/middleware";

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
	addXid: (xid: string) => void;
	removeXid: (xid: string) => void;
	statuses: UserStatus[];
	setStatuses: (statuses: UserStatus[]) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
	error: string | null;
	setError: (error: string | null) => void;
	lastUpdate: Date | null;
	setLastUpdate: (date: Date | null) => void;
	autoUpdate: boolean;
	setAutoUpdate: (autoUpdate: boolean) => void;
}

export const useStore = create<StoreState>()(
	persist(
		(set) => ({
			apiKey: "",
			setApiKey: (key) => {
				localStorage.setItem("apiKey", key);
				set({ apiKey: key });
			},
			xids: ["1776074", "1999595"],
			setXids: (xids) => {
				localStorage.setItem("xids", xids.join(","));
				set({ xids });
			},
			addXid: (xid) => {
				set((state) => {
					const newXids = [...state.xids, xid];
					localStorage.setItem("xids", newXids.join(","));
					return { xids: newXids };
				});
			},
			removeXid: (xid) => {
				set((state) => {
					const newXids = state.xids.filter((id) => id !== xid);
					localStorage.setItem("xids", newXids.join(","));
					return { xids: newXids };
				});
			},
			statuses: [],
			setStatuses: (statuses) => set({ statuses }),
			loading: false,
			setLoading: (loading) => set({ loading }),
			error: null,
			setError: (error) => set({ error }),
			lastUpdate: null,
			setLastUpdate: (date) => set({ lastUpdate: date }),
			autoUpdate: true,
			setAutoUpdate: (autoUpdate) => set({ autoUpdate }),
		}),
		{
			name: "torn-api-storage",
			partialize: (state) => ({
				apiKey: state.apiKey,
				xids: state.xids,
				autoUpdate: state.autoUpdate,
			}),
		}
	)
);
