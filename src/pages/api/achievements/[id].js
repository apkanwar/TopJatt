// src/pages/api/achievements/[id].js
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    const id = req.query.id;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: "invalid id" });
    }

    const client = await clientPromise;
    const db = client.db("my_app");
    const col = db.collection("achievements");

    if (req.method === "PUT") {
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user?.role !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, description, logo } = req.body || {};
      const update = { $set: { lastModified: new Date() } };
      if (typeof title === "string") update.$set.title = title.trim();
      if (typeof description === "string") update.$set.description = description.trim();
      if (typeof logo !== "undefined") update.$set.logo = logo || null;

      await col.updateOne({ _id: new ObjectId(id) }, update);
      const doc = await col.findOne({ _id: new ObjectId(id) });
      return res.status(200).json({
        _id: doc._id.toString(),
        title: doc.title || "",
        description: doc.description || "",
        logo: doc.logo || null,
        createdAt: doc.createdAt || null,
        lastModified: doc.lastModified || null,
      });
    }

    if (req.method === "DELETE") {
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user?.role !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await col.deleteOne({ _id: new ObjectId(id) });
      return res.status(204).end();
    }

    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    console.error("/api/achievements/[id] error", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}