import React from "react";
import gym from "../../images/gym.png";

export default function Login() {
  return (
    <div className="h-screen w-screen flex">
      
      <div className="w-full h-full flex flex-col md:flex-row">
        
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-[#3a0d0d] to-[#7a1c1c] p-4 sm:p-6 md:p-10">
          
          <div className="bg-[#2a0c0c]/80 p-6 sm:p-8 md:p-10 rounded-2xl w-full max-w-md lg:max-w-xl text-white shadow-2xl">
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              FitManager
            </h1>

            <p className="text-sm sm:text-base text-gray-300 mb-6 md:mb-8">
              Connectez-vous pour gérer votre salle de sport
            </p>

            {/* Username */}
            <div className="mb-4 md:mb-6">
              <label className="text-sm sm:text-base">Nom d'utilisateur</label>
              <input
                type="text"
                placeholder="votre@email.com"
                className="w-full mt-2 p-3 sm:p-4 text-base sm:text-lg rounded-lg bg-transparent border border-gray-400 focus:outline-none"
              />
            </div>

            {/* Password */}
            <div className="mb-4 md:mb-6">
              <label className="text-sm sm:text-base">Mot de passe</label>
              <input
                type="password"
                placeholder="********"
                className="w-full mt-2 p-3 sm:p-4 text-base sm:text-lg rounded-lg bg-transparent border border-gray-400 focus:outline-none"
              />
            </div>

            {/* Options */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm mb-6 gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="scale-110" />
                Se souvenir de moi
              </label>
              <span className="text-gray-300 cursor-pointer">
                Mot de passe oublié ?
              </span>
            </div>

            {/* Button */}
            <button className="w-full bg-red-600 hover:bg-red-700 transition p-3 sm:p-4 text-base sm:text-lg rounded-lg font-semibold">
              Se Connecter
            </button>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 relative h-64 md:h-auto">
          
          <img
            src={gym}
            alt="gym"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-[#7a1c1c]/60 flex flex-col justify-center p-6 sm:p-10 md:p-12 text-white">
            
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              Gérez votre salle de sport efficacement
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-gray-200 mb-6 md:mb-10 max-w-lg">
              Suivez vos adhérents, gérez les abonnements,
              optimisez vos séances et boostez votre rentabilité.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              
              <div className="bg-white/20 p-4 sm:p-6 rounded-xl backdrop-blur">
                <h3 className="text-xl sm:text-2xl font-bold">500+</h3>
                <p className="text-xs sm:text-sm">Adhérents actifs</p>
              </div>

              <div className="bg-white/20 p-4 sm:p-6 rounded-xl backdrop-blur">
                <h3 className="text-xl sm:text-2xl font-bold">95%</h3>
                <p className="text-xs sm:text-sm">Taux de satisfaction</p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}