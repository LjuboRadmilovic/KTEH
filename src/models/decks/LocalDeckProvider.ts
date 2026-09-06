import type { IDeckProvider } from '../interfaces/IDeckProvider';
import type { Paket, Pojam } from '../types';

/**
 * Pojmovi iz lokalnog JSON fajla (polje rezervniPojmovi u paketu).
 * Radi za svaki paket i ne zavisi od interneta, pa sluzi i kao rezerva
 * kada API paketi (psi, pokemoni) nisu dostupni.
 */
export class LocalDeckProvider implements IDeckProvider {
  readonly idPaketa: string;
  readonly nazivIzvora = 'Lokalni JSON';

  private readonly paket: Paket;

  constructor(paket: Paket) {
    this.paket = paket;
    this.idPaketa = paket.id;
  }

  async ucitajPojmove(brojParova: number): Promise<Pojam[]> {
    const svi = [...this.paket.rezervniPojmovi];

    if (svi.length < brojParova) {
      throw new Error(
        `Paket "${this.paket.naziv}" ima ${svi.length} pojmova, a potrebno je ${brojParova}.`,
      );
    }

    // nasumican izbor bez ponavljanja
    for (let i = svi.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [svi[i], svi[j]] = [svi[j], svi[i]];
    }

    return svi.slice(0, brojParova);
  }

  async jeDostupan(): Promise<boolean> {
    return this.paket.rezervniPojmovi.length > 0;
  }
}
