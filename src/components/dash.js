import Link from "next/link";
import styles from "@/styles/dash.module.css";
import Image from "next/image";

const Dash = ({ title, image, bgColor, imageWidth, link }) => {
    return (
        <Link href={link || '/'} className={`bg-${bgColor} rounded-2xl min-h-[120px] p-8 flex flex-col gap-4`}>
            <h1 className="text-navyBlue font-numbers text-2xl">{title}</h1>
            <div className="ml-auto">
                {image && (
                    <Image src={image} alt="Edit Profile" width={imageWidth} height={0} />
                )}
            </div>
        </Link>
    )
};

export default Dash;