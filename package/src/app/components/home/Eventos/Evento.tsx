// ./src/app/components/home/Evento/Evento.tsx
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import EventoModal from "./EventoModal";
import StarFavorite from "./StarFavorite";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites"; // Importe o hook

interface Evento {
    _id: string;
    data?: string;
    title: string;
    descp: string;
    image?: string;
    icon?: string;
    localizacao: string;
    estiloMusical: string;
    destaque: string;
    horario: string;
    slug: string;
    whatsappLink: string;
}

type Filtro = 'todos' | 'favoritos' | 'hoje' | 'amanha' | 'fim-de-semana' | 'proxima-semana';

const Evento = () => {
    const [eventoData, setEventoData] = useState<Evento[]>([]);
    const [filteredEventos, setFilteredEventos] = useState<Evento[]>([]);
    const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filtroAtivo, setFiltroAtivo] = useState<Filtro>('todos');

    const { isFavorite } = useFavorites(); // Use o hook

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log("📡 Buscando eventos do MongoDB...");

                const res = await fetch("/api/eventos");
                if (!res.ok) throw new Error("Failed to fetch events from MongoDB");
                const data = await res.json();

                console.log("✅ Eventos carregados:", data.length);

                // 🔥 Data de hoje (00:00)
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                // 🔥 Filtrar e ordenar
                const sorted = Array.isArray(data)
                    ? data
                        .filter((ev) => {
                            const d = new Date(ev.data ?? "");
                            return !isNaN(d.getTime()) && d >= hoje; // só futuros
                        })
                        .sort((a, b) => {
                            const d1 = new Date(a.data ?? "").getTime();
                            const d2 = new Date(b.data ?? "").getTime();
                            return d1 - d2;
                        })
                    : [];

                setEventoData(sorted);
                setFilteredEventos(sorted);
            } catch (error) {
                console.error("Error fetching events:", error);
                setEventoData([]);
                setFilteredEventos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Função para aplicar os filtros
    const aplicarFiltro = (filtro: Filtro) => {
        setFiltroAtivo(filtro);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);

        const inicioFimDeSemana = new Date(hoje);
        // Encontra a próxima sexta-feira (5)
        const diaDaSemana = hoje.getDay();
        const diasParaSexta = diaDaSemana <= 5 ? 5 - diaDaSemana : 5 + (7 - diaDaSemana);
        inicioFimDeSemana.setDate(hoje.getDate() + diasParaSexta);

        const fimFimDeSemana = new Date(inicioFimDeSemana);
        fimFimDeSemana.setDate(fimFimDeSemana.getDate() + 2); // Sábado e Domingo

        const inicioProximaSemana = new Date(hoje);
        inicioProximaSemana.setDate(hoje.getDate() + 7);
        const fimProximaSemana = new Date(inicioProximaSemana);
        fimProximaSemana.setDate(fimProximaSemana.getDate() + 7);

        let eventosFiltrados = eventoData;

        switch (filtro) {
            case 'favoritos':
                eventosFiltrados = eventoData.filter(evento => isFavorite(evento._id));
                break;

            case 'hoje':
                eventosFiltrados = eventoData.filter(evento => {
                    const dataEvento = new Date(evento.data ?? "");
                    dataEvento.setHours(0, 0, 0, 0);
                    return dataEvento.getTime() === hoje.getTime();
                });
                break;

            case 'amanha':
                eventosFiltrados = eventoData.filter(evento => {
                    const dataEvento = new Date(evento.data ?? "");
                    dataEvento.setHours(0, 0, 0, 0);
                    return dataEvento.getTime() === amanha.getTime();
                });
                break;

            case 'fim-de-semana':
                eventosFiltrados = eventoData.filter(evento => {
                    const dataEvento = new Date(evento.data ?? "");
                    dataEvento.setHours(0, 0, 0, 0);
                    return dataEvento >= inicioFimDeSemana && dataEvento <= fimFimDeSemana;
                });
                break;

            case 'proxima-semana':
                eventosFiltrados = eventoData.filter(evento => {
                    const dataEvento = new Date(evento.data ?? "");
                    dataEvento.setHours(0, 0, 0, 0);
                    return dataEvento >= inicioProximaSemana && dataEvento < fimProximaSemana;
                });
                break;

            case 'todos':
            default:
                eventosFiltrados = eventoData;
                break;
        }

        setFilteredEventos(eventosFiltrados);
    };

    const handleCardClick = (evento: Evento, index: number) => {
        console.log("🎯 Evento clicado:", evento.title);
        setSelectedEvento(evento);
        setCurrentEventIndex(index);
        setIsModalOpen(true);
        sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEvento(null);

        const savedPosition = sessionStorage.getItem("scrollPosition");
        if (savedPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition));
            }, 100);
        }
    };

    const handleNavigate = (direction: "prev" | "next") => {
        setCurrentEventIndex((prev) => {
            let newIndex;
            if (direction === "prev") {
                newIndex = prev > 0 ? prev - 1 : filteredEventos.length - 1;
            } else {
                newIndex = prev < filteredEventos.length - 1 ? prev + 1 : 0;
            }

            setSelectedEvento(filteredEventos[newIndex]);
            return newIndex;
        });
    };

    // Função para prevenir a propagação do clique da estrela
    const handleStarClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o clique propague para o card
    };

    if (loading) {
        return (
            <section>
                <div className="pt-11 sm:pt-20 pb-5 dark:bg-smokyBlack/10">
                    <div className="container">
                        <div className="flex flex-col gap-6 sm:gap-10">
                            <div className="flex flex-col items-center text-center gap-2.5">
                                <p className="uppercase text-primary">Nossos Eventos</p>
                                <h2>Os Melhores Eventos da Zona Sul</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <div key={item} className="animate-pulse">
                                        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48 mb-4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="pt-11 sm:pt-20 pb-5 dark:bg-smokyBlack/10">
                <div className="container">
                    <div className="flex flex-col gap-6 sm:gap-10">
                        <div className="flex flex-col items-center text-center gap-2.5">
                            <p className="uppercase text-primary">Nossos Eventos</p>
                            <h2>Os Melhores Eventos da Zona Sul</h2>
                        </div>

                        {/* BLOCO DE FILTROS */}
                        <div className="flex flex-wrap justify-center gap-3 px-4">
                            {/* Todos os Eventos */}
                            <button
                                onClick={() => aplicarFiltro('todos')}
                                className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${filtroAtivo === 'todos'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary dark:hover:border-primary'
                                    }`}
                            >
                                Todos
                            </button>

                            {/* Filtro de Favoritos */}
                            <button
                                onClick={() => aplicarFiltro('favoritos')}
                                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors ${filtroAtivo === 'favoritos'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary dark:hover:border-primary'
                                    }`}
                            >
                                <Star size={16} className="fill-yellow-400 stroke-yellow-400" />
                                Favoritos
                            </button>

                            {/* Filtros por data */}
                            <button
                                onClick={() => aplicarFiltro('hoje')}
                                className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${filtroAtivo === 'hoje'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary dark:hover:border-primary'
                                    }`}
                            >
                                🎉 Hoje
                            </button>

                            <button
                                onClick={() => aplicarFiltro('amanha')}
                                className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${filtroAtivo === 'amanha'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary dark:hover:border-primary'
                                    }`}
                            >
                                📅 Amanhã
                            </button>

                            <button
                                onClick={() => aplicarFiltro('fim-de-semana')}
                                className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${filtroAtivo === 'fim-de-semana'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary dark:hover:border-primary'
                                    }`}
                            >
                                🎊 Este FDS
                            </button>

                            <button
                                onClick={() => aplicarFiltro('proxima-semana')}
                                className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${filtroAtivo === 'proxima-semana'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary dark:hover:border-primary'
                                    }`}
                            >
                                🔥 Próxima Semana
                            </button>
                        </div>

                        {/* Contador de resultados */}
                        <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
                            {filteredEventos.length} evento{filteredEventos.length !== 1 ? 's' : ''} encontrado{filteredEventos.length !== 1 ? 's' : ''}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                            {filteredEventos.map((evento, index) => {
                                const slug = evento.title
                                    ?.toLowerCase()
                                    .replace(/\s+/g, "-")
                                    .replace(/[^\w-]+/g, "");

                                return (
                                    <div id={`evento-${slug}`} key={evento._id} className="scroll-mt-24">
                                        <button
                                            onClick={() => handleCardClick(evento, index)}
                                            className="block group w-full text-left"
                                        >
                                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-[1.02] h-full">
                                                <div className="relative h-48 w-full overflow-hidden">
                                                    {evento?.image && (
                                                        <Image
                                                            src={evento.image}
                                                            alt={evento.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    )}
                                                </div>

                                                <div className="p-6">
                                                    {/* Estrela + Data + Título (lado a lado) */}
                                                    <div className="grid grid-cols-[32px_1fr] items-center gap-3">
                                                        {/* Estrela */}
                                                        <button
                                                            onClick={handleStarClick}
                                                            className="w-8 h-8 flex items-center justify-center rounded-xl"
                                                        >
                                                            <StarFavorite id={evento._id} className="w-5 h-5" />
                                                        </button>

                                                        {/* Data + Título */}
                                                        <div className="flex flex-col leading-none">
                                                            <p className="text-gray-600 dark:text-gray-300">
                                                                {new Date(evento.data ?? "").toLocaleDateString("pt-BR")}
                                                            </p>

                                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                                {evento.title}
                                                            </h3>
                                                        </div>
                                                    </div>


                                                    {/* Descrição embaixo */}
                                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 mt-2">
                                                        {evento.descp}
                                                    </p>

                                                    <span className="inline-block text-primary font-medium text-sm mt-2">
                                                        Ver detalhes →
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {filteredEventos.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    Nenhum evento encontrado para o filtro selecionado.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && filteredEventos.length > 0 && selectedEvento && (
                <EventoModal
                    evento={selectedEvento}
                    eventos={filteredEventos}
                    onClose={handleCloseModal}
                    onNavigate={handleNavigate}
                />
            )}
        </section>
    );
};

export default Evento;