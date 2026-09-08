import type { IStorage } from './interfaces/IStorage';

/**
 * Rad sa localStorage-om na jednom mestu.
 *
 * Svaki poziv je u try/catch jer localStorage ume da baci gresku
 * (privatni prozor, popunjena kvota, iskljuceni kolacici), a zbog toga
 * aplikacija ne sme da padne — samo se izgubi pamcenje.
 */
export class StorageService implements IStorage {
  private readonly prefiks: string;

  constructor(prefiks = 'memorija') {
    this.prefiks = prefiks;
  }

  private punKljuc(kljuc: string): string {
    return `${this.prefiks}:${kljuc}`;
  }

  procitaj<T>(kljuc: string, podrazumevano: T): T {
    try {
      const zapis = window.localStorage.getItem(this.punKljuc(kljuc));
      if (zapis === null) return podrazumevano;
      return JSON.parse(zapis) as T;
    } catch {
      return podrazumevano;
    }
  }

  upisi<T>(kljuc: string, vrednost: T): boolean {
    try {
      window.localStorage.setItem(this.punKljuc(kljuc), JSON.stringify(vrednost));
      return true;
    } catch {
      return false;
    }
  }

  obrisi(kljuc: string): void {
    try {
      window.localStorage.removeItem(this.punKljuc(kljuc));
    } catch {
      /* nema sta da se radi */
    }
  }

  jeDostupan(): boolean {
    try {
      const proba = `${this.prefiks}:proba`;
      window.localStorage.setItem(proba, '1');
      window.localStorage.removeItem(proba);
      return true;
    } catch {
      return false;
    }
  }
}

/** Jedna instanca za celu aplikaciju. */
export const skladiste = new StorageService();
