import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  adminKeys,
  eventKeys,
  profileKeys,
  roomKeys,
  staffKeys,
  storeKeys,
  walletKeys,
} from '@/lib/query';
import {
  adminService,
  IAdjustCoinsPayload,
  ICreateStaffPayload,
  IEventPayload,
  IReschedulePayload,
  IStaffPayload,
  TProductPayload,
  TRoomPayload,
} from '@/services';

/**
 * Administration data hooks over `/admin/*`. Lists are fetched only while
 * `isEnabled` (the panel shows them to administrators only), and every
 * mutation refreshes the admin list it changed plus the member-facing caches
 * that show the same records (store, rooms, events, team, wallet), so the
 * rest of the app never shows a stale copy after an admin edit.
 */

// Queries

export const useAdminStaff = (isEnabled = true) =>
  useQuery({
    queryKey: adminKeys.staff(),
    queryFn: () => adminService.getStaff(),
    enabled: isEnabled,
  });

export const useAdminStaffTransactions = (id: string | null) =>
  useQuery({
    queryKey: adminKeys.staffTransactions(id ?? ``),
    queryFn: () => adminService.getStaffTransactions(id ?? ``),
    enabled: id !== null,
  });

export const useAdminProducts = (isEnabled = true) =>
  useQuery({
    queryKey: adminKeys.products(),
    queryFn: () => adminService.getProducts(),
    enabled: isEnabled,
  });

export const useAdminOrders = (isEnabled = true) =>
  useQuery({
    queryKey: adminKeys.orders(),
    queryFn: () => adminService.getOrders(),
    enabled: isEnabled,
    refetchOnWindowFocus: true,
  });

/**
 * The order with this receipt number (a list of one, or empty), straight from
 * the server so orders older than the list are found too. Under the orders
 * key, so handing over or cancelling refreshes it.
 */
export const useAdminOrderByReceipt = (receipt: number | null) =>
  useQuery({
    queryKey: [...adminKeys.orders(), `receipt`, receipt] as const,
    queryFn: () => adminService.getOrders(receipt ?? undefined),
    enabled: receipt !== null,
  });

export const useAdminRooms = (isEnabled = true) =>
  useQuery({
    queryKey: adminKeys.rooms(),
    queryFn: () => adminService.getRooms(),
    enabled: isEnabled,
  });

export const useAdminBookings = (isEnabled = true) =>
  useQuery({
    queryKey: adminKeys.bookings(),
    queryFn: () => adminService.getBookings(),
    enabled: isEnabled,
    refetchOnWindowFocus: true,
  });

export const useAdminEvents = (isEnabled = true) =>
  useQuery({
    queryKey: adminKeys.events(),
    queryFn: () => adminService.getEvents(),
    enabled: isEnabled,
  });

// Mutations

/**
 * A mutation that, once settled (success or failure: a failure such as a
 * 409 may mean our copy was stale), refreshes the given cache branches.
 */
const useAdminMutation = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  affected: readonly QueryKey[],
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSettled: () =>
      Promise.all(
        affected.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
};

/** Staff edits show in the team list and, for one's own record, the profile. */
const STAFF_AFFECTED = [adminKeys.staff(), staffKeys.all, profileKeys.all];

export const useCreateStaff = () =>
  useAdminMutation(
    (payload: ICreateStaffPayload) => adminService.createStaff(payload),
    STAFF_AFFECTED,
  );

export const useUpdateStaff = () =>
  useAdminMutation(
    ({ id, payload }: { id: string; payload: IStaffPayload }) =>
      adminService.updateStaff(id, payload),
    STAFF_AFFECTED,
  );

export const useSetStaffPassword = () =>
  useAdminMutation(
    ({ id, password }: { id: string; password: string }) =>
      adminService.setPassword(id, password),
    [],
  );

