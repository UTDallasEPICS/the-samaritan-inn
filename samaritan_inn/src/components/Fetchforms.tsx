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
        const [curfewRes, passRes] = await Promise.all([
          fetch('/api/pass/extended-curfew'),
          fetch('/api/pass/pass-request'),
        ]);
        const curfews = await curfewRes.json();
        const passes = await passRes.json();

        const mapped: PassForm[] = [
          ...curfews.map((r: any) => ({
            formType: 'Extended Curfew',
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: r.status ?? 'Pending',
          })),
          ...passes.map((r: any) => ({
            formType: 'Pass Request',
            name: r.residentName ?? '—',
            submittedAt: r.submittedAt,
            status: r.status ?? 'Pending',
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