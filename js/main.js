
function gameStart() {
    window.game = new Game(4);
    window.game.initialize();
   }
   $(document).ready(gameStart);
   

   function Game(size) {
    this.rows = size;
    this.columns = size;
    // board is set as 2d array, with grid cell object for each position
    this.board = [];
    this.boardFlatten = function() {
     return _.flatten(this.board);
    };
    //
    // score setup
    this.score = 0;
    $('[data-js="score"]').html(this.score.toString());
    //
    // flag to check whether any tile movement is in progress;
    this.moveInProgress = false;
    //
   }
   
   /**
    * Run all initializations
    */
   Game.prototype.initialize = function() {
    // clear any previous grid; per jQuery docs, empty also removes event listeners
    $(".grid").empty();
    $(".tile-container").empty();
    //
    // run new setup
    this.initBoard();
    this.initTile();
    this.initEventListeners();
    //
   };
   /**/
   
   /**
    * Initialize grid
    */
   Game.prototype.initBoard = function() {
    // return grid cell object
    function initGridCell(x, y) {
     var getGridCell = $.parseHTML($("#template_grid_cell").html());
     $(getGridCell).appendTo(".grid");
     return {
      x: x,
      y: y,
      tilesArray: []
     };
    }
    //
    // create 2d array and push grid cell object
    for (var x = 0; x < this.rows; x++) {
     var newArray = [];
     this.board.push(newArray);
     for (var y = 0; y < this.columns; y++) {
      var gridObj = initGridCell(x, y);
      var rowCell = this.board[x];
      rowCell.push(gridObj);
     }
    }
    //
   };
   
   /**
    * Initialize tiles
    */
   Game.prototype.initTile = function() {
    // isGameOver determines whether the game is finished; needs to be run: before and after creating tile
    this.isGameOver();
    //
    var emptyCell = this.getRandomEmptyCell();
    var tile = new Tile(emptyCell.x, emptyCell.y, game);
    // isGameOver determines whether the game is finished; needs to be run: before and after creating tile
    this.isGameOver();
    //
   };
   /**/
   
   /**
    * Set event listeners
    */
   Game.prototype.initEventListeners = function() {
    var self = this;
    var getGameboard = document.getElementById("touchGameboard");
   
    /*
           Touch events with Hammerjs
       */
    window.hammertime && window.hammertime.destroy();
    window.hammertime = new Hammer(getGameboard, {
     recognizers: [[Hammer.Swipe, { direction: Hammer.DIRECTION_ALL }]]
    });
    window.hammertime
     .on("swipeleft", function(ev) {
      self.move("left");
     })
     .on("swiperight", function(ev) {
      self.move("right");
     })
     .on("swipedown", function(ev) {
      self.move("down");
     })
     .on("swipeup", function(ev) {
      self.move("up");
     });
    /**/
   
    /*
           NOTE: Remove event listeners before applying new listeners,
           because this initialization runs each time a new game is created
       */
    // keypress events for up, down, left, right
    $(document)
     .off("keydown.move")
     .on("keydown.move", function(event) {
      event.preventDefault();
      switch (event.which) {
       // left
       case 37:
        self.move("left");
        break;
       // up
       case 38:
        self.move("up");
        break;
       // right
       case 39:
        self.move("right");
        break;
       // down
       case 40:
        self.move("down");
        break;
      }
     });
    //
    // New game click handler
    $('[data-js="newGame"]')
     .off("click.newGame")
     .on("click.newGame", window.gameStart);
    //
   };
   /**/
   
   /**
    * Game is WON!
    */
   Game.prototype.gameWon = function() {
    alert("you won");
   };
   /**/
   
   /**
    * Game is LOST!
    */
   Game.prototype.gameLost = function() {
    alert("what a loser!");
   };
   /**/
   
   /**
    * Check if game over
    */
   Game.prototype.isGameOver = function() {
    var gameBoard = this.boardFlatten();
   
    var is2048 = false;
    var canAnyTileMove = false;
    var hasEmptyCells = false;
   
    // check if 2048
    gameBoard.forEach(function(val, index, array) {
     val.tilesArray.forEach(function(val, index, array) {
      if (val.valueProp === 2048) {
       is2048 = true;
      }
     });
    });
    // check if there are empty cells
    if (this.getEmptyCells().length > 0) {
     hasEmptyCells = true;
    }
    // Check if move possible
    gameBoard.forEach(function(val, index, array) {
     val.tilesArray.forEach(function(val, index, array) {
      val.moveCheck();
      if (val.canMove === true) {
       canAnyTileMove = true;
      }
     });
    });
   
    // if game won
    if (is2048) {
     this.gameWon();
     return true;
    } else if (!hasEmptyCells && !canAnyTileMove) {
     // if no empty cells || no tile can move, the game is lost
     this.gameLost();
     return true;
    } else {
     // if there is an empty || a tile can move, return false for isGameOver
     return false;
    }
    //
   };
   
   /**
    * Get empty cells
    */
   Game.prototype.getEmptyCells = function() {
    var emptyCells = _.filter(this.boardFlatten(), function(val) {
     return !val.tilesArray.length;
    });
    return emptyCells;
   };
   /**/
   
   /**
    * Return random empty cell for new tile creation
    */
   Game.prototype.getRandomEmptyCell = function() {
    var emptyGridCells = this.getEmptyCells();
    var randomIndex = Math.floor(
     Math.random() * Math.floor(emptyGridCells.length)
    );
   
    return emptyGridCells[randomIndex];
   };
   /**/
   
   /**
    * Merge tiles
    */
   Game.prototype.TileMerge = function() {
    var gameBoard = this.boardFlatten();
    var newScore = this.score;
   
    // loop through all tiles
    gameBoard.forEach(function(val, index, array) {
     if (val.tilesArray.length === 2) {
      // get current value of 1st tile
      var currentValue = val.tilesArray[0].valueProp;
      // update value
      val.tilesArray[0].value = currentValue * 2;
      // remove 2nd tile
      var x = val.tilesArray.pop();
      x.el.remove();
      // update score
      newScore += currentValue;
     }
    });
    // update game score at the end
    this.score = newScore;
    $('[data-js="score"]').html(this.score.toString());
   };
   /**/
   
   /**
    * Move animations
    */
   Game.prototype.moveAnimations = function(gameBoard) {
    var self = this;
    var promiseArray = [];
   
    if (this.moveInProgress) {
     return false;
    }
   
    this.moveInProgress = true;
    gameBoard.forEach(function(val, index, array) {
     val.tilesArray.forEach(function(val, index, array) {
      promiseArray.push(val.animatePosition());
     });
    });
   
    $.when.apply($, promiseArray).then(function() {
     self.moveInProgress = false;
     self.TileMerge();
     self.initTile();
    });
    if (promiseArray.length === 0) {
     self.moveInProgress = false;
     self.TileMerge();
     self.initTile();
    }
   };
   /**/
   
   /**
    * Move logic
    */
   Game.prototype.move = function(getDirection) {
    var gameBoard;
    // direction passed as argument
    var direction = getDirection.toLowerCase();
    //
    // flag to check whether any
    var hasAnyTileMoved = false;
    //
    if (this.moveInProgress) {
     return false;
    }
   
    // if UP:
    if (direction === "up") {
     gameBoard = _.orderBy(this.boardFlatten(), "y", "asc");
    } else if (direction === "right") {
     // if RIGHT:
     gameBoard = _.orderBy(this.boardFlatten(), "x", "desc");
    } else if (direction === "down") {
     // if DOWN
     gameBoard = _.orderBy(this.boardFlatten(), "y", "desc");
    } else if (direction === "left") {
     // if LEFT
     gameBoard = _.orderBy(this.boardFlatten(), "y", "asc");
    }
   
    // loop through all tiles and run tile move foreach
    //
    gameBoard.forEach(function(val, index, array) {
     val.tilesArray.length
      ? val.tilesArray.forEach(function(val) {
         if (val.move(direction, true)) {
          hasAnyTileMoved = true;
          val.move(direction);
         }
        })
      : false;
    });
    //
    // run animation logic at the end
    hasAnyTileMoved ? this.moveAnimations(gameBoard) : false;
   };
   /**/
   
   /*
      * Tile
      */
   function Tile(x, y, game) {
    this.game = game;
   
    // jQuery element
    this.el;
    // current position
    this.x = x;
    this.y = y;
    // Getter/Setter for value; updates html on set; defaulted to 2 on creation
    this.valueProp = 2;
    Object.defineProperties(this, {
     value: {
      get: function() {
       return this.valueProp;
      },
      set: function(val) {
       this.valueProp = val;
       this.el
        .find(".tile_number")
        .html(this.valueProp)
        .attr("data-value", val);
      }
     }
    });
    // can move flag
    this.canMove = false;
    // initialize
    this.initialize();
   }
   
   /**
    * Initialize
    */
   Tile.prototype.initialize = function() {
    // Get html from template and set number text
    var getTile = $.parseHTML($("#template_tile").html());
    this.el = $(getTile);
    this.el
     .find(".tile_number")
     .html(this.valueProp)
     .attr("data-value", 2);
    // Set position and append to page; initializeFlag is set to True to remove animation and append immediately in correct position
    this.setPosition(this.x, this.y);
    this.animatePosition(true);
    this.el.appendTo(".tile-container");
   };
   /**/
   
   /**
    * Set new position
    */
   Tile.prototype.setPosition = function(getX, getY) {
    this.x = getX;
    this.y = getY;
    this.game.board[getX][getY].tilesArray.push(this);
   };
   /**/
   
   /**
    * Remove old position
    */
   Tile.prototype.removeOldPosition = function(getX, getY) {
    this.game.board[getX][getY].tilesArray.pop();
   };
   /**/
   
   /**
    * Animate to position
    */
   Tile.prototype.animatePosition = function(initalizeFlag) {
    var self = this;
    var fromLeft = this.x * (100 / this.game.rows);
    var fromTop = this.y * (100 / this.game.columns);
    // Initialize flag sets animationDuration to 0 to append immediately in correct position
    var animationDuration = 175;
    var getPromise = $.Deferred();
   
    if (initalizeFlag) {
     this.el.addClass("initialize");
    } else {
     this.el.removeClass("initialize");
    }
   
    function resolvePromise() {
     getPromise.resolve();
     self.el.removeClass("animate");
     self.el.removeClass("initialize");
    }
    function setPosition() {
     self.el.addClass("animate");
     self.el.attr({
      "data-x": fromLeft,
      "data-y": fromTop
     });
    }
    if (initalizeFlag) {
     setPosition();
     window.setTimeout(resolvePromise, animationDuration + 50);
    } else {
     setPosition();
     window.setTimeout(resolvePromise, animationDuration);
    }
    return getPromise;
   };
   /**/
   
   /**
    * Check if move is possible
    */
   Tile.prototype.moveCheck = function() {
    // run all checks; return true if any moves are possible
    if (
     this.move("up", true) ||
     this.move("right", true) ||
     this.move("down", true) ||
     this.move("left", true)
    ) {
     this.canMove = true;
     return true;
    } else {
     this.canMove = false;
     return false;
    }
   };
   /**/
   
   /**
    * Move logic
    */
   Tile.prototype.move = function(getDirection, checkFlag) {
    var checkFlag = checkFlag ? true : false;
    var direction = getDirection.toLowerCase();
    var getX = this.x;
    var getY = this.y;
   
    var getNext;
    var isNextMatch;
    var isNextEmpty;
    var nextPositionArray = [];
   
    // if UP: check next position
    if (direction === "up") {
     getNext = this.y > 0 ? this.game.board[this.x][this.y - 1] : false;
     nextPositionArray.push(this.x, this.y - 1);
    } else if (direction === "right") {
     // if RIGHT: check next position
     getNext = this.x < 3 ? this.game.board[this.x + 1][this.y] : false;
     nextPositionArray.push(this.x + 1, this.y);
    } else if (direction === "down") {
     // if DOWN: check next position
     getNext = this.y < 3 ? this.game.board[this.x][this.y + 1] : false;
     nextPositionArray.push(this.x, this.y + 1);
    } else if (direction === "left") {
     // if LEFT: check next position
     getNext = this.x > 0 ? this.game.board[this.x - 1][this.y] : false;
     nextPositionArray.push(this.x - 1, this.y);
    }
    // Check if next position contains match or is empty
    isNextMatch =
     getNext &&
     getNext.tilesArray.length === 1 &&
     getNext.tilesArray[0].valueProp === this.valueProp;
    isNextEmpty = getNext && getNext.tilesArray.length === 0;
    //
   
    // "check only" mode; only to check if tile can move
    if (checkFlag) {
     return isNextEmpty || isNextMatch ? true : false;
    } else if (isNextEmpty || isNextMatch) {
     // not "check only" mode; will actually run move logic
     this.setPosition(nextPositionArray[0], nextPositionArray[1]);
     this.removeOldPosition(getX, getY);
     // do NOT continue to move if a tile has matched - and therefore MERGED into adjoining tile
     if (!isNextMatch) {
      this.move(direction);
     }
    }
   };
   /**/


   // No início do main.js, antes da função gameStart
