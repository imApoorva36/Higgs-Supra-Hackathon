'use client'

import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, AlertCircle, BarChart3, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import React from "react";
import dynamic from "next/dynamic";
import { useSession } from 'next-auth/react'
import { useAppContext } from '@/components/AppContext'
import Order from '../../models/order';
import Image from 'next/image'
import { getAllPackages, getUndeliveredPackages } from '@/lib/smart_contract_utils'
import { useRouter } from 'next/navigation'

const WebcamCaptureModal = dynamic(
  () => import("../../components/WebcamCapture"),
  { ssr: false }
);

export default function DeliveryAgentDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, totalValue: 0 })
  const [deliveryAgentLocation, setDeliveryAgentLocation] = useState({ latitude: 0, longitude: 0 })
  const router = useRouter();

  const { apiKey, setApiKey, buildType, setBuildType, account, setAccount, role, setRole, contract, setContract } = useAppContext();

  useEffect(() => {
    sessionStorage.getItem("starkeyAccount") && setAccount(sessionStorage.getItem("starkeyAccount"));
    navigator.geolocation.getCurrentPosition((position) => {
      setDeliveryAgentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    });
    // Simulating API call to fetch orders and packages from the blockchain
    const fetchData = async () => {

      const orders = await getUndeliveredPackages();

      setOrders(orders)
      setIsLoading(false)
      calculateStats(orders)
    }

    fetchData()
  }, [])

  const calculateStats = (orders: [Order]) => {
    const total = orders.length
    const delivered = orders.filter(order => order.orderDelivered).length
    const pending = total - delivered
    const totalValue = orders.reduce((sum, order) => order.fundReleased ? sum + order.deliveryFees : sum, 0)
    setStats({ total, delivered, pending, totalValue })
  }

  const getStatusIcon = (delivered: boolean, fundsReleased: boolean) => {
    if (fundsReleased) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (delivered) return <Truck className="h-5 w-5 text-blue-500" />
    return <Package className="h-5 w-5 text-yellow-500" />
  }

  const getStatusText = (delivered: boolean, fundsReleased: boolean) => {
    if (fundsReleased) return 'Completed'
    if (delivered) return 'Delivered'
    return 'In Transit'
  }

  const computeDistanceFromUser = (order: Order) => {
    if(deliveryAgentLocation.latitude == 0 && deliveryAgentLocation.longitude == 0) return "Grant Location Permission!";
    //compute point to point distance
    const R = 6371e3; // metres
    const φ1 = deliveryAgentLocation.latitude * Math.PI/180; // φ, λ in radians
    const φ2 = order.deliveryLatitude * Math.PI/180;
    const Δφ = (order.deliveryLatitude-deliveryAgentLocation.latitude) * Math.PI/180;
    const Δλ = (order.deliveryLongitude-deliveryAgentLocation.longitude) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    const distance = R * c; // in metres
    return (distance/1000).toFixed(2) + " km";
  }

  // const handleMarkAsDelivered = async (packageId: number) => {
  //   // Here you would call the smart contract function to mark as delivered
  //   console.log(`Marking package ${packageId} as delivered`)
  //   // For demo purposes, we'll just update the local state
  //   const updatedPackages = packages.map(pkg =>
  //     pkg.id === packageId ? { ...pkg, delivered: true } : pkg
  //   )
  //   setPackages(updatedPackages)
  //   calculateStats(updatedPackages)
  // }

  // Function called whenever the agent decides to deliver an order
  // const handlePickUpOrder = async (formData) => {
  //   try {
  //     console.log('Creating new package:', formData);
  
  //     // Format funds to appropriate format (assuming ETH)
  //     // const funds = ethers.utils.parseEther(formData.funds.toString());
  
  //     // Call the smart contract function
  //     const tx = await contract.createPackage(
  //       formData.metadata,
  //       formData.cid,
  //       formData.customer,
  //       formData.funds
  //     );
  //     console.log('Transaction sent:', tx);
  
  //     // Wait for the transaction to be mined
  //     const receipt = await tx.wait();
  //     console.log('Transaction confirmed:', receipt);
  
  //     // Create the new package object
  //     const newPackage = {
  //       id: packages.length + 1,
  //       cid: formData.cid,
  //       metadata: formData.metadata,
  //       customer: formData.customer,
  //       delivered: false,
  //       fundsReleased: false,
  //       funds: formData.funds // Keep as string for display purposes
  //     };
  
  //     // Update state after successful transaction
  //     const updatedPackages = [...packages, newPackage];
  //     calculateStats(updatedPackages);
  
  //   } catch (error) {
  //     console.error('Error creating package:', error);
  //     // Optionally display error feedback to the user
  //   }
  // };

  const handleButtonClick = (order: Order) => {
    router.push(`/order-delivery-page/${order.id}`)
  };
  

  return (
    <>
          <nav className="bg-primary p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Image src="/box3-diag.png" alt="Box3 Logo" width={40} height={40} />
                <div className="text-white text-xl font-bold">Delivery Agent Dashboard</div>
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
      <h1 className="text-3xl font-bold mb-8">My Deliveries</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Packages" value={stats.total.toString()} icon={<Package className="h-6 w-6" />} />
        <StatCard title="Delivered" value={stats.delivered.toString()} icon={<Truck className="h-6 w-6" />} />
        <StatCard title="Pending" value={stats.pending.toString()} icon={<AlertCircle className="h-6 w-6" />} />
        <StatCard title="Total Earnings" value={`${stats.totalValue.toString().slice(0,8)} ETH`} icon={<BarChart3 className="h-6 w-6" />} />
      </div>

      {/* Orders and Packages Tabs */}
      {/* <Tabs defaultValue="orders" className="mb-8">
        <TabsList>
          <TabsTrigger value="orders">Customer Orders</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
        </TabsList>
        <TabsContent value="orders"> */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Orders</CardTitle>
              <CardDescription>Orders created by customers waiting to be delivered</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold">No orders found</p>
                  <p className="text-sm text-muted-foreground">New orders will appear here when created by customers</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Contents</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Distance (approx.)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Funds Transferred</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: Order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.content}</TableCell>
                        <TableCell>{order.deliveryFees} ETH</TableCell>
                        <TableCell>{computeDistanceFromUser(order)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={order.orderDelivered ? "bg-green-400 hover:bg-green-400" : "bg-gray-100"}>{order.orderDelivered ? "Delivered": "Pending"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={order.fundReleased ? "bg-green-400 hover:bg-green-400" : "bg-gray-100"}>{order.fundReleased ? "Sucessful": "Pending"}</Badge>
                        </TableCell>
                        <TableCell>
                          <CreateDialogBox title={"Deliver order"} content={"Are you sure you want to deliver this order?"} onSubmit={() => {
                              handleButtonClick(order)
                          }} buttonTitle={"Continue"} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
    </div >
    </>
  )
}

function StatCard({ title, value, icon } : { title: string, value: string, icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

export function CreateDialogBox({ title, content, onSubmit, buttonTitle } : { title: string, content: string, onSubmit: any, buttonTitle: string }) {

  const handleSubmit = (e:any) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className='text-white rounded-full'>
          <Truck className="h-5 w-5 text-white" />
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='pt-2'>
            {content}
          </DialogDescription>
        </DialogHeader>
          <DialogFooter className='text-white'>
            <Button onClick={handleSubmit} type="submit" className='rounded-full'>{buttonTitle}</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}