"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  Heart,
  ImagePlus,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { requestSchema } from "@/lib/domain";
import { today, whatsapp } from "@/lib/presentation";
import { api } from "./form-utils";
import { Dialog } from "./dialog";
import { EmptyState } from "./ui";
type Input = z.input<typeof requestSchema>;
type Output = z.output<typeof requestSchema>;
type Key = keyof Input;
const DRAFT_KEY = "cc-cake-brief-v2";
const steps = [
  {
    title: "The occasion",
    heading: "What are we celebrating?",
    hint: "A big milestone or a little get-together. Start with the day you have in mind.",
    fields: ["event_type", "event_date", "delivery_window"],
  },
  {
    title: "Size & servings",
    heading: "A slice for everyone.",
    hint: "An estimate is absolutely fine. We’ll help you work out the right size.",
    fields: ["guests", "weight", "tiers"],
  },
  {
    title: "Flavours & finish",
    heading: "Now for the delicious part.",
    hint: "Choose your favourites. We’ll discuss what works best for your cake.",
    fields: ["flavour", "filling", "frosting", "finish", "allergies"],
  },
  {
    title: "The little details",
    heading: "Make it feel like you.",
    hint: "A favourite colour, a special message, or a theme they’ll love.",
    fields: ["theme", "colours", "cake_message", "notes"],
  },
  {
    title: "Your inspiration",
    heading: "Show us what you love.",
    hint: "A cake, a colour palette, a party invitation. A little inspiration goes a long way.",
    fields: [],
  },
  {
    title: "Delivery or pickup",
    heading: "Where’s the celebration?",
    hint: "We arrange delivery within Karachi. Pickup details are confirmed with your quotation.",
    fields: ["method", "area", "address"],
  },
  {
    title: "Budget & contact",
    heading: "Let’s keep in touch.",
    hint: "Your budget helps us suggest the right details. We’ll discuss everything before you book.",
    fields: ["budget", "name", "phone", "email"],
  },
  {
    title: "Review & send",
    heading: "Your idea, all together.",
    hint: "Take a little look. You can go back and change anything before sending.",
    fields: ["acknowledged"],
  },
] as const;
const labels: Partial<Record<Key, string>> = {
  event_type: "Occasion",
  event_date: "Event date",
  delivery_window: "Required time",
  guests: "Guests",
  weight: "Weight (pounds)",
  tiers: "Tiers",
  flavour: "Flavour",
  filling: "Filling",
  frosting: "Frosting",
  finish: "Finish",
  allergies: "Dietary needs",
  theme: "Theme",
  colours: "Colours",
  cake_message: "Cake message",
  notes: "Extra details",
  method: "Delivery or pickup",
  area: "Karachi area",
  address: "Full address",
  budget: "Budget (PKR)",
  name: "Your name",
  phone: "WhatsApp number",
  email: "Email",
};
const defaults: Partial<Input> = {
  method: "delivery",
  event_type: "Birthday",
  guests: 12,
  weight: 2,
  tiers: 1,
  flavour: "Chocolate",
  filling: "Chocolate ganache",
  frosting: "Buttercream",
  finish: "cream",
  area: "",
  address: "",
  notes: "",
  email: "",
  theme: "",
  colours: "",
  cake_message: "",
  allergies: "",
  delivery_window: "",
  budget: "",
  name: "",
  phone: "",
  event_date: "",
};
export function CustomForm({
  design = "",
  businessNumber,
  demo,
}: {
  design?: string;
  businessNumber: string;
  demo: boolean;
}) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [draftMessage, setDraftMessage] = useState(
    "Your progress stays on this device.",
  );
  const [clearOpen, setClearOpen] = useState(false);
  const [success, setSuccess] = useState<{
    number: string;
    uploadToken: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState("");
  const ready = useRef(false);
  const submissionKey = useRef("");
  const heading = useRef<HTMLHeadingElement>(null);
  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, Output>({
    resolver: zodResolver(requestSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { ...defaults, gallery_id: design },
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        if (
          stored.version === 2 &&
          Date.now() - stored.savedAt < 7 * 86400000 &&
          stored.values &&
          typeof stored.values === "object"
        ) {
          const allowed = { ...defaults };
          for (const key of Object.keys(defaults) as Key[]) {
            const value = stored.values[key];
            if (
              (typeof value === "string" && value.length <= 2000) ||
              (typeof value === "number" && Number.isFinite(value))
            ) {
              Object.assign(allowed, { [key]: value });
            }
          }
          reset({
            ...allowed,
            gallery_id: design || stored.values.gallery_id || "",
          });
          setStep(Math.max(0, Math.min(7, Number(stored.step) || 0)));
          setDraftMessage(
            "Your saved draft is ready. Reattach images if needed.",
          );
        } else localStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      setDraftMessage("Draft saving is unavailable in this browser.");
    }
    ready.current = true;
  }, [design, reset]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sub = watch((values) => {
      if (!ready.current || success) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          const { acknowledged, website, ...safe } = values;
          void acknowledged;
          void website;
          localStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({
              version: 2,
              savedAt: Date.now(),
              step,
              values: safe,
            }),
          );
          setDraftMessage("Draft saved on this device · kept for 7 days");
        } catch {
          setDraftMessage("Your browser could not save this draft.");
        }
      }, 400);
    });
    return () => {
      sub.unsubscribe();
      clearTimeout(timer);
    };
  }, [watch, step, success]);
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);
  const method = watch("method");
  const values = watch();
  function go(next: number) {
    setError("");
    setStep(next);
    try {
      const { acknowledged, website, ...safe } = getValues();
      void acknowledged;
      void website;
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          version: 2,
          savedAt: Date.now(),
          step: next,
          values: safe,
        }),
      );
    } catch {}
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({
        block: "nearest",
        behavior: "instant",
      });
    });
  }
  function field(name: Key, label: string, type = "text", options?: string[]) {
    const props = {
      ...register(name),
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
      "aria-label": label,
    };
    return (
      <label key={name}>
        {label}
        {options ? (
          <select {...props}>
            {options.map((o) => (
              <option key={o} value={o}>
                {o.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea {...props} />
        ) : (
          <input
            {...props}
            type={type}
            min={type === "date" ? today() : type === "number" ? 1 : undefined}
            step={name === "weight" ? ".5" : undefined}
            autoComplete={
              name === "name"
                ? "name"
                : name === "phone"
                  ? "tel"
                  : name === "email"
                    ? "email"
                    : name === "address"
                      ? "street-address"
                      : undefined
            }
            inputMode={
              type === "tel" ? "tel" : type === "number" ? "decimal" : undefined
            }
          />
        )}{" "}
        <span
          id={`${name}-error`}
          className="field-error field-error-slot"
          aria-live="polite"
        >
          {errors[name] ? String(errors[name]?.message) : ""}
        </span>
      </label>
    );
  }
  function choices(name: Key, label: string, options: string[]) {
    return (
      <fieldset className="full">
        <legend>{label}</legend>
        <div className="option-grid">
          {options.map((o) => (
            <label className="option-card" key={o}>
              <input type="radio" value={o} {...register(name)} />
              <span>{o.replaceAll("_", " ")}</span>
            </label>
          ))}
        </div>
        {errors[name] && (
          <p className="field-error">{String(errors[name]?.message)}</p>
        )}
      </fieldset>
    );
  }
  async function next() {
    const keys = [...steps[step].fields] as Key[];
    if (await trigger(keys, { shouldFocus: true })) {
      if (
        step === 5 &&
        method === "delivery" &&
        (!(getValues("area") || "").trim() ||
          (getValues("address") || "").trim().length < 6)
      ) {
        setError("Please add your Karachi area and full delivery address.");
        return;
      }
      go(step + 1);
    }
  }
  async function submit(data: Output) {
    if (step !== 7) {
      await next();
      return;
    }
    setError("");
    try {
      if (!submissionKey.current)
        submissionKey.current = Array.from(
          crypto.getRandomValues(new Uint8Array(32)),
          (b) => b.toString(16).padStart(2, "0"),
        ).join("");
      const result = await api("/api/requests", data, submissionKey.current);
      setSuccess(result);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      for (const file of files) {
        const f = new FormData();
        f.set("kind", "reference");
        f.set("token", result.uploadToken);
        f.set("file", file);
        try {
          await api("/api/upload", f);
        } catch (e) {
          setUploadError((e as Error).message);
          break;
        }
      }
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "We couldn’t connect. Your draft is safe; please check your connection and try again."
          : (e as Error).message,
      );
    }
  }
  if (success)
    return (
      <div className="success">
        <EmptyState
          title="Your idea is in good hands."
          description={`Your request is ${success.number}. Creamy Creations will review your design and date, then get in touch with a personal quotation.`}
        />
        <p className="notice">This is a request, not a confirmed booking.</p>
        {uploadError && (
          <p className="error">
            Your request was saved, but some images didn’t upload. Please share
            them in your message. {uploadError}
          </p>
        )}
        <a
          className="btn"
          href={whatsapp(
            businessNumber,
            `Hello! My custom cake request is ${success.number}.`,
          )}
        >
          Discuss my request ↗
        </a>
      </div>
    );
  return (
    <div className="brief-layout">
      <aside className="brief-sidebar">
        <ol aria-label="Cake brief steps">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className={i === step ? "current" : i < step ? "complete" : ""}
              aria-current={i === step ? "step" : undefined}
            >
              <span>{i < step ? <Check size={15} /> : i + 1}</span>
              {s.title}
            </li>
          ))}
        </ol>
        <div className="draft-controls">
          <p role="status">{draftMessage}</p>
          <button type="button" onClick={() => setClearOpen(true)}>
            Clear saved draft
          </button>
        </div>
      </aside>
      <form
        className="panel brief-panel"
        noValidate
        onSubmit={(e) => {
          if (step < 7) {
            e.preventDefault();
            void next();
          } else
            void handleSubmit(submit, (err) => {
              const first = Object.keys(err)[0] as Key;
              const index = steps.findIndex((s) =>
                (s.fields as readonly Key[]).includes(first),
              );
              if (index >= 0) go(index);
              setError("Please check the highlighted details.");
            })(e);
        }}
      >
        <div className="brief-progress">
          <span>YOUR CAKE BRIEF · {step + 1} OF 8</span>
          <progress aria-label="Brief progress" value={step + 1} max={8} />
        </div>
        <h2 ref={heading} tabIndex={-1}>
          {steps[step].heading}
        </h2>
        <p className="brief-intro">{steps[step].hint}</p>
        <div className="step-content" key={step}>
          <div className="form-grid">
            {step === 0 && (
              <>
                {choices("event_type", "The occasion", [
                  "Birthday",
                  "Wedding",
                  "Anniversary",
                  "Kids",
                  "Other occasions",
                ])}
                {field("event_date", "Event date", "date")}
                {field(
                  "delivery_window",
                  "Required time / delivery window",
                  "time",
                )}
              </>
            )}
            {step === 1 && (
              <>
                {field("guests", "Number of guests", "number")}
                {field("weight", "Desired weight (pounds)", "number")}
                {field("tiers", "Number of tiers", "number")}
                <p className="notice full">
                  Not sure about portions? Choose your best estimate. We’ll help
                  you find the right size when we discuss your cake.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                {choices("flavour", "Your favourite flavour", [
                  "Chocolate",
                  "Vanilla",
                  "Red velvet",
                  "Coffee",
                  "Other",
                ])}
                {field("filling", "Filling")}
                {field("frosting", "Frosting type")}
                {choices("finish", "Preferred finish", [
                  "cream",
                  "fondant",
                  "not_sure",
                ])}
                <div className="full">
                  {field("allergies", "Dietary needs or allergies", "textarea")}
                  <p className="file-help">
                    Please share any allergies so we can discuss what our home
                    kitchen can safely accommodate.
                  </p>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                {field("theme", "Theme or inspiration")}
                {field("colours", "Preferred colours")}
                {field("cake_message", "Message or name on the cake")}
                <div className="full">
                  {field("notes", "Anything else we should know?", "textarea")}
                </div>
              </>
            )}
            {step === 4 && (
              <div className="full">
                <div className="upload-zone">
                  <ImagePlus size={30} className="mx-auto" />
                  <label>
                    Reference images
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => {
                        const nextFiles = [
                          ...files,
                          ...Array.from(e.target.files || []),
                        ];
                        if (
                          nextFiles.length > 5 ||
                          nextFiles.some(
                            (f) =>
                              f.size > 5 * 1024 * 1024 ||
                              ![
                                "image/jpeg",
                                "image/png",
                                "image/webp",
                              ].includes(f.type),
                          )
                        ) {
                          setError(
                            "Choose up to five JPG, PNG or WebP images, no larger than 5 MB each.",
                          );
                        } else {
                          setFiles(nextFiles);
                          setError("");
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <p className="file-help">
                    Up to 5 images · JPG, PNG or WebP · 5 MB each.
                    <br />
                    Images stay private and are uploaded when you send your
                    request.
                  </p>
                </div>
                {previews.length > 0 && (
                  <div className="image-previews">
                    {previews.map((url, i) => (
                      <div className="image-preview" key={url}>
                        <Image
                          unoptimized
                          src={url}
                          alt={`Your reference: ${files[i]?.name}`}
                          width={240}
                          height={240}
                        />
                        <button
                          type="button"
                          aria-label={`Remove reference ${i + 1}`}
                          onClick={() =>
                            setFiles(files.filter((_, n) => n !== i))
                          }
                        >
                          <X size={18} className="mx-auto" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="file-help">
                  Your text draft is saved. Reattach images if you leave or
                  refresh this page.
                </p>
                {design && (
                  <p className="notice">
                    Your selected gallery design is included with this brief.
                  </p>
                )}
              </div>
            )}
            {step === 5 && (
              <>
                {choices("method", "How would you like to receive your cake?", [
                  "delivery",
                  "pickup",
                ])}
                {method === "delivery" ? (
                  <>
                    {field("area", "Karachi area")}
                    <div className="full">
                      {field("address", "Full delivery address", "textarea")}
                    </div>
                  </>
                ) : (
                  <p className="notice full">
                    We’ll share the pickup location and confirm your collection
                    time with your quotation.
                  </p>
                )}
              </>
            )}
            {step === 6 && (
              <>
                {field("budget", "Budget range (PKR)")}
                {field("name", "Your name")}
                {field("phone", "WhatsApp number", "tel")}
                {field("email", "Email (optional)", "email")}
                <p className="file-help full">
                  We use these details only to discuss and fulfil your order. No
                  account needed.
                </p>
              </>
            )}
            {step === 7 && (
              <div className="full">
                {steps.slice(0, 7).map((s, i) => (
                  <section className="review-section" key={s.title}>
                    <h3>
                      {s.title}
                      <button type="button" onClick={() => go(i)}>
                        Edit
                      </button>
                    </h3>
                    {i === 4 ? (
                      <p>
                        {files.length} reference image
                        {files.length === 1 ? "" : "s"}
                        {design ? " · Gallery design included" : ""}
                      </p>
                    ) : (
                      <dl>
                        {s.fields.map((key) => (
                          <div className="contents" key={key}>
                            <dt>{labels[key]}</dt>
                            <dd>
                              {String(
                                values[key as Key] || "Not specified",
                              ).replaceAll("_", " ")}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </section>
                ))}
                <label className="check-label mt-5">
                  <input type="checkbox" {...register("acknowledged")} />I
                  understand this is a request, not a confirmed booking.
                </label>
                {errors.acknowledged && (
                  <p className="field-error">
                    Please confirm that you understand the booking process.
                  </p>
                )}
                {demo && (
                  <p className="notice">
                    Online requests are being set up. Your draft is saved;
                    contact us on Instagram to discuss your cake.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <input type="hidden" {...register("website")} />
        <div className="booking-note">
          <Heart size={16} />
          <span>
            Your booking is confirmed only after you accept the quotation and we
            verify your advance.
          </span>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => go(step - 1)}
            disabled={step === 0 || isSubmitting}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          {step < 7 ? (
            <button type="button" className="btn" onClick={next}>
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting || demo}
            >
              {isSubmitting
                ? "Sending your request…"
                : "Send my cake request ↗"}
            </button>
          )}
        </div>
      </form>
      <Dialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Start a fresh cake brief?"
      >
        <p>
          Your saved text and the reference images selected for this visit will
          be cleared.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            className="btn secondary"
            onClick={() => setClearOpen(false)}
          >
            Keep my draft
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              try {
                localStorage.removeItem(DRAFT_KEY);
              } catch {}
              reset({ ...defaults, gallery_id: design });
              setFiles([]);
              setStep(0);
              setClearOpen(false);
              setDraftMessage("Ready for a fresh idea.");
              submissionKey.current = "";
            }}
          >
            Clear draft
          </button>
        </div>
      </Dialog>
    </div>
  );
}
