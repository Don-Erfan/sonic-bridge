export interface IErrorStateProps {
  /** Defaults to the generic "could not load" sentence. */
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}
