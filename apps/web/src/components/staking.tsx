import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from 'sonner';

// TODO: Replace with actual contract address and ABI
const STAKING_CONTRACT_ADDRESS = '0x...';
//const DNG_TOKEN_ADDRESS = '0x0dD2B638b6975d5bB755554AAE8e5f52De570FDd';

interface StakingStats {
  totalStaked: bigint;
  userStaked: bigint;
  availableRewards: bigint;
  stakingPeriod: number;
}

export const StakingPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>('');
  const [stats, setStats] = useState<StakingStats>({
    totalStaked: 0n,
    userStaked: 0n,
    availableRewards: 0n,
    stakingPeriod: 30,
  });

  // Contract reads
  const { data: totalStaked } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: [], // TODO: Add contract ABI
    functionName: 'totalStaked',
  });

  const { data: userStaked } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: [], // TODO: Add contract ABI
    functionName: 'userStake',
    args: [address],
  });

  const { data: rewards } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: [], // TODO: Add contract ABI
    functionName: 'getRewards',
    args: [address],
  });

  // Contract writes
  const { writeContract: stake, data: stakeData } = useWriteContract();
  const { writeContract: unstake, data: unstakeData } = useWriteContract();
  const { writeContract: claimRewards, data: claimData } = useWriteContract();

  // Transaction status
  const { isLoading: isStaking } = useTransaction({
    hash: stakeData ?? undefined,
  });

  const { isLoading: isUnstaking } = useTransaction({
    hash: unstakeData ?? undefined,
  });

  const { isLoading: isClaiming } = useTransaction({
    hash: claimData ?? undefined,
  });

  useEffect(() => {
    const newStats = {
      totalStaked: typeof totalStaked === 'bigint' ? totalStaked : 0n,
      userStaked: typeof userStaked === 'bigint' ? userStaked : 0n,
      availableRewards: typeof rewards === 'bigint' ? rewards : 0n,
      stakingPeriod: 30, // TODO: Get from contract
    };
    setStats(newStats);
  }, [totalStaked, userStaked, rewards]);

  const handleStake = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      stake({
        address: STAKING_CONTRACT_ADDRESS,
        abi: [], // TODO: Add contract ABI
        functionName: 'stake',
        args: [parseEther(amount)],
      });
      setAmount('');
    } catch (error) {
      console.error('Error staking tokens:', error);
      toast.error('Failed to stake tokens');
    }
  };

  const handleUnstake = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      unstake({
        address: STAKING_CONTRACT_ADDRESS,
        abi: [], // TODO: Add contract ABI
        functionName: 'unstake',
      });
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      toast.error('Failed to unstake tokens');
    }
  };

  const handleClaimRewards = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      claimRewards({
        address: STAKING_CONTRACT_ADDRESS,
        abi: [], // TODO: Add contract ABI
        functionName: 'claimRewards',
      });
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error('Failed to claim rewards');
    }
  };

  return (
    <div className="absolute top-24 right-1/2 mx-auto w-full max-w-screen-xl translate-x-1/2 rounded-xl bg-[#0b171dd0] px-8 py-10">
      <div className="font-golondrina text-7xl mb-10">Stake Your BabyMonad Tokens</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="p-6 bg-[#0b171d] border-[#1a2a35] hover:border-[#2a3a45] transition-colors">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Total Staked</h3>
          <p className="text-2xl font-semibold text-white">
            {formatEther(stats.totalStaked)} DNG
          </p>
        </Card>

        <Card className="p-6 bg-[#0b171d] border-[#1a2a35] hover:border-[#2a3a45] transition-colors">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Your Stake</h3>
          <p className="text-2xl font-semibold text-white">
            {formatEther(stats.userStaked)} DNG
          </p>
        </Card>

        <Card className="p-6 bg-[#0b171d] border-[#1a2a35] hover:border-[#2a3a45] transition-colors">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Available Rewards</h3>
          <p className="text-2xl font-semibold text-white">
            {formatEther(stats.availableRewards)} DNG
          </p>
        </Card>

        <Card className="p-6 bg-[#0b171d] border-[#1a2a35] hover:border-[#2a3a45] transition-colors">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Staking Period</h3>
          <p className="text-2xl font-semibold text-white">{stats.stakingPeriod} days</p>
        </Card>
      </div>

      <Card className="max-w-xl mx-auto p-8 bg-[#0b171d] border-[#1a2a35] hover:border-[#2a3a45] transition-colors">
        <div className="space-y-8">
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to stake"
              className="pr-20 bg-[#0b171d] border-[#1a2a35] text-white placeholder:text-gray-500 h-12 focus:border-[#2a3a45] focus:ring-1 focus:ring-[#2a3a45]"
              disabled={isStaking || isUnstaking || isClaiming}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              DNG
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Button
              onClick={handleStake}
              disabled={isStaking || isUnstaking || isClaiming || !amount}
              className="w-full bg-[#1a2a35] hover:bg-[#2a3a45] text-white h-12 transition-colors"
            >
              {isStaking ? 'Staking...' : 'Stake Tokens'}
            </Button>

            <Button
              onClick={handleUnstake}
              disabled={isStaking || isUnstaking || isClaiming || stats.userStaked === 0n}
              variant="outline"
              className="w-full border-[#1a2a35] text-white hover:bg-[#1a2a35] h-12 transition-colors"
            >
              {isUnstaking ? 'Unstaking...' : 'Unstake Tokens'}
            </Button>

            <Button
              onClick={handleClaimRewards}
              disabled={isStaking || isUnstaking || isClaiming || stats.availableRewards === 0n}
              variant="secondary"
              className="w-full bg-[#1a2a35] hover:bg-[#2a3a45] text-white h-12 transition-colors"
            >
              {isClaiming ? 'Claiming...' : 'Claim Rewards'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}; 