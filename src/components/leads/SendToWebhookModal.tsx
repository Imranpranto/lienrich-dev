import React from 'react';
import WebhookModal from '../modals/WebhookModal';
import { useWebhook } from '../../hooks/useWebhook';
import type { LinkedInProfile } from '../../types/linkedin';

interface SendToWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: LinkedInProfile[];
  mode: 'selected' | 'all' | 'audience';
  audienceName?: string;
}

export default function SendToWebhookModal({ isOpen, onClose, leads, mode, audienceName }: SendToWebhookModalProps) {
  const { sendWebhook } = useWebhook();

  const handleSend = async (webhookConfig: WebhookConfig) => {
    await sendWebhook(leads, {
      ...webhookConfig,
      headers: {
        ...webhookConfig.headers,
        'X-Source': 'LiEnrich Leads',
        'X-Batch-Type': mode,
        ...(audienceName && { 'X-Audience-Name': audienceName })
      }
    });
  };

  return (
    <WebhookModal
      isOpen={isOpen}
      onClose={onClose}
      onSend={handleSend}
    />
  );
}