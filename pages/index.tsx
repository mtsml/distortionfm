import { GetStaticProps } from "next";
import Link from "next/link";
import Parser from "rss-parser";
import { sql } from "@vercel/postgres";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpeakerIcon from "@/components/SpeakerIcon";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";

interface Speaker {
  id: number;
  name: string;
  icon: string;
}

interface Episode {
  id: string;
  title: string;
  isoDate: string;
  guests: Speaker[];
}

interface Props {
  episodes: Episode[];
} 

const Home = ({ episodes }: Props) => {
  return (
    <div className="pure-g">
      <Header />
      <div className="contents pure-u-1 pure-u-xl-3-4">
        <main>
          <h2>Episodes</h2>
          <div id="episodes" className="pure-menu">
            {episodes.map(episode => (
              <div key={episode.id} className="pure-menu-item">
                <Link href={`/episode/${encodeURIComponent(episode.id)}`} className="pure-menu-link">
                  {episode.title}
                </Link>
                {episode.guests.map(guest => (
                  <SpeakerIcon
                    key={guest.id}
                    id={guest.id}
                    icon={guest.icon}
                  />
                ))}
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const parser = new Parser();
  const feed = await parser.parseURL('https://anchor.fm/s/db286500/podcast/rss');

  const { rows } = await sql`
    SELECT episode_id, speaker_id as id, name, encode(icon, 'base64') as icon
    FROM episode_speaker_map esm
    INNER JOIN speaker ON speaker.id = esm.speaker_id AND esm.speaker_id <> 0
    ORDER BY episode_id, speaker_id
  `;

  const episodes = feed.items.map(item => {
    const id = getIdFromAnchorRssFeedItem(item);
    const title = item.title;
    const isoDate = item.isoDate;
    const guests = rows.filter(row => row.episode_id === id);

    return {
      id,
      title,
      isoDate,
      guests
    }
  });

  return {
    props: {
      episodes
    },
    revalidate: 60
  }
}

export default Home;