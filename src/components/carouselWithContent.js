import { Carousel, IconButton } from "@material-tailwind/react";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const AdvancedChart = dynamic(
    () => import("react-tradingview-embed").then((m) => m.AdvancedChart),
    { ssr: false }
);

function fmtDate(d) {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function computeProfit(buyPrice, sellPrice, shares) {
    if (sellPrice == null || !Number.isFinite(Number(sellPrice))) return null;
    const buy = Number(buyPrice ?? 0);
    const sell = Number(sellPrice ?? 0);
    const sh = Number(shares ?? 0);
    return (sell - buy) * sh;
}

function fmtCurrency(v) {
    if (v == null || isNaN(Number(v))) return "—";
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2
        }).format(Number(v));
    } catch {
        return Number(v).toFixed(2);
    }
}

function fmtNumber(v) {
    if (v == null || isNaN(Number(v))) return "—";
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(v));
}

// Format a percent like +12.34%
function fmtPercent(v) {
    if (v == null || isNaN(Number(v))) return "—";
    const n = Number(v);
    const sign = n > 0 ? "+" : "";
    return `${sign}${n.toFixed(2)}%`;
}

// Compute profit percent ((sell - buy) / buy) * 100 * leverage
function computeProfitPercent(buyPrice, sellPrice, leverage = 1) {
    if (sellPrice == null || !Number.isFinite(Number(sellPrice))) return null;
    const buy = Number(buyPrice ?? 0);
    const sell = Number(sellPrice ?? 0);
    const lev = Number(leverage ?? 1) || 1;
    if (!isFinite(buy) || buy === 0) return null;
    return ((sell - buy) / buy) * 100 * lev;
}

