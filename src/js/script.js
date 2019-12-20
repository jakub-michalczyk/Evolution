let loop = null;
let blobID = 0;
let blobs = [];
let food = [];
let timer = {hours: 12, minutes: '00', seconds: '00'};
let night = 0;
let day = false;
let stopLoop = false;

class Blob{
    constructor(size, speed, color, x, y, resistance, howManyDots, dots, parents, bornDelay, hunger, death, children, partner, needLove, hungerBar, sexDelay, dominant, generation, initialValues){
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.x = x;
        this.y = y;
        this.resistance = resistance;
        this.dots = dots;
        this.howManyDots = howManyDots;
        this.parents = parents;
        this.bornDelay = bornDelay;
        this.hunger = hunger;
        this.death = death;
        this.children = children;
        this.partner = partner;
        this.needLove = needLove;
        this.hungerBar = hungerBar;
        this.sexDelay = sexDelay;
        this.dominant = dominant;
        this.generation = generation;
        this.initialValues = initialValues;
    }

    giveBlobID(){
        this.id = blobID;
        blobID++;
    }
    
    declareBlobHungerBar(){
        this.initialValues.hunger = this.hunger;
        //Init blob hunger bar with their hunger reduced sixteen times
        this.hungerBar.width = this.initialValues.hunger / 16
    }

    blobAI(){
        this.pickPoint()
    }

    pickPoint(){
        //If blob doesn't picked point, pick a new cordinates
        if(this.pointPicked === undefined){
            this.pointPicked = randomCords();
            this.startMoving();
        }
        else if(this.pointPicked === 'rest'){
            // Blob goes to rest
            this.rest();
        }
        else{
            this.startMoving();
        }
    }

    rest(){
        this.resistance--;
        // Blob's hunger decreases by 0.10% every frame during rest
        this.hunger -= percentage(this.initialValues.hunger, 0.10);

        if(this.hungerBar.width > 0){
            this.hungerBar.width -= percentage(this.initialValues.hunger / 16, 0.10);
        }
        
        if(this.needLove){
            // Born delay variable determines how much time they need to make baby 
            this.bornDelay--;
        }
       
        if (this.resistance <= 0) {
            if(this.needLove && this.death === 500 && this.partner.death === 500){
               //If they rested and still alive they make baby blob
               this.getBorn(this.partner);

               this.bornDelay = 700;
               this.partner.bornDelay = 700;
               this.needLove = false;
               this.partner.needLove = false;
       
               this.partner.partner = null;
               this.partner = null;
            }

            //Sex delay variable determines how much time they need before they could do next copulation
            this.sexDelay--;
            this.resistance = 350;
            this.partner !== null ? this.partner.resistance = 350 : null;
            this.pointPicked = undefined;

            this.pickPoint();
        }
    }

    checkHunger(){
        if(this.hunger <= 0){
            return true
        }
    }

    blobDeath(){
        if(this.death === 500){
            //If blob is going to be dead they need rest before they finally dead
            this.rest();
        }

        if(this.death < 500){
            //Gradually all dots sizes are decreasing along with whole blob size
            this.dots.forEach(dot => {
                if(dot.size > 0.1){
                    dot.size -= 0.1
                }
            });

            if(this.size > 0.1){
                this.size -= 0.1;
            }
            else{
                this.death = 0;
                delete blobs[this.id]
            }
        }
    }

