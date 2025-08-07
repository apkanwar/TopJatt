import Dash from "@/components/dash";
import { Carousel, IconButton } from "@material-tailwind/react";
import { Progress, Typography } from "@material-tailwind/react";
import styles from '@/styles/trades.module.css'
import Image from 'next/image'
import CarouselWithSideContent from "@/components/carouselWithContent";

export default function Trades() {
    const propertyData = {
        "id": 'x1-y1-z1',
        "allias": "/properties/wellandVale/mini.png",
        "name": "Welland Vale Project",
        "description": "Welland Vale is a 3 home luxury development project currently being managed by heartwood.",
        "address": "St. Catharines, ON",
        "type": "Lending",
        "phase": "Pre-Construction",
        "purchasePrice": 600000,
        "projectTerm": 5,
        "estimatedROI": 38.21,
        "closingDate": "2023-04-25",
        "images": [
            "wellandVale/wellandVale.jpeg",
            "wellandVale/wellandValeConcept.jpeg"
        ],
        "investmentNeeded": "200000",
        "investmentGained": "25000",
        "details": [
            {
                label: "Overiew",
                value: "overview",
                desc: `It really matters and then like it really doesn't matter.
        What matters is the people who are sparked by it. And the people 
        who are like offended by it, it doesn't matter.`,
            },
            {
                label: "Finacials",
                value: "finaicals",
                desc: `Because it's about motivating the doers. Because I'm here
        to follow my dreams and inspire other people to follow their dreams, too.`,
            },
            {
                label: "Market Analysis",
                value: "marketAnalysis",
                desc: `We're not always in the position that we want to be at.
        We're constantly growing. We're constantly making mistakes. We're
        constantly trying to express ourselves and actualize our dreams.`,
            },
            {
                label: "Updates",
                value: "Updates",
                desc: `Because it's about motivating the doers. Because I'm here
        to follow my dreams and inspire other people to follow their dreams, too.`,
            }
        ],


        "detailedDescription": "Participate in the ownership of a newly constructed 2-unit multifamily homes in St. Catharines, ON. \n\n Participate in the ownership of a newly constructed 2-unit multifamily homes in St. Catharines, ON. Participate in the ownership of a newly constructed 2-unit multifamily homes in St. Catharines, ON. Participate in the ownership of a newly constructed 2-unit multifamily homes in St. Catharines, ON.",
        "realizedMOIC": 2.0,
        "realizedIRR": 66,
        "projectTimeline": 2.1,
        "projectROIC": 139,
        "highlights": [
            "Features 3 residential units comprising of one bedroom studio houses.",
            "Sought-after building in a popular location suggests consistent occupancy.",
            "Constructed in 2020. Constructed by 76 Contruction Management",
            "Aimed to be built for the modern small homes sought out for new home owners",
            "Plaster on lathe, inlaid oak flooring, cast iron tubs and wood panel doors were all installed.",
            "Built with both stone and wood to have a unique design for these properties"
        ],
        "locationScore": {
            "transit": 80,
            "walking": 85,
            "biking": 94
        },
        "investmentType": {
            "type": "Core",
            "detailedDescription": "Participate in the ownership of a newly constructed plaza in Simcoe, ON. \n\n Participate in the ownership of a newly constructed plaza in Simcoe, ON. Participate in the ownership of a newly constructed plaza in Simcoe, ON. Participate in the ownership of a newly constructed plaza in Simcoe, ON. Participate in the ownership of a newly constructed plaza in Simcoe, ON.",
            "target": "For investors looking to generate stable income with very low risk."
        }
    }

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