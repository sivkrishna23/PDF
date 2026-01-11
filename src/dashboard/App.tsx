import { useEffect, useState } from 'react';
import { Shield, Activity, Settings, Lock, LayoutDashboard } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

function App() {
    const { events, stats, loadEvents, loading, clearEvents, settings, toggleProtection, toggleBlockTrackers } = useDataStore();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'data-flow' | 'rules' | 'settings'>('dashboard');

    useEffect(() => {
        loadEvents();

        // Handle deep linking from popup
        const hash = window.location.hash.replace('#', '');
        if (['dashboard', 'data-flow', 'rules', 'settings'].includes(hash)) {
            setActiveTab(hash as any);
        }
    }, []);

    // --- Views ---

    const DashboardView = () => (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Your Privacy Overview</h2>
                    <p className="text-slate-500">Monitoring data flows in real-time.</p>
                </div>
                <div className="flex space-x-4">
                    <button onClick={() => loadEvents()} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50">Refresh Data</button>
                    <button onClick={() => clearEvents()} className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100">Clear Logs</button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 uppercase">Total Data Events</div>
                    <div className="mt-2 text-3xl font-bold text-slate-900">{stats.totalEvents}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 uppercase">High Risk Detections</div>
                    <div className="mt-2 text-3xl font-bold text-red-600">{stats.highRiskCount}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="text-sm font-medium text-slate-500 uppercase">Trackers Blocked</div>
                    <div className="mt-2 text-3xl font-bold text-indigo-600">{stats.trackers}</div>
                </div>
            </div>

            {/* Event Table (Summary) */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">Recent Activity</h3>
                    <button onClick={() => setActiveTab('data-flow')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Source/Destination</th>
                                <th className="px-6 py-3">Risk Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading && <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">Loading...</td></tr>}
                            {!loading && events.slice(0, 5).map((event) => (
                                <tr key={event.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{new Date(event.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.type === 'input' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {event.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">
                                        {event.type === 'input' ? event.sourceType : (
                                            <div className="flex items-center space-x-2">
                                                <span>{event.destinationDomain}</span>
                                                {event.isThirdParty && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded font-bold">3RD</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.risk.level === 'high' ? 'bg-red-100 text-red-800' :
                                            event.risk.level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {event.risk.level}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const DataFlowView = () => (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Data Flow Logs</h2>
                    <p className="text-slate-500">Detailed record of all monitored network and input events.</p>
                </div>
                <div className="flex space-x-4">
                    <button onClick={() => loadEvents()} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50">Refresh</button>
                    <button onClick={() => clearEvents()} className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100">Clear All</button>
                </div>
            </header>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Source/Destination</th>
                                <th className="px-6 py-3">Risk Level</th>
                                <th className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading && <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-500">Loading...</td></tr>}
                            {!loading && events.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No events found.</td></tr>}
                            {!loading && events.map((event) => (
                                <tr key={event.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">{new Date(event.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.type === 'input' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                            {event.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">
                                        {event.type === 'input' ? event.sourceType : (
                                            <div className="flex items-center space-x-2">
                                                <span>{event.destinationDomain}</span>
                                                {event.isThirdParty && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded font-bold">3RD</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.risk.level === 'high' ? 'bg-red-100 text-red-800' :
                                            event.risk.level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {event.risk.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 max-w-xs text-xs truncate" title={event.type === 'network' ? event.url : ''}>
                                        {event.type === 'network' ? (
                                            <div className="flex flex-col">
                                                <span className="truncate">{event.url}</span>
                                                {event.contains && event.contains.length > 0 && (
                                                    <span className="text-xs text-red-500 font-medium">Contains: {event.contains.join(', ')}</span>
                                                )}
                                            </div>
                                        ) : `Field: ${event.metadata?.fieldName}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const RulesView = () => (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-slate-800">Protection Rules</h2>
                <p className="text-slate-500">Current logic used to classify data events.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center"><Shield className="w-5 h-5 mr-2" />High Risk Rules</h3>
                    <ul className="space-y-3 text-sm text-slate-700">
                        <li className="flex items-start">
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold mr-2 mt-0.5">BLOCK</span>
                            <span>PII (Personally Identifiable Information) detected in requests being sent to <strong>Third Party</strong> domains.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold mr-2 mt-0.5">ALERT</span>
                            <span>Input detected in <strong>Password</strong> or <strong>Credit Card</strong> fields.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center"><Activity className="w-5 h-5 mr-2" />Medium Risk Rules</h3>
                    <ul className="space-y-3 text-sm text-slate-700">
                        <li className="flex items-start">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold mr-2 mt-0.5">WARN</span>
                            <span>PII detected in requests to <strong>First Party</strong> domains (Self).</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold mr-2 mt-0.5">WARN</span>
                            <span>Input detected in <strong>Email</strong>, <strong>Phone</strong>, or <strong>Address</strong> fields.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold mr-2 mt-0.5">TRACK</span>
                            <span>Any request to known <strong>Third Party Tracking</strong> domains.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const SettingsView = () => (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-slate-500">Configure your firewall preferences.</p>
            </header>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 divide-y divide-slate-200">
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-slate-900">Global Protection</h3>
                        <p className="text-slate-500 text-sm mt-1">Enable or disable all monitoring and blocking features.</p>
                    </div>
                    <button
                        onClick={toggleProtection}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.protectionEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.protectionEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-slate-900">Block Trackers</h3>
                        <p className="text-slate-500 text-sm mt-1">Automatically block requests to known third-party tracking domains.</p>
                    </div>
                    <button
                        onClick={toggleBlockTrackers}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${settings.blockTrackers ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.blockTrackers ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="p-6">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">About</h3>
                    <div className="text-sm text-slate-500 space-y-2">
                        <p><strong>Version:</strong> 1.0.0</p>
                        <p>PD Firewall protects your sensitive data from leaking to third parties and trackers.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 w-64 h-full bg-white border-r border-slate-200 p-4 z-10">
                <div className="flex items-center space-x-2 mb-8">
                    <Shield className="w-8 h-8 text-indigo-600" />
                    <h1 className="font-bold text-xl text-slate-800">PD Firewall</h1>
                </div>

                <nav className="space-y-1">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('data-flow')}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${activeTab === 'data-flow' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Activity className="w-5 h-5" />
                        <span>Data Flow</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${activeTab === 'rules' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Lock className="w-5 h-5" />
                        <span>Rules</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'data-flow' && <DataFlowView />}
                {activeTab === 'rules' && <RulesView />}
                {activeTab === 'settings' && <SettingsView />}
            </main>
        </div>
    );
}

export default App;
