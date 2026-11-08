export interface IServiceWorkerRegistrarProps {
  /** Register only in production builds (default): dev caching breaks HMR. */
  isEnabled?: boolean;
}
