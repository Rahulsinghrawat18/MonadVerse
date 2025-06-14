import { gameContract } from '~/lib/alchemy';
import { useAccount, useReadContract } from 'wagmi';
import { ProfileTable } from './profile-table';

export const ProfileDetails = () => {
  const { address } = useAccount();
  const { data: profileData } = useReadContract({
    abi: gameContract.abi,
    address: gameContract.address,
    functionName: 'getPlayRecords',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
  });

  if (!address) return null;

  console.log("leaderborard",profileData)

  return (
    <div className='absolute top-24 right-1/2 mx-auto w-full max-w-screen-xl translate-x-1/2 rounded-xl bg-[#0b171dd0] px-8 py-6'>
      <div className='font-golondrina text-7xl'>Profile Details</div>
      <ProfileTable
        // @ts-expect-error -- safe for read-only
        data={profileData ?? []}
      />
    </div>
  );
};
