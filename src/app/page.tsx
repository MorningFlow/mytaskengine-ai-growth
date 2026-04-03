import Hero from '@/components/sections/Hero'
import TrustBar from '@/components/sections/TrustBar'
import ProblemSection from '@/components/sections/ProblemSection'
import HowItWorks from '@/components/sections/HowItWorks'
import IndustrySelector from '@/components/sections/IndustrySelector'
import ServicesGrid from '@/components/sections/ServicesGrid'
import ROICalculator from '@/components/sections/ROICalculator'
import BeforeAfter from '@/components/sections/BeforeAfter'
import Testimonials from '@/components/sections/Testimonials'
import FAQ from '@/components/sections/FAQ'
import FinalCTA from '@/components/sections/FinalCTA'

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <ProblemSection />
      <HowItWorks />
      <IndustrySelector />
      <ServicesGrid />
      <ROICalculator />
      <BeforeAfter />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </main>
  )
}
