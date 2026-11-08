import { HttpServiceFactory } from './http.factory';
import { IServiceFactory } from './interface';

/** The services of the staff API, created once. */
export const serviceFactory: IServiceFactory = new HttpServiceFactory();

export * from './interface';
