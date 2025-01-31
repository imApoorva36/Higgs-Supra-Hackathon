import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Order from "@/models/order"
import { Package, Truck, CheckCircle, DollarSign, EthernetPortIcon } from "lucide-react"
import Image from "next/image";

export function DashboardStats({orders}: {orders: Order[]}) {
  const totalPackages = orders.length
  const inTransit = orders.filter((order) => !order.orderDelivered).length
  const delivered = orders.filter((order) => order.orderDelivered && !order.fundReleased).length
  const completed = orders.filter((order) => order.fundReleased).length
  const totalValue = orders.reduce((sum, order) => sum + order.deliveryFees, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPackages}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inTransit}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{delivered}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <div style={{ position: 'relative', width: 20, height: 20 }}>
            <Image src="/eth.png" alt="Eth" layout="fill" objectFit="contain" style={{ filter: 'invert(1)' }} />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#3F3B3B',
              mixBlendMode: 'color'
            }} />
      </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalValue.toFixed(3)} ETH</div>
        </CardContent>
      </Card>
    </div>
  )
}

