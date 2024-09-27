import { ConnectButton } from "@rainbow-me/rainbowkit";
import "./App.css";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import Poaps from "./components/Poaps";

function App() {
  const account = useAccount();

  useEffect(() => {
    console.log({ account });
  }, []);

  return (
    <div className="h-screen">
      <h1 className="text-3xl pt-6 font-light">hacker bounties</h1>

      {account.address ? (
        <div>
          <Poaps address={account.address} />
        </div>
      ) : (
        <div className="m-auto mt-36 w-fit">
          <ConnectButton />
        </div>
      )}
    </div>
  );
}

export default App;
