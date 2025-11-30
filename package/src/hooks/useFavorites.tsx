// ./src/hooks/useFavorites.ts
"use client";
import { useState, useEffect } from 'react';

export function useFavorites() {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    // Carrega os favoritos do localStorage quando o hook é inicializado
    useEffect(() => {
        const loadFavorites = () => {
            const favs = new Set<string>();
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('fav_')) {
                    const id = key.replace('fav_', '');
                    if (localStorage.getItem(key) === 'true') {
                        favs.add(id);
                    }
                }
            }
            setFavorites(favs);
        };

        loadFavorites();

        // Escuta mudanças no localStorage de outras abas/componentes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key?.startsWith('fav_')) {
                loadFavorites();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const toggleFavorite = (id: string) => {
        const nextValue = !favorites.has(id);
        
        if (nextValue) {
            favorites.add(id);
        } else {
            favorites.delete(id);
        }

        // Atualiza o estado local
        setFavorites(new Set(favorites));
        
        // Atualiza o localStorage
        localStorage.setItem(`fav_${id}`, String(nextValue));

        // Dispara um evento customizado para sincronizar outros componentes
        window.dispatchEvent(new StorageEvent('storage', {
            key: `fav_${id}`,
            newValue: String(nextValue)
        }));
    };

    const isFavorite = (id: string) => favorites.has(id);

    return {
        favorites,
        toggleFavorite,
        isFavorite
    };
}