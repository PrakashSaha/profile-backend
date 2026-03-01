import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import prisma from '../../lib/prisma.js'
import { config } from '../../config/env.js'

export const authService = {
    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new Error('Invalid credentials')
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            config.JWT_SECRET,
            { expiresIn: '24h' }
        )

        return { token, user: { id: user.id, email: user.email, name: user.name } }
    },

    async register(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        return prisma.user.create({
            data: { ...data, password: hashedPassword }
        })
    }
}
