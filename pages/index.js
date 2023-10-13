import Image from "next/image";
import HeroImage from "../public/hero.webp";
import { Logo } from "../components/Logo";
import Link from "next/link";

export default function Home() {
  

  return (
    <>
      <div className="w-screen h-screen overflow-hidden flex justify-center items-center relative">

        <Image src={HeroImage} alt="Hero Image" fill objectFit="cover" className="absolute"/>
        <div className="relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-sm">
          <Logo />        
          <p>
            Th AI-powered SAAS solution to generate SEO-optimized 
            blog post in seconds. Get high-quality content, whithout sacrificing your time.
          </p>
          <Link href="/post/new" className="btn">Begin</Link>
        </div>

      </div>
    </>
  )
}
