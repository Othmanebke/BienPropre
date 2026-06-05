import { useState, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import { supabase } from '@/services/supabaseClient';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type AuthMode = 'login' | 'signup';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful sign-in or sign-up. */
  onSuccess: () => void;
  /** Called when the user explicitly chooses to continue without an account. */
  onGuestContinue: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess, onGuestContinue }: AuthModalProps) {
  const [mode, setMode]                   = useState<AuthMode>('login');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [successMsg, setSuccessMsg]       = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMsg(null);
    setShowPassword(false);
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const { error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authErr) throw authErr;

        onSuccess();
        onClose();
      } else {
        const { error: authErr } = await supabase.auth.signUp({ email, password });
        if (authErr) throw authErr;

        // Supabase sends a confirmation email by default.
        setSuccessMsg(
          'Compte créé ! Vérifiez votre boîte mail pour confirmer votre adresse, ' +
            'puis revenez vous connecter.',
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de l\'authentification.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Se connecter' : 'Créer un compte'}
      maxWidth="sm"
    >
      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-4">

        {/* ── Email ── */}
        <Input
          type="email"
          label="Adresse e-mail"
          placeholder="vous@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftAddon={<Mail className="w-4 h-4" />}
          required
          autoComplete="email"
          autoFocus
        />

        {/* ── Password ── */}
        <Input
          type={showPassword ? 'text' : 'password'}
          label="Mot de passe"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftAddon={<Lock className="w-4 h-4" />}
          rightAddon={
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={6}
          hint={mode === 'signup' ? 'Minimum 6 caractères' : undefined}
        />

        {/* ── Error / Success ── */}
        {error !== null && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {successMsg !== null && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMsg}
          </p>
        )}

        {/* ── Submit ── */}
        {successMsg === null && (
          <Button type="submit" className="w-full" isLoading={isLoading}>
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </Button>
        )}

        {/* ── Divider ── */}
        <div className="flex items-center gap-2">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* ── Guest option ── */}
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          leftIcon={<UserCheck className="w-4 h-4" />}
          onClick={() => {
            onGuestContinue();
            onClose();
          }}
        >
          Continuer en tant qu&apos;invité
        </Button>

        {/* ── Mode toggle ── */}
        <p className="text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              Pas encore de compte ?{' '}
              <button
                type="button"
                className="font-medium text-brand-600 hover:underline"
                onClick={() => switchMode('signup')}
              >
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà inscrit ?{' '}
              <button
                type="button"
                className="font-medium text-brand-600 hover:underline"
                onClick={() => switchMode('login')}
              >
                Se connecter
              </button>
            </>
          )}
        </p>
      </form>
    </Modal>
  );
}
