'use client'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'
import { Button } from '#/components/ui/button.tsx'
import { cn } from '#/lib/utils.ts'
import { BookOpen, Clock } from 'lucide-react'
import { motion } from 'motion/react'

interface GlassBlogCardBaseUIProps {
  title?: string
  excerpt?: string
  image?: string
  author?: {
    name: string
    avatar: string
  }
  date?: string
  readTime?: string
  tags?: string[]
  className?: string
}

const defaultPost = {
  title: 'The Future of UI Design',
  excerpt: 'Exploring the latest trends in glassmorphism, 3D elements, and micro-interactions.',
  image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  author: {
    name: 'Moumen Soliman',
    avatar: 'https://iimydr2b8o.ufs.sh/f/Zqn6AViLMoTtoUjLg4dAryGEidskK72wBCQA6DNcZH4Xh5b8',
  },
  date: 'Dec 2, 2025',
  readTime: '5 min read',
  tags: ['Design', 'UI/UX'],
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

export function GlassBlogCardBaseUI({
  title = defaultPost.title,
  excerpt = defaultPost.excerpt,
  image = defaultPost.image,
  author = defaultPost.author,
  date = defaultPost.date,
  readTime = defaultPost.readTime,
  tags = defaultPost.tags,
  className,
}: GlassBlogCardBaseUIProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('w-full max-w-[400px]', className)}
    >
      <div className="group border-border/50 bg-card/30 hover:border-primary/50 hover:shadow-primary/10 relative h-full overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-xl">
        {/* Image Section */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="from-background/80 absolute inset-0 bg-gradient-to-t to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

          <div className="absolute bottom-3 left-3 flex gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="bg-secondary/80 text-secondary-foreground hover:bg-secondary inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Hover Overlay Action */}
          <div className="bg-background/20 absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
            <Button
              variant="default"
              size="lg"
              className="shadow-primary/20 shadow-lg backdrop-blur-sm"
            >
              <BookOpen className="h-4 w-4" />
              Read Article
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-4 p-5">
          <div className="space-y-2">
            <h3 className="text-foreground group-hover:text-primary text-xl leading-tight font-semibold tracking-tight transition-colors">
              {title}
            </h3>
            <p className="text-foreground/70 line-clamp-2 text-sm">{excerpt}</p>
          </div>

          <div className="border-border/50 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              {/* Custom Avatar component */}
              <Avatar className="border-border/50 relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="bg-muted text-foreground/70 flex h-full w-full items-center justify-center rounded-full text-xs font-medium">
                  {getInitials(author.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-xs">
                <span className="text-foreground font-medium">{author.name}</span>
                <span className="text-foreground/70">{date}</span>
              </div>
            </div>

            <div className="text-foreground/70 flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
