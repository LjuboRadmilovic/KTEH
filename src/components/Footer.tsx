import './Footer.css';

/** Podnozje sa izvorima podataka — isto na svim stranicama. */
export default function Footer() {
  const godina = new Date().getFullYear();

  return (
    <footer className="podnozje">
      <div className="podnozje__omotac">
        <span>Memorija · seminarski rad iz Klijentskih tehnologija · {godina}</span>
        <span className="podnozje__izvori">
          Podaci: lokalni JSON ·{' '}
          <a href="https://dog.ceo/dog-api/" target="_blank" rel="noreferrer">Dog CEO API</a> ·{' '}
          <a href="https://pokeapi.co/" target="_blank" rel="noreferrer">PokéAPI</a>
        </span>
      </div>
    </footer>
  );
}
