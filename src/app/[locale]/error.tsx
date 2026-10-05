"use client";

import { Container } from "@/shared/layout/Container";
import { Button } from "@/shared/ui/Button";
import { ErrorState } from "@/shared/ui/States";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container size="narrow" className="py-12">
      <ErrorState title="Something went wrong" body="Nothing you entered was lost. Try again." action={<Button onClick={reset}>Try again</Button>} />
    </Container>
  );
}
