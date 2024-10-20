const b2Vec2=Box2D.Common.Math.b2Vec2,
    b2AABB=Box2D.Collision.b2AABB,
    b2BodyDef=Box2D.Dynamics.b2BodyDef,
    b2Body=Box2D.Dynamics.b2Body,
    b2FixtureDef=Box2D.Dynamics.b2FixtureDef,
    b2Fixture=Box2D.Dynamics.b2Fixture,
    b2World=Box2D.Dynamics.b2World,
    b2MassData=Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape=Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape=Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw=Box2D.Dynamics.b2DebugDraw,
    b2MouseJointDef=Box2D.Dynamics.Joints.b2MouseJointDef,
    b2ContactListener=Box2D.Dynamics.b2ContactListener,
    worldScale=30;
const stageWidth=1050,stageHeight=700;
let world,stage;
let paused=false,finish=false,pressKey=null,pressMouse=false;
let background,player,men,deng,flag,updateActors=[],effectLayer,makeEnemy,grade;
let gradePanel,pausePanel,winPanel,failPanel;
let backMusic;

function updateGrade(item,v){
    grade[item]+=v;
    document.getElementById(item).innerText=item+': '+grade[item];
}

// init game
function initGame(){
    updateActors.forEach(a=>clearInterval(a.fireter));
    updateActors=[];
    delete stage;
    delete world;
    world=new b2World(new b2Vec2(0,0),true);
    world.SetContactListener(contactListener);
    stage=new createjs.Stage('canvas');
    paused=false;
    finish=false;
    pressKey=null;
    pressMouse=false;
    makeEnemy=false;
    document.getElementById('gradePanel').style.opacity=1;
    grade={
        'Score':0,
        'Kill Tanks':0,
        'Kill Soldiers':0
    };
    backMusic=createjs.Sound.play('marseillaise',{loop:-1,volume:.5});
    // background
    background=new createjs.Sprite(new createjs.SpriteSheet({
        'images':[preload.getResult('background')],
        'frames':{
            'width':1050,
            'height':700
        },
        'animations':{
            'begin':[0,15,'begin',1,-1]
        }
    }),'begin');
    background.stop();
    stage.addChild(background);
    // dead people
    for(let i=0;i<6;i++){
        DeadPeople(i);
    }
    // make borders
    for(let i=0;i<stageWidth;i+=50){
        let b=new createjs.Bitmap(preload.getResult('decoration'));
        b.sourceRect=new createjs.Rectangle(50,200,50,50);
        b.x=i;
        b.y=150;
        stage.addChild(b);
        b=new createjs.Bitmap(preload.getResult('decoration'));
        b.sourceRect=new createjs.Rectangle(50,200,50,50);
        b.x=i+50;
        b.y=650;
        b.scaleX=-1;
        stage.addChild(b);
    }
    for(let i=200;i<stageHeight-50;i+=50){
        let b=new createjs.Bitmap(preload.getResult('decoration'));
        b.sourceRect=new createjs.Rectangle(0,200,50,50);
        b.x=0;
        b.y=i;
        stage.addChild(b);
        b=new createjs.Bitmap(preload.getResult('decoration'));
        b.sourceRect=new createjs.Rectangle(0,200,50,50);
        b.x=stageWidth-50;
        b.y=i+50;
        b.scaleY=-1;
        stage.addChild(b);
    }
    makeBorder(stageWidth/2,175,stageWidth/2,25);
    makeBorder(stageWidth/2,stageHeight-25,stageWidth/2,25);
    makeBorder(25,200+(stageHeight-250)/2,25,(stageHeight-250)/2);
    makeBorder(stageWidth-25,200+(stageHeight-250)/2,25,(stageHeight-250)/2);
    // make actors
    effectLayer=new createjs.Container();
    flag=Flag();
    player=Player();
    men=Tiananmen();
    deng=DengXiaoping();
    stage.addChild(effectLayer);
    for(let i=0;i<2;i++){Tank();}
    for(let i=0;i<2;i++){Soldier();}
}

