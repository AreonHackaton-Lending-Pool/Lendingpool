"use client"
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useFeeData } from "wagmi"
// import { getDepositedValue, getUserCollateral, getUserLoanAmount } from "../../components/main/readings";
import { getAllBorrowTransactions, getAllTransactions, getBorrowAPR, getPoolTokenSymbol, getSupplyAPY, getTotalBorrow, getTotalSupply, getUserBorrowAmount, getUserTotalSupplies, tokenAddresses, tokenPoolContractAddresses } from "../../components/main/tareon"
// components\main\tareon.tsx"
import { config } from "../../../wagmi";
import { useWriteContract } from "wagmi";
import { useSimulateContract } from "wagmi";
import { parseEther, withRetry } from "viem";
import { readContract, writeContract } from "viem/actions";
import ConnectButton from "../../components/main/connectButton/ConnectButton";
import poolAbi from "../../../../smartContract/abi/poolAbi.json";
import { Dialog, Transition } from "@headlessui/react";
import tokenAbi from "../../../../smartContract/abi/tokenAbi.json";

interface DepositTransaction {
    amount: number;
    useAsCollateral: boolean;
    canWithdrawal: boolean;
    depositTimestamp: number;
    apy: number;
}
interface BorrowTransaction {
    amount: number;
    borrowTimeStamp: number;
    apr: number;
}

