/**
 * What a person may do. Every role uses the app; all but `member` also
 * administer it (`/admin`), each within its own areas (`permissions`).
 */
export type TStaffRole =
  | `member`
  | `hr`
  | `marketing`
  | `tech-lead`
  | `office-manager`
  | `super-admin`;

/** Every role, in the order the app lists them. */
export const STAFF_ROLES: readonly TStaffRole[] = [
  `member`,
  `hr`,
  `marketing`,
  `tech-lead`,
  `office-manager`,
  `super-admin`,
];

/**
 * An administration area: `staff` (people, details, photos), `access`
 * (passwords, activation), `roles`, `coins`, `store` (products), `orders`,
 * `rooms` (rooms and bookings), `events`, `announcements` (to all staff).
 */
export type TAdminArea =
  | `staff`
  | `access`
  | `roles`
  | `coins`
  | `store`
  | `orders`
  | `rooms`
  | `events`
  | `announcements`;

/** The signed-in staff member. */
export interface IProfile {
  id: string;
  /** Sign-in name. */
  username: string;
  fullName: string;
  jobTitle: string;
  team: string;
  email: string;
  /**
   * Profile photo: a path on the API server (`/api/v1/media/…`), resolved
   * with `resolveMediaUrl`; `null` shows initials.
   */
  avatarUrl: string | null;
  role: TStaffRole;
  /**
   * The administration areas the role may manage (empty for `member`), as
   * the API decides them — the app shows only these parts of `/admin`.
   */
  permissions: TAdminArea[];
  /** Linked Mattermost account, `null` when not linked yet. */
  mattermost: IMattermostAccount | null;
}

export interface IMattermostAccount {
  userId: string;
  username: string;
}

/**
 * Profile API contract: `GET /profile` and the profile photo
 * (`POST|DELETE /profile/avatar`, answering the updated profile).
 */
export interface IProfileService {
  getProfile(): Promise<IProfile>;
  /** Uploads a JPEG, PNG or WebP of at most 5 MiB as the photo. */
  uploadAvatar(file: File): Promise<IProfile>;
  removeAvatar(): Promise<IProfile>;
}

/**
 * The profile's permissions; an empty list when absent (an API older than
 * the permission matrix sends none, which safely means "no admin areas").
 */
export const permissionsOf = (
  profile: Pick<IProfile, `permissions`> | undefined,
): readonly TAdminArea[] =>
  Array.isArray(profile?.permissions) ? profile.permissions : [];

/** Whether the person may use the administration panel at all. */
export const isAdmin = (
  profile: Pick<IProfile, `permissions`> | undefined,
): boolean => permissionsOf(profile).length > 0;

/** Whether the person may manage `area` of the administration panel. */
export const hasPermission = (
  profile: Pick<IProfile, `permissions`> | undefined,
  area: TAdminArea,
): boolean => permissionsOf(profile).includes(area);

/** Whether `role` is administrative (anything but `member`). */
export const isAdministrativeRole = (role: TStaffRole): boolean =>
  role !== `member`;
