export default function Loading() {
    return (
        <div className="app-container">
            {/* Sidebar skeleton */}
            <div className="sidebar" style={{ opacity: 0.6 }}>
                <div className="flex items-center gap-3" style={{ marginBottom: "32px", padding: "8px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "var(--bg-hover)" }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ width: "60%", height: 14, borderRadius: 4, backgroundColor: "var(--bg-hover)", marginBottom: 6 }} />
                        <div style={{ width: "80%", height: 10, borderRadius: 4, backgroundColor: "var(--bg-hover)" }} />
                    </div>
                </div>
                <div style={{ padding: "0 8px", marginBottom: "16px" }}>
                    <div style={{ width: "50%", height: 10, borderRadius: 4, backgroundColor: "var(--bg-hover)" }} />
                </div>
                {[1, 2].map(i => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, backgroundColor: "var(--bg-hover)" }} />
                        <div style={{ width: `${50 + i * 15}%`, height: 14, borderRadius: 4, backgroundColor: "var(--bg-hover)" }} />
                    </div>
                ))}
            </div>

            {/* Main content skeleton */}
            <main className="main-content">
                <div style={{ padding: "0" }}>
                    {/* Title skeleton */}
                    <div className="flex items-center gap-3" style={{ marginBottom: 32 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "var(--bg-hover)", animation: "pulse 1.5s infinite" }} />
                        <div style={{ width: 200, height: 28, borderRadius: 6, backgroundColor: "var(--bg-hover)", animation: "pulse 1.5s infinite" }} />
                    </div>

                    {/* Tabs skeleton */}
                    <div className="flex items-center gap-6" style={{ marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid var(--border-color)" }}>
                        {[80, 70, 90, 95].map((w, i) => (
                            <div key={i} style={{ width: w, height: 16, borderRadius: 4, backgroundColor: "var(--bg-hover)", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>

                    {/* Table skeleton */}
                    <div style={{ backgroundColor: "var(--bg-panel)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                        {/* Header */}
                        <div className="flex items-center gap-4" style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-color)" }}>
                            {[25, 20, 13, 17, 13].map((w, i) => (
                                <div key={i} style={{ width: `${w}%`, height: 12, borderRadius: 4, backgroundColor: "var(--bg-hover)" }} />
                            ))}
                        </div>
                        {/* Rows */}
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-4" style={{ padding: "16px", borderBottom: "1px solid var(--border-color)" }}>
                                <div style={{ width: "25%", height: 14, borderRadius: 4, backgroundColor: "var(--bg-hover)", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.08}s` }} />
                                <div style={{ width: "20%", height: 14, borderRadius: 4, backgroundColor: "var(--bg-hover)", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.08 + 0.05}s` }} />
                                <div style={{ width: "10%", height: 24, borderRadius: 12, backgroundColor: "var(--bg-hover)", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.08 + 0.1}s` }} />
                                <div style={{ width: "15%", height: 14, borderRadius: 4, backgroundColor: "var(--bg-hover)", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.08 + 0.15}s` }} />
                                <div style={{ width: "8%", height: 22, borderRadius: 4, backgroundColor: "var(--bg-hover)", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.08 + 0.2}s` }} />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
