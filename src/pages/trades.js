import Dash from "@/components/dash";
import CarouselWithSideContent from "@/components/carouselWithContent";
import clientPromise from "@/lib/mongodb";

function serializeTrade(doc) {
  return {
    _id: doc._id?.toString?.() || null,
    symbol: doc.symbol || "",
    name: doc.name || "",
    buyPrice: typeof doc.buyPrice === "number" ? doc.buyPrice : (doc.buyPrice ? Number(doc.buyPrice) : null),
    sellPrice: doc.sellPrice == null ? null : (typeof doc.sellPrice === "number" ? doc.sellPrice : Number(doc.sellPrice)),
    shares: doc.shares == null ? null : Number(doc.shares),
    boughtAt: doc.boughtAt ? new Date(doc.boughtAt).toISOString() : null,
    soldAt: doc.soldAt ? new Date(doc.soldAt).toISOString() : null,
  };
}

export default function Trades({ trades = [] }) {
  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto my-16">
      <div className="grid grid-cols-4 gap-4 gap-y-16 max-w-7xl mx-4 z-50">
        <Dash title="Home" image="/dash/home.png" bgColor="dashYellow" imageWidth={80} link="/" />
        <Dash title="About Me" image="/dash/about.png" bgColor="dashWhite" imageWidth={80} link="/about" />
        <Dash title="Achievements" image="/dash/achievements.png" bgColor="dashGreen" imageWidth={80} link="/achievements" />
        <Dash title="Contact" image="/dash/contact.png" bgColor="dashPurple" imageWidth={80} link="/contact" />
      </div>

      <CarouselWithSideContent data={trades} />
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("my_app");
    const docs = await db.collection("trades").find({}).sort({ createdAt: -1 }).limit(10).toArray();
    const trades = docs.map(serializeTrade);
    return { props: { trades } };
  } catch (e) {
    console.error("/trades getServerSideProps error", e);
    return { props: { trades: [] } };
  }
}