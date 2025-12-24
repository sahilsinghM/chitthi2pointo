/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Disable webpack build worker to avoid SIGBUS crashes in this environment.
    webpackBuildWorker: false,
    useLightningcss: false,
    useWasmBinary: true,
    workerThreads: false
  }
};

export default nextConfig;
