import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterBar from '../components/FilterBar';
import type { GrupaFiltera } from '../components/FilterBar';
import LevelCard from '../components/LevelCard';
import Loader from '../components/Loader';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { istorijaPartija } from '../models/MatchHistoryService';
import { nadjiNivo, ucitajPodatke } from '../models/podaci';
import type { PaketiPodaci } from '../models/types';
import './Levels.css';

const PO_STRANI = 6;

export default function Levels() {
  const [podaci, postaviPodatke] = useState<PaketiPodaci | null>(null);
  const [greska, postaviGresku] = useState<string | null>(null);

  // useSearchParams: filteri i strana stoje u adresi, pa dugme „nazad" radi
  // i link sa filterom moze da se posalje nekome
  const [parametri, postaviParametre] = useSearchParams();

  const tezina = parametri.get('tezina') ?? 'sve';
  const paket = parametri.get('paket') ?? 'sve';
  const strana = Number.parseInt(parametri.get('strana') ?? '1', 10) || 1;

  useEffect(() => {
    ucitajPodatke()
      .then(postaviPodatke)
      .catch((problem: Error) => postaviGresku(problem.message));
  }, []);

  const odigraniNivoi = useMemo(() => {
    const partije = istorijaPartija.sve();
    return new Set(partije.map((partija) => partija.nivoId));
  }, []);

  const filtrirani = useMemo(() => {
    if (!podaci) return [];
    return podaci.nivoi.filter((nivo) => {
      if (tezina !== 'sve' && nivo.tezina !== tezina) return false;
      if (paket !== 'sve' && nivo.paket !== paket) return false;
      return true;
    });
  }, [podaci, tezina, paket]);

  const ukupnoStrana = Math.max(1, Math.ceil(filtrirani.length / PO_STRANI));
  const trenutnaStrana = Math.min(strana, ukupnoStrana);
  const naStrani = filtrirani.slice((trenutnaStrana - 1) * PO_STRANI, trenutnaStrana * PO_STRANI);

  function promeniFilter(kljuc: string, vrednost: string) {
    const novi = new URLSearchParams(parametri);
    if (vrednost === 'sve') novi.delete(kljuc);
    else novi.set(kljuc, vrednost);
    novi.delete('strana');
    postaviParametre(novi);
  }

  function promeniStranu(nova: number) {
    const novi = new URLSearchParams(parametri);
    if (nova <= 1) novi.delete('strana');
    else novi.set('strana', String(nova));
    postaviParametre(novi);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (greska) return <div className="prazno">{greska}</div>;
  if (!podaci) return <Loader poruka="Učitavam nivoe…" />;

  const grupe: GrupaFiltera[] = [
    {
      kljuc: 'tezina',
      naziv: 'Težina',
      izabrano: tezina,
      opcije: [
        { vrednost: 'sve', naziv: 'Sve' },
        ...podaci.tezine.map((t) => ({ vrednost: t.kod, naziv: t.naziv, boja: t.boja })),
      ],
    },
    {
      kljuc: 'paket',
      naziv: 'Paket',
      izabrano: paket,
      opcije: [
        { vrednost: 'sve', naziv: 'Svi' },
        ...podaci.paketi.map((p) => ({ vrednost: p.id, naziv: `${p.emoji} ${p.naziv}`, boja: p.boja })),
      ],
    },
  ];

  return (
    <>
      <PageHeader
        nadnaslov="Nivoi"
        naslov="Spisak nivoa"
        opis="Osamnaest nivoa kroz šest paketa pojmova i tri težine. Teži nivoi se otključavaju kad odigraš lakši iz istog paketa."
      />

      <FilterBar
        grupe={grupe}
        onPromena={promeniFilter}
        onPonisti={() => postaviParametre(new URLSearchParams())}
        brojRezultata={filtrirani.length}
      />

      {naStrani.length === 0 ? (
        <div className="prazno">Nijedan nivo ne odgovara izabranim filterima.</div>
      ) : (
        <div className="nivoi__mreza">
          {naStrani.map((nivo) => {
            const paketNivoa = podaci.paketi.find((p) => p.id === nivo.paket);
            const tezinaNivoa = podaci.tezine.find((t) => t.kod === nivo.tezina);
            const otkljucan = !nivo.zakljucan || (nivo.otkljucavaSe ? odigraniNivoi.has(nivo.otkljucavaSe) : true);
            const preduslov = nivo.otkljucavaSe ? nadjiNivo(podaci, nivo.otkljucavaSe) : undefined;

            if (!paketNivoa) return null;

            return (
              <LevelCard
                key={nivo.id}
                nivo={nivo}
                paket={paketNivoa}
                tezina={tezinaNivoa}
                otkljucan={otkljucan}
                odigran={odigraniNivoi.has(nivo.id)}
                nazivNivoaZaOtkljucavanje={preduslov?.naziv}
              />
            );
          })}
        </div>
      )}

      <Pagination strana={trenutnaStrana} ukupnoStrana={ukupnoStrana} onPromena={promeniStranu} />
    </>
  );
}
