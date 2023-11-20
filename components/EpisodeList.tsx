import Link from "next/link";
import SpeakerIcon from "@/components/SpeakerIcon";

interface Speaker {
  id: number;
  name: string;
  icon: string;
}

interface Episode {
  id: string;
  title: string;
  isoDate: string;
  guests?: Speaker[];
}

interface EpisodeListProps {
  episodes: Episode[];
}

const EpisodeList = ({ episodes }: EpisodeListProps) => {
  return (
    <div id="episodes" className="pure-menu">
      {episodes.map(episode => (
        <div key={episode.id} className="pure-menu-item">
          <Link href={`/episode/${encodeURIComponent(episode.id)}`} className="pure-menu-link">
            {episode.title}
          </Link>
          {episode.guests?.map(guest => (
            <SpeakerIcon
              key={guest.id}
              id={guest.id}
              icon={guest.icon}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default EpisodeList;