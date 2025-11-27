import { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Link as LinkIcon, Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AuthPage from "@/pages/Auth";
import QrGenerator from "@/pages/QrGenerator";
import { Navbar } from "@/components/Navbar";

function Home() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { token } = useAuth();

  const handleShorten = async (e) => {
    e.preventDefault();
    setError("");
    setShortUrl("");

    if (!longUrl) return;

    setLoading(true);
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/shorten`, {
        longUrl,
      }, config);
      setShortUrl(response.data.shortUrl);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    alert("Copied to clipboard!");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 transition-colors duration-300 dark:bg-zinc-950">
      <Navbar />

      <div className="w-full max-w-md space-y-8 mt-20">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30 transition-transform hover:scale-105">
            <LinkIcon className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Shorten Link
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Paste your URL to create a short link
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-zinc-200/50 ring-1 ring-zinc-100 transition-all dark:bg-zinc-900 dark:shadow-none dark:ring-zinc-800">
          <form className="space-y-5" onSubmit={handleShorten}>
            <div className="space-y-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                required
                className="h-12 rounded-xl border-zinc-200 bg-zinc-50 px-4 text-base transition-all focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-violet-500 dark:focus:bg-zinc-950"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-violet-600 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 hover:shadow-violet-500/40 disabled:opacity-70 dark:bg-violet-600 dark:hover:bg-violet-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing
                </>
              ) : (
                "Shorten URL"
              )}
            </Button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Result */}
          {shortUrl && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="group relative flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-1 pr-1 dark:border-zinc-800 dark:bg-zinc-950">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate px-4 text-base font-medium text-violet-600 hover:underline dark:text-violet-400"
                >
                  {shortUrl}
                </a>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="h-10 w-10 rounded-lg text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow-sm dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              <p className="mt-2 text-center text-xs font-medium text-zinc-400 dark:text-zinc-500">
                Click to copy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/qr" element={<QrGenerator />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;