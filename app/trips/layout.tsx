import NavBar from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

const TripsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default TripsLayout;
