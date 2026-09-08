import type { IApiClient } from '../interfaces/IApiClient';
import type { IDeckProvider } from '../interfaces/IDeckProvider';
import type { Paket, Pojam } from '../types';

/** Oblik odgovora REST Countries API-ja (samo polja koja se traže). */
interface DrzavaRestCountries {
  name?: { common?: string };
  cca2?: string;
  flags?: { png?: string; svg?: string };
}

/**
 * Zastave država sa REST Countries API-ja (https://restcountries.com/).
 *
 * Jedan zahtev vraca naziv drzave, dvoslovnu oznaku i adrese slika zastave,
 * pa nema potrebe za dodatnim pozivima. Ako taj API ne odgovori, pokusava se
 * flagcdn.com koji vraca mapu oznaka -> naziv, a slika se sastavlja iz oznake.
 * Ako ni to ne prodje, greska se prosledjuje dalje i partija se igra
 * rezervnim pojmovima iz lokalnog JSON-a.
 */
export class FlagDeckProvider implements IDeckProvider {
  readonly idPaketa: string;
  readonly nazivIzvora = 'REST Countries';

  private static readonly ADRESA_GLAVNA =
    'https://restcountries.com/v3.1/independent?status=true&fields=name,cca2,flags';
  private static readonly ADRESA_REZERVNA = 'https://flagcdn.com/en/codes.json';

  private readonly klijent: IApiClient;
  private readonly paket: Paket;

  constructor(paket: Paket, klijent: IApiClient) {
    this.paket = paket;
    this.klijent = klijent;
    this.idPaketa = paket.id;
  }

  static adresaSlike(oznaka: string): string {
    return `https://flagcdn.com/w320/${oznaka.toLowerCase()}.png`;
  }

  /** Meša niz na licu mesta (Fisher-Yates) i vraća prvih koliko treba. */
  private static izvuci<T>(niz: T[], koliko: number): T[] {
    const kopija = [...niz];
    for (let i = kopija.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [kopija[i], kopija[j]] = [kopija[j], kopija[i]];
    }
    return kopija.slice(0, koliko);
  }

  private async prekoRestCountries(brojParova: number): Promise<Pojam[]> {
    const drzave = await this.klijent.dohvati<DrzavaRestCountries[]>(FlagDeckProvider.ADRESA_GLAVNA);
    if (!Array.isArray(drzave)) throw new Error('REST Countries nije vratio listu država.');

    const pojmovi: Pojam[] = [];

    drzave.forEach((drzava) => {
      const naziv = drzava.name?.common;
      const oznaka = drzava.cca2;
      if (!naziv || !oznaka) return;

      pojmovi.push({
        id: `zastava-${oznaka.toLowerCase()}`,
        naziv,
        slika: drzava.flags?.png ?? FlagDeckProvider.adresaSlike(oznaka),
      });
    });

    if (pojmovi.length < brojParova) {
      throw new Error(`REST Countries je vratio ${pojmovi.length} zastava, a potrebno je ${brojParova}.`);
    }

    return FlagDeckProvider.izvuci(pojmovi, brojParova);
  }

  private async prekoFlagcdn(brojParova: number): Promise<Pojam[]> {
    const mapa = await this.klijent.dohvati<Record<string, string>>(FlagDeckProvider.ADRESA_REZERVNA);

    // flagcdn u istoj listi vraca i pokrajine ("us-ca"), pa ostaju samo
    // dvoslovne oznake drzava
    const pojmovi: Pojam[] = Object.entries(mapa)
      .filter(([oznaka]) => oznaka.length === 2)
      .map(([oznaka, naziv]) => ({
        id: `zastava-${oznaka}`,
        naziv,
        slika: FlagDeckProvider.adresaSlike(oznaka),
      }));

    if (pojmovi.length < brojParova) {
      throw new Error(`flagcdn je vratio ${pojmovi.length} zastava, a potrebno je ${brojParova}.`);
    }

    return FlagDeckProvider.izvuci(pojmovi, brojParova);
  }

  async ucitajPojmove(brojParova: number): Promise<Pojam[]> {
    try {
      return await this.prekoRestCountries(brojParova);
    } catch {
      return this.prekoFlagcdn(brojParova);
    }
  }

  async jeDostupan(): Promise<boolean> {
    if (await this.klijent.jeDostupan(FlagDeckProvider.ADRESA_GLAVNA)) return true;
    return this.klijent.jeDostupan(FlagDeckProvider.ADRESA_REZERVNA);
  }

  rezerva(): Pojam[] {
    return this.paket.rezervniPojmovi;
  }
}
