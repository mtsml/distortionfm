import { useEffect, useState } from "react";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import {
  getCurrentSubscriptionOrThrowError,
  getNotificationPermissionOrThrowError,
  subscribeWebPushOrThrowError
} from "@/util/utility";

const SubscribeIcon = () => {
  const [notificationIsGranted, setNotificationIsGranted] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [shakeIcon, setShakeIcon] = useState(false);

  useEffect(() => {
    (async() => {
      try {
        setNotificationIsGranted(Notification.permission === "granted");
        setSubscribing(!!(await getCurrentSubscriptionOrThrowError()));
      } catch(error) {
        // マウント時はエラーメッセージを表示しない
      }
    })();
  }, []);

  /**
   * プッシュ通知を購読する
   */
  const subscribeNotifications = async () => {
    try {
      // ユーザーから通知許可を得る
      const permission = await getNotificationPermissionOrThrowError();
      setNotificationIsGranted(permission === "granted");

      if (permission === "granted") {
        // プッシュ通知をSubscribe
        const subscription = await subscribeWebPushOrThrowError();
        setSubscribing(true);

        // アイコンを揺らす
        setShakeIcon(true)

        // APIにSubscribe情報を渡してDBへ保存する
        await fetch("/api/subscription", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({ subscription })
        });
      }
    } catch (error) {
      alert(error);
    }
  };

  /**
   * プッシュ通知の購読を解除する
   */
  const unsubscribeNotifications = async () => {
    // TODO: 独自のconfirmを実装して分かりやすいメッセージとボタンに差し替える
    if (!confirm("通知を解除します。OK？")) return;

    try {
      const subscription = await getCurrentSubscriptionOrThrowError(); 
      setSubscribing(false);
      if (subscription) {
        // Subscribeを解除してDBから情報を削除する
        await Promise.all([
          subscription.unsubscribe(),
          fetch("/api/subscription", {
            method: "DELETE",
            headers: {
              "Content-type": "application/json"
            },
            body: JSON.stringify({ subscription })
          })
        ]);
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <FontAwesomeIcon
      className={clsx("subscribe-icon", {
        enabled: notificationIsGranted && subscribing,
        shake: shakeIcon
      })}
      icon={faBell}
      size="xl"
      onClick={notificationIsGranted && subscribing
        ? unsubscribeNotifications
        : subscribeNotifications
      }
    />
  );
}

export default SubscribeIcon;