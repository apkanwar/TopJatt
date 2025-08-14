import { useEffect, useRef } from "react";

export default function TradingViewWidget({ symbol, boughtAt, soldAt, height = 500, theme = "light" }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !symbol) return;

        const SCRIPT_ID = "tradingview-widget-script";
        const ensureScript = () =>
            new Promise((resolve) => {
                const existing = document.getElementById(SCRIPT_ID);
                if (existing && window.TradingView) return resolve();
                if (existing) {
                    existing.addEventListener("load", resolve, { once: true });
                    return;
                }
                const s = document.createElement("script");
                s.id = SCRIPT_ID;
                s.src = "https://s3.tradingview.com/tv.js";
                s.async = true;
                s.onload = resolve;
                document.head.appendChild(s);
            });

        let widget;

        const makeWidget = async () => {
            await ensureScript();
            if (!window.TradingView || !containerRef.current) return;

            containerRef.current.innerHTML = "";
            widget = new window.TradingView.widget({
                symbol,
                interval: "D",
                timezone: "ETC/UTC",
                theme,
                style: "1",
                locale: "en",
                withdateranges: true,
                autosize: true,
                container_id: containerRef.current.id,
                hide_side_toolbar: true,
                hide_top_toolbar: true,
                hide_legend: false,
                hide_volume: true,
                allow_symbol_change: false,
            });
        };

        makeWidget();

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = "";
            widget = null;
        };
    }, [symbol, boughtAt, soldAt, theme]);

    return (
        <div className="bg-dashYellow rounded-xl p-2">
            <div id={`tv_${symbol || "chart"}`} ref={containerRef} style={{ width: "100%", height }} />
        </div>
    );
}