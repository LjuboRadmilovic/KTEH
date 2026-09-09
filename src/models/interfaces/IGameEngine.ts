import type { Karta, RezultatIgraca, StanjeIgre } from '../types';

/**
 * Ugovor za jezgro igre. Klasa MemoryGame ga implementira, a hook useGame
 * radi iskljucivo preko ovog interfejsa, pa se jezgro moze zameniti
 * (npr. varijantom za jednog igraca) bez diranja komponenti.
 */
export interface IGameEngine {
  /** Postavlja novu partiju: promesane karte i imena igraca. */
  zapocni(karte: Karta[], imenaIgraca: string[]): void;

  /** Okrece kartu. Vraca true ako je potez prihvacen. */
  okreni(idKarte: string): boolean;

  /** Vraca dve neuparene karte na lice nadole i predaje potez. */
  zatvoriNeuparene(): void;

  /** Redni broj igraca koji je trenutno na potezu (0 ili 1). */
  naPotezu(): number;

  /** Da li tabla trenutno ceka da se dve karte vrate. */
  jeZakljucana(): boolean;

  stanje(): StanjeIgre;
  karte(): Karta[];
  rezultati(): RezultatIgraca[];

  jeKraj(): boolean;

  /** Indeks pobednika, ili null kad je nereseno ili partija traje. */
  pobednik(): number | null;
}
