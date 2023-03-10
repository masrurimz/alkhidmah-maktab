import { CloseCircleTwoTone, PlusOutlined } from "@ant-design/icons";
import { ContingentVechileType } from "@prisma/client";
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
  Spin,
} from "antd";
import React, { useEffect } from "react";
import { api } from "../../utils/api";
import { useWindowSize } from "../common/utils/window";
import { useBookingStore } from "./booking.store";
import { type BookingFormData } from "./booking.type";
import SelectCustomOption from "./SelectCustomOption";
import {
  useBookingFormMutation,
  useBookingFormRegionData,
  useContingentNamesSearchQuery,
  useRegionCoordinatorData,
} from "./utils";

const { Option } = Select;

const BookingForm: React.FC = () => {
  const isVisible = useBookingStore((state) => state.isBookingFormOpen);
  const onClose = useBookingStore((state) => state.closeBookingForm);

  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm<BookingFormData>();

  const { selectCustomOptionNameProps, selectCustomOptionPhoneProps } =
    useRegionCoordinatorData(form);

  const { provinceData, regenciesData, selectedProvince, isProvinciesLoading } =
    useBookingFormRegionData(form);

  const { createBooking, handleSubmit, updateBooking } = useBookingFormMutation(
    form,
    messageApi,
    provinceData,
    regenciesData
  );

  const selectedBookingId = useBookingStore((state) => state.selectedBookingId);
  const booking = api.booking.byId.useQuery(
    { id: String(selectedBookingId) },
    {
      enabled: !!selectedBookingId,
      onSettled(data, error) {
        if (error) {
          messageApi.open({
            type: "error",
            content: "Gagal memuat data Booking",
          });
        }

        if (data) {
          const {
            booker,
            contingentAddress,
            contingentLeader,
            contingentVechile,
            contingentName,
            personCount,
            regionCoordinator,
          } = data;

          form.setFieldsValue({
            bookerName: booker.name,
            bookerPhone: booker.phone,
            city: contingentAddress.city.id,
            province: contingentAddress.province.id,
            contingents: [
              {
                contingentCoordinatorName: contingentLeader.name,
                contingentCoordinatorPhone: contingentLeader.phone,
                personCount,
                vechileType: contingentVechile,
                name: contingentName,
              },
            ],
            regionCoordinatorName: regionCoordinator.name,
            regionCoordinatorPhone: regionCoordinator.phone,
          });
        }
      },
    }
  );
  useEffect(() => {
    if (
      selectedBookingId &&
      selectedProvince &&
      booking.data?.contingentAddress.city.id
    ) {
      form.setFieldValue("city", booking.data.contingentAddress.city.id);
    }
  }, [
    booking.data?.contingentAddress.city.id,
    form,
    selectedBookingId,
    selectedProvince,
  ]);

  const clearSelectedBookingId = useBookingStore(
    (state) => state.clearSelectedBookingId
  );
  useEffect(() => {
    if (!isVisible) {
      clearSelectedBookingId();
      form.resetFields();
    }
  }, [selectedBookingId, clearSelectedBookingId, form, isVisible]);

  const colProps = {
    xs: 24,
    md: 12,
  };
  const { width } = useWindowSize();

  const {
    contingentNamesUniqueSelectOptions,
    debounceContingentNameQuery,
    setContingentNameQuery,
    contingentNames,
  } = useContingentNamesSearchQuery();

  const vehicleTypeLabelMap: Record<ContingentVechileType, string> = {
    BUS: "Bis (>= 30 orang)",
    MINI_BUS: "Bis mini (30 orang)",
    ELF: "Elf (15 orang)",
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title="Tambahkan data Booking"
        width={width > 768 ? 720 : "100%"}
        onClose={onClose}
        open={isVisible}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={onClose}>Batal</Button>
            <Button
              onClick={form.submit}
              type="primary"
              loading={createBooking.isLoading || updateBooking.isLoading}
            >
              {selectedBookingId ? "Ubah" : "Tambah"}
            </Button>
          </Space>
        }
      >
        <Spin
          size="large"
          spinning={Boolean(booking.isLoading && selectedBookingId?.length)}
        >
          <Form<BookingFormData>
            layout="vertical"
            requiredMark={false}
            form={form}
            onFinish={handleSubmit}
          >
            <h4 className="mb-1">Data Pemesan</h4>
            <Row gutter={12}>
              <Col {...colProps}>
                <Form.Item
                  name="bookerName"
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
              <Col {...colProps}>
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
                <Col {...colProps}>
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
                <Col {...colProps}>
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
                <Col {...colProps}>
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
                <Col {...colProps}>
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
                      id={String(field.key)}
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
                      <Row>
                        <Col span={24}>
                          <Form.Item
                            {...field}
                            name={[field.name, "name"]}
                            label="Nama Rombongan"
                            rules={[
                              {
                                required: true,
                                message: "Silahkan masukkan nama rombongan",
                              },
                            ]}
                          >
                            <SelectCustomOption
                              showSearch
                              placeholder="Masukkan/Pilih nama rombongan"
                              onClickDropdownAdd={() => {
                                const data: Partial<BookingFormData> = {
                                  contingents: [
                                    {
                                      ...form.getFieldValue("contingents")[0],
                                      name: debounceContingentNameQuery,
                                    },
                                  ],
                                };

                                form.setFieldsValue(data);
                              }}
                              searchQuery={debounceContingentNameQuery}
                              options={contingentNamesUniqueSelectOptions}
                              onSearch={setContingentNameQuery}
                              loading={contingentNames.isLoading}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col {...colProps}>
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
                        <Col {...colProps}>
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
                              {Object.values(ContingentVechileType).map(
                                (vechileType) => (
                                  <Option key={vechileType}>
                                    {vehicleTypeLabelMap[vechileType]}
                                  </Option>
                                )
                              )}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <h4 className="mb-1">Koordinator Rombongan</h4>
                      <Row gutter={12}>
                        <Col {...colProps}>
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
                        <Col {...colProps}>
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
                  {fields.length <= 0 ? (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        className="my-2 w-full"
                      >
                        Tambahkan Rombongan
                      </Button>
                    </Form.Item>
                  ) : null}
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </Form>
        </Spin>
      </Drawer>
    </>
  );
};

export default BookingForm;
