import React from "react";
import { Space, Table, Tag } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { Booking as BookingList } from "@prisma/client";

const BookingStatusTagColorMap: Record<BookingList["status"], string> = {
  PENDING: "orange",
  APPROVED: "green",
  ON_PROCESS: "blue",
};

const columns: ColumnsType<BookingList> = [
  {
    title: "No.",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Kabupaten/Kota",
    dataIndex: ["contingentAddress", "city"],
  },
  {
    title: "Koor Rombongan",
    dataIndex: ["contingentLeader", "name"],
  },
  {
    title: "Koor Daerah",
    dataIndex: ["regionCoordinator", "name"],
  },
  {
    title: "Jumlah",
    dataIndex: "personCount",
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: BookingList["status"]) => (
      <Tag color={BookingStatusTagColorMap[status]}>{status}</Tag>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <a>Show</a>
      </Space>
    ),
  },
];

const data = [
  {
    id: "1",
    booker: {
      name: "Joe",
      phone: "1234567890",
    },
    bookingCode: "GSK_123",
    contingentAddress: {
      city: "Gresik",
      district: "Kebomas",
      province: "Jawa Timur",
    },
    contingentLeader: {
      name: "John",
      phone: "1234567890",
    },
    createdAt: new Date(),
    status: "PENDING",
    updatedAt: new Date(),
    personCount: 10,
    regionCoordinator: {
      name: "Elton",
      phone: "1234567890",
    },
  },
];

const onChange: TableProps<BookingList>["onChange"] = (
  pagination,
  filters,
  sorter,
  extra
) => {
  console.log("params", pagination, filters, sorter, extra);
};

const BookingList: React.FC = () => (
  <Table columns={columns} dataSource={data} onChange={onChange} />
);

export default BookingList;
