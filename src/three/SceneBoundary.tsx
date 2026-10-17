import { Component, type ReactNode } from 'react'

/** Renders `fallback` if a 3D scene throws (e.g. WebGL context failure). */
export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
