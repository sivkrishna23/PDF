// @ts-nocheck
import { storage } from '../utils/storage';
import { DataEvent } from '../types';

console.log('Personal Data Firewall: Background service started.');

// Placeholder for future logic
chrome.runtime.onInstalled.addListener(() => {
    console.log('Personal Data Firewall installed.');
});

const RULE_ID_BLOCK_THIRD_PARTY = 1;

// Function to update blocking rules
const updateBlockingRules = async () => {
    const { settings } = await chrome.storage.local.get('settings');
    const blockTrackers = settings?.blockTrackers || false;

    console.log('Background: Updating blocking rules. Block Turn on:', blockTrackers);

    if (blockTrackers) {
        // Add rule to block third-party requests
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [{
                id: RULE_ID_BLOCK_THIRD_PARTY,
                priority: 1,
                action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
                condition: {
                    resourceTypes: [
                        chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
                        chrome.declarativeNetRequest.ResourceType.SCRIPT,
                        chrome.declarativeNetRequest.ResourceType.IMAGE,
                        chrome.declarativeNetRequest.ResourceType.SUB_FRAME
                    ],
                    domainType: chrome.declarativeNetRequest.DomainType.THIRD_PARTY
                }
            }],
            removeRuleIds: [RULE_ID_BLOCK_THIRD_PARTY] // specific ID to clean up before adding
        });
    } else {
        // Remove rule
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: [RULE_ID_BLOCK_THIRD_PARTY]
        });
    }
};

// Listen for storage changes to trigger rule updates
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.settings) {
        updateBlockingRules();
    }
});

// Initialize rules on startup
chrome.runtime.onStartup.addListener(updateBlockingRules);
chrome.runtime.onInstalled.addListener(updateBlockingRules);

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'DATA_INPUT_DETECTED') {
        const event = message.payload as DataEvent;
        storage.saveEvent(event);
        console.log('Background: Input detected', event);

        // Optional: Update badge or notify popup
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
    }
    sendResponse({ status: 'received' });
});

// Network Monitoring
// Note: WebRequestBlocking is not supported in V3 service workers for blocking, 
// but we can use webRequest.onBeforeRequest for observation if we have the permission.
if (chrome.webRequest) {
    // @ts-ignore
    chrome.webRequest.onBeforeRequest.addListener(
        (details: any) => {
            if (details.method === 'POST' || details.method === 'PUT') {
                // Simple filter to reduce noise
                if (details.url.startsWith('chrome-extension://')) return;

                // 1. Third-Party Detection
                let isThirdParty = false;
                try {
                    if (details.initiator) {
                        const initiatorDomain = new URL(details.initiator).hostname;
                        const destinationDomain = new URL(details.url).hostname;
                        // Simple check: if domains don't end with the same suffix. 
                        // ideally we use a public suffix list, but for now simple substring check (e.g. google.com vs api.google.com)
                        // If destination doesn't include the initiator root (simplistic)
                        // Better: check if they share the last two parts (co.uk exception ignored for MVP)
                        const initParts = initiatorDomain.split('.');
                        const destParts = destinationDomain.split('.');
                        const initRoot = initParts.slice(-2).join('.');
                        const destRoot = destParts.slice(-2).join('.');
                        isThirdParty = initRoot !== destRoot;
                    }
                } catch (e) {
                    // If parsing fails, default false
                }

                // 2. Payload Analysis
                const contains: string[] = [];
                const sensitivePatterns = {
                    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
                    password: /password|passwd|pwd/i, // checking keys mostly
                    credit_card: /\b(?:\d[ -]*?){13,16}\b/ // very basic digit check
                };

                if (details.requestBody) {
                    // Check FormData
                    if (details.requestBody.formData) {
                        for (const key in details.requestBody.formData) {
                            if (sensitivePatterns.password.test(key)) contains.push('password');

                            const values = details.requestBody.formData[key];
                            values.forEach((val: any) => {
                                if (typeof val === 'string') {
                                    if (sensitivePatterns.email.test(val)) contains.push('email');
                                    if (sensitivePatterns.credit_card.test(val)) contains.push('credit_card');
                                }
                            });
                        }
                    }
                    // Check Raw (JSON)
                    if (details.requestBody.raw) {
                        details.requestBody.raw.forEach((element: any) => {
                            if (element.bytes) {
                                try {
                                    const text = new TextDecoder().decode(element.bytes);
                                    // Simple substring/regex checks on the whole body string for MVP simplicity
                                    if (sensitivePatterns.password.test(text)) contains.push('password');
                                    if (sensitivePatterns.email.test(text)) contains.push('email');
                                    if (sensitivePatterns.credit_card.test(text)) contains.push('credit_card');
                                } catch (e) {
                                    // ignore binary
                                }
                            }
                        });
                    }
                }

                // Deduplicate matches
                const uniqueContains = [...new Set(contains)];

                const event: DataEvent = {
                    id: crypto.randomUUID(),
                    type: 'network',
                    timestamp: Date.now(),
                    url: details.url,
                    method: details.method,
                    destinationDomain: new URL(details.url).hostname,
                    isThirdParty,
                    contains: uniqueContains,
                    metadata: {
                        requestId: details.requestId,
                        type: details.type,
                        initiator: details.initiator
                    }
                };

                storage.saveEvent(event);
                console.log('Background: Network request observed', event);
            }
        },
        { urls: ["<all_urls>"] },
        ["requestBody"]
    );
}
