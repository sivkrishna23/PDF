import { useEffect } from 'react';
import { Shield, Activity, Settings, Lock, LayoutDashboard } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';

function App() {
    const { events, stats, loadEvents, loading, clearEvents } = useDataStore();

    useEffect(() => {
        loadEvents();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 w-64 h-full bg-white border-r border-slate-200 p-4">
                <div className="flex items-center space-x-2 mb-8">
                    <Shield className="w-8 h-8 text-indigo-600" />
                    <h1 className="font-bold text-xl text-slate-800">PD Firewall</h1>
                </div>

                <nav className="space-y-1">
                    <a href="#" className="flex items-center space-x-3 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium">
                        <Activity className="w-5 h-5" />
                        <span>Data Flow</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium">
                        <Lock className="w-5 h-5" />
                        <span>Rules</span>
                    </a>
                    <a href="#" className="flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md font-medium">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                    </a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
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
                <div className="grid grid-cols-3 gap-6 mb-8">
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

                {/* Event Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">Recent Data Flows</h3>
                    </div>
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
                                {!loading && events.map((event) => (
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
                                                    {event.isThirdParty && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded font-bold">3RD PARTY</span>}
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
                                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={event.type === 'network' ? event.url : ''}>
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
            </main >
        </div >
    );
}

export default App;
