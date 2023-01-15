import { CloseCircleTwoTone, PlusOutlined } from "@ant-design/icons";
import { type Booking } from "@prisma/client";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import React from "react";
import { api } from "../../utils/api";
import { checkIsValidObjectId } from "../common/utils/objectId";
import { type BookingFormData } from "./booking.type";
import { useBookingFormRegionData, useRegionCoordinatorData } from "./hooks";
import SelectCustomOption from "./SelectCustomOption";

const { Option } = Select;

interface BookingFormProps {
  selectedBooking?: Booking;
  open: boolean;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = (props) => {
  const { selectedBooking, onClose, open } = props;

  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm<BookingFormData>();
  const selectedProvince: string = Form.useWatch("province", form);

  const { mutate, isLoading: isMutating } = api.booking.create.useMutation({
    onSuccess(data, variables, context) {
      messageApi.open({
        type: "success",
        content: "Berhasil menambahkan data Booking",
      });
    },
  });

  const { selectCustomOptionNameProps, selectCustomOptionPhoneProps } =
    useRegionCoordinatorData(form);

  const { provinceData, regenciesData, isProvinciesLoading } =
    useBookingFormRegionData({
      selectedProvince,
      formInstance: form,
    });

  const handleAddContingent = (value: BookingFormData) => {
    const cityName = regenciesData?.find(
      (regency) => regency.value === value.city
    )?.label;
    const provinceName = provinceData?.find(
      (province) => province.value === value.province
    )?.label;

    if (
      value.contingents.length === 0 ||
      !value.contingents[0] ||
      !cityName ||
      !provinceName
    ) {
      return;
    }

    const contingent = value.contingents.map((contingent) => ({
      coordinator: {
        name: contingent.contingentCoordinatorName,
        phone: contingent.contingentCoordinatorPhone,
      },
      personCount: contingent.personCount,
      vechileType: contingent.vechileType,
    }));

    mutate({
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      contingent,
      regionCoordinator: {
        id:
          checkIsValidObjectId(value.regionCoordinatorName) &&
          checkIsValidObjectId(value.regionCoordinatorPhone)
            ? value.regionCoordinatorName
            : undefined,
        name: value.regionCoordinatorName,
        phone: value.regionCoordinatorPhone,
      },
    });
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title="Tambahkan data Booking"
        width={720}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={onClose}>Batal</Button>
            <Button onClick={form.submit} type="primary" loading={isMutating}>
              Simpan
            </Button>
          </Space>
        }
      >
        <Form<BookingFormData>
          layout="vertical"
          requiredMark={false}
          form={form}
          onFinish={handleAddContingent}
        >
          <h4 className="mb-1">Data Pemesan</h4>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="bookerName"
                label="Nama"
                rules={[
                  { required: true, message: "Silahkan masukkan nama Pemesan" },
                ]}
              >
                <Input placeholder="Silahkan masukkan nama Pemesan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bookerPhone"
                label="Nomor WA"
                rules={[{ required: true, message: "Masukkan nomor WA" }]}
              >
                <Input placeholder="08122334455" />
              </Form.Item>
            </Col>
          </Row>
          <Card className="my-2">
            <h4 className="mb-1">Daerah Asal</h4>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="province"
                  label="Provinsi"
                  rules={[
                    { required: true, message: "Silahkan pilih Provinsi" },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder="Silahkan pilih Provinsi"
                    loading={isProvinciesLoading}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      Boolean(
                        option?.label
                          .toLocaleLowerCase()
                          .includes(input.toLowerCase())
                      )
                    }
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={provinceData}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="city"
                  label="Kabupaten/Kota"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan pilih Kabupaten/Kota",
                    },
                  ]}
                >
                  <Select
                    showSearch
                    placeholder={
                      !selectedProvince
                        ? "Silahkan pilih Provinsi terlebih dahulu"
                        : "Silahkan pilih Kabupaten/Kota"
                    }
                    loading={isProvinciesLoading}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      Boolean(
                        option?.label
                          .toLocaleLowerCase()
                          .includes(input.toLowerCase())
                      )
                    }
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? "")
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? "").toLowerCase())
                    }
                    options={regenciesData}
                    disabled={!selectedProvince}
                  />
                </Form.Item>
              </Col>
            </Row>
            <h4 className="mb-1">Koordinator Wilayah</h4>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="regionCoordinatorName"
                  label="Nama"
                  rules={[
                    {
                      required: true,
                      message: "Silahkan masukkan nama Pemesan",
                    },
                  ]}
                >
                  <SelectCustomOption
                    showSearch
                    placeholder="Masukkan/Pilih nama koordinator daerah"
                    {...selectCustomOptionNameProps}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="regionCoordinatorPhone"
                  label="Nomor WA"
                  rules={[{ required: true, message: "Masukkan nomor WA" }]}
                >
                  <SelectCustomOption
                    showSearch
                    placeholder="08122334455"
                    {...selectCustomOptionPhoneProps}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <h2>Rombongan</h2>
          <Form.List
            name="contingents"
            initialValue={[]}
            rules={[
              {
                async validator(_, value) {
                  if (value.length === 0) {
                    return Promise.reject(
                      new Error("Silahkan tambahkan rombongan")
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field) => (
                  <Card
                    className="my-2"
                    key={field.key}
                    extra={
                      fields.length > 1 ? (
                        <Col span={2} className="mt-2 flex justify-center">
                          <CloseCircleTwoTone
                            twoToneColor={"#eb2f96"}
                            onClick={() => remove(field.name)}
                            className="text-xl"
                          />
                        </Col>
                      ) : null
                    }
                  >
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "personCount"]}
                          label="Jumlah Orang"
                          rules={[
                            {
                              required: true,
                              message: "Silahkan masukkan jumlah rombongan",
                            },
                            {
                              type: "number",
                              min: 1,
                              message: "Jumlah rombongan harus lebih dari 0",
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder="Silahkan masukkan jumlah rombongan"
                            className="w-full"
                            min={1}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "vechileType"]}
                          label="Jenis Kendaraan"
                          rules={[
                            {
                              required: true,
                              message: "Silahkan pilih jenis kendaraan",
                            },
                          ]}
                        >
                          <Select placeholder="Silahkan pilih jenis kendaraan">
                            <Option key="BUS">Bus</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <h4 className="mb-1">Koordinator Rombongan</h4>
                    <Row gutter={12}>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "contingentCoordinatorName"]}
                          label="Nama"
                          rules={[
                            {
                              required: true,
                              message: "Silahkan masukkan nama Pemesan",
                            },
                          ]}
                        >
                          <Input placeholder="Silahkan masukkan nama Pemesan" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...field}
                          name={[field.name, "contingentCoordinatorPhone"]}
                          label="Nomor WA"
                          rules={[
                            { required: true, message: "Masukkan nomor WA" },
                          ]}
                        >
                          <Input placeholder="08122334455" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    className="my-2 w-full"
                  >
                    Tambahkan Rombongan
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>
    </>
  );
};

export default BookingForm;
