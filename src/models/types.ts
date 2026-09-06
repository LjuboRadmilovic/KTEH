/* ============================================================
   Tipovi podataka aplikacije.
   Prvi deo prati oblik fajla public/podaci/classic-pack.json,
   drugi deo opisuje tok jedne partije.
   ============================================================ */

/* ---------- podaci iz JSON fajla ---------- */

export type KodTezine = 'lako' | 'srednje' | 'tesko';

export interface Tezina {
  kod: KodTezine;
  naziv: string;
  boja: string;
}

export type TipIzvora = 'api' | 'json';

export interface IzvorPaketa {
  tip: TipIzvora;
  naziv: string;
  url?: string;
  kljucNijePotreban?: boolean;
}

/** Jedan pojam na kartici — ili emodzi, ili slika sa API-ja. */
export interface Pojam {
  id: string;
  naziv: string;
  emoji?: string;
  slika?: string;
}

export interface Paket {
  id: string;
  naziv: string;
  opis: string;
  emoji: string;
  boja: string;
  izvor: IzvorPaketa;
  rezervniPojmovi: Pojam[];
}

export interface DimenzijeTable {
  kolone: number;
  redovi: number;
}

export interface Nivo {
  id: string;
  naziv: string;
  paket: string;
  tabla: DimenzijeTable;
  parova: number;
  tezina: KodTezine;
  zakljucan: boolean;
  otkljucavaSe: string | null;
  procenjenoTrajanjeSek: number;
}

export interface PravilaIgre {
  vracanjeKarticaMs: number;
  pogodakDajeNoviPotez: boolean;
  brojIgraca: number;
  mesanje: string;
}

export interface PaketiPodaci {
  verzija: string;
  naziv: string;
  opis: string;
  pravila: PravilaIgre;
  tezine: Tezina[];
  paketi: Paket[];
  nivoi: Nivo[];
}

/* ---------- tok partije ---------- */

export interface Karta {
  /** jedinstven u okviru table (isti pojam se pojavljuje dva puta) */
  id: string;
  pojamId: string;
  naziv: string;
  emoji?: string;
  slika?: string;
  okrenuta: boolean;
  uparena: boolean;
  /** redni broj igraca koji je upario, ili null */
  uparioIgrac: number | null;
}

export type StanjeIgre = 'priprema' | 'ucitavanje' | 'igra' | 'kraj' | 'greska';

export interface RezultatIgraca {
  redniBroj: number;
  ime: string;
  pogodaka: number;
  poteza: number;
}

export interface Partija {
  id: string;
  nivoId: string;
  nivoNaziv: string;
  paketId: string;
  tezina: KodTezine;
  igraci: RezultatIgraca[];
  /** indeks pobednika u nizu igraca, ili null kad je nereseno */
  pobednikIndeks: number | null;
  nereseno: boolean;
  trajanjeSek: number;
  ukupnoPoteza: number;
  /** ISO datum i vreme zavrsetka */
  odigrana: string;
}

/* ---------- korisnik ---------- */

export interface Korisnik {
  korisnickoIme: string;
  email: string;
  prikaznoIme: string;
  registrovan: string;
}
