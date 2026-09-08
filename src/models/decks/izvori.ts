import { ApiClient } from '../ApiClient';
import { DogDeckProvider } from './DogDeckProvider';
import { FlagDeckProvider } from './FlagDeckProvider';
import { LocalDeckProvider } from './LocalDeckProvider';
import { PokemonDeckProvider } from './PokemonDeckProvider';
import type { IDeckProvider } from '../interfaces/IDeckProvider';
import type { Paket } from '../types';

/**
 * Bira izvor pojmova za dati paket.
 * Paketi ciji je izvor "api" dobijaju odgovarajuci API provider, svi ostali
 * citaju iz lokalnog JSON fajla. Rezultat je uvek IDeckProvider, pa ostatak
 * aplikacije ne zna odakle pojmovi dolaze.
 */
export function napraviIzvor(paket: Paket): IDeckProvider {
  if (paket.izvor.tip === 'api') {
    const klijent = new ApiClient();

    if (paket.id === 'psi') return new DogDeckProvider(paket, klijent);
    if (paket.id === 'pokemoni') return new PokemonDeckProvider(paket, klijent);
    if (paket.id === 'zastave') return new FlagDeckProvider(paket, klijent);
  }

  return new LocalDeckProvider(paket);
}

/** Rezervni izvor kad API ne odgovori. */
export function napraviRezervniIzvor(paket: Paket): IDeckProvider {
  return new LocalDeckProvider(paket);
}
