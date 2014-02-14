// Checkers in pure-js; Author: David Adler; Date: 12/02/2013

// Inital positions of checkers and squares
// var INIT_CHECKERS = [
//         [0, 1, 0, 1, 0, 1, 0, 1],
//         [1, 0, 1, 0, 1, 0, 1, 0],
//         [0, 1, 0, 1, 0, 1, 0, 1],
//         [0, 0, 0, 0, 0, 0, 0, 0],
//         [0, 0, 0, 0, 0, 0, 0, 0],
//         [2, 0, 2, 0, 2, 0, 2, 0],
//         [0, 2, 0, 2, 0, 2, 0, 2],
//         [2, 0, 2, 0, 2, 0, 2, 0]];
var INIT_CHECKERS = [
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0]];
var INIT_SQUARES = [
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1]];

// -----Checkers and sqaures config-----
// 1 red, 2 black
// var CHECKER_NAMES = {1: 'RED', 2: 'BLACK'};
// var CHECKER_COLORS = {1: 'firebrick', 2: '#313131'};
// var CHECKER_BORDER = {width: 5, color: '#000'};
// the int representing the checker of the other color
// var ANTI_CHECKER = {1: 2, 2: 1};
// 1 can move bottom right or bottom left. (second value in array need to check if checer can jump)
// 2 can move top right or top left relative to self.

// 0 black, 1 white, 2 active
var SQUARE_COLORS = {0: '#ccc', 1: '#fff', 2: 'steelblue'};

var teams = {
    1: {name: 'RED', 
        score: 0,
        color: 'firebrick'
    }, 
    2: {name: 'BLACK', 
        score: 0,
        color: '#313131'
    }
};

var queens = [3, 4];

// checker peices
var peices = {
    1: {name: 'red pawn',
        color: 'firebrick',
        moves: [{row: 1, col: 1}, {row: 1, col: -1}],
        border: {width: 5, color: '#000'},
        anti: 2,
        team: 1
    },
    2: {name: 'black pawn',
        color: '#313131',
        moves: [{row: -1, col: 1}, {row: -1, col: -1}],
        border: {width: 5, color: '#000'},
        anti: 1,
        team: 2
    },
    3: {name: 'red queen',
        color: 'firebrick',
        moves: [{row: 1, col: 1}, {row: 1, col: -1}, 
                {row: -1, col: 1}, {row: -1, col: -1}],
        border: {width: 5, color: 'gold'},
        anti: 2,
        team: 1
    },
    2: {name: 'black queen',
        color: '#313131',
        moves: [{row: 1, col: 1}, {row: 1, col: -1}, 
                {row: -1, col: 1}, {row: -1, col: -1}],
        border: {width: 5, color: 'gold'},
        anti: 1,
        team: 2
    }
};

// -----Dimensions config------
var SQUARE_SIZE = 50;
var BOARD_DIM = INIT_SQUARES.length;
var BOARD_WIDTH = SQUARE_SIZE * BOARD_DIM;
var BOARD_HEIGHT = SQUARE_SIZE * BOARD_DIM;
var INFO_WIDTH = SQUARE_SIZE * 2;

function deep_copy(array) {
    var out = Array(array.length);
    for (var i = 0; i < array.length; i++) {
        out[i] = array[i].slice();
    }
    return out;
}

function Board (canvas) {
    var board = this;
    board.can = canvas;
    board.ctx = canvas.getContext('2d');

    document.body.addEventListener("mouseup", board.onUp().mouse, false);
    board.can.addEventListener("touchend", board.onUp().touch, false);

    board.animated = [];
    board.checkers = deep_copy(INIT_CHECKERS);
    board.squares = deep_copy(INIT_SQUARES);
    board.selected_checker = null;
    board.who_to_play = 1;
    board.switch_player();

}

