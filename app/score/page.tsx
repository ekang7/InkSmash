import { FaUser, FaRobot } from "react-icons/fa"; // Import icons from react-icons

export default function GameButtons() {
  return (
    <div className="flex flex-col items-center space-y-6 mt-10">
      {/* Play vs. Friend Button */}
      <button className="flex items-center justify-center w-80 py-6 bg-blue-600 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105">
        <FaUser className="mr-4 text-4xl" />
        <div>
          <span className="block text-sm font-semibold text-blue-300">PLAY VS.</span>
          FRIEND
        </div>
      </button>

      {/* Play vs. Bot Button */}
      <button className="flex items-center justify-center w-80 py-6 bg-blue-600 rounded-xl text-white text-2xl font-bold shadow-lg transform transition-transform hover:scale-105">
        <FaRobot className="mr-4 text-4xl" />
        <div>
          <span className="block text-sm font-semibold text-blue-300">PLAY VS.</span>
          BOT
        </div>
      </button>
    </div>
  );
}
