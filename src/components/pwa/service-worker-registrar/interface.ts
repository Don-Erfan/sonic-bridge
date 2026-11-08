export interface IServiceWorkerRegistrarProps {
  /**
   * `false` unregisters every service worker instead. Default `true`;
   * development builds register it in dev mode (push only, no caching).
   */
  isEnabled?: boolean;
}
