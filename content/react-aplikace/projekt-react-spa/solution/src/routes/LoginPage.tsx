import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { login } from '../api/endpoints';

type Errors = { email?: string; password?: string };

function validate(email: string, password: string): Errors {
  const errors: Errors = {};
  if (!email.includes('@') || !email.split('@')[1]?.includes('.')) {
    errors.email = 'Napiš e-mail se zavináčem a tečkou, například eva@example.com.';
  }
  if (password.length < 6) errors.password = 'Heslo má aspoň šest znaků.';
  return errors;
}

export default function LoginPage() {
  const [errors, setErrors] = useState<Errors>({});
  const client = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const mutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: (user) => {
      client.setQueryData(['me'], user);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      navigate(from ?? '/', { replace: true });
    },
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    const found = validate(email, password);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    mutation.mutate({ email, password });
  }

  return (
    <section className="login">
      <h1>Přihlášení</h1>
      <p className="muted">Zkušební účet: eva@example.com / kvasnice</p>

      <form noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && <p className="error" id="email-error">{errors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="password">Heslo</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.password ? 'true' : undefined}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && <p className="error" id="password-error">{errors.password}</p>}
        </div>

        {mutation.isError && <p role="alert">{(mutation.error as Error).message}</p>}

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Přihlašuju…' : 'Přihlásit se'}
        </button>
      </form>
    </section>
  );
}
