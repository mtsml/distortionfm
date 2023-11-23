import { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

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

  const { rows } = await sql`
    SELECT id, name, encode(icon, 'base64') as icon, description
    FROM speaker
    WHERE id = ${speakerId}
  `;

  if (rows.length === 0) {
    // Not Found
    res.status(404).json({ speaker: {} });
    return;
  }
  res.status(200).json({ speaker: rows[0] });
}

const optionsMethod = async (res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Methods", "GET").status(200).end();
}

export default handler;