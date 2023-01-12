import { useState } from "react";
import BookingForm from "./BookingForm";
import BookingList from "./BookingList";

function Booking() {
  const [isBookingFormVisible, setIsBookingFormVisible] = useState(false);

  return (
    <>
      <BookingList onPressAdd={() => setIsBookingFormVisible(true)} />
      <BookingForm
        onClose={() => setIsBookingFormVisible(false)}
        open={isBookingFormVisible}
      />
    </>
  );
}

export default Booking;
