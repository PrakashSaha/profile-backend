import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

// Reads existing JSON and seeds the PostgreSQL database
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // ---- USER (ADMIN) ----
    const adminEmail = process.env.ADMIN_EMAIL || 'prakashsaha1999@gmail.com'
    const hashedPassword = await bcrypt.hash('admin123', 10)

    await (prisma as any).user.upsert({
        where: { email: adminEmail },
        update: { password: hashedPassword },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Prakash Saha'
        }
    })
    console.log('✅ Admin User seeded (Login with admin123)')

    // ---- HERO ----
    const heroContent = {
        name: 'Prakash Saha',
        role: 'Senior Software Engineer & Product Builder',
        bio: 'Specializing in AI Systems, Enterprise Cloud Architectures, and Pixel-Perfect UX.',
        company: 'Sling Infocom',
        location: 'Kolkata, West Bengal, India',
        image: '/img/prakash.png',
        logoLink: '/admin/dashboard',
        socials: [
            { label: 'GitHub', href: 'https://github.com/PrakashSaha', icon: 'Github' },
            { label: 'LinkedIn', href: 'https://linkedin.com/in/prakashsaha', icon: 'Linkedin' },
            { label: 'Email', href: 'mailto:prakashsaha1999@gmail.com', icon: 'Mail' },
            { label: 'Instagram', href: 'https://www.instagram.com/prakash.saha.31105/', icon: 'Instagram' }
        ]
    }

    await prisma.hero.upsert({
        where: { id: 'hero' },
        update: heroContent,
        create: {
            id: 'hero',
            ...heroContent
        },
    })
    console.log('✅ Hero seeded')

    // ---- TOOLS ----
    const toolCategories = [
        { name: 'Frontend Development', icon: 'Layout', tools: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'] },
        { name: 'Backend & APIs', icon: 'Server', tools: ['Node.js', 'Express', 'Go', 'FastAPI', 'GraphQL'] },
        { name: 'AI & ML', icon: 'Cpu', tools: ['TensorFlow', 'PyTorch', 'LangChain', 'OpenAI', 'Hugging Face'] },
        { name: 'Cloud & DevOps', icon: 'Cloud', tools: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'] },
    ]

    for (const cat of toolCategories) {
        await prisma.toolCategory.create({
            data: {
                name: cat.name,
                icon: cat.icon,
                tools: { create: cat.tools.map((t) => ({ name: t })) },
            },
        })
    }
    console.log('✅ Tools seeded')

    // ---- PROJECTS ----
    const projects = [
        {
            title: 'Neural Orchestrator',
            slug: 'neural-orchestrator',
            description: 'A distributed system for managing LLM agents with real-time feedback loops.',
            fullDescription: 'Built with resilience and scalability in mind...',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800&h=400',
            icon: 'Code2',
            type: 'Public',
            tech: ['Go', 'gRPC', 'Redis'],
            stars: 124,
            forks: 18,
            watchers: 42,
            updatedAt: '3 days ago',
        },
        {
            title: 'Zenith UI Engine',
            slug: 'zenith-ui-engine',
            description: 'Design system core for enterprise scale applications.',
            fullDescription: 'Zenith is more than just a component library...',
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800&h=400',
            icon: 'Layout',
            type: 'Public',
            tech: ['React', 'TypeScript', 'Tailwind'],
            stars: 84,
            forks: 12,
            watchers: 28,
            updatedAt: '1 week ago',
        },
        {
            title: 'CloudGuard Alpha',
            slug: 'cloudguard-alpha',
            description: 'Security monitoring tool for AWS infrastructure.',
            fullDescription: 'CloudGuard Alpha provides continuous security surveillance...',
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800&h=400',
            icon: 'Globe',
            type: 'Public',
            tech: ['Python', 'AWS', 'Docker'],
            stars: 56,
            forks: 8,
            watchers: 15,
            updatedAt: '2 weeks ago',
        },
    ]

    for (const project of projects) {
        await prisma.project.upsert({ where: { slug: project.slug }, update: {}, create: project })
    }
    console.log('✅ Projects seeded')

    // ---- BLOG ----
    const blogPosts = [
        {
            title: 'Building Microservices with Go and gRPC',
            slug: 'microservices-go-grpc',
            excerpt: 'A deep dive into building high-performance microservices with Go and gRPC.',
            content: '<p>Content goes here...</p>',
            image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800&h=400',
            date: 'Dec 15, 2024',
            readTime: '8 min',
            tags: ['Go', 'Microservices', 'gRPC'],
            author: 'Prakash Saha',
            authorRole: 'Senior Software Engineer',
        },
        {
            title: 'The Future of AI in Enterprise',
            slug: 'future-of-ai',
            excerpt: 'Exploring how AI is transforming enterprise software development.',
            content: '<p>AI is changing everything...</p>',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800&h=400',
            date: 'Nov 28, 2024',
            readTime: '12 min',
            tags: ['AI', 'Enterprise', 'Strategy'],
            author: 'Prakash Saha',
            authorRole: 'Senior Software Engineer',
        },
    ]

    for (const post of blogPosts) {
        await prisma.blogPost.upsert({ where: { slug: post.slug }, update: {}, create: post })
    }
    console.log('✅ Blog posts seeded')

    // ---- CREDENTIALS ----
    const credentials = [
        { label: 'AWS Knowledge: Cloud Essentials', link: 'https://www.credly.com/badges/d35db8a4-f8af-48fd-a774-428859e9e4ba', issuer: 'Amazon Web Services (AWS)', date: '2024', type: 'badge', description: 'Validation of foundational cloud knowledge.' },
        { label: 'AWS Cloud Quest: Cloud Practitioner', link: 'https://www.credly.com/badges/d05c4248-b618-4d24-8c1f-4bc3c45a84d3', issuer: 'Amazon Web Services (AWS)', date: '2024', type: 'badge', description: 'Hands-on experience building solutions on AWS.' },
        { label: 'Operation Management (Great Learning)', link: 'https://www.mygreatlearning.com/certificate/GBKGMOYB', issuer: 'Great Learning', date: '2023', type: 'certificate', description: 'Comprehensive study of operational strategies.' },
    ]
    for (const cred of credentials) {
        await prisma.credential.create({ data: cred })
    }
    console.log('✅ Credentials seeded')

    // ---- BENTO ----
    await prisma.bento.upsert({
        where: { id: 'bento' },
        update: {},
        create: {
            id: 'bento',
            content: {
                statusCard: { title: 'Building the future of <span class="text-accent">Agentic AI</span> & Cloud Systems.', experience: '5+', projects: '40+' },
                techPulse: ['Go', 'TypeScript', 'Python', 'AWS', 'TensorFlow'],
                location: { city: 'Kolkata', country: 'IN', timezone: 'GMT +5:30' },
                currentSprint: { title: 'Building <br/>Neural Orch v2' },
            },
        },
    })
    console.log('✅ Bento seeded')

    // ---- EXPERIENCES ----
    const experiences = [
        {
            title: 'Senior Software Engineer',
            company: 'Sling Infocom',
            location: 'Kolkata, WB',
            period: '2022 - Present',
            type: 'Full-time',
            points: ['Leading full-stack development of enterprise AI solutions.', 'Architecting scalable cloud infra on AWS.']
        },
        {
            title: 'Software Engineer',
            company: 'Tech Solutions',
            location: 'Remote',
            period: '2020 - 2022',
            type: 'Contract',
            points: ['Developed responsive web apps using React and Node.js.', 'Optimized database queries for performance.']
        }
    ]
    for (const exp of experiences) {
        await prisma.experience.create({ data: exp })
    }
    console.log('✅ Experience seeded')

    // ---- EDUCATION ----
    const education = [
        {
            university: 'Techno India University',
            degree: 'Bachelor of Technology in Computer Science',
            period: '2017 - 2021',
            location: 'Kolkata, India'
        }
    ]
    for (const edu of education) {
        await prisma.education.create({ data: edu })
    }
    console.log('✅ Education seeded')

    console.log('🎉 Seed complete!')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())
