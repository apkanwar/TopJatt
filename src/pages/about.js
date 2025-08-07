import Dash from "@/components/dash";
import Image from "next/image";
import Link from "next/link";

export default function About() {
    return (
        <div className="flex flex-col gap-12 max-w-7xl mx-auto my-12">
            {/* Header Bar */}
            <div className='grid grid-cols-4 gap-4 gap-y-16 max-w-7xl mx-4 z-50'>
                <Dash title="Home" image="" bgColor='dashWhite' imageWidth={100} link='/' />
                <Dash title="Trades" image="/dash/trades.png" bgColor='dashYellow' imageWidth={80} link='/trades' />
                <Dash title="Achievements" image="/dash/achievements.png" bgColor='dashGreen' imageWidth={100} link='/achievements' />
                <Dash title="Contact" image="/dash/contact.png" bgColor='dashPurple' imageWidth={70} link='/contact' />
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
                            <Image src="/topjatt.jpeg" alt="Profile Picture" className="rounded-full" width={300} height={300} />
                        </div>
                        <div className="flex flex-col gap-4 lg:col-span-2 items-center text-center lg:text-start lg:items-start mx-8 text-white py-8">
                            <p className="text-lg font-main">
                                Whether you're purchasing your first home or your next, choosing the right mortgage is a crucial decision. I am dedicated to helping you find the financing that best fits your needs and making your mortgage experience as simple as possible. Let's set up an appointment at a time and place that's convenient for you, and get started.
                            </p>
                            <p className="text-lg font-main">
                                With access to competitive borrowing solutions, I can help you understand your options and find the right solution tailored to your unique needs.
                            </p>
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