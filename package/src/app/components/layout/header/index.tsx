"use client";
import Image from "next/image"
import Logo from "./logo"
import Link from "next/link"
import MobileSidebar from "./MobileSidebar"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

const Header = () => {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    const isDocsPage = /^\/docs\/[^/]+$/.test(pathname);

    useEffect(() => {
        const controlHeader = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Rolando para baixo - esconde o header
                setIsHidden(true);
            } else if (currentScrollY < lastScrollY) {
                // Rolando para cima - mostra o header
                setIsHidden(false);
            }

            setLastScrollY(currentScrollY);
        };

        // Adiciona o event listener
        window.addEventListener('scroll', controlHeader, { passive: true });

        // Cleanup
        return () => window.removeEventListener('scroll', controlHeader);
    }, [lastScrollY]);

    return (
        <header className={`fixed top-0 z-50 w-full transform transition-transform duration-300 ease-in-out ${isHidden ? '-translate-y-full' : 'translate-y-0'
            }`}>
            <nav className="px-4 sm:px-8 py-4 sm:py-5 border-b border-smokyBlack/10 dark:border-white/10 shadow-header_shadow bg-white/80 dark:bg-smokyBlack/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <Logo />

                    <div className="flex items-center gap-3.5 sm:gap-5 lg:gap-7">
                        {/* <button className="hidden md:flex w-40 items-center gap-2.5 bg-paleSlate dark:bg-[#353535] px-2 py-1.5 rounded-xl border border-smokyBlack/10 dark:border-white/10 transition cursor-pointer hover:shadow-sm" onClick={() => setModalOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6" /></svg>
                            <span className="text-smokyBlack dark:text-white">Search</span>
                        </button> */}

                        <Link href={"https://chat.whatsapp.com/HO94jLtkcWR8TUTWiyk1WB?mode=hqrt3"}>
                            <span className="text-white font-bold"><FaWhatsapp className="w-8 h-8" /></span>
                        </Link>
                        {/* <ThemeToggler /> */}

                        {isDocsPage &&
                            <button className="flex md:hidden cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26"><rect width="18" height="1.5" x="3" y="7.001" fill="currentcolor" rx=".75" />
                                    <rect width="15" height="1.5" x="3" y="11.251" fill="currentcolor" rx=".75" />
                                    <rect width="18" height="1.5" x="3" y="15.499" fill="currentcolor" rx=".75" />
                                </svg>
                            </button>
                        }
                    </div>
                </div>
            </nav>
            <MobileSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
        </header>
    )
}

export default Header