let playerName = "";

// Ranking inicial com a Beatriz Candido
const initialRanking = [
  { name: "Beatriz Candido", score: 1580 }
];

// Funções para o sistema de ranking
function showNameModal() {
   $('#nameModal').show();
   $('#playerName').focus(); // Foco no campo de texto
 }

function saveScore() {
   if (!playerName || !window.game) return;
 
   const currentScore = window.game.score;
   let ranking = getRanking();
 
   // Verifica se é um recorde da Beatriz
   if (playerName === "Beatriz Candido") {
     const beatrizRecord = ranking.find(p => p.name === "Beatriz Candido");
     if (beatrizRecord && currentScore > beatrizRecord.score) {
       beatrizRecord.score = currentScore;
     }
   } 
   // Para outros jogadores
   else {
     ranking.push({ name: playerName, score: currentScore });
   }
 
   // Ordena e mantém top 10
   ranking.sort((a, b) => b.score - a.score);
   ranking = ranking.slice(0, 10);
   
   localStorage.setItem('2048Ranking', JSON.stringify(ranking));
   showRanking();
 }
     // Mostra o ranking
     showRanking();
   


// No seu arquivo main.js, localize a função getRanking() e substitua por:

function getRanking() {
  // Ranking inicial pré-definido
  const initialRanking = [
    { name: "Cesar", score: 6716 },
    { name: "Ygor", score: 6292 },
    { name: "Kauã Francino", score: 5700 },
    { name: "Arthuro", score: 2972 },
    { name: "Dudao", score: 2968 },
    { name: "Neymar (Flavio)", score: 2638 },
    { name: "Kauã Araújo", score: 1582 },
    { name: "Beatriz Candido", score: 1580 },
    { name: "CursedXD", score: 1574 },
    { name: "Diego", score: 1566 },
    { name: "Davi Sam", score: 1302 },
    { name: "Luan", score: 1270 },
    { name: "Sofia", score: 1254 },
    { name: "Pedro Lucas", score: 1254 },
    { name: "Soraya", score: 1170 },
    { name: "Ana Leticia", score: 998 }
  ];

  // Tenta obter ranking salvo no localStorage
  const savedRanking = localStorage.getItem('2048Ranking');
  
  // Se não existir no localStorage, retorna o inicial
  if (!savedRanking) {
    return initialRanking.sort((a, b) => b.score - a.score); // Ordena por score
  }

  // Se existir, combina com o inicial
  const mergedRanking = [...JSON.parse(savedRanking), ...initialRanking];
  
  // Remove duplicados (mantém a maior pontuação)
  const uniqueRanking = [];
  const names = new Set();
  
  mergedRanking.sort((a, b) => b.score - a.score).forEach(player => {
    if (!names.has(player.name)) {
      names.add(player.name);
      uniqueRanking.push(player);
    }
  });

  return uniqueRanking.slice(0, 10); // Retorna apenas os top 10
}

