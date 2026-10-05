import { Button } from '@/components/ui/button'
import { Head } from '@inertiajs/react'
import React from 'react'

export default function Page() {
    return (
        <>
            <Head>
                <title>SSO Authorization</title>
            </Head>
            <div className='h-screen flex flex-col items-center justify-center px-4 py-8 text-center'>
                <h3 className='mb-1.5 text-2xl font-semibold'>Terjadi kesalahan</h3>
                <p className='text-muted-foreground mb-6 max-w-[350px] text-sm'>
                    Permintaan anda telah kedaluarsa, silahkan coba kembali.
                </p>
                <Button asChild className='h-9 cursor-default'>
                    <a href='/login'>Ke Halaman Login</a>
                </Button>
            </div>
        </>
    )
}
