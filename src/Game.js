import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import CustomDialog from "./components/CustomDialog";
import Web3 from 'web3';


function Game({ players, room, orientation, cleanup }) {
  const chess = useMemo(() => new Chess(), []); // <- 1
  const [fen, setFen] = useState(chess.fen()); // <- 2
  const [over, setOver] = useState("");

  async function blockchain(result) {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
  
        // Initialize Web3 with the current provider
        const web3 = new Web3(window.ethereum);
  
        // Get the user's Ethereum address
        const accounts = await web3.eth.getAccounts();
        const userAddress = accounts[0];
  
        // Your contract ABI and address
        const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138'; 
        const contractABI = [
          
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_color",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_piece",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_from",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_to",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_san",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_flags",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_lan",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_before",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_after",
				"type": "string"
			}
		],
		"name": "addChessMove",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "chessMoves",
		"outputs": [
			{
				"internalType": "string",
				"name": "color",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "piece",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "from",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "to",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "san",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "flags",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "lan",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "before",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "after1",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getChessMove",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "color",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "piece",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "from",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "to",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "san",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "flags",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "lan",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "before",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "after1",
						"type": "string"
					}
				],
				"internalType": "struct ChessGame.ChessMove",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getChessMoveCount",
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
  
        // Create a contract instance
        const contract = new web3.eth.Contract(contractABI, contractAddress);
  
        // Call the contract's addChessMove function
        const receipt = await contract.methods
        .addChessMove(
          result.color,
          result.piece,
          result.from,
          result.to,
          result.san,
          result.flags,
          result.lan,
          result.before,
          result.after
        )
        .send({ from: userAddress });

  
        console.log('Transaction successful');
        
        // You can also interact with other contract functions or retrieve data here
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      // Handle the case where MetaMask is not installed
      console.log('Please install MetaMask to use this app.');
    }
  }
  

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move); // update Chess instance
        blockchain(result)

        setFen(chess.fen()); // update fen state to trigger a re-render
        
        // console.log("over, checkmate", chess.isGameOver(), chess.isCheckmate());
  
        if (chess.isGameOver()) { // check if move led to "game over"
          if (chess.isCheckmate()) { // if reason for game over is a checkmate
            // Set message to checkmate. 
            setOver(
              `Checkmate! ${chess.turn() === "w" ? "black" : "white"} wins!`
            ); 
            // The winner is determined by checking which side made the last move
          } else if (chess.isDraw()) { // if it is a draw
            setOver("Draw"); // set message to "Draw"
          } else {
            setOver("Game over");
          }
        }
  
        return result;
      } catch (e) {
        return null;
      } // null if the move was illegal, the move object if the move was legal
    },
    [chess]
  );
    
  // onDrop function
  function onDrop(sourceSquare, targetSquare) {
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      // promotion: "q",
    };
    // console.log(moveData);
    const move = makeAMove(moveData);

    // illegal move
    if (move === null) return false;

    return true;
  }
  
  // Game component returned jsx
  return (
    <>
      <div className="board">
        <Chessboard position={fen} onPieceDrop={onDrop} />  {/**  <- 4 */}
      </div>
      <CustomDialog // <- 5
        open={Boolean(over)}
        title={over}
        contentText={over}
        handleContinue={() => {
          setOver("");
        }}
      />
    </>
  );
}

export default Game;