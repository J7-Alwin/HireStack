import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
  Alert,
  DecorativeSpark,
  DecorativeCircle,
} from '@/components/ui'
import { useAuth } from '../context/auth-context-base'
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'


export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error: authError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})

  const returnTo = (location.state as { returnTo?: string })?.returnTo || '/'

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await login({ email: email.trim(), password })
      navigate(returnTo, { replace: true })
    } catch {
      // Error state is handled via AuthContext error
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Branding Elements */}
      <DecorativeCircle
        size={340}
        color="var(--color-accent-lime)"
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-80px',
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      />
      <DecorativeSpark
        size={40}
        color="var(--color-accent-lime)"
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '8%',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />
      <DecorativeSpark
        size={20}
        color="var(--color-charcoal-700)"
        style={{
          position: 'absolute',
          top: '20%',
          left: '18%',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-charcoal-900)',
              color: 'var(--color-accent-lime)',
              fontWeight: 800,
              fontSize: '22px',
              marginBottom: '12px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            H
          </div>
          <h1
            style={{
              fontSize: 'var(--text-heading-lg)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              margin: '0 0 4px 0',
              letterSpacing: '-0.02em',
            }}
          >
            HireStack
          </h1>
          <p
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            Intelligent Applicant Tracking System
          </p>
        </div>

        {/* Login Card */}
        <Card variant="elevated" style={{ padding: '8px' }}>
          <CardHeader>
            <CardTitle style={{ fontSize: 'var(--text-heading-sm)' }}>
              Sign in to your account
            </CardTitle>
            <CardDescription>
              Enter your corporate credentials to access the platform.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {authError && (
              <div style={{ marginBottom: '16px' }}>
                <Alert variant="error" title="Authentication Error">
                  {authError}
                </Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: undefined }))
                    }
                  }}
                  error={validationErrors.email}
                  iconLeft={<Mail size={16} />}
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={isLoading}
                />

                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: undefined }))
                    }
                  }}
                  error={validationErrors.password}
                  iconLeft={<Lock size={16} />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'inherit',
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />

                <div style={{ marginTop: '8px' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    disabled={isLoading}
                    iconRight={!isLoading ? <ArrowRight size={16} /> : undefined}
                  >
                    Sign In
                  </Button>

                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
