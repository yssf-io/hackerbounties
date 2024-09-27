import { IBountyInfo } from "./Poaps";

const BountyInfo = ({
  description,
  rewardAmount,
  rewardToken,
  from,
}: IBountyInfo) => {
  return (
    <div className="flex border justify-between">
      <p className="w-4/6 text-left border p-1">{description}</p>
      <p className="w-1/6 border text-right p-1">
        {rewardAmount} {rewardToken}
      </p>
      <p className="w-1/6 border text-right p-1">{from}</p>
    </div>
  );
};

export default BountyInfo;
