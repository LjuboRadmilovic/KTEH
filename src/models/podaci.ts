import type { Nivo, Paket, PaketiPodaci, Tezina } from './types';

const PUTANJA = '/podaci/classic-pack.json';

let kes: PaketiPodaci | null = null;
let uToku: Promise<PaketiPodaci> | null = null;

/**
 * Ucitava classic-pack.json jednom po ucitavanju stranice i pamti rezultat,
 * da svaka komponenta ne bi ponovo isla po isti fajl.
 */
export async function ucitajPodatke(): Promise<PaketiPodaci> {
  if (kes) return kes;
  if (uToku) return uToku;

  uToku = fetch(PUTANJA)
    .then((odgovor) => {
      if (!odgovor.ok) throw new Error(`Ne mogu da učitam podatke (${odgovor.status}).`);
      return odgovor.json() as Promise<PaketiPodaci>;
    })
    .then((podaci) => {
      kes = podaci;
      uToku = null;
      return podaci;
    })
    .catch((greska) => {
      uToku = null;
      throw greska;
    });

  return uToku;
}

export function nadjiNivo(podaci: PaketiPodaci, id: string): Nivo | undefined {
  return podaci.nivoi.find((nivo) => nivo.id === id);
}

export function nadjiPaket(podaci: PaketiPodaci, id: string): Paket | undefined {
  return podaci.paketi.find((paket) => paket.id === id);
}

export function nadjiTezinu(podaci: PaketiPodaci, kod: string): Tezina | undefined {
  return podaci.tezine.find((tezina) => tezina.kod === kod);
}

/** Sekunde u zapis oblika 3:07 */
export function formatirajVreme(sekundi: number): string {
  const minuti = Math.floor(sekundi / 60);
  const ostatak = sekundi % 60;
  return `${minuti}:${ostatak.toString().padStart(2, '0')}`;
}
