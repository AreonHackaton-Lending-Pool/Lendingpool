import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

const ConnectButton = () => {
    function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(' ')
    }
    const links = [
        { href: '/account-settings', label: 'Account settings' },
        { href: '/support', label: 'Support' },
        { href: '/license', label: 'License' },
        { href: '/sign-out', label: 'Sign out' },
    ]

    const account = useAccount();
    const { connectors, connect, status, error } = useConnect();
    const { disconnect } = useDisconnect();
    return (
        <div>
            {account.isConnected ? (
                <Menu as="div" className="relative inline-block text-left text-white">
                    <div>
                        <Menu.Button tabIndex={0} className="inline-flex justify-center gap-x-1.5 rounded-md bg-transparent px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-gray-950 text-ellipsis overflow-hidden w-32 text-white">
                            <p>{account.address}</p>
                            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                        </Menu.Button>
                    </div>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >

                        <Menu.Items className="absolute right-0 z-10 mt-3 w-56 origin-top-right rounded-md bg-transparent backdrop-blur-md text-white border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none flex flex-col justify-center">
                            {/* <Menu.Item as={Fragment} disabled>
                                {({ active }) => (
                                    account.status && <p className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm')}>Status: {account.status}</p>
                                )
                                }
                            </Menu.Item> */}
                            <Menu.Item as={Fragment} disabled>
                                {({ active }) => (
                                    <div className='w-full break-words'>
                                        {account.address && <p className={classNames(active ? 'bg-transparent text-red-600' : 'text-white', 'block px-4 py-2 text-sm whitespace-break-spaces')}>Account: {account.address}</p>
                                        }
                                    </div>
                                )}
                            </Menu.Item>
                            <Menu.Item as={Fragment} disabled>
                                {({ active }) => (
                                    account.chain && <p className={classNames(active ? 'bg-gray-100 text-gray-900' : 'text-white', 'block px-4 py-2 text-sm')}>Chain: {account.chain.name}</p>

                                )}
                            </Menu.Item>
                            <button onClick={() => disconnect()} className="block  px-4 py-2 rounded text-gray-50 bg-red-600 text-center">
                                Disconnect
                            </button>
                        </Menu.Items>
                    </Transition>
                </Menu>
            ) : (
                <div className='flex w-full gap-1'>
                    {
                        connectors.map((connector: any) => (
                            <button key={connector.uid} onClick={() => connect({ connector })} type="button" className="bg-[#1c45a5] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                {connector.name}
                            </button>
                        ))
                    }
                </div>
            )
            }
        </div >
    )
}
export default ConnectButton