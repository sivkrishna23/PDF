import { DataEvent, InputSourceType } from '../types';

console.log('Personal Data Firewall: Content script loaded.');

// Helper to identify input type
const identifyInputType = (element: HTMLInputElement): InputSourceType => {
    const type = element.type.toLowerCase();
    const name = element.name.toLowerCase();
    const id = element.id.toLowerCase();

    if (type === 'email' || name.includes('email') || id.includes('email')) return 'email';
    if (type === 'tel' || name.includes('phone') || id.includes('phone') || name.includes('mobile')) return 'phone';
    if (type === 'password') return 'password';
    if (name.includes('card') || id.includes('card') || name.includes('cc_')) return 'credit_card';
    if (name.includes('address') || id.includes('address')) return 'address';

    return 'unknown';
};

// Debounce helper to prevent spamming events
const debouncedLog = new Set<string>();

const handleInputInteraction = (element: HTMLInputElement) => {
    const inputType = identifyInputType(element);
    if (inputType === 'unknown') return;

    const eventId = `${window.location.host}-${inputType}`;
    if (debouncedLog.has(eventId)) return; // Prevent duplicate logging per page load for now

    const event: DataEvent = {
        id: crypto.randomUUID(),
        type: 'input',
        timestamp: Date.now(),
        url: window.location.href,
        sourceType: inputType,
        metadata: {
            fieldName: element.name,
            fieldType: element.type
        }
    };

    debouncedLog.add(eventId);

    // Send to background for storage
    chrome.runtime.sendMessage({ type: 'DATA_INPUT_DETECTED', payload: event });
};

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof HTMLElement) {
                    // Check the node itself
                    if (node instanceof HTMLInputElement) {
                        node.addEventListener('blur', () => handleInputInteraction(node));
                    }
                    // Check children
                    const inputs = node.querySelectorAll('input');
                    inputs.forEach((input) => {
                        input.addEventListener('blur', () => handleInputInteraction(input));
                    });
                }
            });
        }
    }
});

// Initial scan
document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('blur', () => handleInputInteraction(input));
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
