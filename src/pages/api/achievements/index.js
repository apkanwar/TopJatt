// src/pages/api/achievements/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import clientPromise from "@/lib/mongodb";

function parseIntSafe(v, d) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : d;
}

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("my_app");
    const col = db.collection("achievements");

    if (req.method === "GET") {
      const q = (req.query.q || "").toString().trim();
      const page = parseIntSafe(req.query.page, 1);
      const pageSize = Math.min(parseIntSafe(req.query.pageSize, 20), 200);
      const filter = q ? { title: { $regex: q, $options: "i" } } : {};

      const total = await col.countDocuments(filter);
      const docs = await col
        .find(filter)
        .sort({ _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

      return res.status(200).json({
        total,
        items: docs.map((d) => ({
          _id: d._id.toString(),
          title: d.title || "",
          description: d.description || "",
          logo: d.logo || null,
          createdAt: d.createdAt || null,
          lastModified: d.lastModified || null,
        })),
      });
    }

    if (req.method === "POST") {
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user?.role !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, description, logo } = req.body || {};
      if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "title is required" });
      }
      const now = new Date();
      const doc = {
        title: title.trim(),
        description: (description || "").trim(),
        logo: logo || null,
        createdAt: now,
        lastModified: now,
      };
      const result = await col.insertOne(doc);
      return res.status(201).json({ _id: result.insertedId.toString(), ...doc });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    console.error("/api/achievements error", e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}