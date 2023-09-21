import { GetStaticProps } from "next";
import Link from "next/link";
import Parser from "rss-parser";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";

interface Episode {
  id: string;
  title: string;
  isoDate: string;
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
          <h1>Episodes</h1>
          <div id="episodes" className="pure-menu">
            {episodes.map(episode => (
              <div key={episode.id} className="pure-menu-item">
                <Link href={`/episode/${encodeURIComponent(episode.id)}`} className="pure-menu-link">
                  {episode.title}
                </Link>
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

  const episodes = feed.items.map(item => {
    const id = getIdFromAnchorRssFeedItem(item);
    const title = item.title;
    const isoDate = item.isoDate;

    return {
      id,
      title,
      isoDate
    }
  });

  return {
    props: {
      episodes
    }
  }
}

export default Home;