import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type VrstaDugmeta = 'primarno' | 'sekundarno' | 'opasno';
export type VelicinaDugmeta = 'malo' | 'srednje' | 'veliko';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  vrsta?: VrstaDugmeta;
  velicina?: VelicinaDugmeta;
  punaSirina?: boolean;
  ikona?: ReactNode;
  children: ReactNode;
}

/** Dugme koje se koristi na svim stranicama aplikacije. */
export default function Button({
  vrsta = 'primarno',
  velicina = 'srednje',
  punaSirina = false,
  ikona,
  children,
  className = '',
  ...ostaleOsobine
}: ButtonProps) {
  const klase = [
    'dugme',
    `dugme--${vrsta}`,
    `dugme--${velicina}`,
    punaSirina ? 'dugme--puna-sirina' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={klase} {...ostaleOsobine}>
      {ikona ? <span className="dugme__ikona" aria-hidden="true">{ikona}</span> : null}
      <span>{children}</span>
    </button>
  );
}
