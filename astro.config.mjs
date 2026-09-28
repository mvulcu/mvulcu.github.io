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