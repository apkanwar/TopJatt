import Dash from "@/components/dash";
import { useState } from "react";

export default function Contact() {
    const [result, setResult] = useState("");
    const accessKey = "2dafccc5-f903-422b-b03c-36183ca73b39"

    async function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        formData.append("access_key", accessKey);

        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: json
        });
        const result = await response.json();
        if (data.success) {
            setResult("Form Submitted Successfully");
            event.target.reset();
        } else {
            console.log("Error", data);
            setResult(data.message);
        }
    }


    return (
        <div className="flex flex-col gap-12 max-w-7xl mx-auto my-16">
            {/* Header Bar */}
            <div className='grid grid-cols-4 gap-4 gap-y-16 max-w-7xl mx-4 z-50'>
                <Dash title="Home" image="/dash/home.png" bgColor='dashPurple' imageWidth={80} link='/' />
                <Dash title="About Me" image="/dash/about.png" bgColor='dashWhite' imageWidth={80} link='/about' />
                <Dash title="Trades" image="/dash/trades.png" bgColor='dashYellow' imageWidth={80} link='/trades' />
                <Dash title="Achievements" image="/dash/achievements.png" bgColor='dashGreen' imageWidth={80} link='/achievements' />
            </div>

            {/* Contact Section */}
            <div id="contact" className="isolate bg-gradient-to-b to-white px-6 lg:px-8 relative">
                <div className="max-w-7xl mx-auto py-6">
                    <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]" aria-hidden="true">
                        <div className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
                            style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center font-dText text-5xl font-bold">
                        <hr className="h-px w-full my-8 bg-gray-300 border-0 dark:bg-gray-700" />
                        <h1 className="text-dashWhite">CONTACT</h1>
                        <hr className="h-px w-full my-8 bg-gray-300 border-0 dark:bg-gray-700" />
                    </div>
                    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl sm:mt-12">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">
                                    Name
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                                    Email
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="phone-number" className="block text-sm font-semibold leading-6 text-gray-900">
                                    Phone number
                                </label>
                                <div className="relative mt-2.5">
                                    <input
                                        type="tel"
                                        name="phone-number"
                                        id="phone-number"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                                    Message
                                </label>
                                <div className="mt-2.5">
                                    <textarea
                                        name="message"
                                        id="message"
                                        rows={4}
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        defaultValue={''}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-10">
                            <button type="submit" className="bg-dashPurple text-navyBlue rounded-full py-2.5 px-8 hover:bg-opacity-80 transition-opacity duration-300 text-lg font-medium font-headings w-fit">
                                Send
                            </button>
                        </div>
                    </form>

                    <div className="mx-auto mt-4 max-w-xl sm:mt-6">
                        {result}
                    </div>
                </div>
            </div>
        </div>
    );
}