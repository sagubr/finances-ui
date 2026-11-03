'use client'

import { cn } from '#/lib/utils.ts'
import { ExternalLink, Github } from 'lucide-react'
import { motion } from 'motion/react'

interface ProjectCardBaseUIProps {
  title?: string
  description?: string
  tags?: string[]
  image?: string
  links?: {
    demo?: string
    github?: string
  }
  className?: string
}

const defaultProject = {
  title: 'E-Commerce Platform',
  description: 'Full-stack online store with payment integration and inventory management',
  tags: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
  image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80',
  links: { demo: '#', github: '#' },
}

export function ProjectCardBaseUI({
  title = defaultProject.title,
  description = defaultProject.description,
  tags = defaultProject.tags,
  image = defaultProject.image,
  links = defaultProject.links,
  className,
}: ProjectCardBaseUIProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('w-full max-w-[400px]', className)}
    >
      {/* Card replacement */}
      <div className="group border-border/50 bg-card/50 hover:border-primary/50 hover:shadow-primary/10 relative h-full overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <div className="relative aspect-video overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="from-background/90 via-background/20 absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
            {links.demo && (
              <motion.a
                href={links.demo}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary text-primary-foreground shadow-primary/25 flex h-10 w-10 items-center justify-center rounded-full shadow-lg backdrop-blur-md"
                title="View Demo"
              >
                <ExternalLink className="h-5 w-5" />
              </motion.a>
            )}
            {links.github && (
              <motion.a
                href={links.github}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-secondary text-secondary-foreground flex h-10 w-10 items-center justify-center rounded-full shadow-lg backdrop-blur-md"
                title="View Code"
              >
                <Github className="h-5 w-5" />
              </motion.a>
            )}
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-foreground group-hover:text-primary mb-2 text-xl font-semibold tracking-tight transition-colors">
            {title}
          </h3>
          <p className="text-foreground/70 mb-4 line-clamp-2 text-sm">{description}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              /* Badge replacement */
              <span
                key={index}
                className="bg-secondary/50 text-secondary-foreground hover:bg-secondary inline-flex items-center rounded-md px-2 py-0.5 text-xs font-normal"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
