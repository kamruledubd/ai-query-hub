import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { User, Mail, Phone, MessageSquare, Sparkles, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AI Knowledge Assistant — Submit Your Query" },
      {
        name: "description",
        content:
          "Submit your AI-related query and receive an AI-generated response directly in your email.",
      },
    ],
  }),
});

const WEBHOOK_URL = "/api/submit-query";

const MAX_QUERY = 1000;

type Errors = Partial<Record<"name" | "email" | "phone" | "query", string>>;

function validate(values: { name: string; email: string; phone: string; query: string }): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Full name is required";
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = "Enter a valid email";
  if (!values.phone.trim()) errors.phone = "Phone number is required";
  else if (!/^[+\d][\d\s\-().]{6,19}$/.test(values.phone))
    errors.phone = "Enter a valid phone number";
  if (!values.query.trim()) errors.query = "Query is required";
  else if (values.query.trim().length < 10)
    errors.query = "Query must be at least 10 characters";
  return errors;
}

function Index() {
  const [values, setValues] = useState({ name: "", email: "", phone: "", query: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const v = validate(values);
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success("Query submitted successfully", {
        description:
          "Your query has been submitted successfully. Please check your email for the response.",
      });
      setValues({ name: "", email: "", phone: "", query: "" });
      setErrors({});
    } catch {
      toast.error("Submission failed", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10"
      style={{ background: "var(--gradient-bg)" }}
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      <header className="relative z-10 mb-8 text-center animate-fade-in">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-1 ring-white/30 shadow-lg">
          <Sparkles className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
          AI Knowledge Assistant
        </h1>
        <p className="mt-3 max-w-md text-sm sm:text-base text-white/85">
          Submit your query and receive an AI-generated response directly in your email.
        </p>
      </header>

      <section
        className="relative z-10 w-full max-w-lg rounded-3xl border border-white/40 bg-white/80 p-6 sm:p-8 backdrop-blur-2xl animate-scale-in"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Field
            id="name"
            label="Full Name"
            icon={<User className="h-4 w-4" />}
            value={values.name}
            onChange={update("name")}
            error={errors.name}
            placeholder="Jane Doe"
            autoComplete="name"
          />
          <Field
            id="email"
            label="Email Address"
            type="email"
            icon={<Mail className="h-4 w-4" />}
            value={values.email}
            onChange={update("email")}
            error={errors.email}
            placeholder="jane@example.com"
            autoComplete="email"
          />
          <Field
            id="phone"
            label="Phone Number"
            type="tel"
            icon={<Phone className="h-4 w-4" />}
            value={values.phone}
            onChange={update("phone")}
            error={errors.phone}
            placeholder="+1 555 123 4567"
            autoComplete="tel"
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="query" className="text-sm font-medium text-foreground">
                Query
              </Label>
              <span
                className={`text-xs tabular-nums ${
                  values.query.length > MAX_QUERY ? "text-destructive" : "text-muted-foreground"
                }`}
                aria-live="polite"
              >
                {values.query.length}/{MAX_QUERY}
              </span>
            </div>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="query"
                value={values.query}
                onChange={update("query")}
                maxLength={MAX_QUERY}
                placeholder="Ask anything about AI, automation, models, prompts..."
                rows={5}
                aria-invalid={!!errors.query}
                aria-describedby={errors.query ? "query-error" : undefined}
                className="resize-none pl-9 pt-3 bg-white/70 focus-visible:ring-primary/40"
              />
            </div>
            {errors.query && (
              <p id="query-error" className="mt-1.5 text-xs text-destructive">
                {errors.query}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="group relative h-12 w-full overflow-hidden rounded-xl text-base font-semibold text-white transition-all hover:shadow-[0_20px_60px_-15px_oklch(0.55_0.22_280/0.6)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-80"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                Get AI Response
              </>
            )}
          </Button>
        </form>
      </section>

      <footer className="relative z-10 mt-8 text-xs text-white/75">
        Powered by AI Automation
      </footer>
    </main>
  );
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

function Field({ id, label, icon, value, onChange, error, type = "text", placeholder, autoComplete }: FieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-11 pl-9 bg-white/70 focus-visible:ring-primary/40"
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
