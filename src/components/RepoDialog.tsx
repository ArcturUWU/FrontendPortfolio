import { useEffect } from 'react'

import { formatDate } from '../lib/format'
import type { PortfolioRepo } from '../types'

type RepoDialogProps = {
  onClose: () => void
  repo: PortfolioRepo
}

export function RepoDialog({ onClose, repo }: RepoDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      aria-modal="true"
      className="repo-dialog"
      role="dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="repo-dialog__panel">
        <button
          aria-label="Закрыть окно проекта"
          className="repo-dialog__close"
          type="button"
          onClick={onClose}
        >
          CLOSE
        </button>

        <div className="repo-dialog__hero">
          <div
            className="repo-dialog__media"
            style={{ backgroundImage: `url(${repo.previewUrl})` }}
          />

          <div className="repo-dialog__copy">
            <p className="repo-dialog__eyebrow">{repo.category}</p>
            <h2>{repo.name}</h2>
            <p className="repo-dialog__headline">{repo.headline}</p>
            <p className="repo-dialog__summary">{repo.summary}</p>

            <div className="repo-dialog__links">
              <a href={repo.htmlUrl} rel="noreferrer" target="_blank">
                Open GitHub
              </a>
              {repo.readmeUrl ? (
                <a href={repo.readmeUrl} rel="noreferrer" target="_blank">
                  README
                </a>
              ) : null}
              {repo.homepage ? (
                <a href={repo.homepage} rel="noreferrer" target="_blank">
                  Live URL
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="repo-dialog__grid">
          <section className="repo-dialog__block">
            <p className="repo-dialog__label">Stack</p>
            <div className="repo-dialog__chips">
              {repo.languages.map((language) => (
                <span key={`${repo.name}-language-${language}`}>{language}</span>
              ))}
            </div>
          </section>

          <section className="repo-dialog__block">
            <p className="repo-dialog__label">Build Notes</p>
            <ul className="repo-dialog__list">
              {repo.highlights.map((item) => (
                <li key={`${repo.name}-highlight-${item}`}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="repo-dialog__block">
            <p className="repo-dialog__label">Repo Surface</p>
            <div className="repo-dialog__chips">
              {repo.contents.map((item) => (
                <span key={`${repo.name}-content-${item}`}>{item}</span>
              ))}
            </div>
          </section>

          {repo.bullets.length > 0 ? (
            <section className="repo-dialog__block">
              <p className="repo-dialog__label">README Extract</p>
              <ul className="repo-dialog__list">
                {repo.bullets.map((item) => (
                  <li key={`${repo.name}-bullet-${item}`}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {repo.sections.length > 0 ? (
            <section className="repo-dialog__block">
              <p className="repo-dialog__label">Sections</p>
              <div className="repo-dialog__chips">
                {repo.sections.map((item) => (
                  <span key={`${repo.name}-section-${item}`}>{item}</span>
                ))}
              </div>
            </section>
          ) : null}

          <section className="repo-dialog__block repo-dialog__block--metrics">
            <p className="repo-dialog__label">Repo Metrics</p>
            <div className="repo-dialog__metrics">
              <div>
                <span>Updated</span>
                <strong>{formatDate(repo.updatedAt)}</strong>
              </div>
              <div>
                <span>Stars</span>
                <strong>{repo.stars}</strong>
              </div>
              <div>
                <span>Forks</span>
                <strong>{repo.forks}</strong>
              </div>
              <div>
                <span>Primary</span>
                <strong>{repo.language ?? 'n/a'}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
