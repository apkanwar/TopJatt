import Dash from "@/components/dash";
import { useState } from "react";
import Image from "next/image";

export default function Contact() {
    const [status, setStatus] = useState({ type: null, message: "" });
    const accessKey = "2dafccc5-f903-422b-b03c-36183ca73b39"

    async function handleSubmit(event) {
      event.preventDefault();
      const formEl = event.target;
      const formData = new FormData(formEl);

      // Required fields
      const name = (formData.get("name") || "").toString().trim();
      const email = (formData.get("email") || "").toString().trim();
      const phone = (formData.get("phone-number") || "").toString().trim();
      const message = (formData.get("message") || "").toString().trim();

      // Basic validations
      const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      // Allow +, digits, spaces, parentheses and dashes; require 10-15 digits overall
      const digitsCount = (phone.match(/\d/g) || []).length;
      const phoneCharsOK = /^[+()\d\s-]+$/.test(phone);
      const phoneOK = phoneCharsOK && digitsCount >= 10 && digitsCount <= 15;

      if (!name || !email || !phone || !message) {
        setStatus({ type: "error", message: "Please fill out all fields (Name, Email, Phone, Message)." });
        return;
      }
      if (!emailOK) {
        setStatus({ type: "error", message: "Please enter a valid email address." });
        return;
      }
      if (!phoneOK) {
        setStatus({ type: "error", message: "Please enter a valid phone number (10–15 digits; you can use +, spaces, parentheses, or dashes)." });
        return;
      }

      setStatus({ type: "info", message: "Sending…" });

      formData.append("access_key", accessKey);
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: json,
        });

        const data = await response.json();
        if (data.success) {
          setStatus({ type: "success", message: "Thanks! Your message was sent successfully." });
          formEl.reset();
        } else {
          setStatus({ type: "error", message: data.message || "Something went wrong. Please try again." });
        }
      } catch (err) {
        setStatus({ type: "error", message: "Network error. Please check your connection and try again." });
      }
    }


    return (
        <div className="flex flex-col gap-12 max-w-7xl mx-auto my-16">
            {/* Header Bar */}
            <div className='z-50 grid grid-cols-1 gap-y-4 max-w-7xl mx-4 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-8 lg:gap-y-16 lg:mx-8'>
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
                    <div className="mx-auto mt-8 max-w-6xl sm:mt-12 lg:flex lg:flex-row lg:gap-12 lg:items-stretch">
                      {/* Left: Image (matches form height on desktop via flex items-stretch) */}
                      <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-sm ring-1 ring-gray-200 lg:h-auto lg:w-2/5">
                        <Image
                          src="/topjatt.jpeg"
                          alt="Get in touch"
                          fill
                          priority
                          className="object-cover"
                          sizes="(min-width: 1024px) 40vw, 100vw"
                        />
                      </div>

                      {/* Right: Form */}
                      <form onSubmit={handleSubmit} className="w-full mx-auto max-w-xl lg:max-w-none lg:w-3/5 lg:px-16 lg:mt-0 mt-8">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">Name</label>
                            <div className="mt-2.5">
                              <input type="text" name="name" id="name" required className="block w-full rounded-full border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">Email</label>
                            <div className="mt-2.5">
                              <input type="email" name="email" id="email" required className="block w-full rounded-full border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="phone-number" className="block text-sm font-semibold leading-6 text-gray-900">Phone number</label>
                            <div className="relative mt-2.5">
                              <input type="tel" name="phone-number" id="phone-number" required pattern="[+()\d\s-]+" title="Use 10–15 digits; allowed chars: + ( ) - spaces" className="block w-full rounded-full border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">Message</label>
                            <div className="mt-2.5">
                              <textarea name="message" id="message" rows={4} required className="block w-full rounded-3xl border-0 p-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" defaultValue={''} />
                            </div>
                          </div>
                        </div>

                        {/* Status message */}
                        <div className="mt-8 max-w-xl mx-auto" aria-live="polite">
                          {status.type && (
                            <div
                              className={
                                `rounded-xl px-4 py-3 text-sm font-medium ` +
                                (status.type === 'success' ? 'bg-green-100 text-green-800 ring-1 ring-green-300' : '') +
                                (status.type === 'error' ? 'bg-red-100 text-red-800 ring-1 ring-red-300' : '') +
                                (status.type === 'info' ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300' : '')
                              }
                            >
                              {status.message}
                            </div>
                          )}
                        </div>

                        {/* Submit button */}
                        <div className="mt-6 items-center flex justify-center">
                          <button type="submit" className="bg-dashPurple text-navyBlue rounded-full py-2.5 px-8 hover:bg-opacity-80 transition-opacity duration-300 text-lg font-medium font-headings w-fit">
                            Send
                          </button>
                        </div>
                      </form>
                    </div>
                </div>
            </div>
        </div>
    );
}