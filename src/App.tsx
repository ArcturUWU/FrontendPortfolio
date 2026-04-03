import { useDeferredValue, useMemo, useState } from 'react'

import './App.css'
import { PlasmaCanvas } from './components/PlasmaCanvas'
import { ProjectCard } from './components/ProjectCard'
import { RepoDialog } from './components/RepoDialog'
import { useGithubPortfolio } from './hooks/useGithubPortfolio'
import { formatDate, formatDateMetric } from './lib/format'
import type { PortfolioRepo } from './types'

function App() {
  const portfolio = useGithubPortfolio()
  const [activeRepo, setActiveRepo] = useState<PortfolioRepo | null>(null)
  const deferredRepo = useDeferredValue(activeRepo)

  const languageCloud = useMemo(() => {
    const languageSet = new Set<string>()
    portfolio.repos.forEach((repo) => {
      repo.languages.forEach((language) => {
        languageSet.add(language)
      })
    })

    return Array.from(languageSet)
  }, [portfolio.repos])

  const displayLanguages = useMemo(() => {
    const excludedFromUi = new Set(['python', 'ruby', 'shell'])
    const filtered = languageCloud.filter(
      (language) => !excludedFromUi.has(language.toLowerCase()),
    )

    if (filtered.length === 0) {
      return ['React', 'TypeScript', 'JavaScript', 'CSS', 'GitHub', 'Vite']
    }

    return Array.from(new Set(['React', 'TypeScript', ...filtered]))
  }, [languageCloud])

  const livePieces = useMemo(() => {
    return [...displayLanguages, ...displayLanguages]
  }, [displayLanguages])

  const githubSinceYear = new Date(portfolio.profile.createdAt).getUTCFullYear()
  const freshestRepo = portfolio.repos[0]
  const syncMetric = formatDateMetric(portfolio.syncedAt)
  const sourceLabel = {
    cache: 'cached snapshot',
    fallback: 'fallback snapshot',
    live: 'live from github',
  }[portfolio.source]

  const sourceTone =
    portfolio.source === 'live'
      ? 'ready'
      : portfolio.source === 'cache'
        ? 'muted'
        : 'warning'

  return (
    <div className="page-shell">
      <PlasmaCanvas />

      <header className="topbar">
        <div className="topbar__brand">
          <span className="type-brandline type-brandline--primary">CTRL COUTURE</span>
          <span className="type-brandline type-brandline--secondary">
            QweeeTleX / frontend engineer
          </span>
        </div>

        <nav className="topbar__nav" aria-label="Навигация по странице">
          <a href="#projects">Projects</a>
          <a href="#system">System</a>
          <a href={portfolio.profile.htmlUrl} rel="noreferrer" target="_blank">
            GitHub
          </a>
        </nav>
      </header>

      <main className="content-shell">
        <section className="hero">
          <div className="hero__copy type-block type-block--hero">
            <div className="hero__lead">
              <div className="hero__status">
                <span className="type-status">frontend engineer / source linked</span>
                <span className="type-status" data-tone={sourceTone}>
                  {sourceLabel}
                </span>
              </div>

              <div className="hero__text">
                <p className="hero__eyebrow type-kicker">
                  React 19, TypeScript, API integration, UI engineering.
                </p>
                <p className="hero__lede type-body">
                  Я frontend-разработчик. Работаю с React 19, TypeScript, Vite, API-интеграциями,
                  адаптивной версткой, дизайн-системным подходом и интерактивной графикой на canvas.
                </p>
              </div>
            </div>

            <div className="hero__actions">
              <a className="hero__cta hero__cta--solid" href="#projects">
                Смотреть проекты
              </a>
              <a
                className="hero__cta hero__cta--ghost"
                href={portfolio.profile.htmlUrl}
                rel="noreferrer"
                target="_blank"
              >
                Открыть GitHub
              </a>
            </div>

            <div className="hero__ticker" aria-hidden="true">
              <div className="hero__ticker-track">
                {livePieces.map((piece, index) => (
                  <span key={`${piece}-${index}`}>{piece}</span>
                ))}
              </div>
            </div>
          </div>

          <aside className="hero__panel">
            <div className="profile-card type-block type-block--profile">
              <div className="profile-card__avatar-wrap">
                <img
                  alt={`${portfolio.profile.login} avatar`}
                  className="profile-card__avatar"
                  src={portfolio.profile.avatarUrl}
                />
              </div>

              <div className="profile-card__headline">
                <p className="profile-card__eyebrow type-kicker">GitHub profile</p>
                <h2 className="type-title">{portfolio.profile.login}</h2>
              </div>

              <p className="profile-card__bio type-body">
                На GitHub с {githubSinceYear} года. Здесь мои реальные
                проекты: по ним видно, как я проектирую UI, работаю с данными и довожу фичи до
                рабочего состояния.
              </p>
            </div>

            <div className="metrics-grid">
              <article className="metric-card metric-card--date type-block type-block--metric">
                <span className="type-label type-label--muted">Repos</span>
                <strong className="type-metric">
                  {portfolio.profile.publicRepos.toString().padStart(2, '0')}
                </strong>
              </article>
              <article className="metric-card metric-card--date type-block type-block--metric">
                <span className="type-label type-label--muted">Sync</span>
                <strong
                  aria-label={formatDate(portfolio.syncedAt)}
                  className="type-metric type-metric--date"
                >
                  <span>{syncMetric.dayMonth}</span>
                  <span>{syncMetric.year}</span>
                </strong>
              </article>
            </div>
          </aside>
        </section>

        <section className="manifest">
          <article className="manifest-card type-block type-block--manifest">
            <p className="type-label">01 / data & integration</p>
            <h3 className="type-title">Работаю с API, кэшем и обработкой ошибок.</h3>
            <p className="type-body">
              В Weather использую Open-Meteo API, в этом сайте — загрузку данных из GitHub и
              fallback-кэш. Данные проходят нормализацию перед выводом в интерфейс.
            </p>
          </article>

          <article className="manifest-card type-block type-block--manifest">
            <p className="type-label">02 / ui & product flows</p>
            <h3 className="type-title">Собираю интерфейсы под разные пользовательские сценарии.</h3>
            <p className="type-body">
              Chatbot: потоковые ответы и управление чатами; Tea_project: каталог, авторизация и
              роли; Vahta: рабочий график и подработки.
            </p>
          </article>

          <article className="manifest-card type-block type-block--manifest">
            <p className="type-label">03 / source & delivery</p>
            <h3 className="type-title">Каждый кейс подтвержден исходниками и историей коммитов.</h3>
            <p className="type-body">
              В карточках доступны репозиторий, README, стек, структура файлов и даты обновлений.
            </p>
          </article>
        </section>

        <section className="section-heading type-block type-block--section" id="projects">
          <div className="section-heading__copy">
            <p className="section-heading__eyebrow type-kicker">Projects / runway selection</p>
            <h2 className="type-title">
              Проекты, в которых видны мои прикладные навыки: ниже 4 кейса с разной предметной
              логикой, и в каждом показаны задача, ключевые решения, стек и ссылка на исходники.
            </h2>
          </div>
        </section>

        <section className="projects-grid">
          {portfolio.repos.map((repo) => (
            <ProjectCard key={repo.fullName} onInspect={setActiveRepo} repo={repo} />
          ))}
        </section>

        <section className="system-section" id="system">
          <div className="system-section__copy type-block type-block--section">
            <p className="section-heading__eyebrow type-kicker">Engineering / build logic</p>
            <h2 className="type-title">Как я проектирую frontend-решения.</h2>
            <p className="type-body type-body--measure-wide system-section__answer">
              Начинаю с задачи и пользовательского сценария: фиксирую входные данные, состояния
              интерфейса и условия ошибок. Затем собираю экран модульно, добавляю fallback-поведение
              и проверяю, что решение стабильно работает с реальными API и в адаптивной верстке.
            </p>
          </div>

          <div className="system-section__panel">
            <div className="system-section__list">
              <article>
                <span className="type-label">data</span>
                <p className="type-body">
                  GitHub REST API, нормализация данных, парсинг README, localStorage cache,
                  fallback-стратегии.
                </p>
              </article>
              <article>
                <span className="type-label">motion</span>
                <p className="type-body">
                  Canvas, CSS transitions, композиция экранов и микро-взаимодействия без лишних
                  библиотек.
                </p>
              </article>
              <article>
                <span className="type-label">stack</span>
                <p className="type-body">
                  React 19, TypeScript, Vite, модульная структура компонентов и читаемый CSS для
                  быстрой поддержки.
                </p>
              </article>
            </div>

            <div className="stack-cloud">
              {displayLanguages.map((language) => (
                <span key={language}>{language}</span>
              ))}
            </div>
          </div>
        </section>

        {portfolio.errorMessage ? (
          <p className="status-note type-body">
            GitHub sync warning: {portfolio.errorMessage}. Интерфейс продолжает работу на cached or
            fallback snapshot.
          </p>
        ) : null}
      </main>

      <footer className="footer">
        <p>
          QweeeTleX, frontend developer. Последний обновленный репозиторий:{' '}
          <strong>{freshestRepo?.name ?? 'syncing'}</strong>.
        </p>
        <a href={portfolio.profile.htmlUrl} rel="noreferrer" target="_blank">
          github.com/{portfolio.profile.login}
        </a>
      </footer>

      {deferredRepo ? <RepoDialog onClose={() => setActiveRepo(null)} repo={deferredRepo} /> : null}
    </div>
  )
}

export default App
