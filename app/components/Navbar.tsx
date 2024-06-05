"use client"
import { RxHamburgerMenu } from "react-icons/rx";
import { Button } from "./ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  return (
    <nav className="bg-white z-50 border-gray-200 bg-slate-800 borbder-b shadow-lg">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div
          onClick={() => router.push("/")}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          {/* <img
            src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713647295/standardboard.1d6f9426_asqzum.png"
            className="h-8"
            alt="plinkoo Logo"
          /> */}
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Plynnko.TrustMeGuys
          </span>
        </div>
        <Button
          data-collapse-toggle="navbar-default"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm  rounded-lg md:hidden focus:outline-none focus:ring-2 dark:text-gray-400 dark:hover:bg-gray-200 dark:focus:ring-gray-600 bg-transparent"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <span className="sr-only">Open main menu</span>
          <RxHamburgerMenu size={30} />
        </Button>{" "}
        <div
          className={`w-full lg:hidden flex flex-col md:w-auto items-center ${
            isMenuOpen ? "" : "hidden"
          }`} 
          id="navbar-default"
        >
          <Button
            className="bg-transparent mx-4 hover:bg-black w-[50%]"
            onClick={() => router.push("/Simulation")}
          >
            Simulation
          </Button>
          <Button
            className="bg-transparent mx-4 hover:bg-black w-[50%]"
            onClick={() => router.push("/Game")}
          >
            Game
          </Button>
        </div>
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <Button
            className="bg-transparent mx-4 hover:bg-black"
            onClick={() => router.push("/Simulation")}
          >
            Simulation
          </Button>
          <Button
            className="bg-transparent mx-4 hover:bg-black"
            onClick={() => router.push("/Game")}
          >
            Game
          </Button>
        </div>
      </div>
    </nav>
  );
};