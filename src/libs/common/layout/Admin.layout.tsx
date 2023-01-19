import {
  BookOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useWindowSize } from "../utils/window";

const { Header, Sider, Content } = Layout;

const AdminAppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { width } = useWindowSize();
  const [collapsed, setCollapsed] = useState(width < 768 ? true : false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const router = useRouter();

  useEffect(() => {
    if (width < 768) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [width]);

  return (
    <Layout className="h-screen">
      <Sider
        breakpoint="lg"
        collapsedWidth={width < 768 ? 0 : 80}
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <h1 className="ml-8 text-white">Maktab</h1>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[router.pathname]}
          items={[
            {
              key: "/admin/booking",
              icon: <BookOutlined />,
              label: "Booking",
              onClick: () => router.push("/admin/booking"),
            },
            {
              key: "/admin/maktab",
              icon: <BankOutlined />,
              label: "Maktab",
              onClick: () => router.push("/admin/maktab"),
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: 0, background: colorBgContainer }}>
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed),
            }
          )}
        </Header>
        <Breadcrumb className="ml-6 mt-6">
          <Breadcrumb.Item>Admin</Breadcrumb.Item>
          {router.pathname.split("/").map((item, index) => {
            if (index === 0) return null;
            return (
              <Breadcrumb.Item key={index}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminAppLayout;
