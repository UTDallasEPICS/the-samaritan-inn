"use client";

import Image from "next/image";

type Props = {
  name: string;
  role: string;
  avatarUrl: string | null;
  /** "lg" for the main caseworker card, "sm" for list rows. */
  size?: "lg" | "sm";
};

/**
 * Avatar + name + job title. The mockup repeats this exact combination in three
 * places (the caseworker card, the selected-caseworker row, and each upcoming
 * appointment), so it lives here once instead of being copy-pasted three times.
 */
export default function PersonRow({ name, role, avatarUrl, size = "sm" }: Props) {
  const px = size === "lg" ? 56 : 40;

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-shrink-0 overflow-hidden rounded-full bg-blue-100"
        style={{ width: px, height: px }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            // Decorative: the name is already right next to it in text, so an
            // empty alt keeps screen readers from announcing it twice.
            alt=""
            width={px}
            height={px}
            className="h-full w-full object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-full w-full p-2 text-blue-600"
          >
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          </svg>
        )}
      </div>

      <div className="min-w-0">
        <p
          className={`font-bold text-black ${size === "lg" ? "text-xl" : "text-base"}`}
        >
          {name}
        </p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  );
}
