"use client";
export async function api(url: string, body: unknown, submissionKey?: string) {
  const r = await fetch(url, {
    method: "POST",
    headers:
      body instanceof FormData
        ? undefined
        : {
            "Content-Type": "application/json",
            ...(submissionKey ? { "Idempotency-Key": submissionKey } : {}),
          },
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok)
    throw new Error(d.error || "Something went wrong. Please try again.");
  return d;
}
export function Field({
  name,
  label,
  type = "text",
  required = false,
  options,
  defaultValue,
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  defaultValue?: string | number;
  min?: number | string;
  step?: string;
}) {
  if (type === "hidden")
    return <input type="hidden" name={name} defaultValue={defaultValue} />;
  return (
    <label>
      {label}
      {options ? (
        <select name={name} required={required} defaultValue={defaultValue}>
          {options.map((o) => (
            <option key={o} value={o}>
              {o.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea name={name} required={required} defaultValue={defaultValue} />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          {...rest}
        />
      )}
    </label>
  );
}
