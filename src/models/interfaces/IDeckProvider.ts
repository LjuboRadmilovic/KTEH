import type { Pojam } from '../types';

/**
 * Ugovor za izvor pojmova na karticama.
 * Implementiraju ga LocalDeckProvider (JSON fajl), DogDeckProvider (Dog CEO API)
 * i PokemonDeckProvider (PokeAPI) — igra ne zna odakle pojmovi zaista dolaze.
 */
export interface IDeckProvider {
  /** id paketa iz classic-pack.json ("psi", "pokemoni", "zastave"...) */
  readonly idPaketa: string;

  /** citljiv naziv izvora, prikazuje se korisniku */
  readonly nazivIzvora: string;

  /** Vraca tacno onoliko razlicitih pojmova koliko treba parova. */
  ucitajPojmove(brojParova: number): Promise<Pojam[]>;

  /** Provera pre pokretanja partije; kod API izvora ide mrezni poziv. */
  jeDostupan(): Promise<boolean>;
}
