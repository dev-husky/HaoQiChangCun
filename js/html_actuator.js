function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }

  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var text=new Array(15);
   text[0] = " ";
  text[1] = "<div style='padding-top:30px;'>义魁</div>";
  text[2] = "<div style='padding-top:30px;'>扶正</div>";
  text[3] = "<div style='padding-top:30px;'>诛邪</div>";
  text[4] = "<div style='padding-top:30px;'>落雁客</div>";
  text[5] = "<div style='padding-top:30px;'>执令使</div>";
  text[6] = "<div style='padding-top:30px;'>天行君</div>";
  text[7] = "<div style='padding-top:10px;'>罚恶<br>右使</div>";
  text[8] = "<div style='padding-top:10px;'>赏善<br>左使</div>";
  text[9] = "<div style='padding-top:10px;'>七曜<br>总判</div>";
  text[10] = "<div style='padding-top:10px;'>匡正<br>太师</div>";
  text[11] = "<div style='padding-top:10px;'>明威<br>天相</div>";
  text[12] = "<div style='padding-top:10px;'>辅道<br>天丞</div>";
  text[13] = "<div style='padding-top:10px;'>九州<br>大侠</div>";
  text[14] = "<div style='padding-top:10px;'>武林<br>天骄</div>";

  var self = this;
  var text2 = function (n) { var r = 0; while (n > 1) r++, n >>= 1; return r; }

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 16384) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.innerHTML = text[text2(tile.value)];

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var mytxt=new Array(10);
  mytxt[0]="从此再也没人有听过这个人的故事";
  mytxt[1]="从此再也没人有听过这个人的故事";
  mytxt[2]="从此再也没人有听过这个人的故事";
  mytxt[3]="从此再也没人有听过这个人的故事";
  mytxt[4]="从此再也没人有听过这个人的故事";
  mytxt[5]="从此再也没人有听过这个人的故事";
  mytxt[6]="从此再也没人有听过这个人的故事";
  mytxt[7]="从此再也没人有听过这个人的故事";
  mytxt[8]="从此再也没人有听过这个人的故事";
  mytxt[9]="从此再也没人有听过这个人的故事";
 



  var text3 = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }
  var type    = won ? "game-won" : "game-over";
  var message = won ? "你成为了<strong>武林天骄</strong>恭喜你！" : mytxt[text3(maxscore)-3];

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton());
  twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://twitter.com/share");
  tweet.setAttribute("data-via", "oprilzeng");
  tweet.setAttribute("data-url", "http://oprilzeng.github.io/2048/full");
  tweet.setAttribute("data-counturl", "http://oprilzeng.github.io/2048/full/");
  tweet.textContent = "炫耀一下";

  var text = "I scored " + this.score + " points at PRC2048-Full edition, a game where you " +
             "join numbers to score high! #PRC2048";
  tweet.setAttribute("data-text", text);

  return tweet;
};
