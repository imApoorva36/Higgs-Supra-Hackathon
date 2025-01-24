'use client'

import { useState } from 'react'
import { Truck, User, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import axios from 'axios'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [rfid, setRfid] = useState('Fetching Your String...')
  const [provider, setProvider] = useState<any>()
  const router = useRouter()
  const [role, setRole] = useState("")
  const [account, setAccount] = useState("")


  const connectStarKeyWallet = async () => {
    if(!('starkey' in window)) {
      window.alert("StarKey Wallet not installed!")
      window.open('https://starkey.app/', '_blank')
      return
    }
    const provider = window.starkey?.supra
    if (provider) {
      setProvider(provider)
      try {
        const accounts = await provider.connect();
        setAccount(accounts[0])
      } catch (error) {
        window.alert(`Error connecting wallet: ${error}`)
      }
    }
  }

  const disconnectStarKeyWallet = async () => {
    if(provider) {
      await provider.disconnect();
      setAccount("")
    }
  }

  const scanRFID = async () => {
    try {
      const response = await axios.post(`http://192.168.167.131:8000/api/create_tag/`)
      setRfid(response.data.tag_id)
    } catch (error) {
      console.log(error)
      alert('Error generating key..')
    }
  }

  const handleRegister = async () => {
    if (!account || !rfid || !role) {
      alert('Please complete all steps before registering.')
      return
    }

    setIsLoading(true)
    try {
      // Registration logic here
      if (role === "1") {
        router.push('/customer-dashboard')
      } else {
        router.push('/agent-dashboard')
      }
    } catch (error) {
      console.error('Error during registration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      title: "Connect Wallet",
      content: (
        <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Connect Your StarKey Wallet</h2>
        <Button 
          className="w-full py-2 mb-2 rounded-lg hover:bg-primarydark text-white" 
          onClick={!account ? connectStarKeyWallet : disconnectStarKeyWallet}
        >
          {account ? "Disconnect StarKey Wallet" : "Connect StarKey Wallet"}
        </Button>
        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
          <div className={`w-3 h-3 rounded-full ${account ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            Status: {account ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </div>
      )
    },
    {
      title: "Choose Role",
      content: (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Select Your Role</h2>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Choose your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1" className="cursor-pointer">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>Customer</span>
                </div>
              </SelectItem>
              <SelectItem value="2" className="cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Delivery Agent</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      title: "RFID Setup",
      content: (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Set Up RFID</h2>
          <Input
            id="rfidData"
            placeholder="Scan RFID data"
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
            disabled={true}
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none disabled:bg-gray-200 disabled:text-gray-500"
          />
          <Button className='w-full py-2 mb-2 rounded-lg hover:bg-primarydark text-white' onClick={scanRFID}>
            Scan RFID
          </Button>
        </div>
      )
    }
  ]

  return (
    <>
      {/* Wallet Address Display */}
      {account && (
        <div className="fixed top-4 left-4 shadow-md rounded-full bg-primary p-2">
          <div className="flex items-center space-x-2 px-2">
            {/* <div className="w-2 h-2 bg-green-500 rounded-full"></div> */}
            <Image src="/starkey.png" alt="StarKey Logo" width={40} height={40} />
            <span className="text-sm text-white font-semibold">
              {`${account.slice(0, 6)}...${account.slice(-4)}`}
            </span>
          </div>
        </div>
      )}

      <div className="min-h-screen rounded container mx-auto pt-28 py-10 bg-gray-100 dark:bg-gray-900 items-center justify-center">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-center mb-8">
            <Image src="/box3-diag.png" alt="BOX3 Logo" width={60} height={60} />
            <h1 className="text-3xl font-bold ml-4">BOX3 Onboarding</h1>
          </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded  ${
                  index < currentStep ? 'bg-primary' : 'bg-gray-200'
                } ${index !== steps.length - 1 ? 'mr-1' : ''}`}
              />
            ))}
          </div>
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex-1 text-center font-medium text-xs ${index !== steps.length - 1 ? 'mr-1' : ''}`}
              >
                <span
                  className={`${
                    index < currentStep ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

          {/* Step Content */}
          <div className="mb-8">
            {steps[currentStep - 1].content}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 text-white">
            <Button
              onClick={() => setCurrentStep(curr => curr - 1)}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            {currentStep === steps.length ? (
              <Button
                onClick={handleRegister}
                disabled={isLoading || !account || !rfid || !role}
                className="flex items-center"
              >
                {isLoading ? 'Registering...' : 'Complete'}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setCurrentStep(curr => curr + 1)
                }}
                className="flex items-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}