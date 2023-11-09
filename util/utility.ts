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

const MESSAGE_NOT_SUPPORT_WEB_PUSH = "このブラウザでは通知機能が利用できません。";
const MESSAGE_DENIED_NOTIFICATIONS = [
  "通知設定が拒否されています。",
  "ブラウザの設定からがんばって拒否を解除してください。"
].join("\n");
const MESSAGE_NOT_SUPPORT_NOTIFICATIONS = [
  MESSAGE_NOT_SUPPORT_WEB_PUSH,
  "",
  "iPhoneまたはiPadは次の手順で通知機能を利用できます。",
  "",
  "1. このサイトをSafariを開く",
  "2. 共有ボタンをクリック",
  "3. 「ホーム画面に追加」をクリック",
  "4. ホーム画面に追加されたアプリを開く",
  "5. アプリ上で通知ボタンをクリック"
].join("\n");
const MESSAGE_VAPID_PUBLIC_KEY_IS_NOT_FOUND = "VAPID_PUBLIC_KEY is not found.";

/**
 * ユーザーに通知許可をリクエストする
 * 通知が利用できない場合に例外を投げる
 */
export const getNotificationPermissionOrThrowError = async (): Promise<NotificationPermission> => {
  let permission: NotificationPermission;

  try {
    permission = await Notification.requestPermission();
  } catch {
    throw new Error(MESSAGE_NOT_SUPPORT_NOTIFICATIONS);
  }

  if (permission === "denied") {
    throw new Error(MESSAGE_DENIED_NOTIFICATIONS);
  }

  return permission;
}

/**
 * Service Workerを登録する
 * Service Workerが利用できない場合は例外を投げる
 */
export const regsterServiceWorkerOrThowError = (): void => {
  try {
    navigator.serviceWorker.register("/service-worker.js");
  } catch {
    throw new Error(MESSAGE_NOT_SUPPORT_NOTIFICATIONS);
  }
}

/**
 * 現在のPushSubscriptionを取得する
 * WebPushが利用できない場合は例外を投げる
 */
export const getCurrentSubscriptionOrThrowError = async (): Promise<PushSubscription | null> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch {
    throw new Error(MESSAGE_NOT_SUPPORT_WEB_PUSH);
  }
}

/**
 * PushSubscriptionを購読する
 * WebPushが利用できない場合は例外を投げる
 */
export const subscribeWebPushOrThrowError = async (): Promise<PushSubscription> => {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error(MESSAGE_VAPID_PUBLIC_KEY_IS_NOT_FOUND);
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    return subscription;
  } catch {
    throw new Error(MESSAGE_NOT_SUPPORT_WEB_PUSH);
  }
}

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);

  const outputArray = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}