import type { Karta } from '../models/types';
import './MemoryCard.css';

interface MemoryCardProps {
  karta: Karta;
  onKlik: (idKarte: string) => void;
  onemoguceno: boolean;
}

/** Jedna kartica na tabli. Okrece se u 3D-u kad je otvorena. */
export default function MemoryCard({ karta, onKlik, onemoguceno }: MemoryCardProps) {
  const otvorena = karta.okrenuta || karta.uparena;

  const klase = [
    'kartica',
    otvorena ? 'kartica--otvorena' : '',
    karta.uparena ? 'kartica--uparena' : '',
    karta.uparioIgrac === 0 ? 'kartica--igrac-prvi' : '',
    karta.uparioIgrac === 1 ? 'kartica--igrac-drugi' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={klase}
      onClick={() => onKlik(karta.id)}
      disabled={onemoguceno || otvorena}
      aria-label={otvorena ? karta.naziv : 'Zatvorena kartica'}
    >
      <span className="kartica__unutra">
        <span className="kartica__lice kartica__lice--nazad" aria-hidden="true">?</span>
        <span className="kartica__lice kartica__lice--napred">
          {karta.slika ? (
            <img className="kartica__slika" src={karta.slika} alt={karta.naziv} loading="lazy" />
          ) : (
            <span className="kartica__emoji" aria-hidden="true">{karta.emoji ?? '🂠'}</span>
          )}
          <span className="kartica__naziv">{karta.naziv}</span>
        </span>
      </span>
    </button>
  );
}
