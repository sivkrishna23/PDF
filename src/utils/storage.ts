import { DataEvent } from '../types';

const STORAGE_KEY = 'pdf_events';

export const storage = {
    saveEvent: async (event: DataEvent): Promise<void> => {
        try {
            const result = await chrome.storage.local.get(STORAGE_KEY);
            const currentEvents = (result[STORAGE_KEY] as DataEvent[]) || [];
            const updatedEvents = [...currentEvents, event];
            await chrome.storage.local.set({ [STORAGE_KEY]: updatedEvents });
            console.log('PDF: Event saved', event);
        } catch (error) {
            console.error('PDF: Failed to save event', error);
        }
    },

    getEvents: async (): Promise<DataEvent[]> => {
        try {
            const result = await chrome.storage.local.get(STORAGE_KEY);
            return (result[STORAGE_KEY] as DataEvent[]) || [];
        } catch (error) {
            console.error('PDF: Failed to get events', error);
            return [];
        }
    },

    clearEvents: async (): Promise<void> => {
        try {
            await chrome.storage.local.remove([STORAGE_KEY]);
            console.log('PDF: Events cleared');
        } catch (error) {
            console.error('PDF: Failed to clear events', error);
        }
    }
};
