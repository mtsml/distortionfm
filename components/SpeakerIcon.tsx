import Link from "next/link";

interface SpeakrIconProp {
  icon: string;
  color: string;
  id: number;
}

const SpeakrIcon = ({ icon, color, id }: SpeakrIconProp) => {
  return (
    <Link
      className="speaker pure-menu-link"
      href={`/speaker/${encodeURIComponent(id)}`}
    >
      <img
        className="speaker-icon"
        style={{ borderColor: color }}
        src={`data:image/png;base64,${icon}`}
      />
    </Link>
  );
}

export default SpeakrIcon;