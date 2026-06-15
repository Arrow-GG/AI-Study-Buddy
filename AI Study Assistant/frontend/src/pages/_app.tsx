import "@/styles/globals.css";
import { RouteTransition } from "@/components/RouteTransition";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <RouteTransition />
      <Component {...pageProps} />
    </>
  );
}
