'use client';

import { useEffect } from 'react';

interface PassForm {
  formType: string;
  name: string;
  submittedAt: string;
  status: string;
}

interface FetchFormsProps {
  setForms: (forms: PassForm[]) => void;
  setLoading: (loading: boolean) => void;
}

export default function Fetchforms({ setForms, setLoading }: FetchFormsProps) {
  useEffect(() => {
    async function fetchForms() {
      try {
        const [curfewRes, passRes, workScheduleRes] = await Promise.all([
          fetch('/api/pass/extended-curfew'),
          fetch('/api/pass/pass-request'),
          fetch('/api/pass/work-schedule'),
        ]);
        const curfews = await curfewRes.json();
        const passes = await passRes.json();
        const workSchedule = await workScheduleRes.json();

        const mapped: PassForm[] = [
          ...curfews.map((r: any) => ({
            formType: 'Extended Curfew',
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: (r.status ?? 'PENDING').toUpperCase(),
          })),
          ...passes.map((r: any) => ({
            formType: 'Pass Request',
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: (r.status ?? 'PENDING').toUpperCase(),
          })),
          ...workSchedule.map((r: any) => ({
            formType: 'Work Schedule',
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: (r.status ?? 'PENDING').toUpperCase(),
          })),
        ];

        setForms(
          mapped.sort(
            (a, b) =>
              new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          )
        );
      } catch (err) {
        console.error('Failed to fetch forms:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchForms();
  }, []);

  return null;
}

