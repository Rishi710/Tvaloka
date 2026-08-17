"use client";

import { useId, useRef, useState } from "react";

type FieldName = "name" | "email" | "subject" | "message";
type Errors = Partial<Record<FieldName, string>>;

const subjects = [
  "Order enquiry",
  "Product advice",
  "Wellness Circle",
  "Feedback",
  "Something else",
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

const fieldBase =
  "w-full rounded-[var(--radius-xs)] bg-black/[.04] px-[var(--space-4)] py-[var(--space-3)] text-sm text-primary placeholder:text-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black disabled:opacity-50";

function validate(values: Record<FieldName, string>): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) {
    errors.name = "Enter your name.";
  }
  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address (e.g. name@example.com).";
  }
  if (!values.subject) {
    errors.subject = "Choose what your message is about.";
  }
  if (!values.message.trim()) {
    errors.message = "Enter a message.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Enter at least 10 characters so we can help properly.";
  }
  return errors;
}

export function ContactForm() {
  const baseId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fieldId = (name: FieldName) => `${baseId}-${name}`;
  const errorId = (name: FieldName) => `${baseId}-${name}-error`;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors)[0] as FieldName | undefined;
    if (firstError) {
      formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(firstError))}`)?.focus();
      return;
    }

    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-xs)] bg-black/[.04] p-[var(--space-6)]"
      >
        <h3 className="font-display text-md text-primary">Thank you for reaching out</h3>
        <p className="mt-[var(--space-3)] text-sm text-tertiary">
          Your details have been captured. Our care team typically responds within two working
          days.
        </p>
        <button
          type="button"
          onClick={() => setIsSubmitted(false)}
          className={`mt-[var(--space-5)] rounded-[var(--radius-xs)] bg-action-onlight-bg px-[var(--space-5)] py-[var(--space-3)] text-sm font-semibold text-action-onlight-text transition-colors duration-[var(--motion-instant)] hover:bg-action-onlight-bg-hover ${focusRing}`}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${baseId}-heading`}
      className="flex flex-col gap-[var(--space-5)]"
    >
      <h2 id={`${baseId}-heading`} className="font-display text-md text-primary">
        Send us a message
      </h2>

      <div className="grid gap-[var(--space-5)] sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId("name")} className="block text-sm font-semibold text-primary">
            Name 
            {/* <span className="text-tertiary">(required)</span> */}
          </label>
          <input
            id={fieldId("name")}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? errorId("name") : undefined}
            className={`mt-[var(--space-2)] ${fieldBase}`}
          />
          {errors.name ? (
            <p id={errorId("name")} className="mt-[var(--space-2)] text-xs font-semibold text-error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={fieldId("email")} className="block text-sm font-semibold text-primary">
            Email 
            {/* <span className="text-tertiary">(required)</span> */}
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? errorId("email") : undefined}
            className={`mt-[var(--space-2)] ${fieldBase}`}
          />
          {errors.email ? (
            <p id={errorId("email")} className="mt-[var(--space-2)] text-xs font-semibold text-error">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor={fieldId("subject")} className="block text-sm font-semibold text-primary">
          What is this about? 
          {/* <span className="text-tertiary">(required)</span> */}
        </label>
        <select
          id={fieldId("subject")}
          name="subject"
          defaultValue=""
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? errorId("subject") : undefined}
          className={`mt-[var(--space-2)] ${fieldBase}`}
        >
          <option value="" disabled>
            Choose a topic
          </option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        {errors.subject ? (
          <p id={errorId("subject")} className="mt-[var(--space-2)] text-xs font-semibold text-error">
            {errors.subject}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={fieldId("message")} className="block text-sm font-semibold text-primary">
          Message 
          {/* <span className="text-tertiary">(required)</span> */}
        </label>
        <textarea
          id={fieldId("message")}
          name="message"
          rows={6}
          placeholder="Tell us how we can help."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? errorId("message") : undefined}
          className={`mt-[var(--space-2)] resize-y ${fieldBase}`}
        />
        {errors.message ? (
          <p id={errorId("message")} className="mt-[var(--space-2)] text-xs font-semibold text-error">
            {errors.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        className={`self-start rounded-[var(--radius-xs)] bg-action-onlight-bg px-[var(--space-6)] py-[var(--space-3)] text-sm font-semibold text-action-onlight-text transition-colors duration-[var(--motion-instant)] hover:bg-action-onlight-bg-hover active:bg-action-onlight-bg-active ${focusRing}`}
      >
        Send Message
      </button>
    </form>
  );
}
