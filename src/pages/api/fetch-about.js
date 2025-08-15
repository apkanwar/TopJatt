// src/pages/api/fetch-about.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

async function getCollection() {
  const client = await clientPromise;
  const db = client.db("my_app");
  return db.collection("static-elements"); // adjust if your collection name differs
}

export default async function handler(req, res) {
  try {
    const col = await getCollection();

    if (req.method === "GET") {
      let doc =
        (await col.findOne({ _id: "aboutText" })) ||
        (await col.findOne({ _id: "about" })) ||
        (await col.findOne({ key: "about" })) ||
        (await col.findOne({ name: "about" }));
      const content = (doc && (doc.content ?? doc.text ?? doc.about ?? "")) || "";
      return res.status(200).json({ content, doc: doc || null });
    }

    if (req.method === "PUT") {
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user?.role !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { content } = req.body || {};
      if (typeof content !== "string") {
        return res.status(400).json({ error: "content (string) is required" });
      }

      const now = new Date();
      const result = await col.updateOne(
        { _id: "aboutText" },
        { $set: { content, about: content, lastModified: now } },
        { upsert: true }
      );

      return res.status(200).json({ ok: true, upsertedId: result.upsertedId ?? null });
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    console.error("fetch-about error", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}