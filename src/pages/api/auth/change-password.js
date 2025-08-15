

import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user?.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const client = await clientPromise;
    const db = client.db('my_app');
    const users = db.collection('users');

    const username = session.user?.username;
    if (!username) return res.status(400).json({ error: 'Invalid session' });

    const user = await users.findOne({ username: username.toLowerCase(), role: 'admin' });
    if (!user) return res.status(404).json({ error: 'Admin not found' });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash || '');
    if (!ok) return res.status(400).json({ error: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await users.updateOne(
      { _id: user._id },
      { $set: { passwordHash, updatedAt: new Date() } }
    );

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('change-password error', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}