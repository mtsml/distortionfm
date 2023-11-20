import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Parser from "rss-parser";
import { sql } from "@vercel/postgres";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EpisodeList from "@/components/EpisodeList";
import Episode from "@/types/episode";
import Speaker from "@/types/speaker";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";

interface SpeakerPageProps {
  episodes: Episode[];
  speaker: Speaker;
} 

const SpeakerPage = ({ episodes, speaker }: SpeakerPageProps) => {
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
              Profile
            </h2>
            <div className="profile">
              <img className="speaker-icon" src={`data:image/png;base64,${speaker.icon}`}/>
              <div>
                <h3 className="speaker-name">{speaker.name}</h3>
                {speaker.description && <span className="speaker-description">{speaker.description}</span>}
              </div>
            </div>
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

export default SpeakerPage;