import { Form, type FormInstance } from "antd";
import { useEffect, useMemo } from "react";
import { api } from "../../../utils";
import type { BookingFormData } from "../booking.type";

export const useBookingFormRegionData = (
  form: FormInstance<BookingFormData>
) => {
  const selectedProvince: string = Form.useWatch("province", form);

  const { data: provincies, isLoading: isProvinciesLoading } =
    api.masterRegion.allProvince.useQuery();

  const provinceData = useMemo(() => {
    const province = provincies?.map((province) => ({
      value: province.id,
      label: province.name,
    }));

    return province;
  }, [provincies]);

  const regenciesData = useMemo(() => {
    if (selectedProvince) {
      const regency = provincies?.find(
        (province) => province.id === selectedProvince
      )?.regencies;
      console.log({ regency });

      const regencyData = regency?.map((regency) => ({
        value: regency.id,
        label: regency.name,
      }));

      return regencyData;
    }
    return [];
  }, [provincies, selectedProvince]);

  useEffect(() => {
    form.resetFields(["city"]);
  }, [form, selectedProvince]);

  return {
    provinceData,
    regenciesData,
    selectedProvince,
    isProvinciesLoading,
  };
};
