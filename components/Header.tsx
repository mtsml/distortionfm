import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { urlBase64ToUint8Array } from "@/util/utility";

const Header = () => {
  const [notificationIsGranted, setNotificationIsGranted] = useState(false);
  const [subscribingNotifications, setSubscribingNotifications] = useState(false);

  useEffect(() => {
    setNotificationIsGranted(Notification.permission === "granted");

    (async() => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscribingNotifications(!!subscription);
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

        setSubscribingNotifications(true);
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

    setSubscribingNotifications(false);
  };

  return (
    <header className="pure-u-1 pure-u-xl-1-4">
      <Link href="/">Distortion.fm</Link>
      <p>
        1995年生まれの男性が友達と雑談をする。
        <FontAwesomeIcon
          className={clsx("subscribe-icon", { enabled: notificationIsGranted && subscribingNotifications })}
          icon={faBell}
          size="xl"
          onClick={notificationIsGranted && subscribingNotifications
            ? unsubscribeNotifications
            : subscribeNotifications
          }
        />
      </p>
    </header>
  );
}

export default Header;