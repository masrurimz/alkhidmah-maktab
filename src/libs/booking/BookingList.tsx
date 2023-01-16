import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { RegionCoordiator, Booking } from "@prisma/client";
import {
  Button,
  Col,
  message,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import React, { useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { api } from "../../utils";
import { useBookingStore } from "./booking.store";

type BookingListType = Booking & {
  regionCoordinator: RegionCoordiator;
};

const BookingStatusTagColorMap: Record<BookingListType["status"], string> = {
  PENDING: "orange",
  APPROVED: "green",
  ON_PROCESS: "blue",
};

const onChange: TableProps<BookingListType>["onChange"] = (
  pagination,
  filters,
  sorter,
  extra
) => {
  console.log("params", pagination, filters, sorter, extra);
};

const BookingList: React.FC = () => {
  const openForm = useBookingStore((state) => state.openBookingForm);
  const apiUtils = api.useContext();
  const [messageApi, contextHolder] = message.useMessage();
  const deleteBooking = api.booking.delete.useMutation({
    onSuccess: () => {
      messageApi.open({
        type: "success",
        content: "Berhasil menghapus data Booking",
      });
      apiUtils.booking.invalidate();
    },
  });

  const [popconfirmVisibility, setPopconfirmVisibility] = useState<
    Record<string, boolean>
  >({});

  const { data, isLoading } = api.booking.getAll.useQuery({
    limit: 10,
    skip: 0,
  });

  const columns: ColumnsType<BookingListType> = [
    {
      title: "No.",
      dataIndex: "bookingCode",
      key: "id",
      responsive: ["sm"],
    },
    {
      title: "Kabupaten/Kota",
      dataIndex: ["contingentAddress", "city", "name"],
      key: "id",
      responsive: ["sm"],
    },
    {
      title: "Koor Rombongan",
      dataIndex: ["contingentLeader", "name"],
      key: "id",
      responsive: ["sm"],
    },
    {
      title: "Koor Daerah",
      dataIndex: ["regionCoordinator", "name"],
      key: "id",
      responsive: ["sm"],
    },
    {
      title: "Jumlah",
      dataIndex: "personCount",
      key: "id",
      responsive: ["sm"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: BookingListType["status"]) => (
        <Tag color={BookingStatusTagColorMap[status]}>{status}</Tag>
      ),
      key: "id",
      responsive: ["sm"],
    },
    {
      title: "Booking",
      render: (_, record) => (
        <div className="flex">
          <Space className="flex flex-1" direction="vertical" size="small">
            <div>
              <span className="font-semibold">Kode Booking: </span>
              <span>{record.bookingCode}</span>
            </div>
            <div>
              <span className="font-semibold">Kabupaten/Kota: </span>
              <span>{record.contingentAddress.city.name}</span>
            </div>
            <div>
              <span className="font-semibold">Koor Rombongan: </span>
              <span>{record.contingentLeader.name}</span>
            </div>
            <div>
              <Typography.Text className="font-semibold">
                Koor Daerah:{" "}
              </Typography.Text>
              <Typography.Text>{record.regionCoordinator.name}</Typography.Text>
              <Typography.Text type="secondary">
                ( {record.regionCoordinator.phone})
              </Typography.Text>
            </div>
            <div>
              <span className="font-semibold">Jumlah: </span>
              <span>{record.personCount}</span>
            </div>
            <div>
              <span className="font-semibold">Status: </span>
              <span>
                <Tag color={BookingStatusTagColorMap[record.status]}>
                  {record.status}
                </Tag>
              </span>
            </div>
          </Space>
          <Space direction="vertical" size="middle">
            <Button
              className="p-0"
              type="link"
              onClick={() => openForm(record.id)}
            >
              Open
            </Button>
            <Popconfirm
              title="Hapus data booking"
              description="Apakah anda yakin ingin menghapus data booking ini ?"
              okText="Hapus"
              cancelText="Batal"
              onConfirm={async (e) => {
                e?.preventDefault();
                await deleteBooking.mutateAsync({
                  id: record.id,
                });
                setPopconfirmVisibility({ [record.id]: false });
              }}
              okButtonProps={{
                loading: deleteBooking.isLoading,
              }}
              open={popconfirmVisibility[record.id]}
            >
              <Button
                type="link"
                icon={<DeleteOutlined />}
                danger
                onClick={() => setPopconfirmVisibility({ [record.id]: true })}
              />
            </Popconfirm>
          </Space>
        </div>
      ),
      responsive: ["xs"],
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            className="p-0"
            type="link"
            onClick={() => openForm(record.id)}
          >
            Open
          </Button>
          <Popconfirm
            title="Hapus data booking"
            description="Apakah anda yakin ingin menghapus data booking ini ?"
            okText="Hapus"
            cancelText="Batal"
            onConfirm={async (e) => {
              e?.preventDefault();
              await deleteBooking.mutateAsync({
                id: record.id,
              });
              setPopconfirmVisibility({ [record.id]: false });
            }}
            okButtonProps={{
              loading: deleteBooking.isLoading,
            }}
            open={popconfirmVisibility[record.id]}
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
              onClick={() => setPopconfirmVisibility({ [record.id]: true })}
            />
          </Popconfirm>
        </Space>
      ),
      responsive: ["sm"],
    },
  ];

  const { width } = useWindowSize();

  return (
    <>
      {contextHolder}
      <Space direction="vertical" size="small" className="w-full">
        <Row justify="end">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openForm()}
          >
            Tambah
          </Button>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={data?.items}
              onChange={onChange}
              scroll={{
                x: width > 576 ? 700 : undefined,
              }}
              loading={isLoading}
            />
          </Col>
        </Row>
      </Space>
    </>
  );
};

export default BookingList;