    startMoving(){
        if(this.checkHunger()){
            //If blob hunger variable is below 0 it started to be dead
            this.death--;
            this.blobDeath();
        }
        else{
            this.checkForCollision();
            //When blob is moving it's hunger variable is decreased by 0.20% every frame
            this.hunger -= percentage(this.initialValues.hunger, 0.20)
            
            if(this.sexDelay <= 0){
                this.sexDelay = 500;
            }

            if(this.sexDelay !== 500){
                this.sexDelay--;
            }

            if(this.hungerBar.width > 0){    
                this.hungerBar.width -= percentage(this.initialValues.hunger / 16, 0.20);
            }
        
            //Determines direction of picked point and move to it with blob's speed
            if(this.x < this.pointPicked.x){
                this.x += this.speed;
                this.dots.forEach( dot => dot.x += this.speed)
            }
            else if(this.x > this.pointPicked.x){
                this.x -= this.speed;
                this.dots.forEach(dot => dot.x -= this.speed);
            }
    
            if(this.y < this.pointPicked.y){
                this.y += this.speed;
                this.dots.forEach(dot => dot.y += this.speed)
            }
            else if(this.y > this.pointPicked.y){
                this.y -= this.speed;
                this.dots.forEach(dot => dot.y -= this.speed);
            }
    
            if(this.x === this.pointPicked.x && this.y === this.pointPicked.y){
                //If blob reached the picked point it is going to rest
                this.pointPicked = 'rest';
                this.rest();
            }
    
            this.checkForFood();
        }
    }

    checkForFood(){
        food.forEach(meal => {
            let x0 = this.x;
            let x1 = meal.x;
            let y0 = this.y;
            let y1 = meal.y;
    
            //Check if blob has eaten food
            if (Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) < this.size) {
                //If blob is baby it hunger variable increases more than the adult ones
                this.size < 30 ? this.hunger += percentage(this.initialValues.hunger, 7) : this.hunger += percentage(this.initialValues.hunger, 15);

                if(this.size < 30){
                    this.hungerBar.width += percentage(this.initialValues.hunger / 16, 7);
                }
                else{
                    this.hungerBar.width += percentage(this.initialValues.hunger / 16, 15);
                }
                
                //Filter the food that was eaten and disapear them
                meal.eaten = true;

                let filteredFood = food.filter(meal => meal.eaten !== true);
                
                while (food.length > 0) {
                    food.pop();
                }
                
                filteredFood.forEach(meal => food.push(meal));

                //When blob ate food it is gowing to grow along with it's dots
                this.size++;
                this.dots.forEach( dot => {
                    //Blobs dots x and y point are going to change according to blob's new size
                    dot.randX.plusOrMinus % 2 === 0 ? dot.x += 0.10 : dot.x -= 0.10;
                    dot.randY.plusOrMinus % 2 === 0 ? dot.y += 0.10 : dot.y -= 0.10;
                    dot.size += (dot.size / 48);
                });
            }
        });
    }

    checkForCollision(){
        blobs.forEach( blob => {
            if(blob.id !== this.id){
                let x0 = this.x;
                let x1 = blob.x;
                let y0 = this.y;
                let y1 = blob.y;

                //Check if two blobs met
                if(Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) < this.size && blob.size >= 20){
                    //If blob is ready to do copulation and isn't a baby one than start copulation
                    if(this.bornDelay === 700 && blob.bornDelay === 700 && this.sexDelay === 500 && this.size > 20 && blob.size > 20){
                        this.startCloseUp(blob);
                    }
                }
            }
        });

    }

    startCloseUp(blob){
        if(this.partner === null){
            //Blobs are now partners
            this.partner = blob;
            this.partner.partner = this;

            this.needLove = true;
            this.partner.needLove = true;

            this.pointPicked = 'rest';
            this.partner.pointPicked = 'rest';

            this.partner.rest();
            this.rest();
        }
    }

    getBorn(blob){
        //Create random combo of new blob's color and his dots color according to his parents ones
        let parentData = [{color: this.color, dots: this.dots}, {color: blob.color, dots: blob.dots}];
        let parentGene = Math.floor(Math.random() * 2); 
        let newBorn = new Blob(
            20, // Size
            1, // Speed
            parentData[parentGene].color, // Color
            this.x, // X
            this.y, // Y
            350, // Resistance
            20, // How many dots
            [], // Dots array
            [this, blob], //Parents
            750, //Born delay
            1500, // Hunger
            500, // Death
            [], // Children
            null, //Partner
            false, // Need love
            {
                width: 100,
                height: 10
            }, //Hunger bar
            500, // Sex dealy
            {}, // Dominant feature
            (this.generation + blob.generation / 2) + 1,
            {
                hunger: null // Initial values
            }
        );
        
        this.declareBabyBlobDominantFeature(newBorn, blob, blob.partner);
        newBorn.giveBlobID();
        newBorn.declareBlobHungerBar();

        for(let i = 0; i <= newBorn.howManyDots; i++){
            initBlobDots(newBorn, i, parentGene === 0 ? parentData[1].color : parentData[0].color)
        }

        this.children.push(newBorn);
        blob.children.push(newBorn);
        blobs.push(newBorn);
    }

    declareBabyBlobDominantFeature(child, parent1, parent2){
        let randomPercent = Math.floor(Math.random() * (child.generation * 10)) + 1;
        let searchedFeaure; 

        parent1.dominant.value > parent2.dominant.value ? searchedFeaure = parent1.dominant.feature : searchedFeaure = parent2.dominant.feature;
        child.dominant.feature = searchedFeaure;
        child.dominant.value = randomPercent;

        for(let key in child){
            if(key === searchedFeaure){
                child[searchedFeaure] += percentage(child[searchedFeaure], randomPercent);
            }
        }
    }
}

