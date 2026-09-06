import { Link } from 'react-router'
import { PERSONAS } from '../data'
import { ThemeToggle } from './ThemeToggle'

export function PersonaSelect() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 font-[family:var(--font-beausite)]">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl w-full flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-foreground text-background px-3 py-1 rounded-full text-[var(--text-caption)] font-bold tracking-widest font-[family:var(--font-aeonik)] uppercase">
            THE MACHINE
          </div>
          <h1 className="text-[var(--text-h1)] font-[family:var(--font-beausite)] font-bold text-center tracking-tight m-0">
            Agent Match
          </h1>
          <h3 className="text-muted-foreground font-[family:var(--font-beausite)] text-[var(--text-h3)] m-0">
            Who are you today?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
          {PERSONAS.map((persona) => (
            <Link
              key={persona.id}
              to={`/match/${persona.id}`}
              className="group flex flex-col bg-card text-card-foreground border border-border p-6 rounded-[var(--radius-card)] hover:border-primary transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-input-background rounded-full text-[var(--text-h3)]">
                  {persona.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-[family:var(--font-beausite)] text-[var(--text-h4)] font-medium m-0">
                    {persona.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.roles.map((role) => (
                      <span
                        key={role}
                        className="bg-muted text-muted-foreground px-2 py-0.5 rounded-[var(--radius-badge)] text-[var(--text-caption)] font-[family:var(--font-aeonik)] bg-opacity-20"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground m-0 text-[var(--text-base)] font-[family:var(--font-beausite)]">
                {persona.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-4">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors text-[var(--text-cta)] font-[family:var(--font-aeonik)] font-medium flex items-center gap-1"
          >
            or build your own profile <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
