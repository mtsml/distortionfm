import { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

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
  const { rows } = await sql`
    SELECT
      id,
      name,
      encode(icon, 'base64') AS icon,
      description
    FROM
      speaker
    ORDER BY
      id
  `;

  res.status(200).json({ speakers: rows });
}

const optionsMethod = async (res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Methods", "GET").status(200).end();
}

export default handler;