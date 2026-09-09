import type { IStorage } from './interfaces/IStorage';
import { skladiste } from './StorageService';
import type { Korisnik } from './types';

interface ZapisKorisnika extends Korisnik {
  /**
   * Otisak lozinke, ne sama lozinka.
   *
   * NAPOMENA: aplikacija je iskljucivo klijentska i nema server, pa ovo nije
   * prava zastita. Sluzi samo da lozinka ne stoji u citljivom obliku u
   * localStorage-u. Za pravu aplikaciju provera bi isla na serveru.
   */
  otisakLozinke: string;
}

export interface IshodPrijave {
  uspeh: boolean;
  greska?: string;
  korisnik?: Korisnik;
}

const KLJUC_KORISNICI = 'korisnici';
const KLJUC_PRIJAVLJEN = 'prijavljen';

/** Registracija, prijava i odjava korisnika nad localStorage-om. */
export class AuthService {
  private readonly skladiste: IStorage;

  constructor(skladisteZaUpis: IStorage = skladiste) {
    this.skladiste = skladisteZaUpis;
  }

  /** Jednostavan djb2 otisak, dovoljan da lozinka ne stoji citljiva. */
  static otisak(tekst: string): string {
    let vrednost = 5381;
    for (let i = 0; i < tekst.length; i += 1) {
      vrednost = (vrednost * 33) ^ tekst.charCodeAt(i);
    }
    return (vrednost >>> 0).toString(16);
  }

  private sviKorisnici(): ZapisKorisnika[] {
    const zapisi = this.skladiste.procitaj<ZapisKorisnika[]>(KLJUC_KORISNICI, []);
    return Array.isArray(zapisi) ? zapisi : [];
  }

  private bezOtiska(zapis: ZapisKorisnika): Korisnik {
    const { korisnickoIme, email, prikaznoIme, registrovan } = zapis;
    return { korisnickoIme, email, prikaznoIme, registrovan };
  }

  registruj(korisnickoIme: string, email: string, lozinka: string): IshodPrijave {
    const ime = korisnickoIme.trim();
    const postojeci = this.sviKorisnici();

    if (postojeci.some((k) => k.korisnickoIme.toLowerCase() === ime.toLowerCase())) {
      return { uspeh: false, greska: 'Korisničko ime je već zauzeto.' };
    }

    const zapis: ZapisKorisnika = {
      korisnickoIme: ime,
      email: email.trim(),
      prikaznoIme: ime,
      registrovan: new Date().toISOString(),
      otisakLozinke: AuthService.otisak(lozinka),
    };

    this.skladiste.upisi(KLJUC_KORISNICI, [...postojeci, zapis]);
    this.skladiste.upisi(KLJUC_PRIJAVLJEN, zapis.korisnickoIme);

    return { uspeh: true, korisnik: this.bezOtiska(zapis) };
  }

  prijavi(korisnickoIme: string, lozinka: string): IshodPrijave {
    const ime = korisnickoIme.trim().toLowerCase();
    const zapis = this.sviKorisnici().find((k) => k.korisnickoIme.toLowerCase() === ime);

    if (!zapis) return { uspeh: false, greska: 'Ne postoji nalog sa tim korisničkim imenom.' };
    if (zapis.otisakLozinke !== AuthService.otisak(lozinka)) {
      return { uspeh: false, greska: 'Pogrešna lozinka.' };
    }

    this.skladiste.upisi(KLJUC_PRIJAVLJEN, zapis.korisnickoIme);
    return { uspeh: true, korisnik: this.bezOtiska(zapis) };
  }

  odjavi(): void {
    this.skladiste.obrisi(KLJUC_PRIJAVLJEN);
  }

  /** Korisnik zapamcen iz prethodne posete, ako ga ima. */
  trenutni(): Korisnik | null {
    const ime = this.skladiste.procitaj<string | null>(KLJUC_PRIJAVLJEN, null);
    if (!ime) return null;

    const zapis = this.sviKorisnici().find((k) => k.korisnickoIme === ime);
    return zapis ? this.bezOtiska(zapis) : null;
  }

  promeniPrikaznoIme(korisnickoIme: string, novoIme: string): Korisnik | null {
    const svi = this.sviKorisnici();
    const zapis = svi.find((k) => k.korisnickoIme === korisnickoIme);
    if (!zapis) return null;

    zapis.prikaznoIme = novoIme.trim() || zapis.korisnickoIme;
    this.skladiste.upisi(KLJUC_KORISNICI, svi);
    return this.bezOtiska(zapis);
  }
}

export const nalozi = new AuthService();
