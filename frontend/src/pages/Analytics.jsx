
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Navbar } from "@/components/Navbar";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

function Analytics() {
    const { shortId } = useParams();
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/${shortId}`, config);
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.error || "Failed to load analytics");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [shortId, token]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <p className="text-red-600">{error}</p>
                <Link to="/" className="mt-4 text-violet-600 hover:underline">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />
            <div className="container mx-auto px-4 py-8 mt-16">
                <Link to="/" className="flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Link>

                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Analytics</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                    Stats for <span className="font-mono text-violet-600">{data.shortId}</span> &rarr; {data.longUrl}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Clicks</h3>
                        <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">{data.clicks}</p>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Recent Activity</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Time</th>
                                    <th className="px-6 py-3 font-medium">IP Address</th>
                                    <th className="px-6 py-3 font-medium">User Agent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {data.analytics && data.analytics.slice().reverse().map((entry, i) => (
                                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                        <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                                            {entry.ip || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 max-w-xs truncate" title={entry.userAgent}>
                                            {entry.userAgent || "Unknown"}
                                        </td>
                                    </tr>
                                ))}
                                {(!data.analytics || data.analytics.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-zinc-500">
                                            No clicks yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
