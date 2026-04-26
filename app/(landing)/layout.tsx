import NavBar from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background min-h-screen">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default LandingLayout;
