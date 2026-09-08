import type { IStorage } from './interfaces/IStorage';
import { skladiste } from './StorageService';
import type { KodTezine, Partija } from './types';

export interface SazetakStatistike {
  ukupnoPartija: number;
  ukupnoParova: number;
  prosecnoTrajanjeSek: number;
  nereseniIshodi: number;
  najbrzaPartija: Partija | null;
  pobedaPoIgracu: Record<string, number>;
  partijaPoPaketu: Record<string, number>;
  partijaPoTezini: Record<KodTezine, number>;
}

const KLJUC = 'istorija';
const NAJVISE_ZAPISA = 200;

/**
 * Istorija odigranih partija u localStorage-u.
 * Iz nje se racuna statistika i otkljucavanje nivoa.
 */
export class MatchHistoryService {
  private readonly skladiste: IStorage;

  constructor(skladisteZaUpis: IStorage = skladiste) {
    this.skladiste = skladisteZaUpis;
  }

  /** Sve partije, od najnovije ka najstarijoj. */
  sve(): Partija[] {
    const zapisi = this.skladiste.procitaj<Partija[]>(KLJUC, []);
    return Array.isArray(zapisi) ? zapisi : [];
  }

  dodaj(partija: Partija): void {
    const postojece = this.sve();

    // ista partija se ne upisuje dva puta (ekran rezultata ume da se osvezi)
    if (postojece.some((p) => p.id === partija.id)) return;

    const novo = [partija, ...postojece].slice(0, NAJVISE_ZAPISA);
    this.skladiste.upisi(KLJUC, novo);
  }

  zaNivo(nivoId: string): Partija[] {
    return this.sve().filter((partija) => partija.nivoId === nivoId);
  }

  jeOdigran(nivoId: string): boolean {
    return this.sve().some((partija) => partija.nivoId === nivoId);
  }

  obrisiSve(): void {
    this.skladiste.obrisi(KLJUC);
  }

  /** Brojevi koje koriste stranice statistike i profila. */
  sazetak(): SazetakStatistike {
    const partije = this.sve();

    const pobedaPoIgracu: Record<string, number> = {};
    const partijaPoPaketu: Record<string, number> = {};
    const partijaPoTezini: Record<KodTezine, number> = { lako: 0, srednje: 0, tesko: 0 };

    let ukupnoParova = 0;
    let zbirTrajanja = 0;
    let nereseni = 0;
    let najbrza: Partija | null = null;

    partije.forEach((partija) => {
      ukupnoParova += partija.igraci.reduce((zbir, igrac) => zbir + igrac.pogodaka, 0);
      zbirTrajanja += partija.trajanjeSek;

      if (partija.nereseno) {
        nereseni += 1;
      } else if (partija.pobednikIndeks !== null) {
        const ime = partija.igraci[partija.pobednikIndeks]?.ime ?? 'Nepoznat';
        pobedaPoIgracu[ime] = (pobedaPoIgracu[ime] ?? 0) + 1;
      }

      partijaPoPaketu[partija.paketId] = (partijaPoPaketu[partija.paketId] ?? 0) + 1;
      partijaPoTezini[partija.tezina] = (partijaPoTezini[partija.tezina] ?? 0) + 1;

      if (!najbrza || partija.trajanjeSek < najbrza.trajanjeSek) najbrza = partija;
    });

    return {
      ukupnoPartija: partije.length,
      ukupnoParova,
      prosecnoTrajanjeSek: partije.length ? Math.round(zbirTrajanja / partije.length) : 0,
      nereseniIshodi: nereseni,
      najbrzaPartija: najbrza,
      pobedaPoIgracu,
      partijaPoPaketu,
      partijaPoTezini,
    };
  }
}

export const istorijaPartija = new MatchHistoryService();
