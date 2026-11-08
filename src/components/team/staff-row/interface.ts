import type { IStaffMember } from '@/services';

export interface IStaffRowProps {
  member: IStaffMember;
  /** Marks the signed-in user's own row. */
  isMe?: boolean;
}
