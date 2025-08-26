import Link from "next/link";
import Image from "next/image";

const Dash = ({ title, image, bgColor, imageWidth, link }) => {
    return (
        <Link href={link || '/'} className={`bg-${bgColor} rounded-2xl min-h-[120px] p-8 flex flex-col gap-4 text-center`}>
            <h1 className="text-navyBlue font-numbers text-2xl font-bold">{title}</h1>
            <div className="flex justify-center">
                {image && (
                    <Image src={image} alt="Edit Profile" width={imageWidth} height={0} />
                )}
            </div>
        </Link>
    )
};

export default Dash;