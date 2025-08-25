import Link from "next/link";

export default function Footer() {
    return (
        <div className="pb-28 pt-12 relative w-full">
            <section className=" text-white text-center">
                <p className="font-headings text-2xl font-semibold">
                    <Link href={'/admin/console'}>&copy;</Link> <Link href={'https://www.rezpoint.xyz'} className='hover:underline hover:underline-offset-4'>2025 RezPoint Inc.</Link>
                </p>
            </section>
        </div>
    )
}