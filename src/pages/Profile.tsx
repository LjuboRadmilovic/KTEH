import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import InputField from '../components/InputField';
import PageHeader from '../components/PageHeader';
import StatTile from '../components/StatTile';
import { useAuth } from '../context/AuthContext';
import { istorijaPartija } from '../models/MatchHistoryService';
import { formatirajVreme } from '../models/podaci';
import './Profile.css';

export default function Profile() {
  const { korisnik, prijavljen, odjavi, promeniIme } = useAuth();
  const idiNa = useNavigate();

  const [novoIme, postaviNovoIme] = useState(korisnik?.prikaznoIme ?? '');
  const [poruka, postaviPoruku] = useState('');

  const sazetak = useMemo(() => istorijaPartija.sazetak(), []);

  if (!prijavljen || !korisnik) {
    return (
      <>
        <PageHeader
          nadnaslov="Nalog"
          naslov="Profil korisnika"
          opis="Za prikaz profila potrebna je prijava."
        />
        <div className="prazno">
          Nisi prijavljen.{' '}
          <Link to="/prijava" state={{ odakle: '/profil' }}>Prijavi se</Link> ili{' '}
          <Link to="/registracija">napravi nalog</Link>.
        </div>
      </>
    );
  }

  function sacuvajIme(dogadjaj: FormEvent<HTMLFormElement>) {
    dogadjaj.preventDefault();
    promeniIme(novoIme);
    postaviPoruku('Ime je sačuvano.');
    window.setTimeout(() => postaviPoruku(''), 2500);
  }

  function odjaviSe() {
    odjavi();
    idiNa('/', { replace: true });
  }

  return (
    <>
      <div className="profil__vrh">
        <div className="profil__inicijal" aria-hidden="true">
          {korisnik.prikaznoIme.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="profil__ime">{korisnik.prikaznoIme}</div>
          <div className="profil__meta">
            @{korisnik.korisnickoIme} · {korisnik.email} · nalog napravljen{' '}
            {new Date(korisnik.registrovan).toLocaleDateString('sr-RS')}
          </div>
        </div>
      </div>

      <div className="profil__mreza">
        <section className="panel">
          <h3>Podešavanja naloga</h3>
          <form className="profil__forma" onSubmit={sacuvajIme}>
            <InputField
              oznaka="Prikazno ime"
              value={novoIme}
              maxLength={24}
              pomoc="Ime koje se vidi u navigaciji i u istoriji partija."
              onChange={(d) => postaviNovoIme(d.target.value)}
            />
            <Button type="submit">Sačuvaj</Button>
            {poruka ? <span className="profil__poruka">{poruka}</span> : null}
          </form>

          <div className="profil__odjava">
            <Button vrsta="opasno" onClick={odjaviSe}>Odjavi se</Button>
          </div>
        </section>

        <section>
          <div className="profil__plocice">
            <StatTile vrednost={sazetak.ukupnoPartija} oznaka="odigranih partija" />
            <StatTile vrednost={sazetak.ukupnoParova} oznaka="pogođenih parova" boja="#8B5CF6" />
            <StatTile
              vrednost={sazetak.najbrzaPartija ? formatirajVreme(sazetak.najbrzaPartija.trajanjeSek) : '—'}
              oznaka="najbrža partija"
            />
            <StatTile vrednost={sazetak.nereseniIshodi} oznaka="nerešenih" />
          </div>
        </section>
      </div>
    </>
  );
}
