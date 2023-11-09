import { NextApiRequest, NextApiResponse } from "next";
import { sql } from "@vercel/postgres";

const webPush = require("web-push");

webPush.setVapidDetails(
  "https://distortion.fm/",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    await postMethod(req, res);
  } else if (req.method === "PUT") {
    await putMethod(req, res);
  } else if (req.method === "DELETE") {
    await deleteMethod(req, res);
  } else if (req.method === "OPTIONS") {
    await optionsMethod(res);
  } else {
    // Method Not Allowed
    res.status(405).end();
  }
}

const postMethod = async (req: NextApiRequest, res: NextApiResponse) => {
  const subscription = {
    endpoint: req.body.subscription.endpoint,
    keys: req.body.subscription.keys
  }

  await webPush.sendNotification(
    subscription,
    JSON.stringify({
      title: "通知設定ON",
      body: "こんな感じで最新エピソードの追加をお知らせするよ。"
    })
  );

  // INSERT
  await sql`
    INSERT INTO subscription(endpoint, keys_p256dh, keys_auth)
    VALUES(${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
  `;

  res.status(201).end();
}

const putMethod = async (req: NextApiRequest, res: NextApiResponse) => {
  const subscription = {
    endpoint: req.body.subscription.endpoint,
    keys: req.body.subscription.keys
  }

  const oldEndpoint = req.body.oldEndpoint;

  if (oldEndpoint) {
    // DELETE
    await sql`
      DELETE FROM subscription
      WHERE endpoint = ${oldEndpoint}
    `;
  }

  // INSERT
  await sql`
    INSERT INTO subscription(endpoint, keys_p256dh, keys_auth)
    VALUES(${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
  `;

  res.status(200).end();
}

const deleteMethod = async (req: NextApiRequest, res: NextApiResponse) => {
  const endpoint = req.body.subscription.endpoint;

  // DELETE
  await sql`
    DELETE FROM subscription
    WHERE endpoint = ${endpoint}
  `;

  res.status(200).end();
}

const optionsMethod = async (res: NextApiResponse) => {
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST,DELETE,OPTIONS").status(200).end();
}

export default handler;