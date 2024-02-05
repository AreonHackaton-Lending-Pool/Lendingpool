// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract LendingPool {

    address public tokenAddress;
    uint256 private totalDepositedAmount;
    uint256 private totalBorrowAmount;
    uint256 public totalCollateralAmount;
    uint256 public liquidationThreshold = 75;
    uint256 private healthFactor;
    uint256 public interestAmount;
    uint256 public withdrawTimeStamp;
    uint256 public repayBorrowTimeStamp;
    string public tokenSymbol;
    IERC20 private token;

    uint256 private constant apyLowUtilization = 100; // 1%
    uint256 private constant apyMediumUtilization = 200; // 2%
    uint256 private constant apyHighUtilization = 2000; // 20%

    address private commissionPool = 0x63be8eA7C2966B0d6b74A4773cf532b42ecD405D;
    
    AggregatorV3Interface internal dataFeed;

    constructor(string memory _tokenSymbol, address _tokenAddress) payable {
        totalDepositedAmount = msg.value;
        tokenSymbol = _tokenSymbol;
        tokenAddress = _tokenAddress;
        token = ERC20(_tokenAddress);
        dataFeed = AggregatorV3Interface(0xc59E3633BAAC79493d908e63626716e204A45EdF);
    }

    // Struct representing a user transaction
    struct DepositTransaction {
        uint256 amount;
        bool useAsCollateral;
        uint256 depositTimeStamp;
    }

    struct BorrowTransaction {
        uint256 amount;
        uint256 borrowTimeStamp;
    }

    mapping(address => DepositTransaction[]) private depositTransactions; // Mapping of user addresses to their deposit transactions
    mapping(address => BorrowTransaction[]) private borrowTransactions; // Mapping of user addresses to their borrow transactions
    mapping(address => uint256) private userCollateralAmount; // Mapping of user addresses to their total collateral amount
    mapping(address => uint256) private userBorrowAmount; // Mapping of user addresses to their total borrow amount
    mapping(address => uint256) private userSupplyAmount; // Mapping of user addresses to theri total supply amount
    mapping(address => mapping (address => uint256)) private allowed;

    event DepositMade(address indexed depositor, uint256 amount); // Event emmitted when a user deposit funds
    event BorrowRepayment(address indexed borrower, uint256 repaidAmount); // Event emitted when a user repays a borrow
    event Withdrawal(address _from, uint256 amount, uint256 commission); // Event emitted when a user withdraws funds
    event Loan(address indexed borrower, uint256 amount); // Event emitted when a user borrows funds

    function deposit(uint256 amount) external payable {

        // Create a new transaction and add it to the user's transactions
        DepositTransaction memory newDepositTransaction = DepositTransaction({
            amount: amount,
            useAsCollateral: true,
            depositTimeStamp: block.timestamp // Set timestamp when depositing
        });

        depositTransactions[msg.sender].push(newDepositTransaction);
        totalDepositedAmount += amount;
        totalCollateralAmount += amount;
        userCollateralAmount[msg.sender] += amount;
        userSupplyAmount[msg.sender] += amount;

        if (userBorrowAmount[msg.sender] == 0) {
            healthFactor = type(uint256).max;
        } else {
            healthFactor = (userCollateralAmount[msg.sender] * liquidationThreshold) / userBorrowAmount[msg.sender];
        }
        //uint256 actualHealthFactor = healthFactor / 100;

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
    }

    // Function for users to withdraw funds from a specific transaction
    function withdraw(uint256 index) public payable {
        require(
            index < depositTransactions[msg.sender].length,
            "No such transaction found"
        );

        uint256 indexAmount = depositTransactions[msg.sender][index].amount;

        // Calculate interest
        uint256 interestRate = calculateAPY() / 100;
        withdrawTimeStamp = block.timestamp;
        uint256 deltaTimeStamp = (withdrawTimeStamp - depositTransactions[msg.sender][index].depositTimeStamp);
        uint256 interestRatePerSecond = 3162240000;
        interestAmount = (indexAmount * deltaTimeStamp * interestRate) / interestRatePerSecond;

        uint256 commision = (indexAmount) / 1000;
        uint256 amountAfterCommission = (indexAmount - commision) - interestAmount;

        if (depositTransactions[msg.sender][index].useAsCollateral) {
            totalCollateralAmount -= indexAmount;
            userCollateralAmount[msg.sender] -= indexAmount;
        }

        if (userBorrowAmount[msg.sender] == 0 && userCollateralAmount[msg.sender] != 0 ) {
            healthFactor = type(uint256).max;
        } else if (userBorrowAmount[msg.sender] == 0 && userCollateralAmount[msg.sender] == 0) {
            healthFactor = 0;
        } else {
            healthFactor = (userCollateralAmount[msg.sender] * liquidationThreshold) / userBorrowAmount[msg.sender];
        }
        // //uint256 actualHealthFactor = healthFactor / 100;

        totalDepositedAmount -= indexAmount;
        userSupplyAmount[msg.sender] -= indexAmount;

        IERC20(tokenAddress).transfer(address(msg.sender), amountAfterCommission);
        IERC20(tokenAddress).transfer(address(commissionPool), commision);
        
        // Move the last element to the deleted position and pop the last element
        if (index < depositTransactions[msg.sender].length - 1) {
            depositTransactions[msg.sender][index] = depositTransactions[msg.sender][depositTransactions[msg.sender].length - 1];
        }
        depositTransactions[msg.sender].pop();

        emit Withdrawal(msg.sender, amountAfterCommission, commision);
    }
    

    // Function for users to set a specific transaction as collateral or not
    function setCollateralAmount(uint256 index) public {
        require(
            index < depositTransactions[msg.sender].length,
            "Index not found"
        );

        DepositTransaction storage transaction = depositTransactions[msg.sender][index];

        require(
            transaction.useAsCollateral == false,
            "You already set this transaction as a collateral"
        );

        if (userBorrowAmount[msg.sender] == 0) {
            healthFactor = type(uint256).max;
        } else {
            healthFactor = (userCollateralAmount[msg.sender] * liquidationThreshold) / userBorrowAmount[msg.sender];
        }

        require(
            healthFactor > 100,
            "You can not cancel this collateral cause of health factor downing below 1"
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

        DepositTransaction storage transaction = depositTransactions[msg.sender][
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

        if (userBorrowAmount[msg.sender] == 0 && userCollateralAmount[msg.sender] != 0 ) {
            healthFactor = type(uint256).max;
        } else if (userBorrowAmount[msg.sender] == 0 && userCollateralAmount[msg.sender] == 0) {
            healthFactor = 0;
        } else {
            healthFactor = (userCollateralAmount[msg.sender] * liquidationThreshold) / userBorrowAmount[msg.sender];
        }

        if (userBorrowAmount[msg.sender] != 0) {
            require(
            healthFactor > 100,
            "You can not cancel this collateral cause of health factor downing below 1"
            );
        }
    }


    function getUtilizationRate() public view returns (uint256) {
        if (totalDepositedAmount == 0) return 0;
        return (totalBorrowAmount * 1e18) / totalDepositedAmount; // 1e18 for precision
    } 

    function calculateAPY() public view returns (uint256) {
        uint256 utilizationRate = getUtilizationRate();

        // Low Utilization Threshold (e.g., 30%)
        uint256 lowUtilizationThreshold = 30 * 1e16; // 30%

        // Medium Utilization Threshold (e.g., 80%)
        uint256 highUtilizationThreshold = 80 * 1e16; // 80%

        if (utilizationRate < lowUtilizationThreshold) {
            // Low utilization: Lower APY to incentivize borrowing
            return apyLowUtilization; // e.g., 1%
        } else if (utilizationRate < highUtilizationThreshold) {
            // Medium utilization: Linearly increasing APY
            uint256 slope = ((apyHighUtilization - apyMediumUtilization) * 1e18) / (highUtilizationThreshold - lowUtilizationThreshold);
            uint256 apyIncrease = (slope * (utilizationRate - lowUtilizationThreshold)) / 1e18;
            return apyMediumUtilization + apyIncrease; // e.g., interpolate between 2% and 19%
        } else {
            // High utilization: Higher APY to incentivize more deposits and discourage further borrowing
            return apyHighUtilization; // e.g., 20% or more
        }
    }

    function calculateAPR() public view returns (uint256) {
        uint256 utilizationRate = getUtilizationRate();

        // Low Utilization Threshold (e.g., 30%)
        uint256 lowUtilizationThreshold = 30 * 1e16; // 30%

        // Medium Utilization Threshold (e.g., 80%)
        uint256 highUtilizationThreshold = 80 * 1e16; // 80%

        uint256 lowLtvApr = apyLowUtilization + 400;
        uint256 mediumLtvApr = apyMediumUtilization + 400;
        uint256 highLtvApr = apyHighUtilization + 400;

        uint256 slope;
        uint256 apyIncrease;

        if (utilizationRate < lowUtilizationThreshold) {
            // Low utilization: Lower APY to incentivize borrowing
            if (getPoolTVL() <= getTotalSupplies() * 30 / 100) {
                return lowLtvApr; // e.g., 5%
            }
            return apyLowUtilization; // e.g., 1%
        } else if (utilizationRate < highUtilizationThreshold) {
            // Medium utilization: Linearly increasing APY
            if (getPoolTVL() <= getTotalSupplies() * 30 / 100) {
                slope = ((highLtvApr - mediumLtvApr) * 1e18) / (highUtilizationThreshold - lowUtilizationThreshold);
                apyIncrease = (slope * (utilizationRate - lowUtilizationThreshold)) / 1e18;
                return mediumLtvApr + apyIncrease; // e.g., interpolate between 6% and 23%
            }
            slope = ((apyHighUtilization - apyMediumUtilization) * 1e18) / (highUtilizationThreshold - lowUtilizationThreshold);
            apyIncrease = (slope * (utilizationRate - lowUtilizationThreshold)) / 1e18;
            return apyMediumUtilization + apyIncrease; // e.g., interpolate between 2% and 19%
        } else {
            // High utilization: Higher APY to incentivize more deposits and discourage further borrowing
            if (getPoolTVL() <= getTotalSupplies() * 30 / 100) {
                return highLtvApr; // e.g., 24% or more
            }
            return apyHighUtilization; // e.g., 20% or more
        }
    }


    // Function for users to borrow funds from their collateral
    function getBorrow(uint256 amount) external payable  {
        require(
            amount <= userCollateralAmount[msg.sender],
            "Borrow amount exceeds collateral"
        );

        BorrowTransaction memory newBorrowTransaction = BorrowTransaction( {
            amount: amount,
            borrowTimeStamp: block.timestamp
        });

        borrowTransactions[msg.sender].push(newBorrowTransaction);

        // Deduct the borrow amount from the user's collateral
        totalCollateralAmount -= amount;
        userCollateralAmount[msg.sender] -= amount;

        // Increase the user's borrow amount
        totalBorrowAmount += amount;
        userBorrowAmount[msg.sender] += amount;

        healthFactor = (userCollateralAmount[msg.sender] * liquidationThreshold) / userBorrowAmount[msg.sender];
        // uint256 actualHealthFactor = healthFactor / 100;

        // If the health factor is less than 1, the transaction is not allowed
        require(healthFactor > 100, "You can not borrow, your health factor must be above 1!");

        IERC20(tokenAddress).transfer(address(msg.sender), amount);

        // Emit an event for the borrow
        emit Loan(msg.sender, amount);
    }


    // Function for users to repay their borrow
    function repayBorrow(uint256 index) public payable {
        require(
            index < borrowTransactions[msg.sender].length,
            "Invalid index"
        );

        uint256 indexAmount = borrowTransactions[msg.sender][index].amount;

        // Update user's borrow amount and total collateral
        totalBorrowAmount -= indexAmount;
        userBorrowAmount[msg.sender] -= indexAmount;
        totalCollateralAmount += indexAmount;
        userCollateralAmount[msg.sender] += indexAmount;

        // Calculate interest
        uint256 interestRate = calculateAPR() / 100;
        repayBorrowTimeStamp = block.timestamp;
        uint256 deltaTimeStamp = (repayBorrowTimeStamp - borrowTransactions[msg.sender][index].borrowTimeStamp);
        uint256 interestRatePerSecond = 3162240000;
        interestAmount = (indexAmount * deltaTimeStamp * interestRate) / interestRatePerSecond;

        if (userBorrowAmount[msg.sender] == 0) {
            healthFactor = type(uint256).max;
        } else {
            healthFactor = (userCollateralAmount[msg.sender] * liquidationThreshold) / userBorrowAmount[msg.sender];
        }
        //uint256 actualHealthFactor = healthFactor / 100;

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), indexAmount + interestAmount);

        // Move the last element to the deleted position and pop the last element
        if (index < borrowTransactions[msg.sender].length - 1) {
            borrowTransactions[msg.sender][index] = borrowTransactions[msg.sender][borrowTransactions[msg.sender].length - 1];
        }
        borrowTransactions[msg.sender].pop();

        // Emit an event for the borrow repayment
        emit BorrowRepayment(msg.sender, indexAmount);
    }


    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    
    function getDerivedPrice(address _base, address _quote, uint8 _decimals) public view returns (int256) {
        require(
            _decimals > uint8(0) && _decimals <= uint8(18),
            "Invalid _decimals"
        );
        int256 decimals = int256(10 ** uint256(_decimals));
        (, int256 basePrice, , , ) = AggregatorV3Interface(_base).latestRoundData();
        uint8 baseDecimals = AggregatorV3Interface(_base).decimals();
        basePrice = scalePrice(basePrice, baseDecimals, _decimals);

        (, int256 quotePrice, , , ) = AggregatorV3Interface(_quote).latestRoundData();
        uint8 quoteDecimals = AggregatorV3Interface(_quote).decimals();
        quotePrice = scalePrice(quotePrice, quoteDecimals, _decimals);

        return (basePrice * decimals) / quotePrice;
    }

    function scalePrice(int256 _price, uint8 _priceDecimals, uint8 _decimals) internal pure returns (int256) {
        if (_priceDecimals < _decimals) {
            return _price * int256(10 ** uint256(_decimals - _priceDecimals));
        } else if (_priceDecimals > _decimals) {
            return _price / int256(10 ** uint256(_priceDecimals - _decimals));
        }
        return _price;
    }


    function getUserBalance(address user) public view returns (uint256) {
        return token.balanceOf(user);
    }

    function getUserTotalSupplies(address user) public view returns (uint256) {
        return userSupplyAmount[user];
    }

    // Function to check the user's outstanding borrow amount
    function getUserBorrowAmount(address user) public view returns (uint256) {
        return userBorrowAmount[user];
    }

    // Function to get the user's collateral amount
    function getUserCollateral(address user) public view returns (uint256) {
        return userCollateralAmount[user];
    }

    // Function to get the total deposited value in Ether
    function getTotalSupplies() public view returns (uint256) {
        return totalDepositedAmount;
    }
    
    function getTotalBorrows() public view returns (uint256) {
        return totalBorrowAmount;
    }

    function getPoolTVL() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    // Function to get all transactions of the calling user
    function getAllDepositTransactions(address user) public view returns (DepositTransaction[] memory) {
        return depositTransactions[user];
    }
    function getAllBorrowTransactions(address user) public view returns (BorrowTransaction[] memory) {
        return borrowTransactions[user];
    }

    function getInterestAmount() public view returns (uint256) {
        return interestAmount;
    }

    function getHealthFactor() public view returns (uint256) {
        return healthFactor;
    }

    function getTokenSymbol() public view returns(string memory) {
        return tokenSymbol;
    }

    function getTokenAddress() public view returns(address) {
        return tokenAddress;
    }

}