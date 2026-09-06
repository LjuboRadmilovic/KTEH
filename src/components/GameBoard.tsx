import MemoryCard from './MemoryCard';
import type { Karta } from '../models/types';
import './GameBoard.css';

interface GameBoardProps {
  karte: Karta[];
  kolone: number;
  zakljucana: boolean;
  onOkreni: (idKarte: string) => void;
}

/** Tabla — mreza kartica, broj kolona dolazi iz nivoa (4, 6 ili 8). */
export default function GameBoard({ karte, kolone, zakljucana, onOkreni }: GameBoardProps) {
  return (
    <div
      className="tabla"
      style={{
        ['--kolone' as string]: kolone,
        // veca tabla -> manja kartica, da 8x8 stane na ekran bez skrolovanja
        ['--osnova-kartice' as string]: `${kolone >= 8 ? 100 : kolone >= 6 ? 112 : 118}px`,
      }}
      role="grid"
      aria-label={`Tabla ${kolone} sa ${kolone}`}
    >
      {karte.map((karta) => (
        <MemoryCard key={karta.id} karta={karta} onKlik={onOkreni} onemoguceno={zakljucana} />
      ))}
    </div>
  );
}
