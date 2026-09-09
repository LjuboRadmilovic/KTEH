import type { ReactNode } from 'react';

interface PageHeaderProps {
  nadnaslov?: string;
  naslov: string;
  opis?: string;
  akcija?: ReactNode;
}

/** Zaglavlje stranice: nadnaslov, naslov, opis i po potrebi dugme sa desne strane. */
export default function PageHeader({ nadnaslov, naslov, opis, akcija }: PageHeaderProps) {
  return (
    <div className="zaglavlje-strane">
      {nadnaslov ? <span className="zaglavlje-strane__nadnaslov">{nadnaslov}</span> : null}
      <h1>{naslov}</h1>
      {opis ? <p className="zaglavlje-strane__opis">{opis}</p> : null}
      {akcija ? <div style={{ marginTop: 'var(--razmak-4)' }}>{akcija}</div> : null}
    </div>
  );
}
