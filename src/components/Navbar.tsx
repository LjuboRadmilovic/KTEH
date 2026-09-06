import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

interface StavkaMenija {
  putanja: string;
  naziv: string;
}

const STAVKE: StavkaMenija[] = [
  { putanja: '/', naziv: 'Početna' },
  { putanja: '/nivoi', naziv: 'Nivoi' },
  { putanja: '/statistika', naziv: 'Statistika' },
  { putanja: '/istorija', naziv: 'Istorija' },
];

/** Navigacija sa hamburger dugmetom na uskim ekranima. */
export default function Navbar() {
  const [otvoren, postaviOtvoren] = useState(false);
  const lokacija = useLocation();
  const { korisnik, prijavljen } = useAuth();

  // useLocation: kad se promeni adresa, meni na telefonu se sam zatvara.
  useEffect(() => {
    postaviOtvoren(false);
  }, [lokacija.pathname]);

  return (
    <header className="navigacija">
      <div className="navigacija__omotac">
        <NavLink to="/" className="navigacija__logo">
          <span className="navigacija__znak" aria-hidden="true">🃏</span>
          <span>Memorija</span>
        </NavLink>

        <button
          type="button"
          className="navigacija__hamburger"
          aria-expanded={otvoren}
          aria-controls="glavni-meni"
          aria-label={otvoren ? 'Zatvori meni' : 'Otvori meni'}
          onClick={() => postaviOtvoren((prethodno) => !prethodno)}
        >
          <span className={`navigacija__crta ${otvoren ? 'navigacija__crta--x' : ''}`} />
        </button>

        <nav
          id="glavni-meni"
          className={`navigacija__meni ${otvoren ? 'navigacija__meni--otvoren' : ''}`}
        >
          {STAVKE.map((stavka) => (
            <NavLink
              key={stavka.putanja}
              to={stavka.putanja}
              end={stavka.putanja === '/'}
              className={({ isActive }) =>
                `navigacija__link ${isActive ? 'navigacija__link--aktivan' : ''}`
              }
            >
              {stavka.naziv}
            </NavLink>
          ))}
          <NavLink to={prijavljen ? '/profil' : '/prijava'} className="navigacija__profil">
            {prijavljen ? (korisnik?.prikaznoIme ?? 'Profil') : 'Prijava'}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
