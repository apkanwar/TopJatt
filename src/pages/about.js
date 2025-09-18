import { useState, useEffect } from "react";
import Dash from "@/components/dash";
import Image from "next/image";
import Link from "next/link";

export default function About() {
    const [aboutContent, setAboutContent] = useState("");

    useEffect(() => {
        fetch("/api/fetch-about")
            .then((res) => res.json())
            .then((data) => setAboutContent(data.content));
    }, []);

    const renderContent = (content) => {
        const blocks = content.split('\n\n');

        return blocks.map((block, blockIndex) => {
            const lines = block.split('\n');

            const isUnorderedList = lines.every(line => line.trim().startsWith('- '));
            const isOrderedList = lines.every(line => /^\d+\. /.test(line.trim()));

            if (isUnorderedList) {
                return (
                    <ul key={blockIndex} className="list-disc list-inside">
                        {lines.map((line, idx) => (
                            <li key={idx}>{line.trim().slice(2)}</li>
                        ))}
                    </ul>
                );
            } else if (isOrderedList) {
                return (
                    <ol key={blockIndex} className="list-decimal list-inside">
                        {lines.map((line, idx) => {
                            const itemText = line.trim().replace(/^\d+\. /, '');
                            return <li key={idx}>{itemText}</li>;
                        })}
                    </ol>
                );
            } else {
                return (
                    <p key={blockIndex}>
                        {lines.map((line, idx) => (
                            <span key={idx}>
                                {line}
                                {idx !== lines.length - 1 && <br />}
                            </span>
                        ))}
                    </p>
                );
            }
        });
    };

    return (
        <div className="flex flex-col gap-12 max-w-7xl mx-auto my-12">
            {/* Header Bar */}
            <div className='grid grid-cols-1 gap-y-4 max-w-7xl mx-4 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-8 lg:gap-y-16 lg:mx-8'>
                <Dash title="Home" image="/dash/home.png" bgColor='dashWhite' imageWidth={80} link='/' />
                <Dash title="Trades" image="/dash/trades.png" bgColor='dashYellow' imageWidth={80} link='/trades' />
                <Dash title="Achievements" image="/dash/achievements.png" bgColor='dashGreen' imageWidth={80} link='/achievements' />
                <Dash title="Contact" image="/dash/contact.png" bgColor='dashPurple' imageWidth={80} link='/contact' />
            </div>

            <section className='bg-gradient-to-b from-artic-blue to-white'>
                <div id="about" className="max-w-7xl mx-auto pb-16">
                    <div className="flex flex-col items-center justify-center font-dText text-5xl font-bold pb-12">
                        <hr className="h-px w-full my-8 bg-dashWhite border-0 dark:bg-gray-700" />
                        <h1 className="font-headings text-dashWhite">ABOUT</h1>
                        <hr className="h-px w-full my-8 bg-dashWhite border-0 dark:bg-gray-700" />
                    </div>
                    <div className="grid lg:grid-cols-3 gap-4 max-w-6xl mx-auto grid-col-1">
                        <div className="flex items-start justify-center">
                            <Image src="/topjatt/about.png" alt="Profile Picture" className="rounded-[50px]" width={300} height={300} />
                        </div>
                        <div className="flex flex-col gap-4 lg:col-span-2 items-center text-center lg:text-start lg:items-start mx-8 text-white text-lg font-main">
                              {renderContent(aboutContent)}
                            <Link href="/contact" className="bg-dashWhite text-navyBlue mt-8 rounded-full py-5 px-14 hover:bg-opacity-90 transition-opacity duration-300 text-2xl font-medium font-headings w-fit">
                                Get in Touch
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}