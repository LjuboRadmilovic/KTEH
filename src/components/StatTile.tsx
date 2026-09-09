import './StatTile.css';

interface StatTileProps {
  vrednost: string | number;
  oznaka: string;
  boja?: string;
  opis?: string;
}

/** Plocica sa jednim brojem. Koristi se na pocetnoj, statistici i profilu. */
export default function StatTile({ vrednost, oznaka, boja, opis }: StatTileProps) {
  return (
    <div className="plocica">
      <span className="plocica__vrednost" style={boja ? { color: boja } : undefined}>{vrednost}</span>
      <span className="plocica__oznaka">{oznaka}</span>
      {opis ? <span className="plocica__opis">{opis}</span> : null}
    </div>
  );
}
