import { Carousel, IconButton } from "@material-tailwind/react";
import Image from "next/image";
import { useState } from "react";

const slides = [
    {
        image: "/wellandVale/wellandVale.jpeg",
        title: "Trade #1",
        description: "This is the description for Trade #1.",
        extra: "Any extra content or buttons here.",
    },
    {
        image: "/wellandVale/wellandValeConcept.jpeg",
        title: "Trade #2",
        description: "This is the description for Trade #2.",
        extra: "Any extra content or buttons here.",
    },
    // Add more slides as needed
];

export default function CarouselWithSideContent({ data = slides }) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="">
            <Carousel
                className='rounded-xl'
                activeIndex={activeIndex}
                onChange={setActiveIndex}
                navigation={({ setActiveIndex, activeIndex, length }) => (
                    // <>
                    //     <div className="absolute bottom-20 left-2/4 z-50 flex -translate-x-2/4 gap-2 bg-white py-2 px-3 rounded-full">
                    //         {new Array(length).fill("").map((_, i) => (
                    //             <span key={i} className={`block h-1 cursor-pointer rounded-2xl transition-all content-['']
                    //             ${activeIndex === i ? "w-8 bg-top-orange" : "w-4 bg-midnight"}`} onClick={() =>
                    //                     setActiveIndex(i)}
                    //             />
                    //         ))}
                    //     </div>
                    <div className="absolute bottom-8 left-2/4 z-50 flex -translate-x-2/4 gap-3 bg-white py-2 px-4 rounded-full">
                        {new Array(length).fill("").map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`px-3 py-1 rounded-full font-semibold transition-colors ${activeIndex === i ? 'bg-top-orange text-white' : 'bg-gray-200 text-gray-700 hover:bg-top-orange hover:text-white'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    // </>
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
                {data.map((slide, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row items-stretch bg-customBlack rounded-3xl shadow-lg overflow-hidden min-h-[700px] h-[700px] p-16 pb-24 border-white border-8 gap-8">
                        <div className="md:w-1/2 w-full flex-shrink-0 relative h-40 md:h-full">
                            <Image src={slide.image} alt={slide.title} className="rounded-xl object-cover" fill priority />
                        </div>
                        <div className="md:w-1/2 w-full p-6 flex flex-col justify-center h-full">
                            <h2 className="text-2xl font-bold mb-2 text-white">{slide.title}</h2>
                            <p className="text-gray-300 mb-4">{slide.description}</p>
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    );
}