"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const stored = document.documentElement.getAttribute("data-theme") as "dark" | "light";
        if (stored) setTheme(stored);
    }, []);

    const toggle = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    };

    return (
        <button
            onClick={toggle}
            style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
                borderRadius: "var(--radius-md)", width: "100%", color: "var(--text-secondary)",
                transition: "background-color var(--transition-fast)", cursor: "pointer"
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
            onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
    );
}
