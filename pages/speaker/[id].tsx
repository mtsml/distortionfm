import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import Parser from "rss-parser";
import { sql } from "@vercel/postgres";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";

interface Speaker {
  id: number;
  name: string;
  icon: IconProp;
  description: string | null;
}

interface Episode {
  id: string;
  title: string;
  isoDate: string;
  speakers: Speaker[];
}

interface Props {
  episodes: Episode[];
  speaker: Speaker;
} 

const Speaker = ({ episodes, speaker }: Props) => {
  return (
    <>
      <Head>
        <title>{speaker.name}</title>
      </Head>
      <div className="pure-g">
        <Header />
        <div className="contents pure-u-1 pure-u-xl-3-4">
          <main>
            <h2>
              <FontAwesomeIcon
                icon={speaker.icon}
                className="speaker-icon"
              />
              {speaker.name}
            </h2>
            {speaker.description && <p>{speaker.description}</p>}
            <h2>Episodes</h2>
            <div id="episodes" className="pure-menu">
              {episodes.map(episode => (
                <div key={episode.id} className="pure-menu-item">
                  <Link href={`/episode/${encodeURIComponent(episode.id)}`} className="pure-menu-link">
                    {episode.title}
                  </Link>
                  {episode.speakers.map(speaker => (
                    <FontAwesomeIcon
                      key={speaker.id}
                      className="speaker-icon"
                      icon={speaker.icon}
                      size="sm"
                    />
                  ))}
                </div>
              ))}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { rows } = await sql`
    SELECT id
    FROM speaker
  `;

  const paths = rows.map(speaker => {
    return {
      params: {
        id: String(speaker.id)
      }
    }
  });

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const speakerId = context.params ? Number(context.params.id) : NaN;

  const parser = new Parser();
  const feed = await parser.parseURL('https://anchor.fm/s/db286500/podcast/rss');

  const { rows } = await sql`
    SELECT episode_id, speaker_id as id, name, icon, description
    FROM episode_speaker_map esm
    INNER JOIN speaker ON speaker.id = esm.speaker_id
    ORDER BY episode_id, speaker_id
  `;

  const episodes = feed.items
    .map(item => {
      const id = getIdFromAnchorRssFeedItem(item);
      const title = item.title;
      const isoDate = item.isoDate;
      const speakers = rows.filter(row => row.episode_id === id);

      return {
        id,
        title,
        isoDate,
        speakers
      }
    })
    .filter(episode => episode.speakers.some(speaker => speaker.id === speakerId));

  const speaker = rows.find(row => row.id === speakerId);

  return {
    props: {
      episodes,
      speaker
    }
  }
}

export default Speaker;