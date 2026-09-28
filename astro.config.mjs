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
			customCss: ['./src/styles/custom.css'],
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
						const renderMermaidDiagrams = async () => {
							const codeBlocks = document.querySelectorAll('pre[data-language="mermaid"]');
							if (codeBlocks.length === 0) return;

							const targets = [];
							for (const pre of codeBlocks) {
								if (pre.dataset.mermaidProcessed === 'true') continue;
								pre.dataset.mermaidProcessed = 'true';

								const frame = pre.closest('.expressive-code') || pre.closest('figure') || pre;

								// Extract each line from .ec-line to preserve all line breaks and indentation
								const lineElements = pre.querySelectorAll('.ec-line');
								let codeText = '';
								if (lineElements.length > 0) {
									codeText = Array.from(lineElements)
										.map(el => el.textContent || '')
										.join('\\n');
								} else {
									codeText = pre.textContent || '';
								}

								// Decode common HTML entities
								codeText = codeText
									.replace(/&gt;/g, '>')
									.replace(/&lt;/g, '<')
									.replace(/&quot;/g, '"')
									.replace(/&amp;/g, '&')
									.trim();

								if (!codeText) continue;

								const container = document.createElement('div');
								container.className = 'mermaid-diagram-card';
								const inner = document.createElement('div');
								inner.className = 'mermaid-diagram-inner';
								container.appendChild(inner);

								frame.replaceWith(container);
								targets.push({ container, inner, code: codeText });
							}

							if (targets.length === 0) return;

							try {
								const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');
								mermaid.initialize({
									startOnLoad: false,
									theme: 'dark',
									securityLevel: 'loose',
									fontFamily: "'JetBrains Mono', 'Inter', monospace",
									themeVariables: {
										darkMode: true,
										background: '#090d16',
										mainBkg: '#0f172a',
										nodeBorder: '#38bdf8',
										clusterBkg: '#141d2e',
										clusterBorder: '#334155',
										primaryColor: '#0369a1',
										primaryTextColor: '#f8fafc',
										primaryBorderColor: '#38bdf8',
										lineColor: '#7dd3fc',
										secondaryColor: '#4f46e5',
										tertiaryColor: '#1e293b',
										textColor: '#e2e8f0',
										edgeLabelBackground: '#0f172a',
										actorBkg: '#0f172a',
										actorBorder: '#38bdf8',
										actorTextColor: '#f8fafc',
										signalColor: '#38bdf8',
										signalTextColor: '#e2e8f0',
										labelBoxBkgColor: '#0f172a',
										labelBoxBorderColor: '#38bdf8',
										labelTextColor: '#f8fafc',
										loopTextColor: '#f8fafc',
										noteBkgColor: '#1e293b',
										noteBorderColor: '#64748b',
										noteTextColor: '#f8fafc'
									}
								});

								for (let i = 0; i < targets.length; i++) {
									const { inner, code } = targets[i];
									try {
										const id = 'mermaid-svg-' + Math.random().toString(36).substring(2, 9) + '-' + i;
										const { svg } = await mermaid.render(id, code);
										inner.innerHTML = svg;
									} catch (err) {
										console.warn('Mermaid render warning:', err);
										inner.innerHTML = '<pre class="mermaid-fallback">' + code + '</pre>';
									}
								}
							} catch (e) {
								console.error('Failed to load Mermaid ESM library:', e);
							}
						};

						if (document.readyState === 'loading') {
							document.addEventListener('DOMContentLoaded', renderMermaidDiagrams);
						} else {
							renderMermaidDiagrams();
						}
						document.addEventListener('astro:page-load', renderMermaidDiagrams);
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
