"use client"

import { useState, useEffect } from "react"
import { Package, Truck, CheckCircle, AlertCircle, Plus, Search, Clock10 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DashboardStats } from "../../components/DashboardStats"
import axios from "axios"
import Image from "next/image"
import { useAppContext } from "@/components/AppContext"
import { connectWallet, createOrder, getAllPackages } from "@/lib/smart_contract_utils"
import { create } from "domain"
import Order from "@/models/order"


export default function CustomerDashboard() {
  const [packages, setPackages] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { account, setAccount } = useAppContext();

  useEffect(() => {
    sessionStorage.getItem("starkeyAccount") && setAccount(sessionStorage.getItem("starkeyAccount"))
    const fetchPackages = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching packages...")
        const orders = await getAllPackages();
        setPackages(orders)
      } catch (error) {
        console.error("Error fetching packages:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPackages()
  }, [])

  const getStatusIcon = (delivered: boolean, fundsReleased: boolean) => {
    if (fundsReleased) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (delivered) return <Package className="h-5 w-5 text-yellow-500" />
    return <Truck className="h-5 w-5 text-blue-500" />
  }

  const getStatusText = (delivered: boolean, fundsReleased: boolean) => {
    if (fundsReleased) return "Completed"
    if (delivered) return "Delivered"
    return "In Transit"
  }

  const handleOpenBox = (packageId: number) => {
    console.log(packageId)
    setPackages((prevPackages) =>
      prevPackages.map((pkg) => (pkg.id === packageId ? { ...pkg, fundsReleased: true } : pkg)),
    )
    actuateServo()
  }

  const actuateServo = async () => {
    try {
      const response = await axios.get(`http://192.168.82.132:8000/api/servo/`)
      console.log(response.data)
    } catch (error) {
      console.error("Error activating servo:", error)
    }
  }

  const readRFID = async (packageId: number) => {
    try {
      const response = await axios.get(`http://192.168.82.132:8000/api/get_tag/`)
      const { tag_id: rfidFromAPI } = response.data
      console.log(`Fetched RFID: ${rfidFromAPI}`)
      handleOpenBox(packageId)
    } catch (error) {
      console.error("Error reading RFID:", error)
    }
  }

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <nav className="bg-primary p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image src="/box3-diag.png" alt="SupraTag Logo" width={40} height={40} />
            <div className="text-white text-xl font-bold">Customer Dashboard</div>
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
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">My Packages</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search packages..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <CreateOrderDialog />
          </div>
        </div>

        <DashboardStats orders={packages} />

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-[300px]" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-[120px]" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredPackages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-40">
              <AlertCircle className="h-10 w-10 text-yellow-500 mb-4" />
              <p className="text-lg font-semibold">No packages found</p>
              <p className="text-sm text-muted-foreground">Your ordered packages will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-primary">
                      Package - {pkg.content}
                    </CardTitle>
                    <Badge variant="secondary"
                      className="flex items-center px-3 py-1"
                    >
                      {getStatusIcon(pkg.orderDelivered, pkg.fundReleased)}
                      <span className="ml-2 font-medium">{getStatusText(pkg.orderDelivered, pkg.fundReleased)}</span>
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-2 text-sm">
                    <Package className="h-4 w-4" />
                    <span className="font-mono">CID: {pkg.id}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-12">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Address</p>
                      <p className="font-medium">{pkg.deliveryAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Value</p>
                      <p className="font-medium">{pkg.deliveryFees} ETH</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {pkg.orderDelivered && !pkg.fundReleased ? (
                    <Button
                      onClick={() => readRFID(pkg.id)}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Open Box
                    </Button>
                  ) : pkg.fundReleased ? (
                    <Button
                      variant="ghost"
                      className="w-full hover:bg-secondary/80"
                      disabled
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Already Opened
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full hover:bg-secondary/80"
                      disabled
                    >
                      <Clock10 className="mr-2 h-4 w-4" />
                      Arriving Soon
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function CreateOrderDialog() {
  const [orderData, setOrderData] = useState({
    contents: "",
    value: 0,
    description: "",
    address: ""
  })

  const handleInputChange = (e:any) => {
    const { name, value } = e.target
    setOrderData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e:any) => {
    e.preventDefault()
    if (!orderData.contents || !orderData.value || !orderData.description) {
      alert("Please fill in all required fields")
      return
    }
    console.log("Order submitted:", orderData)
    setOrderData({ contents: "", value: 0, description: "" , address: ""})
    const accounts = await connectWallet();
    console.log("Wallet address", accounts[0]) 
    await createOrder('metadata', 'cid', 'name', 'description', 100, 
      '0xedfa1c3b4fecc75f8b8400922c31a5dc691d8f152fbae130cb95ae1606267255', '0xedfa1c3b4fecc75f8b8400922c31a5dc691d8f152fbae130cb95ae1606267255', 
      37, 155, 'customerRfid', 'deliveryRfid');
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>Provide details for your package below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contents">Contents</Label>
            <Textarea
              id="contents"
              name="contents"
              value={orderData.contents}
              onChange={handleInputChange}
              placeholder="Describe the package contents"
              required
            />
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="value">Delivery Fee (ETH)</Label>
            <Input
              id="value"
              name="value"
              type="number"
              value={orderData.value}
              onChange={handleInputChange}
              placeholder="Enter delivery value"
              step="0.0001"
              min="0"
              required
            />
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="address">Destination Delivery Address</Label>
            <Input
              id="address"
              name="address"
              value={orderData.address}
              onChange={handleInputChange}
              placeholder="Enter address"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={orderData.description}
              onChange={handleInputChange}
              placeholder="Add any additional details"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Submit Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

