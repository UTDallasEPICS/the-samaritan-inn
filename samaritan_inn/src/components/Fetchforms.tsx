'use client';

import { useEffect } from 'react';
import type { FormApiKey } from '@/components/admin/DecisionPanel';

export interface PassForm {
  id: string;
  formType: string;
  formKey: FormApiKey;
  name: string;
  submittedAt: string;
  status: string;
}

interface FetchFormsProps {
  setForms: (forms: PassForm[]) => void;
  setLoading: (loading: boolean) => void;
  refreshKey?: number;
}

interface RawForm {
  id: string;
  residentName?: string | null;
  submittedAt: string;
  status?: string | null;
}

export default function Fetchforms({ setForms, setLoading, refreshKey = 0 }: FetchFormsProps) {
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchForms() {
      try {
        const [curfewRes, passRes, workScheduleRes] = await Promise.all([
          fetch('/api/pass/extended-curfew'),
          fetch('/api/pass/pass-request'),
          fetch('/api/pass/work-schedule'),
        ]);
        const curfews: RawForm[] = await curfewRes.json();
        const passes: RawForm[] = await passRes.json();
        const workSchedule: RawForm[] = await workScheduleRes.json();

        const mapped: PassForm[] = [
          ...curfews.map(r => ({
            id: r.id,
            formType: 'Extended Curfew',
            formKey: 'extended-curfew' as FormApiKey,
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: (r.status ?? 'PENDING').toUpperCase(),
          })),
          ...passes.map(r => ({
            id: r.id,
            formType: 'Pass Request',
            formKey: 'pass-request' as FormApiKey,
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: (r.status ?? 'PENDING').toUpperCase(),
          })),
          ...workSchedule.map(r => ({
            id: r.id,
            formType: 'Work Schedule',
            formKey: 'work-schedule' as FormApiKey,
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: (r.status ?? 'PENDING').toUpperCase(),
          })),
        ];

        if (cancelled) return;
        setForms(
          mapped.sort(
            (a, b) =>
              new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          )
        );
      } catch (err) {
        console.error('Failed to fetch forms:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchForms();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return null;
}
