/** A message an administrator sent to all staff (`GET /announcements`). */
export interface IAnnouncement {
  id: string;
  title: string;
  body: string;
  /** Who sent it (their name at that time). */
  authorName: string;
  /** Epoch ms. */
  createdAt: number;
}

/** Announcements API contract. */
export interface IAnnouncementService {
  /** `GET /announcements` — newest first, at most 50. */
  getAnnouncements(): Promise<IAnnouncement[]>;
}