function update(){
    if(paused)return;
    world.Step(1/60,8,3);
    world.ClearForces();
    updateActors.forEach(a=>{
        a.update();
    });
    stage.update();
    if(makeEnemy){
        makeEnemy=false;
        if(Math.random()<0.66)Soldier();
        else Tank();
    }
}

// get birth point
let enemyBirthPoint=[
    new Vector2D(stageWidth/2,225),
    new Vector2D(75,225),
    new Vector2D(stageWidth-75,225),
    new Vector2D(75,stageHeight-75),
    new Vector2D(stageWidth-75,stageHeight-75)
];
function getBirthPoint(){
    while(true){
        let p=enemyBirthPoint[Math.floor(Math.random()*enemyBirthPoint.length)];
        if(p.dist(new Vector2D(player.x,player.y))>=200)return p;
    }
}

// add contact event listener
const contactListener=new b2ContactListener();
contactListener.BeginContact=function(contact){
    if(finish)return;
    let objA=contact.GetFixtureA().GetUserData();
    let objB=contact.GetFixtureB().GetUserData();
    objA.beginContact(objB);
    objB.beginContact(objA);
};
contactListener.EndContact=function(contact){
    let objA=contact.GetFixtureA().GetUserData();
    let objB=contact.GetFixtureB().GetUserData();
    objA.endContact(objB);
    objB.endContact(objA);
};

// dead people
function DeadPeople(frame){
    let main=new createjs.Sprite(new createjs.SpriteSheet({
        'images':[preload.getResult('decoration')],
        'frames':{
            'width':50,
            'height':50,
            'regX':0,
            'regY':0
        },
        'animations':{
            'begin':[15,20,'begin']
        }
    }));
    main.x=50+Math.round(Math.random()*18)*50;
    main.y=200+Math.round(Math.random()*8)*50;
    main.gotoAndStop(15+frame);
    stage.addChild(main);
    return main;
}

// make border
function makeBorder(x,y,w,h){
    let bodyDef=new b2BodyDef();
    bodyDef.position.Set(x/worldScale,y/worldScale);
    bodyDef.type=b2Body.b2_staticBody;
    let shape=new b2PolygonShape();
    shape.SetAsBox(w/worldScale,h/worldScale);
    let fixtureDef=new b2FixtureDef();
    fixtureDef.shape=shape;
    fixtureDef.userData={
        'tag':'Wall',
        'beginContact':function(){},
        'endContact':function(){}
    };
    world.CreateBody(bodyDef).CreateFixture(fixtureDef);
}

// class Actor
function Actor(sheet,anim){
    let main=new createjs.Sprite(new createjs.SpriteSheet(sheet),anim);
    main.setPosition=function(p){
        main.x=p.x;
        main.y=p.y;
        main.body.SetPosition(new b2Vec2(p.x/worldScale,p.y/worldScale));
    };
    main.tag='';
    main.switchAnim=function(anim){
        if(anim===main.currentAnimation)return;
        main.gotoAndPlay(anim);
    }
    main.beginContact=function(){};
    main.endContact=function(){};
    return main;
}

