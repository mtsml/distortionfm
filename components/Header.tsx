import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const registerNotification = () => {
    try {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          // const title = "通知確認";
          // const options = {
          //   body: "通知設定が完了しました。こんな感じで最新エピソードの追加をお知らせするよ。",
          //   // icon: "/favicon.ico"
          // }
          // new Notification(title, options);
        } else {
          alert("permission denied");
        }
      });
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(registration => {
          console.log(registration)
          registration.active?.postMessage("Hello")
        })
      }
    } catch(e) {
      alert(e)
    }
  };

  return (
    <header className="pure-u-1 pure-u-xl-1-4">
      <Link href="/">Distortion.fm</Link>
      <p>
        1995年生まれの男性が友達と雑談をする。
        <FontAwesomeIcon
          className="notification"
          icon={faBell}
          size="xl"
          onClick={registerNotification}
        />
      </p>
    </header>
  );
}

export default Header;