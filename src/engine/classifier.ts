import { DataEvent, InputSourceType } from '../types';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskScore {
    level: RiskLevel;
    score: number; // 0-100
    reason: string;
}

export const classifyEvent = (event: DataEvent): RiskScore => {
    // Network Events
    if (event.type === 'network') {
        // CRITICAL: PII sent to Third Party
        if (event.isThirdParty && event.contains && event.contains.length > 0) {
            return { level: 'high', score: 95, reason: `Sending ${event.contains.join(', ')} to Third Party` };
        }

        // HIGH: PII sent to First Party
        if (event.contains && event.contains.length > 0) {
            return { level: 'medium', score: 70, reason: `Sending ${event.contains.join(', ')}` };
        }

        // MEDIUM: Third Party Tracker
        if (event.isThirdParty) {
            return { level: 'medium', score: 50, reason: 'Third-party request' };
        }

        // Simple heuristics for now
        if (event.method === 'POST') {
            return { level: 'low', score: 30, reason: 'Data transmission (POST)' };
        }
        return { level: 'low', score: 10, reason: 'Passive request' };
    }

    // Input Events
    if (event.type === 'input') {
        const source = event.sourceType as InputSourceType;
        switch (source) {
            case 'password':
            case 'credit_card':
                return { level: 'high', score: 90, reason: 'Sensitive financial/auth data' };
            case 'email':
            case 'phone':
            case 'address':
                return { level: 'medium', score: 60, reason: 'Personal Identity Information (PII)' };
            default:
                return { level: 'low', score: 20, reason: 'General input interaction' };
        }
    }

    return { level: 'low', score: 0, reason: 'Unknown event' };
};
