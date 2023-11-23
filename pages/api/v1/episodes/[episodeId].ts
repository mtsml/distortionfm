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
  const episodeId = req.query.episodeId as string;

  // episode info from RSS
  const parser = new Parser({
    customFields: {
      item: ["enclosure"]
    }
  });
  const feed = await parser.parseURL('https://anchor.fm/s/db286500/podcast/rss');
  const episodes = achorRssFeedItemsToEpisodes(feed.items);
  const episode = episodes.find(item => item.link?.includes(episodeId));
  if (!episode) {
    // Not Found
    res.status(200).json({ episode: {} });
    return;
  }
  const { title , date, content, enclosure } = episode;

  // transcript info from DB
  const transcripts = (await sql`
    SELECT
      transcript,
      start_ms AS "startMs",
      end_ms AS "endMs"
    FROM
      vtt
    WHERE
      id = ${episodeId}
    ORDER BY
      start_ms
  `).rows;

  // episode info from DB
  const guests = (await sql`
    SELECT
      speaker.id,
      name,
      encode(icon, 'base64') AS icon
    FROM
      episode_speaker_map esm
      INNER JOIN speaker
        ON speaker.id = esm.speaker_id
    WHERE
      episode_id = ${episodeId}
      AND speaker_id <> 0
  `).rows;

  res.status(200).json({
    episode: {
      id: episodeId,
      title,
      date,
      guests,
      enclosure,
      description: content,
      transcripts: transcripts || []
    }
  });
}

const optionsMethod = async (res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Methods", "GET").status(200).end();
}

export default handler;