Board.prototype.find_legal_moves = function(pos) {
    var board = this;
    if (pos.row >=0 && pos.row < BOARD_DIM) {
        var checker = board.checkers[pos.row][pos.col];
        // anti means a checker of opposite color

        if (peices[checker] !== undefined && checker === board.who_to_play) {
            // if user selected a checker and it is this color to play 
            var anti = peices[checker].anti;
            var moves = peices[checker].moves;
            for (var i = 0; i < moves.length; i++) {
                var delta = moves[i];

                // new trial position
                var mv = {};
                mv.row = pos.row + delta.row;
                mv.col = pos.col + delta.col;

                // jump pos
                var jump ={};
                jump.row = pos.row + (delta.row * 2);
                jump.col = pos.col + (delta.col * 2);
                
                if (mv.row >= 0 && mv.row < BOARD_DIM && 
                    board.checkers[mv.row][mv.col] === 0) {
                    // adjacent empty
                    board.animated.push(mv);
                } else if (mv.row < BOARD_DIM && jump.row < BOARD_DIM &&
                           mv.row >= 0 && jump.row >= 0 &&
                           board.checkers[mv.row][mv.col] === anti &&
                           board.checkers[jump.row][jump.col] === 0) {
                    
                    // can jump adjacent
                    board.animated.push({row: jump.row, col: jump.col});
                }


            }
            if (board.animated.length) {
                // also animate square beneath checker if it has legal moves
                board.animated.push(pos);
                board.selected_checker = pos;
                board.selected_checker.team = peices[checker].team;
                return board.animated;
            }
        }
    }
    return [];
};


Board.prototype.find_jump_moves = function(pos) {
    var board = this;
    var checker = board.checkers[pos.row][pos.col];
    var anti = peices[checker].anti;
    var moves = peices[checker].moves;

    if (moves !== undefined && checker === board.who_to_play) {
        // if it is this color to play
        for (var i = 0; i < moves.length; i++) {
            var delta = moves[i];

            // new trial position
            var mv = {};
            mv.row = pos.row + delta.row;
            mv.col = pos.col + delta.col;

            // jump pos
            var jump = {};
            jump.row = pos.row + (delta.row * 2);
            jump.col = pos.col + (delta.col * 2);
            if (mv.row < BOARD_DIM && jump.row < BOARD_DIM &&
                mv.row >= 0 && jump.row >= 0 &&
                board.checkers[mv.row][mv.col] === anti &&
                board.checkers[jump.row][jump.col] === 0) {
                // can jump adjacent
                board.animated.push({row: jump.row, col: jump.col});
            }


        }
        if (board.animated.length) {
            // board.animated.push(pos);
            board.selected_checker = pos;
            board.selected_checker.team = checker;
            return board.animated;
        }
    }
    return [];
};


Board.prototype.onUp = function(e) {
    var board = this;
    return {
        mouse: function(e) {
            var coords = {};
            coords.x = e.pageX - board.can.offsetLeft;
            coords.y = e.pageY - board.can.offsetTop;
            var pos = board.translateCoords(coords);
            // board.selectChecker(pos);
            board.selectSquare(pos);
        },
        touch: function(e) {
            e.preventDefault();
            var coords = {};
            coords.x = e.targetTouches[0].pageX - board.can.offsetLeft;
            coords.y = e.targetTouches[0].pageY - board.can.offsetTop;
            var pos = board.translateCoords(coords);
            // board.selectChecker(pos);
            board.selectSquare(pos);
        }
    };
};

Board.prototype.translateCoords = function(coords) {
    var board = this;
    var pos = {};
    pos.col = parseInt(coords.x / SQUARE_SIZE);
    pos.row = parseInt(coords.y / SQUARE_SIZE);
    return pos;
};