// class Player
function Player(){
    let main=Actor({
        'images':[preload.getResult('player')],
        'frames':{
            'width':50,
            'height':50,
            'regX':25,
            'regY':25
        },
        'animations':{
            'idleDown':[0,0,'idleDown',.3],
            'idleUp':[1,1,'idleUp',.3],
            'idleRight':[2,2,'idleRight',.3],
            'idleLeft':[3,3,'idleLeft',.3],
            'moveDown':[4,7,'moveDown',.3],
            'moveUp':[8,11,'moveUp',.3],
            'moveRight':[12,15,'moveRight',.3],
            'moveLeft':[16,19,'moveLeft',.3],
            'win':[20,23,'win',.3],
            'dead':[24,24,'dead',.3]
        }
    },'idleDown');
    let bodyDef=new b2BodyDef();
    bodyDef.type=b2Body.b2_dynamicBody;
    let shape=new b2PolygonShape();
    shape.SetAsBox(17/worldScale,25/worldScale);
    let fixtureDef=new b2FixtureDef();
    fixtureDef.shape=shape;
    fixtureDef.userData=main;
    main.body=world.CreateBody(bodyDef);
    main.body.CreateFixture(fixtureDef);
    main.body.SetSleepingAllowed(false);
    main.setPosition(new Vector2D(stageWidth/2,525));
    main.speed=12;
    main.hp=10;
    main.bloodBar=BloodBar(main.hp);
    main.tag='Player';
    main.setVelocity=function(x,y){
        main.body.SetLinearVelocity(new b2Vec2(x*main.speed,y*main.speed));
    }
    main.timer=0;
    main.update=function(){
        main.x=main.body.GetPosition().x*worldScale;
        main.y=main.body.GetPosition().y*worldScale;
        main.bloodBar.x=main.x-25;
        main.bloodBar.y=main.y-35;
        if(main.hurting){
            main.alpha=(Math.cos(main.timer)+1)/2;
        }
        main.fire();
        main.timer++;
    };
    main.fireInte=6;
    main.fireTimer=0;
    main.fire=function(){
        main.fireTimer++;
        if(finish || !pressMouse || main.fireTimer%main.fireInte!==1)return;
        createjs.Sound.play('playerFire',{'volume':.2});
        let v=new Vector2D(stage.mouseX-player.x,stage.mouseY-player.y);
        v.length=25;
        let b=PlayerBullet();
        b.setPosition(new Vector2D(player.x+v.x,player.y+v.y));
        v.length=17;
        b.body.SetLinearVelocity(v);
    }
    // contact event
    main.hurting=false;
    main.withDanger=[];
    main.beginContact=function(other){
        if(other.tag==='Enemy'){
            if(main.withDanger.indexOf(other)===-1)
                main.withDanger.push(other);
            main.hit(other.power);
        }else if(other.tag==='EnemyBullet'){
            main.hit(other.power);
        }
    };
    main.endContact=function(other){
        if(other.tag==='Enemy' || other.tag==='EnemyBullet'){
            let i=main.withDanger.indexOf(other);
            if(i>-1)main.withDanger.splice(i,1);
        }
    };
    // hit event
    main.hit=function(point){
        if(main.hurting || paused)return;
        main.hurting=true;
        main.hp-=point;
        main.bloodBar.redraw(main.hp);
        if(main.hp>0){
            createjs.Sound.play('playerHurt');
            setTimeout(function(){
                main.hurting=false;
                main.alpha=1;
                if(main.withDanger.length>0)main.hit(main.withDanger[0].power);
            },1500);
        }
        // game over
        else{
            if(finish)return;
            finish=true;
            main.hurting=false;
            main.alpha=1;
            effectLayer.removeChild(main.bloodBar);
            main.gotoAndStop('dead');
            createjs.Sound.stop();
            createjs.Sound.play('gameOver');
            main.body.m_fixtureList.isSensor=true;
            main.body.SetLinearVelocity(new b2Vec2(0,0));
            stage.update();
            // clear all interval
            failedPanel.style.top='200px';
            updateActors.forEach(a=>{clearInterval(a.fireter);});
        }
    };
    updateActors.push(main);
    stage.addChild(main);
    return main;
}

