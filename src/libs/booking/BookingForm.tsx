import { CloseCircleTwoTone, PlusOutlined } from "@ant-design/icons";
import { type Booking, ContingentVechileType } from "@prisma/client";
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
} from "antd";
import React, { useEffect, useMemo } from "react";
import { api } from "../../utils/api";
import { type BookingFormData } from "./booking.type";

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

  const { mutate } = api.booking.create.useMutation({
    onSuccess(data, variables, context) {
      messageApi.open({
        type: "success",
        content: "Berhasil menambahkan data Booking",
      });
    },
  });

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

  const handleAddContingent = (value: BookingFormData) => {
    if (value.contingents.length === 0 || !value.contingents[0]) {
      return;
    }

    mutate({
      booker: {
        name: value.bookerName,
        phone: value.bookerPhone,
      },
      city: value.city,
      contingent: value.contingents.map((contingent) => ({
        personCount: contingent.personCount,
        vechileType: ContingentVechileType.BUS,
        coordinator: {
          name: contingent.contingentCoordinatorName,
          phone: contingent.contingentCoordinatorPhone,
        },
      })),
      province: value.province,
      regionCoordinator: {
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
            <Button onClick={form.submit} type="primary">
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
                    options={regenciesData}
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
                  <Input placeholder="Silahkan masukkan nama Pemesan" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="regionCoordinatorPhone"
                  label="Nomor WA"
                  rules={[{ required: true, message: "Masukkan nomor WA" }]}
                >
                  <Input placeholder="08122334455" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <h2>Rombongan</h2>
          <Form.List name="contingents" initialValue={[]}>
            {(fields, { add, remove }) => (
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
                            <Option key={1}>Bus</Option>
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
                    className="w-full"
                  >
                    Tambahkan Rombongan
                  </Button>
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
