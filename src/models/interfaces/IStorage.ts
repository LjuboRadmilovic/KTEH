/**
 * Ugovor za trajno cuvanje podataka u pregledacu.
 * StorageService ga implementira preko localStorage-a; servisi koji ga koriste
 * (AuthService, MatchHistoryService) ne zovu localStorage direktno, pa se
 * skladiste moze zameniti bez njihove izmene.
 */
export interface IStorage {
  /** Cita i raspakuje vrednost; vraca podrazumevanu ako kljuca nema ili je zapis neispravan. */
  procitaj<T>(kljuc: string, podrazumevano: T): T;

  /** Upisuje vrednost kao JSON. Vraca false ako upis nije uspeo. */
  upisi<T>(kljuc: string, vrednost: T): boolean;

  obrisi(kljuc: string): void;

  /** Provera da li pregledac uopste dozvoljava upis (privatni prozor ga ume zabraniti). */
  jeDostupan(): boolean;
}
