// script.js

// Array to store listed friends
let friends = [];

// Elements
const listForm = document.getElementById('listForm');
const friendsList = document.getElementById('friendsList');

// Ethers.js and Contract Setup
const contractAddress = "0xAc0ae0F395278bE4e6F9b7C5aE4895F8212a6E22";
const abi =[
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "friendId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "pricePerHour",
				"type": "uint256"
			}
		],
		"name": "FriendListed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "friendId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "renter",
				"type": "address"
			}
		],
		"name": "FriendRented",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "friends",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "pricePerHour",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "available",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "friendsLength",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_friendId",
				"type": "uint256"
			}
		],
		"name": "getFriend",
		"outputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "pricePerHour",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "available",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_pricePerHour",
				"type": "uint256"
			}
		],
		"name": "listFriend",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_friendId",
				"type": "uint256"
			}
		],
		"name": "rentFriend",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "rentals",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let provider;
let signer;
let contract;

document.getElementById('connectWalletBtn').addEventListener('click', async () => {
    if (window.ethereum) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = provider.getSigner();
            const walletAddress = await signer.getAddress();
            document.getElementById('walletStatus').textContent = `Connected: ${walletAddress}`;
        } catch (error) {
            console.error("Error connecting wallet:", error);
            document.getElementById('walletStatus').textContent = 'Wallet connection failed.';
        }
    } else {
        alert('MetaMask or compatible wallet not detected. Please install one.');
    }
});

if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);

    window.ethereum.request({ method: 'eth_requestAccounts' });
} else {
    alert("Please install MetaMask to use this app.");
}

// Handle form submission
listForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;

    try {
        const tx = await contract.listFriend(name, description, ethers.utils.parseEther(price));
        await tx.wait();
        alert("Friend listed successfully!");
        listForm.reset();
        loadFriends(); // Reload the friends list after listing
    } catch (error) {
        console.error(error);
        alert("An error occurred while listing the friend.");
    }
});

async function loadFriends() {
    try {
        // Verify the contract instance
        if (!contract) {
            throw new Error('Contract instance is not defined.');
        }

        // Get the total number of friends listed
        const friendCount = await contract.friendsLength();
        console.log(`Total friends: ${friendCount}`);

        // Clear the friends list
        const friendsList = document.getElementById('friendsList');
        if (!friendsList) {
            throw new Error('friendsList element not found in the DOM.');
        }
        friendsList.innerHTML = '';

        for (let i = 0; i < friendCount; i++) {
            const friend = await contract.getFriend(i);

            console.log(`Friend ${i}:`, friend);

            // Destructure the returned tuple for clarity
            const [owner, name, description, pricePerHour, available] = friend;

            // Only show available friends
            if (available) {
                const friendCard = document.createElement('div');
                friendCard.classList.add('friend-card');

                friendCard.innerHTML = `
                    <h3>${name}</h3>
                    <p>${description}</p>
                    <p><strong>Price:</strong> ${ethers.utils.formatEther(pricePerHour)} GAS/hour</p>
                    <button onclick="rentFriend(${i})">Rent</button>
                `;

                friendsList.appendChild(friendCard);
            }
        }
    } catch (error) {
        console.error('Error loading friends:', error);

        // Provide detailed error information for debugging
        alert(`An error occurred while loading the friends list: ${error.message}`);
    }
}


// Rent a friend
async function rentFriend(index) {
    try {
        const friend = await contract.getFriend(index);
        const tx = await contract.rentFriend(index, { value: friend.pricePerHour });
        await tx.wait();
        alert(`You have rented ${friend.name} for ${ethers.utils.formatEther(friend.pricePerHour)} GAS/hour.`);
        loadFriends();
    } catch (error) {
        console.error(error);
        alert("An error occurred while renting the friend.");
    }
}

// Load friends on page load
window.addEventListener('load', loadFriends);
