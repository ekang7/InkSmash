export default function Lose() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold">You Lose</h1>
      <p className="text-2xl">Better luck next time</p>
      <FaSquare className="text-6xl text-red-500 my-4" />
      <Link href="/">
        <a className="text-blue-500 underline">Try Again</a>
      </Link>
    </div>
  );
}
