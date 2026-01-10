export type DataEventType = 'input' | 'network';

export type InputSourceType = 'email' | 'phone' | 'password' | 'credit_card' | 'address' | 'unknown';

export interface DataEvent {
    id: string;
    type: DataEventType;
    timestamp: number;
    url: string;
    sourceType?: InputSourceType; // For input events
    method?: string; // For network events
    destinationDomain?: string; // For network events
    metadata?: Record<string, any>;
    isThirdParty?: boolean;
    contains?: string[]; // e.g., ['email', 'password']
}

export interface StorageInterface {
    saveEvent: (event: DataEvent) => Promise<void>;
    getEvents: () => Promise<DataEvent[]>;
    clearEvents: () => Promise<void>;
}
