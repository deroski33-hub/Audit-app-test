import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeadForm from '../components/LeadForm';
import { leadService } from '../services/api';
import type { LeadCreate as LeadCreateType } from '../types';

export default function LeadCreate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: LeadCreateType) => {
    setIsLoading(true);
    try {
      const lead = await leadService.createLead(data);
      toast.success('Lead created successfully');
      navigate(`/leads/${lead.id}`);
    } catch {
      toast.error('Failed to create lead');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Lead</h1>
        <p className="text-gray-500">Add a new audit lead to your pipeline</p>
      </div>

      <LeadForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
