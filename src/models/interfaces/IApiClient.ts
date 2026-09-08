/**
 * Ugovor za rad sa javnim API-jima.
 * Klasa ApiClient ga implementira, a izvori pojmova (DogDeckProvider,
 * PokemonDeckProvider) ga primaju kroz konstruktor — tako se u testu ili
 * kasnijoj izmeni moze podmetnuti drugi klijent bez diranja providera.
 */
export interface IApiClient {
  /** GET zahtev koji vraca raspakovan JSON ili baca gresku. */
  dohvati<T>(adresa: string): Promise<T>;

  /** Isti zahtev, ali umesto greske vraca zadatu rezervnu vrednost. */
  dohvatiSaRezervom<T>(adresa: string, rezerva: T): Promise<T>;

  /** Brza provera da li adresa uopste odgovara. */
  jeDostupan(adresa: string): Promise<boolean>;
}
