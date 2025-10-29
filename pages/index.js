import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/red-rocks');
  }, [router]);

  return (
    <>
      <Head>
        <title>Red Rocks AI Map</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#fff',
        fontSize: '18px'
      }}>
        Loading Red Rocks Map...
      </div>
    </>
  );
}
