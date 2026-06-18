import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Moon, Sun, CheckCircle, Cpu } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Card, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
});

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('user_gemini_api_key') || '');
  const [groqKey, setGroqKey] = useState(localStorage.getItem('user_groq_api_key') || '');
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('user_openai_api_key') || '');

  const onSaveAiKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (geminiKey.trim()) {
      localStorage.setItem('user_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('user_gemini_api_key');
    }

    if (groqKey.trim()) {
      localStorage.setItem('user_groq_api_key', groqKey.trim());
    } else {
      localStorage.removeItem('user_groq_api_key');
    }

    if (openaiKey.trim()) {
      localStorage.setItem('user_openai_api_key', openaiKey.trim());
    } else {
      localStorage.removeItem('user_openai_api_key');
    }

    toast.success('AI API Keys saved!');
  };

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const res = await authApi.updateProfile(data);
      setUser(res.data.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onSavePassword = async (data: PasswordForm) => {
    try {
      await authApi.updateProfile({ password: data.password });
      passwordForm.reset();
      toast.success('Password updated!');
    } catch {
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account and preferences.</p>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-brand-600 dark:text-brand-400" size={18} />
            </div>
            <CardTitle>Profile</CardTitle>
          </div>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <Input
              label="Full name"
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />
            <Input
              label="Email address"
              type="email"
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register('email')}
            />
            <Button type="submit" loading={profileForm.formState.isSubmitting}>
              <CheckCircle className="w-4 h-4" />
              Save Profile
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Lock className="w-4.5 h-4.5 text-amber-600" size={18} />
            </div>
            <CardTitle>Change Password</CardTitle>
          </div>
          <form onSubmit={passwordForm.handleSubmit(onSavePassword)} className="space-y-4">
            <Input
              label="New password"
              type="password"
              placeholder="Min. 8 characters"
              error={passwordForm.formState.errors.password?.message}
              {...passwordForm.register('password')}
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="••••••••"
              error={passwordForm.formState.errors.confirmPassword?.message}
              {...passwordForm.register('confirmPassword')}
            />
            <Button type="submit" loading={passwordForm.formState.isSubmitting} variant="outline">
              Update Password
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* AI Configuration */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Cpu className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" size={18} />
            </div>
            <div>
              <CardTitle>AI Configuration</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Configure your custom API keys. Stored securely in your local browser.</p>
            </div>
          </div>
          <form onSubmit={onSaveAiKeys} className="space-y-4">
            <Input
              label="Gemini API Key"
              type="password"
              placeholder="Gemini API key"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
            <Input
              label="Groq API Key"
              type="password"
              placeholder="gsk_..."
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
            />
            <Input
              label="OpenAI API Key"
              type="password"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
            <Button type="submit">
              Save API Keys
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {isDark ? <Moon className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" size={18} /> : <Sun className="w-4.5 h-4.5 text-amber-600" size={18} />}
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">{isDark ? 'Dark mode' : 'Light mode'} is active</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${isDark ? 'bg-brand-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
