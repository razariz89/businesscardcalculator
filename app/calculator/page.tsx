import { Suspense } from "react"
import BusinessCardCalculator from "@/components/business-card-calculator"

function CalculatorContent() {
  return <BusinessCardCalculator />
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <CalculatorContent />
      </Suspense>
    </main>
  )
}
