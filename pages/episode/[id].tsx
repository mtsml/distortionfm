import { useEffect } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Parser from "rss-parser";
import { sql } from "@vercel/postgres";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";

interface Episode {
  id: string;
  title: string;
  isoDate: string;
  enclosure: Parser.Enclosure;
  description: string;
  transcription: string;
}

interface Props {
  episode: Episode;
} 

const Episode = ({ episode }: Props) => {

  useEffect(() => {
    const main = document.getElementsByTagName("main")[0];

    // description
    const parser = new DOMParser();
    const parsedDescription = parser.parseFromString(episode.description, "text/html")
    const descriptions = Array.from(parsedDescription.body.childNodes);
    descriptions.forEach(description => main.appendChild(description));

    // transcription
    if (episode.transcription) {
      const transcription = document.createElement("div");
      transcription.classList.add("transcription");
      episode.transcription.split("\n").forEach(text => {
        const p = document.createElement("p");
        p.innerText = text;
        transcription.appendChild(p);
      })
      main.appendChild(transcription);
    }

  }, []);

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
            <audio src={episode.enclosure.url} controls></audio>
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
  const { rows } = await sql`SELECT * FROM episode WHERE id = ${id}`;
  const transcription = rows.length > 0 ? rows[0].transcription : null;

  return {
    props: {
      episode: {
        id,
        title,
        isoDate,
        enclosure,
        description: content,
        transcription
      }
    }
  }
}

export default Episode;