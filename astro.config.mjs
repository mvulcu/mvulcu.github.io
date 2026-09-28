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
						// 1. Interactive Diagram Fullscreen Modal Logic
						const createModalElements = () => {
							if (document.getElementById('diagram-fullscreen-modal')) return;
							const modal = document.createElement('div');
							modal.id = 'diagram-fullscreen-modal';
							modal.className = 'diagram-modal';
							modal.innerHTML = \`
								<div class="diagram-modal-backdrop"></div>
								<div class="diagram-modal-dialog">
									<div class="diagram-modal-header">
										<span class="diagram-modal-title">Architecture Diagram Inspection</span>
										<button class="diagram-modal-close" aria-label="Close modal">&times;</button>
									</div>
									<div class="diagram-modal-body">
										<div class="diagram-modal-content"></div>
									</div>
									<div class="diagram-modal-footer">
										<span>Pinch or scroll to inspect details • Click backdrop to exit</span>
									</div>
								</div>
							\`;
							document.body.appendChild(modal);

							const closeModal = () => modal.classList.remove('is-active');
							modal.querySelector('.diagram-modal-close')?.addEventListener('click', closeModal);
							modal.querySelector('.diagram-modal-backdrop')?.addEventListener('click', closeModal);
							window.addEventListener('keydown', (e) => {
								if (e.key === 'Escape' && modal.classList.contains('is-active')) closeModal();
							});
						};

						window.openDiagramModal = (svgHtml, titleText) => {
							createModalElements();
							const modal = document.getElementById('diagram-fullscreen-modal');
							if (!modal) return;
							const content = modal.querySelector('.diagram-modal-content');
							const title = modal.querySelector('.diagram-modal-title');
							if (content) content.innerHTML = svgHtml;
							if (title && titleText) title.textContent = titleText;
							modal.classList.add('is-active');
						};

						// 2. Reading Progress Indicator & Back to Top
						const initReadingAids = () => {
							if (!document.getElementById('reading-progress-bar')) {
								const bar = document.createElement('div');
								bar.id = 'reading-progress-bar';
								bar.className = 'reading-progress-bar';
								document.body.appendChild(bar);
							}

							if (!document.getElementById('back-to-top-btn')) {
								const btn = document.createElement('button');
								btn.id = 'back-to-top-btn';
								btn.className = 'back-to-top-btn';
								btn.setAttribute('aria-label', 'Back to top');
								btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
								btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
								document.body.appendChild(btn);
							}

							const updateScrollAids = () => {
								const bar = document.getElementById('reading-progress-bar');
								const btn = document.getElementById('back-to-top-btn');
								const total = document.documentElement.scrollHeight - window.innerHeight;
								const current = window.scrollY;
								if (bar && total > 0) {
									const pct = Math.min(100, Math.max(0, (current / total) * 100));
									bar.style.width = pct + '%';
								}
								if (btn) {
									if (current > 350) btn.classList.add('is-visible');
									else btn.classList.remove('is-visible');
								}
							};

							window.removeEventListener('scroll', updateScrollAids);
							window.addEventListener('scroll', updateScrollAids, { passive: true });
							updateScrollAids();
						};

						// 3. Dynamic Mermaid Renderer with Fullscreen Controls & Mobile Touch Support
						const renderMermaidDiagrams = async () => {
							initReadingAids();
							createModalElements();

							const codeBlocks = document.querySelectorAll('pre[data-language="mermaid"]');
							if (codeBlocks.length === 0) return;

							const targets = [];
							for (const pre of codeBlocks) {
								if (pre.dataset.mermaidProcessed === 'true') continue;
								pre.dataset.mermaidProcessed = 'true';

								const frame = pre.closest('.expressive-code') || pre.closest('figure') || pre;

								const lineElements = pre.querySelectorAll('.ec-line');
								let codeText = '';
								if (lineElements.length > 0) {
									codeText = Array.from(lineElements)
										.map(el => el.textContent || '')
										.join('\\n');
								} else {
									codeText = pre.textContent || '';
								}

								codeText = codeText
									.replace(/&gt;/g, '>')
									.replace(/&lt;/g, '<')
									.replace(/&quot;/g, '"')
									.replace(/&amp;/g, '&')
									.trim();

								if (!codeText) continue;

								// Detect diagram type for header badge
								let badgeTitle = 'ARCHITECTURE DIAGRAM';
								const firstLine = codeText.split('\\n')[0].toLowerCase();
								if (firstLine.includes('erdiagram')) badgeTitle = 'DATABASE ER SPECIFICATION';
								else if (firstLine.includes('sequencediagram')) badgeTitle = 'SERVICE SEQUENCE FLOW';
								else if (firstLine.includes('flowchart')) badgeTitle = 'EXECUTION PIPELINE FLOW';
								else if (firstLine.includes('mindmap')) badgeTitle = 'TAXONOMY MINDMAP';
								else if (firstLine.includes('pie')) badgeTitle = 'METRICS BREAKDOWN';

								const card = document.createElement('div');
								card.className = 'mermaid-diagram-card';
								card.innerHTML = \`
									<div class="mermaid-diagram-header">
										<span class="mermaid-badge">\${badgeTitle}</span>
										<button class="mermaid-expand-btn" title="View Fullscreen / Zoom">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
											<span>Expand</span>
										</button>
									</div>
									<div class="mermaid-diagram-inner">
										<div class="mermaid-svg-mount"></div>
									</div>
									<div class="mermaid-mobile-hint">
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
										<span>Swipe horizontally to explore diagram</span>
									</div>
								\`;

								frame.replaceWith(card);
								const mount = card.querySelector('.mermaid-svg-mount');
								const expandBtn = card.querySelector('.mermaid-expand-btn');

								targets.push({ card, mount, expandBtn, code: codeText, title: badgeTitle });
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
										edgeLabelBackground: '#0f172a'
									}
								});

								for (let i = 0; i < targets.length; i++) {
									const item = targets[i];
									try {
										const id = 'mermaid-svg-' + Math.random().toString(36).substring(2, 9) + '-' + i;
										const { svg } = await mermaid.render(id, item.code);
										if (item.mount) {
											item.mount.innerHTML = svg;
											// Attach fullscreen opener
											item.expandBtn?.addEventListener('click', () => {
												window.openDiagramModal(svg, item.title);
											});
										}
									} catch (err) {
										console.warn('Mermaid render warning:', err);
										if (item.mount) item.mount.innerHTML = '<pre class="mermaid-fallback">' + item.code + '</pre>';
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
