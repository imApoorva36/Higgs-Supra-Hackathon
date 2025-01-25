"use client"

import { useState, useEffect } from "react"
import { Package, Truck, CheckCircle, AlertCircle, Plus, Search } from "lucide-react"
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

export interface PackageInterface {
  id: number
  cid: string
  metadata: string
  delivered: boolean
  fundsReleased: boolean
  funds: number
}


const mockPackages = [
  { id: 1, cid: "Qm...1", metadata: "Books", delivered: false, fundsReleased: false, funds: 0.01 },
  { id: 2, cid: "Qm...2", metadata: "Electronics", delivered: true, fundsReleased: false, funds: 0.05 },
  { id: 3, cid: "Qm...3", metadata: "Clothing", delivered: true, fundsReleased: true, funds: 0.02 },
]

export default function CustomerDashboard() {
  const [packages, setPackages] = useState<PackageInterface[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setIsLoading(true)
        setTimeout(() => setPackages(mockPackages), 1000)
      } catch (error) {
        console.error("Error fetching packages:", error)
        setPackages(mockPackages)
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
    setPackages((prevPackages) =>
      prevPackages.map((pkg) => (pkg.id === packageId ? { ...pkg, fundsReleased: true } : pkg)),
    )
    actuateServo()
  }

  const actuateServo = async () => {
    try {
      const response = await axios.get(`http://192.168.167.131:8000/api/servo/`)
      console.log(response.data)
    } catch (error) {
      console.error("Error activating servo:", error)
    }
  }

  const readRFID = async (packageId: number) => {
    try {
      const response = await axios.get(`http://192.168.167.131:8000/api/get_tag/`)
      const { tag_id: rfidFromAPI } = response.data
      console.log(`Fetched RFID: ${rfidFromAPI}`)
      handleOpenBox(packageId)
    } catch (error) {
      console.error("Error reading RFID:", error)
    }
  }

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.metadata.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.cid.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <>
      <nav className="bg-primary p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image src="/box3-diag.png" alt="Box3 Logo" width={32} height={32} />
            <div className="text-white text-lg font-bold">Customer Dashboard</div>
          </div>
          <div className="text-white">
            <span className="font-bold">Wallet:</span> 0x1234...abcd
          </div>
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

        <DashboardStats packages={packages} />

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
              <Card key={pkg.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Package #{pkg.id}</span>
                    <Badge variant="secondary" className="flex items-center">
                      {getStatusIcon(pkg.delivered, pkg.fundsReleased)}
                      <span className="ml-2">{getStatusText(pkg.delivered, pkg.fundsReleased)}</span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>CID: {pkg.cid}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Contents:</strong> {pkg.metadata}
                  </p>
                  <p>
                    <strong>Value:</strong> {pkg.funds} ETH
                  </p>
                </CardContent>
                <CardFooter>
                  {pkg.delivered && !pkg.fundsReleased && <Button onClick={() => readRFID(pkg.id)}>Open Box</Button>}
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
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setOrderData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!orderData.contents || !orderData.value || !orderData.description) {
      alert("Please fill in all required fields")
      return
    }
    console.log("Order submitted:", orderData)
    setOrderData({ contents: "", value: 0, description: "" })
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
          <div className="space-y-2">
            <Label htmlFor="value">Value (ETH)</Label>
            <Input
              id="value"
              name="value"
              type="number"
              value={orderData.value}
              onChange={handleInputChange}
              placeholder="Enter package value"
              step="0.0001"
              min="0"
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

