const  canvas = document.getElementById("canvas");

const lineBlocks = 10;
const colonneBlocks = 5;

const rightScreenOffset = window.screen.width * 15 / 100; //Egale a 80% de la largeur l'ecran (divisier par deux pour avoir le right screen offset)
const topScreenOffset = window.screen.height * 5 / 100;

const blockSpacingWidth = (0.01 * (window.screen.width - rightScreenOffset)); //Pourcentage d'offset entre les blocks en pixel
const blockSpacingHeight = (0.06 * window.screen.height / 2 );

const BlockData = {
    blockColors : ["yellow", "yellow", "orange", "orange", "red"],
    blockLifes : [1, 1, 2, 2, 3]
}

var blocks = [];

var SpaceBar = {
    xPos : 1, 
    yPos : 1,
    speed : 20,

    width : document.body.offsetWidth * 12 / 100,
    height : document.body.offsetHeight * 10 / 100,

    Move : function (key)
    {
        var self = SpaceBar;
        //Droite
        if(key.keyCode == 39 && (self.xPos + self.speed) + self.width < canvas.width)
        {
            self.xPos += self.speed;
        }

        //Gauche
        if(key.keyCode == 37 && self.xPos - self.speed > 0)
        {
            self.xPos -= self.speed;
        }
    },

    SetPos : function ()
    {
        this.xPos = document.body.offsetWidth / 2 - this.width / 2;
        this.yPos = document.body.offsetHeight - (document.body.offsetHeight * 2 /100);
    }
};

var Ball = {
    xPos : 1,
    yPos : 1,

    speed : 8,

    radius : document.body.offsetWidth * 2 / 100,
    color : "grey",

    velocity : {"x" : 0, "y" : 0},

    SetPos : function ()
    {
        this.xPos = SpaceBar.xPos + SpaceBar.width / 2;
        this.yPos = SpaceBar.yPos - this.radius * 1.1; // fois 1.1 pour avoir un petit offset
        this.velocity.y = this.speed * -1;
    },

    Move : function ()
    {
        Ball.xPos += Ball.velocity.x;
        Ball.yPos += Ball.velocity.y;
    }
};

class BlockConstructor
{
    constructor (life, color, rowPos, columnPos, blockWidth, blockHeight)
    {   
        this.life = life;
        this.color = color;

        this.rowPos = rowPos;
        this.columnPos = columnPos;
        this.blockWidth = blockWidth;
        this.blockHeight = blockHeight;
    }
}

var __InitGame__ = function ()
{
    ResizeGameScreen();
    CreateBlocks();

    SpaceBar.SetPos();
    Ball.SetPos();

    window.addEventListener("keypress", SpaceBar.Move);

    DrawBlocks();
    DrawSpaceBar();

    setInterval(Ball.Move, 20);
    setInterval(CollisionCheck, 20);
    setInterval(DrawBall, 20);
}

var CoutingBlocks = function ()
{
    if(blocks.length <= 0)
    {
        alert("you win sorry");
    }
}

var CreateBlocks = function ()
{
    let blockWidth = (document.body.offsetWidth - rightScreenOffset - (blockSpacingWidth * (lineBlocks - 1))) / lineBlocks;
    let blockHeight = ((document.body.offsetHeight / 2) - topScreenOffset - (blockSpacingHeight * colonneBlocks)) / colonneBlocks;

    for(var column = 1; column <= colonneBlocks; column++)
    {
        for(var row = 1; row <= lineBlocks; row++)
        {
            var x = (rightScreenOffset / 2) + (blockSpacingWidth * (row - 1)) + (blockWidth * (row - 1)); 
            var y = (blockSpacingWidth * column) + (blockHeight * (column - 1));

            var newBlock = new BlockConstructor(BlockData.blockLifes[colonneBlocks - column], BlockData.blockColors[colonneBlocks - column], x, y, blockWidth, blockHeight);
            blocks.push(newBlock);
        }
    }
}

var ResizeGameScreen = function ()
{
    document.body.style.height = "99vh";
    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;
}

var DrawBlocks = function ()
{
    var context = canvas.getContext("2d");
    //Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    //Draw Blocks
    blocks.forEach(function (block) {
        context.fillStyle = block.color;
        context.fillRect(block.rowPos, block.columnPos, block.blockWidth, block.blockHeight);
    });
}

var DrawBall = function ()
{
    var context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    DrawBlocks();
    DrawSpaceBar();

    context.strokeStyle = Ball.color;
    context.fillStyle = Ball.color;

    context.beginPath();
    context.arc(Ball.xPos, Ball.yPos, Ball.radius, 0, 360);
    context.fill();
    context.stroke();
}

var DrawSpaceBar = function ()
{
    var context = canvas.getContext("2d");

    context.fillStyle = "black";
    context.fillRect(SpaceBar.xPos, SpaceBar.yPos, SpaceBar.width, SpaceBar.height);
}

