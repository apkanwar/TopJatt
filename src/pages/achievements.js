// src/pages/achievements.js
import AchievementsList from "@/components/acheivementsList";
import Dash from "@/components/dash";
import clientPromise from "@/lib/mongodb";

export default function Achievements({ items = [] }) {
  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto my-16">
      {/* Header Bar */}
      <div className="grid grid-cols-4 gap-4 gap-y-16 max-w-7xl mx-4 z-50">
        <Dash title="Home" image="" bgColor="dashGreen" imageWidth={100} link="/" />
        <Dash title="About Me" image="/dash/about.png" bgColor="dashWhite" imageWidth={100} link="/about" />
        <Dash title="Trades" image="/dash/trades.png" bgColor="dashYellow" imageWidth={80} link="/trades" />
        <Dash title="Contact" image="/dash/contact.png" bgColor="dashPurple" imageWidth={70} link="/contact" />
      </div>

      <AchievementsList items={items} />
    </div>
  );
}

export async function getServerSideProps() {
  try {
    // If the env isn't set at runtime (e.g., during docker build), avoid throwing
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI is not set; returning empty achievements.");
      return { props: { items: [] } };
    }

    const client = await clientPromise;
    const db = client.db("my_app");

    const docs = await db
      .collection("achievements")
      .find({})
      .sort({ _id: -1 })
      .limit(200)
      .toArray();

    const items = docs.map((d) => ({
      id: d._id.toString(),
      title: d.title || "",
      description: d.description || "",
      logo: d.logo || null,
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : null,
      lastModified: d.lastModified ? new Date(d.lastModified).toISOString() : null,
    }));

    return { props: { items } };
  } catch (e) {
    console.error("SSR achievements error:", e);
    return { props: { items: [] } };
  }
}