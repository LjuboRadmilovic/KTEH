import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import InputField from '../components/InputField';
import './Auth.css';

/** Registracija korisnika. Nalog se upisuje u localStorage preko AuthService-a. */
export default function Register() {
  const [korisnickoIme, postaviKorisnickoIme] = useState('');
  const [email, postaviEmail] = useState('');
  const [lozinka, postaviLozinku] = useState('');
  const [potvrda, postaviPotvrdu] = useState('');
  const [greske, postaviGreske] = useState<Record<string, string>>({});
  const { registruj } = useAuth();
  const idiNa = useNavigate();

  function posalji(dogadjaj: FormEvent<HTMLFormElement>) {
    dogadjaj.preventDefault();
    const nove: Record<string, string> = {};

    if (korisnickoIme.trim().length < 3) nove.korisnickoIme = 'Bar 3 znaka.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) nove.email = 'Unesi ispravnu adresu.';
    if (lozinka.length < 6) nove.lozinka = 'Bar 6 znakova.';
    if (lozinka !== potvrda) nove.potvrda = 'Lozinke se ne poklapaju.';

    if (Object.keys(nove).length > 0) {
      postaviGreske(nove);
      return;
    }

    const ishod = registruj(korisnickoIme, email, lozinka);
    if (!ishod.uspeh) {
      postaviGreske({ korisnickoIme: ishod.greska ?? 'Registracija nije uspela.' });
      return;
    }

    postaviGreske({});
    idiNa('/', { replace: true });
  }

  return (
    <div className="nalog">
      <div className="nalog__kartica">
        <Link to="/" className="nalog__znak">
          <span aria-hidden="true">🃏</span> Memorija
        </Link>

        <h1 className="nalog__naslov">Registracija</h1>
        <p className="nalog__opis">Napravi nalog da bi čuvao rezultate svojih partija.</p>

        <form className="nalog__forma" onSubmit={posalji} noValidate>
          <InputField
            oznaka="Korisničko ime"
            name="korisnickoIme"
            autoComplete="username"
            value={korisnickoIme}
            greska={greske.korisnickoIme}
            onChange={(d) => postaviKorisnickoIme(d.target.value)}
          />
          <InputField
            oznaka="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            greska={greske.email}
            onChange={(d) => postaviEmail(d.target.value)}
          />
          <InputField
            oznaka="Lozinka"
            name="lozinka"
            type="password"
            autoComplete="new-password"
            value={lozinka}
            greska={greske.lozinka}
            onChange={(d) => postaviLozinku(d.target.value)}
          />
          <InputField
            oznaka="Potvrda lozinke"
            name="potvrda"
            type="password"
            autoComplete="new-password"
            value={potvrda}
            greska={greske.potvrda}
            onChange={(d) => postaviPotvrdu(d.target.value)}
          />
          <Button type="submit" velicina="veliko" punaSirina>
            Napravi nalog
          </Button>
        </form>

        <p className="nalog__dno">
          Već imaš nalog? <Link to="/prijava">Prijavi se</Link>
        </p>
      </div>
    </div>
  );
}
