// ./src/app/page.tsx

import HeroSection from "./components/home/hero";
import Eventos from "./components/home/Eventos";
import Parceiros from "./components/home/parceiros";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Festas ZS",
};

export default function Home() {
  return (
    <>
      <HeroSection/>
      <Eventos/>
      <Parceiros/>
    </>
  );
}
