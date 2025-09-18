import Image from "next/image";
import Dash from "@/components/dash";
import styles from "@/styles/home.module.css";
import Footer from "@/components/footer";

export default function Home() {
  const circleDiameter = 400;
  const circleRadius = circleDiameter / 2;
  const tileSize = 200;
  const imageWidth = 80;
  const orbitGap = 32;
  const orbitRadius = circleRadius + orbitGap + tileSize / 2;
  const center = circleRadius;
  const angles = [170, 120, 60, 10];

  const dashes = [
    { title: "About Me", image: "/dash/about.png", bgColor: "dashWhite", link: "/about" },
    { title: "Trades", image: "/dash/trades.png", bgColor: "dashYellow", link: "/trades" },
    { title: "Achievements", image: "/dash/achievements.png", bgColor: "dashGreen", link: "/achievements" },
    { title: "Contact", image: "/dash/contact.png", bgColor: "dashPurple", link: "/contact" },
  ];

  const toXY = (angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    const x = center + orbitRadius * Math.cos(rad);
    const y = center - orbitRadius * Math.sin(rad); // minus because screen Y grows downward
    return { left: x, top: y };
  };

  return (
    <>
      {/* Mobile/Tablet: OLD DESIGN */}
      <div className="lg:hidden flex flex-col gap-12 max-w-7xl mx-auto mt-16">
        {/* Header Bar */}
        <div className='grid grid-cols-1 gap-y-4 max-w-7xl mx-4 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-8 lg:gap-y-16 lg:mx-8'>
          <Dash title="About Me" image="/dash/about.png" bgColor='dashWhite' imageWidth={80} link='/about' />
          <Dash title="Trades" image="/dash/trades.png" bgColor='dashYellow' imageWidth={80} link='/trades' />
          <Dash title="Achievements" image="/dash/achievements.png" bgColor='dashGreen' imageWidth={80} link='/achievements' />
          <Dash title="Contact" image="/dash/contact.png" bgColor='dashPurple' imageWidth={80} link='/contact' />
        </div>

        {/* Main Image */}
        <div className={`${styles.container}`}>
          <Image src="/topjatt.jpeg" alt="About Picture" className={`${styles.profilePicture}`} width={500} height={500} priority />
        </div>

        <Footer pos='relative' />
      </div>

      {/* Desktop: ORBIT LAYOUT */}
      <div className="h-screen flex-col hidden lg:flex">
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="relative" style={{ width: circleDiameter, height: circleDiameter }}>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-lg border-white border-4" style={{ width: 350, height: 350 }}>
              <Image src="/topjatt/home.png" alt="Home Picture" width={350} height={350} priority />
            </div>

            {/* Optional: show the circle perimeter for reference */}
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ outline: "2px dashed rgba(255,255,255,0.2)", outlineOffset: 0 }} />

            {/* Dash tiles orbiting OUTSIDE the circle */}
            {dashes.slice(0, angles.length).map((dash, i) => {
              const pos = toXY(angles[i]);
              return (
                <div
                  key={dash.title + i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: pos.left, top: pos.top, width: tileSize, height: tileSize }}
                >
                  <Dash
                    title={dash.title}
                    image={dash.image}
                    bgColor={dash.bgColor}
                    link={dash.link}
                    imageWidth={imageWidth}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <Footer pos='absolute' />
      </div>
    </>
  );
}