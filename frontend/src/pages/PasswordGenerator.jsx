import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, KeyRound, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function PasswordGenerator() {
    const [password, setPassword] = useState("");
    const [length, setLength] = useState(12);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        let charset = "";
        if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
        if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeNumbers) charset += "0123456789";
        if (includeSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

        if (charset === "") {
            setPassword("");
            return;
        }

        let newPassword = "";
        for (let i = 0; i < length; i++) {
            newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setPassword(newPassword);
        setCopied(false);
    };

    useEffect(() => {
        generatePassword();
    }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

    const copyToClipboard = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 transition-colors duration-300 dark:bg-zinc-950">
            <Navbar />

            <div className="w-full max-w-md space-y-8 mt-20">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30 transition-transform hover:scale-105">
                        <KeyRound className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Password Generator
                    </h1>
                    <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                        Create secure, random passwords instantly
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-3xl bg-white p-8 shadow-xl shadow-zinc-200/50 ring-1 ring-zinc-100 transition-all dark:bg-zinc-900 dark:shadow-none dark:ring-zinc-800">
                    <div className="space-y-6">

                        {/* Password Display */}
                        <div className="relative">
                            <div className="flex h-14 w-full items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-lg font-mono font-medium text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                                <span className="truncate mr-2">{password || "Select options"}</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={generatePassword}
                                        className="p-2 text-zinc-500 hover:text-violet-600 transition-colors"
                                        title="Regenerate"
                                    >
                                        <RefreshCw className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`p-2 transition-colors ${copied ? "text-green-500" : "text-zinc-500 hover:text-violet-600"}`}
                                        title="Copy"
                                    >
                                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            {/* Length Slider */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    <label>Password Length</label>
                                    <span className="text-violet-600 dark:text-violet-400">{length}</span>
                                </div>
                                <input
                                    type="range"
                                    min="4"
                                    max="32"
                                    value={length}
                                    onChange={(e) => setLength(parseInt(e.target.value))}
                                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800 accent-violet-600"
                                />
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeUppercase}
                                        onChange={(e) => setIncludeUppercase(e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-900"
                                    />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Uppercase</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeLowercase}
                                        onChange={(e) => setIncludeLowercase(e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-900"
                                    />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Lowercase</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeNumbers}
                                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-900"
                                    />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Numbers</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={includeSymbols}
                                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-900"
                                    />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Symbols</span>
                                </label>
                            </div>
                        </div>

                        <Button
                            onClick={copyToClipboard}
                            className="h-12 w-full rounded-xl bg-violet-600 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 hover:shadow-violet-500/40 dark:bg-violet-600 dark:hover:bg-violet-500"
                        >
                            {copied ? "Copied!" : "Copy Password"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
