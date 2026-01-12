# Chrome Web Store Permission Justification

**Permission:** `host_permissions` (`<all_urls>`) and `webRequest`

**Justification:**
The core functionality of "Personal Data Firewall" is to automatically detect and block data leaks and trackers in real-time across all websites the user visits. The extension monitors network requests (using `webRequest`) and filters them based on user-defined rules to identify when sensitive data (like emails or passwords) is being sent to third-party domains.

This protection must verify requests in the background without requiring the user to manually activate the extension on every single page load. Limiting to `activeTab` would render the automatic protection features useless, as the user would have to manually authorize the extension for every page they visit, defeating the purpose of a passive safety monitor.
