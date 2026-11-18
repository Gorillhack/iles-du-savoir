import type { ISODate } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export const toISODate = (d: Date): ISODate => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const today = (): ISODate => toISODate(new Date());

export const parseISODate = (s: ISODate): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: ISODate, n: number): ISODate => {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

export const daysBetween = (from: ISODate, to: ISODate) =>
  Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86_400_000);

const DAY_FMT = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const SHORT_FMT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

/** « Aujourd'hui », « Demain », « Hier », sinon « jeudi 20 novembre ». */
export const dueLabel = (s: ISODate, ref: ISODate = today()): string => {
  const diff = daysBetween(ref, s);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Demain';
  if (diff === -1) return 'Hier';
  return DAY_FMT.format(parseISODate(s));
};

export const shortDate = (s: ISODate) => SHORT_FMT.format(parseISODate(s));

export const longDate = (s: ISODate) => DAY_FMT.format(parseISODate(s));

/** Lundi de la semaine contenant la date. */
export const startOfWeek = (s: ISODate): ISODate => {
  const d = parseISODate(s);
  const dow = (d.getDay() + 6) % 7;
  return addDays(s, -dow);
};

export const formatDuration = (seconds: number) => {
  const m = Math.round(seconds / 60);
  if (m < 1) return '< 1 min';
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${pad(m % 60)}`;
};

export const timeOf = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
