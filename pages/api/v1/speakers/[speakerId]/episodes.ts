import { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";
import { sql } from "@vercel/postgres";
import { achorRssFeedItemsToEpisodes } from "@/util/utility";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    await getMethod(req, res);
  } else if (req.method === "OPTIONS") {
    await optionsMethod(res);
  } else {
    // Method Not Allowed
    res.status(405).end();
  }
}

const getMethod = async (req: NextApiRequest, res: NextApiResponse) => {
  const speakerId = req.query.speakerId as string;

  const parser = new Parser();
  const feed = await parser.parseURL('https://anchor.fm/s/db286500/podcast/rss');

  const episodeIds = (await sql`
    SELECT
      episode_id
    FROM
      episode_speaker_map
    WHERE
      speaker_id = ${speakerId}
  `).rows.map(row => row.episode_id);

  const episodes = achorRssFeedItemsToEpisodes(feed.items).filter(episode => 
    episodeIds.includes(episode.id)
  );

  res.status(200).json({ episodes });
}

const optionsMethod = async (res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Methods", "GET").status(200).end();
}

export default handler;