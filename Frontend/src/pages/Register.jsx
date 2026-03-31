import Navbar from "../components/NavBar";
import RegisterCard from "../components/RegisterCard";
import Footer from "../components/Footer";

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar variant="back" />

      <div className="flex-grow flex justify-center items-center p-4">
        <div className="w-full max-w-md">
          <RegisterCard />
        </div>
      </div>

      <Footer />
    </div>
  );
}
