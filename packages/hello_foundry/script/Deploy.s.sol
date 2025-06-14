// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {DarkestDungeon} from "src/DarkestDungeon.sol";
import { Dungeon } from "src/Token/Gametoken.sol"; // Import the Dungeon token contract


contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying contracts using deployer address:", deployerAddress);

        address gasbackAddress = 0xdF329d59bC797907703F7c198dDA2d770fC45034;

        // Deploy Dungeon Token first
        Dungeon dungeonToken = new Dungeon();
        console.log("Deployed Dungeon Token at address: %s", address(dungeonToken));

        // Deploy DarkestDungeon with Dungeon token address
        DarkestDungeon game = new DarkestDungeon(deployerAddress, gasbackAddress, address(dungeonToken));
        console.log("Deployed Darkest Dungeon at address: %s", address(game));

        vm.stopBroadcast();
    }
}
// forge script script/Deploy.s.sol https:// --private-key <your key> --broadcast
// forge script script/Deploy.s.sol https://--broadcast