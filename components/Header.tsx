import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  return (
    <header className="pure-u-1 pure-u-xl-1-4">
      <Link href="/">Distortion.fm</Link>
      <p>
        1995年生まれの男性が友達と雑談をする。
        <FontAwesomeIcon
          className="notification"
          icon={faBell}
          size="xl"
          onClick={() => alert("navigation")}
        />
      </p>
    </header>
  );
}

export default Header;