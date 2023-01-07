import {
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { useRouter } from "next/router";
import React, { useState } from "react";

const { Header, Sider, Content } = Layout;

const AdminAppLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const router = useRouter();

  return (
    <div>
      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
        }
      `}</style>
      <Layout className="h-screen">
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="logo" />
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
    </div>
  );
};

export default AdminAppLayout;
