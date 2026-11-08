import type { Metadata } from 'next';
import { AdminView } from '@/components';
import { uiText } from '@/config';

export const metadata: Metadata = {
  title: uiText.admin.title,
};

/** Administration panel (`/admin`): administrators only. */
export default function AdminPage() {
  return <AdminView />;
}
