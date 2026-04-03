import { startTransition, useEffect, useState } from 'react'

import { fallbackPortfolio } from '../data/fallbackPortfolio'
import { fetchGitHubPortfolio } from '../lib/github'
import type { PortfolioSnapshot, PortfolioState } from '../types'

const CACHE_KEY = 'qweeetlex-portfolio-cache-v3'
const CACHE_TTL = 1000 * 60 * 20

type CachePayload = {
  snapshot: PortfolioSnapshot
  timestamp: number
}

function readCache(): PortfolioSnapshot | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) {
      return null
    }

    const payload = JSON.parse(raw) as CachePayload
    if (Date.now() - payload.timestamp > CACHE_TTL) {
      return null
    }

    return payload.snapshot
  } catch {
    return null
  }
}

function writeCache(snapshot: PortfolioSnapshot): void {
  const payload: CachePayload = {
    snapshot,
    timestamp: Date.now(),
  }

  window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
}

const initialState: PortfolioState = {
  ...fallbackPortfolio,
  source: 'fallback',
  status: 'loading',
}

export function useGithubPortfolio(): PortfolioState {
  const [state, setState] = useState<PortfolioState>(initialState)

  useEffect(() => {
    const controller = new AbortController()
    const cachedSnapshot = readCache()

    if (cachedSnapshot) {
      startTransition(() => {
        setState({
          ...cachedSnapshot,
          source: 'cache',
          status: 'ready',
        })
      })
    }

    async function syncPortfolio() {
      try {
        const snapshot = await fetchGitHubPortfolio(controller.signal)
        writeCache(snapshot)

        startTransition(() => {
          setState({
            ...snapshot,
            source: 'live',
            status: 'ready',
          })
        })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown GitHub sync error'

        startTransition(() => {
          setState((currentState) => {
            if (currentState.repos.length > 0) {
              return {
                ...currentState,
                errorMessage,
                status: 'ready',
              }
            }

            return {
              ...fallbackPortfolio,
              errorMessage,
              source: 'fallback',
              status: 'error',
            }
          })
        })
      }
    }

    void syncPortfolio()

    return () => {
      controller.abort()
    }
  }, [])

  return state
}
