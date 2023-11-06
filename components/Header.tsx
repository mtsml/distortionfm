import Link from "next/link";
import SubscribeIcon from "@/components/SubscribeIcon";

const Header = () => {
  return (
    <header className="pure-u-1 pure-u-xl-1-4">
      <Link href="/">Distortion.fm</Link>
      <p>
        1995年生まれの男性が友達と雑談をする。
        <SubscribeIcon />
      </p>
    </header>
  );
}

export default Header;