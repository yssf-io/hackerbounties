import axios from "axios";
import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbi } from "viem";
import { gnosis } from "viem/chains";
import { useReadContract } from "wagmi";
import BountyInfo from "./BountyInfo";
import { supabase } from "../supabase";

export interface IBountyInfo {
  description: string;
  rewardAmount: number;
  rewardToken: string;
  from: string;
}

const POAP_CONTRACT: `0x${string}` =
  "0x22C1f6050E56d2876009903609a2cC3fEf83B415";
const HACKER_PACK_CONTRACT: `0x${string}` =
  "0x32382a82d9faDc55f971f33DaEeE5841cfbADbE0";
const ALCHEMY_API_KEY = "xuXS9MBUWVvB6Xsh9XIN00spOReFm0Jy";

const isHackerPackHolder = async (wallet: string) => {
  const url = `https://opt-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/isHolderOfContract?wallet=${wallet}&contractAddress=${HACKER_PACK_CONTRACT}`;
  const request = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json" },
  });
  const response = await request.json();
  return response.isHolderOfContract === true;
};

// Hacker Pack contract address

const Poaps = ({ address }: { address: `0x${string}` }) => {
  const { data } = useReadContract({
    abi: parseAbi(["function balanceOf(address owner) view returns(uint256)"]),
    address: POAP_CONTRACT,
    functionName: "balanceOf",
    args: [address],
    chainId: gnosis.id,
  });
  const [poaps, setPoaps] = useState<any[]>([]);
  const [hackerPack, setHackerPack] = useState(false);
  const [bounties, setBounties] = useState<IBountyInfo[]>([]);

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

    setPoaps(poaps);

    setHackerPack(await isHackerPackHolder(address));
  };

  const fetchBounties = async () => {
    const { data: bountiesDb } = await supabase.from("bounties").select();

    if (!bountiesDb) return;

    setBounties(
      bountiesDb.map(({ description, rewardToken, rewardAmount, from }) => {
        return {
          description,
          rewardAmount,
          rewardToken,
          from,
        };
      }),
    );
  };

  useEffect(() => {
    if (data) {
      fetchPoaps(parseInt(data.toString()));
      fetchBounties();
    }
  }, [data]);

  return (
    <div>
      <div className="mt-16 mx-8">
        <p className="mb-8 text-left text-xl font-bold">
          Hacker Pack {hackerPack ? "✅" : "❌"}
        </p>

        <p className="text-gray-700 italic text-left">
          These are mock bounties
        </p>
        {bounties.map((bounty) => (
          <BountyInfo key={bounty.description} {...bounty} />
        ))}
      </div>

      <p className="mt-16 text-left ml-8 mb-8 text-xl font-bold">
        ETHGlobal POAPs
      </p>
      <div className="flex justify-center">
        {poaps.map((p) => (
          <div key={p.name} className="mx-8">
            <img src={p.image_url} alt={p.name} width={256} height={256} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Poaps;
