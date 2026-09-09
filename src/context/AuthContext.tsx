import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { nalozi } from '../models/AuthService';
import type { IshodPrijave } from '../models/AuthService';
import type { Korisnik } from '../models/types';

interface VrednostKonteksta {
  korisnik: Korisnik | null;
  prijavljen: boolean;
  ucitavanje: boolean;
  prijavi: (korisnickoIme: string, lozinka: string) => IshodPrijave;
  registruj: (korisnickoIme: string, email: string, lozinka: string) => IshodPrijave;
  odjavi: () => void;
  promeniIme: (novoIme: string) => void;
}

const AuthContext = createContext<VrednostKonteksta | null>(null);

/** Obavija celu aplikaciju i drzi prijavljenog korisnika. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [korisnik, postaviKorisnika] = useState<Korisnik | null>(null);
  const [ucitavanje, postaviUcitavanje] = useState(true);

  // pri ucitavanju stranice vraca korisnika zapamcenog u localStorage-u
  useEffect(() => {
    postaviKorisnika(nalozi.trenutni());
    postaviUcitavanje(false);
  }, []);

  const prijavi = useCallback((korisnickoIme: string, lozinka: string) => {
    const ishod = nalozi.prijavi(korisnickoIme, lozinka);
    if (ishod.uspeh && ishod.korisnik) postaviKorisnika(ishod.korisnik);
    return ishod;
  }, []);

  const registruj = useCallback((korisnickoIme: string, email: string, lozinka: string) => {
    const ishod = nalozi.registruj(korisnickoIme, email, lozinka);
    if (ishod.uspeh && ishod.korisnik) postaviKorisnika(ishod.korisnik);
    return ishod;
  }, []);

  const odjavi = useCallback(() => {
    nalozi.odjavi();
    postaviKorisnika(null);
  }, []);

  const promeniIme = useCallback(
    (novoIme: string) => {
      if (!korisnik) return;
      const azuriran = nalozi.promeniPrikaznoIme(korisnik.korisnickoIme, novoIme);
      if (azuriran) postaviKorisnika(azuriran);
    },
    [korisnik],
  );

  const vrednost = useMemo<VrednostKonteksta>(
    () => ({
      korisnik,
      prijavljen: korisnik !== null,
      ucitavanje,
      prijavi,
      registruj,
      odjavi,
      promeniIme,
    }),
    [korisnik, ucitavanje, prijavi, registruj, odjavi, promeniIme],
  );

  return <AuthContext.Provider value={vrednost}>{children}</AuthContext.Provider>;
}

/** Pristup nalogu iz bilo koje komponente. */
export function useAuth(): VrednostKonteksta {
  const kontekst = useContext(AuthContext);
  if (!kontekst) throw new Error('useAuth se mora koristiti unutar AuthProvider-a.');
  return kontekst;
}
