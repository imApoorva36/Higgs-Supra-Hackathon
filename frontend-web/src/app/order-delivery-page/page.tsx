'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Order from '../../models/order';
import { useEffect, useState } from 'react';
import OrderDetails from '@/components/OrderDetails';

interface OrderDeliveryPageProps {
    order: Order;
}

export default function OrderDeliveryPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [deliveryAgentLocation, setDeliveryAgentLocation] = useState({ latitude: 0, longitude: 0 })
    const order:Order = new Order('Charlie', 3, '0x9012...', '0x3456...', 'rfid3', 'rfid4', false, 0.6, 'Clothing', 'A new shirt', '789 Oak St', 37.7749, -122.4194);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
        setDeliveryAgentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
        });}, []);


    return (
        <main>
             <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order Delivery Dashboard</h1>
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