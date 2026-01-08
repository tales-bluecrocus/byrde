import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = resolve(__dirname, '../');

export default defineConfig(({ mode }) => {
	return {
		root: rootDir,
		base: './', // Ensures all paths are relative in CSS
		resolve: {
			alias: {
				'@': resolve(rootDir, 'assets'),
			},
		},
		css: {
			preprocessorOptions: {
				scss: {},
			},
		},
		esbuild: {
			legalComments: 'none',
			target: 'es2020',
		},
		build: {
			emptyOutDir: false,
			assetsInlineLimit: 0,
			rollupOptions: {
				input: resolve(rootDir, 'assets/js/load.js'),
				output: {
					entryFileNames: 'main.min.js',
					chunkFileNames: 'chunks/[name]-[hash].js',
					assetFileNames: ({ name }) => {
						if (name.match(/\.(woff2?|ttf|eot|otf)$/)) {
							return `fonts/[name][extname]`;
						}
						if (name.endsWith('.css')) {
							return 'style.min.css';
						}
						return 'assets/[name][extname]';
					},
					format: 'es',
				},
			},
			cssCodeSplit: false,
			sourcemap: mode === 'development',
			outDir: './dist/',
			minify: 'esbuild',
			target: 'es2020',
		},
	};
});
