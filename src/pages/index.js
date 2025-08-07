import Image from "next/image";
import styles from "@/styles/home.module.css";
import Dash from "@/components/dash";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto my-16">
      {/* Header Bar */}
      <div className='grid grid-cols-4 gap-4 gap-y-16 max-w-7xl mx-4'>
        <Dash title="About Me" image="/dash/about.png" bgColor='dashWhite' imageWidth={100} link='/about' />
        <Dash title="Trades" image="/dash/trades.png" bgColor='dashYellow' imageWidth={80} link='/trades' />
        <Dash title="Achievements" image="/dash/achievements.png" bgColor='dashGreen' imageWidth={100} link='/achievements' />
        <Dash title="Contact" image="/dash/contact.png" bgColor='dashPurple' imageWidth={70} link='/contact' />
      </div>

      {/* Main Image */}
      <div className={`${styles.container}`}>
        <Image src="/topjatt.jpeg" alt="About Picture" className={`${styles.profilePicture}`} width={500} height={500} priority />
      </div>
    </div>
  );
}