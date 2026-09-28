// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://mvulcu.github.io',
	integrations: [
		starlight({
			title: 'DevOps & Cloud Engineering Hub',
			description: 'Production architecture specifications, multi-cloud IaC blueprints, and SRE post-mortems by Maria Vulcu.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/mvulcu' },
				{ icon: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/mariavulcu' },
				{ icon: 'external', label: 'grepme.dev', href: 'https://grepme.dev' },
			],
			head: [
				{
					tag: 'script',
					attrs: { type: 'module' },
					content: `
						import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
						mermaid.initialize({ startOnLoad: false, theme: 'dark' });
						const renderMermaid = async () => {
							const blocks = document.querySelectorAll('pre:has(code.language-mermaid), pre.mermaid');
							for (const block of blocks) {
								const code = block.querySelector('code') || block;
								const container = document.createElement('div');
								container.className = 'mermaid';
								container.style.display = 'flex';
								container.style.justifyContent = 'center';
								container.style.margin = '2rem 0';
								container.textContent = code.textContent;
								block.replaceWith(container);
							}
							await mermaid.run({ querySelector: '.mermaid' });
						};
						if (document.readyState === 'loading') {
							document.addEventListener('DOMContentLoaded', renderMermaid);
						} else {
							renderMermaid();
						}
						document.addEventListener('astro:page-load', renderMermaid);
					`,
				},
			],
			sidebar: [
				{
					label: 'Portfolio (GCP Cloud Run)',
					items: [
						{ label: 'System Overview', slug: 'portfolio' },
						{ label: 'Azure Era (Legacy)', slug: 'portfolio/deployment' },
						{ label: 'GCP Migration (Production)', slug: 'portfolio/migration' },
						{ label: 'Observability Strategy', slug: 'portfolio/monitoring' },
					],
				},
				{
					label: 'KulturHub (Azure PaaS)',
					items: [
						{ label: 'Platform Overview', slug: 'kulturhub' },
						{ label: 'Architecture & Bicep IaC', slug: 'kulturhub/architecture' },
						{ label: 'Infrastructure & Networking', slug: 'kulturhub/infrastructure' },
						{ label: 'CI/CD Pipelines', slug: 'kulturhub/cicd' },
						{ label: 'Security & Secret Isolation', slug: 'kulturhub/security' },
						{ label: 'Observability & InfluxDB', slug: 'kulturhub/monitoring' },
						{ label: 'Microservices & MongoDB', slug: 'kulturhub/microservices' },
						{ label: 'Cost Engineering', slug: 'kulturhub/optimization' },
						{ label: 'Engineering Retrospective', slug: 'kulturhub/learning' },
					],
				},
			],
		}),
	],
});