// class DengXiaoping
function DengXiaoping(){
    let main=Actor({
        'images':[preload.getResult('dengXiaoping')],
        'frames':{
            'width':300,
            'height':100,
            'regX':150,
            'regY':50
        },
        'animations':{
            'fly':[15,29,'fly',2],
            'dead':[0,14,'dead',2]
        }
    },'fly');
    let bodyDef=new b2BodyDef();
    bodyDef.type=b2Body.b2_dynamicBody;
    let shape=new b2PolygonShape();
    shape.SetAsBox(150/worldScale,50/worldScale);
    let fixtureDef=new b2FixtureDef();
    fixtureDef.shape=shape;
    fixtureDef.userData=main;
    main.body=world.CreateBody(bodyDef);
    main.body.CreateFixture(fixtureDef);
    main.body.SetSleepingAllowed(false);
    main.setPosition(new Vector2D(stageWidth/2,50));
    main.hp=50;
    main.bloodBar=BloodBar(main.hp,100);
    main.bloodBar.x=main.x-50;
    main.bloodBar.y=main.y-45;
    main.tag='Enemy';
    main.speed=12;
    main.body.SetLinearVelocity(new b2Vec2(main.speed,0));
    main.update=function(){
        main.x=main.body.GetPosition().x*worldScale;
        main.y=main.body.GetPosition().y*worldScale;
        main.bloodBar.x=main.x-50;
        main.bloodBar.y=main.y-45;
        if(main.x>stageWidth-150)main.body.SetLinearVelocity(new b2Vec2(-main.speed,0));
        else if(main.x<150) main.body.SetLinearVelocity(new b2Vec2(main.speed,0));
    }
    main.fireInte=4000;
    main.fireter=setInterval(function(){
        if(paused)return;
        if(Math.random()>.5)main.attack1();
        else main.attack2();
    },main.fireInte);
    // fire normal bullets
    main.attack1=function(){
        for(let i=-2;i<=2;i++){
            let v=new Vector2D(50,0);
            v.angle=Math.PI/2+i*Math.PI/6;
            let b=DengBullet();
            b.setPosition(new b2Vec2(v.x+main.x,v.y+main.y));
            v.length=10;
            b.setVelocity(v);
        }
    };
    main.attack2=function(){
        let v=new Vector2D(player.x-main.x,player.y-main.y);
        v.length=30;
        let m=Missle();
        m.setPosition(new b2Vec2(main.x,main.y));
        m.setVelocity(v);
    };
    main.beginContact=function(other){
        if(other.tag!=='PlayerBullet')return;
        main.hp--;
        createjs.Sound.play('enemyHurt',{volume:0.3});
        if(main.hp>0){
            main.bloodBar.redraw(main.hp);
            updateGrade('Score',100);
        }
        // enemy dead, game win
        else{
            createjs.Sound.stop()
            createjs.Sound.play('gameWin',{volume:0.3});
            finish=true;
            clearInterval(main.fireter);
            main.gotoAndPlay('dead');
            effectLayer.removeChild(main.bloodBar);
            updateGrade('Score',10000+player.hp*100);
            player.gotoAndPlay('win');
            background.play();
            background.addEventListener('animationend',function(){
                background.stop();
            });
            winPanel.style.top='200px';
        }
        // change Tiananmen
        if(main.hp<=5)men.gotoAndStop(2);
        else if(main.hp<=10)men.gotoAndStop(1);
    };
    main.endContact=function(){};
    updateActors.push(main);
    stage.addChild(main);
    return main;
}

