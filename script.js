const options = {
	shakeSoundEnabled: {
		element: document.getElementById("switchShakingAudio"),
		value: true,
		update: (option) => (option.value = option.element.checked),
	},
	darkModeEnabled: {
		element: document.getElementById("switchDarkMode"),
		value: false,
		update: (option) => (option.value = option.element.checked),
	},
	diceShakeEnabled: {
		element: document.getElementById("switchDiceShake"),
		value: true,
		update: (option) => {
			if (option.element.checked) {
				option.value = true;
				options.shakeSoundEnabled.element.disabled = false;
				options.shakeSoundEnabled.element.checked =
					options.shakeSoundEnabled.value;
			} else {
				option.value = false;
				options.shakeSoundEnabled.element.checked = false;
				options.shakeSoundEnabled.element.disabled = true;
			}
		},
	},
	diceDisplayAsNumber: {
		element: document.getElementById("diceDisplayRadio1"),
		value: true,
		update: (option) => (option.value = option.element.checked),
	},
};

const dice = {
	0: {
		value: null,
		locked: false,
	},
	1: {
		value: null,
		locked: false,
	},
	2: {
		value: null,
		locked: false,
	},
	3: {
		value: null,
		locked: false,
	},
	4: {
		value: null,
		locked: false,
	},
};

const scorecard = {
	aces: null,
	twos: null,
	threes: null,
	fours: null,
	fives: null,
	sixes: null,
	upperbonus: null,
	threeofakind: null,
	fourofakind: null,
	fullhouse: null,
	smallstraight: null,
	largestraight: null,
	firstyahtzee: null,
	chance: null,
	bonusyahtzee1: null,
	bonusyahtzee2: null,
	bonusyahtzee3: null,
};

var turnCount = 0;
var rollCount = 0;

// jacob's hi score: 270

function iterateRoll() {
	if (rollCount < 3) {
		rollCount++;
		document.getElementById("rollCount").textContent = rollCount + "/3";
		return true;
	} else {
		console.log(
			"Can't roll again this turn! Choose a category for this roll first."
		);
		return false;
	}
}

function iterateTurn() {
	turnCount++;
	if (turnCount <= 13) {
		resetDice();
		document.getElementById("turnCount").textContent = turnCount + "/13";
		return true;
	} else {
		console.log("Game over!");
		resetDice();
		return false;
	}
}

function roll() {
	if (turnCount == 0) {
		iterateTurn();
	}
	if (turnCount <= 13) {
		if (iterateRoll()) {
			//Randomizes value 1-6 for each die
			for (var i = 0; i < 5; i++) {
				if (dice[i].locked == false) {
					var result = Math.ceil(Math.random() * 6);
					var id = "die" + i;
					dice[i].value = result;
				}
			}
			place();
		}
	}
}

function place() {
	for (var i = 0; i < 5; i++) {
		var id = "die" + i;
		document.getElementById(id).innerHTML = dice[i].value;
	}
}

function checkStraight(diceValues, strtLen) {
	var diceOccurred = [...new Set(diceValues)].sort();

	if (diceOccurred.length < strtLen) {
		return false;
	}
	if (strtLen == 5) {
		return diceValues.includes(6) == false || diceValues.includes(1) == false;
	}
	if (strtLen == 4) {
		const validSmStrts = ["1234", "2345", "3456"];
		var diceOccString = diceOccurred.join("");
		var smStrtValid = false;
		validSmStrts.forEach((opt) =>
			diceOccString.includes(opt) ? (smStrtValid = true) : null
		);

		return smStrtValid;
	}
}

function scoreRoll(category) {
	const diceValues = [
		dice[0].value,
		dice[1].value,
		dice[2].value,
		dice[3].value,
		dice[4].value,
	];

	if (diceValues.includes(null)) {
		console.log("Cannot score null dice");
		return false;
	}

	const valueFrequency = {};

	diceValues.forEach((die) =>
		valueFrequency[die] ? valueFrequency[die]++ : (valueFrequency[die] = 1)
	);

	var valsFreqSorted = Object.values(valueFrequency).sort();
	var highestFreq = valsFreqSorted.slice(-1)[0];
	const diceTotal = diceValues.reduce((a, current) => a + current, 0);

	const scoreRules = {
		aces: () => scorebyFreq(1),
		twos: () => scorebyFreq(2),
		threes: () => scorebyFreq(3),
		fours: () => scorebyFreq(4),
		fives: () => scorebyFreq(5),
		sixes: () => scorebyFreq(6),
		threeofakind: () => (highestFreq >= 3 ? diceTotal : 0),
		fourofakind: () => (highestFreq >= 4 ? diceTotal : 0),
		fullhouse: () =>
			valsFreqSorted[0] == 2 && valsFreqSorted[1] == 3 ? 25 : 0,
		smallstraight: () => (checkStraight(diceValues, 4) ? 30 : 0),
		largestraight: () => (checkStraight(diceValues, 5) ? 40 : 0),
		firstyahtzee: () => (highestFreq == 5 ? 50 : 0),
		chance: () => diceTotal,
		bonusyahtzees: () => false,
	};

	var score = scoreRules[category]();

	scorecard[category] = score;
	var scoreElement = document.getElementById(category + "-score");
	scoreElement.innerHTML = score;
	scoreElement.style.display = "";
	var btnElement = document.getElementById("use-roll-" + category);
	btnElement.style.display = "none";
	rollCount = 0;
	document.getElementById("rollCount").textContent = rollCount + "/3";
	iterateTurn();
	checkUpperBonus();
	updateTotals();
	return score;

	function scorebyFreq(n) {
		if (valueFrequency[n] == null) {
			return 0;
		} else {
			return valueFrequency[n] * n;
		}
	}
}

