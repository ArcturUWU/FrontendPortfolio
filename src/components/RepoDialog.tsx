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

          <div className="repo-dialog__copy type-block type-block--dialog">
            <p className="repo-dialog__eyebrow type-kicker">{repo.category}</p>
            <h2 className="type-title">{repo.name}</h2>
            <p className="repo-dialog__headline type-body type-body--primary">{repo.headline}</p>
            <p className="repo-dialog__summary type-body">{repo.summary}</p>

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
          <section className="repo-dialog__block type-block type-block--dialog">
            <p className="repo-dialog__label type-label">Stack</p>
            <div className="repo-dialog__chips">
              {repo.languages.map((language) => (
                <span key={`${repo.name}-language-${language}`}>{language}</span>
              ))}
            </div>
          </section>

          <section className="repo-dialog__block type-block type-block--dialog">
            <p className="repo-dialog__label type-label">Build Notes</p>
            <ul className="repo-dialog__list">
              {repo.highlights.map((item) => (
                <li key={`${repo.name}-highlight-${item}`}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="repo-dialog__block type-block type-block--dialog">
            <p className="repo-dialog__label type-label">Repo Surface</p>
            <div className="repo-dialog__chips">
              {repo.contents.map((item) => (
                <span key={`${repo.name}-content-${item}`}>{item}</span>
              ))}
            </div>
          </section>

          {repo.bullets.length > 0 ? (
            <section className="repo-dialog__block type-block type-block--dialog">
              <p className="repo-dialog__label type-label">README Extract</p>
              <ul className="repo-dialog__list">
                {repo.bullets.map((item) => (
                  <li key={`${repo.name}-bullet-${item}`}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="repo-dialog__meta-row">
            {repo.sections.length > 0 ? (
              <section className="repo-dialog__block type-block type-block--dialog">
                <p className="repo-dialog__label type-label">Sections</p>
                <div className="repo-dialog__chips">
                  {repo.sections.map((item) => (
                    <span key={`${repo.name}-section-${item}`}>{item}</span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="repo-dialog__block repo-dialog__block--updated type-block type-block--dialog type-block--metric">
              <p className="repo-dialog__label type-label type-label--muted">Updated</p>
              <strong className="type-metric">{formatDate(repo.updatedAt)}</strong>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