function dayTime(){
    //Simple day and night system
    if(day && timer.hours >= 3){
        night -= 0.001;
        document.querySelector('#dayBox').style.opacity = `${night}`;
    }

    if(night <= 0){
        night = 0;
        day = false;
    }

    if(night >= 0.7){
        day = true
    }

    if( timer.hours >= 18 && !day){
        night += 0.001;
        document.querySelector('#dayBox').style.opacity = `${night}`;
    }
}

function pSBC(p,c0,c1,l){
    //Function to make darker or lighter version of color
    let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
    if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
    h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
    if (!f || !t) return null;
    if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
    else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
    a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
    function pSBCr(d) {
        let n = d.length, x = {};
        if (n > 9) {
            [r, g, b, a] = d = d.split(","), n = d.length;
            if (n < 3 || n > 4) return null;
            x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1
        } else {
            if (n == 8 || n == 6 || n < 4) return null;
            if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
            d = i(d.slice(1), 16);
            if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000;
            else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
        } return x
    }
}

function startTimer(){
    document.querySelector('#timer').textContent = `${timer.hours}:${timer.minutes}:${timer.seconds}`;
}

function viewBlobInfo(e) {
    blobs.forEach(blob => {
        let x0 = e.clientX;
        let x1 = blob.x;
        let y0 = e.clientY;
        let y1 = blob.y;

        //Check if cursor clicks on the blob
        if (Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) < blob.size) {
            createBlobInfoBox(blob);
        }
    });
}


