import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeadForm from '../components/LeadForm';
import { leadService } from '../services/api';
import type { Lead, LeadCreate } from '../types';

export default function LeadEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchLead() {
      try {
        const data = await leadService.getLead(Number(id));
        setLead(data);
      } catch {
        toast.error('Failed to load lead');
        navigate('/leads');
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [id, navigate]);

  const handleSubmit = async (data: LeadCreate) => {
    setIsSubmitting(true);
    try {
      await leadService.updateLead(Number(id), data);
      toast.success('Lead updated successfully');
      navigate(`/leads/${id}`);
    } catch {
      toast.error('Failed to update lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (!lead) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Lead</h1>
        <p className="text-gray-500">Update information for {lead.company_name}</p>
      </div>

      <LeadForm initialData={lead} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}