// class DengBullet
function DengBullet(){
    let main=new createjs.Bitmap(preload.getResult('decoration'));
    main.sourceRect=new createjs.Rectangle(122,201,10,10);
    main.regX=5;
    main.regY=5;
    main.tag='EnemyBullet';
    main.power=1;
    let bodyDef=new b2BodyDef();
    bodyDef.position.Set(0,0);
    bodyDef.type=b2Body.b2_dynamicBody;
    let fixtureDef=new b2FixtureDef();
    fixtureDef.shape=new b2CircleShape(5/worldScale);
    fixtureDef.isSensor=true;
    fixtureDef.userData=main;
    main.body=world.CreateBody(bodyDef);
    main.body.CreateFixture(fixtureDef);
    main.body.SetSleepingAllowed(false);
    main.setPosition=function(p){
        main.x=p.x;
        main.y=p.y;
        main.body.SetPosition(new b2Vec2(p.x/worldScale,p.y/worldScale));
    };
    main.setVelocity=function(d){
        main.body.SetLinearVelocity(d);
    };
    main.update=function(){
        main.x=main.body.GetPosition().x*worldScale;
        main.y=main.body.GetPosition().y*worldScale;
        if(main.x<0 || main.x>stageWidth || main.y<0 || main.y>stageHeight)main.dead();
    };
    main.beginContact=function(other){
        if(other.tag==='Player')main.dead();
    };
    main.dead=function(){
        deleteBody(main.body);
        stage.removeChild(main);
        let i=updateActors.indexOf(main);
        if(i>-1)updateActors.splice(i,1);
    };
    main.endContact=function(){};
    updateActors.push(main);
    stage.addChild(main);
    return main;
}

// class Missle
function Missle(){
    let main=new createjs.Bitmap(preload.getResult('decoration'));
    main.sourceRect=new createjs.Rectangle(100,214,50,22);
    main.regX=25;
    main.regY=11;
    main.power=5;
    main.tag='EnemyBullet';
    let bodyDef=new b2BodyDef();
    bodyDef.position.Set(0,0);
    bodyDef.type=b2Body.b2_dynamicBody;
    let shape=new b2PolygonShape();
    shape.SetAsBox(25/worldScale,11/worldScale);
    let fixtureDef=new b2FixtureDef();
    fixtureDef.shape=shape;
    fixtureDef.isSensor=true;
    fixtureDef.userData=main;
    main.body=world.CreateBody(bodyDef);
    main.body.CreateFixture(fixtureDef);
    main.body.SetSleepingAllowed(false);
    main.setPosition=function(p){
        main.x=p.x;
        main.y=p.y;
        main.body.SetPosition(new b2Vec2(p.x/worldScale,p.y/worldScale));
    };
    main.setVelocity=function(d){
        main.body.SetLinearVelocity(d);
        main.rotation=d.angle/Math.PI*180;
        main.body.SetAngle(d.angle);
    };
    main.update=function(){
        main.x=main.body.GetPosition().x*worldScale;
        main.y=main.body.GetPosition().y*worldScale;
        if(main.x<50 || main.x>stageWidth-50 || main.y>stageHeight-100)main.dead();
    };
    main.beginContact=function(other){
        if(other.tag==='Player'){
            main.dead();
        }
    };
    main.dead=function(){
        deleteBody(main.body);
        createjs.Sound.play('boomSound',{volume:.2});
        stage.removeChild(main);
        let i=updateActors.indexOf(main);
        if(i>-1)updateActors.splice(i,1);
        let boom=MissleBoom();
        boom.x=main.x;
        boom.y=main.y;
    };
    main.endContact=function(){};
    updateActors.push(main);
    stage.addChild(main);
    return main;
}

// class MissleBoom
function MissleBoom(){
    let main=new createjs.Sprite(new createjs.SpriteSheet({
        'images':[preload.getResult('boom')],
        'frames':{
            'width':128,
            'height':128,
            'regX':64,
            'regY':64
        },
        'animations':{
            'begin':[0,63,'begin',2]
        }
    }),'begin');
    main.addEventListener('animationend',function(){
        effectLayer.removeChild(main);
    });
    effectLayer.addChild(main);
    return main;
}

