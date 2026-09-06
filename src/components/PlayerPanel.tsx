import type { RezultatIgraca } from '../models/types';
import './PlayerPanel.css';

interface PlayerPanelProps {
  igrac: RezultatIgraca;
  naPotezu: boolean;
  pobednik?: boolean;
}

/** Kartica jednog igraca — ime, pogoci, potezi i oznaka da je na potezu. */
export default function PlayerPanel({ igrac, naPotezu, pobednik = false }: PlayerPanelProps) {
  const klase = [
    'igrac',
    igrac.redniBroj === 0 ? 'igrac--prvi' : 'igrac--drugi',
    naPotezu ? 'igrac--na-potezu' : '',
    pobednik ? 'igrac--pobednik' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={klase}>
      <div className="igrac__zaglavlje">
        <span className="igrac__ime">{igrac.ime}</span>
        {naPotezu ? <span className="igrac__oznaka">na potezu</span> : null}
        {pobednik ? <span className="igrac__oznaka igrac__oznaka--pobednik">pobednik</span> : null}
      </div>
      <div className="igrac__brojevi">
        <span className="igrac__pogodaka">{igrac.pogodaka}</span>
        <span className="igrac__poteza">{igrac.poteza} poteza</span>
      </div>
    </div>
  );
}
