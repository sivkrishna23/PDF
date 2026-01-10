import { create } from 'zustand';
import { DataEvent } from '../types';
import { storage } from '../utils/storage';
import { classifyEvent, RiskScore } from '../engine/classifier';

interface EnrichedEvent extends DataEvent {
    risk: RiskScore;
}

interface DataStats {
    totalEvents: number;
    trackers: number; // Placeholder for now
    highRiskCount: number;
}

interface Settings {
    protectionEnabled: boolean;
    blockTrackers: boolean;
}

interface DataStore {
    events: EnrichedEvent[];
    stats: DataStats;
    settings: Settings;
    siteRisk: { score: number; level: 'low' | 'medium' | 'high' };
    loading: boolean;
    loadEvents: () => Promise<void>;
    clearEvents: () => Promise<void>;
    toggleProtection: () => void;
    toggleBlockTrackers: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
    events: [],
    stats: {
        totalEvents: 0,
        trackers: 0,
        highRiskCount: 0,
    },
    loading: true,
    settings: { protectionEnabled: true, blockTrackers: false },
    siteRisk: { score: 0, level: 'low' },

    loadEvents: async () => {
        set({ loading: true });
        try {
            const rawEvents = await storage.getEvents();

            const enrichedEvents = rawEvents.map(event => ({
                ...event,
                risk: classifyEvent(event)
            })).sort((a, b) => b.timestamp - a.timestamp); // Newest first

            const highRiskCount = enrichedEvents.filter(e => e.risk.level === 'high').length;
            const trackers = enrichedEvents.filter(e => e.isThirdParty).length; // simple tracker count
            const totalEvents = enrichedEvents.length;

            // Calculate Site Risk Score (Simple Heuristic for now)
            // Score = (High Risk * 10) + (Trackers * 2) + (Events * 0.1)
            const riskScoreVal = (highRiskCount * 10) + (trackers * 2) + (totalEvents * 0.1);
            let riskLevel: 'low' | 'medium' | 'high' = 'low';
            if (riskScoreVal > 20) riskLevel = 'medium';
            if (riskScoreVal > 50) riskLevel = 'high';

            set({
                events: enrichedEvents,
                loading: false,
                siteRisk: { score: Math.round(riskScoreVal), level: riskLevel },
                stats: {
                    totalEvents,
                    highRiskCount,
                    trackers
                }
            });
        } catch (error) {
            console.error('Failed to load events', error);
            set({ loading: false });
        }
    },

    clearEvents: async () => {
        await storage.clearEvents();
        set({
            events: [],
            stats: { totalEvents: 0, trackers: 0, highRiskCount: 0 }
        });
    },

    toggleProtection: () => set((state) => ({
        settings: { ...state.settings, protectionEnabled: !state.settings.protectionEnabled }
    })),

    toggleBlockTrackers: () => set((state) => ({
        settings: { ...state.settings, blockTrackers: !state.settings.blockTrackers }
    })),
}));
