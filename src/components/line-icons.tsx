import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const paths: Record<string, string[]> = {
  arrowleft: ["M20 12H4", "M10 6l-6 6 6 6"],
  arrowright: ["M4 12h16", "M14 6l6 6-6 6"],
  arrowupright: ["M7 17 17 7", "M9 7h8v8"],
  arrowdown: ["M12 4v16", "M6 14l6 6 6-6"],
  book: ["M4 5h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H4V5Z", "M20 5h-6a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h6V5Z"],
  bookmark: ["M5 3h10v14l-5-4-5 4V3Z"],
  calendar: ["M4 6h16v14H4z", "M4 10h16", "M9 3v4", "M15 3v4"],
  check: ["M4 10l5 5L20 5"],
  chevrondown: ["M5 8l7 7 7-7"],
  circlehelp: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7", "M12 17h.01"],
  command: ["M8 6a2.5 2.5 0 1 0-2.5 2.5H8V6Zm0 0h8m-8 8a2.5 2.5 0 1 0-2.5-2.5H8V14Zm8-8a2.5 2.5 0 1 1 2.5 2.5H16V6Zm0 8a2.5 2.5 0 1 0 2.5-2.5H16v2.5ZM8 8v8m8-8v8H8"],
  cpu: ["M7 7h10v10H7z", "M10 3v4m4-4v4m-4 10v4m4-4v4M3 10h4m-4 4h4m10-4h4m-4 4h4"],
  database: ["M4 6c0-1.66 3.58-3 8-3s8 1.34 8 3", "M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6", "M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"],
  fork: ["M8 5v3a4 4 0 0 0 4 4h4", "M8 12v7", "M16 5v5", "M5 5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm-2 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  hash: ["M10 3 8 21", "M16 3l-2 18", "M4 9h17", "M3 15h17"],
  info: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 9v7", "M12 6h.01"],
  link: ["M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7", "M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"],
  loader: ["M19 12a7 7 0 1 1-7-7"],
  lock: ["M5 9h14v11H5z", "M8 9V6a4 4 0 0 1 8 0v3"],
  plus: ["M12 4v16", "M4 12h16"],
  search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "M16 16l5 5"],
  send: ["M4 12 20 4l-6 16-3-6-7-2Z", "M11 14l9-10"],
  shield: ["M12 3 4 6v6c0 5 3 8 8 9 5-1 8-4 8-9V6l-8-3Z", "M9 12l2 2 4-4"],
  sliders: ["M4 7h9m4 0h3M4 17h3m4 0h9", "M15 4v6M9 14v6"],
  spark: ["M12 3v5m0 8v5M3 12h5m8 0h5", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"],
  star: ["M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3Z"],
  waves: ["M3 12c2-3.5 4-3.5 6 0s4 3.5 6 0 4-3.5 6 0"],
  x: ["M5 5l14 14", "M19 5 5 19"],
};

export function LineIcon({ name, size = 16, ...rest }: IconProps & { name: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.55} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>{(paths[name] ?? paths.info).map((path, index) => <path key={index} d={path} />)}</svg>;
}