// class Enemy
function Enemy(sheet,anim,w=50,h=50){
    let main=Actor(sheet,anim);
    let bodyDef=new b2BodyDef();
    bodyDef.type=b2Body.b2_dynamicBody;
    let shape=new b2PolygonShape();
    shape.SetAsBox(w/2/worldScale,h/2/worldScale);
    let fixtureDef=new b2FixtureDef();
    fixtureDef.shape=shape;
    fixtureDef.userData=main;
    main.body=world.CreateBody(bodyDef);
    main.body.CreateFixture(fixtureDef);
    main.body.SetSleepingAllowed(false);
    main.setPosition(getBirthPoint());
    main.speed=6;
    main.hp=2;
    main.bloodBar=BloodBar(main.hp);
    main.bloodBar.x=main.x-25;
    main.bloodBar.y=main.y-35;
    main.tag='Enemy';
    main.power=1;
    main.velocity=new Vector2D();
    main.update=function(){
        // change velocity
        if(finish){
            main.body.SetLinearVelocity(new b2Vec2(0,0));
            return;
        }
        dx=player.x-main.x;
        dy=player.y-main.y;
        if(Math.abs(dx)>=Math.abs(dy)){
            main.velocity=new Vector2D(dx,0);
        }else{
            main.velocity=new Vector2D(0,dy);
        }
        main.updateAnim();
        main.velocity.length=main.speed;
        main.body.SetLinearVelocity(main.velocity);
        main.x=main.body.GetPosition().x*worldScale;
        main.y=main.body.GetPosition().y*worldScale;
        main.bloodBar.x=main.x-25;
        main.bloodBar.y=main.y-35;
    };
    main.updateAnim=function(){
        if(main.velocity.x>0){
            main.switchAnim('moveRight');
        }else if(main.velocity.x<0){
            main.switchAnim('moveLeft');
        }else{
            if(main.velocity.y>0){
                main.switchAnim('moveDown');
            }else if(main.velocity.y<0){
                main.switchAnim('moveUp');
            }
        } 
    }
    main.beginContact=function(other){
        if(other.tag!=='PlayerBullet')return;
        main.hp--;
        createjs.Sound.play('enemyHurt',{volume:0.3});
        if(main.hp>0)main.bloodBar.redraw(main.hp);
        // enemy dead
        else{
            createjs.Sound.play('enemyDead',{volume:0.1});
            clearInterval(main.fireter);
            let i=updateActors.indexOf(main);
            if(i>-1)updateActors.splice(i,1);
            main.gotoAndPlay('dead');
            // move this sprite under all movable sprites
            let site=10000;
            updateActors.forEach(a=>site=Math.min(stage.children.indexOf(a),site-1));
            stage.addChildAt(main,site)
            setTimeout(()=>stage.removeChild(main),5000);
            effectLayer.removeChild(main.bloodBar);
            main.scoring();
            deleteBody(main.body);
            // Somehow, can't create enemies at here, So create it elsewhere
            makeEnemy=true;
        }
    };
    main.endContact=function(){};
    main.scoring=function(){};
    // fire
    main.bulletClass=TankBullet;
    main.fireInte=2000;
    main.fireter=setInterval(function(){
        if(paused)return;
        let v=main.body.GetLinearVelocity();
        dx=player.x-main.x;
        dy=player.y-main.y;
        if(v.x>0 && Math.abs(dy)<25){
            let bullet=main.bulletClass();
            bullet.setPosition(new Vector2D(main.x+31,main.y));
            bullet.setVelocity(new Vector2D(1,0));
        }else if(v.x<0 && Math.abs(dy)<25){
            let bullet=main.bulletClass();
            bullet.setPosition(new Vector2D(main.x-31,main.y));
            bullet.setVelocity(new Vector2D(-1,0));
        }else{
            if(v.y>0 && Math.abs(dx)<25){
                let bullet=main.bulletClass();
                bullet.setPosition(new Vector2D(main.x,main.y+31));
                bullet.setVelocity(new Vector2D(0,1));
            }else if(v.y<0 && Math.abs(dx)<25){
                let bullet=main.bulletClass();
                bullet.setPosition(new Vector2D(main.x,main.y-31));
                bullet.setVelocity(new Vector2D(0,-1));
            }
        }
    },main.fireInte);
    updateActors.push(main);
    stage.addChildAt(main,stage.children.indexOf(effectLayer)-1);
    return main;
}

