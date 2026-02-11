import Link from "next/link";

interface SpeakrIconProps {
  id: number;
  icon: string;
  name?: string;
}

const SpeakrIcon = ({ id, icon, name }: SpeakrIconProps) => {
  return (
    <Link
      className="speaker pure-menu-link"
      href={`/speaker/${encodeURIComponent(id)}`}
    >
      {name &&
        <span>
          {name}
        </span>
      }
      <img
        className="speaker-icon"
        src={`data:image/png;base64,${icon}`}
      />
    </Link>
  );
}

export default SpeakrIcon;