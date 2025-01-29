import type React from "react"
import { useRef, useState } from "react"
import Webcam from "react-webcam"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Camera, Upload } from "lucide-react"

interface WebcamCaptureModalProps {
  isOpen: boolean
  onClose: () => void
}

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET
const API_ENDPOINT = "http://192.168.167.131:8000/api/verify_package/"

const WebcamCaptureModal: React.FC<WebcamCaptureModalProps> = ({ isOpen, onClose }) => {
  const webcamRef = useRef<Webcam>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [description, setDescription] = useState<string>("")
  const [uploading, setUploading] = useState<boolean>(false)

  const capture = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot()
      setImageSrc(image)
    }
  }

  const uploadToPinata = async () => {
    if (!imageSrc) {
      alert("Please capture an image first.")
      return
    }

    try {
      setUploading(true)

      // Convert Base64 to Blob
      const base64Response = await fetch(imageSrc)
      const blob = await base64Response.blob()

      // Create FormData for Pinata
      const formData = new FormData()
      formData.append("file", blob, "image.jpg")

      // Pinata metadata
      const metadata = JSON.stringify({
        name: "Webcam Capture",
      })
      formData.append("pinataMetadata", metadata)

      const options = JSON.stringify({
        cidVersion: 1,
      })
      formData.append("pinataOptions", options)

      // Upload to Pinata
      const pinataResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      })

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`
      alert(`Image uploaded to IPFS: ${ipfsUrl}`)

      // Send to your API
      const response = await axios.post(API_ENDPOINT, {
        product_description: description,
        image_url: ipfsUrl,
      })

      alert("Image and description submitted successfully!")
      setUploading(false)
      if (response.data.isValidPackage) alert("The package is valid")
      else alert("The package is not valid")
      onClose() // Close modal after submission
    } catch (error) {
      console.error("Error uploading to Pinata or submitting data:", error)
      alert("Failed to upload image or submit data.")
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Capture Package Image</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          {imageSrc ? (
            <div className="space-y-4">
              <img src={imageSrc || "/placeholder.svg"} alt="Captured" className="w-full rounded-md" />
              <Textarea
                placeholder="Enter a description of the package"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-between">
          {!imageSrc ? (
            <Button onClick={capture}>
              <Camera className="mr-2 h-4 w-4" /> Capture
            </Button>
          ) : (
            <Button onClick={capture}>
              <Camera className="mr-2 h-4 w-4" /> Retake
            </Button>
          )}
          {imageSrc && (
            <Button onClick={uploadToPinata} disabled={uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload to Pinata"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default WebcamCaptureModal

