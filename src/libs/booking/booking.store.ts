import create from "zustand";

export interface BookingStore {
  isBookingFormOpen: boolean;
  selectedBookingId?: string;
  openBookingForm: (bookingId?: string) => void;
  closeBookingForm: () => void;
  clearSelectedBookingId: () => void;
}

export const useBookingStore = create<BookingStore>()((set) => ({
  isBookingFormOpen: false,
  selectedBookingId: undefined,
  openBookingForm: (bookingId) =>
    set({ isBookingFormOpen: true, selectedBookingId: bookingId }),
  closeBookingForm: () => set({ isBookingFormOpen: false }),
  clearSelectedBookingId: () => set({ selectedBookingId: undefined }),
}));
