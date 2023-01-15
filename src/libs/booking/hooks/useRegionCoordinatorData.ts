import type { FormInstance } from "antd";
import { useState } from "react";
import { useDebounce } from "usehooks-ts";
import { api } from "../../../utils";
import { checkIsValidObjectId } from "../../common/utils/objectId";
import type { BookingFormData } from "../booking.type";
import type { SelectCustomOptionProps } from "../SelectCustomOption";

export const useRegionCoordinatorData = (
  form: FormInstance<BookingFormData>
) => {
  const [regionCoordinatorQueryName, setRegionCoordinatorQueryName] =
    useState("");
  const regionCoordinatorQueryNameDebounced = useDebounce(
    regionCoordinatorQueryName,
    300
  );
  const {
    data: regionCoordinatorNames,
    isLoading: isRegionCoordinatorNamesLoading,
  } = api.regionCoordinator.byName.useQuery(
    regionCoordinatorQueryNameDebounced,
    {
      queryKey: [
        "regionCoordinator.byName",
        regionCoordinatorQueryNameDebounced,
      ],
    }
  );

  const [regionCoordinatorQueryPhone, setRegionCoordinatorQueryPhone] =
    useState("");
  const regionCoordinatorQueryPhoneDebounced = useDebounce(
    regionCoordinatorQueryPhone,
    300
  );
  const {
    data: regionCoordinatorPhones,
    isLoading: isRegionCoordinatorPhonesLoading,
  } = api.regionCoordinator.byPhone.useQuery(
    regionCoordinatorQueryPhoneDebounced,
    {
      queryKey: [
        "regionCoordinator.byPhone",
        regionCoordinatorQueryPhoneDebounced,
      ],
    }
  );

  const selectedPhone = form.getFieldValue("regionCoordinatorPhone");
  const isSelectedPhoneUuid = checkIsValidObjectId(selectedPhone);

  const selectedName = form.getFieldValue("regionCoordinatorName");
  const isSelectedNameUuid = checkIsValidObjectId(selectedName);

  const isSameEntity =
    isSelectedNameUuid && isSelectedPhoneUuid && selectedName === selectedPhone;

  const selectCustomOptionNameProps: SelectCustomOptionProps = {
    loading: isRegionCoordinatorNamesLoading,
    options: regionCoordinatorNames?.map((c) => ({
      label: c.name,
      value: c.id,
      data: {
        id: c.id,
        name: c.name,
        phone: c.phone,
      },
    })),
    onSearch: setRegionCoordinatorQueryName,
    onSelect: (_, option) => {
      form.setFieldsValue({
        regionCoordinatorPhone: option.data.id,
      });
    },
    onClickDropdownAdd: () => {
      const data: Partial<BookingFormData> = {
        regionCoordinatorName: regionCoordinatorQueryNameDebounced,
      };

      if (isSelectedPhoneUuid && !isSameEntity) {
        data.regionCoordinatorPhone = "";
      }

      form.setFieldsValue(data);
    },
    searchQuery: regionCoordinatorQueryNameDebounced,
  };

  const selectCustomOptionPhoneProps: SelectCustomOptionProps = {
    loading: isRegionCoordinatorPhonesLoading,
    options: regionCoordinatorPhones?.map((c) => ({
      label: c.phone,
      value: c.id,
      data: {
        id: c.id,
        name: c.name,
        phone: c.phone,
      },
    })),
    onSearch: setRegionCoordinatorQueryPhone,
    onSelect: (_, option) => {
      form.setFieldsValue({
        regionCoordinatorName: option.data.id,
      });
    },
    onClickDropdownAdd: () => {
      const data: Partial<BookingFormData> = {
        regionCoordinatorPhone: regionCoordinatorQueryPhoneDebounced,
      };

      if (isSelectedNameUuid && !isSameEntity) {
        data.regionCoordinatorName = "";
      }

      form.setFieldsValue(data);
    },
    searchQuery: regionCoordinatorQueryPhoneDebounced,
  };

  return {
    selectCustomOptionPhoneProps,
    selectCustomOptionNameProps,
  };
};
