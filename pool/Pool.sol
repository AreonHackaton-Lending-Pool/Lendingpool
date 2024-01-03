// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BankDeposit {
    address private ownerBank;
    uint256 private totalDepositedAmount;
    uint256 public totalCollateralAmount;

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
        uint256 timestamp;
    }

    mapping(address => Transaction[]) private depositTransactions; // Mapping of user addresses to their deposit transactions
    mapping(address => uint256) public userCollateralAmount; // Mapping of user addresses to their total collateral amount
    mapping(uint256 => address) private collateralIndexToAddress; // Mapping of collateral indices to user addresses
    uint256 private nextCollateralIndex; // Counter for the next collateral index
    mapping(address => uint256) public userLoanAmount; // Mapping of user addresses to their total loan amount

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
            useAsCollateral: false,
            canWithdrawal: true,
            timestamp: block.timestamp // Set timestamp when depositing
        });

        depositTransactions[msg.sender].push(newTransaction);
        totalDepositedAmount += msg.value;
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

        uint256 commision = (depositTransactions[msg.sender][index].amount) /
            1000;
        uint256 amount = (depositTransactions[msg.sender][index].amount) -
            commision;

        if (depositTransactions[msg.sender][index].useAsCollateral) {
            require(amount <= totalCollateralAmount, "Insufficient collateral");
            totalCollateralAmount -= depositTransactions[msg.sender][index]
                .amount;
            userCollateralAmount[msg.sender] -= depositTransactions[msg.sender][
                index
            ].amount;
        }

        payable(msg.sender).transfer(amount);
        totalDepositedAmount -= depositTransactions[msg.sender][index].amount;

        require(
            depositTransactions[msg.sender][index].canWithdrawal == true,
            "You already withdrawn this transaction"
        );
        depositTransactions[msg.sender][index].canWithdrawal = false;

        emit Withdrawal(msg.sender, amount, commision);
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

        transaction.useAsCollateral = true;

        if (transaction.useAsCollateral) {
            userCollateralAmount[msg.sender] += transaction.amount / 10**18;
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

        require(transaction.useAsCollateral == true, "You don't set this transaction as a collateral");

        transaction.useAsCollateral = false;

        if (transaction.useAsCollateral == false) {
            userCollateralAmount[msg.sender] -= transaction.amount / 10**18;
            totalCollateralAmount -= transaction.amount;
        }
    }

    // Function for users to borrow funds from their collateral
    function getLoan(uint256 loanAmount) external {
        uint256 loanAmountinEth = loanAmount * 10**18;
        require(
            loanAmount <= userCollateralAmount[msg.sender],
            "Loan amount exceeds collateral"
        );

        // Deduct the loan amount from the user's collateral
        totalCollateralAmount -= loanAmount;
        userCollateralAmount[msg.sender] -= loanAmount;

        // Increase the user's loan amount
        userLoanAmount[msg.sender] += loanAmountinEth;

        payable(msg.sender).transfer(loanAmountinEth);

        // Emit an event for the loan
        emit Borrow(msg.sender, loanAmount);
    }

    // Function for users to repay their loan
    function repayLoan() external payable {
        require(
            msg.value <= userLoanAmount[msg.sender],
            "Repayment amount exceeds outstanding loan"
        );

        // Update user's loan amount and total collateral
        userLoanAmount[msg.sender] -= msg.value;
        totalCollateralAmount += msg.value;

        // Emit an event for the loan repayment
        emit LoanRepayment(msg.sender, msg.value);
    }

    // Function to check the user's outstanding loan amount
    function getUserLoanAmount() external view returns (uint256) {
        return userLoanAmount[msg.sender];
    }

    // Function to get the user's collateral amount
    function getUserCollateral(address user) public view returns (uint256) {
        return userCollateralAmount[user] / 10**18;
    }

    // Function to get the total deposited value in Ether
    function getDepositedValue() public view returns (uint256) {
        return totalDepositedAmount / 10**18;
    }

    // Function to get all transactions of the calling user
    function getAllTransactions() public view returns (Transaction[] memory) {
        return depositTransactions[msg.sender];
    }
}
