"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { ChevronLeft, ChevronRight, Truck, User } from "lucide-react"
import Image from "next/image";
import { useAppContext } from "./AppContext";
import { connectWallet, disconnectWallet } from "@/lib/smart_contract_utils";
import { disconnect } from "process";

interface StarkeyWindow extends Window {
    starkey?: {
        supra?: any;
    };
}

declare let window: StarkeyWindow;

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [rfid, setRfid] = useState('Fetching Your String...')
    const router = useRouter()
    const {role, setRole} = useAppContext();
    const {account, setAccount} = useAppContext();

    useEffect(() => {
        const savedAccount = sessionStorage.getItem('starkeyAccount');
        if (savedAccount) {
            setAccount(savedAccount);
        }
    }, [setAccount]);


    const connectStarKeyWallet = async () => {
        console.log('Connecting wallet...')
        const accounts = await connectWallet();
        console.log('Accounts:', accounts)
        setAccount(accounts[0])
    }

    const disconnectStarKeyWallet = async () => {
       await disconnectWallet()
    }

    const scanRFID = async () => {
        try {
            const response = await fetch(`http://192.168.82.132:8000/api/create_tag/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
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
            {account && (
                <div className="fixed top-4  md:right-4 shadow-md rounded-full bg-primary p-2">
                    <div className="flex items-center space-x-2 px-2">
                        <Image src="/starkey.png" alt="StarKey Logo" width={32} height={32} />
                        <span className="text-sm text-white font-semibold">
                            {`${account.slice(0, 6)}...${account.slice(-4)}`}
                        </span>
                    </div>
                </div>
            )}
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card className="overflow-y-scroll mt-5">
                    <CardContent className="grid p-0 md:grid-cols-2 h-[calc(100vh-10rem)]">
                        <div className="flex flex-col gap-6 m-10">
                            <div className="mb-8">
                                <div className="flex items-center justify-center mb-8">
                                    <Image src="/box3-diag.png" alt="SupraTag Logo" width={60} height={60} />
                                    <h1 className="text-2xl md:text-3xl ml-4">SupraTag</h1>
                                </div>
                                <div className="flex justify-between mb-2">
                                    {steps.map((step, index) => (
                                        <div
                                            key={index}
                                            className={`flex-1 h-2 rounded  ${index < currentStep ? 'bg-primary' : 'bg-gray-200'
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
                                                className={`${index < currentStep ? 'text-primary' : 'text-gray-400'
                                                    }`}
                                            >
                                                {step.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                {steps[currentStep - 1].content}
                            </div>

                            <div className="flex justify-between text-white">
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
                        <div className="relative hidden bg-muted md:block">
                            <img
                                src="/box-secure.png"
                                alt="Image"
                                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                            />
                        </div>
                    </CardContent>
                </Card>
                <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                    By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                    and <a href="#">Privacy Policy</a>.
                </div>
            </div>
        </>
    )
}