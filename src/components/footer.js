import Link from "next/link";

export default function Footer() {
    return (
        <div className="py-12 relative w-full">
            <section className=" text-white text-center">
                <p className="font-headings font-semibold">
                    <Link href={'/admin/console'}>&copy;</Link> TopJatt 2025
                </p>
            </section>
        </div>
    )
}