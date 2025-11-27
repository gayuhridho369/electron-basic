import { StrictMode } from 'react'

import { ModeToggle } from '@/components/custom/mode-toggle'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import Counter from './counter'
import Note from './note'
import PointOfSales from './pos'
import '../styles/globals.css'

import PosHistory from './pos-history'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
})

const root = createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Toaster richColors duration={3000} />

        <div className="fixed top-6 right-4">
          <ModeToggle />
        </div>

        <div className="flex w-full flex-col gap-6 px-4 py-6">
          <Tabs defaultValue="pos">
            <TabsList>
              <TabsTrigger value="counter">Counter</TabsTrigger>
              <TabsTrigger value="note">Note</TabsTrigger>
              <TabsTrigger value="pos">Point of Sales</TabsTrigger>
              <TabsTrigger value="history-pos">History POS</TabsTrigger>
            </TabsList>
            <TabsContent value="counter" className="pt-8">
              <Counter />
            </TabsContent>
            <TabsContent value="note" className="pt-8">
              <Note />
            </TabsContent>
            <TabsContent value="pos" className="pt-8">
              <PointOfSales />
            </TabsContent>
            <TabsContent value="history-pos" className="pt-8">
              <PosHistory />
            </TabsContent>
          </Tabs>
        </div>

        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
