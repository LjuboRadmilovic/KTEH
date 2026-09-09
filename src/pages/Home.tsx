import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import LevelCard from '../components/LevelCard';
import StatTile from '../components/StatTile';
import { useAuth } from '../context/AuthContext';
import { istorijaPartija } from '../models/MatchHistoryService';
import { formatirajVreme, ucitajPodatke } from '../models/podaci';
import type { PaketiPodaci } from '../models/types';
import './Home.css';

const ODLIKE = [
  {
    ikona: '👥',
    naslov: 'Dva igrača',
    opis: 'Naizmenični potezi, poseban brojač pogodaka za svakog igrača i tajmer partije.',
  },
  {
    ikona: '🗂️',
    naslov: 'Šest paketa pojmova',
    opis: 'Psi, Pokemoni i zastave stižu sa javnih API-ja, a preostala tri paketa iz lokalnog JSON fajla.',
  },
  {
    ikona: '📊',
    naslov: 'Statistika partija',
    opis: 'Svaka odigrana partija se pamti, pa se rezultati prikazuju kroz grafikone.',
  },
];

export default function Home() {
  const { korisnik, prijavljen } = useAuth();
  const [podaci, postaviPodatke] = useState<PaketiPodaci | null>(null);

  useEffect(() => {
    ucitajPodatke().then(postaviPodatke).catch(() => postaviPodatke(null));
  }, []);

  const partije = useMemo(() => istorijaPartija.sve(), []);
  const sazetak = useMemo(() => istorijaPartija.sazetak(), []);
  const poslednja = partije[0] ?? null;

  const preporuceni = useMemo(() => {
    if (!podaci) return [];
    return podaci.nivoi.filter((nivo) => !nivo.zakljucan).slice(0, 3);
  }, [podaci]);

  return (
    <>
      {prijavljen ? (
        <div className="pocetna__nastavak">
          <div>
            <div className="pocetna__pozdrav">Zdravo, {korisnik?.prikaznoIme}.</div>
            <div className="pocetna__poslednja">
              {poslednja
                ? `Poslednja partija: ${poslednja.nivoNaziv} · ${
                    poslednja.nereseno
                      ? 'nerešeno'
                      : `pobedio ${poslednja.igraci[poslednja.pobednikIndeks ?? 0]?.ime}`
                  } · ${formatirajVreme(poslednja.trajanjeSek)}`
                : 'Još nemaš odigranih partija.'}
            </div>
          </div>
          <Link to={poslednja ? `/igra/${poslednja.nivoId}` : '/nivoi'}>
            <Button vrsta="sekundarno">{poslednja ? 'Igraj ponovo' : 'Izaberi nivo'}</Button>
          </Link>
        </div>
      ) : null}

      <section className="pocetna__uvod">
        <div>
          <h1 className="pocetna__naslov">
            Igra memorije za <span>dva igrača</span>
          </h1>
          <p className="pocetna__opis">
            Okreni dve kartice. Ako se poklapaju, par je tvoj i igraš ponovo. Ako se ne
            poklapaju, kartice se vraćaju i potez preuzima protivnik.
          </p>
          <div className="pocetna__akcije">
            <Link to="/igra/zastave-4x4"><Button velicina="veliko">Brza partija</Button></Link>
            <Link to="/nivoi"><Button velicina="veliko" vrsta="sekundarno">Izaberi nivo</Button></Link>
          </div>
        </div>

        <div className="pocetna__vizual" aria-hidden="true">
          <div className="pocetna__karta pocetna__karta--otvorena">🐕</div>
          <div className="pocetna__karta">?</div>
          <div className="pocetna__karta pocetna__karta--tirkizna">⚡</div>
          <div className="pocetna__karta">?</div>
          <div className="pocetna__karta pocetna__karta--otvorena">🐕</div>
          <div className="pocetna__karta">?</div>
        </div>
      </section>

      {partije.length > 0 ? (
        <div className="pocetna__brojevi">
          <StatTile vrednost={sazetak.ukupnoPartija} oznaka="odigranih partija" />
          <StatTile vrednost={sazetak.ukupnoParova} oznaka="pogođenih parova" boja="#8B5CF6" />
          <StatTile vrednost={formatirajVreme(sazetak.prosecnoTrajanjeSek)} oznaka="prosečno trajanje" />
          <StatTile
            vrednost={sazetak.najbrzaPartija ? formatirajVreme(sazetak.najbrzaPartija.trajanjeSek) : '—'}
            oznaka="najbrža partija"
          />
        </div>
      ) : null}

      {preporuceni.length > 0 && podaci ? (
        <section style={{ marginBottom: 'var(--razmak-12)' }}>
          <h2 className="pocetna__naslov-odeljka">Počni odavde</h2>
          <div className="nivoi__mreza" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 'var(--razmak-5)' }}>
            {preporuceni.map((nivo) => {
              const paket = podaci.paketi.find((p) => p.id === nivo.paket);
              const tezina = podaci.tezine.find((t) => t.kod === nivo.tezina);
              if (!paket) return null;
              return (
                <LevelCard
                  key={nivo.id}
                  nivo={nivo}
                  paket={paket}
                  tezina={tezina}
                  otkljucan
                  odigran={partije.some((partija) => partija.nivoId === nivo.id)}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="pocetna__odlike">
        {ODLIKE.map((odlika) => (
          <article className="panel" key={odlika.naslov}>
            <span className="odlika__ikona" aria-hidden="true">{odlika.ikona}</span>
            <h3 className="odlika__naslov">{odlika.naslov}</h3>
            <p className="odlika__opis">{odlika.opis}</p>
          </article>
        ))}
      </section>
    </>
  );
}
