import type { IAdminService } from '../admin/interface';
import type { IAttendanceService } from '../attendance/interface';
import type { IAuthService } from '../auth/interface';
import type { IEventService } from '../events/interface';
import type { IMoodService } from '../mood/interface';
import type { IProfileService } from '../profile/interface';
import type { IRoomService } from '../rooms/interface';
import type { IStaffService } from '../staff/interface';
import type { IStatusSyncTarget } from '../status-sync/interface';
import type { IStoreService } from '../store/interface';
import type { IWalletService } from '../wallet/interface';

/**
 * Factory of the API services: the one place they are constructed, so a
 * service implementation can be swapped (e.g. in tests) without touching
 * its consumers.
 */
export interface IServiceFactory {
  createAuthService(): IAuthService;
  createProfileService(): IProfileService;
  createStaffService(): IStaffService;
  createAttendanceService(): IAttendanceService;
  createWalletService(): IWalletService;
  createStoreService(): IStoreService;
  createRoomService(): IRoomService;
  createEventService(): IEventService;
  createMoodService(): IMoodService;
  createAdminService(): IAdminService;
  /** Every external tool the mood is mirrored to, as one target. */
  createStatusSync(): IStatusSyncTarget;
}