// class Soldier
function Soldier(){
    let main=Enemy({
        'images':[preload.getResult('soldier')],
        'frames':{
            'width':50,
            'height':50,
            'regX':25,
            'regY':25
        },
        'animations':{
            'moveDown':[0,3,'moveDown',.3],
            'moveUp':[4,7,'moveUp',.3],
            'moveRight':[8,11,'moveRight',.3],
            'moveLeft':[12,15,'moveLeft',.3],
            'dead':[16,16,'dead',.3]
        }
    },'moveDown',30);
    main.speed=5;
    main.hp=3;
    main.power=1;
    main.bloodBar.setMaxHp(main.hp);
    main.bulletClass=SoldierBullet;
    main.fireInte=500;
    main.scoring=function(){
        updateGrade('Kill Soldiers',1);
        updateGrade('Score',10);
    };
    return main;
}

// class Tank
function Tank(){
    let main=Enemy({
        'images':[preload.getResult('tank')],
        'frames':{
            'width':50,
            'height':50,
            'regX':25,
            'regY':25
        },
        'animations':{
            'moveUp':[0,1,'moveUp',.3],
            'moveDown':[2,3,'moveDown',.3],
            'moveLeft':[4,5,'moveLeft',.3],
            'moveRight':[6,7,'moveRight',.3],
            'dead':[8,8,'dead',.3]
        }
    },'moveDown');
    main.speed=3;
    main.hp=6;
    main.power=3;
    main.bloodBar.setMaxHp(main.hp);
    main.bulletClass=TankBullet;
    main.fireInte=1200;
    main.scoring=function(){
        updateGrade('Kill Tanks',1);
        updateGrade('Score',30);
    };
    return main;
}

// class PlayerBullet
function PlayerBullet(){
    let main=new createjs.Bitmap(preload.getResult('decoration'));
    main.sourceRect=new createjs.Rectangle(111,201,10,10);
    main.regX=5;
    main.regY=5;
    main.tag='PlayerBullet';
    let bodyDef=new b2BodyDef();
    bodyDef.position.Set(0,0);
    bodyDef.type=b2Body.b2_dynamicBody;
    let fixtureDef=new b2FixtureDef();
    fixtureDef.shape=new b2CircleShape(5/worldScale);
    fixtureDef.isSensor=true;
    fixtureDef.userData=main;
    main.body=world.CreateBody(bodyDef);
    main.body.CreateFixture(fixtureDef);
    main.body.SetSleepingAllowed(false);
    main.setPosition=function(p){
        main.x=p.x;
        main.y=p.y;
        main.body.SetPosition(new b2Vec2(p.x/worldScale,p.y/worldScale));
    }
    main.update=function(){
        main.x=main.body.GetPosition().x*worldScale;
        main.y=main.body.GetPosition().y*worldScale;
        if(main.x<0 || main.x>stageWidth || main.y<0 || main.y>stageHeight)main.dead();
    }
    main.beginContact=function(other){
        if(other.tag==='Player' || other.tag==='Wall')return;
        main.dead();
    };
    main.dead=function(){
        stage.removeChild(main);
        deleteBody(main.body);
        let i=updateActors.indexOf(main);
        if(i>-1)updateActors.splice(i,1);
    };
    main.endContact=function(){};
    updateActors.push(main);
    stage.addChild(main);
    return main;
}

// class Tiananmen
function Tiananmen(){
    let main=Actor({
        'images':[preload.getResult('decoration')],
        'frames':{
            'width':150,
            'height':50,
            'regX':75,
            'regY':25,
            'count':3
        },
        'animations':{
            'begin':[0,2,'begin',.3]
        }
    },'begin');
    main.stop();
    main.x=stageWidth/2;
    main.y=125;
    stage.addChild(main);
    return main;
}

