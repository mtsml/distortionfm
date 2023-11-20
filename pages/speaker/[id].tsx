import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Parser from "rss-parser";
import { sql } from "@vercel/postgres";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EpisodeList from "@/components/EpisodeList";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";

interface Speaker {
  id: number;
  name: string;
  icon: string;
  description: string | null;
}

interface Episode {
  id: string;
  title: string;
  isoDate: string;
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
              {speaker.name}
            </h2>
            <p>
              <img className="speaker-icon -lg" src={`data:image/png;base64,${speaker.icon}`}/>
              {speaker.description && <span className="speaker-description">{speaker.description}</span>}
            </p>
            <h2>Episodes</h2>
            <EpisodeList
              episodes={episodes}
            />
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

  const episodeIds = (await sql`
    SELECT episode_id
    FROM episode_speaker_map
    WHERE speaker_id = ${speakerId}
  `).rows.map(row => row.episode_id);

  const episodes = feed.items
    .map(item => {
      const id = getIdFromAnchorRssFeedItem(item);
      const title = item.title;
      const isoDate = item.isoDate;

      return {
        id,
        title,
        isoDate,
      }
    })
    .filter(episode => episodeIds.includes(episode.id));

  const speaker = (await sql`
    SELECT id, name, encode(icon, 'base64') as icon, description
    FROM speaker
    WHERE id = ${speakerId}
  `).rows[0];

  return {
    props: {
      episodes,
      speaker
    }
  }
}

export default Speaker;