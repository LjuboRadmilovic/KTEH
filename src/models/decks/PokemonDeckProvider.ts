import type { IApiClient } from '../interfaces/IApiClient';
import type { IDeckProvider } from '../interfaces/IDeckProvider';
import type { Paket, Pojam } from '../types';

interface StavkaListe {
  name: string;
  url: string;
}

interface OdgovorPokeApi {
  count: number;
  results: StavkaListe[];
}

/**
 * Pokemoni sa PokeAPI-ja (https://pokeapi.co/).
 *
 * Lista vraca samo imena i adrese, ali je redni broj Pokemona sadrzan u adresi
 * (.../pokemon/25/), pa se slika sastavlja iz zvanicnog sprite repozitorijuma.
 * Tako je dovoljan jedan zahtev umesto jednog po Pokemonu.
 */
export class PokemonDeckProvider implements IDeckProvider {
  readonly idPaketa: string;
  readonly nazivIzvora = 'PokéAPI';

  /** prvih 1000 Pokemona sigurno ima sliku u sprite repozitorijumu */
  private static readonly GORNJA_GRANICA = 1000;

  private readonly klijent: IApiClient;
  private readonly paket: Paket;

  constructor(paket: Paket, klijent: IApiClient) {
    this.paket = paket;
    this.klijent = klijent;
    this.idPaketa = paket.id;
  }

  static redniBroj(adresa: string): number | null {
    const delovi = adresa.split('/').filter(Boolean);
    const poslednji = delovi[delovi.length - 1];
    const broj = Number.parseInt(poslednji, 10);
    return Number.isNaN(broj) ? null : broj;
  }

  static adresaSlike(redniBroj: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${redniBroj}.png`;
  }

  static lepoIme(ime: string): string {
    return ime
      .split('-')
      .map((rec) => rec.charAt(0).toUpperCase() + rec.slice(1))
      .join(' ');
  }

  async ucitajPojmove(brojParova: number): Promise<Pojam[]> {
    // nasumican pocetak, da se svaka partija ne igra sa istim Pokemonima
    const najveciPomeraj = Math.max(0, PokemonDeckProvider.GORNJA_GRANICA - brojParova);
    const pomeraj = Math.floor(Math.random() * najveciPomeraj);

    const adresa = `https://pokeapi.co/api/v2/pokemon?limit=${brojParova}&offset=${pomeraj}`;
    const odgovor = await this.klijent.dohvati<OdgovorPokeApi>(adresa);
    const stavke = Array.isArray(odgovor.results) ? odgovor.results : [];

    const pojmovi: Pojam[] = [];

    stavke.forEach((stavka) => {
      const broj = PokemonDeckProvider.redniBroj(stavka.url);
      if (broj === null) return;
      pojmovi.push({
        id: `pokemon-${broj}`,
        naziv: PokemonDeckProvider.lepoIme(stavka.name),
        slika: PokemonDeckProvider.adresaSlike(broj),
      });
    });

    if (pojmovi.length < brojParova) {
      throw new Error(
        `PokéAPI je vratio ${pojmovi.length} Pokemona, a potrebno je ${brojParova}.`,
      );
    }

    return pojmovi.slice(0, brojParova);
  }

  async jeDostupan(): Promise<boolean> {
    return this.klijent.jeDostupan('https://pokeapi.co/api/v2/pokemon?limit=1');
  }

  rezerva(): Pojam[] {
    return this.paket.rezervniPojmovi;
  }
}