// class Flag
function Flag(){
    let main=Actor({
        'images':[preload.getResult('decoration')],
        'frames':{
            'width':50,
            'height':50,
            'regX':25,
            'regY':25
        },
        'animations':{
            'begin':[9,11,'begin',1]
        }
    },'begin');
    main.stop();
    let bodyDef=new b2BodyDef();
    bodyDef.type=b2Body.b2_staticBody;
    let shape=new b2PolygonShape();
    shape.SetAsBox(25/worldScale,25/worldScale);
    let fixtureDef=new b2FixtureDef();
    fixtureDef.shape=shape;
    fixtureDef.userData=main;
    main.tag='Flag';
    main.body=world.CreateBody(bodyDef);
    main.body.CreateFixture(fixtureDef);
    main.setPosition(new Vector2D(stageWidth/2,425));
    main.hitCount=0;
    main.beginContact=function(other){
        if(other.tag!=='PlayerBullet' || main.hitCount===6)return;
        createjs.Sound.play('hitFlag');
        main.hitCount++;
        let i=Math.floor(main.hitCount/3);
        i=Math.min(i+9,11);
        main.gotoAndStop(i);
        updateGrade('Score',100);
    }
    stage.addChild(main);
    return main;
}

// class EnemyBullet()
function EnemyBullet(map,x,y,w,h){
    let main=new createjs.Bitmap(map);
    main.sourceRect=new createjs.Rectangle(x,y,w,h);
    main.regX=w/2;
    main.regY=h/2;
    let bodyDef=new b2BodyDef();
    bodyDef.type=b2Body.b2_dynamicBody;
    let shape=new b2PolygonShape();
    shape.SetAsBox(w/2/worldScale,h/2/worldScale);
    let fixtureDef=new b2FixtureDef();
    fixtureDef.shape=shape;
    fixtureDef.isSensor=true;
    fixtureDef.userData=main;
    main.body=world.CreateBody(bodyDef);
    main.body.CreateFixture(fixtureDef);
    main.body.SetSleepingAllowed(false);
    main.speed=10;
    main.power=1;
    main.tag='EnemyBullet';
    main.setPosition=function(p){
        main.x=p.x;
        main.y=p.y;
        main.body.SetPosition(new b2Vec2(p.x/worldScale,p.y/worldScale));
    };
    main.setVelocity=function(d){
        d.length=main.speed;
        main.body.SetLinearVelocity(d);
        main.rotation=d.angle/Math.PI*180;
        main.body.SetAngle(d.angle);
    };
    main.update=function(){
        main.x=main.body.GetPosition().x*worldScale;
        main.y=main.body.GetPosition().y*worldScale;
    };
    main.beginContact=function(){
        deleteBody(main.body);
        stage.removeChild(main);
        let i=updateActors.indexOf(main);
        if(i>-1)updateActors.splice(i,1);
    };
    main.endContact=function(){};
    stage.addChild(main);
    updateActors.push(main);
    return main;
}

// class SoldierBullet
function SoldierBullet(){
    let main=EnemyBullet(preload.getResult('decoration'),100,200,4,4);
    main.power=1;
    return main;
}

// class tank bullet
function TankBullet(){
    let main=EnemyBullet(preload.getResult('decoration'),100,204,10,6);
    main.power=2;
    return main;
}

// class Blood Bar
function BloodBar(maxHp=10,width=50){
    let main=new createjs.Shape();
    main.maxHp=maxHp;
    main.width=width;
    main.redraw=function(hp){
        main.graphics.clear();
        main.graphics.beginFill('red').drawRect(0,0,hp/main.maxHp*main.width,6);
        main.graphics.beginStroke('black').beginFill('#0000').drawRect(0,0,main.width,6);
    }
    main.redraw(main.maxHp);
    main.setMaxHp=function(v){
        main.maxHp=v;
        main.redraw(v);
    };
    effectLayer.addChild(main);
    return main;
}

function deleteBody(body){
    setTimeout(function(){
        try{
            body.DestroyFixture(body.m_fixtureList);
        }catch{}
        world.DestroyBody(body);
    },50);  
}