import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/torntoolsbycore')({
  component: () => (
    <div>
      <h1>Torn Tools by Core</h1>
      <p>Select a tool from the list below:</p>
    </div>
  ),
}); 