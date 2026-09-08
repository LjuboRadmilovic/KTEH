import type { IApiClient } from './interfaces/IApiClient';

/**
 * Tanak omotac oko fetch-a: prekid posle zadatog vremena, provera statusa
 * i jedinstvena poruka o gresci na srpskom.
 *
 * Bez prekida bi partija umela da visi u "Pripremam partiju…" kad API ne
 * odgovara, jer fetch sam po sebi nema vremensko ogranicenje.
 */
export class ApiClient implements IApiClient {
  private readonly vremeIstekaMs: number;
  private poslednjaGreskaTekst: string | null = null;

  constructor(vremeIstekaMs = 8000) {
    this.vremeIstekaMs = vremeIstekaMs;
  }

  get poslednjaGreska(): string | null {
    return this.poslednjaGreskaTekst;
  }

  async dohvati<T>(adresa: string): Promise<T> {
    const prekidac = new AbortController();
    const tajmer = window.setTimeout(() => prekidac.abort(), this.vremeIstekaMs);

    try {
      const odgovor = await fetch(adresa, { signal: prekidac.signal });

      if (!odgovor.ok) {
        throw new Error(`Server je odgovorio sa ${odgovor.status}.`);
      }

      this.poslednjaGreskaTekst = null;
      return (await odgovor.json()) as T;
    } catch (problem) {
      const poruka =
        (problem as Error).name === 'AbortError'
          ? `Zahtev je prekinut posle ${this.vremeIstekaMs / 1000} s.`
          : (problem as Error).message;

      this.poslednjaGreskaTekst = poruka;
      throw new Error(poruka);
    } finally {
      window.clearTimeout(tajmer);
    }
  }

  async dohvatiSaRezervom<T>(adresa: string, rezerva: T): Promise<T> {
    try {
      return await this.dohvati<T>(adresa);
    } catch {
      return rezerva;
    }
  }

  async jeDostupan(adresa: string): Promise<boolean> {
    try {
      await this.dohvati(adresa);
      return true;
    } catch {
      return false;
    }
  }
}
