import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import GameBoard from '../components/GameBoard';
import InputField from '../components/InputField';
import Loader from '../components/Loader';
import PlayerPanel from '../components/PlayerPanel';
import { useGame } from '../hooks/useGame';
import { formatirajVreme } from '../models/podaci';
import './Game.css';

export default function Game() {
  const { id } = useParams<{ id: string }>();
  const idiNa = useNavigate();

  const igra = useGame(id);

  const [prviIgrac, postaviPrvog] = useState('Igrač 1');
  const [drugiIgrac, postaviDrugog] = useState('Igrač 2');

  // kad partija dodje do kraja, zapis se prosledjuje ekranu rezultata
  useEffect(() => {
    if (!igra.partija) return;
    idiNa(`/rezultat/${igra.partija.id}`, { state: igra.partija, replace: true });
  }, [igra.partija, idiNa]);

  function pokreni(dogadjaj: FormEvent<HTMLFormElement>) {
    dogadjaj.preventDefault();
    void igra.zapocni([prviIgrac, drugiIgrac]);
  }

  if (igra.ucitavanje && !igra.pokrenuta) return <Loader poruka="Pripremam partiju…" />;

  if (igra.greska) {
    return (
      <>
        <div className="igra__greska">{igra.greska}</div>
        <Button vrsta="sekundarno" onClick={() => idiNa('/nivoi')}>Nazad na nivoe</Button>
      </>
    );
  }

  /* ---------- pre pocetka: imena igraca ---------- */
  if (!igra.pokrenuta) {
    return (
      <div className="panel priprema">
        <h1>{igra.nivo?.naziv ?? 'Partija'}</h1>
        <p className="priprema__opis">
          Unesite imena igrača. Igra se naizmenično — ko pogodi par, igra ponovo.
        </p>

        <form className="priprema__forma" onSubmit={pokreni}>
          <InputField
            oznaka="Prvi igrač"
            value={prviIgrac}
            onChange={(d) => postaviPrvog(d.target.value)}
            maxLength={20}
          />
          <InputField
            oznaka="Drugi igrač"
            value={drugiIgrac}
            onChange={(d) => postaviDrugog(d.target.value)}
            maxLength={20}
          />
          <Button type="submit" velicina="veliko" punaSirina>Počni partiju</Button>
        </form>

        <div className="priprema__podaci">
          <div className="priprema__podatak">
            <span className="priprema__oznaka">Tabla</span>
            <span className="priprema__vrednost">
              {igra.nivo ? `${igra.nivo.tabla.kolone}×${igra.nivo.tabla.redovi}` : '—'}
            </span>
          </div>
          <div className="priprema__podatak">
            <span className="priprema__oznaka">Parova</span>
            <span className="priprema__vrednost">{igra.nivo?.parova ?? '—'}</span>
          </div>
          <div className="priprema__podatak">
            <span className="priprema__oznaka">Paket</span>
            <span className="priprema__vrednost">{igra.paket?.naziv ?? '—'}</span>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- partija u toku ---------- */
  return (
    <>
      <div className="igra__zaglavlje">
        <div>
          <h1>{igra.nivo?.naziv}</h1>
          <div className="igra__oznake">
            <span className="oznaka">{igra.paket?.emoji} {igra.paket?.naziv}</span>
            <span className="oznaka">{igra.nivo?.parova} parova</span>
            <span className="oznaka">izvor: {igra.izvorPojmova}{igra.koriscenaRezerva ? ' (rezerva)' : ''}</span>
          </div>
        </div>
        <div className="igra__tajmer">
          {formatirajVreme(igra.sekundi)}
          <small>vreme</small>
        </div>
      </div>

      <div className="igra__igraci">
        {igra.rezultati.map((igrac) => (
          <PlayerPanel
            key={igrac.redniBroj}
            igrac={igrac}
            naPotezu={!igra.jeKraj && igrac.redniBroj === igra.naPotezu}
          />
        ))}
      </div>

      <GameBoard
        karte={igra.karte}
        kolone={igra.nivo?.tabla.kolone ?? 4}
        zakljucana={igra.zakljucana}
        onOkreni={igra.okreni}
      />

      <div className="igra__dno">
        <Button vrsta="sekundarno" onClick={() => idiNa('/nivoi')}>Prekini partiju</Button>
      </div>
    </>
  );
}
