"use client";

type Props = {
  name: string;
  /** Job title. Omitted from the row entirely when unknown. */
  title?: string | null;
  /** "lg" for the main caseworker card, "sm" for list rows. */
  size?: "lg" | "sm";
};

/**
 * Generic person icon + name + job title. Used for the caseworker card, the
 * selected-caseworker row, and each upcoming appointment.
 *
 * There is no photo: caseworker records have no usable public photo, and a
 * stock image would be a placeholder pretending to be the person.
 */
export default function PersonRow({ name, title, size = "sm" }: Props) {
  const px = size === "lg" ? 56 : 40;

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-shrink-0 rounded-full bg-blue-100"
        style={{ width: px, height: px }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="h-full w-full p-2 text-blue-600"
        >
          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
        </svg>
      </div>

      <div className="min-w-0">
        <p
          className={`font-bold text-black ${size === "lg" ? "text-xl" : "text-base"}`}
        >
          {name}
        </p>
        {title && <p className="text-sm text-gray-500">{title}</p>}
      </div>
    </div>
  );
}
