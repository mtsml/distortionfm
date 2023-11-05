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

/**
 * 日時を表す文字列をyyyy/MM/ddに変換する
 */
export const toSimpleDateFormat = (dateString: string | undefined): string | undefined => {
  return dateString && (new Date(dateString)).toLocaleDateString('ja-JP');
}


// This function is needed because Chrome doesn't accept a base64 encoded string
// as value for applicationServerKey in pushManager.subscribe yet
// https://bugs.chromium.org/p/chromium/issues/detail?id=802280
export const urlBase64ToUint8Array = (base64String: string) => {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}