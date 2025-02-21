import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from "../../lib/utils"

interface RootLayoutProps {
  children: ReactNode
  className?: string
}

export function RootLayout({ children, className }: RootLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        className
      )}
    >
      <div className="relative flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </motion.div>
  )
}

export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b">
      {children}
    </div>
  )
}

export function PageHeaderHeading({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-2xl font-bold tracking-tight">
      {children}
    </h1>
  )
}

export function PageHeaderDescription({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground">
      {children}
    </p>
  )
}
