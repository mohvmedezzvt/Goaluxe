"use client";
import { usePathname } from "next/navigation";
import { ComponentType } from "react";

export default function withPathLayout<T extends object>(
  WrappedComponent: ComponentType<T>,
  hiddenPaths: string[]
) {
  return function WithPathLayoutComponent(props: T) {
    const pathname = usePathname();

    const shouldHide = hiddenPaths.some((path) => pathname.startsWith(path));

    if (shouldHide) {
      return null; // Do not render anything
    }

    return <WrappedComponent {...props} />;
  };
}
