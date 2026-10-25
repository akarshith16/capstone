import { useEffect, useMemo, useState } from 'react';
import type { Incident } from '../../data/mockData';

const STORAGE_KEY = 'viaciudad:my-reports';

const loadSaved = (): Incident[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = (reports: Incident[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); the list just won't persist.
  }
};

// Reports filed from this device. The live pipeline copy wins; the saved copy is what
// survives a reload, since there is no backend to fetch them from yet.
export const useMyReports = (incidents: Incident[]) => {
  const [saved] = useState(loadSaved);
  const [ids, setIds] = useState(() => saved.map(r => r.id));

  const reports = useMemo(() => ids
    .map(id => incidents.find(inc => inc.id === id) ?? saved.find(r => r.id === id))
    .filter((r): r is Incident => Boolean(r)), [ids, incidents, saved]);

  useEffect(() => {
    save(reports);
  }, [reports]);

  const addReport = (id: string) => setIds(prev => [id, ...prev]);

  return { reports, addReport };
};
