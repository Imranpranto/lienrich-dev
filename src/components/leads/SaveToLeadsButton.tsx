import React, { useState } from 'react';
import { Users } from 'lucide-react';
import SaveToAudienceModal from './SaveToAudienceModal';
import type { Lead } from '../../types/leads';

interface SaveToLeadsButtonProps {
  selectedData: any[];
  onSave?: () => void;
  sourceOperation: string;
  transformData: (data: any[]) => Lead[];
}

export default function SaveToLeadsButton({ 
  selectedData,
  onSave,
  sourceOperation,
  transformData
}: SaveToLeadsButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleSave = () => {
    if (selectedData.length === 0) return;
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleSave}
        disabled={selectedData.length === 0}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Users className="h-4 w-4" />
        Save to Leads ({selectedData.length})
      </button>

      <SaveToAudienceModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          onSave?.();
        }}
        leads={transformData(selectedData)}
        sourceOperation={sourceOperation}
      />
    </>
  );
}