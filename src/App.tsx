import { Header } from './components/layout/Header';
import { PersistentBottomBar } from './components/layout/PersistentBottomBar';
import { LabProvider, useLab } from './context/LabContext';
import { AnalysisCopilotPage } from './pages/AnalysisCopilotPage';
import { CatalogPage } from './pages/CatalogPage';
import { LabWorkspacePage } from './pages/LabWorkspacePage';
import { LandingPage } from './pages/LandingPage';
import { WorksheetPage } from './pages/WorksheetPage';

function EduspaceShell() {
  const { view, toastMessage } = useLab();

  const isInsideModule =
    view === 'workspace' || view === 'analysis' || view === 'worksheet';

  return (
    <div className="app-shell min-h-[100dvh] bg-[#EFECE4] text-[#23272A]">
      <Header />

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className={`no-print fixed right-4 z-50 max-w-[calc(100vw-2rem)] rounded-full bg-[#0E5A63] px-4 py-2 font-code text-xs font-medium text-white shadow-[4px_4px_12px_rgba(14,90,99,0.28)] sm:right-8 ${
            isInsideModule ? 'top-28 lg:top-20' : 'top-20'
          }`}
        >
          {toastMessage}
        </div>
      ) : null}

      <main
        className={`app-main w-full pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] ${
          isInsideModule ? 'pt-[7.5rem] lg:pt-20' : 'pt-20'
        }`}
      >
        {view === 'landing' ? <LandingPage /> : null}
        {view === 'catalog' ? <CatalogPage /> : null}
        {view === 'workspace' ? <LabWorkspacePage /> : null}
        {view === 'analysis' ? <AnalysisCopilotPage /> : null}
        {view === 'worksheet' ? <WorksheetPage /> : null}

        {isInsideModule ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <PersistentBottomBar />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export function App() {
  return (
    <LabProvider>
      <EduspaceShell />
    </LabProvider>
  );
}

export default App;
