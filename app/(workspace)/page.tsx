import Companies from "@/components/general/companies";
import Footer from "@/components/general/footer";
import Hero from "@/components/general/hero";
import Navbar from "@/components/general/navbar";

export default function Home() {
  return (
    <div className="relative px-4 py-6 mx-auto w-full overflow-hidden">
      <Navbar />

      <div className="flex flex-col gap-24 lg:gap-44 mt-32 mb-14 lg:my-28  mx-auto w-full">
        <div className="flex flex-col gap-24 lg:gap-12">
          <Hero />
          <Companies />
        </div>

        <Footer />
      </div>
    </div>
  );
}
