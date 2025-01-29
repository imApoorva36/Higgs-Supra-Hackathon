'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Order from '../../models/order';
import { useContext, useEffect, useState } from 'react';
import OrderDetails from '@/components/OrderDetails';
import Image from 'next/image';
import { useAppContext } from '@/components/AppContext';

interface OrderDeliveryPageProps {
    order: Order;
}

export default function OrderDeliveryPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [deliveryAgentLocation, setDeliveryAgentLocation] = useState({ latitude: 0, longitude: 0 })
    const { account, setAccount } = useAppContext();
    const order: Order = new Order('Charlie', 3, '0x9012...', '0x3456...', 'rfid3', 'rfid4', false, 0.6, 'Clothing', 'A new shirt', '789 Oak St', 37.7749, -122.4194);

    useEffect(() => {
        sessionStorage.getItem("starkeyAccount") && setAccount(sessionStorage.getItem("starkeyAccount"));
        navigator.geolocation.getCurrentPosition((position) => {
            setDeliveryAgentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        });
    }, []);


    return (
        <main>
            <nav className="bg-primary p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Image src="/box3-diag.png" alt="Box3 Logo" width={40} height={40} />
                        <div className="text-white text-xl font-bold">Order Delivery Page</div>
                    </div>
                    {account && (
                        <div className="p-2 border border-secondary rounded-full shadow-md">
                            <div className="flex items-center space-x-2 px-2">
                                <Image src="/starkey.png" alt="StarKey Logo" width={32} height={32} className="hidden sm:block" />
                                <span className="text-sm text-white font-semibold truncate max-w-[120px] sm:max-w-[200px]">
                                    {`${account.slice(0, 6)}...${account.slice(-4)}`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
            <div className="container mx-auto px-4 py-8">
                <Card className='rounded-lg flex flex-row gap-4 bg-white'>
                    <OrderDetails
                        accessToken={"pk.eyJ1Ijoic29sbWVsdSIsImEiOiJjbHR2OTEybWsxbXZoMmpwZ29iYWV0cXA0In0.050i1C-6DafoyN4D1mJWkA"}
                        startCoordinates={[-73.985428, 40.748817]}
                        endCoordinates={[-74.006015, 40.742898]}
                        className="aspect-square rounded-lg ml-2 mt-2 h-96"
                        order={order}
                    />
                </Card>
            </div >
        </main>
    );
}