Board.prototype.selectSquare = function(pos) {
    var board = this;
    if (board.selected_checker) {
        // if there already is a checker selected
        if (pos.row === board.selected_checker.row && pos.col === board.selected_checker.col) {
            // if reselect the selected_checker, deselect it
            board.selected_checker = null;
            board.reset_animated();
        } else {
            for (var i = 0; i < board.animated.length; i++) {
                var animated = board.animated[i];
                if (pos.row === animated.row && pos.col === animated.col) {
                    // if selected a valid new dest
                    if (board.must_jump) {
                        board.must_jump = false;
                    }
                    return board.move(pos);
                }
            }
            if (!board.must_jump) {
                board.selectChecker(pos);
            }
        }
    } else {
        board.selectChecker(pos);
    }
};

Board.prototype.move = function(pos) {
    var board = this;
    var switch_player;
    // Source and destination positions
    var src = board.selected_checker;
    var des = pos;
    // make the move
    board.checkers[des.row][des.col] = board.checkers[src.row][src.col];
    board.checkers[src.row][src.col] = 0;

    if (Math.abs(des.row - src.row) > 1) {
        // if jumping rm intermediate checker
        var delta = {};
        delta.row = des.row - src.row;
        delta.col = des.col - src.col;
        var inter = {};
        inter.row = src.row + (delta.row / 2);
        inter.col = src.col + (delta.col / 2);

        teams[board.selected_checker.team].score ++;
        board.updateScore();
        board.checkers[inter.row][inter.col] = 0;
        board.reset_animated();
        var legal_moves = board.find_jump_moves(des);
        if (legal_moves.length) {
            // if can do second jump
            board.must_jump = true;
            return board.show_legal();
        } else {
            // can not do second jump
            switch_player = true;
        }
    } else {
        // did not jump
        switch_player = true;
    }

    // check if has become a queen
    for (var i = 0; i < queens.length; i++) {
        var queen = peices[queens[i]];
        if (des.row === queen.trigger_row && src.team === queen.team) {
            // make queen
            board.checkers[des.row][des.col] = queens[i];
            switch_player = false;
        }
    }
    // if (des.row === BOARD_DIM-1 && src.team === 1) {
    //     // make red queen
    //     board.checkers[des.row][des.col] = 3;
    //     switch_player = false;
    // } else if (des.row === 0 && src.team === 2) {
    //     // make black queen
    //     board.checkers[des.row][des.col] = 4;
    //     switch_player = false;

    }
    // reset_animated, switch_player = false
    // check team and switch to queen black or red
    // if des == BOARD_DIM, change_peice, 
    // find_queen_legal_moves(pos), 

    if (switch_player) {board.switch_player();}
    board.reset_animated();
};

Board.prototype.updateScore = function() {
    var board = this;
    for (var i in teams) {
        document.querySelector('#score' + i).innerText = teams[i].score;
    }
};

Board.prototype.switch_player = function() {
    var board = this;
    board.who_to_play = peices[board.who_to_play].anti;
    var name = teams[board.who_to_play].name;
    document.querySelector('#whos-turn-to-play b').innerHTML = name;
    var color = peices[board.who_to_play].color;
    document.getElementById('whos-turn-to-play').style.backgroundColor = color;
};

Board.prototype.selectChecker = function(pos) {
    var board = this;
    board.reset_animated();
    board.find_legal_moves(pos);
    board.show_legal(pos);
};

Board.prototype.reset_animated = function() {
    var board = this;
    for (var i = 0; i < board.animated.length; i++) {
        var pos = board.animated[i];
        board.squares[pos.row][pos.col] = INIT_SQUARES[pos.row][pos.col];
    }
    board.animated = [];
    board.draw();
};

Board.prototype.show_legal = function(pos) {
    var board = this;
    for (var i = 0; i < board.animated.length; i++) {
        pos = board.animated[i];
        board.squares[pos.row][pos.col] = 2;
    }
    board.draw();
};

Board.prototype.draw = function() {
    var board = this;
    board.draw_board();
    board.draw_checkers();
};

