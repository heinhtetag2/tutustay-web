import type { ReactNode } from "react";
import { PhotoTile } from "@/shared/ui/PhotoTile";

/** The sign-in, sign-up and reset pages: a soft photo behind a centred form card, so the page isn't a lone card on white. */
export function AuthBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-[calc(100svh-5.5rem)] justify-center px-[var(--gutter)] py-8 md:py-12">
      <PhotoTile src="/demo/1662657080109.jpg" alt="" className="absolute inset-0 -z-20 size-full object-[center_40%]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0c4a6e99] via-[#0c4a6e4d] to-[#0000008c]" />
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}
