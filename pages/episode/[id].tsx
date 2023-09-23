import { useEffect } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Parser from "rss-parser";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getIdFromAnchorRssFeedItem } from "@/util/utility";

interface Episode {
  id: string;
  title: string;
  isoDate: string;
  description: string;
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

    // isoDate
    const isoDate = document.createElement("p");
    isoDate.innerText = episode.isoDate;
    main.appendChild(isoDate);
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
            <iframe
              src={`https://podcasters.spotify.com/pod/show/matsumaru/embed/episodes/${episode.id}`}
              width="100%"
              frameBorder="0"
              scrolling="no"
            ></iframe>
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

  const parser = new Parser();
  const feed = await parser.parseURL('https://anchor.fm/s/db286500/podcast/rss');

  const episode = feed.items.find(item => item.link?.includes(id)) || {};
  const { title, isoDate, content } = episode;

  return {
    props: {
      episode: {
        id,
        title,
        isoDate,
        description: content
      }
    }
  }
}