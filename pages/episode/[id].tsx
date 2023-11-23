import { useEffect, useRef, useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Parser from "rss-parser";
import clsx from "clsx";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpeakerIcon from "@/components/SpeakerIcon";
import Episode from "@/types/episode";
import Transcript from "@/types/transcript";

interface EpisodeWithDetail extends Episode {
  enclosure: Parser.Enclosure;
  description: string;
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
              {episode.transcripts.length !== 0 && (
                <a
                  className={clsx("tab", { active: activeTabIdx === 1})}
                  onClick={() => setActiveTabIdx(1)}
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
              id="transcriptWrapper"
              className="transcript"
              style={{ display: activeTabIdx === 1 ? "block" : "none" }}
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/episodes`);
  const { episodes } = await response.json();

  const paths = episodes.map((episode: Episode) => (
    {
      params: {
        id: String(episode.id)
      }
    }
  ));

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const id = context.params ? context.params.id as string : "";

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/episodes/${id}`);
  const { episode } = await response.json();

  return {
    props: {
      episode
    }
  }
}

export default EpisodePage;