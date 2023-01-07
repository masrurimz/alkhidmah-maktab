import type { NextPage } from "next";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";

import { api } from "../utils/api";

import "../styles/globals.css";
import AdminAppLayout from "../libs/common/layout/Admin.layout";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

type MyAppProps = AppPropsWithLayout & {
  session: Session | null;
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: MyAppProps) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <SessionProvider session={session}>
      <AdminAppLayout>{getLayout(<Component {...pageProps} />)}</AdminAppLayout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
