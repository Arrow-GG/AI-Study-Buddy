import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

const SHOW_DELAY_MS = 120;

export function RouteTransition() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const start = (url: string) => {
      if (url === router.asPath) return;
      timer.current = setTimeout(() => setLoading(true), SHOW_DELAY_MS);
    };

    const finish = () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      setLoading(false);
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", finish);
    router.events.on("routeChangeError", finish);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", finish);
      router.events.off("routeChangeError", finish);
    };
  }, [router.asPath, router.events]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/85 backdrop-blur-md">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6 py-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface border border-border">
          <div className="route-progress h-full w-1/3 rounded-full bg-acid" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-border bg-surface/80 p-8">
            <Skeleton className="h-4 w-28 bg-acid/25" />
            <Skeleton className="mt-6 h-14 w-11/12" />
            <Skeleton className="mt-4 h-14 w-8/12" />
            <div className="mt-10 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-4 w-7/12" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface/80 p-6">
            <Skeleton className="h-4 w-24 bg-magenta/25" />
            <div className="mt-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-10/12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl bg-surface-2 ${className}`} />;
}
