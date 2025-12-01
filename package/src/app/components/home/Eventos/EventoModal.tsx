// ./src/app/components/home/Evento/EventoModal.tsx
"use client";
import Image from "next/image";
import { FaWhatsapp, FaTimes, FaShareAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import StarFavorite from "./StarFavorite";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

// Interface baseada nos dados do MongoDB
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

interface EventoModalProps {
    evento: Evento;
    eventos?: Evento[];
    onClose: () => void;
    onNavigate: (direction: 'prev' | 'next') => void;
}

const EventoModal = ({ evento, eventos = [], onClose, onNavigate }: EventoModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const swiperRef = useRef<any>(null);
    const [showShareTooltip, setShowShareTooltip] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentEvento, setCurrentEvento] = useState<Evento>(evento);
    const [showCalendarOptions, setShowCalendarOptions] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [initialized, setInitialized] = useState(false);

    // Encontra o índice inicial baseado no evento selecionado
    useEffect(() => {
        const initialIndex = eventos.findIndex(e => e._id === evento._id);
        console.log("🎯 EventoModal recebido:", evento.title, "Índice:", initialIndex);
        setCurrentSlideIndex(initialIndex >= 0 ? initialIndex : 0);
        setCurrentEvento(evento);
        setInitialized(true);
    }, [evento, eventos]);

    const hasPrevious = currentSlideIndex > 0;
    const hasNext = currentSlideIndex < eventos.length - 1;

    // CORREÇÃO: Força o Swiper para o slide correto quando inicializar
    useEffect(() => {
        if (initialized && swiperRef.current && swiperRef.current.swiper) {
            console.log("🔄 Movendo Swiper para índice:", currentSlideIndex);
            swiperRef.current.swiper.slideTo(currentSlideIndex, 0); // 0 = sem animação
        }
    }, [initialized, currentSlideIndex]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && hasPrevious && !isAnimating) handleNavigation('prev');
            if (e.key === 'ArrowRight' && hasNext && !isAnimating) handleNavigation('next');
        };

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Element;
            const isNavigationButton = target.closest('.navigation-button');
            const isCalendarButton = target.closest('.calendar-button');
            const isCalendarDropdown = target.closest('.calendar-dropdown');

            if (window.innerWidth < 768) {
                if (!isCalendarButton && !isCalendarDropdown && showCalendarOptions) {
                    setShowCalendarOptions(false);
                    return;
                }
            }

            if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isNavigationButton && !isCalendarButton) {
                onClose();
                setShowCalendarOptions(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [onClose, hasPrevious, hasNext, isAnimating, showCalendarOptions]);

    // Função chamada quando o slide muda no Swiper
    const handleSlideChange = (swiper: any) => {
        const newIndex = swiper.activeIndex;
        console.log("🔄 Slide mudou para:", newIndex, eventos[newIndex]?.title);
        setCurrentSlideIndex(newIndex);
        const novoEvento = eventos[newIndex];
        setCurrentEvento(novoEvento);
    };

    // Função para navegação pelos botões customizados
    const handleNavigation = (direction: 'prev' | 'next') => {
        if (isAnimating || !swiperRef.current) return;

        setIsAnimating(true);

        // Calcula o novo índice
        let newIndex;
        if (direction === 'next') {
            newIndex = currentSlideIndex < eventos.length - 1 ? currentSlideIndex + 1 : 0;
        } else {
            newIndex = currentSlideIndex > 0 ? currentSlideIndex - 1 : eventos.length - 1;
        }

        console.log("📍 Navegação:", direction, "De:", currentSlideIndex, "Para:", newIndex);

        // Move o swiper para o novo índice
        swiperRef.current.swiper.slideTo(newIndex);

        // Atualiza o estado local
        setCurrentSlideIndex(newIndex);
        const novoEvento = eventos[newIndex];
        setCurrentEvento(novoEvento);

        // Chama a função original para manter compatibilidade
        onNavigate(direction);

        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
    };

    // Função de formatação de data
    const formatarData = (dataString: string) => {
        if (!dataString) return '';

        try {
            const data = new Date(dataString);

            if (isNaN(data.getTime())) {
                console.warn('Data inválida:', dataString);
                return '';
            }

            const options: Intl.DateTimeFormatOptions = {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            };

            const dataFormatada = data.toLocaleDateString('pt-BR', options);
            return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

        } catch (error) {
            console.error('Erro ao formatar data:', error, 'Data:', dataString);
            return '';
        }
    };

    // Funções do calendário
    const generateCalendarLinks = () => {
        if (!currentEvento?.data) {
            return {
                google: '#',
                outlook: '#',
                yahoo: '#',
                ics: '#'
            };
        }

        try {
            const eventDate = new Date(currentEvento.data);

            if (isNaN(eventDate.getTime())) {
                return {
                    google: '#',
                    outlook: '#',
                    yahoo: '#',
                    ics: '#'
                };
            }

            const startDate = new Date(eventDate);
            startDate.setHours(22, 0, 0);

            const endDate = new Date(startDate);
            endDate.setHours(6, 0, 0);
            endDate.setDate(endDate.getDate() + 1);

            const formatGoogleDate = (date: Date) => {
                return date.toISOString().replace(/-|:|\.\d+/g, '');
            };

            const formatUniversalDate = (date: Date) => {
                return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
            };

            const inicioGoogle = formatGoogleDate(startDate);
            const fimGoogle = formatGoogleDate(endDate);
            const inicioUniversal = formatUniversalDate(startDate);
            const fimUniversal = formatUniversalDate(endDate);

            return {
                google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(currentEvento?.title || 'Evento')}&dates=${inicioGoogle}/${fimGoogle}&details=${encodeURIComponent(currentEvento?.descp || '')}&location=${encodeURIComponent(currentEvento?.localizacao || '')}`,

                outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(currentEvento?.title || 'Evento')}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(currentEvento?.descp || '')}&location=${encodeURIComponent(currentEvento?.localizacao || '')}`,

                yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(currentEvento?.title || 'Evento')}&st=${formatUniversalDate(startDate)}&dur=${((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)).toFixed(2)}&desc=${encodeURIComponent(currentEvento?.descp || '')}&in_loc=${encodeURIComponent(currentEvento?.localizacao || '')}`,

                ics: generateICSFile()
            };
        } catch (error) {
            console.error('Erro ao gerar links do calendário:', error);
            return {
                google: '#',
                outlook: '#',
                yahoo: '#',
                ics: '#'
            };
        }
    };

    const generateICSFile = () => {
        if (!currentEvento?.data) {
            return '#';
        }

        try {
            const eventDate = new Date(currentEvento.data);
            if (isNaN(eventDate.getTime())) return '#';

            const startDate = new Date(eventDate);
            startDate.setHours(22, 0, 0);

            const endDate = new Date(startDate);
            endDate.setHours(6, 0, 0);
            endDate.setDate(endDate.getDate() + 1);

            const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${currentEvento?.title || 'Evento'}
DESCRIPTION:${currentEvento?.descp || ''}
LOCATION:${currentEvento?.localizacao || ''}
DTSTART:${startDate.toISOString().replace(/-|:|\.\d+/g, '')}
DTEND:${endDate.toISOString().replace(/-|:|\.\d+/g, '')}
UID:${Date.now()}@eventoapp
END:VEVENT
END:VCALENDAR`;

            return URL.createObjectURL(new Blob([icsContent], { type: 'text/calendar' }));
        } catch (error) {
            console.error('Erro ao gerar arquivo ICS:', error);
            return '#';
        }
    };

    const handleICSDownload = () => {
        const links = generateCalendarLinks();
        if (links.ics === '#') {
            console.warn('Não foi possível baixar o arquivo ICS');
            return;
        }

        const link = document.createElement('a');
        link.href = links.ics;
        link.download = `${currentEvento?.title || 'evento'}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowCalendarOptions(false);
    };

    const handleCalendarMouseEnter = () => {
        if (window.innerWidth >= 768) {
            setShowCalendarOptions(true);
        }
    };

    const handleCalendarMouseLeave = () => {
        if (window.innerWidth >= 768) {
            setShowCalendarOptions(false);
        }
    };

    const handleCalendarClick = () => {
        if (window.innerWidth < 768) {
            setShowCalendarOptions(!showCalendarOptions);
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: currentEvento.title,
                    text: currentEvento.descp,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setShowShareTooltip(true);
                setTimeout(() => setShowShareTooltip(false), 2000);
            }
        } catch (error) {
            console.log('Erro ao compartilhar:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            {/* Botões de navegação - Desktop */}
            {eventos.length > 1 && (
                <>
                    <button
                        onClick={() => handleNavigation('prev')}
                        className="navigation-button hidden md:flex absolute left-4 xl:left-8 top-1/2 transform -translate-y-1/2 z-50 p-4 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-2xl border border-gray-200 dark:border-gray-600 transition-all hover:scale-110 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 backdrop-blur-sm"
                        title="Evento anterior"
                        disabled={isAnimating}
                    >
                        <FaChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={() => handleNavigation('next')}
                        className="navigation-button hidden md:flex absolute right-4 xl:right-8 top-1/2 transform -translate-y-1/2 z-50 p-4 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-2xl border border-gray-200 dark:border-gray-600 transition-all hover:scale-110 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 backdrop-blur-sm"
                        title="Próximo evento"
                        disabled={isAnimating}
                    >
                        <FaChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Container principal do modal com Swiper */}
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
            >
                {/* Header do modal */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center z-30">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentEvento?.data && (
                            <p className="text-lg text-primary font-medium">
                                {formatarData(currentEvento.data)}
                            </p>
                        )}
                        {/* Debug info - você pode remover depois
                        <p className="text-xs text-gray-500 mt-1">
                            Slide: {currentSlideIndex + 1} de {eventos.length} | 
                            Evento: {currentEvento.title}
                        </p> */}
                    </h2>

                    <div className="flex items-center gap-2">
                        {/* BOTÃO DO CALENDÁRIO COM DROPDOWN */}
                        <div
                            ref={calendarRef}
                            className="relative calendar-button"
                            onMouseEnter={handleCalendarMouseEnter}
                            onMouseLeave={handleCalendarMouseLeave}
                        >
                            <button
                                onClick={handleCalendarClick}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Adicionar ao calendário"
                                disabled={isAnimating}
                            >
                                <span className="text-xl">📅</span>
                            </button>

                            {showCalendarOptions && (
                                <div
                                    className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 py-2"
                                    onMouseEnter={handleCalendarMouseEnter}
                                    onMouseLeave={handleCalendarMouseLeave}
                                >
                                    <a
                                        href={generateCalendarLinks().google}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                                        onClick={() => setShowCalendarOptions(false)}
                                    >
                                        <span className="text-red-500 text-lg">📅</span>
                                        <div>
                                            <div className="font-medium">Google Calendar</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Abrir no navegador</div>
                                        </div>
                                    </a>

                                    <a
                                        href={generateCalendarLinks().outlook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                                        onClick={() => setShowCalendarOptions(false)}
                                    >
                                        <span className="text-blue-500 text-lg">📧</span>
                                        <div>
                                            <div className="font-medium">Outlook Calendar</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Abrir no navegador</div>
                                        </div>
                                    </a>

                                    <a
                                        href={generateCalendarLinks().yahoo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                                        onClick={() => setShowCalendarOptions(false)}
                                    >
                                        <span className="text-purple-500 text-lg">🌈</span>
                                        <div>
                                            <div className="font-medium">Yahoo Calendar</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Abrir no navegador</div>
                                        </div>
                                    </a>

                                    <button
                                        onClick={handleICSDownload}
                                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-sm"
                                    >
                                        <span className="text-gray-500 text-lg">💾</span>
                                        <div>
                                            <div className="font-medium">Baixar .ics</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Para qualquer app de calendário</div>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Botão de compartilhar */}
                        <div className="relative">
                            <button
                                onClick={handleShare}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Compartilhar evento"
                                disabled={isAnimating}
                            >
                                <FaShareAlt className="w-5 h-5" />
                            </button>

                            {showShareTooltip && (
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                                    Link copiado!
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                                </div>
                            )}
                        </div>

                        {/* Botão fechar */}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            disabled={isAnimating}
                        >
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* SWIPER - CORRIGIDO: usa initialSlide baseado no evento recebido */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    <Swiper
                        ref={swiperRef}
                        modules={[Navigation, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={false}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true
                        }}
                        speed={300}
                        initialSlide={currentSlideIndex} // CORREÇÃO: usa o índice correto
                        onSlideChange={handleSlideChange}
                        className="eventos-modal-swiper"
                    >
                        {eventos.map((evento, index) => (
                            <SwiperSlide key={evento._id}>
                                <div className="p-6">
                                    {/* Imagem do evento */}
                                    {evento.image && (
                                        <div className="relative h-64 md:h-80 w-full mb-6 rounded-xl overflow-hidden">
                                            <Image
                                                src={evento.image}
                                                alt={evento.title}
                                                fill
                                                className="object-cover"
                                                priority={index === currentSlideIndex}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-[48px_1fr] items-center gap-4 mb-6">
  {evento.icon && (
    <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20">
      {/* forçar tamanho no StarFavorite; se o componente não aceitar className, ajuste dentro dele */}
      <StarFavorite id={evento._id} className="w-6 h-6" />
    </div>
  )}

  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
    {evento.title}
  </h1>
</div>


                                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {evento.descp}
                                    </p>

                                    {/* Detalhes do evento */}
                                    <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-primary/5 dark:from-gray-700 dark:to-primary/10 rounded-lg border border-gray-200 dark:border-gray-600">
                                        {/* <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                                            Detalhes do Evento
                                        </h3> */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">📍 Localização:</p>
                                                    <p className="text-gray-600 dark:text-gray-300">
                                                        {evento.localizacao || "Zona Sul, Rio de Janeiro"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">🎵 Estilo Musical:</p>
                                                    <p className="text-gray-600 dark:text-gray-300">
                                                        {evento.estiloMusical || "Funk, Sertanejo, Pop"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">⭐ Destaque:</p>
                                                    <p className="text-gray-600 dark:text-gray-300">
                                                        {evento.destaque || "Open Bar & Área Vip"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">🕒 Horário:</p>
                                                    <p className="text-gray-600 dark:text-gray-300">
                                                        {evento.horario || "22h - Até o Amanhecer"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="mt-8">
                                        <a
                                            href={evento.whatsappLink || "https://chat.whatsapp.com/HO94jLtkcWR8TUTWiyk1WB?mode=hqrt3"}
                                            className="inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <FaWhatsapp className="w-6 h-6" />
                                            Entrar no Grupo do WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Indicadores de navegação mobile */}
                {eventos.length > 1 && (
                    <div className="md:hidden flex justify-center items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => handleNavigation('prev')}
                            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full disabled:opacity-30 transition-all"
                            disabled={!hasPrevious || isAnimating}
                        >
                            <FaChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex gap-1 mx-4">
                            {eventos.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all ${currentSlideIndex === index
                                        ? 'bg-primary'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => handleNavigation('next')}
                            className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full disabled:opacity-30 transition-all"
                            disabled={!hasNext || isAnimating}
                        >
                            <FaChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Estilos customizados para o Swiper */}
            <style jsx global>{`
                .eventos-modal-swiper {
                    padding: 0px 0px 40px;
                }
                
                .eventos-modal-swiper .swiper-slide {
                    height: auto;
                }
                
                .eventos-modal-swiper .swiper-button-next,
                .eventos-modal-swiper .swiper-button-prev {
                    display: none !important;
                }
                
                .eventos-modal-swiper .swiper-pagination-bullet {
                    background: #9CA3AF;
                    opacity: 0.5;
                }
                
                .eventos-modal-swiper .swiper-pagination-bullet-active {
                    background: #3B82F6;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default EventoModal;