"use client";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useWriteContract, useDisconnect, useSimulateContract, useBalance } from 'wagmi';
import { parseEther, parseGwei } from 'viem';
import lendingPoolAbi from "../../../smartContract/abi/lendinPool.json";
import { config } from "../../wagmi";
import { AccountBalance, Balance } from "../components/precomp/Balance";
import { Account } from "../components/precomp/Account";
import { getUserLoanAmount, getUserCollateral, getDepositedValue, getAllTransactions } from "../components/main/readings";
import Carousel from "../components/main/carousel/Carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Catchboxes from "../components/main/catchboxes/Catchboxes";
import AssetTable from "../components/main/assetTable/index";


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
  const [loanAmount, setLoanAmount] = useState<number>(1);
  const [userLoanAmount, setuserLoanAmount] = useState<string>("");
  const [userCollateral, setUserCollateral] = useState<string>("");
  const [depositedValue, setDepositedValue] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [repayAmount, setRepayAmount] = useState<string>("");
  const [cancelCollateralIndex, setCancelCollateralIndex] = useState<number>(0);
  const [setCollateralIndex, setSetCollateralIndex] = useState<number>(0);

  const fetchData = async () => {
    try {
      const userLoanResponse = await getUserLoanAmount(config, account.address);
      setuserLoanAmount(userLoanResponse.toString());
      // console.log(userLoanResponse);

      const userCollateralAmount = await getUserCollateral(config, account.address);
      // console.log(userCollateralAmount)
      setUserCollateral(userCollateralAmount.toString());

      const userDepositedValue = await getDepositedValue(config);
      // console.log(userDepositedValue)
      setDepositedValue(userDepositedValue.toString());

      const userTransactions: Transaction[] = await getAllTransactions(config, account.address);
      // console.log(userTransactions)
      setTransactions(userTransactions);

    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchData();
    console.log(transactions)
  }, [userCollateral, userLoanAmount, depositedValue]);

  const { data: simulatedContractData, isLoading: simulatedContractIsLoading, isSuccess: simulatedContractIsSuccess, error: simulatedContractError, status: simulatedContractStatus } = useSimulateContract({
    address: contractAddress,
    abi: lendingPoolAbi,
    value: parseEther(amount) as any,
    args: [],
    functionName: 'deposit',
  });

  // console.log(simulatedContractData, simulatedContractIsLoading, simulatedContractError)

  const { data: withDrawData, isLoading, isSuccess, error: withdrawError, status: withdrawStatus } = useSimulateContract({
    address: contractAddress,
    abi: lendingPoolAbi,
    functionName: 'withdraw',
    args: [index as number],
    // value: parseGwei(amount) as any,
  })

  // console.log(withDrawData)

  const { data: setCollateralAmountData, isLoading: setCollateralAmountIsLoading, isSuccess: setCollateralAmountIsSuccess, error: setCollateralAmountError, status: setCollateralAmountStatus } = useSimulateContract({
    address: contractAddress,
    abi: lendingPoolAbi,
    functionName: 'setCollateralAmount',
    args: [index as number],
  })

  // console.log(setCollateralAmountData, setCollateralAmountIsLoading, setCollateralAmountIsSuccess, setCollateralAmountError, setCollateralAmountStatus)

  const { data: cancelCollateralData, isLoading: cancelCollateralIsLoading, isSuccess: cancelCollateralIsSuccess, error: cancelCollateralError, status: cancelCollateralStatus } = useSimulateContract({
    address: contractAddress,
    abi: lendingPoolAbi,
    functionName: 'cancelCollateral',
    args: [index as number],
  })

  const { data: getLoanData, isLoading: getLoanIsLoading, isSuccess: getLoanIsSuccess, error: getLoanError, status: getLoanStatus } = useSimulateContract({
    address: contractAddress,
    abi: lendingPoolAbi,
    args: [loanAmount as number],
    functionName: 'getLoan',
  })

  // console.log(getLoanData, getLoanError)

  const { data: repayLoanData, isLoading: repayLoanIsLoading, isSuccess: repayLoanIsSuccess, error: repayLoanError, status: repayLoanStatus } = useSimulateContract({
    address: contractAddress,
    abi: lendingPoolAbi,
    value: parseEther(repayAmount) as any,
    args: [],
    functionName: 'repayLoan',
  })

  // console.log(repayLoanData, repayLoanError)

  const accountBalance: AccountBalance = useBalance({
    address: account.address as `0x${string}`,
  })
  const poolBalance: PoolBalance = useBalance({
    address: contractAddress as `0x${string}`,
  })

  const { writeContract } = useWriteContract()

  const assetstoBorrow = [
    {
      asset: "WBTC",
      available: 0.0010560,
      APY: 0.01
    },
    {
      asset: "USDT",
      available: 63.36,
      APY: 0.07
    },
    {
      asset: "LINK",
      available: 2.11,
      APY: 470.01
    },
    {
      asset: "USDC",
      available: 63.36,
      APY: 1.61
    },
    {
      asset: "DAI",
      available: 63.36,
      APY: 1.01
    },
    {
      asset: "EURS",
      available: 56.26,
      APY: 3.96
    }
  ]



  return (
    <div className="bg-[url(https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)] bg-cover pb-6">
      {/* <div>
        <Carousel />
      </div> */}
      {/* <Catchboxes /> */}

      {/* <AssetTable /> */}
      {/* <div className="h-5/6 bg-[url(https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)]  bg-cover text-sky-500 ">
        <div className="ml-4">

          <div className="">
            <h2>Account</h2>

            <div>
              status: {account.status}
              <br />
              addresses: {JSON.stringify(account.addresses)}
              <br />
              chainId: {account.chainId}
            </div>
            {account.status === 'connected' || account.status === 'connecting' && (
              <button type="button" onClick={() => disconnect()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Disconnect
              </button>
            )}
          </div>

          <div className="flex gap-4">
            {account.status === 'connected' && (
              <h4 className="font-normal">
                Account Balance :
                <span className="font-bold">
                  {accountBalance?.data?.formatted} {accountBalance?.data?.symbol}
                </span>
              </h4>
            )}
            <div className="font-bold">
              pool balance:
              <span className="font-normal">
                {poolBalance?.data?.formatted} {poolBalance?.data?.symbol}
              </span>
            </div>
          </div >

          <div>
            <h2>Connect</h2>
            {connectors.map((connector: any) => (
              <button key={connector.uid} onClick={() => connect({ connector })} type="button" className="bg-[#A51C2D] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                {connector.name}
              </button>
            ))}
            <div>{status}</div>
            <div>{error?.message}</div>
          </div>

          <div>
            <h2>Deposit</h2>
            <input type="number" onChange={(event) => setAmount(event.target.value)} className="border border-gray-300 rounded px-2 py-1" value={amount} step="any" min="0.005" placeholder="Deposit Amount (in ETH)" />
            <button disabled={simulatedContractError || amount < 0.005} onClick={() => writeContract(simulatedContractData?.request)} className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded disabled:bg-gray-400">
              {simulatedContractIsLoading ? 'Loading...' : simulatedContractIsSuccess ? 'Deposit' : 'Error'}
            </button>
          </div>
          <div>
            {
              <p className="text-red-500">{amount < 0.005 && 'Minimum deposit amount is 0.005'}</p>
            }
          </div>
          <div>
            <h2>Withdraw</h2>
            <input type="number" onChange={(event: any) => setIndex(event.target.value)} className="border border-gray-300 rounded px-2 py-1" placeholder="Index" />

            <button onClick={() => writeContract(withDrawData?.request as any, Number(index) as any)} className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded disabled:bg-gray-400">Withdraw</button>
          </div>

          <div>
            <h2>Get Loan</h2>
            <input type="number" onChange={(event) => setLoanAmount(event.target.value)} className="border border-gray-300 rounded px-2 py-1" placeholder="Loan Amount (in gwei)" />
            <button onClick={() => writeContract(getLoanData?.request, Number(loanAmount))} className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded">Get Loan</button>

          </div>

          <div>
            <h2>Repay Loan</h2>
            <input type="number" onChange={(event) => setRepayAmount(event.target.value)} className="border border-gray-300 rounded px-2 py-1" placeholder="Repay Amount (in ETH)" />
            <button onClick={() => writeContract(repayLoanData?.request, Number(repayAmount))} className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded">Repay Loan</button>
          </div>
          <Account />
          <Balance />
          {/* <Reading /> */}

      {/* <div>
            <p>User Loan Amount: {userLoanAmount && userLoanAmount}</p>
            <p>User Collateral: {userCollateral && userCollateral}</p>
            <p>Deposited Value: {depositedValue && depositedValue}</p>
            <ul>
              {transactions.map((transaction, index) => (
                <li key={index}>
                  Amount: {transaction.amount.toString()} Wei,
                  Use as Collateral: {transaction.useAsCollateral.toString()},
                  Can Withdraw: {transaction.canWithdrawal.toString()},
                  Timestamp: {transaction.timestamp.toString()}
                </li>
              ))}
            </ul>
          </div>
        </div> */}
      {/* </div> */}

      <div>
        <div className="bg-[#bddeec00] h-44 text-white mx-6">
          <h1 className="text-[#339ad5] font-bold text-3xl uppercase">
            eth market
          </h1>
          <div className="flex justify-around">
            <div>
              <h4>Net Worth</h4>
              <h3>
                {poolBalance?.data?.formatted + ' ' + poolBalance?.data?.symbol}
              </h3>
            </div>
            <div>
              <h4>Net APY</h4>
              <h3>0.000000000</h3>
            </div>
            <div>
              <h4>Health factor</h4>
              <h3>0.00000000</h3>
            </div>
          </div>
        </div>
        <div className="flex flex-col mx-6 mt-[-20px] gap-5 xl:flex-row text-white">
          <div className=" flex-1 flex flex-col gap-3">

            <div className="bg-[#78787853] flex flex-col gap-5">
              <h2 className="text-2xl font-bold">Your Supplies</h2>
              <div className="flex gap-6">
                <h5 className="border p-1">Balance {poolBalance?.data?.formatted}</h5>
                <h5 className="border p-1">APY</h5>
                <h5 className="border p-1">Collateral {userCollateral / 10 ** 18} {poolBalance?.data?.symbol}</h5>
              </div>
              <table className="w-full text-center">
                <thead className="border-b">
                  <th>Asset</th>
                  <th>Balance</th>
                  <th>APY</th>
                  <th>Collateral</th>
                </thead>
                <tbody>
                  <tr>
                    <td>{poolBalance?.data?.symbol}</td>
                    <td>{poolBalance?.data?.formatted}</td>
                    <td>0%</td>
                    <td>
                      <label className="relative inline-flex items-center me-5 cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-[#64d6f4] dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#64d6f4]"></div>
                      </label>
                    </td>
                    <td className="flex flex-col gap-1 my-2">
                      <div>
                        <div className="w-50 flex mb-2">
                          <input type="number" onChange={(event) => setAmount(event.target.value)} className="border border-gray-300 rounded px-2 py-1 text-black" value={amount} step="any" min="0.005" placeholder="Deposit Amount (in ETH)" />
                          <button disabled={simulatedContractError || amount < 0.005} onClick={() => writeContract(simulatedContractData?.request)} className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-6 rounded disabled:bg-gray-400">
                            {simulatedContractIsLoading ? 'Loading...' : simulatedContractIsSuccess ? 'Deposit' : 'Error'}
                          </button>
                        </div>
                        <div className="w-50 flex">
                          <input type="number" onChange={(event: any) => setIndex(event.target.value)} className="border border-gray-300 rounded px-2 py-1" placeholder="Index" />

                          <button onClick={() => writeContract(withDrawData?.request as any, Number(index) as any)} className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded disabled:bg-gray-400">Withdraw</button>
                        </div>
                      </div>

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-[#78787853]">
              <h2 className="text-2xl font-bold mb-5">Assets to Supply</h2>
              <table className="w-full text-center">
                <thead className="border-b">
                  <th>Asset</th>
                  <th>Wallet Balance</th>
                  <th>APY</th>
                  <th>Can be collateral</th>
                </thead>
                <tbody>
                  <tr>
                    <td>ETH</td>
                    <td>2.38</td>
                    <td>0%</td>
                    <td className="text-green-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-full h-6 ">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </td>
                    <td className="flex gap-1"><button className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded">Deposit</button></td>
                  </tr>
                  <tr>
                    <td>WBTC</td>
                    <td>0.0016</td>
                    <td>0.01%</td>
                    <td className="text-green-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-full h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    </td>
                    <td className="flex gap-1"><button className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded">Deposit</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3">

            <div className="bg-[#78787853] flex flex-col gap-5">

              <h2 className="text-2xl font-bold ">Your Borrows</h2>
              <div className="flex gap-6">
                <h5 className="border p-1">Balance {poolBalance?.data?.formatted}</h5>
                <h5 className="border p-1">APY</h5>
              </div>
              <table className="w-full text-center">
                <thead className="border-b">
                  <th>Asset</th>
                  <th>Balance</th>
                  <th>APY</th>
                  <th>Collateral</th>
                </thead>
                <tbody>
                  <tr>
                    <td>{poolBalance?.data?.symbol}</td>
                    <td>{userLoanAmount / 10 ** 18}</td>
                    <td>0%</td>
                    <td>
                      <label className="relative inline-flex items-center me-5 cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-[#64d6f4] dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#64d6f4]"></div>
                      </label>
                    </td>
                    <td className="flex flex-col gap-1 my-2">
                      <div>
                        <div className="w-50 flex mb-2">
                          <input type="number" onChange={(event) => setLoanAmount(event.target.value)} className="border border-gray-300 rounded py-1 text-black" placeholder="Loan Amount (in gwei)" />
                          <button onClick={() => writeContract(getLoanData?.request, Number(loanAmount))} className="bg-[#339ad5] text-black hover:bg-[#64d6f4] font-bold py-2 px-2 rounded">Borrow</button>
                        </div>
                        <div className="w-50 flex">
                          <input type="number" onChange={(event) => setRepayAmount(event.target.value)} className="border border-gray-300 rounded py-1" placeholder="Repay Amount (in ETH)" />
                          <button onClick={() => writeContract(repayLoanData?.request, Number(repayAmount))} className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded">Repay</button>
                        </div>
                      </div>

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-[#78787853]">
              <h2 className="text-2xl font-bold mb-5">Assets to Borrow</h2>
              <table className="w-full text-center">
                <thead className="border-b">
                  <th>Asset</th>
                  <th>Wallet Balance</th>
                  <th>APY</th>
                  <th>Can be collateral</th>
                </thead>
                <tbody>
                  {assetstoBorrow?.map((singleAsset: any) => (
                    <tr className="text-center">
                      <td>{singleAsset.asset}</td>
                      <td>{singleAsset.available}</td>
                      <td>{singleAsset.APY}</td>
                      <td className="text-green-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-full h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      </td>
                      <td className="flex gap-1"><button className="bg-[#339ad5] text-white hover:bg-[#64d6f4] font-bold py-2 px-4 rounded">Deposit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </div>

  );
}

export default Page;

// pool balance:0.05505 SEP

// Account Balance :2.8016256360348772 SEP
// 2.6771

// Account Balance :2.725518924143790635 SEP
// pool balance:0.00005 SEP

// Account Balance :2.668733373746228187 SEP
// pool balance:0.05005 SEP

// Account Balance :3.109559664029589392 SEP
// pool balance:0.05 SEP

// Account Balance :3.108175368388496114 SEP
// pool balance:0.049 SEP