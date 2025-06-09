/* eslint-disable @typescript-eslint/promise-function-async */
"use client";
import type { PropsWithChildren } from "react";
import { create } from "zustand";

type CurrentServerStore = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
};

/**
 * Get the current server id in **client component**
 *
 * Usage :
 *
 * ```tsx
 * "use client";
 *
 * export const ClientComponent = () => {
 *   const currentServer = useCurrentServer();
 *
 *   return (
 *     <div>
 *       <p>Current server id : {currentServer.id}</p>
 *     </div>
 *   )
 * }
 */
export const useCurrentServer = create<CurrentServerStore | null>(() => null);

export const InjectCurrentServerStore = (
  props: PropsWithChildren<{
    server?: CurrentServerStore;
  }>,
) => {
  if (!props.server) return props.children;

  if (useCurrentServer.getState()) return props.children;

  useCurrentServer.setState({
    id: props.server.id,
    slug: props.server.slug,
    name: props.server.name,
    image: props.server.image,
  });
  return props.children;
};

export const getCurrentserverSlug = () => {
  const currentServer = useCurrentServer.getState();
  return currentServer?.slug;
};
