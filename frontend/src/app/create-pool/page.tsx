"use client"
import { useEffect, useState } from 'react'
import lendingMarketAbi from "../../../../smartContract/abi/lendingMarket.json"
import { useWriteContract } from 'wagmi'
import { useSimulateContract } from 'wagmi'
import { readContract } from 'viem/actions'
import { config } from '../../../wagmi'
import { getAllPools } from '../../components/main/readings'

const CreatePool = () => {
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [allPools, setAllPools] = useState<any>([])

  const lendingMarketPoolAddress = '0x39b5cc2629610140195F616c6a75978a1640701c'

  const { data: createPoolData, isLoading: createPoolIsLoading, isSuccess: createPoolIsSuccess, error: createPoolError } = useSimulateContract({
    address: lendingMarketPoolAddress,
    abi: lendingMarketAbi,
    functionName: 'createPool',
    args: [tokenSymbol, tokenAddress],
  })

  console.log(createPoolData, createPoolIsLoading, createPoolIsSuccess, createPoolError)
  const fetchData = async () => {
    try {
      const allPools: string[] = await getAllPools(config, tokenSymbol, tokenAddress);
      setAllPools(allPools)

      console.log("allPools", allPools);

    } catch (error) {
      console.error(error);
    }
  }

  const { writeContract } = useWriteContract()

  useEffect(() => {
    fetchData()
  }, [allPools])


  return (
    <div className='h-96 flex pt-32'>
      <div className=' flex flex-col align-middle justify-center items-center h-[300px] '>
        {/* <form action=""  className='flex flex-col py-5 items-center'> */}
        <div className='flex flex-col mb-5'>
          <label htmlFor="tokenSymbol" className='text-[#64d6f4] font-bold text-2xl mb-1'>Token Symbol</label>
          <input type="text" placeholder="Token Symbol" name="tokenSymbol" id="tokenSymbol" onChange={(e) => setTokenSymbol(e.target.value)} value={tokenSymbol} className='w-[300px] rounded h-[40px]' />
        </div>
        <div className='flex flex-col mb-5'>
          <label htmlFor="tokenAddress" className='text-[#64d6f4] font-bold text-2xl mb-1'>Token Address</label>
          <input type="text" placeholder="Token Address" name="tokenAddress" id="tokenAddress" onChange={(e) => setTokenAddress(e.target.value)} value={tokenAddress} className='w-[300px] rounded h-[40px]' />
        </div>
        <button className='bg-[#64d6f4] mt-5 text-white hover:bg-[#339ad5] font-bold py-2 px-4 rounded w-[300px]' onClick={() => writeContract(createPoolData?.request as any)}>{createPoolIsLoading ? "Loading..." : "Create Pool"}</button>
        {
          createPoolError && createPoolError.message.includes("Pool for the token is created") && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full mt-5" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">This pool is already created</span>
            </div>
          )
        }
      </div>

      <div className='text-white mx-auto w-[300px]  h-[1000px] my-7 '>
        {allPools.length > 0 && (
          <div className=''>
            <div className=' flex flex-col gap-5 justify-center border rounded h-[250px] flex-wrap'>
              {allPools.map((pool) => (
                <div className='ml-5' key={pool}>
                  {/* <img src={pool.sym} alt="" className="w-10 h-10" /> */}
                  <h2 className="text-2xl font-bold ">{pool}</h2>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      {/* </form> */}
    </div >
  )
}

export default CreatePool