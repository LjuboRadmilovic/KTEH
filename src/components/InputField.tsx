import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';
import './InputField.css';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  oznaka: string;
  greska?: string;
  pomoc?: string;
}

/** Polje forme sa oznakom, porukom o gresci i pomocnim tekstom. */
export default function InputField({
  oznaka,
  greska,
  pomoc,
  className = '',
  ...ostaleOsobine
}: InputFieldProps) {
  const id = useId();
  const idGreske = `${id}-greska`;
  const idPomoci = `${id}-pomoc`;

  return (
    <div className={`polje ${greska ? 'polje--greska' : ''} ${className}`.trim()}>
      <label className="polje__oznaka" htmlFor={id}>{oznaka}</label>
      <input
        id={id}
        className="polje__unos"
        aria-invalid={greska ? true : undefined}
        aria-describedby={greska ? idGreske : pomoc ? idPomoci : undefined}
        {...ostaleOsobine}
      />
      {greska ? (
        <span className="polje__greska" id={idGreske} role="alert">{greska}</span>
      ) : pomoc ? (
        <span className="polje__pomoc" id={idPomoci}>{pomoc}</span>
      ) : null}
    </div>
  );
}
