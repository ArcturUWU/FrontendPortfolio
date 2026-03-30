import type { PortfolioRepo, PortfolioSnapshot } from '../types'

const API_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

const LOGIN = 'QweeeTleX'

type GitHubProfile = {
  avatar_url: string
  created_at: string
  followers: number
  following: number
  html_url: string
  login: string
  public_repos: number
  updated_at: string
}

type GitHubRepo = {
  description: string | null
  fork: boolean
  forks_count: number
  full_name: string
  homepage: string | null
  html_url: string
  language: string | null
  languages_url: string
  name: string
  pushed_at: string
  stargazers_count: number
  topics: string[]
  updated_at: string
}

type GitHubReadme = {
  content: string
  download_url: string | null
}

type GitHubContentEntry = {
  name: string
}

type Narrative = {
  accent: string
  category: string
  featured: boolean
  headline: string
  highlights: string[]
  previewUrl?: string
  summary?: string
}

const repoNarratives: Record<string, Narrative> = {
  Tea_project: {
    accent: '#ff7043',
    category: 'full-stack commerce',
    featured: true,
    headline:
      'Чайный каталог с авторизацией, ролями и разделением frontend/backend.',
    highlights: [
      'React 19 + React Router во frontend-слое',
      'Express 5, cookie auth, JWT и роли',
      'Каталог на JSONL-данных и статических медиа',
    ],
    summary:
      'Многослойный магазин чая: отдельный frontend на React и backend на Express с куки-авторизацией, JWT и разграничением ролей.',
  },
  Chatbot: {
    accent: '#8ea3ff',
    category: 'streaming ai ui',
    featured: true,
    headline: 'Стриминговый чат-интерфейс с локальным OpenAI-compatible backend.',
    highlights: [
      'Потоковый ответ ассистента через ReadableStream',
      'Выбор моделей и авто-генерация названий',
      'React UI + Python ChatMock',
    ],
  },
  Vahta: {
    accent: '#f9c47b',
    category: 'utility dashboard',
    featured: false,
    headline: 'Рабочий график для 4 бригад с управлением подработками.',
    highlights: [
      'Vanilla stack без лишнего слоя абстракций',
      'Отдельные графики по бригадам',
      'Подработки в общей таблице смен',
    ],
    previewUrl:
      'https://raw.githubusercontent.com/QweeeTleX/Vahta/main/assets/preview_vahta.jpg',
  },
  Weather: {
    accent: '#9de2ff',
    category: 'weather experience',
    featured: false,
    headline: 'Погодное приложение с геолокацией, canvas-снегом и 7-day forecast.',
    highlights: [
      'Open-Meteo Geocoding + Forecast API',
      'Canvas snow layer поверх интерфейса',
      'Подсказки городов и geolocation',
    ],
    previewUrl:
      'https://raw.githubusercontent.com/QweeeTleX/Weather/main/pogodaphoto.png',
  },
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    headers: API_HEADERS,
    signal,
  })

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

async function getOptionalJson<T>(
  url: string,
  signal?: AbortSignal,
): Promise<T | null> {
  const response = await fetch(url, {
    headers: API_HEADERS,
    signal,
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

function decodeBase64Utf8(value: string): string {
  const normalized = value.replace(/\n/g, '')
  const binary = atob(normalized)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function cleanMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]+]\(([^)]+)\)/g, '$1')
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toRawAssetUrl(fullName: string, assetPath: string): string {
  const normalized = assetPath.replace(/^\.?\//, '')
  return `https://raw.githubusercontent.com/${fullName}/main/${normalized}`
}

function extractReadmeMeta(readme: string, fullName: string) {
  const lines = readme
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const sections = lines
    .filter((line) => line.startsWith('##'))
    .map((line) => cleanMarkdown(line))
    .filter(Boolean)
    .slice(0, 5)

  const bullets = lines
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\./.test(line))
    .map((line) => cleanMarkdown(line))
    .filter(Boolean)
    .slice(0, 6)

  const paragraphs = lines
    .filter(
      (line) =>
        !line.startsWith('#') &&
        !/^[-*]\s+/.test(line) &&
        !/^\d+\./.test(line) &&
        !line.startsWith('```') &&
        !line.startsWith('!['),
    )
    .map((line) => cleanMarkdown(line))
    .filter((line) => line.length > 36)

  const imageMatch = /!\[[^\]]*]\(([^)]+)\)/.exec(readme)
  const previewUrl = imageMatch
    ? imageMatch[1].startsWith('http')
      ? imageMatch[1]
      : toRawAssetUrl(fullName, imageMatch[1])
    : null

  return {
    bullets,
    previewUrl,
    sections,
    summary: paragraphs[0] ?? '',
  }
}