function scoreYahtzee(highestFreq, category) {
	if (category == firstyahtzee) {
		if (highestFreq == 5) {
			return 50;
		} else {
			return 0;
		}
	}
}

function checkUpperBonus() {
	const uppSctValues = Object.values(scorecard).slice(0, 6);
	const upperSubtotal = uppSctValues.reduce((a, current) => a + current, 0);
	document.getElementById("uppersection-subtotal").innerHTML = upperSubtotal;
	const uppBnsElement = document.getElementById("upperbonus-score");
	if (upperSubtotal >= 63) {
		scorecard.upperbonus == 35;
		uppBnsElement.innerHTML = 35;
	} else if (!uppSctValues.includes(null)) {
		scorecard.upperbonus = 0;
		uppBnsElement.innerHTML = 0;
	}
	const upperTotal = upperSubtotal + scorecard.upperbonus;
	document.getElementById("uppersection-score").innerHTML = upperTotal;
}

function updateTotals() {
	const lwrSctValues = Object.values(scorecard).slice(7, undefined);
	const lowerTotal = lwrSctValues.reduce((a, current) => a + current, 0);
	document.getElementById("lowersection-score").innerHTML = lowerTotal;

	const grandTotal = Object.values(scorecard).reduce((a, cur) => a + cur, 0);
	document.getElementById("grandtotal-score").innerHTML = grandTotal;
}

function resetDice() {
	Object.values(dice).forEach((die) => {
		die.value = null;
		die.locked = false;

		for (var i = 0; i < 5; i++) {
			var id = "lock" + i;
			document.getElementById(id).style.visibility = "hidden";
		}
	});
	place();
}

function resetScorecard() {
	Object.keys(scorecard).forEach((key) => (scorecard[key] = null));
}

function playShakeSound() {
	//Dice shaking noise
	const shakeSound = new Audio("Dice.mp3");
	shakeSound.play();
}

function play() {
	roll();
	// if (options.shakeSoundEnabled.value && options.diceShakeEnabled.value) {
	// 	//prevents shake sound from playing if dice shaking is off
	// 	//playShakeSound();
	// }
	// showGridShake();
	// changeButton();
}

function showGridShake() {
	// Shuffles grid while sound plays
	if (options.diceShakeEnabled.value) {
		var id = window.setInterval(roll(), 200);
		window.setTimeout(function () {
			window.clearInterval(id);
		}, 1800);
	}
	roll();
}

function clearGrid() {
	for (var i = 0; i < 4; i++) {
		var id = "die" + i;
		document.getElementById(id).textContent = "";
	}
}

function newGame() {
	resetDice();
	Object.keys(scorecard).forEach((category) => (scorecard[category] = null));

	Object.keys(scorecard).forEach((category) => {
		var btnElement = document.getElementById("use-roll-" + category);
		var scoreElement = document.getElementById(category + "-score");

		if (btnElement != null) {
			btnElement.style.display = "";
		}
		if (scoreElement != null) {
			scoreElement.style.display = "none";
		}
	});

	turnCount = 0;
	rollCount = 0;

	document.getElementById("turnCount").textContent = turnCount + "/13";
	document.getElementById("rollCount").textContent = rollCount + "/3";
	document.getElementById("uppersection-subtotal").innerHTML = "0";
	document.getElementById("upperbonus-score").innerHTML = "";
	document.getElementById("uppersection-score").innerHTML = "0";
	document.getElementById("lowersection-score").innerHTML = "0";
	document.getElementById("grandtotal-score").innerHTML = "0";
}

// function useScoreCookies() {
//  if (document.cookie ==""){

//  }

// }

function addListeners() {
	switchListeners();
	dieListeners();
}

function switchListeners() {
	Object.values(options).forEach((option) => {
		option.element.addEventListener("change", () => {
			option.update(option);
		});
	});
}

function dieListeners() {
	Object.keys(dice).forEach((die) => {
		document.getElementById("die" + die).addEventListener("click", () => {
			lockUnlock(die);
		});
	});
}

function lockUnlock(i) {
	if (dice[i].value != null) {
		var lockID = "lock" + i;

		if (dice[i].locked == false) {
			// if die was unlocked, lock and show lock icon
			dice[i].locked = true;
			document.getElementById(lockID).style.visibility = "visible";
		} else {
			// if die was locked, unlock and hide lock icon
			dice[i].locked = false;
			document.getElementById(lockID).style.visibility = "hidden";
		}
	}
}
