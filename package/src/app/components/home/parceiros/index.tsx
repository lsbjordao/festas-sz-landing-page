"use client";
import { useEffect, useState } from "react";
import Slider from "react-infinite-logo-slider";
import SingleParceiro from "./SingleParceiro";
import Link from "next/link";

const Parceiros = () => {
    const [parceiroData, setParceiroData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/parceiros')
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setParceiroData(data?.parceiroData)
            } catch (error) {
                console.error('Error fetching services:', error)
            }
        }

        fetchData()
    }, [])
    return (
        <section>
            <div className="py-11 sm:py-20 dark:bg-smokyBlack/10">
                <div className="container">
                    <div className="flex flex-col text-center gap-6 md:gap-10">
                        <div className="text-center">
                            <h2>Parceiros</h2>
                        </div>
                        {parceiroData && parceiroData.length > 0 && (
                            <div>
                                <Slider
                                    width='200px'
                                    duration={20}
                                    pauseOnHover={true}
                                    blurBorders={false}>
                                    {parceiroData?.map((value: any, index: any) => {
                                        return (
                                            <SingleParceiro key={index} parceiro={value} />
                                        )
                                    })}
                                </Slider>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Parceiros