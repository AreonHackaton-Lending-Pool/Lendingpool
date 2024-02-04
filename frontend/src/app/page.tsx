"use client";
import { useEffect, useState, Fragment, useRef, useMemo, useCallback } from "react";
import { useAccount, useConnect, useWriteContract, useDisconnect, useSimulateContract, useBalance } from 'wagmi';
import { parseEther, parseGwei } from 'viem';
import { config } from "../../wagmi";
import { AccountBalance } from "../components/precomp/Balance";
import { getUserLoanAmount, getUserCollateral, getDepositedValue, getAllTransactions, getAllPools } from "../components/main/readings";
import { Dialog, Transition } from '@headlessui/react'
import ConnectButton from "../components/main/connectButton/ConnectButton";
import ConnectWalletMsg from "../components/main/ConnectWalletMsg/ConnectWalletMsg";
import { tokenPoolContractAddresses, getTokenAddress, getPoolTokenSymbol, getTotalBorrow, getTotalSupply, getUserBalance, tokenAddresses, getTokenPrice, getSupplyAPY, getBorrowAPR } from "../components/main/tareon";
import poolAbi from "../../../smartContract/abi/poolAbi.json";
import { readContract } from '@wagmi/core'
import tokenAbi from "../../../smartContract/abi/tokenAbi.json";
import erc20Abi from "../../../smartContract/abi/erc20Abi.json";


interface AccountBalance {
  data?: any;
  isLoading: boolean;
  isSuccess: boolean;
  error?: any;
}
interface PoolBalance {
  data?: any;  // Adjust the type according to the actual response structure
  isLoading: boolean;
  isSuccess: boolean;
  error?: any; // Adjust the type according to the actual error structure
}

type Transaction = {
  amount: number;
  lockTime: number;
  useAsCollateral: boolean;
  canWithdrawal: boolean;
  timestamp: number;
}

