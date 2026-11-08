import { serviceFactory } from './factory';

/**
 * API services barrel.
 *
 * Each feature lives in its own directory: `interface.ts` (payload types and
 * the service contract) and `<name>.service.ts` (an `AbstractAPI` subclass of
 * typed HTTP methods against the staff API). The instances below come from
 * one factory (`./factory`).
 *
 * Instances are module-level Singletons: they are stateless wrappers over
 * the shared HTTP client.
 *
 * The shared interceptor is vendored under `./interceptor` and re-exported
 * here for consumers. Services themselves must import it relatively
 * (`../interceptor`) — importing through this barrel would create a cycle.
 */
export const authService = serviceFactory.createAuthService();
export const profileService = serviceFactory.createProfileService();
export const staffService = serviceFactory.createStaffService();
export const attendanceService = serviceFactory.createAttendanceService();
export const walletService = serviceFactory.createWalletService();
export const storeService = serviceFactory.createStoreService();
export const roomService = serviceFactory.createRoomService();
export const eventService = serviceFactory.createEventService();
export const moodService = serviceFactory.createMoodService();
export const adminService = serviceFactory.createAdminService();
export const pushService = serviceFactory.createPushService();
export const announcementService = serviceFactory.createAnnouncementService();
export const statusSync = serviceFactory.createStatusSync();

export * from './admin';
export * from './announcements';
export * from './attendance';
export * from './auth';
export * from './common';
export * from './events';
export * from './factory';
export * from './interceptor';
export * from './mood';
export * from './profile';
export * from './push';
export * from './rooms';
export * from './staff';
export * from './status-sync';
export * from './store';
export * from './wallet';
