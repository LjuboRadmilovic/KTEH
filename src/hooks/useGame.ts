import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MemoryGame } from '../models/MemoryGame';
import { napraviIzvor, napraviRezervniIzvor } from '../models/decks/izvori';
import { nadjiNivo, nadjiPaket, ucitajPodatke } from '../models/podaci';
import type { Nivo, Paket, Partija, Pojam, PravilaIgre } from '../models/types';

/**
 * Spaja klasu MemoryGame sa React-om.
 *
 * Klasa menja svoje stanje u mestu, pa se posle svakog poziva podize brojac
 * "verzija". To je znak React-u da ponovo iscrta tablu.
 */
export function useGame(nivoId: string | undefined) {
  const igraRef = useRef<MemoryGame | null>(null);
  const [verzija, postaviVerziju] = useState(0);

  const [nivo, postaviNivo] = useState<Nivo | null>(null);
  const [paket, postaviPaket] = useState<Paket | null>(null);
  const [pravila, postaviPravila] = useState<PravilaIgre | null>(null);

  const [izvorPojmova, postaviIzvorPojmova] = useState('');
  const [koriscenaRezerva, postaviKoriscenuRezervu] = useState(false);

  const [ucitavanje, postaviUcitavanje] = useState(true);
  const [greska, postaviGresku] = useState<string | null>(null);
  const [pokrenuta, postaviPokrenutu] = useState(false);
  const [sekundi, postaviSekunde] = useState(0);

  const osvezi = useCallback(() => postaviVerziju((v) => v + 1), []);

  /* --- podaci o nivou --- */
  useEffect(() => {
    let otkazano = false;

    if (!nivoId) {
      postaviGresku('Nije izabran nivo.');
      postaviUcitavanje(false);
      return;
    }

    postaviUcitavanje(true);
    postaviGresku(null);

    ucitajPodatke()
      .then((podaci) => {
        if (otkazano) return;

        const nadjenNivo = nadjiNivo(podaci, nivoId);
        if (!nadjenNivo) throw new Error(`Nivo "${nivoId}" ne postoji.`);

        const nadjenPaket = nadjiPaket(podaci, nadjenNivo.paket);
        if (!nadjenPaket) throw new Error(`Paket "${nadjenNivo.paket}" ne postoji.`);

        postaviNivo(nadjenNivo);
        postaviPaket(nadjenPaket);
        postaviPravila(podaci.pravila);
        postaviUcitavanje(false);
      })
      .catch((problem: Error) => {
        if (otkazano) return;
        postaviGresku(problem.message);
        postaviUcitavanje(false);
      });

    return () => {
      otkazano = true;
    };
  }, [nivoId]);

  /* --- pokretanje partije --- */
  const zapocni = useCallback(
    async (imenaIgraca: string[]) => {
      if (!nivo || !paket) return;

      postaviUcitavanje(true);
      postaviGresku(null);
      postaviKoriscenuRezervu(false);

      let pojmovi: Pojam[] = [];
      let naziv = '';

      try {
        const izvor = napraviIzvor(paket);
        pojmovi = await izvor.ucitajPojmove(nivo.parova);
        naziv = izvor.nazivIzvora;
      } catch {
        // API nije odgovorio, pa partija ide sa pojmovima iz lokalnog JSON-a
        try {
          const rezerva = napraviRezervniIzvor(paket);
          pojmovi = await rezerva.ucitajPojmove(nivo.parova);
          naziv = rezerva.nazivIzvora;
          postaviKoriscenuRezervu(true);
        } catch (problem) {
          postaviGresku((problem as Error).message);
          postaviUcitavanje(false);
          return;
        }
      }

      const igra = new MemoryGame({
        pogodakDajeNoviPotez: pravila?.pogodakDajeNoviPotez ?? true,
      });
      igra.zapocni(MemoryGame.napraviKarte(pojmovi), imenaIgraca);

      igraRef.current = igra;
      postaviIzvorPojmova(naziv);
      postaviSekunde(0);
      postaviPokrenutu(true);
      postaviUcitavanje(false);
      osvezi();
    },
    [nivo, paket, pravila, osvezi],
  );

  const igra = igraRef.current;
  const stanje = igra?.stanje() ?? 'priprema';
  const jeKraj = igra?.jeKraj() ?? false;

  /* --- tajmer --- */
  useEffect(() => {
    if (!pokrenuta || jeKraj) return;
    const interval = window.setInterval(() => postaviSekunde((s) => s + 1), 1000);
    return () => window.clearInterval(interval);
  }, [pokrenuta, jeKraj]);

  /* --- vracanje neuparenih karata posle pauze --- */
  const zakljucana = igra?.jeZakljucana() ?? false;

  useEffect(() => {
    if (!zakljucana || !igraRef.current) return;

    const pauza = pravila?.vracanjeKarticaMs ?? 800;
    const cekanje = window.setTimeout(() => {
      igraRef.current?.zatvoriNeuparene();
      osvezi();
    }, pauza);

    return () => window.clearTimeout(cekanje);
  }, [zakljucana, verzija, pravila, osvezi]);

  const okreni = useCallback(
    (idKarte: string) => {
      if (!igraRef.current) return;
      if (igraRef.current.okreni(idKarte)) osvezi();
    },
    [osvezi],
  );

  /* --- zapis partije za ekran rezultata --- */
  const partija = useMemo<Partija | null>(() => {
    if (!igra || !jeKraj || !nivo) return null;

    const pobednikIndeks = igra.pobednik();

    return {
      id: `${nivo.id}-${Date.now()}`,
      nivoId: nivo.id,
      nivoNaziv: nivo.naziv,
      paketId: nivo.paket,
      tezina: nivo.tezina,
      igraci: igra.rezultati(),
      pobednikIndeks,
      nereseno: pobednikIndeks === null,
      trajanjeSek: sekundi,
      ukupnoPoteza: igra.ukupnoPoteza(),
      odigrana: new Date().toISOString(),
    };
    // verzija je namerno u zavisnostima: klasa menja stanje u mestu, pa je
    // brojac jedini znak da su rezultati novi
  }, [igra, jeKraj, nivo, sekundi, verzija]);

  return {
    nivo,
    paket,
    izvorPojmova,
    koriscenaRezerva,
    ucitavanje,
    greska,
    pokrenuta,
    sekundi,
    stanje,
    zakljucana,
    jeKraj,
    partija,
    karte: igra?.karte() ?? [],
    rezultati: igra?.rezultati() ?? [],
    naPotezu: igra?.naPotezu() ?? 0,
    zapocni,
    okreni,
  };
}
