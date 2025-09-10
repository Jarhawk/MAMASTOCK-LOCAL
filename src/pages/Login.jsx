import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { loginLocal } from '@/auth/localAccount';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (pending) return;
    const form = e.currentTarget;
    const email = form.email?.value?.trim();
    const password = form.password?.value ?? '';
    setError('');
    setPending(true);
    if (!email || !password) {
      setError('Veuillez saisir email et mot de passe.');
      setPending(false);
      return;
    }
    try {
      const u = await loginLocal(email, password);
      signIn(u);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Connexion impossible');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="p-4 max-w-sm mx-auto">
      <h1 className="text-xl mb-4">Connexion</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          autoComplete="current-password"
          required
          className="border p-2 rounded"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-white p-2 rounded disabled:opacity-50"
        >
          {pending ? 'Connexion…' : 'Login'}
        </button>
      </form>
    </div>
  );
}

