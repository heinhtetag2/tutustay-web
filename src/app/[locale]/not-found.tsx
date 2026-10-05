import { LinkButton } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/States";
import { Container } from "@/shared/layout/Container";

export default function NotFound() {
  return (
    <Container size="narrow" className="py-12">
      <EmptyState title="We couldn't find that page" body="The link may be old or mistyped." action={<LinkButton href="/">Back to search</LinkButton>} />
    </Container>
  );
}
