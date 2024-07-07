export const NAME_LABEL: string = `press text-green-400 w-full text-center text-4xl `;

export function NameLabel({ name }: { name: string }) {
  return <div className={NAME_LABEL}>{name}</div>;
}

export const OTHER_LABEL: string = `press text-red-400 w-full text-center text-2xl border-2 border-red-400 py-2`;

export const FOOTER_BTN_STYLE: string = `w-20 h-28 bg-gradient-to-b from-[#394d6f] to-[#272F45] text-white rounded-md shadow-[0_5px_0_0_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] hover:-translate-y-5 hover:shadow-[0_4px_0_0_rgba(0,0,0,0.5),0_8px_8px_-4px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.5),0_4px_4px_-2px_rgba(0,0,0,0.3)] transition-all duration-200 ease-in-out flex items-center justify-center border-t-4 border-l-4 border-[#4C5F87] border-b-4 border-b-[#1a1f35] z-40`;
