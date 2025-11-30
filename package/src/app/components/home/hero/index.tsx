"use client";
import Image from "next/image"
import Link from "next/link";
import { BackgroundBeams } from "../../ui/BackgroundBeams";
import { TextGenerateEffect } from "../../ui/text-generate-effect";
import { FaWhatsapp } from 'react-icons/fa';


const HeroSection = () => {
    const words = `As festas cariocas mais maneiras da Zona Sul!`;
    return (

        <section>

            <div className="relative bg-[radial-gradient(46.36%_160.26%_at_51.22%_81.69%,rgba(15,126,217,0.06)_0%,rgba(15,126,217,0)_100%),radial-gradient(18.4%_45.73%_at_11.57%_64.01%,rgba(217,15,15,0.05)_0%,rgba(217,15,15,0)_100%),radial-gradient(19.91%_49.47%_at_100.75%_35.35%,rgba(123,236,170,0.1)_0%,rgba(123,236,170,0)_100%)] pt-20">
                <div>
                    <div className="container">
                        <div className="flex flex-col gap-2 sm:gap-4 text-center items-center justify-center py-12 sm:py-20">
                            <div className="pb-4">
                                <Image src={"/images/banner/banner-logo.svg"} alt="banner-logo" width={120} height={120} />
                            </div>
                            <h1>Festas ZS</h1>
                            <TextGenerateEffect words={words} />
                            {/* <h5 className="text-secondary max-w-3xl">Docsta is a modern, minimal, and highly customizable documentation starter template for open-source projects, tools, or libraries.</h5> */}
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 py-3">
                                <Link href={"https://chat.whatsapp.com/HO94jLtkcWR8TUTWiyk1WB?mode=hqrt3"}>
                                    <span className="text-white font-bold"><FaWhatsapp className="w-16 h-16" /></span>
                                </Link>
                            </div>
                            <p className="text-secondary text-xs">Esta página apenas disponibiliza códigos promocionais e direciona usuários ao site oficial do evento.</p>
                            <p className="text-secondary text-xs">Não realizamos venda de ingressos nem armazenamos dados pessoais.</p>
                        </div>
                    </div>
                </div>
                <BackgroundBeams />
            </div>
        </section>
    )
}

export default HeroSection