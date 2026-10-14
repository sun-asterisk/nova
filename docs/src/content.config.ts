import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';

const audienceTag = z.enum(['beginner', 'designer', 'pm', 'engineer', 'qa']);

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				tags: z.array(audienceTag).optional().default([]),
				type: z.enum(['update', 'manual', 'guide']).optional(),
				version: z.string().optional(),
				releaseDate: z.coerce.date().optional(),
				audience: audienceTag.optional(),
				difficulty: z.enum(['basic', 'intermediate', 'advanced']).optional(),
			}),
		}),
	}),
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
