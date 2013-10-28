/**
 * snake/main.js
 */
var headx, heady, tailx, taily;
var board;
var running, runIntCbr, runCount;
var length;
var state = Object.freeze({
	none : 0,
	stop: 1,
	up: 2,
	left: 3,
	right: 4,
	down: 5,
	opposite: 7
});
var keyc = Object.freeze({
	backspace: 8,
	tab: 9,
	enter: 13,
	shift: 16,
	ctrl: 17,
	alt: 18,
	esc: 27,
	space: 32,
	larrow: 37,
	uarrow: 38,
	rarrow: 39,
	darrow: 40
});
function config() {
	var cfg = {
		board: {
			width: 800,
			height: 600,
			style: ["rgb(220, 210, 240)", "rgb(210, 240, 220)", "rgb(240, 220, 210)"]
		},
		bounds: {
			top: 24,
			left: 24,
			width: 640,
			height: 480,
			col: 40,
			row: 30,
			style: "gray",
			lineWidth: "8"
		},
		block: {
			size: 16,
			margin: 2
		},
		clock: {
			top: 540,
			left: 20,
			style: "black",
			font: "bold 24pt monospace"
		},
		stat: {
			top: 40,
			left: 700
		},
		pc: {
			initx: 20,
			inity: 10,
			tailStyle: "green",
			bodyStyle: "black",
			headStyle: "red",
			stopStyle: "gray"
		},
		refresh: 25,
		stepby: 2,
		noBackstepDeath: true
	};
	return cfg;
}
function firstRun() {
	document.addEventListener('keydown', turner);
	runIntCbr = setInterval(runner, config().refresh);
	play();
}
function init() {
	board = new Array();
	for (var i = 0; i < config().bounds.col; i++) {
		board.push(new Array());
		for (var j = 0; j < config().bounds.row; j++) {
			board[i].push(state.none);
		}
	}
	tailx = headx = config().pc.initx;
	taily = heady = config().pc.inity;
	board[headx][heady] = state.stop;
	length = 1;
}
function play() {
	init();
	runCount = 0;
	feed();
	running = false;
	runner();
}
function turner(evt) {
	var prev_state = board[headx][heady];
	switch(evt.keyCode) {
	case keyc.larrow:
		board[headx][heady] = state.left;
		break;
	case keyc.rarrow:
		board[headx][heady] = state.right;
		break;
	case keyc.uarrow:
		board[headx][heady] = state.up;
		break;
	case keyc.darrow:
		board[headx][heady] = state.down;
		break;
	default:
		return;
	}
	if (config().noBackstepDeath) {
		if (prev_state + board[headx][heady] == state.opposite && length > 1)
			board[headx][heady] = prev_state;
	}
	running = true;
}
function runner() {
	var runDurMilis = runCount * config().refresh;
	var clk = "";
	runDurMilis /= 10;
	clk = ("0" + Math.floor(runDurMilis % 100)).slice(-2) + "\"" + clk;
	runDurMilis /= 100;
	clk = ("0" + Math.floor(runDurMilis % 60)).slice(-2) + "." + clk;
	runDurMilis /= 60;
	clk = ("0" + Math.floor(runDurMilis % 60)).slice(-2) + "\'" + clk;
	runDurMilis /= 60;
	clk = Math.floor(runDurMilis) + ":" + clk;

	var canvas = document.getElementById("snakeboard");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = config().board.style[0];
	ctx.fillRect(0, 0, config().board.width, config().board.height);
	ctx.lineWidth = config().bounds.lineWidth;
	ctx.strokeStyle = config().bounds.style;
	ctx.strokeRect(config().bounds.left, config().bounds.top, config().bounds.width, config().bounds.height);
	ctx.fillStyle = config().clock.style;
	ctx.font = config().clock.font;
	ctx.fillText(clk, config().clock.left, config().clock.top);
	ctx.font = config().clock.font;
	ctx.fillText("" + length, config().stat.left, config().stat.top);

	for (var i = 0; i < config().bounds.col; i++) {
		for (var j = 0; j < config().bounds.row; j++) {
			if (board[i][j] == state.none)
				continue;
			if (i == headx && j == heady)
				ctx.fillStyle = config().pc.headStyle;
			else if (i == tailx && j == taily)
				ctx.fillStyle = config().pc.tailStyle;
			else if (board[i][j] == state.stop)
				ctx.fillStyle = config().pc.stopStyle;
			else
				ctx.fillStyle = config().pc.bodyStyle;
			ctx.fillRect(
				config().bounds.left + i * config().block.size + config().block.margin,
				config().bounds.top + j * config().block.size + config().block.margin,
				config().block.size - 2 * config().block.margin,
				config().block.size - 2 * config().block.margin);
		}
	}

	var prev_runCount = runCount;
	if (running)
		runCount += 1;
	if (prev_runCount % config().stepby != 0)
		return;

	step();
}
function step() {
	var prev_headx = headx, prev_heady = heady;
	var prev_head = board[headx][heady];
	switch(board[headx][heady]) {
	case state.up:
		heady -= 1;
		break;
	case state.down:
		heady += 1;
		break;
	case state.left:
		headx -= 1;
		break;
	case state.right:
		headx += 1;
		break;
	case state.stop:
		return;
	}
	if (headx == -1 || heady == -1 ||
		headx == config().bounds.col || heady == config().bounds.row ||
		board[headx][heady] != state.none && board[headx][heady] != state.stop) {
		die();
	} else if (board[headx][heady] == state.stop) {
		board[headx][heady] = prev_head;
		length++;
		feed();
		return;
	} else {
		board[headx][heady] = prev_head;
	}

	var prev_tailx = tailx, prev_taily = taily;
	switch(board[tailx][taily]) {
	case state.up:
		taily -= 1;
		break;
	case state.down:
		taily += 1;
		break;
	case state.left:
		tailx -= 1;
		break;
	case state.right:
		tailx += 1;
		break;
	case state.stop:
		return;
	}
	board[prev_tailx][prev_taily] = state.none;
}
function die() {
	alert("Died");
	for (var i = 0; i < config().bounds.col; i++) {
		for (var j = 0; j < config().bounds.row; j++) {
			board[i][j] = state.none;
		}
	}
	play();
}
function feed() {
	var i, j;
	do {
		i = Math.floor(Math.random() * config().bounds.col);
		j = Math.floor(Math.random() * config().bounds.row);
	} while (board[i][j] != state.none);
	board[i][j] = state.stop;
}
window.onload = function() { firstRun(); };
