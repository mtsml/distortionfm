import { GetStaticProps } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EpisodeList from "@/components/EpisodeList";
import Episode from "@/types/episode";

interface HomeProps {
  episodes: Episode[];
} 

const Home = ({ episodes }: HomeProps) => {
  return (
    <div className="pure-g">
      <Header />
      <div className="contents pure-u-1 pure-u-xl-3-4">
        <main>
          <h2>Episodes</h2>
          <EpisodeList
            episodes={episodes}
          />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/episodes`);
  const { episodes } = await response.json();

  return {
    props: {
      episodes
    },
    revalidate: 60
  }
}

export default Home;