export function Page() {
  const contractAddress = "0x3b10594616c3C605dbAE79bF00af79163694A3d0";

  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [amount, setAmount] = useState<any>('0.005');
  const [index, setIndex] = useState<number>(0);
  const [loanAmount, setLoanAmount] = useState<string>("0");
  const [userLoanAmount, setuserLoanAmount] = useState<string>("");
  const [userCollateral, setUserCollateral] = useState<string>("");
  const [depositedValue, setDepositedValue] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [repayAmount, setRepayAmount] = useState<string>("");
  const [cancelCollateralIndex, setCancelCollateralIndex] = useState<number>(0);
  const [setCollateralIndex, setSetCollateralIndex] = useState<number>(0);
  const [selectedAsset, setSelectedAsset] = useState({});
  const [tokenSymbol, setTokenSymbol] = useState('')
  // const [tokenAddress, setTokenAddress] = useState('')
  const [allPools, setAllPools] = useState<any>("");
  const [allBalances, setAllBalances] = useState<any>("");
  const [totalSupply, setTotalSupply] = useState<any>("");
  const [totalBorrow, setTotalBorrow] = useState<any>("");
  const [poolTokenSymbol, setPoolTokenSymbol] = useState<string[]>([])
  const [tokenAddress, setTokenAddress] = useState<string[]>([])
  const [userBalance, setUserBalance] = useState<any>("");
  const [supplyAddress, setSupplyAddress] = useState<string>("");
  const [tokenPrice, setTokenPrice] = useState<any>("");
  const [supplyAPY, setSupplyAPY] = useState<any>("")
  const [borrowAPR, setBorrowAPR] = useState<any>("")

  const [inputAmount, setInputAmount] = useState("10");

  const [innerWidth, setInnerWidth] = useState(window.innerWidth)

  const [openSupplyModal, setOpenSupplyModal] = useState(false)
  const [openBorrowModal, setOpenBorrowModal] = useState(false);

  const [sortedAssets, setSortedAssets] = useState<any[]>(null);

  const cancelButtonRef = useRef(null)

  const fetchTareonData = async () => {
    try {
      // const userLoanResponse: any = await getUserLoanAmount(config, account.address);
      // setuserLoanAmount(userLoanResponse.toString());
      // console.log("userLoanResponse", userLoanResponse);

      const userCollateralAmount: any = await getUserCollateral(config, account.address);
      // console.log("userCollateralAmount", userCollateralAmount)
      // setUserCollateral(userCollateralAmount.toString());

      // const userDepositedValue: any = await getDepositedValue(config);
      // console.log("userDepositedValue", userDepositedValue)
      // setDepositedValue(userDepositedValue.toString());

      // const userTransactions: Transaction[] = await getAllTransactions(config, account.address);
      // console.log("userTransactions", userTransactions)
      // setTransactions(userTransactions);

      const poolSupply: any = await getTotalSupply(config);
      setTotalSupply(poolSupply);
      // console.log("poolSupply", poolSupply)

      const poolBorrow: any = await getTotalBorrow(config);
      setTotalBorrow(poolBorrow);
      // console.log("poolBorrow", poolBorrow)

      const poolTokenSymbol: any = await getPoolTokenSymbol(config);
      setPoolTokenSymbol(poolTokenSymbol);
      // console.log("poolTokenSymbol", poolTokenSymbol)

      const tokenAddress: any = await getTokenAddress(config);
      setTokenAddress(tokenAddress);
      // console.log("tokenAddress", tokenAddress)

      const userBalance: any = await getUserBalance(config, account.address);
      setUserBalance(userBalance);
      // console.log("userBalance", userBalance)

      const tokenPrice: any = await getTokenPrice(config);
      // console.log("tokenPrice", tokenPrice)
      setTokenPrice(tokenPrice);

      const supplyAPY: any = await getSupplyAPY(config);
      setSupplyAPY(supplyAPY);

      const borrowAPR: any = await getBorrowAPR(config);
      setBorrowAPR(borrowAPR);

    } catch (error) {
      console.error(error);
    }
  }

  const { data: approveData, isLoading: approveIsLoading, isSuccess: approveIsSuccess, error: approveError, status: approveStatus, isPending: approveIsPending, fetchStatus: approveFetchStatus } = useSimulateContract({
    address: selectedAsset.tokenAddress as `0x${string}`,
    abi: selectedAsset.tokenAbi === "erc20" ? erc20Abi : tokenAbi,
    // abi: tokenAbi,
    // value: parseEther(inputAmount) as any,
    args: [selectedAsset.address, parseEther(inputAmount) as any],
    functionName: 'approve',
  })

  const { data: allowanceData, isLoading: allowanceIsLoading, isSuccess: allowanceIsSuccess, error: allowanceError, status: allowanceStatus } = useSimulateContract({
    address: selectedAsset.tokenAddress as `0x${string}`,
    abi: selectedAsset.tokenAbi === "erc20" ? erc20Abi : tokenAbi,
    functionName: 'allowance',
    args: [account.address, selectedAsset.address],
  })
  // console.log(inputAmount)

  // console.log(approveData, approveError, approveStatus)
  // console.log(allowanceData)

  const { data: depositData, isLoading: depositIsLoading, isSuccess: depositIsSuccess, error: depositError, status: depositStatus, isPending: depositIsPending, fetchStatus: depositFetchStatus, isStale: depositIsStale } = useSimulateContract({
    abi: poolAbi,
    address: selectedAsset.address as `0x${string}`,
    functionName: 'deposit',
    args: [parseEther(inputAmount) as any],
  });

  // console.log(depositData, depositError, depositStatus)
  // console.log(selectedAsset.address)

  // console.log(inputAmount)

  const { data: getLoanData, isLoading: getLoanIsLoading, isSuccess: getLoanIsSuccess, error: getLoanError, status: getLoanStatus } = useSimulateContract({
    address: selectedAsset.address as `0x${string}`,
    abi: poolAbi,
    args: [parseEther(loanAmount) as any],
    functionName: 'getBorrow',
  })

  // console.log(getLoanData, getLoanStatus, getLoanError)
  // console.log(getLoanError?.)

  // console.log(loanAmount)

  const accountBalance: AccountBalance = useBalance({
    address: account.address as `0x${string}`,
  })
  const poolBalance: PoolBalance = useBalance({
    address: contractAddress as `0x${string}`,
  })

  const { writeContract } = useWriteContract()

  const assetsData = useMemo(() => [
    {
      tokenType: "erc20",
      address: tokenPoolContractAddresses[0],
      tokenAddress: tokenAddresses[0],
      asset: poolTokenSymbol[0],
      totalSupply: (Number(totalSupply[0]) / 1e18).toFixed(2),
      totalBorrow: (Number(totalBorrow[0]) / 1e18).toFixed(2), // Assuming initial total borrow is 0
      maxLTV: 75, // Assuming Max LTV percentage
      supplyAPY: Number(supplyAPY[0]) / 100,
      borrowAPY: Number(borrowAPR[0]) / 100,
      image: "https://cdn.discordapp.com/attachments/1192557701557932263/1203718613459017788/chainlink-new-logo.png?ex=65d21d51&is=65bfa851&hm=e155dd6ebced8e8c0bb1a1cb23e4444cc86329084f6fb0cbaa2a38c738a08bff&",
      userBalance: (Number(userBalance[0]) / 1e18).toFixed(2).toString(),
      price: Number(tokenPrice[0]) / 100000000,
    },
    {
      tokenType: "local",
      address: tokenPoolContractAddresses[1],
      tokenAddress: tokenAddresses[1],
      asset: poolTokenSymbol[1],
      totalSupply: (Number(totalSupply[1]) / 1e18).toFixed(2),
      totalBorrow: (Number(totalBorrow[1]) / 1e18).toFixed(2), // Assuming initial total borrow is 0
      maxLTV: 75, // Assuming Max LTV percentage
      supplyAPY: Number(supplyAPY[1]) / 100,
      borrowAPY: Number(borrowAPR[1]) / 100,
      image: "https://media.discordapp.net/attachments/1202747236283322479/1202979004739485716/logo-active-mode.png?ex=65cf6c80&is=65bcf780&hm=f34d5047d91898457b6d3a34a8caa33d59be5a0dca14f392e3b7e82bb794d1d9&=&format=webp&quality=lossless&width=431&height=431",
      userBalance: (Number(userBalance[1]) / 1e18).toFixed(2).toString(),
      price: 0
    },
    {
      tokenType: "local",
      address: tokenPoolContractAddresses[2],
      tokenAddress: tokenAddresses[2],
      asset: poolTokenSymbol[2],
      totalSupply: (Number(totalSupply[2]) / 1e18).toFixed(2),
      totalBorrow: (Number(totalBorrow[2]) / 1e18).toFixed(2), // Assuming initial total borrow is 0
      maxLTV: 75, // Assuming Max LTV percentage
      supplyAPY: 0.01,
      borrowAPY: 0.01, // Assuming initial borrow APY is the same as supply APY
      image: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628",
      userBalance: (Number(userBalance[2]) / 1e18).toFixed(2).toString(),
    },
    // {
    //   tokenType: "erc20",
    //   address: tokenPoolContractAddresses[3],
    //   tokenAddress: tokenAddresses[3],
    //   asset: poolTokenSymbol[3],
    //   totalSupply: (Number(totalSupply[3]) / 1e18).toFixed(2),
    //   totalBorrow: (Number(totalBorrow[3]) / 1e18).toFixed(2), // Assuming initial total borrow is 0
    //   maxLTV: 75, // Assuming Max LTV percentage
    //   supplyAPY: 0.01,
    //   borrowAPY: 0.01, // Assuming initial borrow APY is the same as supply APY
    //   image: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628",
    //   userBalance: (Number(userBalance[3]) / 1e18).toFixed(2),
    // },
  ], [totalSupply, totalBorrow, supplyAPY, borrowAPR, userBalance]);
  const [assets, setAssets] = useState([]);

  const memoizedAssets = useMemo(() => {
    if (Array.isArray(assetsData)) {
      return assetsData.map(asset => ({
        tokenType: asset.tokenType,
        address: asset.address,
        tokenAddress: asset.tokenAddress,
        asset: asset.asset,
        totalSupply: asset.totalSupply,
        totalBorrow: asset.totalBorrow,
        maxLTV: asset.maxLTV,
        supplyAPY: asset.supplyAPY,
        borrowAPY: asset.borrowAPY,
        image: asset.image,
        userBalance: asset.userBalance,
        price: asset.price
      }));
    }

    // Default assetsData if poolBalance.data is not available
    return [
      {
        asset: "DefaultAsset",
        totalSupply: 0,
        totalBorrow: 0,
        maxLTV: 0,
        supplyAPY: 0,
        borrowAPY: 0,
        image: "default-image-url",
      },
    ];
  }, [assetsData]);


  // useEffect(() => {
  //   console.log(Number(tokenPrice[0]))
  // }, [tokenPrice[0]])

  // Update the assets state with memoizedAssets


  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  const sortAssetsbyName = (key: string) => {
    const direction = key === sortConfig.key && sortConfig.direction === "ascending" ? "descending" : "ascending";

    const sortedAssets = [...assetsData].sort((a, b) => {
      const valueA = key === "name" ? a[key].toLowerCase() : a[key];
      const valueB = key === "name" ? b[key].toLowerCase() : b[key];

      return direction === "ascending" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });


    setSortConfig({ key, direction });
    setSortedAssets(sortedAssets);
    setAssets(sortedAssets);
  };

  const sortAssetswithNumber = (key: string) => {
    const direction = key === sortConfig.key && sortConfig.direction === "ascending" ? "descending" : "ascending";

    const sortedAssetsbyNumber = [...assetsData].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];


      return direction === "ascending" ? valueA - valueB : valueB - valueA;
    })


    setSortConfig({ key, direction });
    setSortedAssets(sortedAssetsbyNumber);
    setAssets(sortedAssetsbyNumber);
  }

  useEffect(() => {
    fetchTareonData();
  }, []);

  const resetInputs = () => {
    if (!openSupplyModal) {
      setInputAmount('')
    }
  }

  useEffect(() => {
    setAssets(memoizedAssets);
  }, [memoizedAssets]);

  useEffect(() => {
    resetInputs()
  }, [openSupplyModal])


  useEffect(() => {
    window.addEventListener('resize', () => {
      setInnerWidth(window.innerWidth)
    })
  })

  // console.log(inputAmount)

  return (
    <>
      <div className="p-5 relative pt-32">

        {innerWidth >= 1024 ?
          <table className="table-auto w-full text-white text-center pt-10">
            <thead className="">
              <tr>
                <th className="cursor-pointer" onClick={() => sortAssetsbyName("asset")} >Asset</th>
                <th className="cursor-pointer" onClick={() => sortAssetswithNumber("totalSupply")}>Total Supply</th>
                <th className="cursor-pointer" onClick={() => sortAssetswithNumber("totalBorrow")}>Total Borrow</th>
                <th className="cursor-pointer" onClick={() => sortAssetswithNumber("maxLTV")}>Max LTV</th>
                <th className="cursor-pointer" onClick={() => sortAssetswithNumber("supplyAPY")}>Supply APY</th>
                <th className="cursor-pointer" onClick={() => sortAssetswithNumber("borrowAPY")}>Borrow APY</th>
              </tr>
            </thead>
            {
              assetsData[0].asset === undefined || assetsData[0].totalSupply === NaN || assetsData[0].totalBorrow === NaN ?
                <div className="h-80">
                  <div className="flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-5">
                    {/* <span className='sr-only'>Loading...</span> */}
                    <div className='h-8 w-8 bg-[#3d3d3d] rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                    <div className='h-8 w-8 bg-[#707070] rounded-full animate-bounce [animation-delay:-0.2s]'></div>
                    <div className='h-8 w-8 bg-[#a3a3a3] rounded-full animate-bounce [animation-delay:-0.1s'></div>
                    <div className='h-8 w-8 bg-[#67abd3] rounded-full animate-bounce [animation-delay:0s]'></div>
                  </div>
                </div>
                :
                <tbody className="border-t-4 bg-[#00000070]">
                  {
                    sortedAssets ? sortedAssets?.map((asset, index) => (
                      <tr key={index} className="border-t border-b last:border-none py-5">
                        <td>
                          {asset.image && <img src={asset.image} alt="" className="mr-3 w-16 rounded-full" />}
                          {asset.asset}</td>
                        <td>{asset.totalSupply}</td>
                        <td>{asset.totalBorrow}</td>
                        <td>{asset.maxLTV}</td>
                        <td>
                          <span className="w-10">
                            {asset.supplyAPY}
                          </span>
                          <button className="bg-[#009ffb37] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded ml-5" onClick={() => {
                            setSelectedAsset({
                              tokenType: asset.tokenType,
                              tokenAddress: asset.tokenAddress,
                              address: asset.address,
                              asset: asset.asset,
                              image: asset.image,
                              totalSupply: asset.totalSupply,
                              userBalance: asset.userBalance,
                              price: asset.price,
                            })
                            setOpenSupplyModal(true)
                          }}>Supply</button>
                        </td>
                        <td>{asset.borrowAPY}
                          <button className="bg-[#009ffb37] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded ml-5 m-5"
                            onClick={() => {
                              setSelectedAsset({
                                tokenType: asset.tokenType,
                                tokenAddress: asset.tokenAddress,
                                address: asset.address,
                                asset: asset.asset,
                                image: asset.image,
                                totalSupply: asset.totalSupply,
                                borrowAPR: asset.borrowAPY,
                                price: asset.price
                              });
                              setOpenBorrowModal(true);
                            }}
                          >Borrow</button></td>
                      </tr>
                    )) : (
                      assets?.map((asset, index) => (
                        <tr key={index} className="border-t border-b last:border-none py-5">
                          <td className="flex items-center justify-center h-full">
                            {asset.image && <img src={asset.image} alt="" className="mr-3 w-16 rounded-full" />}
                            {asset.asset}</td>
                          <td>{asset.totalSupply}</td>
                          <td>{asset.totalBorrow}</td>
                          <td>{asset.maxLTV}</td>
                          <td>
                            <span className="w-10">
                              {asset.supplyAPY}
                            </span>
                            <button className="bg-[#009ffb37] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded ml-5" onClick={() => {
                              setSelectedAsset({
                                tokenType: asset.tokenType,
                                tokenAddress: asset.tokenAddress,
                                address: asset.address,
                                asset: asset.asset,
                                image: asset.image,
                                totalSupply: asset.totalSupply,
                                userBalance: asset.userBalance,
                                supplyAPY: asset.supplyAPY,
                                price: asset.price
                              })
                              setOpenSupplyModal(true)
                            }}>Supply</button>
                          </td>
                          <td>{asset.borrowAPY}
                            <button className="bg-[#009ffb37] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded ml-5 m-5"
                              onClick={() => {
                                setSelectedAsset({
                                  tokenType: asset.tokenType,
                                  tokenAddress: asset.tokenAddress,
                                  address: asset.address,
                                  asset: asset.asset,
                                  image: asset.image,
                                  totalSupply: asset.totalSupply,
                                  borrowAPR: asset.borrowAPY,
                                  price: asset.price
                                });
                                setOpenBorrowModal(true);
                              }}
                            >Borrow</button></td>
                        </tr>
                      )
                      )
                    )
                  }
                </tbody>
            }
          </table >
          : (
            <div className="text-white text-center">
              {assets.length > 0 && poolBalance?.isSuccess === true && poolBalance.isLoading === false && poolBalance.data?.symbol && assets.map((asset, index) => (
                <div className="mx-auto border-b mb-5">
                  <div className="flex gap-5 mb-5">
                    <img src={asset.image} alt="" className="w-10 h-10" />
                    <h2 className="text-2xl font-bold ">{asset.asset}</h2>
                  </div>
                  <div className="flex flex-wrap justify-between mb-5 md:text-center">
                    <div className="w-1/2 md:w-1/3 mb-5">
                      <p className="md:text-lg sm:text-md text-gray-400"> Total Supply</p>
                      <p className="text-2xl">
                        {asset.totalSupply}
                      </p>
                    </div>
                    <div className="w-1/2 md:w-1/3 mb-5">
                      <p className="md:text-lg sm:text-md text-gray-400">Total Borrow</p>
                      <p className="text-2xl">
                        {asset.totalBorrow}
                      </p>
                    </div>
                    <div className="w-1/2 md:w-1/3 mb-5">
                      <p className="md:text-lg sm:text-md text-gray-400">Max LTV</p>
                      <p className="text-2xl">
                        {asset.maxLTV}
                      </p>
                    </div>
                    <div className="w-1/2 md:w-1/3 mb-5">
                      <p className="md:text-lg sm:text-md text-gray-400">Supply APY</p>
                      <p className="text-2xl">
                        {asset.supplyAPY}%
                      </p>
                    </div>
                    <div className="w-1/2 md:w-1/3">
                      <p className="md:text-lg sm:text-md text-gray-400">Borrow APR</p>
                      <p className="text-2xl">
                        {asset.borrowAPY}%
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex pb-5 justify-start gap-1">
                    <button className="bg-[#009ffb37] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded w-9/12" onClick={() => {
                      setSelectedAsset({
                        tokenType: asset.tokenType,
                        tokenAddress: asset.tokenAddress,
                        address: asset.address,
                        asset: asset.asset,
                        image: asset.image,
                        totalSupply: asset.totalSupply,
                        userBalance: asset.userBalance,
                        supplyAPY: asset.supplyAPY,
                        price: asset.price
                      })
                      setOpenSupplyModal(true)
                    }}>Supply</button>
                    <button className="bg-[#009ffb37] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded w-9/12" onClick={() => {
                      setSelectedAsset({
                        tokenType: asset.tokenType,
                        tokenAddress: asset.tokenAddress,
                        address: asset.address,
                        asset: asset.asset,
                        image: asset.image,
                        totalSupply: asset.totalSupply,
                        borrowAPR: asset.borrowAPY,
                        price: asset.price
                      });
                      setOpenBorrowModal(true);
                    }}>Borrow</button>
                  </div>
                </div>
              )
              )}
            </div>
          )
        }


        <Transition.Root show={openSupplyModal} as={Fragment}>
          < Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpenSupplyModal}>
            {account?.isConnected == true ? (
              <div>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                  <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                      enterTo="opacity-100 translate-y-0 sm:scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                      <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                          <div className="sm:flex">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                              <Dialog.Title as="h2" className="text-xl font-bold leading-6 text-gray-900 mb-8">
                                Supply {selectedAsset.asset}
                              </Dialog.Title>
                              <div className="w-full my-5">
                                <h6 className="border-b">Amount</h6>
                                <div className=" flex justify-between w-full">
                                  <div className="flex-1">
                                    <input type="number" placeholder="0.00" className=" h-10 text-2xl text-gray-950 placeholder:text-gray-500" value={inputAmount} onChange={(e) => setInputAmount((e.target.value))} />
                                    {/* <p className="text-gray-500">${inputAmount && selectedAsset.price ? (inputAmount * selectedAsset.price).toFixed(2) : 0}</p> */}
                                    <p>${(inputAmount == "" ? 0 : inputAmount * selectedAsset?.price).toFixed(2)}</p>
                                  </div>
                                  <div className="text-right flex-1">
                                    <div className="flex justify-end">
                                      <img src={selectedAsset.image} alt="" className="h-7 my-1 mr-1" />
                                      <span className="h-10 font-medium text-2xl">{selectedAsset.asset}</span>
                                    </div>
                                    <div>
                                      <p className="w-full">Wallet Balance {selectedAsset.userBalance}</p>
                                      <button className="text-gray-500" onClick={() => setInputAmount(selectedAsset.userBalance)}>max</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full my-5">
                                <h6 className="border-b">Transaction Overview</h6>
                                <div className="w-full">
                                  <div className="flex justify-between my-2">
                                    <h6>Supply APY</h6>
                                    <p>{Number(selectedAsset.supplyAPY)}%</p>
                                  </div>
                                  <div className="flex justify-between">
                                    <p>Collateralization</p>
                                    <p>Enabled</p>
                                  </div>
                                  <div className="flex justify-between">
                                    <p>Allowance</p>
                                    <p>{Number(allowanceData?.result) / 10 ** 18}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <span>
                                  $4.12
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 flex flex-col sm:px-6 w-full gap-5">
                          <button type="button" className="inline-flex w-full justify-center rounded-md bg-[#339ad5] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                            onClick={() => writeContract(approveData?.request)}>
                            Approve</button>
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-[#339ad5] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                            disabled={depositIsLoading || depositIsPending || depositError || allowanceData?.result < inputAmount || allowanceData?.result == 0 || inputAmount == 0}
                            onClick={() => {
                              writeContract(depositData?.request);
                            }}
                          >
                            {depositIsLoading ? "Loading..." : depositError ? "Error" : "Supply"}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={() => setOpenSupplyModal(false)}
                            ref={cancelButtonRef}
                          >
                            Cancel
                          </button>
                        </div>
                        {/* {depositError && < p className="text-red-500">{depositError.message}</>} */}
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </div>
            ) : (
              <ConnectWalletMsg />
            )
            }
          </Dialog>
        </Transition.Root>
        <Transition.Root show={openBorrowModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpenBorrowModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className="sm:flex">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                          <Dialog.Title as="h2" className="text-xl font-bold leading-6 text-gray-900 mb-8">
                            Borrow {selectedAsset.asset}
                          </Dialog.Title>
                          <div className="w-full my-5">
                            <h6 className="border-b">Amount</h6>
                            <div className=" flex justify-between w-full">
                              <div className="flex-1">
                                <input type="number" placeholder="0.00" min="0" step="0.01" className=" h-10 text-2xl text-gray-950 placeholder:text-gray-500" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
                                <p className="text-gray-500">{(loanAmount == "" ? 0 : parseFloat(loanAmount) * selectedAsset?.price).toFixed(2)}$</p>
                              </div>
                              <div className="text-right flex-1">
                                <div className="flex justify-end">
                                  <img src={selectedAsset.image} alt="" className="h-7 my-1 mr-1" />
                                  <span className="h-10 font-medium text-2xl">{selectedAsset.asset}</span>
                                </div>
                                <div>
                                  <p>
                                    Available {selectedAsset.totalSupply}
                                  </p>
                                  {/* <button className="text-gray-500" onClick={() => setLoanAmount(accountBalance.data?.formatted)}>max</button> */}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-full my-5">
                            <h6 className="border-b">Transaction Overview</h6>
                            <div className="w-full">
                              <div className="flex justify-between my-2">
                                <h6>Borrow APY</h6>
                                <p>{selectedAsset.borrowAPR}%</p>
                              </div>
                              <div className="flex justify-between">
                                <p>Collateralization</p>
                                <p>Enabled</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span>
                              $4.12
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 w-full">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-[#339ad5] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                        onClick={() => writeContract(getLoanData?.request)}
                      >
                        {getLoanStatus === "pending" ? "Loading..." : getLoanIsSuccess && !getLoanError ? "Get Loan" : "Error"}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => setOpenBorrowModal(false)}
                        ref={cancelButtonRef}
                      >
                        Cancel
                      </button>
                    </div>
                    {
                      getLoanError && getLoanError.message.includes("your health factor must be above 1") && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                          <strong className="font-bold">Error!</strong>
                          <span className="block sm:inline"> Your health factor must be above 1</span>
                        </div>
                      )
                    }
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div >
    </>
  );
}

export default Page;