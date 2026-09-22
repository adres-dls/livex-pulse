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
    // Keep module identity inside this app's node_modules. If these packages
    // are ever switched back to `file:` links into a sibling adresx checkout,
    // webpack's default symlink-following would resolve them outside this repo
    // and pull in adresx's own node_modules/react — a second React copy that
    // breaks hooks.
    config.resolve.symlinks = false
    config.watchOptions = {
      ...config.watchOptions,
      followSymlinks: true,
    }
    return config
  },
}

export default nextConfig
