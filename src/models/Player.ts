import type { RezultatIgraca } from './types';

/**
 * Jedan igrac u partiji. Cuva svoje ime i brojace, i ne zna nista o tabli —
 * MemoryGame ga poziva kad treba da se zabelezi potez ili pogodak.
 */
export class Player {
  readonly redniBroj: number;
  ime: string;

  private brojPogodaka = 0;
  private brojPoteza = 0;

  constructor(redniBroj: number, ime: string) {
    this.redniBroj = redniBroj;
    this.ime = ime.trim() || `Igrač ${redniBroj + 1}`;
  }

  get pogodaka(): number {
    return this.brojPogodaka;
  }

  get poteza(): number {
    return this.brojPoteza;
  }

  /** Potez = otvoren par kartica, bez obzira na ishod. */
  zabeleziPotez(): void {
    this.brojPoteza += 1;
  }

  zabeleziPogodak(): void {
    this.brojPogodaka += 1;
  }

  /** Uspesnost u procentima — koristi se na stranici statistike. */
  uspesnost(): number {
    if (this.brojPoteza === 0) return 0;
    return Math.round((this.brojPogodaka / this.brojPoteza) * 100);
  }

  resetuj(): void {
    this.brojPogodaka = 0;
    this.brojPoteza = 0;
  }

  rezultat(): RezultatIgraca {
    return {
      redniBroj: this.redniBroj,
      ime: this.ime,
      pogodaka: this.brojPogodaka,
      poteza: this.brojPoteza,
    };
  }
}