function createBlobInfoBox(blob){
    let box;

    document.querySelector('#blobInfoBox') !== null ? box = document.querySelector('#blobInfoBox') : box = document.createElement('div');
    box.id = 'blobInfoBox';

    if(blob.hunger >= 0 && blob.partner !== null){
        box.innerHTML = 
        `<span id="close">
            <img src='../img/close.png' />
         </span>
         <canvas width="150px" height="150px" id="miniature"></canvas>
         <div>Blob id: <span>${blob.id}</span></div>
         <div id="blobSize">Blob size: <span>${blob.size}</span></div>
         <div id="blobHunger">Blob hunger: <span>${blob.hunger}</span></div>
         <div id="blobResist">Blob resistance: <span>${blob.resistance}</span></div>
         <div id="blobBornDelay">Blob born delay: <span>${blob.bornDelay}</span></div>
         <div id="blobPartner">Blob partner:</div>
         <div id="blobDominantFeature">Blob dominant feature: <span>${blob.dominant.feature[0].toUpperCase()}${blob.dominant.feature.slice(1, )}</span></div>
         <canvas width="150px" height="150px" id="partner"></canvas>`
    }
    else if(blob.hunger >= 0 && blob.partner === null){
        box.innerHTML = 
        `<span id="close">
            <img src='../img/close.png' />
        </span>
        <canvas width="150px" height="150px" id="miniature"></canvas>
        <div>Blob id: <span>${blob.id}</span></div>
        <div id="blobSize">Blob size: <span>${blob.size}</span></div>
        <div id="blobHunger">Blob hunger: <span>${blob.hunger}</span></div>
        <div id="blobResist">Blob resistance: <span>${blob.resistance}</span></div>
        <div id="blobBornDelay">Blob born delay: <span>${blob.bornDelay}</span></div>
        <div id="blobDominantFeature">Blob dominant feature: <span>${blob.dominant.feature[0].toUpperCase()}${blob.dominant.feature.slice(1, )}</span></div>`
    }
    else{
        box.innerHTML = 
        `<span id="close">
            <img src='../img/close.png' />
         </span>
         <div id="deadBlobImgBox">
            <img src='../img/skull.png'>
         </div>
         <div>This blob is <span>dead!</span></div>`
    }
        

    document.querySelector('#blobInfoBox') === null ? document.body.appendChild(box) : null;
    document.querySelector('#close').addEventListener('click', () => document.querySelector('#blobInfoBox').remove());
    drawBlobInfo(blob);
    blob.partner !== null ? drawBlobPartnerMiniature(blob) : null;
}



