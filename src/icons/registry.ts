import { IIconDefinition, TIconName } from './interface';

/** Shorthand: a list of stroked paths. */
const stroke = (...paths: string[]): IIconDefinition => ({
  paths: paths.map((d) => ({ d })),
});

/** Path pieces reused by several glyphs. */
const CALENDAR = [
  `M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z`,
  `M4 10h16`,
  `M8 3v4`,
  `M16 3v4`,
];
const BELL = [
  `M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z`,
  `M10 20a2 2 0 0 0 4 0`,
];
const CIRCLE = `M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z`;
const EYE = `M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z`;
const EYE_PUPIL = `M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z`;

/**
 * Icon registry (Flyweight).
 *
 * Every glyph is stored once as intrinsic path data on a 24×24 grid and
 * shared by every `<Icon />` instance; size, stroke and colour are extrinsic
 * state supplied per use. Strokes use round caps and joins (soft UI), and a
 * zero-length segment such as `M12 8h.01` renders as a dot.
 */
export const iconRegistry: Record<TIconName, IIconDefinition> = {
  alert: stroke(
    `M10.3 4 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z`,
    `M12 9.5v4`,
    `M12 17h.01`,
  ),
  bag: stroke(
    `M5.5 8h13l-1 12a1 1 0 0 1-1 .9h-9a1 1 0 0 1-1-.9Z`,
    `M9 10V7a3 3 0 0 1 6 0v3`,
  ),
  bell: stroke(...BELL),
  'bell-off': stroke(...BELL, `M3 3l18 18`),
  book: stroke(
    `M5 5.5A2.5 2.5 0 0 1 7.5 3H19v14H7.5A2.5 2.5 0 0 0 5 19.5Z`,
    `M5 19.5A2.5 2.5 0 0 0 7.5 22H19v-5`,
    `M9 7h6`,
  ),
  building: stroke(
    `M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16`,
    `M16 9h2a2 2 0 0 1 2 2v10`,
    `M3 21h18`,
    `M8 7h4`,
    `M8 11h4`,
    `M8 15h4`,
  ),
  calendar: stroke(...CALENDAR),
  'calendar-off': stroke(...CALENDAR, `M3 3l18 18`),
  camera: stroke(
    `M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z`,
    `M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z`,
  ),
  check: stroke(`M5 12.5 10 17.5 19 7`),
  'check-circle': stroke(CIRCLE, `m8.5 12 2.5 2.5 4.5-5`),
  'chevron-left': stroke(`m15 18-6-6 6-6`),
  'chevron-right': stroke(`m9 18 6-6-6-6`),
  clock: stroke(CIRCLE, `M12 7v5l3 2`),
  close: stroke(`M6 6l12 12`, `M18 6 6 18`),
  coffee: stroke(
    `M4 9h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z`,
    `M16 10h1.5a2.5 2.5 0 0 1 0 5H16`,
    `M4 21h12`,
    `M8 3c-.6 1 .6 2 0 3`,
    `M12 3c-.6 1 .6 2 0 3`,
  ),
  coin: stroke(
    CIRCLE,
    `M12 7.5 13.3 10.2 16.2 10.6 14.1 12.6 14.6 15.5 12 14.1 9.4 15.5 9.9 12.6 7.8 10.6 10.7 10.2Z`,
  ),
  door: stroke(
    `M4 21h16`,
    `M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21`,
    `M14.5 12h.01`,
  ),
  download: stroke(`M12 4v11`, `m7 10 5 5 5-5`, `M5 20h14`),
  edit: stroke(`M4 20h4L19 9a2.83 2.83 0 0 0-4-4L4 16Z`, `m13.5 6.5 4 4`),
  eye: stroke(EYE, EYE_PUPIL),
  'eye-off': stroke(EYE, EYE_PUPIL, `M3 3l18 18`),
  gift: stroke(
    `M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z`,
    `M3 7h18v4H3Z`,
    `M12 7v14`,
    `M12 7S10.5 3 8 3a2 2 0 0 0 0 4`,
    `M12 7s1.5-4 4-4a2 2 0 0 1 0 4`,
  ),
  home: stroke(
    `M3 10.5 12 3l9 7.5`,
    `M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9`,
  ),
  image: stroke(
    `M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z`,
    `m4 16 4.5-4.5a1.5 1.5 0 0 1 2 0L16 17`,
    `m14 15 1.5-1.5a1.5 1.5 0 0 1 2 0L20 16`,
    `M15 9h.01`,
  ),
  info: stroke(CIRCLE, `M12 11v5`, `M12 8h.01`),
  laptop: stroke(`M5 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9H5Z`, `M3 19h18`),
  lock: stroke(
    `M5 12a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z`,
    `M8 11V8a4 4 0 0 1 8 0v3`,
  ),
  logout: stroke(
    `M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3`,
    `M10 8l-4 4 4 4`,
    `M6 12h10`,
  ),
  'map-pin': stroke(
    `M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z`,
    `M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z`,
  ),
  megaphone: stroke(
    `M3 10v4a1 1 0 0 0 1 1h3l9 4.5V4.5L7 9H4a1 1 0 0 0-1 1Z`,
    `M19.5 9a3.5 3.5 0 0 1 0 6`,
    `M7 15l1.5 5h2.5l-1-4`,
  ),
  message: stroke(
    `M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v10a1.5 1.5 0 0 1-1.5 1.5H9l-5 4Z`,
    `M8.5 10.5h.01`,
    `M12 10.5h.01`,
    `M15.5 10.5h.01`,
  ),
  minus: stroke(`M5 12h14`),
  monitor: stroke(
    `M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z`,
    `M8 20h8`,
    `M12 16v4`,
  ),
  moon: stroke(`M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z`),
  plus: stroke(`M12 5v14`, `M5 12h14`),
  presentation: stroke(
    `M3 4h18`,
    `M4 4v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4`,
    `M12 15v3`,
    `M8 21l4-3 4 3`,
    `m8 11 3-3 2 2 3-3`,
  ),
  receipt: stroke(
    `M6 3h12v18l-3-2-3 2-3-2-3 2Z`,
    `M9 8h6`,
    `M9 12h6`,
    `M9 16h3`,
  ),
  refresh: stroke(`M20 12a8 8 0 1 1-2.34-5.66`, `M20 4v5h-5`),
  'scan-face': stroke(
    `M4 8V6a2 2 0 0 1 2-2h2`,
    `M16 4h2a2 2 0 0 1 2 2v2`,
    `M20 16v2a2 2 0 0 1-2 2h-2`,
    `M8 20H6a2 2 0 0 1-2-2v-2`,
    `M9 9.5h.01`,
    `M15 9.5h.01`,
    `M9.5 15a3.5 3.5 0 0 0 5 0`,
  ),
  search: stroke(`M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z`, `m20 20-4-4`),
  share: stroke(
    `M12 3v12`,
    `m8 7 4-4 4 4`,
    `M7 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1`,
  ),
  shield: stroke(
    `M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6Z`,
    `m9 12 2 2 4-4`,
  ),
  shirt: stroke(`M8 3 3 6l2 5 2-1v11h10V10l2 1 2-5-5-3a4 4 0 0 1-8 0Z`),
  smile: stroke(
    CIRCLE,
    `M8.5 14.5a4.5 4.5 0 0 0 7 0`,
    `M9 9.5h.01`,
    `M15 9.5h.01`,
  ),
  sparkles: stroke(
    `M11 3 12.9 8.1 18 10 12.9 11.9 11 17 9.1 11.9 4 10 9.1 8.1Z`,
    `M18.5 15 19.3 17.2 21.5 18 19.3 18.8 18.5 21 17.7 18.8 15.5 18 17.7 17.2Z`,
  ),
  speaker: stroke(
    `M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z`,
    `M12 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z`,
    `M12 7h.01`,
  ),
  sun: stroke(
    `M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z`,
    `M12 2v2`,
    `M12 20v2`,
    `m4.93 4.93 1.41 1.41`,
    `m17.66 17.66 1.41 1.41`,
    `M2 12h2`,
    `M20 12h2`,
    `m4.93 19.07 1.41-1.41`,
    `m17.66 6.34 1.41-1.41`,
  ),
  trash: stroke(
    `M4 7h16`,
    `M10 11v6`,
    `M14 11v6`,
    `M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13`,
    `M9 7V4h6v3`,
  ),
  user: stroke(`M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z`, `M4 21a8 8 0 0 1 16 0`),
  users: stroke(
    `M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z`,
    `M2 21a7 7 0 0 1 14 0`,
    `M16 3.13a4 4 0 0 1 0 7.75`,
    `M22 21a7 7 0 0 0-4-6.32`,
  ),
  video: stroke(
    `M3 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z`,
    `m16 10 5-3v10l-5-3`,
  ),
  wallet: stroke(
    `M19 7V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2`,
    `M3 6v12a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3`,
    `M20 12v-4a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2`,
    `M21 12h-4a2 2 0 0 0 0 4h4Z`,
  ),
  whiteboard: stroke(
    `M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10H4Z`,
    `M7 15l-2 6`,
    `M17 15l2 6`,
    `M8 8.5h5`,
    `M8 11.5h8`,
  ),
  'wifi-off': stroke(
    `M3 3l18 18`,
    `M8.5 16.5a5 5 0 0 1 7 0`,
    `M5 12.9a10 10 0 0 1 5.2-2.8`,
    `M19 12.9a10 10 0 0 0-2.3-1.6`,
    `M2 8.8a15 15 0 0 1 4.2-2.6`,
    `M22 8.8a15 15 0 0 0-11-3.7`,
    `M12 20h.01`,
  ),
};
