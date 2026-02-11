import Speaker from "@/types/speaker";

export default interface Episode {
  id: string;
  title: string;
  date: string;
  guests?: Speaker[];
}