function drawBlobInfo(blob){
    const miniature = document.querySelector('#miniature');
    let ctx;
    
    if(miniature !== null){
        ctx = miniature.getContext('2d');

        //SHADOW
    
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.arc( (miniature.width / 2) - 1.5, (miniature.height / 2) - 1.5, blob.size + 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    
        //BODY
    
        ctx.beginPath();
        ctx.fillStyle = blob.color;
        ctx.arc(miniature.width / 2, miniature.height / 2, blob.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    
        //DOTS
       
        blob.dots.forEach(dot => {
            ctx.beginPath();
            ctx.fillStyle = dot.color;
            ctx.arc(
                dot.randX.plusOrMinus % 2 === 0 ? miniature.width / 2 + dot.randX.x : miniature.width / 2 - dot.randX.x, 
                dot.randY.plusOrMinus % 2 === 0 ? miniature.height / 2 + dot.randY.y : miniature.height / 2 - dot.randY.y,  
                dot.size, 
                0, 2 * Math.PI
            );
            ctx.fill();
            ctx.closePath();
        });
    }
}

function drawBlobPartnerMiniature(blob){
    const partner = document.querySelector('#partner');
    const partnerCtx = partner.getContext('2d');

    //BG
    drawBlobPartnerMiniatureBg(partner, partnerCtx);

    //BODY
    drawBlobPart(partnerCtx, 'rgba(0, 0, 0, 0.3)', (partner.width / 2) - 1.5, (partner.height / 2) - 1.5, (blob.partner.size / 1.3))

    //SHADOW
    drawBlobPart(partnerCtx, blob.partner.color, partner.width / 2, partner.height / 2, (blob.partner.size / 1.3))

    //DOTS

    blob.partner.dots.forEach(dot => {
        partnerCtx.beginPath();
        partnerCtx.fillStyle = dot.color;
        partnerCtx.arc(
            dot.randX.plusOrMinus % 2 === 0 ? partner.width / 2 + dot.randX.x : partner.width / 2 - dot.randX.x, 
            dot.randY.plusOrMinus % 2 === 0 ? partner.height / 2 + dot.randY.y : partner.height / 2 - dot.randY.y,  
            (dot.size / 1.3), 
            0, 2 * Math.PI
        );
        partnerCtx.fill();
        partnerCtx.closePath();
    });
}

function drawBlobPartnerMiniatureBg(partner, partnerCtx){
    partnerCtx.beginPath();
    partnerCtx.fillStyle = '#0d0d0d';
    partnerCtx.fillRect(0, 0, partner.width, partner.height);
    partnerCtx.fill();
    partnerCtx.closePath();
}

function drawBlobPart(ctx, color, x, y, size){
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

function drawBlob(blob){
    const blobCanvas = document.querySelector('#characters');
    const ctx = blobCanvas.getContext('2d');

    //SHADOW

    drawBlobPart(ctx, 'rgba(0, 0, 0, 0.3)', blob.x - 1.5, blob.y - 1.5, blob.size + 1);

    //BODY

    drawBlobPart(ctx, blob.needLove ? '#ff3399' : blob.color, blob.x, blob.y, blob.size)

    //DOTS
   
    blob.dots.forEach(dot => {
        drawBlobPart(ctx, blob.needLove ? '#b30059' : dot.color, dot.x, dot.y, dot.size)
    });

    //Blob hunger bar

    if(blob.hunger > 0){
        ctx.beginPath();
        ctx.fillStyle = "#ff4d4d";
        ctx.fillRect((blob.x - blob.hungerBar.width / 2), blob.y - (blob.size + 15), blob.hungerBar.width, blob.hungerBar.height);
        ctx.fill();
        ctx.closePath();
    }
}

(function init(){
    startTimer();
    initBlobs();
    simulationLoop();
    renderFood(100);

    document.addEventListener('click', viewBlobInfo);
    document.addEventListener('mousemove', changeCursor);
})();

function changeCursor(e){
    let checkBlobsPositon = blobs.some(blob => {
        let x0 = e.clientX;
        let x1 = blob.x;
        let y0 = e.clientY;
        let y1 = blob.y;

        //Change cursor to pointer if it during mouse move goes to a blob
        if (Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) < blob.size) {
            return true;
        }
    });

    checkBlobsPositon ? document.body.style.cursor = 'pointer' : document.body.style.cursor = 'default'
}

function simulationLoop(){
    if(stopLoop){
        return cancelAnimationFrame(loop);
    }

    //Main animation loop that indicates most of the whole simulation
    tickTimer();
    drawBackground();

    if( (timer.hours === 12 ) && timer.minutes === '00' || (timer.hours === '00' ) && timer.minutes === '00' ){
        //Every twelve o 'clock render a new portion of food
        renderFood(100)
    }

    blobs.forEach( blob => {
        if(blob !== undefined){
            if(blob.size >= 100){
                simulationEnd('won', blob);
                stopLoop = true;
            }
            drawBlob(blob);
            blob.blobAI();
        }
    });

    let lose = blobs.every(chckedBlob => chckedBlob === undefined);

    if(lose){
        simulationEnd('lose', null);
        stopLoop = true;
    }

    food.forEach( meal => drawFood(meal))

    loop = requestAnimationFrame(simulationLoop);
    updateBlobInfo();
}

function simulationEnd(type, blob){
    const finalBox = document.createElement('div');
    finalBox.id = 'finalBox'

    if(type === 'won'){
        finalBox.innerHTML = 
            `<h1>Simulation is over</h1>
             <h2>Blob with id <span>${blob.id}</span> was the strongest unit</h2>
             <canvas id="winner"></canvas>`
        
        document.body.appendChild(finalBox);
        drawTheWinner(blob);
    }
    else{
        finalBox.innerHTML = 
            `<h1>Simulation is over</h1>
             <h2>All blobs are <span>dead</span></h2>`
        
        document.body.appendChild(finalBox);
    }
}

function drawTheWinner(blob){
    const winner = document.querySelector('#winner');
    const ctx = winner.getContext('2d');

    winner.width = window.innerWidth / 3;
    winner.height = window.innerHeight / 3

    //SHADOW

    ctx.beginPath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.arc( (winner.width / 2) - 1.5, (winner.height / 2) - 1.5, (blob.size / 1.5) + 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    //BODY

    ctx.beginPath();
    ctx.fillStyle = blob.color;
    ctx.arc(winner.width / 2, winner.height / 2, (blob.size / 1.5), 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    //DOTS
   
    blob.dots.forEach(dot => {
        ctx.beginPath();
        ctx.fillStyle = dot.color;
        ctx.arc(
            dot.randX.plusOrMinus % 2 === 0 ? winner.width / 2 + dot.randX.x : winner.width / 2 - dot.randX.x, 
            dot.randY.plusOrMinus % 2 === 0 ? winner.height / 2 + dot.randY.y : winner.height / 2 - dot.randY.y,  
            dot.size / 1.5, 
            0, 2 * Math.PI
        );
        ctx.fill();
        ctx.closePath();
    });
}

function updateBlobInfo(){
    if(document.querySelector('#blobInfoBox') === null) {
        return;
    }
    
    let searchedBlob = null;

    blobs.forEach(blob => {
        blob.id === parseInt(document.querySelector('#blobInfoBox div span').textContent) ? searchedBlob = blob : null;
    });

    if(searchedBlob !== null){
        if(searchedBlob.hunger <= 0){
            document.querySelector('#blobInfoBox').innerHTML = 
            `<span id="close">
                <img src='../img/close.png' />
             </span>
             <div id="deadBlobImgBox">
                <img src='../img/skull.png'>
             </div>
             <div>This blob is <span>dead!</span></div>`

             document.querySelector('#close').addEventListener('click', () => document.querySelector('#blobInfoBox').remove());
        }
    }
    

    document.querySelector('#blobSize') !== null ? document.querySelector('#blobSize').innerHTML = `Blob size: <span>${searchedBlob.size.toFixed(2)}</span>` : null;
    document.querySelector('#blobHunger') !== null ? document.querySelector('#blobHunger').innerHTML = `Blob hunger: <span>${searchedBlob.hunger.toFixed(2)}</span>` : null;
    document.querySelector('#blobResist') !== null ? document.querySelector('#blobResist').innerHTML = `Blob resistance: <span>${searchedBlob.resistance.toFixed(2)}</span>` : null;
    document.querySelector('#blobBornDelay') !== null ? document.querySelector('#blobBornDelay').innerHTML = `Blob born delay: <span>${searchedBlob.bornDelay.toFixed(2)}</span>` : null;
}

function tickTimer(){
    let seconds = parseInt(timer.seconds);
    let minutes = parseInt(timer.minutes);
    let hours = parseInt(timer.hours);

    seconds += 30;

    //SECONDS

    if(seconds < 10){
        seconds = '0' + seconds
    }

    if(seconds >= 59){
        minutes++;
        seconds = '00';
    }

    //MINUTES

    if(minutes < 10){
        minutes = '0' + minutes;
    }
    if(minutes === 59){
        minutes = '00'
        hours++;
    }

    //HOURS

    if(hours < 10){
        hours = '0' + hours;
    }

    if(hours === 24){
        hours = '00'
    }

    timer.seconds = seconds;
    timer.minutes = minutes;
    timer.hours = hours;

    startTimer();
    dayTime();
}

function drawBackground(){
    const terrain = document.querySelector('#characters');
    const ctx = terrain.getContext('2d');
    const img = new Image();

    img.src = '../img/bg.jpg';
    terrain.width = window.innerWidth;
    terrain.height = window.innerHeight;

    ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
}

function initBlobs(){
    const blobCanvas = document.querySelector('#characters');

    if(blobs.length === 0){
        blobCanvas.width = window.innerWidth;
        blobCanvas.height = window.innerHeight;

        for(let i = 0; i < 10; i++){
            blobs.push(
                new Blob(
                    30, // Size
                    1, // Speed
                    randomColor(), // Color 
                    0, // X
                    0, // Y
                    350, // Resistance
                    20, // How many dots
                    [], // Dots array
                    [], // Parents
                    700, // Born delay
                    1500, // Hunger
                    500, // Death
                    [], // Children
                    null, // Partner
                    false, // Need Love
                    { width: 100, height: 10 }, // Hunger bar
                    500, // Sex delay  
                    {}, // Dominant
                    1, // Generation
                    {
                        hunger: null // Initial values
                    }
                ) 
            );

            declareBlobDominantFeature(i)
        }
    }
    
    blobs.forEach(blob => {
        blob.giveBlobID();
        blob.declareBlobHungerBar();

        if(blob.x === 0 && blob.y === 0){
            declareBlobRenderPoint(blob)
        }

        for(let i = 0; i <= blob.howManyDots; i++){
            initBlobDots(blob, i)
        }
    });
}

function declareBlobDominantFeature(blobID){
    // Every blob has a one random feature that has higher value that a regural one
    let defaultBlob = {
        size: 30,
        speed: 1,
        resistance: 350,
        bornDelay: 700,
        hunger: 1500,
        sexDelay: 500
    };
    let randomFeature = Math.floor(Math.random() * (Object.keys(defaultBlob).length));
    let randomPercent = Math.floor(Math.random() * 10) + 1;
    let searchedFeaure = blobs[blobID][Object.keys(defaultBlob)[randomFeature]];
   
    blobs[blobID].dominant.feature = Object.keys(defaultBlob)[randomFeature];
    blobs[blobID].dominant.value = randomPercent; 
    searchedFeaure += percentage(searchedFeaure, randomPercent);
}

function percentage(num, per){
  return (num / 100) * per;
}

function initBlobDots(blob, i, specialColor){
    // Generate random position, size and color of every blob's dots
    let randDotX = {x: Math.floor(Math.random() * 13), plusOrMinus: i};
    let randDotY = {y: Math.floor(Math.random() * 13), plusOrMinus: i};

    blob.dots.push({
        color: specialColor === undefined ? getRandomDotColor(blob.color) : getRandomDotColor(specialColor),
        size: Math.floor(Math.random() * (blob.size / 5)),
        x: i % 2 === 0 ? blob.x + randDotX.x : blob.x - randDotX.x,
        y: i % 2 === 0 ? blob.y + randDotY.y : blob.y - randDotY.y,
        randX: randDotX,
        randY: randDotY
    });
}

function getRandomDotColor(color){
    let number = Math.floor(Math.random() * (10 - 5) ) + 5;
    let newColor = pSBC(Number(`-0.${number}`), color);

    return newColor;
}

function declareBlobRenderPoint(blob){
    const cords = randomCords();

    blob.x = cords.x;
    blob.y = cords.y;
}

function renderFood(howMuch){
    for(let i = 0; i < howMuch; i++){
        const cords = randomCords();

        food.push({x: cords.x, y: cords.y, size: 0.5});
    }
}

function drawFood(foodToDraw){
    if(foodToDraw.size < 5){
        foodToDraw.size += 0.5;
    }
    
    drawPartOfFood('saddlebrown', foodToDraw.x + 2, foodToDraw.y - 2, foodToDraw.size + (foodToDraw.size / 2));
    drawPartOfFood('yellow', foodToDraw.x, foodToDraw.y, foodToDraw.size);
    drawPartOfFood('wheat', foodToDraw.x - 1, foodToDraw.y + 2, foodToDraw.size - (foodToDraw.size / 2));
}

function drawPartOfFood(color, x, y, size){
    const c = document.querySelector('#characters');
    const ctx = c.getContext('2d');

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

function randomCords(){
    return {
        x: Math.floor(Math.random() * window.innerWidth),
        y: Math.floor(Math.random() * window.innerHeight)
    }
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let color = {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } 

    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

function randomColor(){
    let str = '0123456789abcdef';
    let color = '#';

    for (let i = 0; i <= 5; i++) {
        color += str[Math.floor(Math.random() * str.length)];
    }

    return color;
}
