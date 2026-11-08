import { AdminService } from '../admin/admin.service';
import { AnnouncementService } from '../announcements/announcements.service';
import { AttendanceService } from '../attendance/attendance.service';
import { AuthService } from '../auth/auth.service';
import { EventService } from '../events/events.service';
import { MoodService } from '../mood/mood.service';
import { ProfileService } from '../profile/profile.service';
import { PushService } from '../push/push.service';
import { RoomService } from '../rooms/rooms.service';
import { StaffService } from '../staff/staff.service';
import { CompositeStatusSync } from '../status-sync/composite';
import { MattermostSyncTarget } from '../status-sync/mattermost.target';
import { StoreService } from '../store/store.service';
import { WalletService } from '../wallet/wallet.service';
import { IServiceFactory } from './interface';

/** Services that talk to the staff API over HTTP. */
export class HttpServiceFactory implements IServiceFactory {
  createAuthService = () => new AuthService();
  createProfileService = () => new ProfileService();
  createStaffService = () => new StaffService();
  createAttendanceService = () => new AttendanceService();
  createWalletService = () => new WalletService();
  createStoreService = () => new StoreService();
  createRoomService = () => new RoomService();
  createEventService = () => new EventService();
  createMoodService = () => new MoodService();
  createAdminService = () => new AdminService();
  createPushService = () => new PushService();
  createAnnouncementService = () => new AnnouncementService();
  createStatusSync = () =>
    new CompositeStatusSync(`status-sync`, [new MattermostSyncTarget()]);
}