function getDefaultNarrative(repo: GitHubRepo): Narrative {
  return {
    accent: '#f8efe8',
    category: 'front-end study',
    featured: false,
    headline: `${repo.name} как самостоятельная витрина навыков и визуальных решений.`,
    highlights: [
      'GitHub source linked',
      'Последние коммиты доступны',
      'Живой tech stack из repo metadata',
    ],
  }
}

function buildRepo(
  repo: GitHubRepo,
  readmeText: string | null,
  readmeUrl: string | null,
  languages: string[],
  contents: string[],
): PortfolioRepo {
  const narrative = repoNarratives[repo.name] ?? getDefaultNarrative(repo)
  const parsed = readmeText ? extractReadmeMeta(readmeText, repo.full_name) : null

  const summary =
    narrative.summary ??
    parsed?.summary ??
    repo.description ??
    'Репозиторий без описания, поэтому карточка опирается на структуру проекта и GitHub metadata.'

  const previewUrl =
    narrative.previewUrl ??
    parsed?.previewUrl ??
    `https://opengraph.githubassets.com/1/${repo.full_name}`

  return {
    accent: narrative.accent,
    bullets: parsed?.bullets ?? [],
    category: narrative.category,
    contents,
    featured: narrative.featured,
    forks: repo.forks_count,
    fullName: repo.full_name,
    headline: narrative.headline,
    highlights: narrative.highlights,
    homepage: repo.homepage,
    htmlUrl: repo.html_url,
    language: repo.language,
    languages,
    name: repo.name,
    previewUrl,
    pushedAt: repo.pushed_at,
    readmeUrl,
    sections: parsed?.sections ?? [],
    stars: repo.stargazers_count,
    summary,
    topics: repo.topics,
    updatedAt: repo.updated_at,
  }
}

export async function fetchGitHubPortfolio(
  signal?: AbortSignal,
): Promise<PortfolioSnapshot> {
  const [profile, repos] = await Promise.all([
    getJson<GitHubProfile>(`https://api.github.com/users/${LOGIN}`, signal),
    getJson<GitHubRepo[]>(
      `https://api.github.com/users/${LOGIN}/repos?per_page=100&sort=updated`,
      signal,
    ),
  ])

  const publicRepos = repos.filter((repo) => !repo.fork)

  const enrichedRepos = await Promise.all(
    publicRepos.map(async (repo) => {
      const [languageMap, rootContents, readme] = await Promise.all([
        getOptionalJson<Record<string, number>>(repo.languages_url, signal),
        getOptionalJson<GitHubContentEntry[]>(
          `https://api.github.com/repos/${repo.full_name}/contents`,
          signal,
        ),
        getOptionalJson<GitHubReadme>(
          `https://api.github.com/repos/${repo.full_name}/readme`,
          signal,
        ),
      ])

      const readmeText = readme?.content ? decodeBase64Utf8(readme.content) : null
      const contents = (rootContents ?? [])
        .map((entry) => entry.name)
        .filter((entry) => !entry.startsWith('.'))
        .slice(0, 8)

      const languages = Object.entries(languageMap ?? {})
        .sort((left, right) => right[1] - left[1])
        .map(([name]) => name)
        .slice(0, 5)

      return buildRepo(repo, readmeText, readme?.download_url ?? null, languages, contents)
    }),
  )

  enrichedRepos.sort((left, right) => {
    if (left.featured !== right.featured) {
      return Number(right.featured) - Number(left.featured)
    }

    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  })

  return {
    profile: {
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      followers: profile.followers,
      following: profile.following,
      htmlUrl: profile.html_url,
      login: profile.login,
      publicRepos: profile.public_repos,
      updatedAt: profile.updated_at,
    },
    repos: enrichedRepos,
    syncedAt: new Date().toISOString(),
  }
}
