import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="system"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'font-[family-name:var(--sans)]',
        },
      }}
      {...props}
    />
  )
}
