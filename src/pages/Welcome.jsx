import { Link } from "react-router-dom";

const Welcome = () => {
    console.log("home page loaded");
  return (
    <div className="w-screen n flex flex-col items-center justify-center px-6 py-16 text-center">
      
      {/* Introduction Section */}
      <section className="max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to SubTrack</h1>
        <p className="text-lg text-gray-700 mb-6">
        Effortlessly manage your recurring payments with SubTrack – your all-in-one subscription management hub. 
        Whether you're a business automating subscription billing or an individual keeping tabs on your expenses, 
        our platform is designed to simplify every step of the process.
        </p>
        
        {/* Links Section */}
        <div className="space-x-4">
            <Link
              to="/signup"
              className="bg-primary text-white font-semibold py-2 px-4 rounded-md transition border-[3px] border-transparent hover:bg-white hover: text-primary hover:border-[3px] hover:border-primary"
            >
              Create an Account
            </Link>
            <Link
              to="/login"
              className="bg-gray-300 text-black font-semibold py-2 px-4 rounded-md hover:bg-gray-400 transition"
            >
              Log In
            </Link>
          </div>
      </section>

      {/* About Section */}
      <section className="max-w-2xl mt-12">
        <h2 className="text-xl font-semibold mb-4">About</h2>
        <p className="text text-gray-700">
        SubTrack is an innovative platform developed as an honors project to explore scalable subscription management solutions. 
        This app empowers users to create dynamic subscription plans, manage payments seamlessly, and track recurring expenses with ease. 
        Imagine the creativity of Patreon combined with the marketplace efficiency of Fiverr – 
        that's SubTrack, where you can set your own prices and bring your service vision to life.
        </p>
        <p className="text text-gray-700 mt-4">
          Developed by Zanou Rih, a software developer passionate about Web and product design, as well as UX.
        </p>
      </section>

      <footer className="bg-white py-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          © {new Date().getFullYear()} SubTrack. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
