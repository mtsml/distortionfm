import { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";
import { sql } from "@vercel/postgres";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    await getMethod(res);
  } else if (req.method === "OPTIONS") {
    await optionsMethod(res);
  } else {
    // Method Not Allowed
    res.status(405).end();
  }
}

const getMethod = async (res: NextApiResponse) => {
  const parser = new Parser();
  const feed = await parser.parseURL('https://anchor.fm/s/db286500/podcast/rss');

  const { rows } = await sql`
    SELECT
      episode_id,
      speaker_id AS id,
      name,
      encode(icon, 'base64') AS icon
    FROM
      episode_speaker_map esm
      INNER JOIN speaker
        ON speaker.id = esm.speaker_id
        AND esm.speaker_id <> 0
    ORDER BY
      episode_id,
      speaker_id
  `;

  const episodes = feed.items.map(item => {
    const id = getIdFromAnchorRssFeedItem(item);
    const title = item.title;
    const date = item.isoDate;
    const guests = rows.filter(row => row.episode_id === id);

    return {
      id,
      title,
      date,
      guests
    }
  });

  res.status(200).json({ episodes });
}

const optionsMethod = async (res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Methods", "GET").status(200).end();
}

export default handler;