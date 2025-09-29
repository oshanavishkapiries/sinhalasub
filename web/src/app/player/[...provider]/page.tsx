
'use client'

import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlayerPage() {
    const params = useParams();
    const provider = params.provider?.[0] || 'Unknown';

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 container py-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Embedded Player</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-card-foreground/10 rounded-md flex items-center justify-center">
                            <p className="text-muted-foreground">Playing from: <span className="font-semibold capitalize text-foreground">{provider.replace('-', ' ')}</span></p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