Board.prototype.draw_board = function() {
    var board = this;
    for (var row = 0; row < BOARD_DIM; row++) {
        for (var col = 0; col < BOARD_DIM; col++) {
            var square = board.squares[row][col];

            var x = col * SQUARE_SIZE;
            var y = row * SQUARE_SIZE;

            board.ctx.fillStyle = SQUARE_COLORS[square];

            board.ctx.fillRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
};

Board.prototype.draw_checkers = function() {
    var board = this;
    var radius = (SQUARE_SIZE / 2) - peices[1].border.width;

    for (var row = 0; row < BOARD_DIM; row++) {
        for (var col = 0; col < BOARD_DIM; col++) {
            var checker = board.checkers[row][col];
            if (checker !== 0) {
                // If there is a checker in the square

                // get center of square
                var x = col * SQUARE_SIZE;
                var y = row * SQUARE_SIZE;
                var center_x = x + (SQUARE_SIZE / 2);
                var center_y = y + (SQUARE_SIZE / 2);

                board.ctx.beginPath();
                board.ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI, false);
                board.ctx.fillStyle = peices[checker].color;
                board.ctx.fill();
                board.ctx.lineWidth = peices[checker].border.width;
                board.ctx.strokeStyle = peices[checker].border.color;
                board.ctx.stroke();
            }
        }
    }
};

function initCanvas() {
    // container
    var container = document.getElementById('checkers-game-container');
    container.style.width = (BOARD_WIDTH + INFO_WIDTH + 4) + 'px';
    container.style.height = BOARD_HEIGHT + 'px';
    container.style.margin = '30px auto';
    container.style.boxShadow = '0px 0px 30px 2px #888';
    container.style.border = '1px solid #888';
    container.style.backgroundColor = 'rgb(153, 153, 153)';

    // canvas
    var canvas = document.createElement('canvas');
    canvas.width = BOARD_WIDTH;
    canvas.height = BOARD_HEIGHT;
    canvas.style.float = 'left';
    container.appendChild(canvas);
    return canvas;
}

function initInfoDiv() {
    var container = document.getElementById('checkers-game-container');

    // info div
    var info_div = document.createElement('div');
    info_div.id = 'checkers-game-info-div';
    info_div.style.fontFamily = 'Arial';
    info_div.style.backgroundColor = '#999';
    info_div.style.borderLeft = 'black solid 4px';
    info_div.style.width = SQUARE_SIZE * 2 + 'px';
    info_div.style.height = BOARD_HEIGHT + 'px';
    info_div.style.float = 'left';
    info_div.style.color = 'white';

    // whos turn to play
    var whos_turn_to_play = document.createElement('div');
    whos_turn_to_play.id = 'whos-turn-to-play';
    whos_turn_to_play.innerHTML = "<p><b></b> to play</p>";
    whos_turn_to_play.style.margin = '8px 8px';
    whos_turn_to_play.style.padding = '8px 8px';
    whos_turn_to_play.style.borderRadius = '8px';
    whos_turn_to_play.style.opacity = '1';
    whos_turn_to_play.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';

    // score
    var score = document.createElement('div');

    var score1 = document.createElement('div');
    score1.style.backgroundColor = peices[1].color;
    score1.style.padding = '8px 8px';
    score1.style.margin = '70px 10px';
    score1.style.borderRadius = "4px";
    score1.style.float = 'left';
    score1.id = "score1";
    score1.innerText = '0';
    score.appendChild(score1);

    var score2 = document.createElement('div');
    score2.style.backgroundColor = peices[2].color;
    score2.style.padding = '8px 8px';
    score2.style.margin = '70px 10px';
    score2.style.borderRadius = "4px";
    score2.style.float = 'left';
    score2.id = "score2";
    score2.innerText = '0';
    score.appendChild(score2);

    info_div.appendChild(whos_turn_to_play);
    info_div.appendChild(score);

    container.appendChild(info_div);
    return info_div;
}


function main() {
    // Create canvas
    var canvas = initCanvas();
    var info_div = initInfoDiv();

    var board = new Board(canvas);
    board.draw();

}

main();