const Portfolio = () => {
    const [isBorrowing, setIsBorrowing] = useState(false);
    const [innerWidth, setInnerWidth] = useState(window.innerWidth)

    const account = useAccount();
    const [indexNum, setIndexNum] = useState<number>(2);
    const [transactions, setTransactions] = useState<DepositTransaction[]>([]);
    const [borrowTransactions, setBorrowTransactions] = useState<BorrowTransaction[]>([]);
    const [poolTokenSymbol, setPoolTokenSymbol] = useState<string[]>([]);
    const [totalSupply, setTotalSupply] = useState<any>("");
    const [totalBorrow, setTotalBorrow] = useState<any>("");
    const [assets, setAssets] = useState<any>([]);
    const [selectedWithdrawalIndex, setSelectedWithdrawalIndex] = useState({});
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [supplyAPY, setSupplyAPY] = useState<any>("")
    const [borrowAPR, setBorrowAPR] = useState<any>("")
    const [userTotalSupply, setUserTotalSupply] = useState<any>("")
    const [userTotalBorrow, setUserTotalBorrow] = useState<any>("")
    const [supplyInterestAmount, setSupplyInterestAmount] = useState<any>("")
    const [borrowInterestAmount, setBorrowInterestAmount] = useState<any>("")

    const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
    const [openCollateralModal, setOpenCollateralModal] = useState(false);
    const [openRepayModal, setOpenRepayModal] = useState(false);

    const cancelButtonRef = useRef(null)

    const toggleRow = (index: number) => {
        // Check if the row is already expanded
        const isExpanded = expandedRows.includes(index);

        // Toggle the state for the clicked row
        if (isExpanded) {
            setExpandedRows(expandedRows.filter((rowIndex) => rowIndex !== index));
        } else {
            setExpandedRows([...expandedRows, index]);
        }
    };


    useEffect(() => {
        window.addEventListener('resize', () => {
            setInnerWidth(window.innerWidth)
        })
    }, [innerWidth])

    const { data: withdrawData, isLoading, isSuccess, error: withdrawError, status: withdrawStatus } = useSimulateContract({
        address: selectedWithdrawalIndex.address as `0x${string}`,
        abi: poolAbi,
        functionName: 'withdraw',
        args: [indexNum as number],
    })

    const handleToggleBorrow = () => {
        setIsBorrowing(!isBorrowing);
    };

    const { data: setCollateralAmountData, isLoading: setCollateralAmountIsLoading, isSuccess: setCollateralAmountIsSuccess, error: setCollateralAmountError, status: setCollateralAmountStatus } = useSimulateContract({
        address: selectedWithdrawalIndex.address as `0x${string}`,
        abi: poolAbi,
        functionName: 'setCollateralAmount',
        args: [indexNum as number],
    })

    const { data: cancelCollateralData, isLoading: cancelCollateralIsLoading, isSuccess: cancelCollateralIsSuccess, error: cancelCollateralError, status: cancelCollateralStatus } = useSimulateContract({
        address: selectedWithdrawalIndex.address as `0x${string}`,
        abi: poolAbi,
        functionName: 'cancelCollateralAmount',
        args: [indexNum as number],
    })

    const { data: repayData, isLoading: repayIsLoading, isSuccess: repayIsSuccess, error: repayError, status: repayStatus } = useSimulateContract({
        address: selectedWithdrawalIndex.address as `0x${string}`,
        abi: poolAbi,
        functionName: 'repayBorrow',
        args: [indexNum as number],
    })

    const { writeContract } = useWriteContract()

    const fetchTareonData = async () => {
        try {

            const userTransactions: DepositTransaction[] = await getAllTransactions(config, account.address);
            // console.log("userTransactions", userTransactions)
            setTransactions(userTransactions);

            const userBorrowTransactions: BorrowTransaction[] = await getAllBorrowTransactions(config, account.address);
            // console.log("userBorrowTransactions", userBorrowTransactions)
            setBorrowTransactions(userBorrowTransactions);

            const poolSupply: any = await getTotalSupply(config);
            setTotalSupply(poolSupply);
            // console.log("poolSupply", poolSupply)


            const poolBorrow: any = await getTotalBorrow(config);
            setTotalBorrow(poolBorrow);
            // console.log("poolBorrow", poolBorrow)


            const poolTokenSymbol: any = await getPoolTokenSymbol(config);
            setPoolTokenSymbol(poolTokenSymbol);
            // console.log("poolTokenSymbol", poolTokenSymbol)

            const supplyAPY: any = await getSupplyAPY(config);
            setSupplyAPY(supplyAPY);

            const borrowAPR: any = await getBorrowAPR(config);
            setBorrowAPR(borrowAPR);


            const userTotalSupply: any = await getUserTotalSupplies(config, account.address);
            setUserTotalSupply(userTotalSupply);

            const userTotalBorrow: any = await getUserBorrowAmount(config, account.address);
            setUserTotalBorrow(userTotalBorrow);

            const supplyInterestAmount = await calculateSupplyInterestAmount(config, indexNum);
            setSupplyInterestAmount(supplyInterestAmount);

            const borrowInterestAmount = await calculateBorrowInterestAmount(config, indexNum);
            setBorrowInterestAmount(borrowInterestAmount);


        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchTareonData()
    },
        [account.address, totalSupply, totalBorrow, poolTokenSymbol, transactions, borrowTransactions, supplyAPY, borrowAPR, userTotalSupply, userTotalBorrow, supplyInterestAmount, borrowInterestAmount])

    const portfolioDatas = useMemo(() => [
        {
            address: tokenPoolContractAddresses[0],
            tokenAddress: tokenAddresses[0],
            asset: poolTokenSymbol[0],
            totalSupply: (Number(totalSupply[0]) / 1e18).toFixed(2),
            totalBorrow: (Number(totalBorrow[0]) / 1e18).toFixed(2), // Assuming initial total borrow is 0
            maxLTV: 75, // Assuming Max LTV percentage
            supplyAPY: Number(supplyAPY[0]) / 100,
            borrowAPY: Number(borrowAPR[0]) / 100, // Assuming initial borrow APY is the same as supply APY
            image: "https://cdn.discordapp.com/attachments/1192557701557932263/1203718613459017788/chainlink-new-logo.png?ex=65d21d51&is=65bfa851&hm=e155dd6ebced8e8c0bb1a1cb23e4444cc86329084f6fb0cbaa2a38c738a08bff&",
            transactions: transactions[0],
            borrowTransactions: borrowTransactions[0],
            userTotalSupply: (Number(userTotalSupply[0]) / 1e18).toFixed(2),
            userTotalBorrow: (Number(userTotalBorrow[0]) / 1e18).toFixed(2),
            supplyInterestAmount: supplyInterestAmount[0],
            borrowInterestAmount: borrowInterestAmount[0],
        },
        {
            address: tokenPoolContractAddresses[1],
            tokenAddress: tokenAddresses[1],
            asset: poolTokenSymbol[1],
            totalSupply: (Number(totalSupply[1]) / 1e18).toFixed(2),
            totalBorrow: (Number(totalBorrow[1]) / 1e18).toFixed(2), // Assuming initial total borrow is 0
            maxLTV: 75, // Assuming Max LTV percentage
            supplyAPY: Number(supplyAPY[1]) / 100,
            borrowAPY: Number(borrowAPR[1]) / 100, // Assuming initial borrow APY is the same as supply APY
            image: "https://media.discordapp.net/attachments/1202747236283322479/1202979004739485716/logo-active-mode.png?ex=65cf6c80&is=65bcf780&hm=f34d5047d91898457b6d3a34a8caa33d59be5a0dca14f392e3b7e82bb794d1d9&=&format=webp&quality=lossless&width=431&height=431",
            transactions: transactions[1],
            borrowTransactions: borrowTransactions[1],
            userTotalSupply: (Number(userTotalSupply[1]) / 1e18).toFixed(2),
            userTotalBorrow: (Number(userTotalBorrow[1]) / 1e18).toFixed(2),
            supplyInterestAmount: supplyInterestAmount[1],
            borrowInterestAmount: borrowInterestAmount[1],
        },
    ], [
        totalSupply, totalBorrow, poolTokenSymbol, transactions, borrowTransactions, userTotalSupply, userTotalBorrow, supplyInterestAmount, borrowInterestAmount, supplyAPY, borrowAPR
    ])

    const memoizedAssets = useMemo(() => {
        if (Array.isArray(portfolioDatas)) {
            return portfolioDatas.map(asset => ({
                address: asset.address,
                tokenAddress: asset.tokenAddress,
                asset: asset.asset,
                totalSupply: asset.totalSupply,
                totalBorrow: asset.totalBorrow,
                maxLTV: asset.maxLTV,
                supplyAPY: asset.supplyAPY,
                borrowAPY: asset.borrowAPY,
                image: asset.image,
                transactions: asset.transactions,
                borrowTransactions: asset.borrowTransactions,
                userTotalSupply: asset.userTotalSupply,
                userTotalBorrow: asset.userTotalBorrow,
                supplyInterestAmount: asset.supplyInterestAmount,
                borrowInterestAmount: asset.borrowInterestAmount,

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
    }, [portfolioDatas]);

    // Update the assets state with memoizedAssets
    useEffect(() => {
        setAssets(memoizedAssets);
    }, [memoizedAssets]);

    return (
        <div className="mx-auto">
            {account.address == undefined || account?.isConnected == false ? (
                <div className="h-screen flex flex-col align-middle justify-center items-center">
                    <img src="https://static.wikia.nocookie.net/looneytunes/images/c/c7/Yosemite_Sam_fall.gif" alt="" className="mx-auto pt-5 mb-5 rounded-3xl w-80 h-52" />
                    <div className="text-white text-center mb-5">
                        <h4 className="font-bold text-2xl">Please connect your wallet</h4>
                        <h6>Please connect your wallet to view your portfolio</h6>
                    </div>
                    <div className="px-4 py-3 flex justify-center text-center sm:px-6 w-full">
                        <ConnectButton />
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex gap-2 mx-auto pt-5">
                        <button onClick={handleToggleBorrow} disabled={!isBorrowing} className={
                            !isBorrowing ? "bg-[#123456] text-white font-bold py-2 px-4 rounded" : "bg-[#487aaf] text-white font-bold py-2 px-4 rounded active"
                        }>
                            Supply
                        </button>
                        <button onClick={handleToggleBorrow} disabled={isBorrowing} className={
                            isBorrowing ? "bg-[#123456] text-white font-bold py-2 px-4 rounded" : "bg-[#487aaf] text-white font-bold py-2 px-4 rounded active"
                        }>
                            Borrow
                        </button>
                    </div>
                    {isBorrowing ?
                        <div className="h-5/6 text-sky-500 ">
                            <div className="pt-6 ">
                                <table className="w-full bg-[#00000070]">
                                    <thead className="w-full table-auto ">
                                        <tr>
                                            <th className="border border-gray-700 px-4 py-2">Token</th>
                                            <th className="border border-gray-700 px-4 py-2">Total Borrow</th>
                                            <th className="border border-gray-700 px-4 py-2">Borrow APR</th>
                                            <th className="border border-gray-700 px-4 py-2">Max LTV</th>
                                        </tr>
                                    </thead>
                                    <tbody className="w-full">
                                        {borrowTransactions && portfolioDatas?.map((portfolioData: any, index: number) => (
                                            <>
                                                {portfolioData.borrowTransactions && portfolioData.borrowTransactions.length > 0 && (
                                                    <tr key={portfolioData.address} onClick={() => toggleRow(index)} className="cursor-pointer sticky top-0 text-center">
                                                        <td className="flex items-center justify-center">
                                                            <img src={portfolioData.image} alt="" className="h-11 mr-3" />
                                                            <p className="w-12 text-left">
                                                                {portfolioData.asset}
                                                            </p>
                                                        </td>
                                                        <td>{portfolioData.userTotalBorrow}</td>
                                                        <td>{portfolioData.borrowAPY}%</td>
                                                        <td>{portfolioData.maxLTV}</td>
                                                    </tr>
                                                )}
                                                <>
                                                    {expandedRows.includes(index) && portfolioData.borrowTransactions && portfolioData.borrowTransactions.length > 0 && (
                                                        <tr>
                                                            <td colSpan={5}>
                                                                <table className="w-full ml-4 border-separate border-spacing-y-2">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="px-4 py-2 ">Balance</th>
                                                                            <th className="px-4 py-2">APR</th>
                                                                            <th className="px-4 py-2"></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="text-center">
                                                                        {borrowTransactions && portfolioData.borrowTransactions
                                                                            ?.map((transaction, index) => (
                                                                                <tr key={index} className="text-white">
                                                                                    <td className="px-4 py-2 has-tooltip">
                                                                                        {/* <div className='has-tooltip'> */}
                                                                                        <span className='tooltip rounded shadow-lg p-1 bg-[#000000] text-[#339ad5] ml-8'>{Number(transaction.amount)}</span>
                                                                                        {(Number(transaction.amount) / Math.pow(10, 18)).toLocaleString('en-US', {
                                                                                            minimumFractionDigits: 2,
                                                                                            maximumFractionDigits: 18
                                                                                        })}
                                                                                        {/* </div> */}
                                                                                    </td>
                                                                                    <td className="px-4 py-2">1.00%</td>
                                                                                    <td>
                                                                                        <button onClick={() => {
                                                                                            setSelectedWithdrawalIndex({
                                                                                                tokenAddress: portfolioData.tokenAddress,
                                                                                                address: portfolioData.address,
                                                                                                image: portfolioData.image,
                                                                                                index: index,
                                                                                                amount: transaction.amount,
                                                                                                asset: portfolioData.asset,
                                                                                                totalSupply: portfolioData.totalSupply,
                                                                                                borrowAPR: portfolioData.borrowAPY
                                                                                            })
                                                                                            setIndexNum(index)
                                                                                            setOpenRepayModal(true)
                                                                                        }} className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed">Repay</button>
                                                                                    </td>

                                                                                </tr>
                                                                            ))}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        :
                        <div className="h-5/6 text-sky-500 ">
                            <div className="pt-6">
                                <table className="w-full bg-[#00000070]">
                                    <thead className="w-full table-auto ">
                                        <tr>
                                            <th className="border border-gray-700 px-4 py-2">Token</th>
                                            <th className="border border-gray-700 px-4 py-2">Total Supply</th>
                                            <th className="border border-gray-700 px-4 py-2">Supply APY</th>
                                            <th className="border border-gray-700 px-4 py-2">Max LTV</th>
                                        </tr>
                                    </thead>
                                    <tbody className="w-full">
                                        {portfolioDatas && portfolioDatas?.map((portfolioData: any, index: number) => (
                                            <>
                                                {portfolioData.transactions && portfolioData.transactions.length > 0 && (
                                                    <tr key={portfolioData.address} onClick={() => toggleRow(index)} className="cursor-pointer sticky top-0 text-center">
                                                        <td className="flex items-center justify-center">
                                                            <img src={portfolioData.image} alt="" className="h-11 mr-3" />
                                                            <p className="text-left">
                                                                {portfolioData.asset}
                                                            </p>
                                                        </td>
                                                        <td>{portfolioData.userTotalSupply}</td>
                                                        <td>{portfolioData.supplyAPY}%</td>
                                                        <td>{portfolioData.maxLTV}</td>
                                                    </tr>
                                                )}
                                                <>
                                                    {expandedRows.includes(index) && portfolioData.transactions && portfolioData.transactions.length > 0 && (
                                                        <tr>
                                                            <td colSpan={5}>
                                                                <table className="w-full ml-4 border-separate border-spacing-y-2">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="px-4 py-2 ">Balance</th>
                                                                            <th className="px-4 py-2">APY</th>
                                                                            <th className="px-4 py-2">Collateral</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="text-center">
                                                                        {transactions && portfolioData.transactions
                                                                            ?.map((transaction, index) => (
                                                                                <tr key={index} className="text-white">
                                                                                    <td className="px-4 py-2 has-tooltip">
                                                                                        <span className='tooltip rounded shadow-lg p-1 bg-[#000000] text-[#339ad5] ml-8'>{Number(transaction.amount)}</span>
                                                                                        {(Number(transaction.amount) / Math.pow(10, 18)).toLocaleString('en-US', {
                                                                                            minimumFractionDigits: 2,
                                                                                            maximumFractionDigits: 18
                                                                                        })}
                                                                                    </td>
                                                                                    <td className="px-4 py-2"> 1.00%</td>
                                                                                    <td>
                                                                                        <label className="relative inline-flex items-center me-5 cursor-pointer">
                                                                                            <input type="checkbox" className="sr-only peer" defaultChecked={transaction.useAsCollateral} onClick={() => {
                                                                                                setSelectedWithdrawalIndex({
                                                                                                    address: portfolioData.address,
                                                                                                    image: portfolioData.image,
                                                                                                    index: index,
                                                                                                    amount: transaction.amount,
                                                                                                    asset: portfolioData.asset,
                                                                                                    totalSupply: portfolioData.totalSupply,
                                                                                                    collateral: transaction.useAsCollateral,
                                                                                                })
                                                                                                setOpenCollateralModal(true)
                                                                                            }} disabled={transaction.canWithdrawal == false} />
                                                                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-[#ba7474] dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#339ad5] peer-disabled:bg-gray-400 peer-disabled:cursor-not-allowed"></div>
                                                                                        </label>
                                                                                    </td>
                                                                                    <button onClick={() => {
                                                                                        setSelectedWithdrawalIndex({
                                                                                            address: portfolioData.address,
                                                                                            image: portfolioData.image,
                                                                                            index: index,
                                                                                            amount: transaction.amount,
                                                                                            asset: portfolioData.asset,
                                                                                            totalSupply: portfolioData.totalSupply,
                                                                                            supplyAPY: portfolioData.supplyAPY

                                                                                        })
                                                                                        setIndexNum(index)
                                                                                        setOpenWithdrawModal(true)
                                                                                    }} className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={transaction.canWithdrawal == false}>Withdraw</button>
                                                                                </tr>
                                                                            ))}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>

                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    }
                </div>
            )}
            <Transition.Root show={openWithdrawModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpenWithdrawModal}>
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

                    <div className="fixed inset-0 z-10 w-full">
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
                                                    Withdraw {selectedWithdrawalIndex.asset}
                                                </Dialog.Title>
                                                <div className="w-full my-5">
                                                    <h6 className="border-b">Amount</h6>
                                                    <div className=" flex justify-between w-full">
                                                        <div className="flex-1">
                                                            <input type="number" placeholder="0.00" min="0" step="0.01" className=" h-10 text-2xl text-gray-950 placeholder:text-gray-500" value={(Number(selectedWithdrawalIndex.amount) / 1e18).toFixed(2)} disabled />
                                                            <p className="text-gray-500">$0</p>
                                                        </div>
                                                        <div className="text-right flex-1">
                                                            <div className="flex justify-end">
                                                                <img src={selectedWithdrawalIndex.image} alt="" className="h-7 my-1 mr-1" />
                                                                <span className="h-10 font-medium text-2xl">{selectedWithdrawalIndex.asset}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full my-5">
                                                    <h6 className="border-b">Transaction Overview</h6>
                                                    <div className="w-full">
                                                        <div className="flex justify-between my-2">
                                                            <h6>Supply APY</h6>
                                                            <p>{selectedWithdrawalIndex.supplyAPY}%</p>
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
                                            onClick={() => writeContract(withdrawData?.request as any)}
                                        >
                                            Withdraw
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setOpenWithdrawModal(false)}
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
            <Transition.Root show={openCollateralModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpenCollateralModal}>
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

                    <div className="fixed inset-0 z-10 w-full">
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
                                                    {selectedWithdrawalIndex.collateral === true ? "Disable Collateral" : "Enable Collateral"}
                                                </Dialog.Title>
                                                <div className="w-full my-5">
                                                    <h6 className="border-b">Transaction</h6>
                                                    <div className=" flex justify-between w-full">
                                                        <div className="flex-1">
                                                            <input type="number" placeholder="0.00" min="0" step="0.01" className=" h-10 text-2xl text-gray-950 placeholder:text-gray-500" value={((Number(selectedWithdrawalIndex.amount)) / 1e18).toFixed(2)} disabled />
                                                            <p className="text-gray-500">$0</p>
                                                        </div>
                                                        <div className="text-right flex-1">
                                                            <div className="flex justify-end">
                                                                <img src={selectedWithdrawalIndex.image} alt="" className="h-7 my-1 mr-1" />
                                                                <span className="h-10 font-medium text-2xl">{selectedWithdrawalIndex.asset}</span>
                                                            </div>
                                                            <div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full my-5 border-2 border-red-600 p-5 rounded-sm">
                                                    {selectedWithdrawalIndex.collateral === true ?
                                                        <p className="text-red-600">
                                                            Disabling collateralization will affect your borrowing power and Health Factor.
                                                        </p>
                                                        :
                                                        <p>
                                                            Enabling this asset as collateral increases your borrowing power and Health Factor. However, it can get liquidated if your health factor drops below 1.
                                                        </p>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 w-full">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-[#339ad5] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                                            onClick={() => { setIndexNum(selectedWithdrawalIndex.index), selectedWithdrawalIndex.collateral === true ? writeContract(cancelCollateralData?.request as any, selectedWithdrawalIndex.index as any) : writeContract(setCollateralAmountData?.request as any, selectedWithdrawalIndex.index as any) }}
                                        >
                                            {
                                                selectedWithdrawalIndex.collateral === true ? cancelCollateralIsLoading ? "Loading..." : "Disable" : setCollateralAmountIsLoading ? "Loading..." : "Enable"}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setOpenCollateralModal(false)}
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    {cancelCollateralError && <p className="text-red-600">{cancelCollateralError.data?.message}</p>}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            <Transition.Root show={openRepayModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpenRepayModal}>
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

                    <div className="fixed inset-0 z-10 w-full">
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
                                                    Repay {selectedWithdrawalIndex.asset}
                                                </Dialog.Title>
                                                <div className="w-full my-5">
                                                    <h6 className="border-b">Amount</h6>
                                                    <div className=" flex justify-between w-full">
                                                        <div className="flex-1">
                                                            <input type="number" placeholder="0.00" min="0" step="0.01" className=" h-10 text-2xl text-gray-950 placeholder:text-gray-500" value={(Number(selectedWithdrawalIndex.amount) / 1e18).toFixed(2)} disabled />
                                                            <p className="text-gray-500">$0</p>
                                                        </div>
                                                        <div className="text-right flex-1">
                                                            <div className="flex justify-end">
                                                                <img src={selectedWithdrawalIndex.image} alt="" className="h-7 my-1 mr-1" />
                                                                <span className="h-10 font-medium text-2xl">{selectedWithdrawalIndex.asset}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-full my-5">
                                                    <h6 className="border-b">Transaction Overview</h6>
                                                    <div className="w-full">
                                                        <div className="flex justify-between my-2">
                                                            <h6>Borrow APY</h6>
                                                            <p>{selectedWithdrawalIndex.borrowAPR}%</p>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <p>Collateralization</p>
                                                            <p>Enabled</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
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
                                        <button type="button" className="inline-flex w-full justify-center rounded-md bg-[#339ad5] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto" onClick={() => setOpenRepayModal(false)}>
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-[#339ad5] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 sm:ml-3 sm:w-auto"
                                            onClick={() => {
                                                writeContract(repayData?.request as any, indexNum as any)
                                            }}
                                        >
                                            Repay
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setOpenRepayModal(false)}
                                            ref={cancelButtonRef}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div >
    )
}

export default Portfolio