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
  setError?: (msg: string | null) => void;
  refreshKey?: number;
}

interface RawForm {
  id: string;
  residentName?: string | null;
  submittedAt: string;
  status?: string | null;
}

export default function Fetchforms({ setForms, setLoading, setError, refreshKey = 0 }: FetchFormsProps) {
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError?.(null);

    async function checkOk(res: Response, label: string): Promise<RawForm[]> {
      if (!res.ok) {
        const body = await res.text();
        const msg = `${label} ${res.status}: ${body.slice(0, 200)}`;
        console.error('Fetchforms', msg);
        throw new Error(msg);
      }
      return res.json();
    }

    async function fetchForms() {
      try {
        const [curfewRes, passRes, workScheduleRes] = await Promise.all([
          fetch('/api/pass/extended-curfew'),
          fetch('/api/pass/pass-request'),
          fetch('/api/pass/work-schedule'),
        ]);
        const [curfews, passes, workSchedule] = await Promise.all([
          checkOk(curfewRes, '/api/pass/extended-curfew'),
          checkOk(passRes, '/api/pass/pass-request'),
          checkOk(workScheduleRes, '/api/pass/work-schedule'),
        ]);
        console.log(
          `Fetchforms loaded: curfews=${curfews.length} passes=${passes.length} workSchedules=${workSchedule.length}`
        );

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
        if (!cancelled) {
          setForms([]);
          setError?.(err instanceof Error ? err.message : String(err));
        }
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
