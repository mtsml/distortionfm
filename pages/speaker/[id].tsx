import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EpisodeList from "@/components/EpisodeList";
import Episode from "@/types/episode";
import Speaker from "@/types/speaker";

interface SpeakerPageProps {
  speaker: Speaker;
  episodes: Episode[];
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/speakers`);
  const { speakers } = await response.json();

  const paths = speakers.map((speaker: Speaker) => (
    {
      params: {
        id: String(speaker.id)
      }
    }
  ));

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const speakerId = context.params ? Number(context.params.id) : NaN;

  const responseSpeaker = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/speakers/${speakerId}`);
  const { speaker } = await responseSpeaker.json();

  const responseEpisodes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/speakers/${speakerId}/episodes`);
  const { episodes } = await responseEpisodes.json();

  return {
    props: {
      speaker,
      episodes
    }
  }
}

export default SpeakerPage;