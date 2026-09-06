import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PlayerPanel from '../components/PlayerPanel';
import { istorijaPartija } from '../models/MatchHistoryService';
import { formatirajVreme } from '../models/podaci';
import type { Partija } from '../models/types';
import './Result.css';

export default function Result() {
  const lokacija = useLocation();
  const idiNa = useNavigate();

  // useLocation: zapis partije stize kroz state pri prelasku sa ekrana igre
  const partija = lokacija.state as Partija | null;

  // partija se upisuje u localStorage cim se otvori ekran rezultata;
  // servis sam preskace zapis koji vec postoji, pa osvezavanje ne pravi duplikat
  useEffect(() => {
    if (partija) istorijaPartija.dodaj(partija);
  }, [partija]);

  if (!partija) {
    return (
      <>
        <h1>Rezultat partije</h1>
        <p className="zaglavlje-strane__opis" style={{ marginTop: 'var(--razmak-3)' }}>
          Nema podataka o partiji — verovatno je stranica osvežena. Odigraj partiju da bi
          video rezultat.
        </p>
        <div style={{ marginTop: 'var(--razmak-6)' }}>
          <Link to="/nivoi"><Button>Izaberi nivo</Button></Link>
        </div>
      </>
    );
  }

  const pobednik = partija.pobednikIndeks !== null ? partija.igraci[partija.pobednikIndeks] : null;

  return (
    <div className="rezultat">
      <p className="zaglavlje-strane__nadnaslov">{partija.nivoNaziv}</p>

      <h1 className="rezultat__ishod">
        {partija.nereseno ? 'Nerešeno' : <>Pobednik: <span>{pobednik?.ime}</span></>}
      </h1>
      <p className="rezultat__podnaslov">
        {partija.nereseno
          ? 'Oba igrača su upamtila jednak broj parova.'
          : `${pobednik?.pogodaka} pogođenih parova od ukupno ${partija.igraci.reduce((z, i) => z + i.pogodaka, 0)}.`}
      </p>

      <div className="rezultat__igraci">
        {partija.igraci.map((igrac) => (
          <PlayerPanel
            key={igrac.redniBroj}
            igrac={igrac}
            naPotezu={false}
            pobednik={partija.pobednikIndeks === igrac.redniBroj}
          />
        ))}
      </div>

      <div className="rezultat__sazetak">
        <div className="sazetak__stavka">
          <span className="sazetak__vrednost">{formatirajVreme(partija.trajanjeSek)}</span>
          <span className="sazetak__oznaka">trajanje</span>
        </div>
        <div className="sazetak__stavka">
          <span className="sazetak__vrednost">{partija.ukupnoPoteza}</span>
          <span className="sazetak__oznaka">ukupno poteza</span>
        </div>
        <div className="sazetak__stavka">
          <span className="sazetak__vrednost">{partija.tezina}</span>
          <span className="sazetak__oznaka">težina</span>
        </div>
      </div>

      <div className="rezultat__akcije">
        <Button velicina="veliko" onClick={() => idiNa(`/igra/${partija.nivoId}`)}>
          Igraj ponovo
        </Button>
        <Button velicina="veliko" vrsta="sekundarno" onClick={() => idiNa('/nivoi')}>
          Drugi nivo
        </Button>
      </div>
    </div>
  );
}
