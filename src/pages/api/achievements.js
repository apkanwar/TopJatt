// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
    const data = [
        {
            key: 1,
            label: "BioComputing Circuit Designer",
            desc: "The BioComputing Circuit Designer allows for users to model currently existing biocomputing networks online. This is a drag and drop tool desined in Django/Python using the P5JS design library.",
            logo: "/favicon.ico"
        },
        {
            key: 2,
            label: "My Next Modules",
            desc: "This is a library of NextJS components that I've created over the years in JS which I and others can use to create modern websites.",
            logo: "/favicon.ico"
        },
        {
            key: 3,
            label: "X-Labs",
            desc: "X-Labs is a cross platform Web and Android application that allows the users to search and connect to Bluetooth Low Engery Devices and interact with them.",
            logo: "/favicon.ico"
        },
        {
            key: 4,
            label: "FinSimpl",
            desc: "FinSimpl is a service that allows users to allows contractors to interact with their clients help them find the perfect lender for their next contracting needs.",
            logo: "/favicon.ico"
        }
    ]


    res.status(200).json({ data })
}