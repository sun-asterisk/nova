// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// Public domain (canonical / sitemap). The same build is also served on the
	// Worker's workers.dev URL behind Basic Auth (dev access);
	// nova.sun-asterisk.com reaches it through the PublicDocs entrypoint
	// (auth-worker.js) via the nova-landing Pages service binding.
	site: 'https://nova.sun-asterisk.com',
	integrations: [
		starlight({
			// ブランド: LP (https://nova.sun-asterisk.com/) に合わせ、名前は Nova、ロゴ・ファビコンも LP と同じものを使う
			title: 'Sun* Design System Nova',
			logo: { src: './src/assets/brand/nova-logo.png', alt: 'Nova', replacesTitle: true },
			favicon: '/favicon.png',
			head: [{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } }],
			customCss: ['./src/styles/custom.css'],
			defaultLocale: 'root',
			locales: {
				root: { label: '日本語', lang: 'ja' },
				en: { label: 'English' },
				vi: { label: 'Tiếng Việt' },
			},
			sidebar: [
				{
					label: 'コンポーネント',
					translations: { en: 'Components', vi: 'Components' },
					collapsed: false,
					items: [{ autogenerate: { directory: 'components' } }],
				},
				{
					label: 'Storybook',
					translations: { en: 'Storybook', vi: 'Storybook' },
					link: '/storybook-view',
				},
				{
					label: '更新情報',
					translations: { en: 'Updates', vi: 'Cập nhật' },
					items: [{ autogenerate: { directory: 'updates' } }],
				},
				{
					label: 'ガイド',
					translations: { en: 'Guide', vi: 'Hướng dẫn' },
					items: [{ autogenerate: { directory: 'guide' } }],
				},
			],
			components: {
				PageTitle: './src/components/PageTitleWithTags.astro',
			},
		}),
	],
});
