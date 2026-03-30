export type PortfolioProfile = {
  avatarUrl: string
  createdAt: string
  followers: number
  following: number
  htmlUrl: string
  login: string
  publicRepos: number
  updatedAt: string
}

export type PortfolioRepo = {
  accent: string
  bullets: string[]
  category: string
  contents: string[]
  featured: boolean
  forks: number
  fullName: string
  headline: string
  highlights: string[]
  homepage: string | null
  htmlUrl: string
  language: string | null
  languages: string[]
  name: string
  previewUrl: string
  pushedAt: string
  readmeUrl: string | null
  sections: string[]
  stars: number
  summary: string
  topics: string[]
  updatedAt: string
}

export type PortfolioSnapshot = {
  profile: PortfolioProfile
  repos: PortfolioRepo[]
  syncedAt: string
}

export type PortfolioState = PortfolioSnapshot & {
  errorMessage?: string
  source: 'cache' | 'fallback' | 'live'
  status: 'error' | 'loading' | 'ready'
}
