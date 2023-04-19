import calculateStats from '@/utils/calculateStats';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username } = req.query;

  if (!username || username.length === 0) {
    res.status(400).json({ message: 'Username is required' });
    return;
  }

  try {
    const [profileResponse, statsResponse] = await Promise.allSettled([
      fetch(`https://api.chess.com/pub/player/${username}`),
      fetch(`https://api.chess.com/pub/player/${username}/stats`),
    ]);

    const profileError =
      profileResponse.status === 'rejected' || !profileResponse.value.ok;

    const statsError =
      statsResponse.status === 'rejected' || !statsResponse.value.ok;

    if (profileError || statsError) {
      res.status(400).json({ message: 'Error fetching data from the API' });
      return;
    }

    const profile = await profileResponse.value.json();
    const stats = calculateStats(await statsResponse.value.json());

    res.status(200).json({ profile, stats });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
