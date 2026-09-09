import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { istorijaPartija } from '../models/MatchHistoryService';
import { formatirajVreme, nadjiNivo, nadjiPaket, nadjiTezinu, ucitajPodatke } from '../models/podaci';
import type { PaketiPodaci } from '../models/types';
import './LevelDetail.css';

export default function LevelDetail() {
  const { id } = useParams<{ id: string }>();
  const idiNa = useNavigate();

  const [podaci, postaviPodatke] = useState<PaketiPodaci | null>(null);
  const [greska, postaviGresku] = useState<string | null>(null);

  useEffect(() => {
    ucitajPodatke()
      .then(postaviPodatke)
      .catch((problem: Error) => postaviGresku(problem.message));
  }, []);

  const prethodnePartije = useMemo(() => (id ? istorijaPartija.zaNivo(id) : []), [id]);

  if (greska) return <div className="prazno">{greska}</div>;
  if (!podaci) return <Loader poruka="Učitavam nivo…" />;

  const nivo = id ? nadjiNivo(podaci, id) : undefined;

  if (!nivo) {
    return (
      <>
        <h1>Nivo nije pronađen</h1>
        <p className="zaglavlje-strane__opis" style={{ margin: 'var(--razmak-3) 0 var(--razmak-6)' }}>
          Nivo sa oznakom „{id}" ne postoji u spisku.
        </p>
        <Link to="/nivoi"><Button>Nazad na nivoe</Button></Link>
      </>
    );
  }

  const paket = nadjiPaket(podaci, nivo.paket);
  const tezina = nadjiTezinu(podaci, nivo.tezina);
  const preduslov = nivo.otkljucavaSe ? nadjiNivo(podaci, nivo.otkljucavaSe) : undefined;
  const otkljucan = !nivo.zakljucan || (nivo.otkljucavaSe ? istorijaPartija.jeOdigran(nivo.otkljucavaSe) : true);

  return (
    <>
      <div className="nivo__vrh">
        <div
          className="nivo__znak"
          style={{ background: `linear-gradient(140deg, ${paket?.boja ?? '#8B5CF6'}, rgba(10,14,28,0.9))` }}
          aria-hidden="true"
        >
          {otkljucan ? paket?.emoji : '🔒'}
        </div>

        <div>
          <span className="zaglavlje-strane__nadnaslov">{paket?.naziv}</span>
          <h1 style={{ marginTop: 'var(--razmak-2)' }}>{nivo.naziv}</h1>
          <p className="nivo__opis">{paket?.opis}</p>

          {otkljucan ? (
            <Button velicina="veliko" onClick={() => idiNa(`/igra/${nivo.id}`)}>Igraj</Button>
          ) : (
            <>
              <Button velicina="veliko" disabled>Zaključan nivo</Button>
              <p className="nivo__opis" style={{ marginTop: 'var(--razmak-3)' }}>
                Otključava se kada odigraš{' '}
                <Link to={`/nivoi/${preduslov?.id}`}>{preduslov?.naziv ?? 'prethodni nivo'}</Link>.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="nivo__podaci">
        <div className="nivo__podatak">
          <span className="nivo__vrednost">{nivo.tabla.kolone}×{nivo.tabla.redovi}</span>
          <span className="nivo__oznaka">tabla</span>
        </div>
        <div className="nivo__podatak">
          <span className="nivo__vrednost">{nivo.parova}</span>
          <span className="nivo__oznaka">parova</span>
        </div>
        <div className="nivo__podatak">
          <span className="nivo__vrednost" style={{ color: tezina?.boja }}>{tezina?.naziv}</span>
          <span className="nivo__oznaka">težina</span>
        </div>
        <div className="nivo__podatak">
          <span className="nivo__vrednost">~{Math.round(nivo.procenjenoTrajanjeSek / 60)} min</span>
          <span className="nivo__oznaka">procena</span>
        </div>
        <div className="nivo__podatak">
          <span className="nivo__vrednost" style={{ fontSize: 'var(--slova-l)' }}>
            {paket?.izvor.tip === 'api' ? paket.izvor.naziv : 'Lokalni JSON'}
          </span>
          <span className="nivo__oznaka">izvor pojmova</span>
        </div>
      </div>

      <section className="nivo__prethodne">
        <h3>Odigrane partije na ovom nivou</h3>
        {prethodnePartije.length === 0 ? (
          <div className="prazno">Još nema odigranih partija na ovom nivou.</div>
        ) : (
          <div className="nivo__lista">
            {prethodnePartije.slice(0, 5).map((partija) => (
              <div className="nivo__zapis" key={partija.id}>
                <span>
                  {partija.nereseno
                    ? 'Nerešeno'
                    : `Pobednik: ${partija.igraci[partija.pobednikIndeks ?? 0]?.ime}`}
                </span>
                <span>
                  {formatirajVreme(partija.trajanjeSek)} · {partija.ukupnoPoteza} poteza ·{' '}
                  {new Date(partija.odigrana).toLocaleDateString('sr-RS')}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
