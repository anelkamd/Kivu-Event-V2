// pages/auth/callback.tsx

import { GetServerSideProps } from 'next'
import {useEffect}  from 'react'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Fonction côté serveur pour la gestion de la redirection
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { query } = context
    const token = query.token as string | undefined

    if (token) {
        // Si le token est trouvé, on redirige vers la page de callback avec le token en props
        return {
            props: { token },  // On passe le token en tant que prop au composant
        }
    }

    // Si aucun token n'est trouvé, on redirige vers la page de login avec un message d'erreur
    return {
        redirect: {
            destination: '/login?error=auth_failed',
            permanent: false,
        },
    }
}

const AuthCallbackPage = ({ token }: { token?: string }) => {
    const router = useRouter()

    useEffect(() => {
        if (token) {
            // Si un token est trouvé, on le stocke dans un cookie côté client
            Cookies.set('token', token, { expires: 30 })
            // Ensuite, on redirige l'utilisateur vers le dashboard
            router.push('/dashboard')
        } else {
            // Si aucun token n'est trouvé, rediriger vers la page de login avec l'erreur
            router.push('/login?error=auth_failed')
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
