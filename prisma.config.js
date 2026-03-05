/**
 * 🛠️ Prisma Configuration
 * 
 * Using .js to ensure compatibility with Vercel's build environment.
 */
export default {
  seed: {
    command: 'tsx prisma/seed.ts',
  },
};