function showRanking() {
  const ranking = getRanking();
  const rankingList = $('#rankingList');
  rankingList.empty();
  
  ranking.forEach((player, index) => {
    const positionClass = index === 0 ? 'first-place' : '';
    rankingList.append(`
      <div class="ranking-item ${positionClass}">
        <span class="ranking-position">${index + 1}º</span>
        <span class="ranking-name">${player.name}</span>
        <span class="ranking-score">${player.score}</span>
      </div>
    `);
  });
  
  $('#rankingModal').css('display', 'block');
}

// Modifique a função gameLost para salvar o score
Game.prototype.gameLost = function() {
  alert("Game Over! Seu score foi: " + this.score);
  saveScore();
};

// Modifique a função gameWon para salvar o score
Game.prototype.gameWon = function() {
  alert("Parabéns! Você ganhou com score: " + this.score);
  saveScore();
};

// Adicione isso no final do main.js, depois de tudo
$(document).ready(function() {
   // Sempre mostra o modal ao carregar
   showNameModal();
   
   // Foca automaticamente no campo de nome
   $('#playerName').focus();
 
   $('#startGameBtn').click(function() {
     playerName = $('#playerName').val().trim();
     
     if (playerName === "") {
       alert("Por favor, digite seu nome para continuar!");
       $('#playerName').focus();
       return;
     }
     
     // Aceita QUALQUER nome digitado
     $('#nameModal').hide();
     gameStart();
     
     // Adiciona botão de ranking se não existir
     if ($('.ranking-btn').length === 0) {
       $('body').append('<div class="ranking-btn" title="Ver Ranking"><i class="fas fa-trophy"></i></div>');
       $('.ranking-btn').click(showRanking);
     }
   });
  
  $('#closeRankingBtn').click(function() {
    $('#rankingModal').css('display', 'none');
  });
  
  // Fecha o modal se clicar fora
  $(window).click(function(event) {
    if ($(event.target).hasClass('modal')) {
      $('.modal').css('display', 'none');
    }
  });
});
// Mostra o modal IMEDIATAMENTE ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
   document.getElementById('playerName').focus(); // Foco automático no campo
 });
 
 // Permite digitar mesmo se houver erros anteriores
 document.getElementById('playerName').addEventListener('click', function(e) {
   e.stopPropagation(); // Impede que outros elementos bloqueiem
 });
