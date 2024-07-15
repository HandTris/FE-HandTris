export const NAME_LABEL: string = `press text-green-400 w-full text-center text-4xl `;

export function NameLabel({ name }: { name: string }) {
  return <div className={NAME_LABEL}>{name}</div>;
}

export const OTHER_LABEL: string = `press text-red-400 w-full text-center text-2xl border-2 border-red-400 py-2`;

export const FOOTER_BTN_STYLE: string = `w-20 h-28 bg-gradient-to-b from-[#394d6f] to-[#272F45] text-white rounded-md shadow-[0_5px_0_0_rgba(0,0,0,0.5),0_10px_10px_-5px_rgba(0,0,0,0.3)] hover:-translate-y-5 hover:shadow-[0_4px_0_0_rgba(0,0,0,0.5),0_8px_8px_-4px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-[0_2px_0_0_rgba(0,0,0,0.5),0_4px_4px_-2px_rgba(0,0,0,0.3)] transition-all duration-200 ease-in-out flex items-center justify-center border-t-4 border-l-4 border-[#4C5F87] border-b-4 border-b-[#1a1f35] z-40`;

export const COLORS = {
  cyan: {
    light: "#5BFFFF",
    main: "#00FFFF",
    dark: "#00CCCC",
    ghost: "#00CCCC",
  },
  blue: {
    light: "#5B5BFF",
    main: "#0000FF",
    dark: "#0000CC",
    ghost: "#0000CC",
  },
  orange: {
    light: "#FFAD5B",
    main: "#FF8C00",
    dark: "#CC7000",
    ghost: "#CC7000",
  },
  yellow: {
    light: "#FFFF5B",
    main: "#FFFF00",
    dark: "#CCCC00",
    ghost: "#CCCC00",
  },
  green: {
    light: "#5BFF5B",
    main: "#00FF00",
    dark: "#00CC00",
    ghost: "#00CC00",
  },
  purple: {
    light: "#AD5BFF",
    main: "#8C00FF",
    dark: "#7000CC",
    ghost: "#7000CC",
  },
  pink: {
    light: "#FF5BAD",
    main: "#FF00FF",
    dark: "#CC00CC",
    ghost: "#CC00CC",
  },
  red: {
    light: "#FF5B5B",
    main: "#FF0000",
    dark: "#CC0000",
    ghost: "#CC0000",
  },
};
