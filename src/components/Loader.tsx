import './Loader.css';

interface LoaderProps {
  poruka?: string;
}

/** Prikaz dok se cekaju podaci (JSON fajl ili odgovor API-ja). */
export default function Loader({ poruka = 'Učitavanje…' }: LoaderProps) {
  return (
    <div className="ucitavanje" role="status" aria-live="polite">
      <span className="ucitavanje__krug" aria-hidden="true" />
      <span className="ucitavanje__tekst">{poruka}</span>
    </div>
  );
}
