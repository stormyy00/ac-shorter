import Footer from "@/components/footer";
import URLShortener from "@/components/home";
import Navigation from "@/components/navigation";

const page = () => {
  
  return (
    <div className="w-full flex- flex-col bg-gradient-to-br from-slate-50 to-slate-200">
      <Navigation/>
      <URLShortener />
      <Footer />
    </div>
  );
};

export default page;
