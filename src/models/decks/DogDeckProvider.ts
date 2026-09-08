import type { IApiClient } from '../interfaces/IApiClient';
import type { IDeckProvider } from '../interfaces/IDeckProvider';
import type { Paket, Pojam } from '../types';

interface OdgovorDogCeo {
  message: string[];
  status: string;
}

/**
 * Slike pasa sa Dog CEO API-ja (https://dog.ceo/dog-api/).
 * API ne trazi kljuc i vraca samo adrese slika, pa se naziv rase izvlaci
 * iz same adrese: .../breeds/hound-afghan/n02088094_1003.jpg -> "Afghan hound".
 */
export class DogDeckProvider implements IDeckProvider {
  readonly idPaketa: string;
  readonly nazivIzvora = 'Dog CEO API';

  private readonly klijent: IApiClient;
  private readonly paket: Paket;

  constructor(paket: Paket, klijent: IApiClient) {
    this.paket = paket;
    this.klijent = klijent;
    this.idPaketa = paket.id;
  }

  /** hound-afghan -> "Afghan hound" */
  static nazivRase(adresaSlike: string): string {
    const deo = adresaSlike.split('/breeds/')[1]?.split('/')[0] ?? 'pas';
    const reci = deo.split('-').reverse();
    const spojeno = reci.join(' ');
    return spojeno.charAt(0).toUpperCase() + spojeno.slice(1);
  }

  async ucitajPojmove(brojParova: number): Promise<Pojam[]> {
    // trazi se dvostruko vise slika nego sto treba, da bi posle izbacivanja
    // ponovljenih rasa ostalo dovoljno razlicitih pojmova (API dozvoljava do 50)
    const koliko = Math.min(50, Math.max(brojParova * 2, brojParova));
    const adresa = `https://dog.ceo/api/breeds/image/random/${koliko}`;

    const odgovor = await this.klijent.dohvati<OdgovorDogCeo>(adresa);
    const slike = Array.isArray(odgovor.message) ? odgovor.message : [];

    if (slike.length === 0) {
      throw new Error('Dog CEO API nije vratio nijednu sliku.');
    }

    const pojmovi: Pojam[] = [];
    const vidjeneRase = new Set<string>();

    // prvo po jedna slika za svaku razlicitu rasu
    slike.forEach((adresaSlike) => {
      const naziv = DogDeckProvider.nazivRase(adresaSlike);
      if (vidjeneRase.has(naziv)) return;
      vidjeneRase.add(naziv);
      pojmovi.push({ id: adresaSlike, naziv, slika: adresaSlike });
    });

    // ako razlicitih rasa nema dovoljno, dopunjuje se preostalim slikama
    if (pojmovi.length < brojParova) {
      slike.forEach((adresaSlike) => {
        if (pojmovi.length >= brojParova) return;
        if (pojmovi.some((p) => p.id === adresaSlike)) return;
        pojmovi.push({
          id: adresaSlike,
          naziv: DogDeckProvider.nazivRase(adresaSlike),
          slika: adresaSlike,
        });
      });
    }

    if (pojmovi.length < brojParova) {
      throw new Error(
        `Dog CEO API je vratio ${pojmovi.length} upotrebljivih slika, a potrebno je ${brojParova}.`,
      );
    }

    return pojmovi.slice(0, brojParova);
  }

  async jeDostupan(): Promise<boolean> {
    return this.klijent.jeDostupan('https://dog.ceo/api/breeds/image/random/1');
  }

  /** Pojmovi iz JSON fajla, kad API ne odgovori. */
  rezerva(): Pojam[] {
    return this.paket.rezervniPojmovi;
  }
}
