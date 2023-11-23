import Link from "next/link";
import SpeakerIcon from "@/components/SpeakerIcon";
import Episode from "@/types/episode";

interface EpisodeListProps {
  episodes: Episode[];
}

const EpisodeList = ({ episodes }: EpisodeListProps) => {
  return (
    <div id="episodes" className="pure-menu">
      {episodes.map(episode => (
        <div key={episode.id} className="pure-menu-item">
          <Link
            className="pure-menu-link"
            href={`/episode/${encodeURIComponent(episode.id)}`}
          >
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