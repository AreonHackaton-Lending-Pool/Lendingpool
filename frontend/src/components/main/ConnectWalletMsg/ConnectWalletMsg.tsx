import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import ConnectButton from "../connectButton/ConnectButton";

const ConnectWalletMsg = () => {
  return (
    <>
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
                    <Dialog.Title
                      as="h2"
                      className="text-xl font-bold leading-6 text-gray-900 mb-8"
                    >
                      <img
                        src="https://static.wikia.nocookie.net/looneytunes/images/c/c7/Yosemite_Sam_fall.gif"
                        alt=""
                        className="mx-auto pt-5 mb-5 rounded-3xl w-80 h-52"
                      />
                    </Dialog.Title>
                    <div className="w-full my-5 text-center">
                      <h3 className="border-b font-bold text-2xl">
                        Please Connect Your Wallet
                      </h3>
                      <h6>Please connect your wallet to continue </h6>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-5 flex justify-center text-center sm:px-6 w-full">
                <ConnectButton />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </>
  );
};

export default ConnectWalletMsg;