export const useUploadStaffAvatar = () =>
  useAdminMutation(
    ({ id, file }: { id: string; file: File }) =>
      adminService.uploadStaffAvatar(id, file),
    STAFF_AFFECTED,
  );

export const useRemoveStaffAvatar = () =>
  useAdminMutation(
    (id: string) => adminService.removeStaffAvatar(id),
    STAFF_AFFECTED,
  );

export const useAdjustCoins = () =>
  useAdminMutation(
    ({ id, payload }: { id: string; payload: IAdjustCoinsPayload }) =>
      adminService.adjustCoins(id, payload),
    [adminKeys.all, walletKeys.all],
  );

const STORE_AFFECTED = [
  adminKeys.products(),
  adminKeys.orders(),
  storeKeys.all,
];

export const useCreateProduct = () =>
  useAdminMutation(
    (payload: TProductPayload) => adminService.createProduct(payload),
    STORE_AFFECTED,
  );

export const useUpdateProduct = () =>
  useAdminMutation(
    ({ id, payload }: { id: string; payload: TProductPayload }) =>
      adminService.updateProduct(id, payload),
    STORE_AFFECTED,
  );

export const useDeleteProduct = () =>
  useAdminMutation(
    (id: string) => adminService.deleteProduct(id),
    STORE_AFFECTED,
  );

export const useUploadProductImage = () =>
  useAdminMutation(
    ({ id, file }: { id: string; file: File }) =>
      adminService.uploadProductImage(id, file),
    STORE_AFFECTED,
  );

export const useRemoveProductImage = () =>
  useAdminMutation(
    (id: string) => adminService.removeProductImage(id),
    STORE_AFFECTED,
  );

/** Order changes move coins and stock: wallet and balances refresh too. */
const ORDER_AFFECTED = [
  adminKeys.orders(),
  adminKeys.products(),
  adminKeys.staff(),
  storeKeys.all,
  walletKeys.all,
];

export const useFulfilOrder = () =>
  useAdminMutation(
    (id: string) => adminService.fulfilOrder(id),
    ORDER_AFFECTED,
  );

export const useCancelOrder = () =>
  useAdminMutation(
    (id: string) => adminService.cancelOrder(id),
    ORDER_AFFECTED,
  );

const ROOMS_AFFECTED = [adminKeys.rooms(), adminKeys.bookings(), roomKeys.all];

export const useCreateRoom = () =>
  useAdminMutation(
    (payload: TRoomPayload) => adminService.createRoom(payload),
    ROOMS_AFFECTED,
  );

export const useUpdateRoom = () =>
  useAdminMutation(
    ({ id, payload }: { id: string; payload: TRoomPayload }) =>
      adminService.updateRoom(id, payload),
    ROOMS_AFFECTED,
  );

export const useDeleteRoom = () =>
  useAdminMutation((id: string) => adminService.deleteRoom(id), ROOMS_AFFECTED);

export const useRescheduleBooking = () =>
  useAdminMutation(
    ({ id, payload }: { id: string; payload: IReschedulePayload }) =>
      adminService.rescheduleBooking(id, payload),
    ROOMS_AFFECTED,
  );

/** Cancels anyone's future booking, or ends one in progress. */
export const useAdminEndBooking = () =>
  useAdminMutation((id: string) => adminService.endBooking(id), ROOMS_AFFECTED);

const EVENTS_AFFECTED = [adminKeys.events(), eventKeys.all];

export const useCreateEvent = () =>
  useAdminMutation(
    (payload: IEventPayload) => adminService.createEvent(payload),
    EVENTS_AFFECTED,
  );

export const useUpdateEvent = () =>
  useAdminMutation(
    ({ id, payload }: { id: string; payload: IEventPayload }) =>
      adminService.updateEvent(id, payload),
    EVENTS_AFFECTED,
  );

export const useDeleteEvent = () =>
  useAdminMutation(
    (id: string) => adminService.deleteEvent(id),
    EVENTS_AFFECTED,
  );
