// ./src/app/components/home/Evento/StarFavorite.tsx
"use client";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

export default function StarFavorite({ id }: { id: string }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <button
      onClick={handleClick}
      className="transition-transform active:scale-95"
    >
      <Star
        size={28}
        className={
          isFavorite(id)
            ? "fill-yellow-400 stroke-yellow-400"
            : "stroke-yellow-400"
        }
      />
    </button>
  );
}