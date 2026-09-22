/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The design system ships raw TS/TSX from its `src/` (no prebuilt dist),
  // so Next must transpile it as part of this app's build.
  transpilePackages: ["@adres/design-system", "@adres/brand-adrec"],
  experimental: {
    // @adres/design-system is imported via its barrel entrypoint. optimizePackageImports
    // rewrites those barrel imports to direct per-component paths at build time, so we
    // keep the single-import ergonomics without pulling the whole DS into each bundle.
    optimizePackageImports: ["lucide-react", "motion", "@adres/design-system"],
  },
  webpack: (config) => {
    // @adres/design-system and @adres/brand-adrec are `file:../adresx/packages/*`
    // links into a sibling checkout, not vendored copies. Webpack's default
    // symlink-following resolves them to their real path outside this repo,
    // which pulls in adresx's own node_modules/react — a second React copy
    // alongside this app's, breaking hooks. Disabling symlink resolution keeps
    // the symlink path (inside this app's node_modules) as the module's
    // canonical identity, so `react` always resolves to this app's copy.
    config.resolve.symlinks = false
    // followSymlinks so edits inside the linked adresx packages trigger a dev
    // rebuild — the watcher otherwise only watches the symlink node itself.
    config.watchOptions = {
      ...config.watchOptions,
      followSymlinks: true,
    }
    return config
  },
}

export default nextConfig
