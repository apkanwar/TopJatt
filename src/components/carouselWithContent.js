import { Carousel, IconButton } from "@material-tailwind/react";
import Image from "next/image";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const TradingViewWidget = dynamic(() => import("./TradingViewWidget"), { ssr: false });

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

/**
 * CarouselWithSideContent
 * Expects `data` items with fields like:
 * { image?, symbol, name, buyPrice, sellPrice?, shares, boughtAt?, soldAt?, description? }
 * If `image` is missing, we use the existing placeholder image.
 */
export default function CarouselWithSideContent({ data = slides }) {
    const [activeIndex, setActiveIndex] = useState(0);

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
        }));
    }, [data]);

    return (
        <div className="">
            <Carousel
                className='rounded-xl'
                activeIndex={activeIndex}
                onChange={setActiveIndex}
                loop
                navigation={({ setActiveIndex, activeIndex, length }) => (
                    <div className="absolute bottom-8 left-2/4 z-50 flex -translate-x-2/4 gap-3 bg-white py-2 px-4 rounded-full">
                        {new Array(length).fill("").map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`px-3 py-1 rounded-full font-semibold transition-colors ${activeIndex === i ? 'bg-top-orange text-white' : 'bg-gray-200 text-gray-700 hover:bg-top-orange hover:text-white'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
                prevArrow={({ handlePrev }) => (
                    <IconButton variant="text" color="white" size="lg" onClick={handlePrev}
                        className="!absolute bottom-2 left-16 -translate-y-2/4 bg-top-orange">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                            stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </IconButton>
                )}
                nextArrow={({ handleNext }) => (
                    <IconButton variant="text" color="white" size="lg" onClick={handleNext}
                        className="!absolute bottom-2 !right-16 -translate-y-2/4 bg-top-orange">
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
                    const title = slide.symbol ? `${slide.symbol} • ${slide.name || ''}` : (slide.name || slide.fallbackTitle || '');

                    return (
                        <div key={idx} className="flex flex-col md:flex-row items-stretch bg-customBlack rounded-3xl shadow-lg overflow-hidden min-h-[700px] h-[700px] p-16 pb-24 border-white border-8 gap-8">
                            {/* LEFT: image (keep placeholder if no stock graph available) */}
                            <div className="md:w-1/2 w-full flex-shrink-0 relative h-40 md:h-full">
                                {slide.symbol ? (
                                    <TradingViewWidget
                                        symbol={slide.symbol}
                                        boughtAt={slide.boughtAt}
                                        soldAt={slide.soldAt}
                                        height={500}
                                        theme="light"
                                    />
                                ) : (
                                    <Image src={slide.image} alt={title || `Trade ${idx + 1}`} className="rounded-xl object-cover" fill priority />
                                )}
                            </div>

                            {/* RIGHT: trade details */}
                            <div className="md:w-1/2 w-full p-6 flex flex-col justify-center h-full text-white">
                                <h2 className="text-2xl font-bold mb-4">{title}</h2>

                                {/* Optional long description (if provided) */}
                                {slide.description && (
                                    <p className="text-gray-300 mb-6">{slide.description}</p>
                                )}

                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div className="text-gray-400">Buy Price</div>
                                    <div className="font-medium">{slide.buyPrice != null ? Number(slide.buyPrice).toFixed(2) : '—'}</div>

                                    <div className="text-gray-400">Sell Price</div>
                                    <div className="font-medium">{slide.sellPrice != null ? Number(slide.sellPrice).toFixed(2) : '—'}</div>

                                    <div className="text-gray-400">Shares</div>
                                    <div className="font-medium">{slide.shares != null ? Number(slide.shares) : '—'}</div>

                                    <div className="text-gray-400">Bought</div>
                                    <div className="font-medium">{fmtDate(slide.boughtAt)}</div>

                                    <div className="text-gray-400">Sold</div>
                                    <div className="font-medium">{fmtDate(slide.soldAt)}</div>

                                    <div className="text-gray-400">Status</div>
                                    <div className="font-medium">{isClosed ? 'Closed' : 'Open'}</div>

                                    <div className="text-gray-400">Profit</div>
                                    <div className="font-bold">{profit == null ? '—' : profit.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Carousel>
        </div>
    );
}