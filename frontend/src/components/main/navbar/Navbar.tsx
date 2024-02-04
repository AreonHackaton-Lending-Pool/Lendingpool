"use client"
import { Fragment, useState } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useConnect, useDisconnect } from 'wagmi'
import { useAccount } from 'wagmi'
import { Web3Button } from '@web3modal/react'
import ConnectButton from '../connectButton/ConnectButton'

const navigation = [
  { name: 'Home', href: '/', current: true },
  // { name: 'Team', href: '/team', current: false },
  { name: 'Portfolio', href: '/portfolio', current: false },
  { name: 'Calendar', href: '#', current: false },
  { name: 'Create Pool', href: '/create-pool', current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {

  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [activeItem, setActiveItem] = useState(navigation[0].name);

  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName);
  };

  return (
    <Disclosure as="nav" className="bg-[#339ad5]">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <Link href="/">
                  <div className="flex flex-shrink-0 items-center">
                    <img
                      className="h-10 w-auto"
                      src="https://media.discordapp.net/attachments/1202747236283322479/1202979004739485716/logo-active-mode.png?ex=65cf6c80&is=65bcf780&hm=f34d5047d91898457b6d3a34a8caa33d59be5a0dca14f392e3b7e82bb794d1d9&=&format=webp&quality=lossless&width=431&height=431"
                      alt="Your Company"
                    />
                  </div>
                </Link>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                        onClick={() => handleItemClick(item.name)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sm:flex sm:flex-row-reverse">
                <ConnectButton />
              </div>
            </div>
          </div>

          {/* <Disclosure.Panel className="">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <button onClick={() => { disconnect() }}>Disconnect</button>
          </Disclosure.Panel> */}

        </>
      )}
    </Disclosure>
  )
}