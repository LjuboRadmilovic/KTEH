import './Pagination.css';

interface PaginationProps {
  strana: number;
  ukupnoStrana: number;
  onPromena: (strana: number) => void;
}

/** Brojevi strana sa skracivanjem kad ih ima previse. Koristi se na Nivoima i u Istoriji. */
export default function Pagination({ strana, ukupnoStrana, onPromena }: PaginationProps) {
  if (ukupnoStrana <= 1) return null;

  const brojevi: (number | 'razmak')[] = [];
  const dodaj = (broj: number) => {
    if (!brojevi.includes(broj)) brojevi.push(broj);
  };

  dodaj(1);
  if (strana - 1 > 2) brojevi.push('razmak');
  for (let i = Math.max(2, strana - 1); i <= Math.min(ukupnoStrana - 1, strana + 1); i += 1) dodaj(i);
  if (strana + 1 < ukupnoStrana - 1) brojevi.push('razmak');
  if (ukupnoStrana > 1) dodaj(ukupnoStrana);

  return (
    <nav className="paginacija" aria-label="Strane">
      <button
        type="button"
        className="paginacija__strelica"
        onClick={() => onPromena(strana - 1)}
        disabled={strana <= 1}
        aria-label="Prethodna strana"
      >
        ‹
      </button>

      {brojevi.map((stavka, redosled) =>
        stavka === 'razmak' ? (
          <span className="paginacija__razmak" key={`razmak-${redosled}`} aria-hidden="true">…</span>
        ) : (
          <button
            type="button"
            key={stavka}
            className={`paginacija__broj ${stavka === strana ? 'paginacija__broj--aktivan' : ''}`}
            onClick={() => onPromena(stavka)}
            aria-current={stavka === strana ? 'page' : undefined}
          >
            {stavka}
          </button>
        ),
      )}

      <button
        type="button"
        className="paginacija__strelica"
        onClick={() => onPromena(strana + 1)}
        disabled={strana >= ukupnoStrana}
        aria-label="Sledeća strana"
      >
        ›
      </button>
    </nav>
  );
}
