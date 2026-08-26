import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  DecorativeSpark,
} from '@/components/ui'
import { useAuth } from '@/features/auth'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

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
      <DecorativeSpark
        size={36}
        color="var(--color-accent-lime)"
        style={{ position: 'absolute', top: '15%', right: '18%', opacity: 0.7 }}
      />
      <DecorativeSpark
        size={24}
        color="var(--color-charcoal-700)"
        style={{ position: 'absolute', bottom: '20%', left: '15%', opacity: 0.3 }}
      />

      <Card
        variant="elevated"
        style={{
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardHeader style={{ alignItems: 'center', paddingBottom: '8px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <CardTitle style={{ fontSize: 'var(--text-heading-md)', margin: 0 }}>
            Access Restricted
          </CardTitle>
          <CardDescription style={{ fontSize: 'var(--text-body-sm)', marginTop: '8px' }}>
            You do not have the required permissions to view this resource.
          </CardDescription>
        </CardHeader>

        <CardContent style={{ paddingTop: '16px', paddingBottom: '24px' }}>
          {user && (
            <div
              style={{
                backgroundColor: 'var(--color-background-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-text-secondary)',
                marginBottom: '16px',
              }}
            >
              Signed in as <strong>{user.email}</strong> ({user.role})
            </div>
          )}
          <p
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            If you believe you should have access to this page, please contact your company
            administrator.
          </p>
        </CardContent>

        <CardFooter
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outline"
            iconLeft={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
          >
            Return Home
          </Button>
          <Button
            variant="ghost"
            iconLeft={<LogOut size={16} />}
            onClick={() => void logout()}
          >
            Sign Out
          </Button>

        </CardFooter>
      </Card>
    </div>
  )
}
