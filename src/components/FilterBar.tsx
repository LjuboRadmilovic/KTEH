import './FilterBar.css';

export interface OpcijaFiltera {
  vrednost: string;
  naziv: string;
  boja?: string;
}

export interface GrupaFiltera {
  kljuc: string;
  naziv: string;
  opcije: OpcijaFiltera[];
  izabrano: string;
}

interface FilterBarProps {
  grupe: GrupaFiltera[];
  onPromena: (kljuc: string, vrednost: string) => void;
  onPonisti?: () => void;
  brojRezultata?: number;
}

/** Red filtera u obliku pilula. Koristi se na Nivoima i u Istoriji partija. */
export default function FilterBar({ grupe, onPromena, onPonisti, brojRezultata }: FilterBarProps) {
  const imaIzabranih = grupe.some((grupa) => grupa.izabrano !== 'sve');

  return (
    <div className="filteri">
      {grupe.map((grupa) => (
        <div className="filteri__grupa" key={grupa.kljuc}>
          <span className="filteri__naziv">{grupa.naziv}</span>
          <div className="filteri__pilule" role="group" aria-label={grupa.naziv}>
            {grupa.opcije.map((opcija) => {
              const aktivna = opcija.vrednost === grupa.izabrano;
              return (
                <button
                  type="button"
                  key={opcija.vrednost}
                  className={`pilula ${aktivna ? 'pilula--aktivna' : ''}`}
                  style={aktivna && opcija.boja ? { borderColor: opcija.boja, color: opcija.boja } : undefined}
                  onClick={() => onPromena(grupa.kljuc, opcija.vrednost)}
                  aria-pressed={aktivna}
                >
                  {opcija.naziv}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="filteri__dno">
        {typeof brojRezultata === 'number' ? (
          <span className="filteri__rezultat">{brojRezultata} rezultata</span>
        ) : null}
        {imaIzabranih && onPonisti ? (
          <button type="button" className="filteri__ponisti" onClick={onPonisti}>
            Poništi filtere
          </button>
        ) : null}
      </div>
    </div>
  );
}
