import React, { useState, useEffect } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useTransaction,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from 'sonner';

const STAKING_CONTRACT_ADDRESS = '0x559A5246aCA43Ba0c19FdEd5b8d95afe48B62D2F';

const STAKING_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_nativeTokenWrapper",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ContractMetadataUnauthorized",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "expected",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "actual",
        "type": "uint256"
      }
    ],
    "name": "CurrencyTransferLibMismatchedValue",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "PermissionsAlreadyGranted",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "expected",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "actual",
        "type": "address"
      }
    ],
    "name": "PermissionsInvalidPermission",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "PermissionsUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "prevURI",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newURI",
        "type": "string"
      }
    ],
    "name": "ContractURIUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "version",
        "type": "uint8"
      }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "RewardTokensDepositedByAdmin",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "RewardTokensWithdrawnByAdmin",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "staker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      }
    ],
    "name": "RewardsClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "staker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokensStaked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "staker",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokensWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newAmount",
        "type": "uint256"
      }
    ],
    "name": "UpdatedMinStakeAmount",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldNumerator",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newNumerator",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldDenominator",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newDenominator",
        "type": "uint256"
      }
    ],
    "name": "UpdatedRewardRatio",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldTimeUnit",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newTimeUnit",
        "type": "uint256"
      }
    ],
    "name": "UpdatedTimeUnit",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractType",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractVersion",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "depositRewardTokens",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRewardRatio",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_numerator",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_denominator",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRewardTokenBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getRoleMember",
    "outputs": [
      {
        "internalType": "address",
        "name": "member",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleMemberCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "count",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_staker",
        "type": "address"
      }
    ],
    "name": "getStakeInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_tokensStaked",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_rewards",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTimeUnit",
    "outputs": [
      {
        "internalType": "uint80",
        "name": "_timeUnit",
        "type": "uint80"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRoleWithSwitch",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_defaultAdmin",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_contractURI",
        "type": "string"
      },
      {
        "internalType": "address[]",
        "name": "_trustedForwarders",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "_rewardToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_stakingToken",
        "type": "address"
      },
      {
        "internalType": "uint80",
        "name": "_timeUnit",
        "type": "uint80"
      },
      {
        "internalType": "uint256",
        "name": "_rewardRatioNumerator",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_rewardRatioDenominator",
        "type": "uint256"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "forwarder",
        "type": "address"
      }
    ],
    "name": "isTrustedForwarder",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes[]",
        "name": "data",
        "type": "bytes[]"
      }
    ],
    "name": "multicall",
    "outputs": [
      {
        "internalType": "bytes[]",
        "name": "results",
        "type": "bytes[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardTokenDecimals",
    "outputs": [
      {
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_uri",
        "type": "string"
      }
    ],
    "name": "setContractURI",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_numerator",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_denominator",
        "type": "uint256"
      }
    ],
    "name": "setRewardRatio",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint80",
        "name": "_timeUnit",
        "type": "uint80"
      }
    ],
    "name": "setTimeUnit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "stakers",
    "outputs": [
      {
        "internalType": "uint128",
        "name": "timeOfLastUpdate",
        "type": "uint128"
      },
      {
        "internalType": "uint64",
        "name": "conditionIdOflastUpdate",
        "type": "uint64"
      },
      {
        "internalType": "uint256",
        "name": "amountStaked",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "unclaimedRewards",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "stakersArray",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakingToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakingTokenBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakingTokenDecimals",
    "outputs": [
      {
        "internalType": "uint16",
        "name": "",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      }
    ],
    "name": "withdrawRewardTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]

export const StakingPage = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [stats, setStats] = useState({
    totalStaked: 0n,
    userStaked: 0n,
    availableRewards: 0n,
    stakingPeriod: 30,
  });

  const { writeContract: stake, data: stakeData } = useWriteContract();
  const { writeContract: unstake, data: unstakeData } = useWriteContract();
  const { writeContract: claimRewards, data: claimData } = useWriteContract();

  const { isLoading: isStaking } = useTransaction({ hash: stakeData });
  const { isLoading: isUnstaking } = useTransaction({ hash: unstakeData });
  const { isLoading: isClaiming } = useTransaction({ hash: claimData });

  const fetchStats = async () => {
    if (!address) return;

    try {
      const totalStaked = await fetchRead('stakingTokenBalance');
      const [userStaked, rewards] = await fetchRead('getStakeInfo', [address]);

      setStats({
        totalStaked: BigInt(totalStaked ?? 0),
        userStaked: BigInt(userStaked ?? 0),
        availableRewards: BigInt(rewards ?? 0),
        stakingPeriod: 30,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchRead = async (functionName: string, args: any[] = []) => {
    const { readContract } = await import('wagmi/actions');
    return readContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_CONTRACT_ABI,
      functionName,
      args,
    });
  };

  useEffect(() => {
    fetchStats();
  }, [address]);

  const handleStake = async () => {
    if (!isConnected) return toast.error('Connect wallet first');
    if (!amount || parseFloat(amount) <= 0) return toast.error('Invalid amount');

    try {
      stake({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'stake',
        args: [parseEther(amount)],
      });
      setAmount('');
    } catch (err) {
      toast.error('Failed to stake tokens');
    }
  };

  const handleUnstake = () => {
    if (!isConnected) return toast.error('Connect wallet first');

    try {
      unstake({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'unstake',
        args: [],
      });
    } catch (err) {
      toast.error('Failed to unstake tokens');
    }
  };

  const handleClaimRewards = () => {
    if (!isConnected) return toast.error('Connect wallet first');

    try {
      claimRewards({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'claimRewards',
        args: [],
      });
    } catch (err) {
      toast.error('Failed to claim rewards');
    }
  };

  useEffect(() => {
    if (!stakeData && !unstakeData && !claimData) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 4000);

    return () => clearInterval(interval);
  }, [stakeData, unstakeData, claimData]);

  return (
    <div className="absolute top-24 right-1/2 mx-auto w-full max-w-screen-xl translate-x-1/2 rounded-xl bg-[#0b171dd0] px-8 py-10">
      <div className="font-golondrina text-7xl mb-10">Stake Your BabyMonad Tokens</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="p-6 bg-[#0b171d] border-[#1a2a35]">
          <h3 className="text-sm text-gray-400 mb-3">Total Staked</h3>
          <p className="text-2xl font-semibold text-white">10 BMD</p>
        </Card>

        <Card className="p-6 bg-[#0b171d] border-[#1a2a35]">
          <h3 className="text-sm text-gray-400 mb-3">Your Stake</h3>
          <p className="text-2xl font-semibold text-white">1 BMD</p>
        </Card>

        <Card className="p-6 bg-[#0b171d] border-[#1a2a35]">
          <h3 className="text-sm text-gray-400 mb-3">Available Rewards</h3>
          <p className="text-2xl font-semibold text-white">{formatEther(stats.availableRewards)} WMND</p>
        </Card>

        <Card className="p-6 bg-[#0b171d] border-[#1a2a35]">
          <h3 className="text-sm text-gray-400 mb-3">Staking Period</h3>
          <p className="text-2xl font-semibold text-white">{stats.stakingPeriod} days</p>
        </Card>
      </div>

      <Card className="max-w-xl mx-auto p-8 bg-[#0b171d] border-[#1a2a35]">
        <div className="space-y-8">
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to stake"
              className="pr-20 bg-[#0b171d] border-[#1a2a35] text-white h-12"
              disabled={isStaking || isUnstaking || isClaiming}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">BMD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Button
              onClick={handleStake}
              disabled={isStaking || isUnstaking || isClaiming || !amount}
              className="w-full bg-[#1a2a35] text-white h-12"
            >
              {isStaking ? 'Staking...' : 'Stake Tokens'}
            </Button>

            <Button
              onClick={handleUnstake}
              disabled={isStaking || isUnstaking || isClaiming || stats.userStaked === 0n}
              variant="outline"
              className="w-full border-[#1a2a35] text-white h-12"
            >
              {isUnstaking ? 'Unstaking...' : 'Unstake Tokens'}
            </Button>

            <Button
              onClick={handleClaimRewards}
              disabled={isStaking || isUnstaking || isClaiming || stats.availableRewards === 0n}
              variant="secondary"
              className="w-full bg-[#1a2a35] text-white h-12"
            >
              {isClaiming ? 'Claiming...' : 'Claim Rewards'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};