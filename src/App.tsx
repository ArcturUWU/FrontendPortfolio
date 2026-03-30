import { useDeferredValue, useMemo, useState } from 'react'

import './App.css'
import { PlasmaCanvas } from './components/PlasmaCanvas'
import { ProjectCard } from './components/ProjectCard'
import { RepoDialog } from './components/RepoDialog'
import { useGithubPortfolio } from './hooks/useGithubPortfolio'
import { formatDate, formatMonthYear } from './lib/format'
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

  const livePieces = useMemo(() => {
    const pieces = [...languageCloud]
    if (pieces.length === 0) {
      return ['React', 'JavaScript', 'CSS', 'GitHub', 'Canvas', 'Vite']
    }

    return [...pieces, ...pieces]
  }, [languageCloud])

  const freshestRepo = portfolio.repos[0]
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
          <span>CTRL COUTURE</span>
          <span>QweeeTleX / frontend runway</span>
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
          <div className="hero__copy">
            <div className="hero__status">
              <span>digital runway / source linked</span>
              <span data-tone={sourceTone}>{sourceLabel}</span>
            </div>

            <p className="hero__eyebrow">Bold frontend portfolio with live GitHub ingestion.</p>
            <h1>
              Интерфейсы здесь подаются как кампания,
              <br />
              а вскрываются до исходников.
            </h1>
            <p className="hero__lede">
              Портфолио собрано вокруг реальных репозиториев QweeeTleX: данные тянутся с GitHub,
              проекты раскрываются в `dossier`-режиме, а визуал строится как digital fashion show
              с редакционной типографикой, атмосферным canvas-фоном и нарочито дерзкой подачей.
            </p>

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
            <div className="profile-card">
              <div className="profile-card__avatar-wrap">
                <img
                  alt={`${portfolio.profile.login} avatar`}
                  className="profile-card__avatar"
                  src={portfolio.profile.avatarUrl}
                />
              </div>

              <div className="profile-card__identity">
                <p className="profile-card__eyebrow">GitHub profile</p>
                <h2>{portfolio.profile.login}</h2>
                <p>
                  На GitHub с {formatMonthYear(portfolio.profile.createdAt)}. Портфолио не имитирует
                  активность, а забирает её из реальных репозиториев и README.
                </p>
              </div>
            </div>

            <div className="metrics-grid">
              <article className="metric-card">
                <span>Repos</span>
                <strong>{portfolio.profile.publicRepos.toString().padStart(2, '0')}</strong>
              </article>
              <article className="metric-card">
                <span>Stack nodes</span>
                <strong>{languageCloud.length.toString().padStart(2, '0')}</strong>
              </article>
              <article className="metric-card">
                <span>Latest drop</span>
                <strong>{freshestRepo ? formatDate(freshestRepo.updatedAt) : 'syncing'}</strong>
              </article>
              <article className="metric-card">
                <span>Sync</span>
                <strong>{formatDate(portfolio.syncedAt)}</strong>
              </article>
            </div>
          </aside>
        </section>

        <section className="manifest">
          <article className="manifest-card">
            <p>01 / live ingestion</p>
            <h3>Проекты не вбиты вручную.</h3>
            <p>
              Репозитории, стек, README-заметки и структура директорий подтягиваются из GitHub API,
              а при rate-limit включается локальный fallback-кэш.
            </p>
          </article>

          <article className="manifest-card">
            <p>02 / visual aggression</p>
            <h3>Сайт выглядит как digital editorial.</h3>
            <p>
              Выразительная Bodoni-типографика, плотные градиенты, стеклянные панели и живая
              canvas-плазма вместо стерильного “просто лендинга”.
            </p>
          </article>

          <article className="manifest-card">
            <p>03 / source-first</p>
            <h3>Каждый кейс можно вскрыть.</h3>
            <p>
              У каждой карточки есть выход в GitHub, а `Dossier` показывает стек, README-выжимку,
              структуру репозитория и проектные акценты.
            </p>
          </article>
        </section>

        <section className="section-heading" id="projects">
          <div>
            <p className="section-heading__eyebrow">Projects / runway selection</p>
            <h2>Отобранные работы, привязанные к живому GitHub-слою.</h2>
          </div>
          <p className="section-heading__text">
            Не “галерея картинок”, а набор интерфейсных выходов: от стримингового чата и tea
            commerce stack до weather experience и утилитарного графика смен.
          </p>
        </section>

        <section className="projects-grid">
          {portfolio.repos.map((repo) => (
            <ProjectCard key={repo.fullName} onInspect={setActiveRepo} repo={repo} />
          ))}
        </section>

        <section className="system-section" id="system">
          <div className="system-section__copy">
            <p className="section-heading__eyebrow">System / build logic</p>
            <h2>Почему этот формат сильнее обычного портфолио.</h2>
            <p>
              Здесь сам сайт демонстрирует frontend-мышление: есть клиентский data layer, локальный
              cache, graceful fallback, motion without library bloat и гибкая презентация для
              проектов разной природы.
            </p>
          </div>

          <div className="system-section__panel">
            <div className="system-section__list">
              <article>
                <span>data</span>
                <p>GitHub REST API, README parsing, localStorage cache, live/fallback status.</p>
              </article>
              <article>
                <span>motion</span>
                <p>Canvas plasma, CSS-driven editorial transitions, tilt cards and modal dossiers.</p>
              </article>
              <article>
                <span>stack</span>
                <p>
                  React 19 + TypeScript + Vite. Без лишних UI-библиотек, чтобы стиль был
                  собственным, а не шаблонным.
                </p>
              </article>
            </div>

            <div className="stack-cloud">
              {languageCloud.map((language) => (
                <span key={language}>{language}</span>
              ))}
            </div>
          </div>
        </section>

        {portfolio.errorMessage ? (
          <p className="status-note">
            GitHub sync warning: {portfolio.errorMessage}. Интерфейс продолжает работу на cached or
            fallback snapshot.
          </p>
        ) : null}
      </main>

      <footer className="footer">
        <p>
          QweeeTleX portfolio experience. Latest visible repo:{' '}
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
