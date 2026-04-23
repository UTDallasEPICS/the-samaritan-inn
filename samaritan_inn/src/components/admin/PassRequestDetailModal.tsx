'use client';

import { useEffect, useState } from 'react';
import DecisionPanel from './DecisionPanel';

interface Props {
  id: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface PassRequest {
  id: string;
  residentName: string;
  todayDate: string;
  datesRequested: string;
  reason: string;
  choreCoveredById: string | null;
  choreCoverageSignature: string | null;
  residentSignature: string;
  signatureDate: string;
  status: string;
  adminName: string | null;
  commentsNotes: string | null;
  decisionDate: string | null;
  submittedAt: string;
}

const fieldLabel = 'block text-sm font-semibold text-gray-700 mb-1';
const fieldValue =
  'text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded px-3 py-2 w-full';

export default function PassRequestDetailModal({ id, onClose, onUpdate }: Props) {
  const [record, setRecord] = useState<PassRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pass/pass-request/${id}`)
      .then(r => r.json())
      .then(data => setRecord(data))
      .catch(() => setError('Failed to load form data.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitted = () => {
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto relative">
        <div className="flex bg-primary text-white rounded-t-lg items-stretch">
          <div className="flex-1 px-6 py-4 text-xl font-bold">Pass Request Form</div>
          <div className="flex-1 px-6 py-4 text-xl font-bold border-l border-white/30">
            Your Decision
          </div>
          <button
            onClick={onClose}
            className="px-5 text-2xl font-bold hover:opacity-75"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent" />
          </div>
        ) : !record || error ? (
          <div className="p-8 text-center text-red-600">
            {error ?? 'Failed to load form data.'}
          </div>
        ) : (
          <div className="flex divide-x divide-gray-200">
            <div className="flex-1 p-6 space-y-4">
              <div>
                <div className={fieldLabel}>Resident Name</div>
                <div className={fieldValue}>{record.residentName}</div>
              </div>
              <div>
                <div className={fieldLabel}>Date Submitted</div>
                <div className={fieldValue}>
                  {new Date(record.submittedAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className={fieldLabel}>Today&apos;s Date (on form)</div>
                <div className={fieldValue}>
                  {new Date(record.todayDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className={fieldLabel}>Date(s) Requested for Pass</div>
                <div className={fieldValue}>{record.datesRequested}</div>
              </div>
              <div>
                <div className={fieldLabel}>Reason for Request</div>
                <div className={`${fieldValue} whitespace-pre-wrap min-h-[80px]`}>
                  {record.reason}
                </div>
              </div>
              {record.choreCoverageSignature && (
                <div>
                  <div className={fieldLabel}>Chore Coverage Signature</div>
                  <div className={fieldValue}>{record.choreCoverageSignature}</div>
                </div>
              )}
              <div>
                <div className={fieldLabel}>Resident Signature</div>
                <div className={fieldValue}>{record.residentSignature}</div>
              </div>
              <div>
                <div className={fieldLabel}>Signature Date</div>
                <div className={fieldValue}>
                  {new Date(record.signatureDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <DecisionPanel
              formId={record.id}
              formType="pass-request"
              currentStatus={record.status}
              initialComments={record.commentsNotes}
              onSubmitted={handleSubmitted}
            />
          </div>
        )}
      </div>
    </div>
  );
}
