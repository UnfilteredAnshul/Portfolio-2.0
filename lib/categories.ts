export const categories = [
  'Full Stack Dev',
  'AI & Automation',
  'Content Creation',
  'Thumbnail Creation',
  'Video Editing',
  'Algo Trading',
] as const

export type Category = (typeof categories)[number]
