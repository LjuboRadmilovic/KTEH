import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [korisnickoIme, postaviKorisnickoIme] = useState('');
  const [lozinka, postaviLozinku] = useState('');
  const [greska, postaviGresku] = useState('');

  const { prijavi } = useAuth();
  const idiNa = useNavigate();
  const lokacija = useLocation();

  // ako je korisnik poslat ovde sa zasticene stranice, vraca se na nju
  const odakle = (lokacija.state as { odakle?: string } | null)?.odakle ?? '/';

  function posalji(dogadjaj: FormEvent<HTMLFormElement>) {
    dogadjaj.preventDefault();

    if (korisnickoIme.trim().length < 3) {
      postaviGresku('Korisničko ime mora imati bar 3 znaka.');
      return;
    }
    if (lozinka.length < 6) {
      postaviGresku('Lozinka mora imati bar 6 znakova.');
      return;
    }

    const ishod = prijavi(korisnickoIme, lozinka);
    if (!ishod.uspeh) {
      postaviGresku(ishod.greska ?? 'Prijava nije uspela.');
      return;
    }

    postaviGresku('');
    idiNa(odakle, { replace: true });
  }

  return (
    <div className="nalog">
      <div className="nalog__kartica">
        <Link to="/" className="nalog__znak">
          <span aria-hidden="true">🃏</span> Memorija
        </Link>

        <h1 className="nalog__naslov">Prijava</h1>
        <p className="nalog__opis">Prijavi se da bi ti se partije čuvale u istoriji i statistici.</p>

        <form className="nalog__forma" onSubmit={posalji} noValidate>
          <InputField
            oznaka="Korisničko ime"
            name="korisnickoIme"
            autoComplete="username"
            placeholder="npr. ljubec"
            value={korisnickoIme}
            onChange={(d) => postaviKorisnickoIme(d.target.value)}
          />
          <InputField
            oznaka="Lozinka"
            name="lozinka"
            type="password"
            autoComplete="current-password"
            placeholder="najmanje 6 znakova"
            value={lozinka}
            greska={greska || undefined}
            onChange={(d) => postaviLozinku(d.target.value)}
          />
          <Button type="submit" velicina="veliko" punaSirina>
            Prijavi se
          </Button>
        </form>

        <p className="nalog__dno">
          Nemaš nalog? <Link to="/registracija">Registruj se</Link>
        </p>
      </div>
    </div>
  );
}
