import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-sm font-medium text-primary">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Esta página não existe
      </h1>
      <p className="mt-4 max-w-sm text-muted">
        Ou nunca existiu, ou mudou de sítio. Seja como for, não foi culpa tua.
      </p>
      <div className="mt-8">
        <Button href="/" variant="primary">
          Voltar ao início
        </Button>
      </div>
    </Container>
  );
}
