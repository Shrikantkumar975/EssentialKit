import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, User, QrCode, Link as LinkIcon, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Dark Mode State
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") === "dark" ||
                (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
        }
        return false;
    });

    // Apply Dark Mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleTheme = () => setDarkMode(!darkMode);

    return (
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-50">
            {/* Logo / Navigation */}
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
                        <LinkIcon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg hidden sm:block">EssentialKit</span>
                </Link>

                {/* Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Menu className="h-4 w-4" />
                        <span>Features</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none animate-in fade-in zoom-in-95 duration-200">
                            <Link
                                to="/"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-violet-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-violet-400 transition-colors"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                    <LinkIcon className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-zinc-900 dark:text-zinc-100">URL Shortener</div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-500">Shorten long links</div>
                                </div>
                            </Link>
                            <Link
                                to="/qr"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-violet-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-violet-400 transition-colors"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <QrCode className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-zinc-900 dark:text-zinc-100">QR Generator</div>
                                    <div className="text-xs text-zinc-500 dark:text-zinc-500">Create QR codes</div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hidden sm:block">
                            Hi, {user.name}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={logout}
                            className="rounded-full text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/auth")}
                        className="text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                        <User className="mr-2 h-4 w-4" />
                        Login
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="rounded-full text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
            </div>
        </nav>
    );
}
