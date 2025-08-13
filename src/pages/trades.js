import Dash from "@/components/dash";
import CarouselWithSideContent from "@/components/carouselWithContent";

export default function Trades() {

    return (
        <div className="flex flex-col gap-12 max-w-7xl mx-auto my-16">
            {/* Header Bar */}
            <div className='grid grid-cols-4 gap-4 gap-y-16 max-w-7xl mx-4 z-50'>
                <Dash title="Home" image="" bgColor='dashYellow' imageWidth={100} link='/' />
                <Dash title="About Me" image="/dash/about.png" bgColor='dashWhite' imageWidth={100} link='/about' />
                <Dash title="Achievements" image="/dash/achievements.png" bgColor='dashGreen' imageWidth={100} link='/achievements' />
                <Dash title="Contact" image="/dash/contact.png" bgColor='dashPurple' imageWidth={70} link='/contact' />
            </div>

            <CarouselWithSideContent />
        </div>
    );
}