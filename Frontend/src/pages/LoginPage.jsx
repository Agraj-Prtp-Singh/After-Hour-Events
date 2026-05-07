import Navbar from "../components/NavBar";
import LoginCard from "../components/LoginCard";
import Footer from "../components/Footer";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      <div className="flex-grow flex justify-center items-center p-4 pb-20">
        <div className="w-full max-w-md">
          <LoginCard />
        </div>
      </div>

      <Footer />
    </div>
  );
}
