import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadList from './pages/LeadList';
import LeadDetail from './pages/LeadDetail';
import LeadCreate from './pages/LeadCreate';
import LeadEdit from './pages/LeadEdit';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<LeadList />} />
          <Route path="/leads/new" element={<LeadCreate />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/leads/:id/edit" element={<LeadEdit />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </>
  );
}
