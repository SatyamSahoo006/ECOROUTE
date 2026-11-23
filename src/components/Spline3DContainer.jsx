import { Component, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from './icons.jsx'

// The Spline runtime is an OPTIONAL dependency, loaded from a separate
// deferred chunk (./splineLoader) so Vite only tries to resolve it at runtime.
// If the package isn't installed the request fails and SplineBoundary shows a
// placeholder; if installed, the interactive 3D scene renders.
const Spline = lazy(() => import('./splineLoader'))

class SplineBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: false }
  }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children
  }
}

const Placeholder = () => (
  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-emerald-900/40 via-slate-900 to-rose-900/30">
    <div className="text-center">
      <Sparkles size={28} className="mx-auto mb-2 text-emerald-300" />
      <p className="text-sm font-semibold text-slate-200">Immersive 3D Scene</p>
      <p className="mt-1 text-[11px] text-slate-400">
        Install <code>@splinetool/react-spline</code> to enable the live Spline layer.
      </p>
    </div>
  </div>
)

export default function Spline3DContainer({ sceneUrl }) {
  const defaultScene = 'https://prod.spline.design/6Wq1Q7YGyM-m8a8E/scene.splinecode'
  const url = sceneUrl || defaultScene
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-slate-950 shadow-2xl"
    >
      <SplineBoundary fallback={<Placeholder />}>
        <Suspense fallback={<Placeholder />}>
          <Spline scene={url} />
        </Suspense>
      </SplineBoundary>
    </motion.div>
  )
}
