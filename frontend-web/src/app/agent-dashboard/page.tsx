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

const WebcamCaptureModal = dynamic(
  () => import("../../components/WebcamCapture"),
  { ssr: false }
);
// Mock data to simulate fetching from the blockchain
const mockOrders = [
  new Order('Alice', 1, '0x1234...', '0x5678...', 'rfid1', 'rfid2', false, 0.5, 'Books', 'A collection of books', '123 Main St', 13.001240, 74.796450),
  new Order('Bob', 2, '0x5678...', '0x1234...', 'rfid2', 'rfid1', true, 0.7, 'Electronics', 'A new laptop', '456 Elm St', 37.7749, -122.4194),
  new Order('Charlie', 3, '0x9012...', '0x3456...', 'rfid3', 'rfid4', false, 0.6, 'Clothing', 'A new shirt', '789 Oak St', 37.7749, -122.4194),
];


export default function DeliveryAgentDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, totalValue: 0 })
  const [deliveryAgentLocation, setDeliveryAgentLocation] = useState({ latitude: 0, longitude: 0 })

  const { apiKey, setApiKey, buildType, setBuildType, account, setAccount, role, setRole, contract, setContract } = useAppContext();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setDeliveryAgentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    });
    // Simulating API call to fetch orders and packages from the blockchain
    const fetchData = async () => {

      if(contract){
        const fetchOrders = await contract.getAllOrders();

        console.log(fetchOrders.funds);
      }


      setOrders(mockOrders)
      setIsLoading(false)
      calculateStats(mockOrders)
    }

    fetchData()
  }, [])

  const calculateStats = (orders: [Order]) => {
    const total = orders.length
    const delivered = orders.filter(order => order.orderDelivered).length
    const pending = total - delivered
    const totalValue = orders.reduce((sum, order) => sum + order.deliveryFees, 0)
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
    return (distance/1000).toFixed(2) + " km/s";
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
  const handlePickUpOrder = async (formData) => {
    try {
      console.log('Creating new package:', formData);
  
      // Format funds to appropriate format (assuming ETH)
      // const funds = ethers.utils.parseEther(formData.funds.toString());
  
      // Call the smart contract function
      const tx = await contract.createPackage(
        formData.metadata,
        formData.cid,
        formData.customer,
        formData.funds
      );
      console.log('Transaction sent:', tx);
  
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
  
      // Create the new package object
      const newPackage = {
        id: packages.length + 1,
        cid: formData.cid,
        metadata: formData.metadata,
        customer: formData.customer,
        delivered: false,
        fundsReleased: false,
        funds: formData.funds // Keep as string for display purposes
      };
  
      // Update state after successful transaction
      const updatedPackages = [...packages, newPackage];
      calculateStats(updatedPackages);
  
    } catch (error) {
      console.error('Error creating package:', error);
      // Optionally display error feedback to the user
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Delivery Agent Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Packages" value={stats.total.toString()} icon={<Package className="h-8 w-8 text-primary" />} />
        <StatCard title="Delivered" value={stats.delivered.toString()} icon={<Truck className="h-8 w-8 text-primary" />} />
        <StatCard title="Pending" value={stats.pending.toString()} icon={<AlertCircle className="h-8 w-8 text-primary" />} />
        <StatCard title="Total Earnings" value={`${stats.totalValue.toString().slice(0,8)} ETH`} icon={<BarChart3 className="h-8 w-8 text-primary" />} />
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
                          <Badge variant="secondary" className={order.orderDelivered ? "bg-green-400" : "bg-gray-100"}>{order.orderDelivered ? "Delivered": "Pending"}</Badge>
                        </TableCell>
                        <TableCell>
                          <CreateDialogBox title={"Deliver order"} content={"Are you sure you want to deliver this order?"} onSubmit={handlePickUpOrder} buttonTitle={"Continue"} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
    </div >
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