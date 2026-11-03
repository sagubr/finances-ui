'use client'

import { Github, Linkedin, Twitter } from 'lucide-react'
import { motion } from 'motion/react'
import * as React from 'react'

export interface FlipCardData {
  name: string
  username: string
  image: string
  bio: string
  stats: {
    following: number
    followers: number
    posts: number
  }
  socialLinks: {
    linkedin: string
    github: string
    twitter: string
  }
}

export function FlipCard({ data }: { data: FlipCardData }) {
  const [isFlipped, setIsFlipped] = React.useState(false)

  return (
    <div
      className="group h-48 w-80 cursor-pointer select-none [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative h-full w-full rounded-2xl border border-neutral-300/30 bg-neutral-100 shadow-lg [transform-style:preserve-3d] dark:border-neutral-800/30 dark:bg-neutral-900"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-2xl bg-neutral-100 p-5 [backface-visibility:hidden] dark:bg-neutral-900"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex gap-4">
            <img
              src={data.image}
              alt={data.name}
              className="size-12 rounded-full border border-neutral-300 object-cover dark:border-neutral-700"
            />
            <div>
              <h3 className="text-foreground text-sm leading-tight font-semibold">{data.name}</h3>
              <p className="text-foreground/70 mt-0.5 text-xs">@{data.username}</p>
            </div>
          </div>
          <p className="mt-2 line-clamp-3 flex-1 text-xs text-neutral-600 dark:text-neutral-300">
            {data.bio}
          </p>
          <div className="text-foreground/70/60 mt-1 text-right text-[10px] font-medium">
            Click to flip card
          </div>
        </div>

        {/* Back Face */}
        <div
          className="bg-neutral-150 dark:bg-neutral-850 absolute inset-0 flex h-full w-full [transform:rotateY(180deg)] flex-col justify-between rounded-2xl p-5 [backface-visibility:hidden]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div>
            <h3 className="text-foreground text-center text-sm font-semibold">Estatísticas</h3>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-foreground text-sm font-bold">{data.stats.posts}</p>
                <p className="text-foreground/70 text-[10px]">Posts</p>
              </div>
              <div>
                <p className="text-foreground text-sm font-bold">
                  {data.stats.followers >= 1000
                    ? `${(data.stats.followers / 1000).toFixed(1)}k`
                    : data.stats.followers}
                </p>
                <p className="text-foreground/70 text-[10px]">Seguidores</p>
              </div>
              <div>
                <p className="text-foreground text-sm font-bold">{data.stats.following}</p>
                <p className="text-foreground/70 text-[10px]">Seguindo</p>
              </div>
            </div>
          </div>

          <div className="mt-2 flex justify-center gap-5">
            <a
              href={data.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
            >
              <Github size={18} />
            </a>
            <a
              href={data.socialLinks.twitter}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
            >
              <Twitter size={18} />
            </a>
            <a
              href={data.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
