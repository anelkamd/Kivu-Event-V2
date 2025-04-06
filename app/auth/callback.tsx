// pages/auth/callback.tsx

import { GetServerSideProps } from 'next'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query } = context
    const token = query.token as string | undefined

    if (!token) {
        return {
            redirect: {
                destination: '/login?error=auth_failed',
                permanent: false,
            },
        }
    }

    return {
        props: { token },
    }
}

const AuthCallbackPage = ({ token }: { token?: string }) => {
    const router = useRouter()

    useEffect(() => {
        if (token) {
            Cookies.set('token', token, { expires: 30 })
            router.push('/dashboard')
        }
    }, [token, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-white">Authentification en cours...</p>
            </div>
        </div>
    )
}

export default AuthCallbackPage
