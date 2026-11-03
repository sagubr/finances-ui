'use client'

import { cn } from '#/lib/utils.ts'
import { Collapsible } from '@base-ui/react/collapsible'
import { FileIcon, FolderIcon, FolderOpenIcon } from 'lucide-react'
import * as React from 'react'

type GitStatus = 'untracked' | 'modified' | 'deleted'

const FilesContext = React.createContext<{ defaultOpen?: string[] }>({})

interface FilesProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: string[]
}

function Files({ className, children, defaultOpen, ...props }: FilesProps) {
  return (
    <FilesContext.Provider value={{ defaultOpen }}>
      <div className={cn('w-full p-2', className)} {...props}>
        <div className="bg-accent/0 rounded-lg">{children}</div>
      </div>
    </FilesContext.Provider>
  )
}

function SubFiles({ className, children, defaultOpen, ...props }: FilesProps) {
  return (
    <FilesContext.Provider value={{ defaultOpen }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </FilesContext.Provider>
  )
}

interface FolderItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function FolderItem({ value, children, className, ...props }: FolderItemProps) {
  const ctx = React.useContext(FilesContext)
  const isOpen = ctx.defaultOpen?.includes(value)

  return (
    <Collapsible.Root defaultOpen={isOpen} className={cn('group/folder', className)} {...props}>
      {children}
    </Collapsible.Root>
  )
}

interface FolderTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  gitStatus?: GitStatus
}

function FolderTrigger({ children, className, gitStatus, ...props }: FolderTriggerProps) {
  return (
    <Collapsible.Trigger
      className={cn(
        'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex w-full cursor-pointer items-center justify-between gap-2 rounded-md p-2 text-start transition-colors outline-none focus-visible:ring-2',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-center gap-2',
          gitStatus === 'untracked' && 'text-green-500',
          gitStatus === 'modified' && 'text-amber-500',
          gitStatus === 'deleted' && 'text-red-500',
        )}
      >
        <FolderIcon className="text-foreground/70 group-hover:text-accent-foreground block size-4.5 transition-colors group-data-[state=open]/folder:hidden" />
        <FolderOpenIcon className="text-foreground/70 group-hover:text-accent-foreground hidden size-4.5 transition-colors group-data-[state=open]/folder:block" />
        <span className="text-sm font-medium">{children}</span>
      </div>

      {gitStatus && (
        <span
          className={cn(
            'size-2 shrink-0 rounded-full',
            gitStatus === 'untracked' && 'bg-green-500',
            gitStatus === 'modified' && 'bg-amber-500',
            gitStatus === 'deleted' && 'bg-red-500',
          )}
        />
      )}
    </Collapsible.Trigger>
  )
}

interface FolderPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

function FolderPanel({ className, children, ...props }: FolderPanelProps) {
  return (
    <Collapsible.Panel
      className={cn(
        'before:bg-border relative ml-6 before:absolute before:inset-y-0 before:-left-2 before:h-full before:w-px',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2',
        className,
      )}
      {...props}
    >
      {children}
    </Collapsible.Panel>
  )
}

interface FileItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType
  gitStatus?: GitStatus
}

function FileItem({
  icon: Icon = FileIcon,
  className,
  children,
  gitStatus,
  ...props
}: FileItemProps) {
  return (
    <div
      className={cn(
        'hover:bg-accent hover:text-accent-foreground flex cursor-default items-center justify-between gap-2 rounded-md p-2 transition-colors',
        gitStatus === 'untracked' && 'text-green-500',
        gitStatus === 'modified' && 'text-amber-500',
        gitStatus === 'deleted' && 'text-red-500',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Icon className="text-foreground/70 size-4.5 transition-colors" />
        <span className="text-sm">{children}</span>
      </div>

      {gitStatus && (
        <span className="text-sm font-medium">
          {gitStatus === 'untracked' && 'U'}
          {gitStatus === 'modified' && 'M'}
          {gitStatus === 'deleted' && 'D'}
        </span>
      )}
    </div>
  )
}

export {
  FileItem,
  Files,
  FolderItem,
  FolderPanel,
  FolderTrigger,
  SubFiles,
  type FileItemProps,
  type FilesProps,
  type FolderItemProps,
  type FolderPanelProps,
  type FolderTriggerProps,
}
