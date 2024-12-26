import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { FieldMapping } from '../../types/hubspot';

interface HubSpotFieldMappingProps {
  fieldMappings: FieldMapping[];
  onUpdate: (mappings: FieldMapping[]) => void;
}

const availableSourceFields = [
  'fullName',
  'headline',
  'profileUrl',
  'location',
  'company',
  'email'
];

const availableTargetFields = [
  'firstname',
  'lastname',
  'jobtitle',
  'company',
  'linkedin_url',
  'email',
  'city',
  'state',
  'country'
];

export default function HubSpotFieldMapping({ fieldMappings, onUpdate }: HubSpotFieldMappingProps) {
  const handleAddMapping = () => {
    onUpdate([
      ...fieldMappings,
      { sourceField: '', targetField: '', isRequired: false }
    ]);
  };

  const handleRemoveMapping = (index: number) => {
    const newMappings = fieldMappings.filter((_, i) => i !== index);
    onUpdate(newMappings);
  };

  const handleMappingChange = (index: number, field: keyof FieldMapping, value: any) => {
    const newMappings = fieldMappings.map((mapping, i) => {
      if (i === index) {
        return { ...mapping, [field]: value };
      }
      return mapping;
    });
    onUpdate(newMappings);
  };

  return (
    <div className="p-6 border-b border-gray-100">
      <h4 className="font-medium text-gray-900 mb-4">Field Mapping</h4>
      
      <div className="space-y-4">
        {fieldMappings.map((mapping, index) => (
          <div key={index} className="flex items-center gap-4">
            <select
              value={mapping.sourceField}
              onChange={(e) => handleMappingChange(index, 'sourceField', e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select LiEnrich Field</option>
              {availableSourceFields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>

            <select
              value={mapping.targetField}
              onChange={(e) => handleMappingChange(index, 'targetField', e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select HubSpot Field</option>
              {availableTargetFields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={mapping.isRequired}
                onChange={(e) => handleMappingChange(index, 'isRequired', e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">Required</span>
            </label>

            <button
              onClick={() => handleRemoveMapping(index)}
              className="p-2 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={handleAddMapping}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Field Mapping
        </button>
      </div>
    </div>
  );
}