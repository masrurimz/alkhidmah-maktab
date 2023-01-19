import { type FormInstance } from "antd";
import { type MessageInstance } from "antd/es/message/interface";
import { type BookingCreateInput } from "../../../server/api/routers/booking.router";
import { api } from "../../../utils";
import { checkIsValidObjectId } from "../../common/utils/objectId";
import { useBookingStore } from "../booking.store";
import type { AddressOption, BookingFormData } from "../booking.type";

export const useBookingFormMutation = (
  form: FormInstance<BookingFormData>,
  messageApi: MessageInstance,
  regenciesData: AddressOption[],
  provinceData: AddressOption[]
) => {
  const apiUtils = api.useContext();

  const onClose = useBookingStore((state) => state.closeBookingForm);
  const selectedBookingId = useBookingStore((state) => state.selectedBookingId);

  const onSubmitSuccess = () => {
    apiUtils.booking.getAll.invalidate();
    form.resetFields();
    onClose();
  };

  const createBooking = api.booking.create.useMutation({
    onSuccess() {
      messageApi.open({
        type: "success",
        content: "Berhasil menambahkan data Booking",
      });
      onSubmitSuccess();
    },
  });
  const updateBooking = api.booking.update.useMutation({
    onSuccess() {
      messageApi.open({
        type: "success",
        content: "Berhasil memperbarui data Booking",
      });
      onSubmitSuccess();
    },
  });

  const handleSubmit = (value: BookingFormData) => {
    const cityName = regenciesData?.find(
      (regency) => regency.value === value.city
    )?.label;
    const provinceName = provinceData?.find(
      (province) => province.value === value.province
    )?.label;

    const contingentArr = value.contingents.map((contingent) => ({
      coordinator: {
        name: contingent.contingentCoordinatorName,
        phone: contingent.contingentCoordinatorPhone,
      },
      personCount: contingent.personCount,
      vechileType: contingent.vechileType,
      name: contingent.name,
    })) as BookingCreateInput;

    if (contingentArr.length === 0) {
      return;
    }

    const contingents: BookingCreateInput = contingentArr;

    if (
      !(contingents.length > 0) ||
      !value.contingents[0] ||
      !cityName ||
      !provinceName
    ) {
      return;
    }

    const data = {
      booker: {
        name: value.bookerName,
        phone: value.bookerPhone,
      },
      city: {
        id: value.city,
        name: cityName,
      },
      province: {
        id: value.province,
        name: provinceName,
      },
      contingent: contingents,
      regionCoordinator: {
        id:
          checkIsValidObjectId(value.regionCoordinatorName) &&
          checkIsValidObjectId(value.regionCoordinatorPhone)
            ? value.regionCoordinatorName
            : undefined,
        name: value.regionCoordinatorName,
        phone: value.regionCoordinatorPhone,
      },
    };

    if (selectedBookingId) {
      return updateBooking.mutate({
        id: selectedBookingId,
        ...data,
      });
    }

    createBooking.mutate(data);
  };

  return {
    handleSubmit,
    createBooking,
    updateBooking,
  };
};
