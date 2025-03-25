const API_KEY = "16VbNYsM637FHX5jL6sszELF8uFCmE5E"; 
const BaseURL = `https://api.apilayer.com/exchangerates_data/latest?apikey=${API_KEY}`;

const fromCurr = document.getElementById("from-currency");
const toCurr = document.getElementById("to-currency");
const fromFlag = document.getElementById("from-flag");
const toFlag = document.getElementById("to-flag");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convert");
const swapBtn = document.getElementById("swap");
const msg = document.querySelector(".msg");
const darkModeBtn = document.getElementById("dark-mode");

const cache = new Map();

// Populate dropdowns
const populateDropdowns = () => {
    for (let code in countryList) {
        let option = new Option(code, code);
        fromCurr.append(option.cloneNode(true));
        toCurr.append(option.cloneNode(true));
    }
    fromCurr.value = "USD";
    toCurr.value = "INR";
    updateFlags();
};

const updateFlags = () => {
    fromFlag.src = `https://flagsapi.com/${countryList[fromCurr.value]}/flat/64.png`;
    toFlag.src = `https://flagsapi.com/${countryList[toCurr.value]}/flat/64.png`;
};

// Fetch exchange rate with caching
const fetchExchangeRate = async (from, to) => {
    const cacheKey = `${from}_${to}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }
    
    try {
        let response = await fetch(`${BaseURL}&base=${from}`);
        let data = await response.json();
        let rate = data.rates[to];

        if (!rate) throw new Error("Invalid currency");

        cache.set(cacheKey, rate);
        setTimeout(() => cache.delete(cacheKey), 10 * 60 * 1000); // Cache for 10 minutes
        return rate;
    } catch (error) {
        msg.innerText = "Error fetching exchange rate";
        return null;
    }
};

// Update exchange rate
const updateExchangeRate = async () => {
    let amount = parseFloat(amountInput.value.trim());
    if (isNaN(amount) || amount <= 0) {
        msg.innerText = "Enter a valid amount!";
        return;
    }

    msg.innerText = "Fetching exchange rate...";
    let rate = await fetchExchangeRate(fromCurr.value, toCurr.value);
    if (rate) {
        let convertedAmount = (amount * rate).toFixed(2);
        msg.innerText = `${amount} ${fromCurr.value} = ${convertedAmount} ${toCurr.value}`;
    }
};

// Swap Currencies
swapBtn.addEventListener("click", () => {
    [fromCurr.value, toCurr.value] = [toCurr.value, fromCurr.value];
    updateFlags();
    updateExchangeRate();
});

// Dark Mode Toggle
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// Event Listeners
fromCurr.addEventListener("change", updateFlags);
toCurr.addEventListener("change", updateFlags);
convertBtn.addEventListener("click", updateExchangeRate);

// Initialize
window.addEventListener("load", populateDropdowns);
