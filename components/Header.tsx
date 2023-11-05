import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { urlBase64ToUint8Array } from "@/util/utility";

const Header = () => {

  /**
   * ユーザーに許可を求めてPush通知をSubscribe
   */
  const subscribeNotifications = async () => {
    try {
      // ユーザーからPush通知の許可を得る
      const permission = await Notification.requestPermission();

      if (permission === "denied") {
        alert("通知設定が拒否されています。ブラウザの設定からがんばって拒否を解除してください。");
      }

      if (permission === "granted" && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY !== undefined) {
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
        })
      }
    } catch(e) {
      console.log("error", e);
      alert("深刻なエラーが発生しました。。。\nFaild to subscribe Notifications");
    }
  };

  return (
    <header className="pure-u-1 pure-u-xl-1-4">
      <Link href="/">Distortion.fm</Link>
      <p>
        1995年生まれの男性が友達と雑談をする。
        <FontAwesomeIcon
          className="subscribe-icon"
          icon={faBell}
          size="xl"
          onClick={subscribeNotifications}
        />
      </p>
    </header>
  );
}

export default Header;