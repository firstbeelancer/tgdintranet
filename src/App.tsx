import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import AdminPanel from "./pages/AdminPanel";
import CalendarPage from "./pages/CalendarPage";
import PartnerEcosystemPage from "./pages/PartnerEcosystemPage";
import PlacementInstructionsPage from "./pages/PlacementInstructionsPage";
import CertificatesPage from "./pages/CertificatesPage";
import MarketingPage from "./pages/MarketingPage";
import SuccessCasesPage from "./pages/SuccessCasesPage";
import PostcardsPage from "./pages/PostcardsPage";
import BrandStylePage from "./pages/BrandStylePage";
import BrandPage from "./pages/BrandPage";
import LogosPage from "./pages/LogosPage";
import BrandbookPage from "./pages/BrandbookPage";
import FormsPage from "./pages/FormsPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import HRPage from "./pages/HRPage";
import EmployeeContactsPage from "./pages/EmployeeContactsPage";
import ChildrenPage from "./pages/ChildrenPage";
import MascotVotePage from "./pages/MascotVotePage";
import NotFound from "./pages/NotFound";
import { SidebarLayout } from "@/components/SidebarLayout";

const queryClient = new QueryClient();

const WithSidebar = ({ children }: { children: React.ReactNode }) => (
  <SidebarLayout>{children}</SidebarLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<WithSidebar><AdminPanel /></WithSidebar>} />
            <Route path="/calendar" element={<WithSidebar><CalendarPage /></WithSidebar>} />
            <Route path="/partners" element={<WithSidebar><PartnerEcosystemPage /></WithSidebar>} />
            <Route path="/partners/certificates" element={<WithSidebar><CertificatesPage /></WithSidebar>} />
            <Route path="/partners/instructions" element={<WithSidebar><PlacementInstructionsPage /></WithSidebar>} />
            <Route path="/marketing" element={<WithSidebar><MarketingPage /></WithSidebar>} />
            <Route path="/marketing/cases" element={<WithSidebar><SuccessCasesPage /></WithSidebar>} />
            <Route path="/marketing/postcards" element={<WithSidebar><PostcardsPage /></WithSidebar>} />
            <Route path="/marketing/brand" element={<WithSidebar><BrandStylePage /></WithSidebar>} />
            <Route path="/marketing/brand/palette" element={<WithSidebar><BrandPage /></WithSidebar>} />
            <Route path="/marketing/brand/logos" element={<WithSidebar><LogosPage /></WithSidebar>} />
            <Route path="/marketing/brand/brandbook" element={<WithSidebar><BrandbookPage /></WithSidebar>} />
            <Route path="/forms" element={<WithSidebar><FormsPage /></WithSidebar>} />
            <Route path="/knowledge" element={<WithSidebar><KnowledgeBasePage /></WithSidebar>} />
            <Route path="/hr" element={<WithSidebar><HRPage /></WithSidebar>} />
            <Route path="/hr/contacts" element={<WithSidebar><EmployeeContactsPage /></WithSidebar>} />
            <Route path="/hr/children" element={<WithSidebar><ChildrenPage /></WithSidebar>} />
            <Route path="/vote/mascot" element={<WithSidebar><MascotVotePage /></WithSidebar>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
