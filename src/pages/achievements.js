import Dash from "@/components/dash";
import styles from "@/styles/achievements.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Achievements() {
    const [dataLeft, setDataL] = useState([]);
    const [dataRight, setDataR] = useState([]);

    useEffect(() => {
        fetchProjectOverview();
    }, []);

    const fetchProjectOverview = async () => {
        try {
            const response = await fetch('/api/achievements');
            if (!response.ok) {
                throw new Error('Failed to Fetch Data');
            }
            const { data } = await response.json();
            let dataLeft = [], dataRight = [];
            for (let x = 0; x < data.length; x++) {
                if (data[x].key % 2 != 0) {
                    dataLeft.push(data[x]);
                } else {
                    dataRight.push(data[x]);
                }
            }
            setDataL(dataLeft);
            setDataR(dataRight);
            console.log('Fetched Data!');
        } catch (error) {
            console.error('Error Fetching Data:', error);
        }
    };

    return (
        <div className="flex flex-col gap-12 max-w-7xl mx-auto my-16">
            {/* Header Bar */}
            <div className='grid grid-cols-4 gap-4 gap-y-16 max-w-7xl mx-4 z-50'>
                <Dash title="Home" image="" bgColor='dashGreen' imageWidth={100} link='/' />
                <Dash title="About Me" image="/dash/about.png" bgColor='dashWhite' imageWidth={100} link='/about' />
                <Dash title="Trades" image="/dash/trades.png" bgColor='dashYellow' imageWidth={80} link='/trades' />
                <Dash title="Contact" image="/dash/contact.png" bgColor='dashPurple' imageWidth={70} link='/contact' />
            </div>

            {/* Achievements Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-16">
                <div className="flex flex-col gap-8">
                    {dataLeft.map(({ key, label, desc, logo }) => (
                        <div key={key} value={key} className="bg-navyBlue rounded-xl p-16 grid lg:grid-cols-3 items-center">
                            <Image
                                src={logo}
                                alt={label}
                                width={100}
                                height={100}
                            />
                            <div className="lg:col-span-2">
                                <h2 className="font-headings text-4xl font-semibold text-dashWhite">{label}</h2>
                            </div>
                            <div className="pt-4 text-lg leading-loose text-white font-main lg:col-span-2 lg:col-end-4">
                                {desc}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-8">
                    {dataRight.map(({ key, label, desc, logo }) => (
                        <div key={key} value={key} className="bg-navyBlue rounded-xl p-16 grid lg:grid-cols-3 items-center">
                            <Image
                                src={logo}
                                alt={label}
                                width={100}
                                height={100}
                            />
                            <div className="lg:col-span-2">
                                <h2 className="font-headings text-4xl font-semibold text-dashWhite">{label}</h2>
                            </div>
                            <div className="py-8 text-lg leading-loose text-white font-main lg:col-span-2 lg:col-end-4">
                                {desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}