export default function CarouselWithSideContent({ data = [] }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [viewport, setViewport] = useState("desktop"); // "mobile" | "tablet" | "desktop"

    useEffect(() => {
        const check = () => {
            if (window.innerWidth < 768) setViewport("mobile");
            else if (window.innerWidth < 1024) setViewport("tablet");
            else setViewport("desktop");
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Normalize incoming data: ensure we always have the properties we render.
    const items = useMemo(() => {
        return (data || []).map((t) => ({
            image: t?.image || null,
            symbol: t?.symbol,
            name: t?.name || t?.title,
            buyPrice: t?.buyPrice,
            sellPrice: t?.sellPrice,
            shares: t?.shares,
            boughtAt: t?.boughtAt,
            soldAt: t?.soldAt,
            leverage: t?.leverage
        }));
    }, [data]);

    return (
        <div className="mx-4">
            <Carousel
                className='rounded-xl'
                activeIndex={activeIndex}
                onChange={setActiveIndex}
                loop
                navigation={({ setActiveIndex, activeIndex, length }) => (
                    <div className="hidden md:flex absolute bottom-8 md:bottom-14 lg:bottom-8 left-2/4 z-50 -translate-x-2/4 gap-3 bg-white py-2 px-4 rounded-full">
                        {new Array(length).fill("").map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`px-2.5 py-1 rounded-full font-semibold transition-colors ${activeIndex === i ? 'bg-top-orange text-white' : 'bg-gray-200 text-gray-700 hover:bg-top-orange hover:text-white'}`}
                            >
                            </button>
                        ))}
                    </div>
                )}
                prevArrow={({ handlePrev }) => (
                    <IconButton variant="text" color="white" size="lg" onClick={handlePrev}
                        className="flex !absolute bottom-0 md:bottom-8 lg:bottom-2 md:left-16 left-8 -translate-y-2/4 bg-top-orange">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                            stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </IconButton>
                )}
                nextArrow={({ handleNext }) => (
                    <IconButton variant="text" color="white" size="lg" onClick={handleNext}
                        className="flex !absolute bottom-0 md:bottom-8 lg:bottom-2 right-8 md:!right-16 -translate-y-2/4 bg-top-orange">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                            stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </IconButton>
                )}
            >
                {items.map((slide, idx) => {
                    const profit = computeProfit(slide.buyPrice, slide.sellPrice, slide.shares);
                    const isClosed = slide.soldAt && slide.sellPrice != null;
                    const title = slide.name
                    const profitPct = computeProfitPercent(slide.buyPrice, slide.sellPrice, slide.leverage);
                    const percentLabel = profitPct == null ? "—" : fmtPercent(profitPct);

                    return (
                        <div key={`${slide.symbol || 'img'}-${idx}`} className="flex flex-col lg:flex-row items-stretch bg-customBlack rounded-3xl shadow-lg overflow-hidden min-h-[520px] h-auto p-4 md:p-16 md:pb-24 border-white border-8 gap-8">
                            {/* LEFT: image (keep placeholder if no stock graph available) */}
                            <div className={`w-full lg:w-1/2 flex-shrink-0 relative !h-64 md:!h-80 lg:!h-[500px] rounded-xl`}>
                                {slide.symbol ? (
                                    <AdvancedChart
                                        key={`${slide.symbol || "img"}-${idx}`}
                                        widgetProps={{
                                            symbol: slide.symbol,
                                            theme: "light",
                                            interval: "D",
                                            autosize: true,
                                            allow_symbol_change: false,
                                            hide_side_toolbar: true,
                                            withdateranges: true,
                                            timezone: "Etc/UTC",
                                            locale: "en",
                                            style: "1",
                                            height: '100%',
                                            container_id: `tv_${(slide.symbol || 'img').replace(/[^a-zA-Z0-9_]/g, '')}_${idx}`,
                                        }}
                                    />
                                ) : (
                                    <Image src={slide.image} alt={title || `Trade ${idx + 1}`} className="rounded-xl object-cover" fill priority />
                                )}
                            </div>

                            {/* RIGHT: trade details (modern design) */}
                            <div className="w-full lg:w-1/2 p-4 lg:p-6 h-full text-white mb-16 md:mb-4 pt-0">
                                {/* Header: title + status pill */}
                                <div className="flex items-start justify-between gap-3 mb-8">
                                    <h2 className="text-2xl md:text-3xl font-bold leading-tight min-h-[60px]">{title}</h2>
                                    <span className={`px-2.5 py-1 mt-0.5 md:mt-1.5 rounded-full text-xs font-semibold ring-2 ${!isClosed
                                        ? "bg-amber-500/10 text-amber-300 ring-amber-400"
                                        : (profit ?? 0) >= 0
                                            ? "bg-green-500/10 text-green-300 ring-green-400"
                                            : "bg-red-500/10 text-red-300 ring-red-400"
                                        }`}
                                        title={!isClosed ? "Trade is open" : "Trade is closed"}
                                    >
                                        {!isClosed ? "Open" : "Closed"}
                                    </span>
                                </div>

                                {/* Info Banners */}
                                <div className="space-y-4">
                                    {/* Dates banner */}
                                    <div className="rounded-xl p-4 ring-1 ring-white/10 bg-white/5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm uppercase tracking-wide text-dashWhite font-semibold">Bought</div>
                                                <div className="text-base md:text-lg font-medium">{fmtDate(slide.boughtAt)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm uppercase tracking-wide text-dashWhite font-semibold">Sold</div>
                                                <div className="text-base md:text-lg font-medium">{fmtDate(slide.soldAt)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Prices banner */}
                                    <div className="rounded-xl p-4 ring-1 ring-white/10 bg-white/5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm uppercase tracking-wide text-dashWhite font-semibold">Buy Price</div>
                                                <div className="text-base md:text-lg font-medium">{fmtCurrency(slide.buyPrice)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm uppercase tracking-wide text-dashWhite font-semibold">Sell Price</div>
                                                <div className="text-base md:text-lg font-medium">{fmtCurrency(slide.sellPrice)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shares banner */}
                                    <div className="rounded-xl p-4 ring-1 ring-white/10 bg-white/5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm uppercase tracking-wide text-dashWhite font-semibold">Shares</div>
                                                <div className="text-base md:text-lg font-medium">{fmtNumber(slide.shares)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm uppercase tracking-wide text-dashWhite font-semibold">Leverage</div>
                                                <div className="text-base md:text-lg font-medium">{fmtNumber(slide.leverage)}x</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Profit banner */}
                                {(() => {
                                    const profitClass =
                                        profit == null
                                            ? "text-amber-300 ring-amber-500/20 bg-amber-500/5"
                                            : profit >= 0
                                                ? "text-green-300 ring-green-500/30 bg-green-500/10"
                                                : "text-red-300 ring-red-500/30 bg-red-500/10";
                                    const profitLabel = profit == null ? "—" : fmtCurrency(profit);
                                    return (
                                        <div className={`mt-6 rounded-xl p-4 ring-1 ${profitClass}`}>
                                            <div className="text-sm uppercase tracking-wide opacity-80">Profit</div>
                                            <div className="mt-1 flex items-center gap-2">
                                                {isClosed && profit != null && (
                                                    profit >= 0 ? (
                                                        <TrendingUpIcon className="text-green-600" fontSize="small" />
                                                    ) : (
                                                        <TrendingDownIcon className="!text-red-600" fontSize="small" />
                                                    )
                                                )}
                                                <div className="text-2xl font-semibold">{profitLabel} ({percentLabel}) </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })}
            </Carousel>
        </div>
    );
}