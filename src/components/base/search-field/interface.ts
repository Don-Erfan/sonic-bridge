export interface ISearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name (there is no visible label). */
  'aria-label': string;
  placeholder?: string;
}
