import axios from "axios";
import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbi } from "viem";
import { gnosis } from "viem/chains";
import { useReadContract } from "wagmi";

const POAP_CONTRACT: `0x${string}` =
  "0x22C1f6050E56d2876009903609a2cC3fEf83B415";

const Poaps = ({ address }: { address: `0x${string}` }) => {
  const { data } = useReadContract({
    abi: parseAbi(["function balanceOf(address owner) view returns(uint256)"]),
    address: POAP_CONTRACT,
    functionName: "balanceOf",
    args: [address],
    chainId: gnosis.id,
  });
  const [poaps, setPoaps] = useState<any[]>([]);

  const fetchPoaps = async (amount: number) => {
    const pc = createPublicClient({
      chain: gnosis,
      transport: http(),
    });
    const poaps = (
      await Promise.all(
        Array.from(Array(amount).keys()).map(async (i) => {
          const poap = await pc.readContract({
            abi: parseAbi([
              "function tokenOfOwnerByIndex(address owner, uint256 index) view returns(uint256)",
            ]),
            address: POAP_CONTRACT,
            functionName: "tokenOfOwnerByIndex",
            args: [address, BigInt(i)],
          });

          const metadataURL = await pc.readContract({
            abi: parseAbi([
              "function tokenURI(uint256 tokenId) view returns(string)",
            ]),
            address: POAP_CONTRACT,
            functionName: "tokenURI",
            args: [poap],
          });

          const metadata = (await axios.get(metadataURL)).data;

          if (metadata.name.toLowerCase().includes("ethglobal")) {
            return metadata;
          }

          return undefined;
        }),
      )
    ).filter((p) => p !== undefined);

    console.log({ poaps });
    setPoaps(poaps);
  };

  useEffect(() => {
    console.log({ data });

    if (data) {
      fetchPoaps(parseInt(data.toString()));
    }
  }, [data]);

  return (
    <div className="flex justify-center mt-16">
      {poaps.map((p) => (
        <div key={p.name} className="mx-8">
          <img src={p.image_url} alt={p.name} width={256} height={256} />
        </div>
      ))}
    </div>
  );
};

export default Poaps;
