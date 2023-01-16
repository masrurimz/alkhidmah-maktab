import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Booking as BookingList } from "@prisma/client";
import { Button, Col, message, Popconfirm, Row, Space, Table, Tag } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import React, { useState } from "react";
import { api } from "../../utils";
import { useBookingStore } from "./booking.store";

const BookingStatusTagColorMap: Record<BookingList["status"], string> = {
  PENDING: "orange",
  APPROVED: "green",
  ON_PROCESS: "blue",
};

const onChange: TableProps<BookingList>["onChange"] = (
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

  const columns: ColumnsType<BookingList> = [
    {
      title: "No.",
      dataIndex: "bookingCode",
      key: "id",
    },
    {
      title: "Kabupaten/Kota",
      dataIndex: ["contingentAddress", "city", "name"],
      key: "id",
    },
    {
      title: "Koor Rombongan",
      dataIndex: ["contingentLeader", "name"],
      key: "id",
    },
    {
      title: "Koor Daerah",
      dataIndex: ["regionCoordinator", "name"],
      key: "id",
    },
    {
      title: "Jumlah",
      dataIndex: "personCount",
      key: "id",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: BookingList["status"]) => (
        <Tag color={BookingStatusTagColorMap[status]}>{status}</Tag>
      ),
      key: "id",
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
    },
  ];

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
                x: 1000,
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
