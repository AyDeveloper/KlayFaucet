import { abi } from './abi';
import Caver from 'caver-js';

const caver = new Caver('https://api.baobab.klaytn.net:8651/');
const cav = new Caver(klaytn);



const submisionForm = document.querySelector('.submitForm');

let faucetBal;
submisionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const addr = submisionForm.addr.value;
    const balance = await cav.klay.getBalance(addr);
    const formattedBal = formatValue(balance);

    getFaucetBal();    

    if (formatValue((contractBal)).toFixed(2) >= 20 && formattedBal < 20) {
        console.log("eligible");
        requestKlay(addr);
    } else if(formatValue(contractBal).toFixed(2) >= 20 && formattedBal > 20 || formatValue(contractBal).toFixed(2) <= 20 && formattedBal > 20 ) {
    showModal(formattedBal.toFixed(2));
    } else if(contractBal < 20 * 10 ** 18) {
    showModalForContractBal(contractBal)  

    }

})


// requestKLAY from faucet contract

const requestKlay = async (addr) => {
	if (!initialized) {
		await init();
	}

   const recAddr = caver.utils.isAddress(addr);

   if(recAddr != true) {
    alert("Invalid Address");
    return;
   }
 
    faucetContract.send({from: selectedAccount, gas: 1500000, value: 0}, 'sendKlay', addr)
    .then( async result => {
        const events = result.events.sent.returnValues;
        const _addr = events._addr;
        const _amount = events._amount;
        const _timeReq = events._timeReq;
        console.log(result);
        console.log(_addr, _amount, _timeReq);

        const balance = await cav.klay.getBalance(addr);
        const formattedBal = formatValue(balance);

        balDisp.style.display = 'block'; 
        balDisp.innerHTML = `${formattedBal.toFixed(2)} <span>KLAY</span>`;
        displayMessage("00",`Yay! ${addressShortener(_addr)} just recieved ${formatValue(_amount)} Test KLAY at exactly ${formatDate(_timeReq)}`);

    })
    .catch(err => {
        displayMessage("01", `Transaction reverted, see console for details`);
        console.log(err);
    })
}

let contractBal
const  getFaucetBal = async () => {
    if (!initialized) {
		await init();
	}
    faucetContract.methods.getFaucetBalance().call()
    .then( result => {
        contractBal = result;
        return result;
    })
 }


/**
 =====================================----------
 =====================================----------
                                    CONNECTING TO KLATYN
                                    ====================================
                                    ====================================
**/
const balDisp = document.querySelector('.balDisp');

// set userInfo (addrress and native token bal)
function setUserInfo(account, balance) {
    connectBtn.innerText = addressShortener(account);
    balDisp.style.display = 'block'; 
    balDisp.innerHTML = `${balance} <span>KLAY</span>`;
    document.querySelector('.addr').value = account
}

// connect button
const connectBtn = document.querySelector('.connect button');
connectBtn.addEventListener('click', e => {
    init();
})

// helper function for address shortener;
function addressShortener(addr) {
    return addr.slice(0, 4) + '...' + addr.slice(addr.length - 5, addr.length - 1);
}

// helper function for formatting value to KLAY
function formatValue(value) {
    return value / Math.pow(10, 18);
}


// helper function to convert block.timestamp to date;
function formatDate(epochTime)  {
    const date = new Date(epochTime * 1000);
    const dateArray = date.toString().split(" ");

    return `${dateArray[1]} ${dateArray[2]}, ${dateArray[3]}. ${dateArray[4]}`
}

// display transaction  on success / revertion
function displayMessage(messageType, message){
    const messages = {
        "00":`
                <p class="successMessage">${message}</p>
           `,
        "01": `
                 <p class="errorMessage">${message}</p>
        `
    }
	const notification = document.querySelector(".notification");
    notification.innerHTML += messages[messageType];
}

// show modal when bal is > 20
const modal = document.querySelector('.modal');
function showModal(formattedBal) {
    modal.classList.add('showModal');
    modal.innerHTML = `
    <div class="modalCenter">
        <p>You have ${formattedBal} KLAY which is supposed to be sufficient to pay for gas while making transactions</p>
        <button class="closeBtn">Okay</button>
    </div>
    `
    const closeBtn = document.querySelector('.closeBtn');
    closeBtn.addEventListener('click', e => {
        modal.classList.remove('showModal')
    })
}

function showModalForContractBal(bal) {
    modal.classList.add('showModal');
    modal.innerHTML = `
    <div class="modalCenter">
        <p> You are eligible to 20 KLAY and the faucet balance is ${formatValue(bal)} KLAY. Please check again later</p>
        <button class="closeBtn">Okay</button>
    </div>
    `
    const closeBtn = document.querySelector('.closeBtn');
    closeBtn.addEventListener('click', e => {
        modal.classList.remove('showModal')
    })
}



let selectedAccount;
let initialized = false; 
let faucetContract;
const faucetContractAddr = "0x1E6daFa70257B486de7FB7659196E8e857fe44e8";

const init = async () => {
    if (window.klatyn !== 'undefined') {
        // kaikas is available;
        if (window.klaytn.networkVersion == '8217') return console.log('Change to BaoBab')
        const accounts = await klaytn.enable();
        const account =  accounts[0];
        selectedAccount = accounts[0];
        const balance = await cav.klay.getBalance(account);
        setUserInfo(account, Number(caver.utils.fromPeb(balance, 'KLAY')).toFixed(2));
        klaytn.on('accountsChanged',  async (accounts) => { 
            setUserInfo(accounts[0], Number(caver.utils.fromPeb(await cav.klay.getBalance(accounts[0]), 'KLAY')).toFixed(2));
            selectedAccount = accounts[0];
        })
    }
    
     faucetContract = new cav.klay.Contract(abi, faucetContractAddr);
     initialized = true;

}






/**
 =====================================----------
 =====================================----------
                                    END OF CONNECTING TO KLATYN
                                    ====================================
                                    ====================================
**/
