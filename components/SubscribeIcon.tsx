import { useEffect, useState } from "react";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { urlBase64ToUint8Array } from "@/util/utility";

const SubscribeIcon = () => {
  const [notificationIsGranted, setNotificationIsGranted] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [shakeIcon, setShakeIcon] = useState(false);

  useEffect(() => {
    setNotificationIsGranted(Notification.permission === "granted");

    (async() => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscribing(!!subscription);
    })();
  }, []);

  /**
   * ユーザーに許可を求めてPush通知をSubscribe
   */
  const subscribeNotifications = async () => {
    try {
      // ユーザーからPush通知の許可を得る
      const permission = await Notification.requestPermission();
      setNotificationIsGranted(permission === "granted");

      if (permission === "denied") {
        alert("通知設定が拒否されています。ブラウザの設定からがんばって拒否を解除してください。");
      }

      if (permission === "granted") {
        if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY === undefined) {
          throw new Error("VAPID_PUBLIC_KEY is not found.");
        }

        // Push通知をSubscribe
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
        });

        // APIにSubscribe情報を渡してDBへ保存する
        await fetch("/api/subscription", {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({ subscription })
        });

        setSubscribing(true);

        // アイコンを揺らしてスマホのバイブレーションを鳴らす
        setShakeIcon(true)
        navigator.vibrate(200);
      }
    } catch(e) {
      console.log("error", e);
      alert("深刻なエラーが発生しました。。。\nFaild to subscribe Notifications");
    }
  };

  /**
   * Push通知を解除
   */
  const unsubscribeNotifications = async () => {
    // TODO: 独自のconfirmを実装して分かりやすいメッセージとボタンに差し替える
    if (!confirm("通知を解除します。OK？")) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
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

    setSubscribing(false);
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