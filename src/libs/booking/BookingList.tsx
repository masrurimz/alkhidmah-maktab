import React from "react";
import { Button, Col, Row, Space, Table, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import { Booking, Booking as BookingList } from "@prisma/client";
import { api } from "../../utils";

const BookingStatusTagColorMap: Record<BookingList["status"], string> = {
  PENDING: "orange",
  APPROVED: "green",
  ON_PROCESS: "blue",
};

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
        <a>Show</a>
      </Space>
    ),
  },
];

// const data: Booking[] = [
//   {
//     id: "1",
//     booker: {
//       name: "Joe",
//       phone: "1234567890",
//     },
//     bookingCode: "GSK_123",
//     contingentAddress: {
//       city: {
//         id: "1",
//         name: "Kebomas",
//       },
//       province: {
//         id: "1",
//         name: "Jawa Timur",
//       },
//     },
//     contingentLeader: {
//       name: "John",
//       phone: "1234567890",
//     },
//     createdAt: new Date(),
//     status: "PENDING",
//     updatedAt: new Date(),
//     personCount: 10,
//     contingentVechile: "BUS",
//     regionCoordinatorId: "1",
//   },
// ];

const onChange: TableProps<BookingList>["onChange"] = (
  pagination,
  filters,
  sorter,
  extra
) => {
  console.log("params", pagination, filters, sorter, extra);
};

interface BookingListProps {
  onPressAdd: () => void;
}

const BookingList: React.FC<BookingListProps> = (props) => {
  const { onPressAdd } = props;

  const { data, isLoading } = api.booking.getAll.useQuery({
    limit: 10,
    skip: 0,
  });

  return (
    <Space direction="vertical" size="small" className="w-full">
      <Row justify="end">
        <Button type="primary" icon={<PlusOutlined />} onClick={onPressAdd}>
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
  );
};

export default BookingList;
