import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Briefcase,
  FileText,
  Calendar,
  FileCheck,
  GitBranch,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Menu,
  X,
  Cpu,
} from 'lucide-react'
import { useAuthStore } from '@/stores'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DecorativeSpark } from '@/components/ui/decorative'

export function LandingPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const dashboardTarget = '/app'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* 1. Global Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'rgba(246, 245, 242, 0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo & Branding */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-charcoal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <DecorativeSpark size={20} color="var(--color-lime)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: 'var(--color-charcoal)',
                  lineHeight: 1.1,
                }}
              >
                HireStack
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                ATS Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '28px',
            }}
            className="landing-nav-desktop"
          >
            <a
              href="#features"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Capabilities
            </a>
            <a
              href="#workflows"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Hiring Pipeline
            </a>
            <a
              href="#ai"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              AI Trust Model
            </a>
            <a
              href="#security"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                transition: 'color var(--transition-fast)',
              }}
            >
              Security & RBAC
            </a>
          </nav>

          {/* Action Button CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {isAuthenticated && user ? (
              <Link to={dashboardTarget}>
                <Button variant="primary" size="sm" iconRight={<ArrowRight size={16} />}>
                  Go to Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="accent" size="sm" iconRight={<ArrowRight size={16} />}>
                    Launch App
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
              className="landing-menu-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', fontWeight: 500 }}
            >
              Capabilities
            </a>
            <a
              href="#workflows"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', fontWeight: 500 }}
            >
              Hiring Pipeline
            </a>
            <a
              href="#ai"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', fontWeight: 500 }}
            >
              AI Trust Model
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', fontWeight: 500 }}
            >
              Security & RBAC
            </a>
            <div style={{ paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth size="md">
                  Sign In to ATS
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section
        style={{
          padding: '64px 24px 80px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Badge variant="accent" withDot size="md">
            Next-Generation Intelligent ATS
          </Badge>
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px, 5.5vw, 56px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            color: 'var(--color-charcoal)',
            maxWidth: '920px',
            margin: '0 0 20px',
          }}
        >
          HireStack ATS — Intelligent Recruitment Infrastructure
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'var(--color-text-secondary)',
            maxWidth: '760px',
            lineHeight: 1.6,
            margin: '0 0 36px',
          }}
        >
          Unified candidate intelligence, requisition planning, structured multi-round interview
          coordination, and decision-support AI—engineered for enterprise precision and tenant security.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '48px',
          }}
        >
          <Link to="/login">
            <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
              Open ATS Workspace
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg">
              Explore Capabilities
            </Button>
          </a>
        </div>

        {/* Product Metric & Showcase Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            width: '100%',
            maxWidth: '1080px',
          }}
        >
          <Card variant="elevated" padding="md" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Layers size={18} color="var(--color-charcoal)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                UNIFIED ATS
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-charcoal)' }}>
              7 Modules
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Candidates, Jobs, Applications, Interviews, Offers, Pipeline & Dashboards.
            </div>
          </Card>

          <Card variant="elevated" padding="md" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="var(--color-charcoal)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                ACCESS CONTROL
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-charcoal)' }}>
              4 Tier RBAC
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Company Admin, Recruiter, Candidate & Super Admin isolation.
            </div>
          </Card>

          <Card variant="elevated" padding="md" style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="var(--color-charcoal)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                DECISION AI
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-charcoal)' }}>
              100% Advisory
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Human-in-the-loop AI with zero autonomous hiring mutations.
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Core ATS Capabilities Section */}
      <section
        id="features"
        style={{
          padding: '80px 24px',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <Badge variant="accent" size="sm" style={{ marginBottom: '12px' }}>
              Full-Cycle Recruitment
            </Badge>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                marginBottom: '16px',
              }}
            >
              Engineered for Modern Talent Teams
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--color-text-secondary)',
                maxWidth: '640px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Every stage of the hiring lifecycle is integrated seamlessly with deterministic state
              transitions, structured audit logging, and role-guarded workflows.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {/* 1. Candidate Management */}
            <Card variant="default" padding="lg">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-warm-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Users size={22} color="var(--color-charcoal)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                Candidate Intelligence
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Source, parse, and organize candidate profiles with granular experience tags, resume
                history, and recruiter notes in one centralized ledger.
              </p>
            </Card>

            {/* 2. Job Requisitions */}
            <Card variant="default" padding="lg">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-warm-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Briefcase size={22} color="var(--color-charcoal)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                Job Requisitions
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Multi-department headcount planning, structured job descriptions, workplace types, and
                custom compensation ranges with openings tracking.
              </p>
            </Card>

            {/* 3. Applications */}
            <Card variant="default" padding="lg">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-warm-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <FileText size={22} color="var(--color-charcoal)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                Structured Applications
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Connect candidates to open requisitions with recruiter assignment, multi-source
                attribution, and complete application history.
              </p>
            </Card>

            {/* 4. Interviews */}
            <Card variant="default" padding="lg">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-warm-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Calendar size={22} color="var(--color-charcoal)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                Interview Coordination
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Multi-round scheduling (Screening, Technical, Managerial, HR, Final) with video meeting
                links, timezone alignment, and interviewer prep notes.
              </p>
            </Card>

            {/* 5. Offers */}
            <Card variant="default" padding="lg">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-warm-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <FileCheck size={22} color="var(--color-charcoal)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                Offer Management
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Multi-currency compensation modeling, joining timelines, expiry rules, letter document
                attachments, and formal revision tracking.
              </p>
            </Card>

            {/* 6. Hiring Pipeline */}
            <Card variant="default" padding="lg">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-warm-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <GitBranch size={22} color="var(--color-charcoal)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                Interactive Kanban Pipeline
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Visual board tracking across APPLIED, SCREENING, SHORTLISTED, INTERVIEWS, OFFER, and
                HIRED with sequential validation and admin overrides.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. End-to-End Workflow Showcase */}
      <section
        id="workflows"
        style={{
          padding: '80px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <Badge variant="accent" size="sm" style={{ marginBottom: '12px' }}>
            Workflow Integration
          </Badge>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}
          >
            A Continuous, Connected ATS Experience
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Zero data silos. Move smoothly from sourcing to onboarding with contextual navigation and
            pre-populated actions at every transition.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            { step: '01', title: 'Source & Parse', desc: 'Add candidates and extract resume entities.' },
            { step: '02', title: 'Job Application', desc: 'Create applications linked to open requisitions.' },
            { step: '03', title: 'Coordinate Interviews', desc: 'Schedule structured rounds with panel prep.' },
            { step: '04', title: 'Draft & Revise Offers', desc: 'Configure compensation and formal offer terms.' },
            { step: '05', title: 'Move Pipeline', desc: 'Advance through pipeline stages to final hire.' },
          ].map((item) => (
            <Card key={item.step} variant="elevated" padding="md" style={{ position: 'relative' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  marginBottom: '8px',
                }}
              >
                STAGE {item.step}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{item.title}</h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. AI Trust Model & Decision Support */}
      <section
        id="ai"
        style={{
          padding: '80px 24px',
          backgroundColor: 'var(--color-charcoal)',
          color: 'var(--color-white)',
          borderTop: '1px solid var(--color-border-dark)',
          borderBottom: '1px solid var(--color-border-dark)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <Badge
              variant="accent"
              size="sm"
              style={{
                marginBottom: '12px',
                backgroundColor: 'var(--color-lime)',
                color: 'var(--color-charcoal)',
              }}
            >
              AI Decision Support
            </Badge>
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--color-white)',
                marginBottom: '16px',
              }}
            >
              Advisory Intelligence. Human Decision Authority.
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--color-text-inverse-secondary)',
                maxWidth: '680px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              HireStack AI provides structured recommendations, scorecards, and requisition digests to
              accelerate talent operations while keeping hiring authority firmly in human hands.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            {[
              {
                title: 'Resume Entity Parsing',
                desc: 'Extracts skills, work history, and contact details from PDF/DOCX resumes.',
              },
              {
                title: 'ATS Compatibility Scoring',
                desc: 'Multidimensional skill analysis against job descriptions on explicit request.',
              },
              {
                title: 'Resume Recommendations',
                desc: 'Generates targeted improvement advice for candidate resumes.',
              },
              {
                title: 'Candidate AI Insights',
                desc: 'Generates structured candidate summaries, strengths, risks, and interview questions.',
              },
              {
                title: 'Job Applicant Matching',
                desc: 'Ranks applicants for a requisition with granular multidimensional fit scores.',
              },
              {
                title: 'Interview Assistant',
                desc: 'Produces tailored interview kits, question prompts, and evaluation criteria.',
              },
            ].map((aiFeature) => (
              <div
                key={aiFeature.title}
                style={{
                  backgroundColor: 'var(--color-charcoal-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  border: '1px solid var(--color-border-dark)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <Cpu size={16} color="var(--color-lime)" />
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-white)' }}>
                    {aiFeature.title}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-inverse-secondary)',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {aiFeature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* AI Trust Guarantee Box */}
          <div
            style={{
              backgroundColor: 'rgba(227, 255, 122, 0.08)',
              border: '1px solid var(--color-lime-dark)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              maxWidth: '880px',
              margin: '0 auto',
            }}
          >
            <CheckCircle2 size={24} color="var(--color-lime)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-lime)', margin: '0 0 6px' }}>
                Strict AI Trust & Privacy Guarantee
              </h4>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-inverse-secondary)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                AI generation is triggered strictly on explicit user action. AI never automatically
                rejects candidates, hires candidates, modifies application stages, or changes interview
                outcomes. All AI outputs carry clear advisory disclaimers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Security & Multi-Tenant RBAC */}
      <section
        id="security"
        style={{
          padding: '80px 24px',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <Badge variant="accent" size="sm" style={{ marginBottom: '12px' }}>
            Enterprise Foundation
          </Badge>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}
          >
            Security, Privacy & Deterministic RBAC
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Built from the ground up for strict organizational tenant isolation, defense-in-depth role
            guards, and zero credential leakage.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          <Card variant="default" padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Lock size={20} color="var(--color-charcoal)" />
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Bearer Token Security</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Encapsulated token lifecycle in memory and storage with automated purge on 401 session
              expiration and logout cache invalidation.
            </p>
          </Card>

          <Card variant="default" padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <ShieldCheck size={20} color="var(--color-charcoal)" />
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Role-Based Access</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Enforced at the route, navigation, and action levels across Company Admin, Recruiter,
              Candidate, and Super Admin roles.
            </p>
          </Card>

          <Card variant="default" padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Layers size={20} color="var(--color-charcoal)" />
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Tenant Isolation</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              All queries and mutations are isolated to authenticated organization boundaries without
              manual tenant injection.
            </p>
          </Card>
        </div>
      </section>

      {/* 7. Bottom Call-To-Action Banner */}
      <section
        style={{
          padding: '64px 24px',
          backgroundColor: 'var(--color-warm-white-subtle)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
            }}
          >
            Ready to Experience Modern Recruitment?
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            Access your organization workspace or sign in to explore candidate intelligence, structured
            interviews, and automated pipeline workflows.
          </p>

          <Link to="/login">
            <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>
              Sign In to ATS Workspace
            </Button>
          </Link>
        </div>
      </section>

      {/* 8. Global Public Footer */}
      <footer
        style={{
          backgroundColor: 'var(--color-charcoal)',
          color: 'var(--color-warm-white)',
          padding: '48px 24px 32px',
          borderTop: '1px solid var(--color-border-dark)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            {/* Logo & System Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-charcoal-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DecorativeSpark size={16} color="var(--color-lime)" />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                HireStack ATS
              </span>
              <Badge
                variant="accent"
                size="sm"
                style={{
                  backgroundColor: 'rgba(227, 255, 122, 0.15)',
                  color: 'var(--color-lime)',
                  marginLeft: '8px',
                }}
              >
                V1.0 Production
              </Badge>
            </div>

            {/* Quick Navigation */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px' }}>
              <a href="#features" style={{ color: 'var(--color-text-inverse-secondary)' }}>
                Capabilities
              </a>
              <a href="#workflows" style={{ color: 'var(--color-text-inverse-secondary)' }}>
                Workflows
              </a>
              <a href="#ai" style={{ color: 'var(--color-text-inverse-secondary)' }}>
                AI Model
              </a>
              <a href="#security" style={{ color: 'var(--color-text-inverse-secondary)' }}>
                Security
              </a>
              <Link to="/login" style={{ color: 'var(--color-lime)', fontWeight: 600 }}>
                Sign In
              </Link>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '24px',
              borderTop: '1px solid var(--color-charcoal-subtle)',
              fontSize: '12px',
              color: 'var(--color-text-inverse-muted)',
            }}
          >
            <div>
              &copy; {new Date().getFullYear()} HireStack ATS Platform. All rights reserved.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                }}
                aria-hidden="true"
              />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Media query styling for header responsiveness */}
      <style>{`
        @media (min-width: 768px) {
          .landing-nav-desktop {
            display: flex !important;
          }
          .landing-menu-toggle {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
