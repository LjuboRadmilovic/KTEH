import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import FilterBar from '../components/FilterBar';
import type { GrupaFiltera } from '../components/FilterBar';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { istorijaPartija } from '../models/MatchHistoryService';
import { formatirajVreme, ucitajPodatke } from '../models/podaci';
import type { PaketiPodaci, Partija } from '../models/types';
import './History.css';

const PO_STRANI = 8;

type NacinSortiranja = 'najnovije' | 'najstarije' | 'najbrze' | 'najviseParova';

export default function History() {
  const [partije, postaviPartije] = useState<Partija[]>([]);
  const [podaci, postaviPodatke] = useState<PaketiPodaci | null>(null);

  const [paket, postaviPaket] = useState('sve');
  const [ishod, postaviIshod] = useState('sve');
  const [tezina, postaviTezinu] = useState('sve');
  const [sortiranje, postaviSortiranje] = useState<NacinSortiranja>('najnovije');
  const [strana, postaviStranu] = useState(1);

  useEffect(() => {
    postaviPartije(istorijaPartija.sve());
    ucitajPodatke().then(postaviPodatke).catch(() => postaviPodatke(null));
  }, []);

  const nazivPaketa = useCallback(
    (id: string) => podaci?.paketi.find((p) => p.id === id)?.naziv ?? id,
    [podaci],
  );

  const filtrirane = useMemo(() => {
    const izabrane = partije.filter((partija) => {
      if (paket !== 'sve' && partija.paketId !== paket) return false;
      if (tezina !== 'sve' && partija.tezina !== tezina) return false;
      if (ishod === 'pobeda' && partija.nereseno) return false;
      if (ishod === 'nereseno' && !partija.nereseno) return false;
      return true;
    });

    const poredjenje: Record<NacinSortiranja, (a: Partija, b: Partija) => number> = {
      najnovije: (a, b) => b.odigrana.localeCompare(a.odigrana),
      najstarije: (a, b) => a.odigrana.localeCompare(b.odigrana),
      najbrze: (a, b) => a.trajanjeSek - b.trajanjeSek,
      najviseParova: (a, b) =>
        b.igraci.reduce((z, i) => z + i.pogodaka, 0) - a.igraci.reduce((z, i) => z + i.pogodaka, 0),
    };

    return [...izabrane].sort(poredjenje[sortiranje]);
  }, [partije, paket, tezina, ishod, sortiranje]);

  const ukupnoStrana = Math.max(1, Math.ceil(filtrirane.length / PO_STRANI));
  const trenutnaStrana = Math.min(strana, ukupnoStrana);
  const naStrani = filtrirane.slice((trenutnaStrana - 1) * PO_STRANI, trenutnaStrana * PO_STRANI);

  function promeniFilter(kljuc: string, vrednost: string) {
    if (kljuc === 'paket') postaviPaket(vrednost);
    if (kljuc === 'ishod') postaviIshod(vrednost);
    if (kljuc === 'tezina') postaviTezinu(vrednost);
    postaviStranu(1);
  }

  function ponistiSve() {
    postaviPaket('sve');
    postaviIshod('sve');
    postaviTezinu('sve');
    postaviStranu(1);
  }

  function obrisiIstoriju() {
    istorijaPartija.obrisiSve();
    postaviPartije([]);
    postaviStranu(1);
  }

  const grupe: GrupaFiltera[] = [
    {
      kljuc: 'paket',
      naziv: 'Paket',
      izabrano: paket,
      opcije: [
        { vrednost: 'sve', naziv: 'Svi' },
        ...(podaci?.paketi.map((p) => ({ vrednost: p.id, naziv: `${p.emoji} ${p.naziv}`, boja: p.boja })) ?? []),
      ],
    },
    {
      kljuc: 'tezina',
      naziv: 'Težina',
      izabrano: tezina,
      opcije: [
        { vrednost: 'sve', naziv: 'Sve' },
        ...(podaci?.tezine.map((t) => ({ vrednost: t.kod, naziv: t.naziv, boja: t.boja })) ?? []),
      ],
    },
    {
      kljuc: 'ishod',
      naziv: 'Ishod',
      izabrano: ishod,
      opcije: [
        { vrednost: 'sve', naziv: 'Svi' },
        { vrednost: 'pobeda', naziv: 'Sa pobednikom' },
        { vrednost: 'nereseno', naziv: 'Nerešeno' },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        nadnaslov="Istorija"
        naslov="Istorija partija"
        opis="Sve odigrane partije, sačuvane u ovom pregledaču. Filtriraj po paketu, težini i ishodu, ili promeni redosled."
      />

      {partije.length === 0 ? (
        <div className="prazno">
          Još nema odigranih partija.{' '}
          <Link to="/nivoi">Izaberi nivo</Link> i odigraj prvu.
        </div>
      ) : (
        <>
          <FilterBar
            grupe={grupe}
            onPromena={promeniFilter}
            onPonisti={ponistiSve}
            brojRezultata={filtrirane.length}
          />

          <div className="istorija__alatke">
            <div className="istorija__sortiranje">
              <label htmlFor="sortiranje" className="filteri__naziv">Redosled</label>
              <select
                id="sortiranje"
                className="istorija__izbor"
                value={sortiranje}
                onChange={(d) => {
                  postaviSortiranje(d.target.value as NacinSortiranja);
                  postaviStranu(1);
                }}
              >
                <option value="najnovije">Najnovije prvo</option>
                <option value="najstarije">Najstarije prvo</option>
                <option value="najbrze">Najbrže partije</option>
                <option value="najviseParova">Najviše pogođenih parova</option>
              </select>
            </div>

            <Button vrsta="opasno" velicina="malo" onClick={obrisiIstoriju}>
              Obriši istoriju
            </Button>
          </div>

          <div className="istorija__tabela-omotac">
            <table className="istorija__tabela">
              <thead>
                <tr>
                  <th>Nivo</th>
                  <th>Paket</th>
                  <th>Ishod</th>
                  <th>Rezultat</th>
                  <th>Trajanje</th>
                  <th>Poteza</th>
                  <th>Odigrana</th>
                </tr>
              </thead>
              <tbody>
                {naStrani.map((partija) => (
                  <tr key={partija.id}>
                    <td><Link to={`/nivoi/${partija.nivoId}`}>{partija.nivoNaziv}</Link></td>
                    <td>{nazivPaketa(partija.paketId)}</td>
                    <td>
                      {partija.nereseno ? (
                        <span className="ishod ishod--nereseno">nerešeno</span>
                      ) : (
                        <span className="ishod ishod--pobeda">
                          {partija.igraci[partija.pobednikIndeks ?? 0]?.ime}
                        </span>
                      )}
                    </td>
                    <td className="istorija__brojevi">
                      {partija.igraci.map((i) => i.pogodaka).join(' : ')}
                    </td>
                    <td className="istorija__brojevi">{formatirajVreme(partija.trajanjeSek)}</td>
                    <td className="istorija__brojevi">{partija.ukupnoPoteza}</td>
                    <td className="istorija__brojevi">
                      {new Date(partija.odigrana).toLocaleString('sr-RS', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            strana={trenutnaStrana}
            ukupnoStrana={ukupnoStrana}
            onPromena={(nova) => {
              postaviStranu(nova);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </>
  );
}
