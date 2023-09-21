import Parser from "rss-parser";

export const getIdFromAnchorRssFeedItem = (item: Parser.Item): string => {
  let id = "";
  // 正規表現でURL内のIDを取得
  if (item.link) {
    const res = item.link.match(/episodes.*/g);
    id = res ? res[0].replace("episodes/", "") : "";
  }
  return id;
}