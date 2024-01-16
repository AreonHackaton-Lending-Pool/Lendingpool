// components/Footer.js
const Footer = () => {
    return (
        <footer className="bg-[#339ad5] text-black p-8">
            <div className="container mx-auto flex flex-col md:flex-row justify-between">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-2xl font-bold mb-2">Süleyman Lending Pool DApp</h2>
                    <p className="text-sm">
                        A decentralized lending platform built with Next.js and Tailwind CSS.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/dashboard">Dashboard</a>
                            </li>
                            <li>
                                <a href="/lending">Lending</a>
                            </li>
                            <li>
                                <a href="/borrowing">Borrowing</a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Resources</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="/faq">FAQ</a>
                            </li>
                            <li>
                                <a href="/terms">Terms of Service</a>
                            </li>
                            <li>
                                <a href="/privacy">Privacy Policy</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-700 mt-6 pt-4 text-center">
                <p>&copy; 2024 Süleyman Lending Pool DApp. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
