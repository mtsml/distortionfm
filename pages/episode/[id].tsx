import { useEffect, useRef, useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Parser from "rss-parser";
import { sql } from "@vercel/postgres";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";

interface Transcription {
  text: string;
  start_sec: number;
  end_sec: number;
}

interface Episode {
  id: string;
  title: string;
  isoDate: string;
  enclosure: Parser.Enclosure;
  description: string;
  transcriptions: Transcription[];
}

interface Props {
  episode: Episode;
} 

const Episode = ({ episode }: Props) => {
  const [activeTranscriptionSec, setActiveTranscriptionSec] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const main = document.getElementsByTagName("main")[0];

    // description
    // const parser = new DOMParser();
    // const parsedDescription = parser.parseFromString(episode.description, "text/html")
    // const descriptions = Array.from(parsedDescription.body.childNodes);
    // descriptions.forEach(description => main.appendChild(description));

  }, []);

  /**
   * チャプター切り替え
   */
  const jumpToChapter = (time: number): void => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      audioRef.current.play();
    }
  }

  /**
   * 現在再生している時間帯のtranscriptionをactiveにする
   */
  const updateActiveTranscription = (): void => {
    if (!audioRef.current?.currentTime) return;

    const cuerentTime = audioRef.current?.currentTime;
    const activeTranscription = episode.transcriptions.find(
      transcription => transcription.start_sec <= cuerentTime && cuerentTime < transcription.end_sec
    );

    // onTimeUpdateは1s内で複数発行されるため、activeTranscriptionSecの値が変わる場合のみstateを更新する
    if (activeTranscription && activeTranscription.start_sec !== activeTranscriptionSec) {
      setActiveTranscriptionSec(activeTranscription?.start_sec);

      const transcriptionWrapperElem = document.getElementById("transcriptionWrapper");
      const activeTranscriptionElem = document.getElementById(String(activeTranscription.start_sec));
      if (transcriptionWrapperElem && activeTranscriptionElem) {
        // 直前のtranscriptionを枠内に表示する
        const previousTranscriptionElem = activeTranscriptionElem.previousElementSibling as HTMLElement;
        const offsetScrollY = previousTranscriptionElem?.offsetHeight + 12 || 0;

        // transcriptionが枠内の上部に表示されるようスクロールする
        const scrollY = activeTranscriptionElem.offsetTop - transcriptionWrapperElem.offsetTop - offsetScrollY;
        transcriptionWrapperElem.scroll(0, scrollY);
      }
    }
  }

  return (
    <>
      <Head>
        <title>{episode.title}</title>
      </Head>
      <div className="pure-g">
        <Header />
        <div className="contents pure-u-1 pure-u-xl-3-4">
          <main>
            <h1>{episode.title}</h1>
            <p>{episode.isoDate}</p>
            <p>
              <audio
                ref={audioRef}
                className="player"
                src={episode.enclosure.url}
                onTimeUpdate={() => updateActiveTranscription()}
                controls
              ></audio>
            </p>
            <div id="transcriptionWrapper" className="transcription">
              {episode.transcriptions.map(transcription => (
                <p
                  id={String(transcription.start_sec)}
                  key={transcription.start_sec}
                  className={transcription.start_sec === activeTranscriptionSec ? "active" : ""}
                  data-start-sec={String(transcription.start_sec)}
                  onClick={() => jumpToChapter(transcription.start_sec)}
                >
                  {transcription.text}
                </p>
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
  const parser = new Parser();
  const feed = await parser.parseURL('https://anchor.fm/s/db286500/podcast/rss');

  const paths = feed.items.map(item => {
    const id = getIdFromAnchorRssFeedItem(item);
    return {
      params: { id }
    }
  });

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params ? context.params.id as string : "";

  // RSS
  const parser = new Parser({
    customFields: {
      item: ["enclosure"]
    }
  });
  const feed = await parser.parseURL('https://anchor.fm/s/db286500/podcast/rss');
  const episode = feed.items.find(item => item.link?.includes(id)) || null;
  if (!episode) return  { props: { episode: {} } }
  const { title , isoDate, content, enclosure } = episode;

  // DB
  const { rows } = await sql`
    SELECT text, start_sec, end_sec
    FROM vtt
    WHERE id = ${id}
    ORDER BY start_sec
  `;

  return {
    props: {
      episode: {
        id,
        title,
        isoDate,
        enclosure,
        description: content,
        transcriptions: rows || []
      }
    }
  }
}

export default Episode;