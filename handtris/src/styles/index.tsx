export const NAME_LABEL: string = `press text-green-400 w-full text-center text-4xl `;

export function NameLabel({ name }: { name: string }) {
  return <div className={NAME_LABEL}>{name}</div>;
}

export const OTHER_LABEL: string = `press text-red-400 w-full text-center text-2xl border-2 border-red-400 py-2`;
