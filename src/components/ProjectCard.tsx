import type { CSSProperties, PointerEvent } from 'react'
import { useRef } from 'react'

import { formatDate } from '../lib/format'
import type { PortfolioRepo } from '../types'

type ProjectCardProps = {
  onInspect: (repo: PortfolioRepo) => void
  repo: PortfolioRepo
}

export function ProjectCard({ onInspect, repo }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement | null>(null)

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const node = cardRef.current
    if (!node) {
      return
    }

    const bounds = node.getBoundingClientRect()
    const xRatio = (event.clientX - bounds.left) / bounds.width
    const yRatio = (event.clientY - bounds.top) / bounds.height
    const rotateX = (0.5 - yRatio) * 10
    const rotateY = (xRatio - 0.5) * 12

    node.style.setProperty('--rotate-x', `${rotateX.toFixed(2)}deg`)
    node.style.setProperty('--rotate-y', `${rotateY.toFixed(2)}deg`)
    node.style.setProperty('--pointer-x', `${(xRatio * 100).toFixed(2)}%`)
    node.style.setProperty('--pointer-y', `${(yRatio * 100).toFixed(2)}%`)
  }

  function resetPerspective() {
    const node = cardRef.current
    if (!node) {
      return
    }

    node.style.setProperty('--rotate-x', '0deg')
    node.style.setProperty('--rotate-y', '0deg')
    node.style.setProperty('--pointer-x', '50%')
    node.style.setProperty('--pointer-y', '50%')
  }

  const backdropStyle = {
    '--project-accent': repo.accent,
    backgroundImage: `linear-gradient(180deg, rgba(4, 4, 4, 0.12) 0%, rgba(4, 4, 4, 0.84) 82%), url(${repo.previewUrl})`,
  } as CSSProperties

  return (
    <article
      ref={cardRef}
      className="project-card"
      data-featured={repo.featured}
      onPointerLeave={resetPerspective}
      onPointerMove={handlePointerMove}
      style={{ '--project-accent': repo.accent } as CSSProperties}
    >
      <div className="project-card__visual" style={backdropStyle} />
      <div className="project-card__inner">
        <div className="project-card__meta">
          <span>{repo.category}</span>
          <span>{formatDate(repo.updatedAt)}</span>
        </div>

        <div className="project-card__headline">
          <p className="project-card__name">{repo.name}</p>
          <h3>{repo.headline}</h3>
        </div>

        <p className="project-card__summary">{repo.summary}</p>

        <ul className="project-card__highlights">
          {repo.highlights.slice(0, 3).map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <div className="project-card__files">
          {repo.contents.slice(0, 4).map((item) => (
            <span key={`${repo.name}-${item}`}>{item}</span>
          ))}
        </div>

        <div className="project-card__footer">
          <div className="project-card__stack">
            {repo.languages.slice(0, 4).map((language) => (
              <span key={`${repo.name}-${language}`}>{language}</span>
            ))}
          </div>

          <div className="project-card__actions">
            <button type="button" onClick={() => onInspect(repo)}>
              Dossier
            </button>
            <a href={repo.htmlUrl} rel="noreferrer" target="_blank">
              Source
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
