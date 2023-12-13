import { useEffect, useRef, useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Parser from "rss-parser";
import clsx from "clsx";
import { sql } from "@vercel/postgres";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpeakerIcon from "@/components/SpeakerIcon";
import Episode from "@/types/episode";
import Chapter from "@/types/chapter";
import Transcript from "@/types/transcript";
import { getIdFromAnchorRssFeedItem, toMmssFormat, toSimpleDateFormat } from "@/util/utility";

interface EpisodeWithDetail extends Episode {
  enclosure: Parser.Enclosure;
  description: string;
  chapters: Chapter[];
  transcripts: Transcript[];
}

interface EpisodePageProps {
  episode: EpisodeWithDetail;
}

const EpisodePage = ({ episode }: EpisodePageProps) => {
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [activeTranscriptMs, setActiveTranscriptMs] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // descriptionを生成する。DOMParserを利用するためSSGではなくCSRを採用
    const descriptionWrapper = document.getElementById("descriptionWrapper");
    if (!descriptionWrapper) return;

    const parser = new DOMParser();
    const parsedDescription = parser.parseFromString(episode.description, "text/html")
    const descriptions = Array.from(parsedDescription.body.children);
    descriptions.forEach(description => {
      addClassRecursively(description);
      descriptionWrapper.appendChild(description)
    });
  }, []);

  /**
   * 再帰的にclassを付与する
   */
  const addClassRecursively = (elem: Element): void => {
    if (elem.nodeName === "UL") elem.classList.add("pure-menu");
    if (elem.nodeName === "LI") elem.classList.add("pure-menu-item");
    if (elem.nodeName === "A") elem.classList.add("pure-menu-link");

    Array.from(elem.children).forEach(child => addClassRecursively(child));
  }

  /**
   * 指定の秒数から再生する
   */
  const playFrom = (ms: number): void => {
    if (!audioRef.current) return;
    // ms -> s
    audioRef.current.currentTime = ms / 1000;
    audioRef.current.play();
  }

  /**
   * 現在再生している時間帯のtranscriptをactiveにする
   */
  const updateActiveTranscript = (): void => {
    if (!audioRef.current) return;

    // s -> ms
    const currentMs = audioRef.current.currentTime * 1000;
    const activeTranscript = episode.transcripts.find(transcript =>
      transcript.startMs <= currentMs && currentMs < transcript.endMs
    );

    // 負荷を抑えるためactiveTranscriptMsの値が変わる場合のみstateを更新する
    if (activeTranscript && activeTranscript.startMs !== activeTranscriptMs) {
      setActiveTranscriptMs(activeTranscript.startMs);

      const transcriptWrapperElem = document.getElementById("transcriptWrapper");
      const activeTranscriptElem = document.getElementById(String(activeTranscript.startMs));
      if (transcriptWrapperElem && activeTranscriptElem) {
        // 直前のtranscriptを枠内に表示するためのoffsetを計算する
        const previousTranscriptElem = activeTranscriptElem.previousElementSibling as HTMLElement;
        const offsetScrollY = previousTranscriptElem?.offsetHeight + 12 || 0;

        // transcriptが枠内の上部に表示されるようスクロールする
        const scrollY = activeTranscriptElem.offsetTop - transcriptWrapperElem.offsetTop - offsetScrollY;
        transcriptWrapperElem.scroll({
          top: scrollY,
          behavior: "smooth"
        });
      }
    }
  }

  return (
    <>
      <Head>
        <title>{episode.title}</title>
        <meta name="og:type" content="article" />
        <meta name="og:title" content={episode.title} />
        <meta name="og:url" content={`https://distortion.fm/episode/${episode.id}`} />
        <meta name="twitter:card" content="summary" />
      </Head>
      <div className="pure-g">
        <Header />
        <div className="contents pure-u-1 pure-u-xl-3-4">
          <main>
            <h2>{episode.title}</h2>
            <div>
              <audio
                ref={audioRef}
                className="player"
                src={episode.enclosure.url}
                onTimeUpdate={() => updateActiveTranscript()}
                controls
              ></audio>
            </div>
            <div>
              <a
                className={clsx("tab", { active: activeTabIdx === 0})}
                onClick={() => setActiveTabIdx(0)}
              >
                説明
              </a>
              {episode.chapters.length !== 0 && (
                <a
                  className={clsx("tab", { active: activeTabIdx === 1})}
                  onClick={() => setActiveTabIdx(1)}
                >
                  チャプター
                </a>
              )}
              {episode.transcripts.length !== 0 && (
                <a
                  className={clsx("tab", { active: activeTabIdx === 2})}
                  onClick={() => setActiveTabIdx(2)}
                >
                  文字起こし
                </a>
              )}
            </div>
            <div
              id="descriptionWrapper"
              style={{ display: activeTabIdx === 0 ? "block" : "none" }}
            >
              <p className="description-meta">
                <span>
                  {episode.date}
                </span>
                {episode.guests && episode.guests?.length !== 0 &&
                  <span>
                    <span className="guest-label">Guest:</span>
                    {episode.guests.map(guest => (
                      <SpeakerIcon
                        key={guest.id}
                        id={guest.id}
                        icon={guest.icon}
                        name={guest.name}
                      />
                    ))}
                  </span>
                }
              </p>
            </div>
            <div
              id="chapterWrapper"
              style={{ display: activeTabIdx === 1 ? "block" : "none" }}
            >
              <ul className="pure-menu">
                {episode.chapters.map(chapter => (
                  <li
                    key={chapter.startMs}
                    className="pure-menu-item"
                  >
                    <span
                      className="pure-menu-link"
                      onClick={() => {
                        setActiveTabIdx(2);
                        playFrom(chapter.startMs);
                      }}
                    >
                      {toMmssFormat(chapter.startMs)} {chapter.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              id="transcriptWrapper"
              className="transcript"
              style={{ display: activeTabIdx === 2 ? "block" : "none" }}
            >
              {episode.transcripts.map(transcript => (
                <p
                  id={String(transcript.startMs)}
                  key={transcript.startMs}
                  className={clsx({ active: transcript.startMs === activeTranscriptMs })}
                  onClick={() => playFrom(transcript.startMs)}
                >
                  {transcript.transcript}
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
  const episode = feed.items.find(item => item.link?.includes(id));
  if (!episode) return  { props: { episode: {} } }
  const { title , isoDate, content, enclosure } = episode;

  // transcript info from DB
  const transcripts = (await sql`
    SELECT transcript, start_ms AS "startMs", end_ms AS "endMs"
    FROM vtt
    WHERE id = ${id}
    ORDER BY start_ms
  `).rows;

  // chapters info from DB
  const chapters = (await sql`
    SELECT
      start_ms AS "startMs",
      title
    FROM
      chapters
    WHERE
      episode_id = ${id}
    ORDER BY
      start_ms
  `).rows;

  // episode info from DB
  const guests = (await sql`
    SELECT speaker.id, name, encode(icon, 'base64') as icon
    FROM episode_speaker_map esm
    INNER JOIN speaker ON speaker.id = esm.speaker_id
    WHERE episode_id = ${id} AND speaker_id <> 0
  `).rows;

  return {
    props: {
      episode: {
        id,
        title,
        date: toSimpleDateFormat(isoDate),
        guests,
        enclosure,
        description: content,
        chapters: chapters || [],
        transcripts: transcripts || []
      }
    }
  }
}

export default EpisodePage;