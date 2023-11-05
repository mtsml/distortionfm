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
    await post(req, res);
  } else {
    // Method Not Allowed
    res.status(405).end();
  }
}

const post = async (req: NextApiRequest, res: NextApiResponse) => {
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

  // DB登録

  res.status(201).end();
}

export default handler;