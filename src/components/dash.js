import Link from "next/link";
import Image from "next/image";

const Dash = ({ title, image, bgColor, imageWidth, link }) => {
    return (
        <Link href={link || '/'} className={`bg-${bgColor} rounded-2xl md:min-h-[120px] p-8 flex flex-row-reverse md:flex-col gap-4 items-center`}>
            <h1 className="text-navyBlue font-numbers text-2xl font-bold mr-auto md:mr-0">{title}</h1>
            <div className=" md:ml-0 flex justify-center">
                {image && (
                    <Image src={image} alt="Edit Profile" className="w-12 md:w-20" width={imageWidth} height={0} />
                )}
            </div>
        </Link>
    )
};

export default Dash;