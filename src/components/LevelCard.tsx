import { Link } from 'react-router-dom';
import type { Nivo, Paket, Tezina } from '../models/types';
import './LevelCard.css';

interface LevelCardProps {
  nivo: Nivo;
  paket: Paket;
  tezina?: Tezina;
  otkljucan: boolean;
  odigran: boolean;
  nazivNivoaZaOtkljucavanje?: string;
}

/** Kartica jednog nivoa u spisku nivoa. */
export default function LevelCard({
  nivo,
  paket,
  tezina,
  otkljucan,
  odigran,
  nazivNivoaZaOtkljucavanje,
}: LevelCardProps) {
  const sadrzaj = (
    <>
      <div className="nivo-kartica__slika" style={{ background: `linear-gradient(140deg, ${paket.boja}, rgba(10,14,28,0.9))` }}>
        <span aria-hidden="true">{otkljucan ? paket.emoji : '🔒'}</span>
      </div>

      <div className="nivo-kartica__telo">
        <div className="nivo-kartica__vrh">
          <h3 className="nivo-kartica__naslov">{nivo.naziv}</h3>
          {tezina ? (
            <span className="nivo-kartica__tezina" style={{ color: tezina.boja, borderColor: tezina.boja }}>
              {tezina.naziv}
            </span>
          ) : null}
        </div>

        <p className="nivo-kartica__paket">{paket.naziv}</p>

        <div className="nivo-kartica__podaci">
          <span>{nivo.tabla.kolone}×{nivo.tabla.redovi}</span>
          <span>{nivo.parova} parova</span>
          <span>~{Math.round(nivo.procenjenoTrajanjeSek / 60)} min</span>
        </div>

        {odigran ? <span className="nivo-kartica__oznaka">već odigran</span> : null}
        {!otkljucan ? (
          <span className="nivo-kartica__zakljucan">
            Otključava se kad odigraš {nazivNivoaZaOtkljucavanje ?? 'prethodni nivo'}
          </span>
        ) : null}
      </div>
    </>
  );

  if (!otkljucan) {
    return <article className="nivo-kartica nivo-kartica--zakljucana">{sadrzaj}</article>;
  }

  return (
    <Link className="nivo-kartica" to={`/nivoi/${nivo.id}`}>
      {sadrzaj}
    </Link>
  );
}
