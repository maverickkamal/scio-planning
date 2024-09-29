import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../app/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        if (['/', '/signin', '/signup'].includes(router.pathname)) {
          router.push('/chat');
        }
      } else {
        // User is signed out
        if (router.pathname === '/chat') {
          router.push('/signin');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;