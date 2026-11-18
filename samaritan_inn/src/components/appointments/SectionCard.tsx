import React from "react";

/** The white rounded card every section of the Appointments and Empowerment Coaches pages sits in. */
export default function SectionCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full rounded-lg bg-white p-6 shadow-md">
      {title && (
        <h2 className="mb-4 text-2xl font-bold text-black">{title}</h2>
      )}
      {children}
    </section>
  );
}
