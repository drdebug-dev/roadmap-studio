import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export type NavItem = {
  id: string
  label: string
  href?: string
}

const defaultNavItems: NavItem[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'save', label: 'Save' },
]

type NavbarProps = {
  roadmapTitle?: string | null
  isDirty?: boolean
  isSaving?: boolean
  saveError?: string | null
  navItems?: NavItem[]
  onSaveClick?: () => void
}

export function Navbar({
  roadmapTitle,
  isDirty = false,
  isSaving = false,
  saveError = null,
  navItems = defaultNavItems,
  onSaveClick,
}: NavbarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-w-0 flex-1 items-center gap-2">
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
        {saveError ? (
          <span className="truncate text-sm text-destructive">{saveError}</span>
        ) : null}
      </div>

      <nav className="ml-auto flex shrink-0 items-center gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            disabled={item.id === 'save' && (isSaving || !isDirty || !onSaveClick)}
            onClick={item.id === 'save' ? onSaveClick : undefined}
          >
            {item.id === 'save' && isSaving ? 'Saving…' : item.label}
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
