import type { IGameEngine } from './interfaces/IGameEngine';
import type { Karta, Pojam, RezultatIgraca, StanjeIgre } from './types';
import { Player } from './Player';

interface OpcijeIgre {
  /** Kad je tacno, igrac koji pogodi par igra ponovo. */
  pogodakDajeNoviPotez?: boolean;
}

/**
 * Jezgro igre memorije za dva igraca.
 *
 * Klasa ne zna nista o React-u — drzi karte, rezultate i cije je na potezu,
 * a komponente je koriste preko hook-a useGame.
 *
 * Zakljucavanje: kad se otvore dve karte koje se ne poklapaju, tabla se
 * zakljucava (jeZakljucana() vraca true) dok se karte ne vrate. Bez toga bi
 * klik na trecu kartu tokom pauze razbio stanje partije.
 */
export class MemoryGame implements IGameEngine {
  private sveKarte: Karta[] = [];
  private igraci: Player[] = [];
  private indeksNaPotezu = 0;
  private zakljucana = false;
  private prvaOtvorena: string | null = null;
  private trenutnoStanje: StanjeIgre = 'priprema';
  private uparenihParova = 0;
  private ukupnoParova = 0;

  private readonly pogodakDajeNoviPotez: boolean;

  constructor(opcije: OpcijeIgre = {}) {
    this.pogodakDajeNoviPotez = opcije.pogodakDajeNoviPotez ?? true;
  }

  /**
   * Od liste pojmova pravi promesan spil: svaki pojam dva puta.
   * Mesanje je Fisher-Yates, kako je zapisano u pravilima u JSON fajlu.
   */
  static napraviKarte(pojmovi: Pojam[]): Karta[] {
    const karte: Karta[] = [];

    pojmovi.forEach((pojam) => {
      for (let kopija = 0; kopija < 2; kopija += 1) {
        karte.push({
          id: `${pojam.id}-${kopija}`,
          pojamId: pojam.id,
          naziv: pojam.naziv,
          emoji: pojam.emoji,
          slika: pojam.slika,
          okrenuta: false,
          uparena: false,
          uparioIgrac: null,
        });
      }
    });

    for (let i = karte.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [karte[i], karte[j]] = [karte[j], karte[i]];
    }

    return karte;
  }

  zapocni(karte: Karta[], imenaIgraca: string[]): void {
    this.sveKarte = karte.map((karta) => ({
      ...karta,
      okrenuta: false,
      uparena: false,
      uparioIgrac: null,
    }));

    this.igraci = imenaIgraca.map((ime, redniBroj) => new Player(redniBroj, ime));
    this.indeksNaPotezu = 0;
    this.zakljucana = false;
    this.prvaOtvorena = null;
    this.uparenihParova = 0;
    this.ukupnoParova = this.sveKarte.length / 2;
    this.trenutnoStanje = 'igra';
  }

  okreni(idKarte: string): boolean {
    if (this.trenutnoStanje !== 'igra') return false;
    if (this.zakljucana) return false;

    const karta = this.sveKarte.find((k) => k.id === idKarte);
    if (!karta || karta.okrenuta || karta.uparena) return false;

    karta.okrenuta = true;

    // prva karta u potezu — samo se pamti
    if (this.prvaOtvorena === null) {
      this.prvaOtvorena = karta.id;
      return true;
    }

    const prva = this.sveKarte.find((k) => k.id === this.prvaOtvorena);
    if (!prva) {
      this.prvaOtvorena = karta.id;
      return true;
    }

    const igrac = this.igraci[this.indeksNaPotezu];
    igrac.zabeleziPotez();

    if (prva.pojamId === karta.pojamId) {
      prva.uparena = true;
      karta.uparena = true;
      prva.uparioIgrac = igrac.redniBroj;
      karta.uparioIgrac = igrac.redniBroj;
      igrac.zabeleziPogodak();
      this.uparenihParova += 1;
      this.prvaOtvorena = null;

      if (this.uparenihParova === this.ukupnoParova) {
        this.trenutnoStanje = 'kraj';
      } else if (!this.pogodakDajeNoviPotez) {
        this.sledeciIgrac();
      }
    } else {
      // promasaj — tabla se zakljucava dok se karte ne vrate
      this.zakljucana = true;
    }

    return true;
  }

  zatvoriNeuparene(): void {
    if (!this.zakljucana) return;

    this.sveKarte.forEach((karta) => {
      if (!karta.uparena) karta.okrenuta = false;
    });

    this.prvaOtvorena = null;
    this.zakljucana = false;
    this.sledeciIgrac();
  }

  naPotezu(): number {
    return this.indeksNaPotezu;
  }

  jeZakljucana(): boolean {
    return this.zakljucana;
  }

  stanje(): StanjeIgre {
    return this.trenutnoStanje;
  }

  karte(): Karta[] {
    return this.sveKarte;
  }

  rezultati(): RezultatIgraca[] {
    return this.igraci.map((igrac) => igrac.rezultat());
  }

  jeKraj(): boolean {
    return this.trenutnoStanje === 'kraj';
  }

  pobednik(): number | null {
    if (!this.jeKraj() || this.igraci.length === 0) return null;

    const najbolji = Math.max(...this.igraci.map((i) => i.pogodaka));
    const sNajboljim = this.igraci.filter((i) => i.pogodaka === najbolji);

    return sNajboljim.length === 1 ? sNajboljim[0].redniBroj : null;
  }

  /** Ukupan broj poteza svih igraca — ide u zapis partije. */
  ukupnoPoteza(): number {
    return this.igraci.reduce((zbir, igrac) => zbir + igrac.poteza, 0);
  }

  private sledeciIgrac(): void {
    this.indeksNaPotezu = (this.indeksNaPotezu + 1) % this.igraci.length;
  }
}
