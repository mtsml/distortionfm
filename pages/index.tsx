import { GetStaticProps } from "next";
import Parser from "rss-parser";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EpisodeList from "@/components/EpisodeList";
import Episode from "@/types/episode";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";
import { d1All } from "@/util/db";

interface HomeProps {
  episodes: Episode[];
} 

const Home = ({ episodes }: HomeProps) => {
  return (
    <div className="pure-g">
      <Header />
      <div className="contents pure-u-1 pure-u-xl-3-4">
        <main>
          <h2>Episodes</h2>
          <EpisodeList
            episodes={episodes}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const parser = new Parser();
  const feed = await parser.parseURL('https://anchor.fm/s/db286500/podcast/rss');

  const rows = await d1All<{ episode_id: string; id: number; name: string; icon: string }>(
    `
      SELECT
        esm.episode_id,
        speaker.id,
        speaker.name,
        CAST(speaker.icon AS TEXT) AS icon
      FROM episode_speaker_map esm
      INNER JOIN speaker ON speaker.id = esm.speaker_id
      WHERE esm.speaker_id <> 0
      ORDER BY esm.episode_id, esm.speaker_id
    `
  );

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
    revalidate: 60 // seconds
  }
}

export default Home;
