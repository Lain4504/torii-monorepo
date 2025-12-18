
import { AppRestTest } from './AppRestTest';
import { UsersList } from './UsersTest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-background text-foreground px-6 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="space-y-2">
            <p className="text-sm text-muted-foreground">Admin Dashboard (Vite)</p>
            <h1 className="text-3xl font-semibold tracking-tight">Admin Control Panel</h1>
          </header>

          <AppRestTest />

          <UsersList />
        </div>
      </main>
    </QueryClientProvider>
  );
}

export default App;
