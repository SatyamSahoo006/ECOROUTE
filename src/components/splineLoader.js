// Deferred loader for the optional Spline 3D runtime.
// Kept in its own module so Vite only resolves `@splinetool/react-spline`
// when this chunk is requested at runtime (via React.lazy). If the package is
// not installed, the request fails and the caller's error boundary shows a
// placeholder instead of crashing the whole app at build time.
export { default } from '@splinetool/react-spline'