var CollisionCheck = function ()
{
    // Check colision boule - spacebar
    class nBlock {
        constructor (dist, block) {
            this.dist = dist;
            this.block = block;
        }
    }
    class Vector2 {
        constructor (x, y) {
            this.x = x;
            this.y = y;
        }

        Normalised () {
            if(this.x > 1){
                this.x = 1;
            } else if (this.x < -1){
                this.x = -1;
            }

            if(this.y > 1){
                this.y = 1;
            } else if (this.y < -1){
                this.y = -1;
            }
        }
    }
    var nearestBlocks = [new nBlock(-1, null), new nBlock(-1, null), new nBlock(-1, null)];

    blocks.forEach(function (block){
        var dir = [(block.rowPos + block.blockWidth / 2) - Ball.xPos, (block.columnPos + block.blockHeight) - Ball.yPos];
        dir[0] = Math.pow(dir[0], 2);
        dir[1] = Math.pow(dir[1], 2);

        var dist = dir[0] + dir[1];

        var isNearest = false;
        nearestBlocks.sort();
        nearestBlocks.forEach(function (b, index) {
            if (!isNearest && dist < b.dist || b.dist == -1)
            {
                nearestBlocks[index].dist = dist;
                nearestBlocks[index].block = block;
                isNearest = true;
            }
        });
    });
    nearestBlocks.forEach(function (nBlock) {

        if(nBlock.block != null)
        {
            var points = [
                new Vector2(nBlock.block.rowPos, nBlock.block.columnPos), 
                new Vector2(nBlock.block.rowPos + nBlock.block.blockWidth, nBlock.block.columnPos),
                new Vector2(nBlock.block.rowPos, nBlock.block.columnPos + nBlock.block.blockHeight),
                new Vector2(nBlock.block.rowPos + nBlock.block.blockWidth, nBlock.block.columnPos + nBlock.block.blockHeight),
                new Vector2(nBlock.block.rowPos + nBlock.block.blockWidth / 2, nBlock.block.columnPos + nBlock.block.blockHeight / 2)
            ];    
        }

        var collided = false;
        points.forEach(point => {
            var dir = new Vector2(point.x - Ball.xPos, point.y - Ball.yPos);
            dir.Normalised();

            var collPos = new Vector2(Ball.xPos + dir.x * Ball.radius * 0.9, Ball.yPos + dir.y * Ball.radius * 0.9);
            if(collPos.x >= nBlock.block.rowPos && collPos.x <= nBlock.block.rowPos + nBlock.block.blockWidth
                && collPos.y >= nBlock.block.columnPos && collPos.y <= nBlock.block.columnPos + nBlock.block.blockHeight)
                {
                    //Collision avec ce block
                    if(!collided)
                    {
                        nBlock.block.life--;
                        if(nBlock.block.life <= 0)
                        {
                            var index = blocks.findIndex(b => b.rowPos == nBlock.block.rowPos && b.columnPos == nBlock.block.columnPos);
                            blocks.splice(index, 1);
                        }
                        collided = true;

                        //Change Ball velocity
                        dir.x *= -1;
                        dir.y *= -1;

                        Ball.velocity.x = dir.x * Ball.speed;
                        Ball.velocity.y = dir.y * Ball.speed;
                    }
                }
            });
        });

    // Ball and walls (top left bottom)
    if(Ball.xPos + Ball.radius  >= canvas.width || Ball.xPos - Ball.radius <= 0)
    {
        Ball.velocity.x *= -1;
    }
    if(Ball.yPos - Ball.radius <= 0)
    {
        Ball.velocity.y *= -1;
    }
    if(Ball.yPos - Ball.radius >= canvas.height)
    {
        alert("you loose sorry");
    }

    // Check colision boule - blocks
    var dir = [
        new Vector2(SpaceBar.xPos - Ball.xPos, SpaceBar.yPos - Ball.yPos),
        new Vector2(SpaceBar.xPos + SpaceBar.width - Ball.xPos, SpaceBar.yPos - Ball.yPos),
        new Vector2(SpaceBar.xPos - Ball.xPos, SpaceBar.yPos + SpaceBar.height - Ball.yPos),
        new Vector2(SpaceBar.xPos + SpaceBar.width - Ball.xPos, SpaceBar.yPos + SpaceBar.height - Ball.yPos),
        new Vector2(SpaceBar.xPos + SpaceBar.width / 2 - Ball.xPos, SpaceBar.yPos + SpaceBar.height / 2 - Ball.yPos)
    ];

    var collided = false;
    dir.forEach(function (e, index) {
        e.Normalised();

        var pos = new Vector2(Ball.xPos + e.x * Ball.radius * 0.9, Ball.yPos + e.y * Ball.radius * 0.9);
        if(!collided)
        {
            if(pos.x >= SpaceBar.xPos && pos.x <= SpaceBar.xPos + SpaceBar.width
                && pos.y >= SpaceBar.yPos && pos.y <= SpaceBar.yPos + SpaceBar.height)
                {
                    collided = true;

                    Ball.velocity.y *= -1;

                    // Modify dir
                    var newDir = (SpaceBar.xPos - pos.x);
                    if(newDir < -130 || newDir > -40)
                    {
                        Ball.velocity.x *= -1;
                    }
                }
        }
    });
}

__InitGame__();