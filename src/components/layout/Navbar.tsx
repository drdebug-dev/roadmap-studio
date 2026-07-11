import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export type NavItem = {
  id: string
  label: string
  href?: string
}

const defaultNavItems: NavItem[] = [
  { id: 'draft', label: 'Draft' },
]

type NavbarProps = {
  roadmapTitle?: string | null
  isDirty?: boolean
  navItems?: NavItem[]
}

export function Navbar({
  roadmapTitle,
  isDirty = false,
  navItems = defaultNavItems,
}: NavbarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Roadmap Studio
        </span>
        {roadmapTitle ? (
          <>
            <Separator orientation="vertical" className="h-4" />
            <span className="max-w-[240px] truncate text-sm text-muted-foreground">
              {roadmapTitle}
            </span>
          </>
        ) : null}
      </div>

      <nav className="ml-auto flex items-center gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {item.label}
            {item.id === 'draft' && isDirty ? (
              <Badge variant="secondary" className="ml-2 text-[10px]">
                Unsaved changes
              </Badge>
            ) : null}
          </button>
        ))}
      </nav>
    </header>
  )
}
