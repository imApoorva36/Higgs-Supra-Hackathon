"use client";
import { use, useEffect, useState } from "react";
import { useAppContext } from "@/components/AppContext";
import { getOrderDetails } from "@/lib/smart_contract_utils";
import Order from "../../../models/order";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import OrderDetails from "@/components/OrderDetails";

export default function OrderDeliveryPage({ params }) {
    const resolvedParams = use(params); // Unwrap params (Next.js requirement)
    const { id } = resolvedParams; // Now we can access id safely
    const [isLoading, setIsLoading] = useState(true);
    const [deliveryAgentLocation, setDeliveryAgentLocation] = useState({ latitude: 0, longitude: 0 });
    const { account, setAccount } = useAppContext();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {

        const starkeyAccount = sessionStorage.getItem("starkeyAccount");
        if (starkeyAccount) {
            setAccount(starkeyAccount);
        }

        navigator.geolocation.getCurrentPosition((position) => {
            setDeliveryAgentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        });

        const fetchData = async () => {
            const order = await getOrderDetails(id);
            setOrder(order);
            setIsLoading(false);
        };

        fetchData();
    }, [id]);

    return (
        <main>
              <nav className="bg-primary p-4">
                    <div className="container mx-auto flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <Image src="/box3-diag.png" alt="SupraTag Logo" width={40} height={40} />
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
            <div className="flex justify-center items-center my-20">
                {order && (
                    <Card className="rounded-lg flex flex-row gap-4 bg-white">
                        <OrderDetails
                            accessToken={"pk.eyJ1Ijoic29sbWVsdSIsImEiOiJjbHR2OTEybWsxbXZoMmpwZ29iYWV0cXA0In0.050i1C-6DafoyN4D1mJWkA"}
                            startCoordinates={[deliveryAgentLocation.longitude, deliveryAgentLocation.latitude]}
                            endCoordinates={[order.deliveryLongitude, order.deliveryLatitude]}
                            className="aspect-square rounded-lg ml-2 mt-2 h-96"
                            order={order}
                        />
                    </Card>
                )}
            </div>
        </main>
    );
}
