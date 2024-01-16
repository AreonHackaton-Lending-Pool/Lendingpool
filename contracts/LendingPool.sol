// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BankDeposit {
    address private ownerBank;
    uint256 private totalDepositedAmount;
    uint256 public totalCollateralAmount;
    uint256 public liquidationThreshold;
    uint256 public healthFactor;
    uint256 public interestAmount;
    uint256 public withdrawTimeStamp;
    uint256 public loanTimeStamp;
    uint256 public repayLoanTimeStamp;
    
    // Constructor sets the contract owner and initializes the total deposited amount
    constructor() payable {
        ownerBank = msg.sender;
        totalDepositedAmount = msg.value;
    }

    // Struct representing a user transaction
    struct Transaction {
        uint256 amount;
        uint256 lockTime;
        bool useAsCollateral;
        bool canWithdrawal;
        uint256 depositTimeStamp;
    }

    mapping(address => Transaction[]) private depositTransactions; // Mapping of user addresses to their deposit transactions
    mapping(address => uint256) public userCollateralAmount; // Mapping of user addresses to their total collateral amount
    mapping(uint256 => address) private collateralIndexToAddress; // Mapping of collateral indices to user addresses
    uint256 private nextCollateralIndex; // Counter for the next collateral index
    mapping(address => uint256) public userLoanAmount; // Mapping of user addresses to their total loan amount
    // mapping(address => Loan[]) private loans;

    event DepositMade(address indexed depositor, uint256 amount);
    event LoanRepayment(address indexed borrower, uint256 repaidAmount); // Event emitted when a user repays a loan
    event Withdrawal(address _from, uint256 amount, uint256 commission); // Event emitted when a user withdraws funds
    event Borrow(address indexed borrower, uint256 amount); // Event emitted when a user borrows funds
    error BorrowError(); // Error definition for borrow-related errors

    // Modifier to restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == ownerBank, "You are not the owner");
        _;
    }

    // Function for users to deposit funds into the contract
    function deposit() external payable {
        require(
            msg.value >= 5000000 gwei,
            "Deposit must be at least 0.005 Ether"
        );

        // Create a new transaction and add it to the user's transactions
        Transaction memory newTransaction = Transaction({
            amount: msg.value,
            lockTime: block.timestamp + 1,
            useAsCollateral: true,
            canWithdrawal: true,
            depositTimeStamp: block.timestamp // Set timestamp when depositing
        });

        depositTransactions[msg.sender].push(newTransaction);
        totalDepositedAmount += msg.value;
        totalCollateralAmount += msg.value;
        userCollateralAmount[msg.sender] += msg.value;

        // liquidationThreshold = 75;
        // healthFactor =
        //     (userCollateralAmount[msg.sender] * liquidationThreshold) /
        //     userLoanAmount[msg.sender];
        // //uint256 actualHealthFactor = healthFactor / 100;
    }

    // Function for the contract owner to increase the lock time of the latest transaction
    function increaseLockTime(uint256 _secondsToIncrease) public onlyOwner {
        uint256 latestTransactionIndex = depositTransactions[msg.sender]
            .length - 1;
        depositTransactions[msg.sender][latestTransactionIndex]
            .lockTime += _secondsToIncrease;
    }

    // Function for users to withdraw funds from a specific transaction
    function withdraw(uint256 index) public {
        require(
            index < depositTransactions[msg.sender].length,
            "Invalid index"
        );
        require(
            block.timestamp > depositTransactions[msg.sender][index].lockTime,
            "Lock time has not expired"
        );

        //interestRate * depositTransactions[msg.sender] * depositTransactions[msg.sender][index].depositTimeStamp;

        // Calculate interest
        uint256 interestRate = 10;
        withdrawTimeStamp = block.timestamp;
        uint256 deltaTimeStamp = (withdrawTimeStamp - depositTransactions[msg.sender][index].depositTimeStamp);
        uint256 interestRatePerSecond = (interestRate / (365 * 24 * 60 *60)) * 10000000000;
        interestAmount = depositTransactions[msg.sender][index].amount * deltaTimeStamp * interestRatePerSecond;

        uint256 commision = (depositTransactions[msg.sender][index].amount) /
            1000;
        uint256 newAmount = (depositTransactions[msg.sender][index].amount -
            commision) - interestAmount;

        if (depositTransactions[msg.sender][index].useAsCollateral) {
            totalCollateralAmount -= depositTransactions[msg.sender][index]
                .amount;
            userCollateralAmount[msg.sender] -= depositTransactions[msg.sender][
                index
            ].amount;
        }

        liquidationThreshold = 75;
        healthFactor =
            (userCollateralAmount[msg.sender] * liquidationThreshold) /
            userLoanAmount[msg.sender];
        //uint256 actualHealthFactor = healthFactor / 100;

        payable(msg.sender).transfer(newAmount);
        totalDepositedAmount -= depositTransactions[msg.sender][index].amount;

        require(
            depositTransactions[msg.sender][index].canWithdrawal == true,
            "You already withdrawn this transaction"
        );
        depositTransactions[msg.sender][index].canWithdrawal = false;

        emit Withdrawal(msg.sender, newAmount, commision);
    }

    // Function for users to set a specific transaction as collateral or not
    function setCollateralAmount(uint256 index) public {
        require(
            index < depositTransactions[msg.sender].length,
            "Index not found"
        );

        Transaction storage transaction = depositTransactions[msg.sender][
            index
        ];

        require(
            transaction.useAsCollateral == false,
            "You already set this transaction as a collateral"
        );

        transaction.useAsCollateral = true;

        if (transaction.useAsCollateral) {
            userCollateralAmount[msg.sender] += transaction.amount;
            totalCollateralAmount += transaction.amount;
        }
    }

    function cancelCollateralAmount(uint256 index) public {
        require(
            index < depositTransactions[msg.sender].length,
            "Index not found"
        );

        Transaction storage transaction = depositTransactions[msg.sender][
            index
        ];

        require(
            transaction.useAsCollateral == true,
            "You have not designated this transaction as a collateral"
        );

        transaction.useAsCollateral = false;

        if (transaction.useAsCollateral == false) {
            userCollateralAmount[msg.sender] -= transaction.amount;
            totalCollateralAmount -= transaction.amount;
        }
    }

    // function calculateHealthFactor() public returns (uint256) {
    //     liquidationThreshold = 75;

    //     healthFactor =
    //         (userCollateralAmount[msg.sender] * liquidationThreshold) /
    //         userLoanAmount[msg.sender];
    //     uint256 actualHealthFactor = healthFactor / 100;

    //     require(actualHealthFactor > 1, "Health factor must be above 1");

    //     return actualHealthFactor;
    // }

    // Function for users to borrow funds from their collateral
    function getLoan(uint256 loanAmount) external {
        uint256 loanAmountInEther = loanAmount * 1 ether;
        require(
            loanAmount <= userCollateralAmount[msg.sender],
            "Loan amount exceeds collateral"
        );

        // Loan memory newLoan = Loan({
        //     borrower: msg.sender,
        //     debtAmount: loanAmount,
        //     // interestRate:1,
        //     isPaid: false,
        //     isLocked: true
        // });

        // Deduct the loan amount from the user's collateral
        totalCollateralAmount -= loanAmountInEther;
        userCollateralAmount[msg.sender] -= loanAmountInEther;

        // Increase the user's loan amount
        userLoanAmount[msg.sender] += loanAmountInEther;

        liquidationThreshold = 75;
        healthFactor =
            (userCollateralAmount[msg.sender] * liquidationThreshold) /
            userLoanAmount[msg.sender];
        // uint256 actualHealthFactor = healthFactor / 100;

        // Sağlık faktörü 1'den küçükse, 1 olarak ayarlanır.
        require(healthFactor >= 100, "Health factor must be above 1");

        payable(msg.sender).transfer(loanAmountInEther);

        loanTimeStamp = block.timestamp;

        // Emit an event for the loan
        emit Borrow(msg.sender, loanAmount);
    }

    // Function for users to repay their loan
    function repayLoan() external payable returns (uint256) {
        require(
            msg.value <= userLoanAmount[msg.sender],
            "Repayment amount exceeds outstanding loan"
        );

        // Update user's loan amount and total collateral
        userLoanAmount[msg.sender] -= msg.value;
        totalCollateralAmount += msg.value;
        userCollateralAmount[msg.sender] += msg.value;

        // Calculate interest
        uint256 interestRate = 8;
        repayLoanTimeStamp = block.timestamp;
        uint256 deltaTimeStamp = (repayLoanTimeStamp - loanTimeStamp);
        uint256 interestRatePerSecond = (interestRate / (365 * 24 * 60 *60)) * 10000000000;
        interestAmount = msg.value * deltaTimeStamp * interestRatePerSecond;

        liquidationThreshold = 75;
        healthFactor =
            (userCollateralAmount[msg.sender] * liquidationThreshold) /
            userLoanAmount[msg.sender];
        //uint256 actualHealthFactor = healthFactor / 100;

        // Emit an event for the loan repayment
        emit LoanRepayment(msg.sender, msg.value);
        return interestAmount;
    }

    // Function to check the user's outstanding loan amount
    function getUserLoanAmount(address user) external view returns (uint256) {
        return userLoanAmount[user];
    }

    // Function to get the user's collateral amount
    function getUserCollateral(address user) public view returns (uint256) {
        return userCollateralAmount[user];
    }

    // Function to get the total deposited value in Ether
    function getDepositedValue() public view returns (uint256) {
        return totalDepositedAmount;
    }

    // Function to get all transactions of the calling user
    function getAllTransactions(address user) public view returns (Transaction[] memory) {
        return depositTransactions[user];
    }

    function getInterestAmount() public view returns (uint256) {
        return interestAmount;
    }
}
