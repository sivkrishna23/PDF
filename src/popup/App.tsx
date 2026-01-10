import { useEffect } from 'react';
import { Shield, Activity, Settings, Lock, FileText, Globe } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

function App() {
    const { events, stats, loadEvents, loading, settings, toggleProtection, toggleBlockTrackers, siteRisk } = useDataStore();

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const openDashboard = () => {
        // In manual build, it might be flat or nested, check build output.
        // Actually with the manual config: entryFileNames: 'assets/[name].js'.
        // But the HTML files are usually at root or src structure depending on vite.
        // Let's assume standard extension structure: 'src/dashboard/index.html' -> 'assets/dashboard.html' IS WRONG usually.
        // Vite usually keeps the directory structure for HTML or flattens it.
        // Let's use runtime.getURL('src/dashboard/index.html') if vite maps it there, or just 'dashboard.html' if flattened.
        // Based on vite config input: dashboard: 'src/dashboard/index.html'.
        // Vite build usually outputs `dist/src/dashboard/index.html` OR `dist/dashboard.html`.
        // Let's check build behavior. For now, try specific path.
        chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/index.html') });
    };

    return (
        <div className="w-[350px] h-[550px] bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-indigo-600 text-white p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-6 h-6" />
                        <h1 className="font-bold text-lg">PD Firewall</h1>
                    </div>
                    {/* Site Risk Badge */}
                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${siteRisk.level === 'high' ? 'bg-red-500' :
                        siteRisk.level === 'medium' ? 'bg-yellow-500 text-yellow-900' : 'bg-green-500'
                        }`}>
                        {siteRisk.level} Risk
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium">Protection</span>
                        <div
                            onClick={() => toggleProtection()}
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${settings.protectionEnabled ? 'bg-green-400' : 'bg-slate-400'
                                }`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${settings.protectionEnabled ? 'left-6' : 'left-1'
                                }`} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4">

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white shadow-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">Block Trackers</span>
                        <button
                            onClick={toggleBlockTrackers}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.blockTrackers ? 'bg-green-400' : 'bg-black/20'}`}
                        >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${settings.blockTrackers ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <p className="text-[10px] opacity-80">Prevent third-party monitoring scripts.</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 mb-4">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Daily Activity</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-2 bg-slate-50 rounded">
                            <div className="text-2xl font-bold text-indigo-600">{stats.trackers}</div>
                            <div className="text-xs text-slate-500">Trackers</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded">
                            <div className="text-2xl font-bold text-indigo-600">{stats.totalEvents}</div>
                            <div className="text-xs text-slate-500">Data Flows</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Events</h2>
                        <button onClick={() => loadEvents()} className="text-xs text-indigo-600 hover:underline">Refresh</button>
                    </div>

                    {loading && <div className="text-center py-4 text-xs text-slate-400">Loading...</div>}

                    {!loading && events.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            No recent data events captured.
                        </div>
                    )}

                    <div className="space-y-2">
                        {events.slice(0, 5).map((event) => (
                            <div key={event.id} className="flex items-start space-x-3 p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors border-l-2" style={{ borderLeftColor: event.risk.level === 'high' ? '#EF4444' : event.risk.level === 'medium' ? '#F59E0B' : '#10B981' }}>
                                <div className="mt-1">
                                    {event.type === 'input' ? <FileText className="w-4 h-4 text-slate-400" /> : <Globe className="w-4 h-4 text-slate-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-slate-800 truncate flex items-center space-x-1">
                                        <span>{event.type === 'input' ? `Input: ${event.sourceType}` : `Req: ${event.destinationDomain}`}</span>
                                        {event.isThirdParty && <span className="px-1 py-0.5 bg-purple-100 text-purple-700 text-[9px] rounded font-bold">3RD</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">{new Date(event.timestamp).toLocaleTimeString()} • {event.risk.reason}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={openDashboard} className="w-full mt-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors">
                        View Full Dashboard
                    </button>
                </div>
            </main>

            {/* Navigation */}
            <nav className="bg-white border-t border-slate-200 p-2 flex justify-around text-xs font-medium text-slate-500">
                <button className="flex flex-col items-center space-y-1 p-2 hover:text-indigo-600 transition-colors text-indigo-600">
                    <Activity className="w-5 h-5" />
                    <span>Activity</span>
                </button>
                <button className="flex flex-col items-center space-y-1 p-2 hover:text-indigo-600 transition-colors">
                    <Lock className="w-5 h-5" />
                    <span>Rules</span>
                </button>
                <button className="flex flex-col items-center space-y-1 p-2 hover:text-indigo-600 transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </button>
            </nav>
        </div>
    );
}

export default App;
