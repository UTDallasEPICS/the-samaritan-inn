'use client';

interface WorkScheduleFormProps {
  onClose: () => void;
  residentName?: string;
}

export default function WorkScheduleForm({ onClose, residentName }: WorkScheduleFormProps) {
  return (
    <div>
      <p className="text-gray-400 text-sm">Build your component in <code>src/components/WorkScheduleForm.tsx</code></p>
      <p className="text-gray-400 text-sm mt-1">Props available: <code>onClose</code> (closes modal), <code>residentName</code> (logged-in user name)</p>
    </div>
  );
}
